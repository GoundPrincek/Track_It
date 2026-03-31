import { Navigate } from "react-router-dom";

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
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (err) {
      console.log("ProtectedRoute storage clear error:", err);
    }

    return <Navigate to="/login" replace />;
  }

  try {
    JSON.parse(user);
  } catch (err) {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (clearErr) {
      console.log("ProtectedRoute invalid user clear error:", clearErr);
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;