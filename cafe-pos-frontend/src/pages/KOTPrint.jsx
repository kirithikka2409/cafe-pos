import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function KOTPrint() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order || res.data);
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order) return;

    const timer = setTimeout(() => {
      window.print();
      if (window.opener){
      window.close();
    }
    }, 600);

    return () => clearTimeout(timer);
  }, [order]);

  if (!order) return <p>Loading...</p>;

  return (
    <>
      {/* PRINT CSS */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          #kot, #kot * {
            visibility: visible;
          }

          #kot {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5px;
            font-family: monospace;
            font-size: 12px;
          }
        }
      `}</style>

      {/* KOT CONTENT */}
      <div id="kot">
       <div style={{ textAlign: "center" }}>
  <h3>🍳 KOT - BEANSNBITES</h3>
  <p>Order # {order.id}</p>

  {/* ✅ ADD THIS */}
  {order.staff?.name && <p>Staff: {order.staff.name}</p>}

  <p>Date & Time: {new Date(order.createdAt).toLocaleString()}</p>
</div>

        <hr />

        {order.items.map((item, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 14 }}>
              {item.qty} x {item.name}
            </div>
          </div>
        ))}

        <hr />

        <div style={{ textAlign: "center", fontSize: 12 }}>
          🔥 SEND TO KITCHEN
        </div>
      </div>
    </>
  );
}