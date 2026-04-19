import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import MenuAdmin from "./pages/MenuAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import KOTPrint from "./pages/KOTPrint";
import Receipt from "./pages/Receipt";
import Order  from "./pages/StaffOrders";

function App() {
  return (
    <BrowserRouter>
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

  <Route
    path="/staff/orders"
    element={
        <Order />
      
    }
  />

  <Route
    path="/kot-print/:id"
    element={
        <KOTPrint />
    }
  />

  <Route path="*" element={<Login />} />
  <Route path="/receipt/:id" element={<Receipt />} />

</Routes>

    </BrowserRouter>
  );
}

export default App;