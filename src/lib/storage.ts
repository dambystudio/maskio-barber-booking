import { promises as fs } from 'fs';
import path from 'path';
import { Booking } from '../../types/booking';

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Prenotazioni di esempio per la demo in produzione
const DEMO_BOOKINGS: Booking[] = [
  {
    id: "demo-1",
    barberId: "fabio",
    services: [
      { id: "taglio-classico", name: "Taglio Classico", duration: 30, price: 25 }
    ],
    date: "2025-05-26",
    time: "10:00",
    totalDuration: 30,
    totalPrice: 25,
    customer: {
      name: "Marco Rossi",
      email: "marco.rossi@email.com",
      phone: "333-1234567"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-2", 
    barberId: "michele",
    services: [
      { id: "taglio-moderno", name: "Taglio Moderno", duration: 45, price: 35 },
      { id: "barba", name: "Rifinitura Barba", duration: 20, price: 15 }
    ],
    date: "2025-05-26",
    time: "15:30",
    totalDuration: 65,
    totalPrice: 50,
    customer: {
      name: "Luca Bianchi", 
      email: "luca.bianchi@email.com",
      phone: "347-9876543"
    },
    createdAt: new Date().toISOString()
  }
];

// Storage in memoria per produzione (Vercel)
let memoryBookings: Booking[] = [...DEMO_BOOKINGS];

// Assicura che la cartella data esista (solo in sviluppo)
async function ensureDataDir() {
  if (IS_PRODUCTION) return;
  
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Legge le prenotazioni dal file o dalla memoria
export async function readBookings(): Promise<Booking[]> {
  if (IS_PRODUCTION) {
    return memoryBookings;
  }
  
  try {
    await ensureDataDir();
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se il file non esiste o è vuoto, ritorna array vuoto
    return [];
  }
}

// Scrive le prenotazioni nel file o in memoria
export async function writeBookings(bookings: Booking[]): Promise<void> {
  if (IS_PRODUCTION) {
    memoryBookings = [...bookings];
    return;
  }
  
  await ensureDataDir();
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}
