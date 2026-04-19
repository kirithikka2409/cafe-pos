import { useState, useEffect } from "react";
import { logoutUser } from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages/MenuAdmin.css";

 function AdminLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className={`menu-admin ${darkMode ? "dark-mode" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <h2>☕ Admin Panel </h2>

        <p
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </p>

        <p
          className={location.pathname === "/admin/staff" ? "active" : ""}
          onClick={() => navigate("/admin/staff")}
        >
          Staff
        </p>


        <p
          className={location.pathname === "/menu-admin" ? "active" : ""}
          onClick={() => navigate("/admin/menu")}
        >
          Menu
        </p>

        
        <p onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </p>

        <p onClick={handleLogout}>Logout</p>

        <button
          className="collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? "➡" : "⬅"}
        </button>
      </div>

      <div className="main-content">{children}</div>
    </div>
  );
}

export default AdminLayout;