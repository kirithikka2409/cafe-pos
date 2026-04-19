import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function Receipt() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  // 1️⃣ Fetch Order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order || res.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      }
    };

    fetchOrder();
  }, [id]);

  // 2️⃣ Auto Print AFTER order loads
  useEffect(() => {
    if (!order) return;

    const timer = setTimeout(() => {
      window.print();
    }, 800); // more stable delay

    return () => clearTimeout(timer);
  }, [order]);

  // 3️⃣ Close after print
  useEffect(() => {
    const handleAfterPrint = () => {
      window.close();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // 4️⃣ Print CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page {
          size: 80mm auto;
          margin: 0;
        }

        body {
          margin: 0;
        }

        body * {
          visibility: hidden;
        }

        #receipt, #receipt * {
          visibility: visible;
        }

        #receipt {
          position: absolute;
          left: 0;
          top: 0;
          width: 80mm;
          font-size: 12px;
        }

        .no-print {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  if (!order) return <p>Loading receipt...</p>;

  // 🔥 SAFE items parsing (VERY IMPORTANT)
  let items = [];
  try {
    items = Array.isArray(order.items)
      ? order.items
      : JSON.parse(order.items || "[]");
  } catch {
    items = [];
  }

  return (
    <div
      id="receipt"
      style={{
        width: "80mm",
        margin: "0 auto",
        fontFamily: "monospace",
        fontSize: "12px",
        padding: "5px",
      }}
    >
      <div style={{ textAlign: "center" }}>
<img
      src="/logo.png"
      alt="Logo"
      style={{
        width: 140,
        height: "auto",
        filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.3))"
      }}
    />

    <div style={{ fontSize: 12, fontWeight: "normal"}}> VAT OM1100494953</div>
    <div style={{ font: 10 }}> CR NO: 1608544  |  GSM: 9670858</div>
    <div style={{ fontSize: 10 }}>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Order Type: {order.orderType || "Take Away"}</span>
    <span>Receipt #: {order.id}</span>
  </div>

  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
    <span>
      {new Date(order.createdAt).toLocaleTimeString()}
    </span>
  </div>

  <hr />
</div>
<div style={{ fontSize: 10, marginTop: 5 }}>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Waiter: {order.waiter || "N/A"}</span>
    <span>Order: {order.id}</span>
  </div>
</div>

<hr />
  <div style={{ display: "flex", justifyContent: "space-between" }}>

      <span>Item, Qty  & Price</span>  
      <span>Amount</span>
      </div>
        <hr />
      </div>

      {items.map((item, i) => (
  <div key={i} style={{ marginBottom: 4, fontSize: 12 }}>
    
    {/* Item name full row */}
    <div style={{ fontWeight: "bold" }}>
      {item.name}
    </div>

    {/* Qty x Price + Amount row */}
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      
      {/* LEFT */}
      <span>
        {item.qty} x {Number(item.price).toFixed(3)}
      </span>

      {/* RIGHT */}
      <span>
        {(Number(item.qty) * Number(item.price)).toFixed(3)}
      </span>

    </div>
  </div>
))}

      <hr />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span>
        <span>{Number(order.subtotal).toFixed(3)}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>VAT</span>
        <span>{Number(order.vat).toFixed(3)}</span>
      </div>

      {order.discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Discount</span>
          <span>{order.discount}%</span>
        </div>
      )}

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
        }}
      >
        <span>Total</span>
        <span>{Number(order.total).toFixed(3)} OMR</span>
      </div>

      <div style={{ textAlign: "center", marginTop: 10 }}>
  <p>Thank You ☕</p>
</div>
{/*}
<div style={{ fontSize: 10, marginTop: 10 }}>
  <div>
    Prepared By: {order.preparedBy || "Counter"}
  </div>
  <div>
    Printed By: {localStorage.getItem("userName") || "Admin"}
  </div>
</div>*/}

      <button
        className="no-print"
        style={{ marginTop: 10, width: "100%", padding: 8 }}
        onClick={() => window.print()}
      >
        🖨 Print Receipt
      </button>
    </div>
  );
}