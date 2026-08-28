import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Home,
  LogOut,
  Save,
  Settings,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
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

        <section className="px-4 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-1 border-4 border-[#111] bg-white shadow-[8px_8px_#111] p-6 md:p-8 h-fit sticky top-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#111] bg-[#ffd600] flex items-center justify-center text-4xl md:text-5xl font-black overflow-hidden mb-4 shadow-[4px_4px_#111]">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-black mb-1 break-words">
                  {user.name}
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-6 break-all">
                  {user.email}
                </p>

                <div className="w-full border-t-4 border-[#111] pt-4 mt-4">
                  <div className="mb-4">
                    <span className="text-xs font-black text-gray-500">
                      NAME
                    </span>
                    <p className="text-sm md:text-base font-bold break-words">
                      {user.name}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-black text-gray-500">
                      EMAIL
                    </span>
                    <p className="text-sm md:text-base font-bold break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 border-4 border-[#111] bg-white shadow-[8px_8px_#111] p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-black mb-6 font-['Darker Grotesque']">
                EDIT YOUR DETAILS
              </h3>

              <form onSubmit={saveProfile} className="space-y-4 md:space-y-5">
                <div className="mb-6">
                  <label
                    className="inline-flex items-center gap-2 border-4 border-[#111] bg-[#ffd600] px-4 md:px-6 py-3 font-black cursor-pointer shadow-[4px_4px_#111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_#111] transition"
                    htmlFor="profile-picture"
                  >
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
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-black text-gray-700 mb-2"
                  >
                    FULL NAME
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border-3 border-[#111] bg-white p-3 md:p-4 outline-none focus:shadow-[4px_4px_#111] transition text-sm md:text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-black text-gray-700 mb-2"
                  >
                    EMAIL (CANNOT CHANGE)
                  </label>
                  <input
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full border-3 border-[#111] bg-gray-100 p-3 md:p-4 outline-none text-sm md:text-base opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="border-t-4 border-[#111] pt-6 mt-6">
                  <h3 className="text-lg md:text-xl font-black mb-4 font-['Darker Grotesque']">
                    CHANGE PASSWORD
                  </h3>

                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-black text-gray-700 mb-2"
                      >
                        CURRENT PASSWORD
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        className="w-full border-3 border-[#111] bg-white p-3 md:p-4 outline-none focus:shadow-[4px_4px_#111] transition text-sm md:text-base"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-black text-gray-700 mb-2"
                      >
                        NEW PASSWORD
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="w-full border-3 border-[#111] bg-white p-3 md:p-4 outline-none focus:shadow-[4px_4px_#111] transition text-sm md:text-base"
                        placeholder="Enter new password (leave blank to keep current)"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="border-3 border-[#ff5c5c] bg-[#ffe6e6] p-3 md:p-4 text-sm font-black text-[#ff5c5c] flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {message && !error && (
                  <div className="border-3 border-[#35d56f] bg-[#e6ffe6] p-3 md:p-4 text-sm font-black text-[#35d56f] flex items-center gap-2">
                    <CheckCircle size={18} />
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 border-4 border-[#111] bg-blue-500 text-white px-6 md:px-8 py-3 md:py-4 font-black text-sm md:text-base shadow-[6px_6px_#111] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_#111] transition disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                >
                  <Save size={20} />
                  {loading ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}