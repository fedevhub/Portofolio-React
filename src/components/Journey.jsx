
import { useState } from "react";
import "../styles/Journey.css";

const JOURNEY_CONTENT = {
  education: [
    {
      period: "Saat ini",
      title: "Rekayasa Perangkat Lunak (RPL)",
      place: "SMKN 8 Malang",
      description:
        "Menempuh pendidikan kejuruan di bidang Rekayasa Perangkat Lunak dengan fokus pada pengembangan aplikasi, pemrograman web, pengelolaan basis data, serta perancangan dan implementasi sistem informasi.",
      icon: "bi-mortarboard-fill",
    },
  ],

  experience: [
    {
      period: "2026 · ±5 Bulan",
      title: "Frontend Developer Intern",
      place: "3PM Solution",
      description:
        "Melaksanakan Praktik Kerja Lapangan sebagai Frontend Developer dengan terlibat dalam pengembangan aplikasi pemesanan barang dan fitur pengelolaan gudang. Mengimplementasikan antarmuka, mengintegrasikan REST API, serta melakukan penyesuaian fitur berdasarkan arahan dan revisi dari analis.",
      icon: "bi-briefcase-fill",
      projects: [
        {
          name: "Aplikasi Pemesanan Barang",
          description:
            "Mengembangkan antarmuka aplikasi menggunakan Angular, TypeScript, Bootstrap, dan REST API.",
        },
        {
          name: "Sistem Pengelolaan Gudang",
          description:
            "Mengembangkan fitur gudang menggunakan Angular, TypeScript, Tailwind CSS, dan REST API, termasuk melakukan penyesuaian berdasarkan revisi analis.",
        },
      ],
    },
  ],
};

export default function Journey() {
  const [activeTab, setActiveTab] = useState("education");
  const items = JOURNEY_CONTENT[activeTab];

  return (
    <section
      id="journey" className="journey-section"
      aria-labelledby="journey-title"
    >
      <div className="container">
        <div className="journey-heading" data-aos="fade-up">

          <h2 id="journey-title">
            Education & Experience
          </h2>

          <p>
            Perjalanan pendidikan dan pengalaman profesional
            yang membangun kemampuan saya di bidang
            pengembangan perangkat lunak.
          </p>
        </div>

        <div
          className="journey-tabs"
          role="tablist"
          aria-label="Education and experience"
        >
          {["education", "experience"].map((tab) => (
            <button
              key={tab}
              id={`${tab}-tab`}
              className={`journey-tab ${activeTab === tab ? "active" : ""
                }`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              onClick={() => setActiveTab(tab)}
            >
              <i
                className={`bi ${tab === "education"
                    ? "bi-mortarboard"
                    : "bi-briefcase"
                  }`}
                aria-hidden="true"
              />

              {tab === "education"
                ? "Education"
                : "Experience"}
            </button>
          ))}
        </div>

        <div
          id={`${activeTab}-panel`}
          className="journey-panel"
          role="tabpanel"
          aria-labelledby={`${activeTab}-tab`}
          key={activeTab}
        >
          {items.map((item) => (
            <article
              className="journey-card"
              key={item.title}
            >
              <div className="journey-icon">
                <i
                  className={`bi ${item.icon}`}
                  aria-hidden="true"
                />
              </div>

              <div className="journey-card-content">
                <span className="journey-period">
                  {item.period}
                </span>

                <h3>{item.title}</h3>

                <p className="journey-place">
                  {item.place}
                </p>

                <p>{item.description}</p>

                {item.projects && (
                  <div className="journey-projects">
                    <h4>Project Contributions</h4>

                    {item.projects.map((project) => (
                      <div
                        className="journey-project"
                        key={project.name}
                      >
                        <span className="journey-project-dot" />

                        <div>
                          <h5>{project.name}</h5>
                          <p>{project.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
