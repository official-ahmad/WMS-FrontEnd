import axiosInstance from "./axiosInstance";

export const loginUser = async (email, password) => {
  return axiosInstance.post("/auth/login", { email, password });
};

export const registerUser = async (email, password, firstName, lastName) => {
  return axiosInstance.post("/auth/register", {
    email,
    password,
    firstName,
    lastName,
  });
};

export const logoutUser = async () => {
  return axiosInstance.post("/auth/logout");
};

export const changePassword = async (currentPassword, newPassword) => {
  return axiosInstance.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
};
