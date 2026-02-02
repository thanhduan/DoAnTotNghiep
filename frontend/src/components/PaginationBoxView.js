if (pageCount < 0) {
  console.warn('Invalid pageCount detected, resetting to 0.');
  pageCount = 0;
}

if (forcePage > pageCount - 1) {
  console.warn('forcePage is greater than pageCount. Resetting to 0.');
  forcePage = 0;
}