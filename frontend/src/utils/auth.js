export const loginUser = () => {
  localStorage.setItem("tutorug_logged_in", "true");
};

export const logoutUser = () => {
  localStorage.removeItem("tutorug_logged_in");
};

export const isLoggedIn = () => {
  return localStorage.getItem("tutorug_logged_in") === "true";
};
