import "../styles/Home.css";

export default function Home() {
    return (
        <section id="home" className="hero-section d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center text-center">
                    <div className="col-lg-8">
                        <div className="hero-content">
                            <h4 className="hero-eyebrow">Hello!, It's Me</h4>

                            <h1 className="hero-title">
                                Fitri <span style={{ color: "var(--maroon-accent)" }}>Rachmania</span>
                            </h1>

                            <h3 className="hero-role">
                                And I am a software engineering student
                            </h3>

                            <p className="hero-text mx-auto">
                                Passionate about modern web development and constantly learning new technologies.
                                Currently focusing on web design, front-end engineering, and building clean,
                                responsive user interfaces.
                            </p>

                            <div className="d-flex flex-wrap gap-3 justify-content-center hero-actions">
                                <a href="#portfolio" className="btn btn-primary-modern">
                                    Learn More
                                </a>

                                <a href="#cv" className="btn btn-outline-modern">
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
