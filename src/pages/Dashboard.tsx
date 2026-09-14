import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ClipboardList,
  Home,
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
  InboxIcon,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hook";
import LogoutButton from "../components/LogoutButton";
import {
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

  const [listSearch, setListSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const listQuery = listSearch.trim().toLowerCase();
  const itemQuery = itemSearch.trim().toLowerCase();
  const visibleLists = lists.filter((list) =>
    list.name.toLowerCase().includes(listQuery),
  );

  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const itemDialog = useRef<HTMLDialogElement>(null);
  const [itemNote, setItemNote] = useState("");
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState("");

  const openAddItem = () => {
    if (!selectedList) return;
    setNewItem("");
    setQuantity(1);
    setCategory("General");
    setItemNote("");
    setItemError("");
    itemDialog.current?.showModal();
  };
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
      selectedList?.items.filter(
        (item) =>
          (showChecked || !item.completed) &&
          (item.name.toLowerCase().includes(itemQuery) ||
            item.category.toLowerCase().includes(itemQuery)),
      ) ?? [];

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
  }, [selectedList, showChecked, sortBy, itemQuery]);

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
    if (!selectedList || savingItem) return;
    if (!newItem.trim()) {
      setItemError("Enter an item name.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      setItemError("Choose a quantity from 1 to 99.");
      return;
    }
    setSavingItem(true);
    setItemError("");
    try {
      const itemImage = await findItemImage(newItem.trim());
      const item: ShoppingItem = {
        id: crypto.randomUUID(),
        name: newItem.trim(),
        quantity,
        category,
        completed: false,
        note: itemNote.trim() || undefined,
        ...itemImage,
      };
      await dispatch(
        updateShoppingList({
          ...selectedList,
          items: [...selectedList.items, item],
        }),
      ).unwrap();
      setNewItem("");
      setItemNote("");
      itemDialog.current?.close();
    } catch {
      setItemError("Could not add the item. Please try again.");
    } finally {
      setSavingItem(false);
    }
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
    setItemSearch("");
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
      <dialog ref={itemDialog} className="item-note-dialog" aria-labelledby="item-note-title" onCancel={(event) => { if (savingItem) event.preventDefault(); }}>
        <form onSubmit={(event) => { event.preventDefault(); void addItem(); }}>
          <h2 id="item-note-title">Add item</h2>
          <p>Enter the details for your shopping list.</p>
          <label htmlFor="item-name">Item name</label>
          <input id="item-name" autoFocus required maxLength={120} value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="For example: Milk" disabled={savingItem} />
          <label htmlFor="item-quantity">Quantity</label>
          <select id="item-quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} disabled={savingItem}>
            {Array.from({ length: 99 }, (_, index) => index + 1).map((number) => (
              <option key={number} value={number}>{number}</option>
            ))}
          </select>
          <label htmlFor="item-category">Category</label>
          <select id="item-category" value={category} onChange={(event) => setCategory(event.target.value)} disabled={savingItem}>
            {["General", "Dairy", "Bakery", "Meat", "Vegetables", "Fruits", "Household", "Personal Care"].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <label htmlFor="item-note">Description (optional)</label>
          <textarea id="item-note" value={itemNote} maxLength={500} onChange={(event) => setItemNote(event.target.value)} placeholder="For example: lactose-free, 2-litre bottle" disabled={savingItem} />
          <small>{itemNote.length}/500 characters</small>
          {itemError && <p role="alert" className="error-box">{itemError}</p>}
          <div className="modal-actions">
            <button type="button" className="small-button" disabled={savingItem} onClick={() => itemDialog.current?.close()}>Cancel</button>
            <button type="submit" className="brutal-button blue" disabled={savingItem}>{savingItem ? "Adding..." : "Add item"}</button>
          </div>
        </form>
      </dialog>
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

        <LogoutButton />
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
                </div>

                <SearchField
                  label="Search shopping lists"
                  placeholder="Search lists by name..."
                  value={listSearch}
                  onChange={setListSearch}
                />
                {listQuery && !loading && (
                  <p role="status" className="mb-4 font-bold">
                    {visibleLists.length} of {lists.length} lists found
                  </p>
                )}

                <div className="list-cards">
                  {loading ? (
                    <p className="empty-state">LOADING YOUR LISTS...</p>
                  ) : lists.length === 0 ? (
                    <div className="empty-state-container col-span-full max-w-[560px] justify-self-center">
                      <div className="empty-state-content flex flex-col items-center justify-center gap-4 text-center">
                        <InboxIcon size={64} strokeWidth={1.5} />
                        <h3>NO SHOPPING LISTS YET</h3>
                        <p>Create your first shopping list to get started</p>
                        <button
                          className="brutal-button blue"
                          onClick={() => setShowCreateList(true)}
                        >
                          <Plus size={20} aria-hidden="true" /> ADD NEW LIST
                        </button>
                      </div>
                    </div>
                  ) : visibleLists.length === 0 ? (
                    <div className="empty-items-state col-span-full w-full max-w-[560px] justify-self-center">
                      <Search size={56} aria-hidden="true" />
                      <p>No matching shopping lists</p>
                      <span>Try another list name or clear your search.</span>
                      <button className="small-button" onClick={() => setListSearch("")}>
                        CLEAR SEARCH
                      </button>
                    </div>
                  ) : (
                    visibleLists.map((list) => (
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

                <div className="list-progress-actions">
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
                  <button type="button" className="brutal-button blue" onClick={openAddItem}>
                    <Plus /> ADD ITEM
                  </button>
                </div>
                <SearchField
                  label="Search items in this list"
                  placeholder="Search items by name or category..."
                  value={itemSearch}
                  onChange={setItemSearch}
                />
                {itemQuery && !loading && (
                  <p role="status" className="mb-4 font-bold">
                    {visibleItems.length} of {total} items found
                    {!showChecked && " (checked items hidden)"}
                  </p>
                )}

                <div className="items-list">
                  {loading && (
                    <p className="empty-state">LOADING YOUR LISTS...</p>
                  )}

                  {!loading && visibleItems.length === 0 && (
                    <div className="empty-items-state">
                      <InboxIcon size={56} strokeWidth={1.5} />
                      <p>
                        {itemQuery
                          ? "No matching items"
                          : total > 0
                            ? "All items are checked"
                            : "No items in this list"}
                      </p>
                      <span>
                        {itemQuery
                          ? "Try another name or category, or clear your search."
                          : total > 0
                            ? "Show completed items to see them."
                            : "Start adding items to your shopping list"}
                      </span>
                      {itemQuery && (
                        <button className="small-button" onClick={() => setItemSearch("")}>
                          CLEAR SEARCH
                        </button>
                      )}
                      {itemQuery && !showChecked && (
                        <span>Checked items are hidden. Use SHOW COMPLETED ITEMS to include them.</span>
                      )}
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
                                            <div className="item-description">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">Qty: {item.quantity ?? 1}</span>
                        {item.note && <p className="item-note">{item.note}</p>}
                      </div>
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
function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="search" aria-label={label} className="compact-search">
      <Search size={20} aria-hidden="true" className="shrink-0" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onChange("");
        }}
        className="min-w-0 flex-1 bg-transparent outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={() => onChange("")}
          className="shrink-0 p-1"
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}