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
  ArrowLeft,
  ChevronDown,
  AlertCircle,
  ChevronUp,
  Share2,
  MessageCircle,
  FileText,
  Link2,
  Mail,
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
import type { ShoppingItem, ShoppingList } from "../types";

import { findItemImage } from "../services/unsplash";

const colors = ["purple", "green", "yellow", "pink", "blue"];

type SortBy = "name-asc" | "name-desc" | "category-asc" | "category-desc";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user)!;
  const { lists, selectedListId, loading } = useAppSelector(
    (state) => state.lists,
  );

  const selectedList =
    lists.find((list) => list.id === selectedListId) ?? null;

  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("General");
  const [showChecked, setShowChecked] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("name-asc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareList, setShareList] = useState<ShoppingList | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchLists(user.id));
  }, [dispatch, user.id]);

  const visibleItems = useMemo(() => {
    const items =
      selectedList?.items.filter((item) => showChecked || !item.completed) ?? [];

    return [...items].sort((a, b) => {
      let comparison = 0;

      if (sortBy.includes("name")) {
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      } else if (sortBy.includes("category")) {
        comparison = a.category.localeCompare(b.category, undefined, {
          sensitivity: "base",
        });
      }

      return sortBy.includes("desc") ? -comparison : comparison;
    });
  }, [selectedList, showChecked, sortBy]);

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

  const removeItem = async () => {
    if (!selectedList || !itemToDelete) return;

    const updatedItems = selectedList.items.filter(
      (item) => item.id !== itemToDelete.id,
    );

    dispatch(
      removeItemLocal({
        listId: selectedList.id,
        itemId: itemToDelete.id,
      }),
    );

    await dispatch(
      updateShoppingList({ ...selectedList, items: updatedItems }),
    );

    setItemToDelete(null);
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
    dispatch(selectList(null));
    setShowDeleteConfirm(false);
  };

  const handleSelectList = (listId: string) => {
    dispatch(selectList(listId));
  };

  const handleBackFromItems = () => {
    dispatch(selectList(null));
  };

  const getSortLabel = () => {
    const labels: Record<SortBy, string> = {
      "name-asc": "NAME A–Z",
      "name-desc": "NAME Z–A",
      "category-asc": "CATEGORY A–Z",
      "category-desc": "CATEGORY Z–A",
    };
    return labels[sortBy];
  };

  const openShareModal = (list: ShoppingList) => {
    setShareList(list);
    setShowShareModal(true);
  };

  const generateListText = (list: ShoppingList) => {
    const itemsList = list.items.map((item) => `• ${item.name} (${item.category})`).join("\n");
    return `SHOPLIST - ${list.name}\n\n${itemsList}\n\nShared from SHOPLIST App`;
  };

  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}?list=${shareList?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareViaWhatsApp = () => {
    if (!shareList) return;
    const text = generateListText(shareList);
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  const shareViaEmail = () => {
    if (!shareList) return;
    const text = generateListText(shareList);
    const subject = `Check out my shopping list: ${shareList.name}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  };

  const generatePDF = () => {
    if (!shareList) return;
    const text = generateListText(shareList);
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${shareList.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            {!selectedList ? (
              <>
                <div className="section-heading">
                  <h3>MY SHOPPING LISTS</h3>
                  <button className="small-button">VIEW ALL <ArrowLeft size={16} style={{ transform: 'scaleX(-1)' }} /></button>
                </div>

                <div className="list-cards">
                  {lists.length === 0 ? (
                    <div className="empty-state">
                      <p>No shopping lists yet.</p>
                      <button
                        className="brutal-button blue"
                        onClick={() => setShowCreateList(true)}
                      >
                        <Plus /> CREATE YOUR FIRST LIST
                      </button>
                    </div>
                  ) : (
                    lists.map((list) => (
                      <div key={list.id} className="list-card-wrapper">
                        <button
                          className={`list-card ${list.color}`}
                          onClick={() => handleSelectList(list.id)}
                        >
                          <div className="list-card-icon">
                            <ShoppingCart />
                          </div>
                          <strong>{list.name}</strong>
                          <span>{list.items.length} ITEMS</span>
                        </button>
                        <button
                          className="list-card-share"
                          onClick={() => openShareModal(list)}
                          title="Share this list"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <section className={`items-panel ${selectedList.color ?? ""}`}>
                <div className="items-header">
                  <div className="items-title-section">
                    <button
                      className="back-button"
                      onClick={handleBackFromItems}
                      title="Back to lists"
                    >
                      <ArrowLeft /> BACK
                    </button>
                    <div>
                      <h3>{selectedList.name}</h3>
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
                  </div>

                  <div className="header-actions">
                    <div className="relative">
                      <button
                        className="small-button flex items-center gap-2"
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        SORT: {getSortLabel()}
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            showSortDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showSortDropdown && (
                        <div className="absolute top-full mt-1 left-0 bg-white border-3 border-[#111] shadow-[6px_6px_#111] z-50 min-w-[200px]">
                          <button
                            className="w-full text-left px-4 py-3 font-bold hover:bg-[#ffd600] border-b-2 border-[#111] transition flex items-center gap-2"
                            onClick={() => {
                              setSortBy("name-asc");
                              setShowSortDropdown(false);
                            }}
                          >
                            {sortBy === "name-asc" && <Check size={16} />}
                            NAME A–Z
                          </button>
                          <button
                            className="w-full text-left px-4 py-3 font-bold hover:bg-[#ffd600] border-b-2 border-[#111] transition flex items-center gap-2"
                            onClick={() => {
                              setSortBy("name-desc");
                              setShowSortDropdown(false);
                            }}
                          >
                            {sortBy === "name-desc" && <Check size={16} />}
                            NAME Z–A
                          </button>
                          <button
                            className="w-full text-left px-4 py-3 font-bold hover:bg-[#ffd600] border-b-2 border-[#111] transition flex items-center gap-2"
                            onClick={() => {
                              setSortBy("category-asc");
                              setShowSortDropdown(false);
                            }}
                          >
                            {sortBy === "category-asc" && <Check size={16} />}
                            CATEGORY A–Z
                          </button>
                          <button
                            className="w-full text-left px-4 py-3 font-bold hover:bg-[#ffd600] transition flex items-center gap-2"
                            onClick={() => {
                              setSortBy("category-desc");
                              setShowSortDropdown(false);
                            }}
                          >
                            {sortBy === "category-desc" && <Check size={16} />}
                            CATEGORY Z–A
                          </button>
                        </div>
                      )}
                    </div>

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
                    <div className="empty-state justify-center align-center flex flex-col bg-white">
                      <p>No items in this list</p>
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
                        onClick={() => setItemToDelete(item)}
                        title={`Delete ${item.name}`}
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
                    {showChecked ? (
                      <>
                        <ChevronUp size={18} /> HIDE COMPLETED ITEMS
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} /> SHOW COMPLETED ITEMS
                      </>
                    )}
                  </button>
                )}
              </section>
            )}
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
                icon={<ShoppingCart />}
                label="TOTAL ITEMS"
                value={stats.totalItems}
              />
              <Stat
                icon={<Check />}
                label="COMPLETED"
                value={stats.completed}
              />
              <Stat
                icon={<AlertCircle />}
                label="PENDING"
                value={stats.totalItems - stats.completed}
              />
            </div>

            <div className="quick-card purple-panel">
              <h3>QUICK ACTIONS</h3>
              <button onClick={() => setShowCreateList(true)}>
                <Plus /> CREATE NEW LIST
              </button>
              <button onClick={() => openShareModal(selectedList || lists[0])}>
                <Share2 /> SHARE A LIST
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

      {showShareModal && shareList && (
        <div className="modal-backdrop">
          <div className="create-list-card">
            <button
              className="modal-close"
              onClick={() => setShowShareModal(false)}
              aria-label="Close"
            >
              <X />
            </button>

            <h3>SHARE "{shareList.name.toUpperCase()}"</h3>
            <p style={{ marginBottom: "1.5rem", color: "#666", textAlign: "center" }}>
              Choose how you want to share this shopping list
            </p>

            <div className="share-options">
              <button
                className="share-option-btn"
                onClick={shareViaWhatsApp}
                title="Share via WhatsApp"
              >
                <MessageCircle size={28} />
                <span>WhatsApp</span>
              </button>

              <button
                className="share-option-btn"
                onClick={shareViaEmail}
                title="Share via Email"
              >
                <Mail size={28} />
                <span>Email</span>
              </button>

              <button
                className="share-option-btn"
                onClick={generatePDF}
                title="Download as file"
              >
                <FileText size={28} />
                <span>Download</span>
              </button>

              <button
                className="share-option-btn"
                onClick={copyToClipboard}
                title="Copy link"
              >
                <Link2 size={28} />
                <span>{copySuccess ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
              <button
                className="brutal-button yellow"
                onClick={() => setShowShareModal(false)}
              >
                CLOSE
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

      {itemToDelete && (
        <div className="modal-backdrop">
          <div className="create-list-card delete-confirm-card">
            <h3>DELETE ITEM?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete.name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                className="brutal-button yellow"
                onClick={() => setItemToDelete(null)}
              >
                CANCEL
              </button>

              <button className="brutal-button red" onClick={removeItem}>
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