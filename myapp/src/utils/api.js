const API_BASE = "http://localhost:8080";

async function refresh() {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  // Default: always send cookies
  const opts = {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };

  // If sending JSON body, ensure header + stringify
  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }

  // 1st call
  let res = await fetch(url, opts);

  // If not unauthorized -> return
  if (res.status !== 401) return res;

  // Try refresh once
  const ok = await refresh();
  if (!ok) {
    alert("Session expired. Please login again.");
    window.location.href = "/login"; // ✅ simplest redirect in Vite
    return res;
  }

  // Retry original request
  res = await fetch(url, opts);
  return res;
}
