import axiosInstance from "./axiosInstance";


export const addProduct = (productData) => {
  return axiosInstance.post("/products", productData);
};

export const importProducts = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/products/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const previewProductsImport = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/products/import/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    validateStatus: (status) => status < 500,
  });
};

export const confirmProductsImport = (rows, fileName) => {
  return axiosInstance.post("/products/import/confirm", { rows, fileName });
};

export const getAllProducts = () => {
  return axiosInstance.get("/products");
};


export const getProductBySKU = (sku) => {
  return axiosInstance.get(`/products/${sku}`);
};


export const updateProduct = (id, productData) => {
  return axiosInstance.put(`/products/${id}`, productData);
};


export const deleteProduct = (id) => {
  return axiosInstance.delete(`/products/${id}`);
};
