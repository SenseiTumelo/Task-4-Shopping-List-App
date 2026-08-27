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
  error: null,
};

const safeUser = (user: User) => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI,
  ) => {
    const users = await api.getUsers();

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password,
    );

    if (!user) {
      return thunkAPI.rejectWithValue("Incorrect email or password.");
    }

    const userToSave = safeUser(user);
    localStorage.setItem("shoplist_user", JSON.stringify(userToSave));
    return userToSave;
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    },
    thunkAPI,
  ) => {
    const users = await api.getUsers();

    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return thunkAPI.rejectWithValue(
        "An account with this email already exists.",
      );
    }

    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };

    await api.createUser(user);

    const userToSave = safeUser(user);
    localStorage.setItem("shoplist_user", JSON.stringify(userToSave));
    return userToSave;
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    {
      id,
      name,
      currentPassword,
      newPassword,
      profilePicture,
    }: {
      id: string;
      name: string;
      currentPassword?: string;
      newPassword?: string;
      profilePicture?: string;
    },
    thunkAPI,
  ) => {
    const users = await api.getUsers();
    const existingUser = users.find((user) => user.id === id);

    if (!existingUser) {
      return thunkAPI.rejectWithValue("User was not found.");
    }

    if (newPassword && existingUser.password !== currentPassword) {
      return thunkAPI.rejectWithValue("Current password is incorrect.");
    }

    const updatedUser: User = {
      ...existingUser,
      name,
      password: newPassword || existingUser.password,
      profilePicture: profilePicture || existingUser.profilePicture,
    };

    await api.updateUser(id, updatedUser);

    const userToSave = safeUser(updatedUser);
    localStorage.setItem("shoplist_user", JSON.stringify(userToSave));

    return userToSave;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("shoplist_user");
    },
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
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Profile update failed.");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;