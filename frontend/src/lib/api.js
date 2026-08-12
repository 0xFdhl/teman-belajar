const BASE = "/api";
const TOKEN_KEY = "teman_belajar_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new Event("auth:unauthorized"));
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Terjadi kesalahan." }));
    throw new Error(err.error || `Request gagal (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const authApi = {
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
};

export const api = {
  getDashboard: () => request("/dashboard"),
  getSubjects: () => request("/subjects"),

  getNotes: () => request("/notes"),
  getNote: (id) => request(`/notes/${id}`),
  uploadNote: (formData) => request("/notes/upload", { method: "POST", body: formData }),

  getLatestQuiz: () => request("/quiz/latest"),
  getQuiz: (id) => request(`/quiz/${id}`),
  answerQuestion: (questionId, selectedOption) =>
    request(`/quiz/questions/${questionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ selected_option: selectedOption }),
    }),

  getJournal: () => request("/journal"),

  getTasks: () => request("/tasks"),
  createTask: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
