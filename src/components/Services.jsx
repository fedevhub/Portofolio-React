import "../styles/Services.css";

const SERVICES = [
  {
    icon: "bi-window-stack",
    title: "Website Development",
    description: "Website modern yang cepat, responsif, dan disusun agar mudah digunakan di berbagai perangkat.",
    points: ["Landing page", "Portfolio website", "Responsive layout"],
  },
  {
    icon: "bi-bezier2",
    title: "UI/UX Design",
    description: "Desain antarmuka yang bersih dan terarah, dengan alur pengguna sebagai pusat setiap keputusan.",
    points: ["Wireframe", "User flow", "Interface design"],
  },
  {
    icon: "bi-phone",
    title: "Frontend Implementation",
    description: "Mengubah desain menjadi pengalaman web interaktif dengan detail visual dan performa yang diperhatikan.",
    points: ["React interface", "Reusable components", "Polished interaction"],
  },
];

export default function Services() {
  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="container">
        <div className="services-heading" data-aos="fade-up">
          <h2 id="services-title">Services</h2>
          <p>Solusi desain dan pengembangan web yang dibuat dengan perhatian pada tampilan, fungsi, dan pengguna.</p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service, index) => (
            <article className="service-card" key={service.title} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="service-icon"><i className={`bi ${service.icon}`}></i></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.points.map((point) => <li key={point}><i className="bi bi-check2"></i>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
