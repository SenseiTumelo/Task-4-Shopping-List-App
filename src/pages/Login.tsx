import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("tumelo@example.com");
  const [password, setPassword] = useState("123456");

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
          <ShoppingBasket size={42} strokeWidth={3} />
          <h1>SHOPLIST</h1>
          <span>BUY LESS. PLAN BETTER.</span>
        </div>

        <h2>WELCOME BACK!</h2>
        <p className="muted">Log in to manage your shopping lists.</p>

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
          Don't have an account? <Link to="/register">CREATE ONE</Link>
        </p>
      </section>
    </main>
  );
}