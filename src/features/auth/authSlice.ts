import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import type { User } from "../../types";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const saved = localStorage.getItem("shoplist_user");

const initialState: AuthState = {
  user: saved ? JSON.parse(saved) : null,
  loading: false,
  error: null
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    const users = await api.getUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );

    if (!user) return thunkAPI.rejectWithValue("Incorrect email or password.");

    const safeUser = { ...user, password: undefined };
    localStorage.setItem("shoplist_user", JSON.stringify(safeUser));
    return safeUser;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    const users = await api.getUsers();

    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return thunkAPI.rejectWithValue("An account with this email already exists.");
    }

    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password
    };

    await api.createUser(user);

    const safeUser = { ...user, password: undefined };
    localStorage.setItem("shoplist_user", JSON.stringify(safeUser));
    return safeUser;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("shoplist_user");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Login failed.");
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Registration failed.");
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;