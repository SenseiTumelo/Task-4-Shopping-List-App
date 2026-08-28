import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import type { ShoppingList, ShoppingItem } from "../../types";

interface ListsState {
  lists: ShoppingList[];
  selectedListId: string | null;
  loading: boolean;
  error: string | null;
}

const savedListId = localStorage.getItem("shoplist_selectedListId");

const initialState: ListsState = {
  lists: [],
  selectedListId: savedListId || null,
  loading: false,
  error: null,
};

export const fetchLists = createAsyncThunk(
  "lists/fetchLists",
  async (userId: string, { getState }) => {
    const lists = await api.getLists(userId);
    
    // Restore selectedListId if it still exists
    const state = getState() as { lists: ListsState };
    if (state.lists.selectedListId && lists.some(l => l.id === state.lists.selectedListId)) {
      return { lists, selectedListId: state.lists.selectedListId };
    }
    
    return { lists, selectedListId: null };
  },
); 

export const createShoppingList = createAsyncThunk(
  "lists/create",
  async ({
    userId,
    name,
    color
  }: {
    userId: string;
    name: string;
    color: string;
  }) =>
    api.createList({
      id: crypto.randomUUID(),
      userId,
      name,
      color,
      items: []
    })
);

export const updateShoppingList = createAsyncThunk(
  "lists/update",
  async (list: ShoppingList) => api.updateList(list.id, list)
);

export const deleteShoppingList = createAsyncThunk(
  "lists/delete",
  async (id: string) => {
    await api.deleteList(id);
    return id;
  }
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    selectList: (state, action: PayloadAction<string | null>) => {
      state.selectedListId = action.payload;
      if (action.payload) {
        localStorage.setItem("shoplist_selectedListId", action.payload);
      } else {
        localStorage.removeItem("shoplist_selectedListId");
      }
    },
    addItemLocal: (
      state,
      action: PayloadAction<{ listId: string; item: ShoppingItem }>
    ) => {
      const list = state.lists.find((l) => l.id === action.payload.listId);
      if (list) {
        list.items.push(action.payload.item);
      }
    },
    removeItemLocal: (
      state,
      action: PayloadAction<{ listId: string; itemId: string }>
    ) => {
      const list = state.lists.find((l) => l.id === action.payload.listId);
      if (list) {
        list.items = list.items.filter((i) => i.id !== action.payload.itemId);
      }
    },
    toggleItemLocal: (
      state,
      action: PayloadAction<{ listId: string; itemId: string }>
    ) => {
      const list = state.lists.find((l) => l.id === action.payload.listId);
      if (list) {
        const item = list.items.find((i) => i.id === action.payload.itemId);
        if (item) {
          item.completed = !item.completed;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload.lists;
        if (action.payload.selectedListId && action.payload.lists.some(l => l.id === action.payload.selectedListId)) {
          state.selectedListId = action.payload.selectedListId;
        } else if (!state.selectedListId && action.payload.lists.length > 0) {
          state.selectedListId = null;
        }
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed to fetch lists.");
      })
      .addCase(createShoppingList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
      })
      .addCase(updateShoppingList.fulfilled, (state, action) => {
        const index = state.lists.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      .addCase(deleteShoppingList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((list) => list.id !== action.payload);
        if (state.selectedListId === action.payload) {
          state.selectedListId = null;
          localStorage.removeItem("shoplist_selectedListId");
        }
      });
  },
});

export const { selectList, addItemLocal, removeItemLocal, toggleItemLocal } =
  listsSlice.actions;
export default listsSlice.reducer;