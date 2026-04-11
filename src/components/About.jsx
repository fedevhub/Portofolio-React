import "../styles/About.css";
import me1 from "../assets/images/me1.jpg";

export default function About() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about">
                    <div className="about-sheen"></div>
                    <div className="row align-items-center">
                        <div className="col-lg-6 mt-4 mt-lg-0 text-center text-lg-start order-1" data-aos="zoom-in-up"
                            data-aos-delay="200">
                            <h1 className="about-title">About Me</h1>
                            <p className="about-sub-title">Halo! Saya Fitri Rachmania, seorang pelajar yang tertarik pada
                                dunia
                                desain web dan
                                pengembangan front-end. Saya sedang bersekolah di SMKN 8 Malang jurusan Rekayasa
                                Perangkat
                                Lunak
                                (RPL) Saya telah mengerjakan beberapa proyek kecil menggunakan HTML, CSS, dan
                                JavaScript,
                                serta
                                memiliki ketertarikan dalam UI/UX Design. Saat ini saya terus mengembangkan skill dan
                                terbuka untuk berbagai peluang
                                kolaborasi, magang, maupun freelance di bidang desain atau pengembangan web.</p>
                        </div>

                        <div className="col-lg-6 text-center mt-4 mt-lg-0 order-2" data-aos="zoom-in-up"
                            data-aos-delay="200">
                            <div className="profile-img profile-wrap">
                                <img
                                    src={me1}
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