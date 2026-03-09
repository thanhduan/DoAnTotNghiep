export class BookingTimeHelper {
  static readonly OLD_SLOTS = [
    { slotNumber: 1, startTime: '07:00', endTime: '08:30' },
    { slotNumber: 2, startTime: '08:45', endTime: '10:15' },
    { slotNumber: 3, startTime: '10:30', endTime: '12:00' },
    { slotNumber: 4, startTime: '12:45', endTime: '14:15' },
    { slotNumber: 5, startTime: '14:30', endTime: '16:00' },
    { slotNumber: 6, startTime: '16:15', endTime: '17:45' },
    { slotNumber: 7, startTime: '18:00', endTime: '19:30' },
    { slotNumber: 8, startTime: '19:45', endTime: '21:15' },
  ] as const;

  static timeOverlaps(startA: string, endA: string, startB: string, endB: string): boolean {
    return startA < endB && endA > startB;
  }

  static toDateTime(date: Date, timeValue: string): Date | null {
    const [hoursText, minutesText] = (timeValue || '').split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  static getBookingDateValue(booking: any): Date | null {
    const rawDate = booking?.bookingDate || booking?.dateStart;
    if (!rawDate) {
      return null;
    }

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  static hasBookingEnded(booking: any, now: Date): boolean {
    const bookingDate = BookingTimeHelper.getBookingDateValue(booking);
    if (!bookingDate) {
      return false;
    }

    const endDateTime = BookingTimeHelper.toDateTime(bookingDate, booking.endTime);
    if (!endDateTime) {
      return false;
    }

    return endDateTime.getTime() <= now.getTime();
  }

  static hasBookingStarted(booking: any, now: Date): boolean {
    const bookingDate = BookingTimeHelper.getBookingDateValue(booking);
    if (!bookingDate) {
      return false;
    }

    const startDateTime = BookingTimeHelper.toDateTime(bookingDate, booking.startTime);
    if (!startDateTime) {
      return false;
    }

    return startDateTime.getTime() <= now.getTime();
  }
}
