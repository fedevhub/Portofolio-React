import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Home.css";
import { buildSectionHref } from "../utils/sectionNavigation";

export default function Home() {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(
        () => document.body.dataset.splash === "done"
    );

    useEffect(() => {
        if (document.body.dataset.splash === "done") {
            const frame = window.requestAnimationFrame(() => {
                setIsVisible(true);
            });

            return () => window.cancelAnimationFrame(frame);
        }

        const handleSplashComplete = () => setIsVisible(true);
        const fallbackTimer = window.setTimeout(handleSplashComplete, 3200);

        window.addEventListener("splashscreen:complete", handleSplashComplete);

        return () => {
            window.clearTimeout(fallbackTimer);
            window.removeEventListener("splashscreen:complete", handleSplashComplete);
        };
    }, []);

    return (
        <section id="home" className="hero-section d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center text-center">
                    <div className="col-lg-8">
                        <div className={`hero-content ${isVisible ? "is-visible" : ""}`}>
                            <h4
                                className="hero-eyebrow hero-reveal"
                                data-aos="fade-up"
                                style={{ "--hero-delay": "0.08s" }}
                            >
                                Hello!, It's Me
                            </h4>

                            <h1
                                className="hero-title hero-reveal"
                                data-aos="zoom-in"
                                data-aos-delay="100"
                                style={{ "--hero-delay": "0.18s" }}
                            >
                                Fitri <span className="hero-title-accent">Rachmania</span>
                            </h1>

                            <h3
                                className="hero-role hero-reveal"
                                data-aos="fade-up"
                                data-aos-delay="180"
                                style={{ "--hero-delay": "0.28s" }}
                            >
                                And I am a software engineering student
                            </h3>

                            <p
                                className="hero-text mx-auto hero-reveal"
                                data-aos="fade-up"
                                data-aos-delay="260"
                                style={{ "--hero-delay": "0.38s" }}
                            >
                                Pelajar yang fokus mempelajari pengembangan web modern dengan spesialisasi front-end. Terus 
                                mengasah kemampuan membuat tampilan web yang bersih, responsif, dan user-friendly melalui 
                                proyek latihan.
                            </p>

                            <div
                                className="d-flex flex-wrap gap-3 justify-content-center hero-actions hero-reveal"
                                data-aos="zoom-in-up"
                                data-aos-delay="340"
                                style={{ "--hero-delay": "0.5s" }}
                            >
                                <Link to={buildSectionHref(location.pathname, "about")} className="btn btn-primary-modern">
                                    Learn More
                                </Link>

                                <a href="https://drive.google.com/drive/folders/14WZ7nzbjCKe1IFa4AL6J2XD1c7nWpOT3?usp=sharing" className="btn btn-outline-modern">
                                    <i className="fas fa-file-alt me-2"></i>
                                    See My CV
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
