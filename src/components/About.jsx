import "../styles/About.css";
import me from "../assets/images/me.jpeg";

export default function About() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about">
                    <div className="about-sheen"></div>
                    <div className="row align-items-center">
                        <div className="col-lg-6 mt-4 mt-lg-0 text-center text-lg-start order-1" data-aos="fade-right"
                            data-aos-delay="200">
                            <h1 className="about-title">About Me</h1>
                            <p className="about-sub-title">Hello! I'm Fitri Rachmania, a vocational high school student majoring in 
                                Software Engineering. I'm interested in web development and user experience-focused interface design. 
                                I enjoy creating simple, functional, and user-friendly interfaces, and I'm constantly learning to 
                                develop my digital technology skills. I'm currently open to collaborations, internships, and 
                                freelance projects.</p>
                        </div>

                        <div className="col-lg-6 text-center mt-4 mt-lg-0 order-2" data-aos="zoom-in-left"
                            data-aos-delay="200">
                            <div className="profile-img profile-wrap">
                                <img
                                    src={me}
                                    alt="Fitri Rachmania"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
