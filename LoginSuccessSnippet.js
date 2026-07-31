/* Add this after a successful login response. */

export function saveLogin(responseData) {
  const token = responseData?.token;
  const user = responseData?.user;

  if (!token || !user) {
    throw new Error("Login response must contain token and user");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", user.role || user.userType || "");

  // Updates Header immediately without refreshing the browser.
  window.dispatchEvent(new Event("auth-changed"));
}
