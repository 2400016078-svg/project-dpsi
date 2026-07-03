import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { Spinner } from "./UI";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner text="Memverifikasi sesi..." /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role === "siswa" ? "siswa" : user.role === "guru_bk" ? "bk" : user.role === "orang_tua" ? "orang-tua" : "admin"}/dashboard`} replace />;
  return children;
}
