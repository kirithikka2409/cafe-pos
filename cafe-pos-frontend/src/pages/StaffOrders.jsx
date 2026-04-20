import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const navigate = useNavigate();
  const previousOrdersRef = useRef([]);

  console.log("Render orders", orders);

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders([...res.data]);
      previousOrdersRef.current = res.data;
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // ================= PAY ORDER =================
  const handlePayment = async (orderId, method) => {
    try {
      const res = await api.put(`/orders/${orderId}/pay`, {
        paymentMethod: method,
      });

      console.log("PAY SUCCESS:", res.data);

            fetchOrders();


      window.open(`/receipt/${orderId}`, "_blank");

    } catch (err) {
      alert("Payment failed");
    }
  };

    // ================= CANCEL ORDER =================
  const cancelOrder = async (orderId) => {
    const reason = prompt("Enter cancel reason:");
    if (!reason) return;

    try {
      const res = await api.put(`/orders/${orderId}/cancel`, { reason });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? res.data.order : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // ================= DASHBOARD STATS =================
// ================= DASHBOARD STATS =================
const today = new Date().toDateString();

// 👉 filter only today's orders
const todaysOrdersList = orders.filter(
  (o) => new Date(o.createdAt).toDateString() === today
);

// ✅ Today's Total Orders
const totalOrders = todaysOrdersList.length;

// ✅ Today's Pending Orders
const pendingOrders = todaysOrdersList.filter(
  (o) => o.status !== "cancelled" && o.paymentStatus !== "paid"
).length;

// ✅ Today's Sales
const todaySales = todaysOrdersList
  .filter((o) => o.paymentStatus === "paid")
  .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ================= SIDEBAR ================= */}
      <div
        style={{
          width: 220,
          background: darkMode ? "#1b1b1b" : "#3e2723",
          color: "white",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 40 }}>☕ Counter Panel</h2>

        <p
          style={{ cursor: "pointer", marginBottom: 15 }}
          onClick={() => navigate("/menu")}
        >
          🍽 Menu
        </p>

        <p
          style={{ cursor: "pointer", marginBottom: 15 }}
          onClick={() => navigate("/staff-orders")}
        >
          💳 Orders
        </p>

        <p
          style={{ cursor: "pointer", marginBottom: 15 }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </p>

        <p
          style={{ cursor: "pointer" }}
          onClick={logout}
        >
          {isLoggedIn ? "Logout" : "Login"}
        </p>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        style={{
          flex: 1,
          padding: 30,
          background: darkMode ? "#121212" : "#f5f5f5",
        }}
      >
<div style={{
  display: "flex",
  gap: 20,
  marginBottom: 25,
  flexWrap: "wrap"
}}>

  {/* Total Orders */}
  <div style={{
    flex: 1,
    width: 100,
    background: "#fff",
    padding: 5,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  }}>
    <h4 style = {{ fontSize: 14 }}>Total Orders</h4>
    <h2 style = {{ fontSize: 20 }}>{totalOrders}</h2>
  </div>

  {/* Pending Orders */}
  <div style={{
    flex: 1,
    width: 100,
    background: "#fff",
    padding: 5,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  }}>
    <h4 style = {{ fontSize: 14 }}>Pending Orders</h4>
    <h2 style = {{ fontSize: 20 }}>{pendingOrders}</h2>
  </div>

  {/* Today Sales */}
  <div style={{
    flex: 1,
    width: 100,
    background: "#fff",
    padding: 5,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(111, 48, 48, 0.05)"
  }}>
    <h4 style = {{ fontSize: 14 }}> Today Sales</h4>
    <h2 style = {{ fontSize: 20 }}>OMR {todaySales.toFixed(3)}</h2>
  </div>

</div>

        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: order.status === "cancelled" ? "#ffe6e6" : "#fff",
              padding: 20,
              marginBottom: 15,
              borderRadius: 10,
              opacity: order.status === "cancelled" ? 0.6 : 1,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h4>Order #{order.id}</h4>

            <p>
              <strong>Total:</strong> OMR {Number(order.total).toFixed(3)}
            </p>

            <p>
              <strong>Payment Status:</strong>{" "}
              {order.paymentStatus === "paid" ? "✅ Paid" : "❌ Unpaid"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {order.status === "cancelled"
                ? "❌ Cancelled"
                : order.status}
            </p>

            <p style={{ fontSize: 12, color: "#888" }}>
              {new Date(order.createdAt).toLocaleString()}
            </p>

            {/* ITEMS */}
            <div style={{ marginTop: 10 }}>
              <strong>Items:</strong>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.qty} × {item.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* ACTIONS */}
            {order.paymentStatus === "unpaid" &&
              order.status !== "cancelled" && (
                <div style={{ marginTop: 15, display: "flex", gap: 10 }}>

                  <button
                    onClick={() => handlePayment(order.id, "cash")}
                    style={{
                      padding: "8px 12px",
                      background: "#27ae60",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    💵 Pay Cash
                  </button>

                  <button
                    onClick={() => handlePayment(order.id, "card")}
                    style={{
                      padding: "8px 12px",
                      background: "#2980b9",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    💳 Pay Card
                  </button>

                  <button
                    onClick={() => cancelOrder(order.id)}
                    style={{
                      padding: "8px 12px",
                      background: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    ❌ Cancel
                  </button>

                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}