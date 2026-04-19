import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";

export default function KOT() {
  const [orders, setOrders] = useState([]);
  const [lastCount, setLastCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // ✅ MUST be outside functions
  const audioRef = useRef(null);

  // 🔊 ENABLE SOUND (user click required)
  const enableSound = async () => {
    try {
      const audio = new Audio("/notification.mp3");

      // unlock audio
      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      audioRef.current = audio;
      setSoundEnabled(true);

      alert("🔊 Sound Enabled");
    } catch (err) {
      console.log("Sound blocked:", err);
      alert("❌ Browser blocked sound. Try again.");
    }
  };

  const fetchKOT = useCallback(async () => {
    try {
      const res = await api.get("/kot");

      // 🔔 play sound only if new order arrives
      if (res.data.length > lastCount && soundEnabled && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log("Play blocked:", err);
        });
      }

      const pendingOrders = res.data
        .filter(o => o.status !== "ready")
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(pendingOrders);
      setLastCount(res.data.length);

    } catch (err) {
      console.error(err);
    }
  }, [lastCount, soundEnabled]);

  useEffect(() => {
    fetchKOT();
    const interval = setInterval(fetchKOT, 2000);

    return () => clearInterval(interval);
  }, [fetchKOT]);

  const markReady = async (id) => {
    try {
      await api.put(`/orders/${id}/status`, { status: "ready" });
      fetchKOT();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      color: "white",
      padding: 20,
    }}>
      <h1 style={{ textAlign: "center" }}>🍳 Kitchen Display</h1>

      {/* 🔊 SOUND BUTTON */}
      <div style={{ textAlign: "center", margin: 20 }}>
        <button
          onClick={enableSound}
          style={{
            padding: "12px 20px",
            fontSize: 16,
            background: soundEnabled ? "gray" : "green",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          {soundEnabled ? "🔊 Sound Enabled" : "🔊 Enable Sound Alerts"}
        </button>
      </div>

      {/* ORDERS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20,
      }}>
        {orders.map(order => {
          const items = Array.isArray(order.items)
            ? order.items
            : JSON.parse(order.items || "[]");

          const minutes = Math.floor(
            (Date.now() - new Date(order.createdAt)) / 60000
          );

          return (
            <div key={order.id} style={{
              padding: 20,
              borderRadius: 12,
              background: minutes > 10 ? "#c0392b" : "#e67e22",
            }}>
              <h2>Order #{order.id}</h2>

              <p>⏱ {minutes} min ago</p>

              <hr />

              {items.map((item, i) => (
                <div key={i}>
                  {item.qty} × {item.name}
                </div>
              ))}

              <button
                onClick={() => markReady(order.id)}
                style={{
                  marginTop: 15,
                  width: "100%",
                  padding: 10,
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                }}
              >
                ✅ Ready
              </button>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <h2>No Pending Orders</h2>
        </div>
      )}
    </div>
  );
}