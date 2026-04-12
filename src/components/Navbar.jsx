import "../styles/Navbar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {

    const location = useLocation();
    const navigate = useNavigate();
    const { role, logout } = useAuth();

    const isAdmin =
        role === "admin" && location.pathname.startsWith("/admin");

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top site-nav">
            <div className="container">
                <a className="navbar-brand">PORTFOLIO</a>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">

                        <li className="nav-item">
                            <a className="nav-link" href="#home">Home</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#about">About</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#skills">Skills</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#project">Project</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#contact">Contact</a>
                        </li>

                        {isAdmin && (
                            <li className="nav-item">
                                <button
                                    className="nav-link btn text-danger"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        )}

                    </ul>
                </div>
            </div>
        </nav>
    );
}