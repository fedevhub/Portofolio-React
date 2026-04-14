import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "../styles/login.css";

export default function ProtectedRoute({ children }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-loading-screen">
                <div className="auth-loading-card" data-aos="zoom-in-up">
                    <div className="auth-loading-spinner"></div>
                    <h4>Preparing Admin Area</h4>
                    <p>Checking your session and loading the dashboard.</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/admin" />;

    if (role !== "admin") return <Navigate to="/" />;

    return children;
}
