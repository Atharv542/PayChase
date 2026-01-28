export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  // No token = logged out
  if (!token) {
    return { status: 401 };
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
