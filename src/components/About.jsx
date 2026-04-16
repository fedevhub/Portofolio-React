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
                                Halo! Saya Fitri Rachmania, seorang siswa SMA kejuruan jurusan Rekayasa Perangkat Lunak. 
                                Saya tertarik pada pengembangan web dan desain antarmuka dengan fokus pada pengalaman pengguna. 
                                Saya senang membuat antarmuka yang sederhana, fungsional, dan ramah pengguna, dan saya terus 
                                belajar untuk mengembangkan keterampilan teknologi digital saya. Saya juga sangat tertarik 
                                untuk meningkatkan kemampuan pemecahan masalah saya melalui proyek-proyek dunia nyata dan 
                                latihan terus-menerus. Saat ini saya terbuka untuk kolaborasi, magang, dan proyek lepas.
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
