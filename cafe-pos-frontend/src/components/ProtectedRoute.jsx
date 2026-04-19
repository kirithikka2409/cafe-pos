import { Navigate } from "react-router-dom";
import { isTokenValid, getUserRole } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const valid = isTokenValid();
  const role = getUserRole();

  if (!valid) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
}