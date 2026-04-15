import "../styles/About.css";
import me from "../assets/images/me.jpeg";

export default function About() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about">
                    <div className="row align-items-center">
                        <div
                            className="col-lg-6 mt-4 mt-lg-0 text-center text-lg-start order-1"
                            data-aos="fade-right"
                            data-aos-duration="900"
                            data-aos-easing="ease-out-cubic"
                        >
                            <h1
                                className="about-title"
                                data-aos="fade-up"
                                data-aos-delay="100"
                            >
                                About Me
                            </h1>

                            <p
                                className="about-sub-title"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                Hello! I'm Fitri Rachmania, a vocational high school student 
                                majoring in Software Engineering. I'm interested in web 
                                development and interface design with a focus on user 
                                experience. I enjoy creating simple, functional, and 
                                user-friendly interfaces, and I'm constantly learning 
                                to develop my digital technology skills. I'm also very 
                                interested in improving my problem-solving skills through 
                                real-world projects and continuous practice. I'm currently 
                                open to collaborations, internships, and freelance projects.
                            </p>
                        </div>

                        <div
                            className="col-lg-6 text-center mt-4 mt-lg-0 order-2"
                            data-aos="zoom-in"
                            data-aos-duration="1000"
                            data-aos-easing="ease-out-cubic"
                        >
                            <div className="profile-wrap">
                                <img
                                    src={me}
                                    alt="Fitri Rachmania"
                                    className="profile-img"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
