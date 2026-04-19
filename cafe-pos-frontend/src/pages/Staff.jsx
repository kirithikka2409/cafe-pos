import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../components/AdminLayout";


export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "counter",
  });

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await api.get("/auth/staff"); // ✅ FIXED
      setStaffList(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add staff
  const addStaff = async () => {
  if (!form.name || !form.username) {
    return alert("Name & Username required");
  }

  try {
    if (editingId) {
      // ✅ UPDATE
      await api.put(`/auth/staff/${editingId}`, {
        name: form.name,
        username: form.username,
        role: form.role,
      });
      alert("Staff updated");
    } else {
      // ✅ CREATE
      if (!form.password) return alert("Password required");
      await api.post("/auth/create-user", form);
      alert("Staff added");
    }

    setForm({ name: "", username: "", password: "", role: "counter" });
    setEditingId(null);
    fetchStaff();
  } catch (err) {
    console.log(err);
    alert("Action failed");
  }
};
  // Delete staff
  const deleteStaff = async (id) => {
    if (!window.confirm("Delete this staff?")) return;

    try {
      await api.delete(`/auth/staff/${id}`); // ✅ FIXED
      fetchStaff();
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: 20 }}>
        <h2>👨‍💼 Manage Counter Staff</h2>

        {/* Add Staff Form */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={addStaff}
            style={{
              background: "#6f4e37",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: 8,
            }}
          >
{editingId ? "Update Staff" : "Add Staff"}          </button>
        </div>

        {/* Staff List */}
        <h3>Staff List</h3>

        <div style={{ display: "grid", gap: 10 }}>
          {staffList.map((s) => (
  <div
    key={s.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: 10,
      border: "1px solid #ddd",
      borderRadius: 8,
    }}
  >
    <div>
      <b>{s.name}</b> — {s.username} ({s.role})
    </div>

    {/* ✅ Hide buttons for admin */}
    {s.role !== "admin" && (
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => {
            setEditingId(s.id);
            setForm({
              name: s.name,
              username: s.username,
              password: "",
              role: s.role,
            });
          }}
          style={{
            background: "blue",
            color: "white",
            border: "none",
            padding: "5px 10px",
          }}
        >
          Edit
        </button>

        <button
          onClick={() => deleteStaff(s.id)}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
          }}
        >
          Delete
        </button>
      </div>
    )}
  </div>
))}
        </div>
      </div>
    </AdminLayout>
  );
}