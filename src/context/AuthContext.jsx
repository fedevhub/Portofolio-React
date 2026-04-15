import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../assets/supabase-client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function syncSession() {
            const { data } = await supabase.auth.getUser();

            if (!active) return;

            if (data.user) {
                setUser(data.user);

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .maybeSingle();

                if (!active) return;

                setRole(profile?.role);
            } else {
                setUser(null);
                setRole(null);
            }

            setLoading(false);
        }

        syncSession();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            syncSession();
        });

        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, []);

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
