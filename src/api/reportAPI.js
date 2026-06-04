import axiosInstance from "./axiosInstance";

export const getLowStockReport = (category = null) => {
  const params = {};
  if (category) params.category = category;
  return axiosInstance.get("/reports/low-stock", { params });
};

export const getTopProductsReport = (
  startDate = null,
  endDate = null,
  type = null,
  limit = 5,
) => {
  const params = { limit };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (type) params.type = type;
  return axiosInstance.get("/reports/top-products", { params });
};

export const getDailySummary = (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return axiosInstance.get("/reports/daily-summary", { params });
};
