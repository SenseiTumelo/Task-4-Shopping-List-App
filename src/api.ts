const API_URL = "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  getUsers: () => request<import("./types").User[]>("/users"),
  createUser: (user: import("./types").User) =>
    request<import("./types").User>("/users", {
      method: "POST",
      body: JSON.stringify(user)
    }),
  getLists: (userId: string) =>
    request<import("./types").ShoppingList[]>(`/lists?userId=${encodeURIComponent(userId)}`),
  createList: (list: import("./types").ShoppingList) =>
    request<import("./types").ShoppingList>("/lists", {
      method: "POST",
      body: JSON.stringify(list)
    }),
  updateList: (id: string, list: import("./types").ShoppingList) =>
    request<import("./types").ShoppingList>(`/lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(list)
    }),
  deleteList: (id: string) =>
    request<void>(`/lists/${id}`, { method: "DELETE" })
};