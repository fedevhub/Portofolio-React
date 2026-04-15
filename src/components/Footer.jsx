import "../styles/Footer.css";

export default function Footer() {
    return (
        <section id="contact">
            <footer className="footer text-white site-footer">
                <div className="container footer-grid">
                    <div className="footer-info" data-aos="fade-right">
                        <h3 className="footer-title">Let’s Work Together</h3>
                        <p className="footer-subtitle">Open for projects & collaborations</p>
                        <ul className="footer-list">
                            <li>
                                <i className="bi bi-geo-alt-fill"></i>
                                <span>Indonesia</span>
                            </li>
                            <li>
                                <i className="bi bi-telephone-fill"></i>
                                <span>+62 823-3071-7123</span>
                            </li>
                            <li>
                                <i className="bi bi-envelope-fill"></i>
                                <span>fitrirachmania29@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-social" data-aos="fade-left" data-aos-delay="100">
                        <h3 className="footer-title">Find Me Online</h3>
                        <div className="footer-social-grid">
                            <a href="https://www.instagram.com/xnrzfii_ran?igsh=MWV1Y3o3MGZvZjFtZQ==" target="_blank"
                                className="social-item">
                                <i className="bi bi-instagram"></i>
                                <span>Instagram</span>
                            </a>
                            <a href="https://wa.me/6282330717123?text=Halo,%20saya%20tertarik%20dengan%20portfolio%20anda%20dan%20ingin%20berdiskusi%20lebih%20lanjut"
                                target="_blank" className="social-item">
                                <i className="bi bi-whatsapp"></i>
                                <span>WhatsApp</span>
                            </a>
                            <a href="https://www.behance.net/fitrirach" target="_blank" className="social-item">
                                <i className="bi bi-behance"></i>
                                <span>Behance</span>
                            </a>
                            <a href="mailto:fitrirachmania29@gmail.com" className="social-item">
                                <i className="bi bi-envelope-fill"></i>
                                <span>Email</span>
                            </a>
                            <a href="https://github.com/fedevhub" target="_blank" className="social-item">
                                <i className="bi bi-github"></i>
                                <span>Github</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Fitri ✦ All rights reserved.</p>
                </div>
            </footer>
        </section>
    )
}
