import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await login(email, password);
        if (error) {
            alert("Login gagal");
            return;
        }
        navigate("/admin/dashboard");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-orb login-orb-left"></div>
            <div className="login-orb login-orb-right"></div>

            <div className="login-card" data-aos="zoom-in-up" data-aos-duration="700">
                <div className="login-header" data-aos="fade-up" data-aos-delay="80">
                    <h3>Welcome Back</h3>
                    <p>Login ke panel admin</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="input-group" data-aos="fade-up" data-aos-delay="140">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group password-group" data-aos="fade-up" data-aos-delay="220">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="300">
                        <button type="submit" className="login-btn">Login</button>
                    </div>
                </form>
                <div className="login-footer" data-aos="fade-up" data-aos-delay="360">
                    <small>Hanya untuk admin yang berwenang</small>
                </div>
            </div>
        </div>
    );
}
