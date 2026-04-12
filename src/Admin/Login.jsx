import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const { error } = await login(email, password);

        if (error) {
            alert("Login gagal");
            return;
        }

        // redirect nanti akan dicek ulang oleh ProtectedRoute
        navigate("/admin/dashboard");
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Admin Login</h2>

            <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
        </form>
    );
}