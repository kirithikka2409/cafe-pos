import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";

import Login from "./pages/Login";
import Menu from "./pages/Menu";
import MenuAdmin from "./pages/MenuAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import KOTPrint from "./pages/KOTPrint";
import Receipt from "./pages/Receipt";
import Order from "./pages/StaffOrders";
import ActivateLicense from "./pages/ActivateLicense";

function LicenseGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [licensed, setLicensed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const res = await api.get("/license/status");

        if (res.data.active) {
          setLicensed(true);
        } else {
          navigate("/activate-license");
        }

      } catch (err) {
        navigate("/activate-license");
      } finally {
        setLoading(false);
      }
    };

    checkLicense();
  }, [navigate]);

  if (loading) return <h3>Checking License...</h3>;

  return licensed ? children : null;
}

function App() {
  return (
    <BrowserRouter>
      <LicenseGate>
        <Routes>

          <Route path="/login" element={<Login />} />

          {/* Counter */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute allowedRoles={["counter"]}>
                <Menu />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MenuAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            }
          />

          <Route path="/staff/orders" element={<Order />} />
          <Route path="/kot-print/:id" element={<KOTPrint />} />
          <Route path="/receipt/:id" element={<Receipt />} />
          <Route path="/activate-license" element={<ActivateLicense />} />

          <Route path="*" element={<Login />} />

        </Routes>
      </LicenseGate>
    </BrowserRouter>
  );
}

export default App;