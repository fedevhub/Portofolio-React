import { useEffect, useState } from "react";
import "../styles/Splash-screen.css";

export default function SplashScreen() {
    const [hidden, setHidden] = useState(false);
    const [text, setText] = useState("Welcome to Fitri Portfolio");

    const texts = [
        "Welcome to Fitri Portfolio",
        "Frontend Developer",
        "React • Supabase • UI Design",
        "Clean & Modern Web Experience"
    ];

    // typing effect
    useEffect(() => {
        let i = 0;
        let char = 0;
        let deleting = false;

        function type() {
            const current = texts[i];

            if (!deleting) {
                char++;
            } else {
                char--;
            }

            setText(current.substring(0, char));

            if (!deleting && char === current.length) {
                setTimeout(() => (deleting = true), 1200);
            }

            if (deleting && char === 0) {
                deleting = false;
                i = (i + 1) % texts.length;
            }

            setTimeout(type, deleting ? 50 : 90);
        }

        type();
    }, []);

    // auto hide splash
    useEffect(() => {
        const timer = setTimeout(() => {
            setHidden(true);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    if (hidden) return null;

    return (
        <div className="splash">
            {/* glow background */}
            <div className="glow-bg"></div>

            {/* particles */}
            <div className="particles">
                {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i}></span>
                ))}
            </div>

            {/* content */}
            <div className="content">
                <h1 className="title">Fitri Portfolio</h1>
                <p className="subtitle">Creative Developer</p>

                {/* spinner loader */}
                <div className="spinner">
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                </div>

                {/* typing text */}
                <p className="typing">{text}</p>
            </div>
        </div>
    );
}