import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../assets/supabase-client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            getSession();
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const getSession = async () => {
        const { data } = await supabase.auth.getUser();

        if (data.user) {
            setUser(data.user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .maybeSingle();

            setRole(profile?.role);
        } else {
            setUser(null);
            setRole(null);
        }

        setLoading(false);
    };

    const login = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);