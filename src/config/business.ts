export const CANONICAL_ORIGIN = 'https://www.maskiobarberconcept.it' as const;

export type BusinessHours = {
  day: string;
  schemaDay: string;
  periods: readonly { opens: string; closes: string }[];
};

export const BUSINESS = {
  name: 'Maskio Barber Concept',
  foundingYear: 2023,
  vatNumber: '04438410716',
  email: 'fabio.cassano97@icloud.com',
  telephone: '+39 331 710 0730',
  telephoneHref: 'tel:+393317100730',
  whatsappUrl: 'https://wa.me/393317100730',
  canonicalOrigin: CANONICAL_ORIGIN,
  address: {
    street: "Via Sant'Agata 24",
    postalCode: '71013',
    locality: 'San Giovanni Rotondo',
    province: 'FG',
    region: 'Puglia',
    country: 'IT',
    formatted: "Via Sant'Agata 24, 71013 San Giovanni Rotondo (FG), Italia",
  },
  coordinates: {
    latitude: 41.7073018,
    longitude: 15.7183462,
  },
  googlePlaceId: 'ChIJJxigKx51NxMRN_cHtkuYN-M',
  mapsUrl:
    'https://www.google.it/maps/place/Maskio+barber+concept/@41.7080676,15.7233818,15z/data=!4m6!3m5!1s0x1337751e2ba01827:0xe337984bb607f737!8m2!3d41.7073018!4d15.7183462!16s%2Fg%2F11t_r13_b6?entry=tts&g_ep=EgoyMDI2MDcyMS4wIPu8ASoASAFQAw%3D%3D&skid=974f2cd2-6909-4e38-b7ef-1c93b215eed8',
  socialProfiles: [
    'https://www.instagram.com/maskio_barberconcept/',
    'https://www.facebook.com/p/Maskio-barber-concept-100092091309931/',
    'https://www.tiktok.com/@maskio_barberconcept',
  ],
  images: [
    `${CANONICAL_ORIGIN}/LogoSimboloNome_BiancoOrizzontale_BUONO.png`,
    `${CANONICAL_ORIGIN}/og-maskio-1200x630.webp`,
  ],
  hours: [
    { day: 'Lunedì', schemaDay: 'Monday', periods: [{ opens: '09:00', closes: '13:00' }, { opens: '15:00', closes: '17:30' }] },
    { day: 'Martedì', schemaDay: 'Tuesday', periods: [{ opens: '09:00', closes: '13:00' }, { opens: '15:00', closes: '18:00' }] },
    { day: 'Mercoledì', schemaDay: 'Wednesday', periods: [{ opens: '09:00', closes: '13:00' }, { opens: '15:00', closes: '18:00' }] },
    { day: 'Giovedì', schemaDay: 'Thursday', periods: [] },
    { day: 'Venerdì', schemaDay: 'Friday', periods: [{ opens: '09:00', closes: '13:00' }, { opens: '15:00', closes: '18:00' }] },
    { day: 'Sabato', schemaDay: 'Saturday', periods: [{ opens: '09:00', closes: '13:00' }, { opens: '14:30', closes: '17:00' }] },
    { day: 'Domenica', schemaDay: 'Sunday', periods: [] },
  ] satisfies readonly BusinessHours[],
} as const;

export function formatBusinessHours(periods: readonly { opens: string; closes: string }[]) {
  if (periods.length === 0) return 'Chiuso';
  return periods.map(({ opens, closes }) => `${opens}–${closes}`).join(' e ');
}

export function canonicalUrl(path = '/') {
  return new URL(path, `${CANONICAL_ORIGIN}/`).toString();
}
