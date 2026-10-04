import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { isWithinMondayBookingCutoff } from '../src/lib/universal-slots.ts';

// Execute actual handlers with in-memory dependencies: no database/network access.
async function loadRoute(path: string, dependencies: Record<string, unknown>) {
  const source = await readFile(path, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const mocks: Record<string, unknown> = {
    'next/server': { NextResponse: { json: (body: unknown, options?: { status?: number }) => ({ body, status: options?.status ?? 200 }) } },
    'next-auth': { getServerSession: async () => ({ user: { id: 'user', email: 'barber@example.test' } }) },
    'next-auth/next': { getServerSession: async () => ({ user: { id: 'user', email: 'barber@example.test' } }) },
    '@/lib/auth': { authOptions: {} },
    '@/lib/universal-slots': { isWithinMondayBookingCutoff },
    '@/lib/email': { EmailService: {} },
    '@/lib/closure-utils': {},
    '@/lib/barber-closures': {},
    '@/lib/barber-schedule-exceptions': {},
    crypto: {},
    ...dependencies,
  };
  const module = { exports: {} as Record<string, (request: unknown) => Promise<{ status: number; body: unknown }>> };
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgres://mock.invalid/test';
  try {
    new Function('require', 'module', 'exports', outputText)((name: string) => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    }, module, module.exports);
  } finally {
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
  }
  return module.exports;
}

const request = (body: unknown) => ({ json: async () => body });

test('PUT rejects late Monday destinations, including partial date/time updates', async () => {
  let writes = 0;
  const current = { id: 'one', date: '2026-07-21', time: '18:00', barberId: 'barber' };
  const route = await loadRoute('src/app/api/bookings/route.ts', {
    '@/lib/database-postgres': { DatabaseService: {
      getBookingById: async () => current,
      updateBooking: async () => { writes++; return current; },
    } },
  });
  for (const update of [
    { date: '2026-07-20' },
    { date: '2026-07-20', time: '17:30' },
    { date: '2026-07-20', time: '18:00' },
  ]) {
    const response = await route.PUT(request({ bookingId: 'one', ...update }));
    assert.equal(response.status, 400);
  }
  current.date = '2026-07-20';
  current.time = '17:00';
  assert.equal((await route.PUT(request({ bookingId: 'one', time: '18:00' }))).status, 400);
  assert.equal(writes, 0);
});

test('PUT allows configured last slot and metadata edits on legacy bookings', async () => {
  let writes = 0;
  const current = { id: 'one', date: '2026-07-20', time: '18:00', barberId: 'barber' };
  const route = await loadRoute('src/app/api/bookings/route.ts', {
    '@/lib/database-postgres': { DatabaseService: {
      getBookingById: async () => current,
      updateBooking: async () => { writes++; return current; },
    } },
  });
  for (const update of [{ notes: 'correzione' }, { date: current.date, time: current.time }, { time: '17:00' }]) {
    assert.equal((await route.PUT(request({ bookingId: 'one', ...update }))).status, 200);
  }
  assert.equal(writes, 3);
});

async function swapRoute(bookings: { id: string; date: string; time: string; barber_id: string }[]) {
  const writes: string[] = [];
  const sql = async (parts: TemplateStringsArray) => {
    const query = parts.join('?');
    if (query.includes('SELECT id, barber_id')) return bookings;
    if (query.includes('SELECT id FROM barbers')) return [{ id: 'barber' }];
    if (query.includes('SELECT id FROM bookings')) return [];
    if (/^\s*(UPDATE|INSERT|BEGIN|COMMIT|ROLLBACK)\b/.test(query)) writes.push(query);
    return [];
  };
  return { route: await loadRoute('src/app/api/booking-swap/route.ts', {
    '@neondatabase/serverless': { neon: () => sql },
  }), writes };
}

const booking = (id: string, date = '2026-07-21', time = '16:00') => ({ id, date, time, barber_id: 'barber' });

test('move rejects late Monday and permits 17:00', async () => {
  const { route, writes } = await swapRoute([booking('one')]);
  const body = { booking1Id: 'one', swapType: 'move', newDate: '2026-07-20' };
  for (const newTime of ['17:30', '18:00']) {
    assert.equal((await route.POST(request({ ...body, newTime }))).status, 400);
  }
  assert.equal(writes.length, 0);
  assert.equal((await route.POST(request({ ...body, newTime: '17:00' }))).status, 200);
  assert.equal(writes.length, 1);
});

test('swap validates both destinations before BEGIN, including cross-barber swaps', async () => {
  for (const crossBarber of [false, true]) {
    for (const lateId of ['one', 'two']) {
      const rows = [booking('one'), booking('two')];
      const late = rows.find(row => row.id === lateId)!;
      late.date = '2026-07-20';
      late.time = '18:00';
      const { route, writes } = await swapRoute(rows);
      assert.equal((await route.POST(request({ booking1Id: 'one', booking2Id: 'two', swapType: 'swap', crossBarber }))).status, 400);
      assert.equal(writes.length, 0);
    }
  }
});

test('waitlist acceptance rejects late Monday without INSERT or status changes', async () => {
  let writes = 0;
  const entry = { date: '2026-07-20', offered_time: '18:00' };
  const sql = async (parts: TemplateStringsArray) => {
    if (parts.join('?').includes('SELECT * FROM waitlist')) return [entry];
    writes++;
    return [{}];
  };
  const route = await loadRoute('src/app/api/waitlist/respond/route.ts', {
    '@neondatabase/serverless': { neon: () => sql },
  });
  for (const time of ['17:30', '18:00']) {
    entry.offered_time = time;
    assert.equal((await route.POST(request({ waitlistId: 'offer', response: 'accepted' }))).status, 400);
  }
  assert.equal(writes, 0);
  entry.offered_time = '17:00';
  assert.equal((await route.POST(request({ waitlistId: 'offer', response: 'accepted' }))).status, 200);
  assert.equal(writes, 3);
});

test('new validation reads existing standard slots without duplicating the closing time', async () => {
  const source = await readFile('src/lib/universal-slots.ts', 'utf8');
  const helper = source.slice(source.indexOf('export function isWithinMondayBookingCutoff'), source.indexOf('export function filterSlotsByMondayBookingCutoff'));
  assert.match(helper, /getUniversalSlots\(1\)/);
  assert.doesNotMatch(helper, /17:00|17\s*\*\s*60/);
});
