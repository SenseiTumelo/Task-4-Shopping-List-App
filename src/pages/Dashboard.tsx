import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hook";
import { logout } from "../features/auth/authSlice";
import {
  addItemLocal,
  createShoppingList,
  deleteShoppingList,
  fetchLists,
  removeItemLocal,
  selectList,
  toggleItemLocal,
  updateShoppingList,
} from "../features/lists/listsSlice";
import type { ShoppingItem } from "../types";
import emptyStateImg from "../assets/empty-state.jpg";
import { findItemImage } from "../services/unsplash";

const colors = ["purple", "green", "yellow", "pink", "blue"];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user)!;
  const { lists, selectedListId, loading } = useAppSelector(
    (state) => state.lists,
  );

  const selectedList =
    lists.find((list) => list.id === selectedListId) ?? lists[0];

  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("General");
  const [showChecked, setShowChecked] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchLists(user.id));
  }, [dispatch, user.id]);

  const visibleItems =
    selectedList?.items.filter((item) => showChecked || !item.completed) ?? [];

  const completed =
    selectedList?.items.filter((item) => item.completed).length ?? 0;

  const total = selectedList?.items.length ?? 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const stats = useMemo(
    () => ({
      totalLists: lists.length,
      totalItems: lists.reduce((sum, list) => sum + list.items.length, 0),
      completed: lists.reduce(
        (sum, list) =>
          sum + list.items.filter((item) => item.completed).length,
        0,
      ),
    }),
    [lists],
  );

  const addItem = async () => {
    if (!selectedList || !newItem.trim()) return;

    const itemImage = await findItemImage(newItem.trim());

    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      name: newItem.trim(),
      category,
      completed: false,
      ...itemImage,
    };

    dispatch(addItemLocal({ listId: selectedList.id, item }));

    await dispatch(
      updateShoppingList({
        ...selectedList,
        items: [...selectedList.items, item],
      }),
    );

    setNewItem("");
  };

  const toggleItem = async (itemId: string) => {
    if (!selectedList) return;
    const updatedItems = selectedList.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );

    dispatch(toggleItemLocal({ listId: selectedList.id, itemId }));
    await dispatch(
      updateShoppingList({ ...selectedList, items: updatedItems }),
    );
  };

  const removeItem = async (itemId: string) => {
    if (!selectedList) return;
    const updatedItems = selectedList.items.filter(
      (item) => item.id !== itemId,
    );

    dispatch(removeItemLocal({ listId: selectedList.id, itemId }));
    await dispatch(
      updateShoppingList({ ...selectedList, items: updatedItems }),
    );
  };

  const createList = async () => {
    const listName = newListName.trim();

    if (!listName) return;

    try {
      await dispatch(
        createShoppingList({
          userId: user.id,
          name: listName,
          color: colors[lists.length % colors.length],
        }),
      ).unwrap();

      await dispatch(fetchLists(user.id)).unwrap();

      setNewListName("");
      setShowCreateList(false);
    } catch (error) {
      console.error("Failed to create shopping list:", error);
      alert("Failed to create shopping list. Please try again.");
    }
  };

  const removeList = async () => {
    if (!selectedList) return;

    await dispatch(deleteShoppingList(selectedList.id));
    setShowDeleteConfirm(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="sidebar-brand">
          <ShoppingCart size={36} strokeWidth={3} />
          <h1>SHOPLIST</h1>
          <span>shop with passion</span>
        </div>

        <nav>
          <button className="nav-link active">
            <Home />
            DASHBOARD
          </button>
          <button className="nav-link" onClick={() => navigate("/profile")}>
            <Settings /> PROFILE
          </button>
        </nav>

        <div className="profile-card">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <button className="logout-link" onClick={() => dispatch(logout())}>
          <LogOut /> LOG OUT
        </button>
      </aside>

      {mobileNav && (
        <button className="nav-backdrop" onClick={() => setMobileNav(false)} />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setMobileNav(!mobileNav)}
          >
            {mobileNav ? <X /> : <Menu />}
          </button>

          <div>
            <h2>Hello, {user.name.toUpperCase()}!</h2>
          </div>

          <button
            className="brutal-button blue new-list"
            onClick={() => setShowCreateList(true)}
          >
            <Plus /> NEW LIST
          </button>
        </header>

        <section className="workspace">
          <div className="content-column">
            <div className="section-heading">
              <h3>MY SHOPPING LISTS</h3>
              <button className="small-button">VIEW ALL →</button>
            </div>

            <div className="list-cards">
              {lists.map((list) => (
                <button
                  key={list.id}
                  className={`list-card ${list.color} ${
                    list.id === selectedList?.id ? "selected" : ""
                  }`}
                  onClick={() => dispatch(selectList(list.id))}
                >
                  <div className="list-card-icon">
                    <ShoppingCart />
                  </div>
                  <strong>{list.name}</strong>
                  <span>{list.items.length} ITEMS</span>
                </button>
              ))}
            </div>

            <section className="items-panel">
              <div className="items-header">
                <div>
                  <h3>{selectedList?.name ?? "NO LIST SELECTED"}</h3>
                  {selectedList && (
                    <div className="progress-row">
                      <span>
                        {completed} OF {total} ITEMS CHECKED
                      </span>
                      <div className="progress">
                        <span style={{ width: `${percent}%` }} />
                      </div>
                      <b>{percent}%</b>
                    </div>
                  )}
                </div>

                <div className="header-actions">
                  <button className="brutal-button blue" onClick={addItem}>
                    <Plus /> ADD ITEM
                  </button>
                  <button
                    className="brutal-button yellow"
                    onClick={() => setShowChecked(!showChecked)}
                    title="Hide the checked items/Show show all items of a list"
                  >
                    {showChecked ? "HIDE CHECKED" : "SHOW CHECKED"}
                  </button>
                  <button
                    className="danger-icon"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Delete list"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              <div className="add-item">
                <input
                  placeholder="Add your item here..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>Dairy</option>
                  <option>Bakery</option>
                  <option>Meat</option>
                  <option>Vegetables</option>
                  <option>Fruits</option>
                  <option>Household</option>
                  <option>Personal Care</option>
                </select>
              </div>

              <div className="items-list">
                {loading && (
                  <p className="empty-state">LOADING YOUR LISTS...</p>
                )}

                {!loading && visibleItems.length === 0 && (
                  <div className="empty-state justify-center align-center flex flex-col">
                    <img src={emptyStateImg} className=" w-[10rem] place-content-center" alt="Empty state" />
                    <p>No list item available</p>
                  </div>
                )}

                {visibleItems.map((item) => (
                  <div
                    className={`item-row ${item.completed ? "done" : ""}`}
                    key={item.id}
                  >
                    <button
                      className={`checkbox ${item.completed ? "checked" : ""}`}
                      onClick={() => toggleItem(item.id)}
                    >
                      {item.completed && <Check />}
                    </button>
                    <span className="item-name">{item.name}</span>
                    <span
                      className={`category-tag ${item.category.toLowerCase().replaceAll(" ", "-")}`}
                    >
                      {item.category}
                    </span>
                    {item.imageUrl && (
                      <img
                        className="item-image"
                        src={item.imageUrl}
                        alt={item.name}
                      />
                    )}
                    <button
                      className="delete-item"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
              </div>

              {selectedList && (
                <button
                  className="show-checked"
                  onClick={() => setShowChecked(!showChecked)}
                >
                  {showChecked
                    ? "HIDE COMPLETED ITEMS ↑"
                    : "SHOW COMPLETED ITEMS ↓"}
                </button>
              )}
            </section>
          </div>

          <aside className="right-column">
            <div className="summary-card green-panel">
              <h3>SUMMARY</h3>
              <Stat
                icon={<ClipboardList />}
                label="TOTAL LISTS"
                value={stats.totalLists}
              />
              <Stat
                icon={<Check />}
                label="TOTAL ITEMS"
                value={stats.totalItems}
              />
              <Stat
                icon={<Check />}
                label="COMPLETED"
                value={stats.completed}
              />
              <Stat
                icon={<X />}
                label="PENDING"
                value={stats.totalItems - stats.completed}
              />
            </div>

            <div className="quick-card purple-panel">
              <h3>QUICK ACTIONS</h3>
              <button onClick={() => setShowCreateList(true)}>
                <Plus /> CREATE NEW LIST
              </button>
              <button onClick={() => setNewItem("")}>
                <ClipboardList /> ADD ITEM
              </button>
              <button
                onClick={() =>
                  navigator.clipboard?.writeText(window.location.href)
                }
              >
                SHARE A LIST
              </button>
            </div>

            <div className="reminder-card yellow-panel">
              <h3>DON'T FORGET!</h3>
              <p>
                <strong>{stats.totalItems - stats.completed}</strong> ITEMS ARE
                STILL WAITING FOR YOU.
              </p>
            </div>
          </aside>
        </section>
      </main>

      {showCreateList && (
        <div className="modal-backdrop">
          <div className="create-list-card">
            <button
              className="modal-close"
              onClick={() => setShowCreateList(false)}
              aria-label="Close"
            >
              <X />
            </button>

            <h3>CREATE NEW LIST</h3>

            <input
              autoFocus
              type="text"
              placeholder="Enter list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createList();
              }}
            />

            <div className="modal-actions">
              <button
                className="brutal-button yellow"
                onClick={() => setShowCreateList(false)}
              >
                CANCEL
              </button>

              <button className="brutal-button blue" onClick={createList}>
                <Plus /> CREATE LIST
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedList && (
        <div className="modal-backdrop">
          <div className="create-list-card delete-confirm-card">
            <h3>DELETE LIST?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedList.name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                className="brutal-button yellow"
                onClick={() => setShowDeleteConfirm(false)}
              >
                CANCEL
              </button>

              <button className="brutal-button red" onClick={removeList}>
                <Trash2 /> DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
