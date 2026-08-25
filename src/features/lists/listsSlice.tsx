import { createAsyncThunk, createSlice,type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import type { ShoppingItem, ShoppingList } from "../../types";

type ListsState = {
  lists: ShoppingList[];
  selectedListId: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: ListsState = {
  lists: [],
  selectedListId: null,
  loading: false,
  error: null
};

export const fetchLists = createAsyncThunk(
  "lists/fetchLists",
  async (userId: string) => api.getLists(userId)
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
    selectList(state, action: PayloadAction<string>) {
      state.selectedListId = action.payload;
    },
    addItemLocal(
      state,
      action: PayloadAction<{ listId: string; item: ShoppingItem }>
    ) {
      const list = state.lists.find((l) => l.id === action.payload.listId);
      if (list) list.items.push(action.payload.item);
    },
    toggleItemLocal(
      state,
      action: PayloadAction<{ listId: string; itemId: string }>
    ) {
      const list = state.lists.find((l) => l.id === action.payload.listId);
      const item = list?.items.find((i) => i.id === action.payload.itemId);
      if (item) item.completed = !item.completed;
    },
    removeItemLocal(
      state,
      action: PayloadAction<{ listId: string; itemId: string }>
    ) {
      const list = state.lists.find((l) => l.id === action.payload.listId);
      if (list) {
        list.items = list.items.filter((i) => i.id !== action.payload.itemId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
        state.selectedListId ??= action.payload[0]?.id ?? null;
      })
      .addCase(fetchLists.rejected, (state) => {
        state.loading = false;
        state.error = "Could not load your shopping lists.";
      })
      .addCase(createShoppingList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
        state.selectedListId = action.payload.id;
      })
      .addCase(updateShoppingList.fulfilled, (state, action) => {
        const index = state.lists.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) state.lists[index] = action.payload;
      })
      .addCase(deleteShoppingList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l.id !== action.payload);
        state.selectedListId = state.lists[0]?.id ?? null;
      });
  }
});

export const {
  selectList,
  addItemLocal,
  toggleItemLocal,
  removeItemLocal
} = listsSlice.actions;

export default listsSlice.reducer;