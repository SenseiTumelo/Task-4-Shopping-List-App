export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  completed: boolean;
};

export type ShoppingList = {
  id: string;
  userId: string;
  name: string;
  color: string;
  items: ShoppingItem[];
};