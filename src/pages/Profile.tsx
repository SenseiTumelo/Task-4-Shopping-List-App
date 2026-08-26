import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Home,
  LogOut,
  Save,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { logout, updateProfile } from "../features/auth/authSlice";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!user) return null;

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }

    if (newPassword && !currentPassword) {
      setMessage("Enter your current password first.");
      return;
    }

    try {
      await dispatch(
        updateProfile({
          id: user.id,
          name: name.trim(),
          currentPassword,
          newPassword,
        }),
      ).unwrap();

      setCurrentPassword("");
      setNewPassword("");
      setMessage("Profile updated successfully.");
    } catch {
      // Redux error is displayed below.
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <ShoppingCart size={36} strokeWidth={3} />
          <h1>SHOPLIST</h1>
          <span>shop with passion</span>
        </div>

        <nav>
          <button className="nav-link" onClick={() => navigate("/")}>
            <Home />
            DASHBOARD
          </button>

          <button className="nav-link active">
            <Settings />
            PROFILE
          </button>
        </nav>

        <div className="profile-card">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <button
          className="logout-link"
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
        >
          <LogOut />
          LOG OUT
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button" onClick={() => navigate("/")}>
            <ArrowLeft />
          </button>
          <h2>PROFILE</h2>
        </header>

        <section className="workspace">
          <div className="create-list-card profile-card-page">
            <h3>YOUR PROFILE</h3>

            <form onSubmit={saveProfile}>
              <label>Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <label>Email</label>
              <input value={user.email} disabled />

              <h3>CHANGE PASSWORD</h3>

              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
              />

              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              {(error || message) && <p>{error || message}</p>}

              <button className="brutal-button blue" disabled={loading}>
                <Save />
                {loading ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}