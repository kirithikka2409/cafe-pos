import { useState, useEffect } from "react";
import api from "../api/axios";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { isTokenValid, getUserRole } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);

    const savedUsername = localStorage.getItem("rememberUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      if (remember) {
        localStorage.setItem("rememberUsername", username);
      } else {
        localStorage.removeItem("rememberUsername");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href =
        res.data.user.role === "admin" ? "/admin/menu" : "/menu";
    } catch (err) {
      setError("Invalid username or password");
    }

    setLoading(false);
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  
useEffect(() => {
  if (isTokenValid()) {
    const role = getUserRole();
    navigate(role === "admin" ? "/admin/menu" : "/menu");
  }
}, [navigate]);

  return (
    <div className={`login-container ${darkMode ? "dark" : ""}`}>
      <div className="login-card">

        <div className="login-header">
          <h2>☕ Café POS Login</h2>
          <button className="theme-btn" onClick={toggleTheme}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="remember-row">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              Remember me
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}