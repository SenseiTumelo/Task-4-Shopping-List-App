import type { ShoppingList, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.status === 204
    ? (undefined as T)
    : response.json();
}

export const api = {
  getUsers: () => request<User[]>("/users"),

  createUser: (user: User) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  updateUser: (id: string, user: User) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  getLists: (userId: string) =>
    request<ShoppingList[]>(
      `/lists?userId=${encodeURIComponent(userId)}`,
    ),

  createList: (list: ShoppingList) =>
    request<ShoppingList>("/lists", {
      method: "POST",
      body: JSON.stringify(list),
    }),

  updateList: (id: string, list: ShoppingList) =>
    request<ShoppingList>(`/lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(list),
    }),

  deleteList: (id: string) =>
    request<void>(`/lists/${id}`, {
      method: "DELETE",
    }),
};