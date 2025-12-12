export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString('vi-VN');
};

export const getDayOfWeek = (day: number): string => {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[day % 7];
};

export const isOverdue = (plannedTime: Date): boolean => {
  return new Date() > new Date(plannedTime);
};
