import { useAuth } from "../context/AuthContext";

export default function Admin() {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: 40 }}>
            <h1>Admin Dashboard</h1>

            <p>Welcome, {user?.username}</p>

            <button onClick={logout}>Logout</button>
        </div>
    );
}