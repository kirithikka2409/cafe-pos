import { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/axios";
import { isTokenValid, getUserRole } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [paymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const navigate = useNavigate();


  const [displaySubtotal, setDisplaySubtotal] = useState(0); // Excl. VAT
  const [displayVAT, setDisplayVAT] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);

  const cartRef = useRef(null);

  const menuCardStyle = {
    background: darkMode ? "rgba(62,39,35,0.85)" : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: 15,
    padding: 15,
    boxShadow: darkMode ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s",
    cursor: "pointer",
    position: "relative"
  };

  useEffect(() => {
    const loggedIn = isTokenValid();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const userRole = getUserRole();
      setRole(userRole);
      if (userRole === "counter") loadCart();
    }
    fetchMenu();
    fetchStaff();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get("/menu");
      setMenu(res.data.sort((a, b) => a.order - b.order));
    } catch {
      alert("Failed to fetch menu");
    }
  };

  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.items || []);
    } catch {
      setCart([]);
    }

  };

  const saveCart = async (updatedCart) => {
    setCart(updatedCart);
    if (isLoggedIn && role === "counter") {
      try {
        await api.post("/cart", { items: updatedCart });
      } catch (err) {
        console.error("Failed to save cart", err);
      }
    }
  };

  const addToCart = (item) => {
    if (role !== "counter") return alert("❌ Only counter users can place orders");

    if (item.image && cartRef.current) flyToCart(`${process.env.REACT_APP_API_URL}/uploads/${item.image}`);

    const updated = [...cart];
    const existing = updated.find((i) => i.id === item.id);
    if (existing) existing.qty += 1;
    else updated.push({ ...item, qty: 1 });
    saveCart(updated);
  };

  const increaseQty = (id) => saveCart(cart.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const decreaseQty = (id) => saveCart(cart.map(i => (i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i)).filter(Boolean));
  const removeItem = (id) => saveCart(cart.filter(i => i.id !== id));

  // ------------------ VAT-inclusive calculation ------------------
  const subtotalExclVAT = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price / 1.05) * item.qty, 0),
    [cart]
  );

  const vatTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price - item.price / 1.05) * item.qty, 0),
    [cart]
  );

  const discountedSubtotal = useMemo(
    () => subtotalExclVAT - (subtotalExclVAT * discount) / 100,
    [subtotalExclVAT, discount]
  );

  const totalAmount = useMemo(
    () => discountedSubtotal + vatTotal,
    [discountedSubtotal, vatTotal]
  );

  const animateValue = (start, end, setter, duration = 400) => {
    const startTime = performance.now();
    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setter(start + (end - start) * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

useEffect(() => {
  animateValue(displaySubtotal, subtotalExclVAT, setDisplaySubtotal);
  animateValue(displayVAT, vatTotal, setDisplayVAT);
  animateValue(displayTotal, totalAmount, setDisplayTotal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [subtotalExclVAT, vatTotal, totalAmount]);

  const placeOrder = async () => {
    if (role !== "counter") return alert("❌ Only counter users can place orders");
    if (!cart.length) return;

    if(!selectedStaff) {
      return alert("Please select staff before placing order");
    }

    try {
      const orderPayload = {
        items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
        discount: discount || 0,
        paymentMethod,
        staffId: selectedStaff,
      };
      const res = await api.post("/orders", orderPayload);

      if (res.data?.order?.id) {
        const orderId = res.data.order.id;
        alert("✅ Order placed successfully!");
        window.open(`/kot-print/${orderId}`, "_blank");
        setCart([]);
        setDiscount(0);
        await api.post("/cart", { items: [] });
      } else {
        alert("❌ Failed to place order");
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || "Failed to place order"}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole(null);
    alert("👋 Logged out successfully");
  };

  const flyToCart = (imgSrc) => {
    if (!cartRef.current) return;
    const flyer = document.createElement("img");
    flyer.src = imgSrc;
    flyer.style.position = "fixed";
    flyer.style.width = "100px";
    flyer.style.height = "100px";
    flyer.style.borderRadius = "10px";
    flyer.style.top = "50%";
    flyer.style.left = "50%";
    flyer.style.transition = "all 0.8s ease-in-out";
    flyer.style.zIndex = 1000;
    document.body.appendChild(flyer);

    const cartRect = cartRef.current.getBoundingClientRect();

    setTimeout(() => {
      flyer.style.top = cartRect.top + "px";
      flyer.style.left = cartRect.left + "px";
      flyer.style.width = "40px";
      flyer.style.height = "40px";
      flyer.style.opacity = 0;
    }, 10);

    setTimeout(() => {
      document.body.removeChild(flyer);
    }, 800);
  };

  const categories = ["All", ...Array.from(new Set(menu.map(item => item.category)))];
const fetchStaff = async () => {
  try {
    const res = await api.get("/auth/staff");
    // only counters
    const counters = res.data.filter(u => u.role === "counter");
    setStaffList(counters);

    // default select first
    if (counters.length > 0) {
      setSelectedStaff("");
    }
  } catch (err) {
    console.log("Failed to load staff");
  }
};
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: 220,
        background: darkMode ? "#1b1b1b" : "#3e2723",
        color: "white",
        padding: 20,
        transition: "all 0.3s"
      }}>
  <div style={{ marginBottom: 30, textAlign: "center" }}>
  {isLoggedIn ? (
    <h2 style={{ marginBottom: 40 }}>☕ Counter Panel</h2>
  ) : (
    <img
      src="/logo.png"
      alt="Logo"
      style={{
        width: 100,
        filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.3))",
      }}
    />
  )}
</div>
        <p
  style={{ cursor: "pointer", marginBottom: 15 }}
  onClick={() => navigate("/menu")}
>
   🍽 Menu
</p>

{isLoggedIn && (
  <p
    style={{ cursor: "pointer", marginBottom: 15 }}
    onClick={() => navigate("/staff/orders")}
  >
    🍳 Orders
  </p>
)}
        <p style={{ cursor: "pointer", marginBottom: 15 }} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </p>
        <p
  style={{ cursor: "pointer" }}
  onClick={() => {
    if (isLoggedIn) {
      logout();
    } else {
      window.location.href = "/login";
    }
  }}
>
  {isLoggedIn ? "Logout" : "Login"}
</p>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: 30,
        background: darkMode ? "#121212" : "#f7f3ef",
        transition: "all 0.3s"
      }}>
  {/* Hero */}
