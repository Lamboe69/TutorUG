export const loginUser = (role = "student") => {
  localStorage.setItem("tutorug_logged_in", "true");
  localStorage.setItem("tutorug_role", role);
};

export const logoutUser = () => {
  localStorage.removeItem("tutorug_logged_in");
  localStorage.removeItem("tutorug_role");
};

export const isLoggedIn = () => {
  return localStorage.getItem("tutorug_logged_in") === "true";
};

export const getUserRole = () => {
  return localStorage.getItem("tutorug_role");
};
