import { useState } from "react";
import "../styles/Skills.css";

export default function Skills() {

    const [skills, setSkills] = useState([
        { id: 1, name: "HTML", icon: "fa-brands fa-html5", color: "#e34f26" },
        { id: 2, name: "CSS", icon: "fa-brands fa-css3-alt", color: "#1572b6" },
        { id: 3, name: "JavaScript", icon: "fa-brands fa-js", color: "#f7df1e" },
    ]);

    const [form, setForm] = useState({
        name: "",
        icon: "",
        color: "#ffffff"
    });

    const [editId, setEditId] = useState(null);

    const handleAdd = () => {
        if (!form.name || !form.icon) return;

        setSkills([
            ...skills,
            {
                id: Date.now(),
                ...form
            }
        ]);

        setForm({ name: "", icon: "", color: "#ffffff" });
    };

    const handleDelete = (id) => {
        setSkills(skills.filter((item) => item.id !== id));
    };

    const handleEdit = (skill) => {
        setForm(skill);
        setEditId(skill.id);
    };

    const handleUpdate = () => {
        setSkills(
            skills.map((item) =>
                item.id === editId ? { ...item, ...form } : item
            )
        );

        setForm({ name: "", icon: "", color: "#ffffff" });
        setEditId(null);
    };

    return (
        <section id="skills" className="skills-section">
            <div className="container">

                {/* HEADER */}
                <div className="section-heading text-center mb-5">
                    <p className="section-eyebrow">Toolkit</p>
                    <h1 className="skills-title">My Skills</h1>
                    <p className="section-subtitle">
                        Skillset yang terus berkembang untuk membangun produk yang rapi dan modern.
                    </p>
                </div>

                {/* FORM */}
                <div className="skills-form">

                    <input
                        type="text"
                        placeholder="Skill name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Icon class (fa-brands fa-react)"
                        value={form.icon}
                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    />

                    <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />

                    {editId ? (
                        <button className="btn btn-update" onClick={handleUpdate}>
                            Update
                        </button>
                    ) : (
                        <button className="btn btn-add" onClick={handleAdd}>
                            Add
                        </button>
                    )}

                    {editId && (
                        <button
                            className="btn btn-cancel"
                            onClick={() => {
                                setEditId(null);
                                setForm({ name: "", icon: "", color: "#ffffff" });
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* GRID */}
                <div className="skills-grid">
                    <div className="skills-row">
                        {skills.map((skill) => (
                            <div className="skill-card" key={skill.id}>

                                <div
                                    className="skill-icon"
                                    style={{ "--icon-color": skill.color }}
                                >
                                    <i className={skill.icon}></i>
                                </div>

                                <div className="skill-name">{skill.name}</div>

                                <div className="skill-actions">

                                    <button
                                        className="btn btn-edit"
                                        onClick={() => handleEdit(skill)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-delete"
                                        onClick={() => handleDelete(skill.id)}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}