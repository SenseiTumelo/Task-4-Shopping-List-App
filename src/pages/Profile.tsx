import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Home,
  Save,
  Settings,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { updateProfile } from "../features/auth/authSlice";

import LogoutButton from "../components/LogoutButton";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture ?? "",
  );
  const [message, setMessage] = useState("");

  if (!user) return null;

  const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfilePicture(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const saveProfile = async (event: FormEvent) => {
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
          profilePicture,
        }),
      ).unwrap();

      setCurrentPassword("");
      setNewPassword("");
      setMessage("Profile updated successfully.");
    } catch {
      //
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
            {profilePicture ? (
              <img src={profilePicture} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <LogoutButton />
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button" aria-label="Back to dashboard" onClick={() => navigate("/")}>
            <ArrowLeft />
          </button>
          <h2>PROFILE</h2>
        </header>

        <section className="account-layout">
          <aside className="account-summary">
            <div className="account-avatar">
              {profilePicture ? <img src={profilePicture} alt={user.name} /> : user.name.charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <label className="small-button photo-picker" htmlFor="profile-picture">
              <Camera size={18} /> Change photo
              <input id="profile-picture" type="file" accept="image/*" onChange={handlePictureChange} />
            </label>
            <p className="account-hint">Choose a photo, then save your changes.</p>
          </aside>

          <form onSubmit={saveProfile} className="account-form">
            <section className="account-section">
              <h2>Personal information</h2>
              <p>Manage your name and account details.</p>
              <label htmlFor="name">Full name</label>
              <input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={user.email} readOnly aria-describedby="email-help" />
              <small id="email-help">Your email address cannot be changed.</small>
            </section>
            <section className="account-section">
              <h2>Change password</h2>
              <p>Leave these fields blank to keep your current password.</p>
              <label htmlFor="current-password">Current password</label>
              <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </section>
            {error && <div role="alert" className="error-box"><AlertCircle size={18} /> {error}</div>}
            {message && !error && (
              <div role="status" className={message === "Profile updated successfully." ? "account-success" : "error-box"}>
                {message === "Profile updated successfully." ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {message}
              </div>
            )}
            <div className="account-actions">
              <button type="button" className="small-button" onClick={() => navigate("/")}>Back to dashboard</button>
              <button type="submit" disabled={loading} className="brutal-button blue"><Save size={18} />{loading ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}