<div
  style={{
    background: "linear-gradient(135deg, #6f4e37, #a67b5b)",
    padding: "12px 20px", 
    height: 75,
    borderRadius: 12,     
    marginBottom: 15,     
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <img
    src="/logo.png"
    alt="Logo"
    style={{
      width: "auto", 
      height: 300,
      maxWidth: "100%",
      filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))",
    }}
  />
</div>
{isLoggedIn &&(
<div style={{ marginTop: 15 }}>
  <label style={{ fontWeight: "bold" }}>Select Counter     </label>

  <select
    value={selectedStaff}
    onChange={(e) => setSelectedStaff(e.target.value)}
    style={{
      width: "25%",
      padding: 10,
      borderRadius: 8,
      marginTop: 5,
      height: 35
    }}
  >
    <option value= "">--Select Staff--</option>
    {staffList.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>
</div>
)}
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: 12,
                border: selectedCategory === cat ? "2px solid #6f4e37" : "1px solid #ddd",
                background: selectedCategory === cat ? "#6f4e37" : "#fff",
                color: selectedCategory === cat ? "#fff" : "#3e2723",
                cursor: "pointer",
                transition: "0.3s"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu + Cart */}
        <div style={{ display: "flex", gap: 40 }}>
          {/* Menu Grid */}
          <div style={{ flex: 2, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {menu.filter(item => selectedCategory === "All" || item.category === selectedCategory).map(item => (
              <div
                key={item.id}
                style={menuCardStyle}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-6px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
               >
                <div
    style={{
      position: "absolute",
      top: 10,
      right: 10,
      width: 10,
      height: 10,
      borderRadius: "50%",
      backgroundColor:
        item.foodType === "Veg"
          ? "green"
          : item.foodType === "Non-Veg"
          ? "red"
          : "orange",
    }}
  />
                {item.image && (
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                    alt={item.name}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 10, transition: "transform 0.3s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                )}
                <h4 style={{ color: darkMode ? "#fff" : "#000" }}>{item.name}</h4>
{item.discount > 0 && (
  <p style={{ textDecoration: "line-through", fontSize: 12, color: "#888" }}>
    OMR {item.price.toFixed(2)}
  </p>
)}

<p style={{ color: darkMode ? "#ddd" : "#000", fontWeight: "bold" }}>
  OMR {item.price.toFixed(2)}
</p>

{item.discount > 0 && (
  <p style={{ fontSize: 11, color: "green" }}>
    {item.discount}% OFF
  </p>
)}                <p style={{ fontSize: 12, color: darkMode ? "#ccc" : "#555" }}>{item.category}</p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={role !== "counter"}
                  style={{
                    marginTop: 10,
                    padding: 8,
                    width: "100%",
                    background: role === "counter" ? "#6f4e37" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: role === "counter" ? "pointer" : "not-allowed",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Cart Section */}
          <div ref={cartRef} style={{
            flex: 1,
            background: darkMode ? "rgba(62,39,35,0.85)" : "white",
            backdropFilter: "blur(10px)",
            padding: 20,
            borderRadius: 15,
            boxShadow: darkMode ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.08)",
            transition: "all 0.3s"
          }}>
            <h3 style={{ color: darkMode ? "#fff" : "#000" }}>🛒 Cart</h3>
            {!cart.length ? <p style={{ color: darkMode ? "#ccc" : "#555" }}>No items in cart</p> : (
              <>
                {cart.map(item => (
  <div
    key={item.id}
    style={{
      marginBottom: 10,
      padding: 10,
      borderRadius: 10,
      background: darkMode ? "#3e2723" : "#fff",
      color: darkMode ? "#fff" : "#000",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    {/* Item Info */}
    <div>
      <strong>{item.name}</strong>
      <div style={{ fontSize: 12 }}>
        OMR {item.price.toFixed(2)}
      </div>
    </div>

    {/* Qty Controls */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      
      <button
        onClick={() => decreaseQty(item.id)}
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "none",
          background: "#c0392b",
          color: "white",
          cursor: "pointer"
        }}
      >
        -
      </button>

      <span style={{ fontWeight: "bold" }}>
        {item.qty}
      </span>

      <button
        onClick={() => increaseQty(item.id)}
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "none",
          background: "#27ae60",
          color: "white",
          cursor: "pointer"
        }}
      >
        +
      </button>

      <button
        onClick={() => removeItem(item.id)}
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "none",
          background: "#555",
          color: "white",
          cursor: "pointer"
        }}
      >
        🗑
      </button>

    </div>
  </div>
))}

                <div style={{ marginTop: 15, padding: 15, background: darkMode ? "#5a3e30" : "#fff8f0", borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <label style={{ fontWeight: 600, color: darkMode ? "#fff" : "#6f4e37" }}>Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      onBlur={() => setDiscount(Math.max(0, Math.min(100, discount)))}
                      style={{ width: 80, padding: 8, borderRadius: 8, border: "1px solid #ddd", textAlign: "center", fontWeight: "bold", outline: "none" }}
                    />
                  </div>

          

                  <p style={{ color: darkMode ? "#ddd" : "#000" }}>Subtotal (Excl. VAT): OMR {displaySubtotal.toFixed(2)}</p>
                  <p style={{ color: darkMode ? "#ddd" : "#000" }}>VAT (5%): OMR {displayVAT.toFixed(2)}</p>
                  <div style={{ marginTop: 10, padding: 12, background: "#6f4e37", borderRadius: 12, textAlign: "center", color: "white", fontWeight: "bold", fontSize: 20 }}>
                    Total: OMR {displayTotal.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  style={{ marginTop: 15, width: "100%", padding: 12, background: "#d9a441", color: "#3e2723", fontWeight: "bold", border: "none", borderRadius: 12, cursor: "pointer" }}
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}