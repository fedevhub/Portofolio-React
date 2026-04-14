import { useEffect, useState } from "react";
import "../styles/Splash-screen.css";

export default function SplashScreen() {
    const [hidden, setHidden] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [text, setText] = useState("Welcome to Fitri Portfolio");

    const [texts] = useState([
        "Welcome to My Portfolio",
        "Frontend Developer",
        "React • Supabase • UI Design",
        "Clean & Modern Web Experience"
    ]);

    // typing effect
    useEffect(() => {
        let i = 0;
        let char = 0;
        let deleting = false;
        let typingTimer;
        let pauseTimer;
        let isCancelled = false;

        function type() {
            if (isCancelled) {
                return;
            }

            const current = texts[i];

            if (!deleting) {
                char++;
            } else {
                char--;
            }

            setText(current.substring(0, char));

            if (!deleting && char === current.length) {
                pauseTimer = window.setTimeout(() => {
                    deleting = true;
                    type();
                }, 1200);
                return;
            }

            if (deleting && char === 0) {
                deleting = false;
                i = (i + 1) % texts.length;
            }

            typingTimer = window.setTimeout(type, deleting ? 50 : 90);
        }

        type();

        return () => {
            isCancelled = true;
            window.clearTimeout(typingTimer);
            window.clearTimeout(pauseTimer);
        };
    }, [texts]);

    // auto hide splash
    useEffect(() => {
        document.body.dataset.splash = "active";

        const leaveTimer = window.setTimeout(() => {
            setIsLeaving(true);
        }, 2200);

        const timer = window.setTimeout(() => {
            document.body.dataset.splash = "done";
            window.dispatchEvent(new Event("splashscreen:complete"));
            setHidden(true);
        }, 2850);

        return () => {
            window.clearTimeout(leaveTimer);
            window.clearTimeout(timer);

            if (document.body.dataset.splash !== "done") {
                delete document.body.dataset.splash;
            }
        };
    }, []);

    if (hidden) return null;

    return (
        <div className={`splash ${isLeaving ? "is-leaving" : ""}`}>
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
                <p className="subtitle">Student Developer</p>

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
