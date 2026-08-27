import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Camera,
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

        <section className="profile-layout mt-5 w-725">
          <div className="profile-details-card h-[40vh] ">
            <div className="profile-large-avatar rounded-full">
              {profilePicture ? (
                <img src={profilePicture} alt={user.name} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <h2>{user.name}</h2>
            <p>{user.email}</p>

            <div className="profile-detail">
              <span>NAME</span>
              <strong>{user.name}</strong>
            </div>

            <div className="profile-detail">
              <span>EMAIL</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <div className="create-list-card profile-card-page">
            <h3>EDIT YOUR DETAILS</h3>

            <form onSubmit={saveProfile}>
              
              <label className="picture-upload" htmlFor="profile-picture">
                <Camera size={20} />
                CHOOSE PROFILE IMAGE
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                hidden
              />
              <br/>

              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <label htmlFor="email">Email</label>
              <input id="email" value={user.email} disabled />

              <h3>CHANGE PASSWORD</h3>

              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />

              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              {(error || message) && (
                <p className={error ? "error-box" : "profile-message"}>
                  {error || message}
                </p>
              )}

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