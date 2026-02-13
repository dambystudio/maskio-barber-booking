// Universal slot generation system for Maskio Barber
// Centralizes all time slot logic in one place

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 1=Monday, etc.

/**
 * Get universal base slots for any day of the week
 * These are the same for ALL barbers before applying closures
 */
export function getUniversalSlots(dayOfWeek: DayOfWeek): string[] {
  const slots: string[] = [];

  // Sunday (0) - Always closed
  if (dayOfWeek === 0) {
    return [];
  }

  // Monday (1): 09:00-12:30 + 15:00-18:00
  if (dayOfWeek === 1) {
    // Morning: 09:00-12:30 (8 slots)
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');

    // Afternoon: 15:00-18:00 (7 slots)
    for (let hour = 15; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  }

  // Tuesday-Friday (2-5): 09:00-12:30 + 15:00-17:30
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    // Morning: 09:00-12:30 (8 slots)
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');

    // Afternoon: 15:00-17:30 (6 slots)
    for (let hour = 15; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour <= 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  }

  // Saturday (6): 09:00-12:30 + 14:30-17:00
  if (dayOfWeek === 6) {
    // Morning: 09:00-12:30 (8 slots)
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');

    // Afternoon: 14:30-17:00 (6 slots, NO 17:30)
    slots.push('14:30');
    for (let hour = 15; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  }

  return [];
}

/**
 * Helper to check if a time slot is in the morning
 */
export function isMorningSlot(timeSlot: string): boolean {
  const hour = parseInt(timeSlot.split(':')[0]);
  return hour < 14;
}

/**
 * Helper to check if a time slot is in the afternoon
 */
export function isAfternoonSlot(timeSlot: string): boolean {
  const hour = parseInt(timeSlot.split(':')[0]);
  return hour >= 14;
}

/**
 * Filter slots based on closure type
 */
export function filterSlotsByClosureType(
  slots: string[],
  closureType: 'full' | 'morning' | 'afternoon' | null
): string[] {
  if (!closureType) return slots;

  if (closureType === 'full') return [];

  if (closureType === 'morning') {
    return slots.filter(slot => isAfternoonSlot(slot));
  }

  if (closureType === 'afternoon') {
    return slots.filter(slot => isMorningSlot(slot));
  }

  return slots;
}

/**
 * Determine which automatic closures should be created for a barber
 * Returns closure type if one should be created, null otherwise
 */
export function getAutoClosureType(
  barberEmail: string,
  dayOfWeek: DayOfWeek
): 'full' | 'morning' | 'afternoon' | null {

  // Michele: morning closure on Monday
  if (barberEmail === 'michelebiancofiore0230@gmail.com' && dayOfWeek === 1) {
    return 'morning';
  }

  // Nicolò: morning closure on Monday
  if (barberEmail === 'nicolodesantis069@gmail.com' && dayOfWeek === 1) {
    return 'morning';
  }

  // Fabio: full closure on Monday
  if (barberEmail === 'fabio.cassano97@icloud.com' && dayOfWeek === 1) {
    return 'full';
  }



  return null;
}

/**
 * Get display name for closure type (Italian)
 */
export function getClosureTypeLabel(closureType: 'full' | 'morning' | 'afternoon'): string {
  switch (closureType) {
    case 'full':
      return 'Giornata intera';
    case 'morning':
      return 'Mattina';
    case 'afternoon':
      return 'Pomeriggio';
  }
}

/**
 * Get description for automatic closure (Italian)
 */
export function getAutoClosureReason(
  barberEmail: string,
  closureType: 'full' | 'morning' | 'afternoon'
): string {
  if (barberEmail === 'michelebiancofiore0230@gmail.com') {
    return 'Chiusura automatica - Solo pomeriggio il lunedì';
  }

  if (barberEmail === 'nicolodesantis069@gmail.com') {
    return 'Chiusura automatica - Solo pomeriggio il lunedì';
  }

  if (barberEmail === 'fabio.cassano97@icloud.com') {
    return 'Chiusura automatica - Riposo settimanale';
  }



  return 'Chiusura automatica';
}
