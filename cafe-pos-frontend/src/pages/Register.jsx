import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("⚠️ All fields are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/create-user", {
        username,
        password,
      });

      alert("✅ Counter user created successfully");
      setUsername("");
      setPassword("");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Register Counter User</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: 8, width: "100%", marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8, width: "100%", marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}