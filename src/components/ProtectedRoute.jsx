import { Navigate } from "react-router-dom";
import { clearStoredAuth } from "../config/api";

function ProtectedRoute({ children }) {
  let token = "";
  let user = "";

  try {
    token = localStorage.getItem("token") || "";
    user = localStorage.getItem("user") || "";
  } catch (err) {
    console.log("ProtectedRoute storage read error:", err);
  }

  if (!token || !user) {
    clearStoredAuth();

    return <Navigate to="/login" replace />;
  }

  try {
    JSON.parse(user);
  } catch {
    clearStoredAuth();

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
