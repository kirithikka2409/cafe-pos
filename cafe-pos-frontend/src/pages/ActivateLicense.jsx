import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ActivateLicense() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const activate = async () => {
    try {
      await api.post("/license/activate", { licenseKey: key });
      navigate("/login"); // or dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Activation failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h2>🔑 Activate License</h2>

      <input
        placeholder="Enter License Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        style={{ padding: 10, width: 250 }}
      />

      <br /><br />

      <button onClick={activate}>Activate</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}