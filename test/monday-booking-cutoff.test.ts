import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  filterSlotsByMondayBookingCutoff,
  isWithinMondayBookingCutoff,
  getUniversalSlots,
  getAutoClosureType,
} from '../src/lib/universal-slots.ts';

const mondays = ['2026-07-20', '2026-07-27', '2026-08-03', '2027-01-04'];

for (const date of mondays) {
  test(`${date}: saved schedules stop at 17:00 for every barber`, () => {
    const storedSlots = ['09:00', '12:30', '15:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
    assert.deepEqual(filterSlotsByMondayBookingCutoff(date, storedSlots), [
      '09:00', '12:30', '15:00', '16:30', '17:00',
    ]);
    assert.equal(isWithinMondayBookingCutoff(date, '17:00'), true);
    for (const time of ['17:01', '17:30', '18:00', '23:30']) {
      assert.equal(isWithinMondayBookingCutoff(date, time), false);
    }
    assert.equal(storedSlots.length, 8, 'does not mutate the stored schedule');
  });
}

test('other weekdays and empty schedules remain unchanged', () => {
  const slots = ['17:00', '17:30', '18:00'];
  for (const date of ['2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25']) {
    assert.deepEqual(filterSlotsByMondayBookingCutoff(date, slots), slots);
  }
  assert.deepEqual(filterSlotsByMondayBookingCutoff(mondays[0], []), []);
});

test('Monday cutoff is independent of the server timezone', () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of ['Europe/Rome', 'America/Los_Angeles', 'Pacific/Auckland']) {
      process.env.TZ = timezone;
      assert.equal(isWithinMondayBookingCutoff('2026-07-20', '17:30'), false);
      assert.equal(isWithinMondayBookingCutoff('2026-07-21', '17:30'), true);
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test('standard Monday slots and Fabio recurring closure stay unchanged', () => {
  assert.equal(getUniversalSlots(1).at(-1), '17:00');
  assert.equal(getAutoClosureType('fabio.cassano97@icloud.com', 1), 'full');
  assert.equal(getAutoClosureType('michelebiancofiore0230@gmail.com', 1), null);
  assert.equal(getAutoClosureType('nicolodesantis069@gmail.com', 1), null);
});

test('availability and booking entry points enforce the shared cutoff', async () => {
  for (const path of [
    'src/lib/database-postgres.ts',
    'src/app/api/bookings/slots/route.ts',
    'src/app/api/bookings/batch-availability/route.ts',
  ]) {
    const source = await readFile(path, 'utf8');
    assert.match(source, /filterSlotsByMondayBookingCutoff\(\s*date,/);
  }
  const source = await readFile('src/app/api/bookings/route.ts', 'utf8');
  const guard = source.indexOf('if (!isWithinMondayBookingCutoff(bookingData.date, bookingData.time))');
  const creation = source.indexOf('DatabaseService.createBooking(finalBookingData)');
  assert.ok(guard > 0 && guard < creation);
  assert.match(source.slice(guard, guard + 300), /status: 400/);
});
