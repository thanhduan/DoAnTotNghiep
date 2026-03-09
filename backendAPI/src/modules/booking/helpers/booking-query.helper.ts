export class BookingQueryHelper {
  static buildSearchRegex(keyword: string): { $regex: string; $options: string } {
    return { $regex: keyword.trim(), $options: 'i' };
  }

  static normalizeDateRange(fromDate?: Date, toDate?: Date): any | null {
    if (!fromDate && !toDate) {
      return null;
    }

    const condition: any = {};
    if (fromDate) condition.$gte = fromDate;
    if (toDate) condition.$lte = toDate;
    return condition;
  }
}
