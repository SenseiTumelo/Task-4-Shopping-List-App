import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { register } from "../features/auth/authSlice";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(result)) navigate("/");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-block">
          <ShoppingBasket size={42} strokeWidth={3} />
          <h1>SHOPLIST</h1>
          <span>MAKE YOUR LIST. GET IT DONE.</span>
        </div>

        <h2>CREATE ACCOUNT</h2>
        <p className="muted">Start organising your shopping in seconds.</p>

        <form onSubmit={submit} className="auth-form">
          <label>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />

          {error && <div className="error-box">{error}</div>}

          <button className="brutal-button green" disabled={loading}>
            {loading ? "CREATING..." : "REGISTER →"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">LOG IN</Link>
        </p>
      </section>
    </main>
  );
}