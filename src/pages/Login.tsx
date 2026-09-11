import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { login } from "../features/auth/authSlice";
import loginBG from "../assets/loginBG.png";

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
    <main className="auth-page login-page">
      <section className="auth-card login-card">
        <img className="login-illustration" src={loginBG} alt="Shopping cart filled with groceries" />
        <div className="brand-block">
          <ShoppingBasket size={42} strokeWidth={3} />
          <h1>SHOPLIST</h1>
          <span>BUY LESS. PLAN BETTER.</span>
        </div>

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

        <div className="auth-footer-links">
          <p className="auth-footer">
            Don't have an account? <Link to="/register">CREATE ONE</Link>
          </p>
          <p className="auth-footer">
            <Link to="/forgot-password">FORGOT PASSWORD?</Link>
          </p>
        </div>
      </section>
    </main>
  );
}