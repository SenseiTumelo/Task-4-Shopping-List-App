import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBasket, ArrowLeft, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { requestPasswordReset } from "../features/auth/authSlice";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, resetEmailSent } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await dispatch(requestPasswordReset(email));
  };

  if (resetEmailSent) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-block">
            <ShoppingBasket size={42} strokeWidth={3} />
            <h1>SHOPLIST</h1>
          </div>

          <h2>CHECK YOUR EMAIL</h2>
          <p className="muted">We've sent a password reset link to:</p>
          <p style={{ fontWeight: "bold", marginBottom: "1.5rem" }}>{email}</p>
          <p className="muted">Click the link in the email to reset your password. The link expires in 1 hour.</p>

          <button className="brutal-button blue" onClick={() => navigate("/login")} style={{ marginTop: "2rem" }}>
            <ArrowLeft size={20} /> BACK TO LOGIN
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={20} /> BACK
        </Link>

        <div className="brand-block">
          <ShoppingBasket size={42} strokeWidth={3} />
          <h1>SHOPLIST</h1>
        </div>

        <h2>RESET PASSWORD</h2>
        <p className="muted">Enter your email to receive a password reset link.</p>

        <form onSubmit={submit} className="auth-form">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          {error && (
            <div className="error-box flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button className="brutal-button blue" disabled={loading}>
            {loading ? "SENDING..." : "SEND RESET LINK →"}
          </button>
        </form>
      </section>
    </main>
  );
}