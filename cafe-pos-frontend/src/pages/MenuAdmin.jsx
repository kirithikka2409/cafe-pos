import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import "./MenuAdmin.css";
import AdminLayout from "../components/AdminLayout";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function MenuAdmin() {
  const [menu, setMenu] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFoodType, setActiveFoodType] = useState("All");
  const fileInputRef = useRef(null);

  // Animated totals
  const [displaySubtotal, setDisplaySubtotal] = useState(0);
  const [displayDiscount, setDisplayDiscount] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);

  const categories = ["All", ...Array.from (new Set(menu.map((item) => item.category).filter(c => c !== "All")))];
  const foodTypes = ["All", ...Array.from (new Set(menu.map((item) => item.foodType).filter(ft => ft !== "All")))];

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user || user.role !== "admin") {
      window.location.href = "/login";
    }
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get("/menu");
      setMenu(res.data);
    } catch {
      alert("Failed to fetch menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // --- State for new item ---
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    image: null,
    discount: "",
    foodType: "Veg",
  });

  // --- Add New Item ---
  const addNewItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      return alert("Fill all required fields");
    }

    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("price", parseFloat(newItem.price));
    formData.append("category", newItem.category);
    formData.append("discount", Number(newItem.discount) || 0);
    formData.append("foodType", newItem.foodType);
    if (newItem.image) formData.append("image", newItem.image);

    try {
      await api.post("/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewItem({ name: "", price: "", category: "", image: null, discount: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMenu();
    } catch {
      alert("Failed to add item");
    }
  };

  // --- Edit / Save Item ---
  const handleSave = async (item) => {
    const formData = new FormData();
    formData.append("name", item.name);
    formData.append("price", parseFloat(item.price));
    formData.append("category", item.category);
    formData.append("discount", Number(item.discount) || 0);
    formData.append("foodType", item.foodType);
    if (item.image instanceof File) formData.append("image", item.image);

    try {
      await api.put(`/menu/${item.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingId(null);
      fetchMenu();
    } catch {
      alert("Failed to update item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await api.delete(`/menu/${id}`);
    fetchMenu();
  };

  // --- Totals ---
  const vatRate = 0.05;
  const subtotal = menu.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (1 + vatRate), 0);
  const totalDiscountAmount = menu.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (1 + vatRate) * ((Number(item.discount) || 0) / 100),
    0
  );
  const totalAmount = subtotal - totalDiscountAmount;
  const discountPercent = subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

  // --- Animate numbers ---
  const animateNumber = (start, end, setter, duration = 600) => {
    const startTime = performance.now();
    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setter(start + (end - start) * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

useEffect(() => {
  animateNumber(displaySubtotal, subtotal, setDisplaySubtotal);
  animateNumber(displayDiscount, discountPercent, setDisplayDiscount);
  animateNumber(displayTotal, totalAmount, setDisplayTotal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [subtotal, discountPercent, totalAmount]);

  // --- Drag & Drop ---
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const filteredMenu = menu
      .filter(item =>
        (activeCategory === "All" || item.category === activeCategory) &&
        (activeFoodType === "All" || item.foodType === activeFoodType)
      );

    const reordered = Array.from(filteredMenu);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Merge back into main menu
    const newMenu = menu.map(item => reordered.find(i => i.id === item.id) || item);
    setMenu(newMenu);
  };

  // --- Styles ---
  const inputStyle = { padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 150, marginBottom: 5 };
  const primaryButton = { background: "#6f4e37", color: "white", padding: "10px 20px", border: "none", borderRadius: 8 };
  const editButton = { background: "#d9a441", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, marginRight: 8 };
  const deleteButton = { background: "#c0392b", color: "white", border: "none", padding: "6px 12px", borderRadius: 6 };

  return (
    <AdminLayout>
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h2>Manage Menu</h2>
          <div>Welcome, Admin ☕</div>
        </div>

        {/* Summary */}
        <div className="summary-cards">
          <div>Total Items: {menu.length}</div>
          <div>Subtotal: OMR {displaySubtotal.toFixed(3)}</div>
          <div>Discount: {displayDiscount.toFixed(0)}%</div>
          <div>Total: OMR {displayTotal.toFixed(3)}</div>
        </div>

        {/* Add Item */}
        <div className="add-item">
          <input placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} />
          <input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={inputStyle} />
          <input type="file" ref={fileInputRef} onChange={e => setNewItem({ ...newItem, image: e.target.files[0] })} style={{ marginBottom: 5 }} />
          <input type="number" placeholder="Item Discount % (optional)" value={newItem.discount || ""} onChange={e => setNewItem({ ...newItem, discount: e.target.value })} style={inputStyle} />
          <select value={newItem.foodType} onChange={e => setNewItem({ ...newItem, foodType: e.target.value })} style={inputStyle}>
            <option value="">Select Food Type</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Egg">Egg</option>
          </select>
          <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={inputStyle}>
            <option value="">Select Category</option>
            <option value="Main Course">Main Course</option>
            <option value="Appetiser">Appetiser</option>
            <option value="Tea">Tea</option>
            <option value="Coffee">Coffee</option>
          </select>
          <button style={primaryButton} onClick={addNewItem}>Add Item</button>
        </div>

        {/* Filters */}
        <div className="filter" style={{ display: "flex", gap: "10px" }}>
          <div className="categories">
            {categories.map(cat => (
              <button key={cat} className={activeCategory === cat ? "active-tab" : ""} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
          <div className="food-types">
            {foodTypes.map(type => (
              <button key={type} className={activeFoodType === type ? "active-tab" : ""} onClick={() => setActiveFoodType(type)}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid with Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menuGrid">
            {(provided) => (
              <div className="menu-grid" ref={provided.innerRef} {...provided.droppableProps}>
                {menu
                  .filter(item =>
                    (activeCategory === "All" || item.category === activeCategory) &&
                    (activeFoodType === "All" || item.foodType === activeFoodType)
                  )
                  .map((item, index) => {
                    const basePrice = parseFloat(item.price) || 0;
                    const discount = Number(item.discount) || 0;
                    const finalPrice = basePrice * (1 + vatRate) * (1 - discount / 100);

                    return (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div className="menu-card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <div
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                width: 15,
                                height: 15,
                                borderRadius: "50%",
                                backgroundColor: item.foodType === "Veg" ? "green" : item.foodType === "Non-Veg" ? "red" : "orange",
                                border: "1px solid #000",
                              }}
                              title={item.foodType}
                            />
                            {item.image && (
                              <img
                                className="hover-zoom"
                                src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                                alt={item.name}
                                style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 10 }}
                              />
                            )}
                            {editingId === item.id ? (
                              <>
                                <input type="text" value={item.name} onChange={e => setMenu(prev => prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))} style={inputStyle} />
                                <input type="number" value={item.price} onChange={e => setMenu(prev => prev.map(i => i.id === item.id ? { ...i, price: e.target.value } : i))} style={inputStyle} />
                                <input type="number" value={item.discount || ""} placeholder="Discount %" onChange={e => setMenu(prev => prev.map(i => i.id === item.id ? { ...i, discount: e.target.value } : i))} style={inputStyle} />
                                <select value={item.foodType} onChange={e => setMenu(prev => prev.map(i => i.id === item.id ? { ...i, foodType: e.target.value } : i))} style={inputStyle}>
                                  <option value="Veg">Veg</option>
                                  <option value="Non-Veg">Non-Veg</option>
                                  <option value="Egg">Egg</option>
                                </select>
                                <div>
                                  <button style={editButton} onClick={() => handleSave(item)}>Save</button>
                                  <button style={deleteButton} onClick={() => setEditingId(null)}>Cancel</button>
                                </div>
                              </>
                            ) : (
                              <>
                                <h4 style={{ color: "#6f4e37" }}>{item.name}</h4>
                                {discount > 0 && <p style={{ textDecoration: "line-through", color: "#888" }}>OMR {(basePrice * (1 + vatRate)).toFixed(3)}</p>}
                                <p style={{ fontWeight: 600 }}>OMR {finalPrice.toFixed(3)}</p>
                                {discount > 0 && <p style={{ color: "green", fontSize: 12 }}>{discount}% OFF</p>}
                                <p style={{ fontSize: 12, color: "#777" }}>{item.category}</p>
                                <button style={editButton} onClick={() => setEditingId(item.id)}>Edit</button>
                                <button style={deleteButton} onClick={() => handleDelete(item.id)}>Delete</button>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </AdminLayout>
  );
}