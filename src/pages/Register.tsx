import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { register } from "../features/auth/authSlice";
import { validatePassword, encryptPassword, type PasswordStrength } from "../utils/passwordValidator";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<PasswordStrength>({
    isValid: false,
    errors: [],
    strength: "weak",
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordValidation(validation);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && password !== value) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordValidation.strength) {
      case "strong":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "fair":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!passwordValidation.isValid) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    try {
      const encryptedPassword = await encryptPassword(password);
      const result = await dispatch(register({ name, email, password: encryptedPassword }));

      if (register.fulfilled.match(result)) {
        navigate("/");
      }
    } catch (err) {
      console.error("Encryption error:", err);
    }
  };

  const isFormValid = passwordValidation.isValid && !passwordMismatch && confirmPassword === password;

  return (
    <main className="grid min-h-screen place-items-center p-[25px] bg-[#ffd600]">
      <section className="w-[min(480px,100%)] border-4 border-[#111] bg-white p-[30px] shadow-[10px_10px_#111] max-[520px]:p-[22px]">
        <div className="mb-[25px] grid justify-items-center text-center">
          <h1 className="my-1 font-['Darker Grotesque'] text-[44px] tracking-[-2px] max-[520px]:text-4xl">
            SHOPLIST
          </h1>
        </div>

        <h2 className="mb-1 font-['Darker Grotesque'] text-[27px] text-center">
          CREATE ACCOUNT
        </h2>

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
            onChange={(event) => handlePasswordChange(event.target.value)}
            type="password"
            required
            className="border-[3px] border-[#111] bg-white p-3 outline-none focus:shadow-[4px_4px_#111]"
          />

          {password && (
            <div className="mt-2">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-300 border-2 border-[#111]">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all`}
                    style={{
                      width: `${(
                        ((5 - passwordValidation.errors.length) / 5) *
                        100
                      ).toFixed(0)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-black capitalize">
                  {passwordValidation.strength}
                </span>
              </div>

              {passwordValidation.errors.length > 0 && (
                <div className="border-[2px] border-[#ff5c5c] bg-[#ffe6e6] p-2 text-xs">
                  {passwordValidation.errors.map((error, idx) => (
                    <div key={idx} className="flex items-start gap-2 mb-1">
                      <AlertCircle size={16} className="text-[#ff5c5c] flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {passwordValidation.isValid && (
                <div className="border-[2px] border-[#35d56f] bg-[#e6ffe6] p-2 text-xs font-black text-[#35d56f] flex items-center gap-2">
                  <CheckCircle size={16} /> Password is strong!
                </div>
              )}
            </div>
          )}

          <label className="mt-2 font-black">Confirm Password</label>
          <input
            value={confirmPassword}
            onChange={(event) => handleConfirmPasswordChange(event.target.value)}
            type="password"
            required
            disabled={!passwordValidation.isValid}
            className="border-[3px] border-[#111] bg-white p-3 outline-none focus:shadow-[4px_4px_#111] disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {confirmPassword && passwordMismatch && (
            <div className="border-[2px] border-[#ff5c5c] bg-[#ffe6e6] p-2 text-xs font-black text-[#ff5c5c] flex items-center gap-2">
              <AlertCircle size={16} /> Passwords do not match
            </div>
          )}

          {confirmPassword && !passwordMismatch && (
            <div className="border-[2px] border-[#35d56f] bg-[#e6ffe6] p-2 text-xs font-black text-[#35d56f] flex items-center gap-2">
              <CheckCircle size={16} /> Passwords match
            </div>
          )}

          {error && (
            <div className="mt-2 border-[3px] border-[#111] bg-[#ff5c5c] p-2.5 font-extrabold flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="mt-3 inline-flex items-center justify-center gap-2 border-[3px] border-[#111] bg-[#35d56f] px-4 py-3 font-black shadow-[4px_4px_#111] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_#111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "CREATING..." : "REGISTER →"}
          </button>
        </form>

        <p className="mt-4 text-center font-bold">
          Already have an account?{" "}
          <Link to="/login" className="bg-[#ffd600] px-1 font-black text-[#111]">
            LOG IN
          </Link>
        </p>
      </section>
    </main>
  );
}