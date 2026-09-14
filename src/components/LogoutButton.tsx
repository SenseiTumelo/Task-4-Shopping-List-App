import { useRef } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hook";
import { logout } from "../features/auth/authSlice";

export default function LogoutButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <>
      <button className="logout-link" onClick={() => dialog.current?.showModal()}>
        <LogOut /> LOG OUT
      </button>
      <dialog ref={dialog} className="create-list-card logout-dialog" aria-labelledby="logout-title">
        <h3 id="logout-title">LOG OUT?</h3>
        <p>Are you sure you want to log out?</p>
        <div className="modal-actions">
          <button autoFocus type="button" className="brutal-button yellow" onClick={() => dialog.current?.close()}>
            CANCEL
          </button>
          <button type="button" className="brutal-button red" onClick={() => {
            dialog.current?.close();
            dispatch(logout());
            navigate("/login");
          }}>
            <LogOut /> LOG OUT
          </button>
        </div>
      </dialog>
    </>
  );
}
