export const getTodayDay = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  return day;
};
