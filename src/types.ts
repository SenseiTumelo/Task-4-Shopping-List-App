export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  note?: string;
  quantity?: number;
  imageUrl?: string;
  photographer?: string;
  photographerUrl?: string;
};

export type ShoppingList = {
  id: string;
  userId: string;
  name: string;
  color: string;
  items: ShoppingItem[];
};

