export const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const parseDate = (dateStr) => {
  const [time, date] = dateStr.split(" ");
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
};
