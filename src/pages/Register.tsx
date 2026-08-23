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

    if (register.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#ffd600_0_25%,#f4f3ef_25%_100%)] p-[25px]">
      <section className="w-[min(480px,100%)] border-4 border-[#111] bg-white p-[30px] shadow-[10px_10px_#111] max-[520px]:p-[22px]">
        <div className="mb-[25px] grid justify-items-center text-center">
          <ShoppingBasket size={42} strokeWidth={3} />

          <h1 className="my-1 font-['Archivo_Black'] text-[44px] tracking-[-2px] max-[520px]:text-4xl">
            SHOPLIST
          </h1>

          <span className="inline-block border-[3px] border-[#111] bg-[#ff6f9f] px-2.5 py-2 font-black shadow-[4px_4px_#111]">
            MAKE YOUR LIST. GET IT DONE.
          </span>
        </div>

        <h2 className="mb-1 font-['Archivo_Black'] text-[27px]">
          CREATE ACCOUNT
        </h2>

        <p className="font-semibold text-[#555]">
          Start organising your shopping in seconds.
        </p>

        <form onSubmit={submit} className="grid gap-2">
          <label className="mt-2 font-black">Full name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="border-[3px] border-[#111] bg-white p-3 outline-none focus:shadow-[4px_4px_#111]"
          />

          <label className="mt-2 font-black">Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            className="border-[3px] border-[#111] bg-white p-3 outline-none focus:shadow-[4px_4px_#111]"
          />

          <label className="mt-2 font-black">Password</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={6}
            required
            className="border-[3px] border-[#111] bg-white p-3 outline-none focus:shadow-[4px_4px_#111]"
          />

          {error && (
            <div className="mt-2 border-[3px] border-[#111] bg-[#ff5c5c] p-2.5 font-extrabold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex items-center justify-center gap-2 border-[3px] border-[#111] bg-[#35d56f] px-4 py-3 font-black shadow-[4px_4px_#111] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_#111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "CREATING..." : "REGISTER →"}
          </button>
        </form>

        <p className="my-[25px_0_0] text-center font-bold">
          Already have an account?{" "}
          <Link
            to="/login"
            className="bg-[#ffd600] px-1 font-black text-[#111]"
          >
            LOG IN
          </Link>
        </p>
      </section>
    </main>
  );
}