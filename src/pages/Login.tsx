import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate("/");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-block">
          <h1>SHOPLIST</h1>
          <span>Your List Management tool</span>
        </div>

        <h2>Hello, Welcome back!</h2>
        <form onSubmit={submit} className="auth-form">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {error && <div className="error-box">{error}</div>}

          <button className="brutal-button blue" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOG IN →"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}