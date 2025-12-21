export const setSession = ({ token, role }) => {
  localStorage.setItem("tutorug_token", token);
  localStorage.setItem("tutorug_role", role);
};

export const clearSession = () => {
  localStorage.removeItem("tutorug_token");
  localStorage.removeItem("tutorug_role");
};

export const isLoggedIn = () => {
  return Boolean(localStorage.getItem("tutorug_token"));
};

export const getUserRole = () => {
  return localStorage.getItem("tutorug_role");
};
