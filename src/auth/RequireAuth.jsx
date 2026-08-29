import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function RequireAuth({ children, adminOnly = false }) {
  const { session, profile, loading, isSupabaseConfigured } = useAuth();

  if (!isSupabaseConfigured) return children;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }
  if (!session) return <Navigate to="/" replace />;
  if (adminOnly && profile?.role !== "club_admin") return <Navigate to="/home-jugador" replace />;
  return children;
}
