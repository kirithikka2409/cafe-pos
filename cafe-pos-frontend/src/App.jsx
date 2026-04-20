import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";

// pages
import Login from "./pages/Login";
import ActivateLicense from "./pages/ActivateLicense";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import MenuAdmin from "./pages/MenuAdmin";
import Order from "./pages/StaffOrders";
import Receipt from "./pages/Receipt";
import KOTPrint from "./pages/KOTPrint";

// guards
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [loading, setLoading] = useState(true);
  const [licenseValid, setLicenseValid] = useState(false);

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const res = await api.get("/license/status");
        setLicenseValid(res.data.valid);
      } catch (err) {
        setLicenseValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkLicense();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* LICENSE */}
        {!licenseValid ? (
          <>
            <Route path="/activate-license" element={<ActivateLicense />} />
            <Route path="*" element={<Navigate to="/activate-license" />} />
          </>
        ) : (
          <>
            {/* AUTH */}
            <Route path="/login" element={<Login />} />

            {/* PROTECTED APP ROUTES */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={["counter"]}>
                  <Menu />
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
              path="/admin/menu"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MenuAdmin />
                </ProtectedRoute>
              }
            />

            <Route path="/staff/orders" element={<Order />} />
            <Route path="/kot-print/:id" element={<KOTPrint />} />
            <Route path="/receipt/:id" element={<Receipt />} />

            {/* DEFAULT */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default App;