import { useEffect, useRef, useState } from 'react'
import './App.css'
import supabase from './assets/supabase-client'

function App() {
  const [projectList, setProjectList] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [newDeskripsi, setNewDeskripsi] = useState("");
  const [newFile, setNewFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const {data, error} = await supabase
      .from("Project")
      .select("*");
      
    if (error) {
      console.error("Error fetching projects: ", error);
    } else {
      setProjectList(data);
    }
  };

  const addProject = async () => {
    let fileUrl = null;

    if (newFile) {
      const filePath = `${Date.now()}-${newFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, newFile);

      if (uploadError) {
        console.error("Error uploading file: ", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("project-files")
        .getPublicUrl(filePath);

      fileUrl = publicUrlData?.publicUrl ?? null;
    }

    const newProjectData = {
      nama: newProject,
      deskripsi: newDeskripsi,
      file: fileUrl,
      status: false
    };
    
    const {data, error} = await supabase
      .from("Project")
      .insert([newProjectData])
      .select()
      .single();

    if (error) {
      console.error("Error adding project: ", error);
    } else if (!data) {
      console.error("Error adding project: no data returned");
    } else {
      setProjectList((prev) => [...prev, data]);
      setNewProject("");
      setNewDeskripsi("");
      setNewFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const statusProject = async (project) => {
    const { error } = await supabase
      .from("Project")
      .update({ status: !project.status })
      .eq("id", project.id);

    if (error) {
      console.log("Error updating project status: ", error);
    } else {
      const updatedProjects = projectList.map((item) =>
        item.id === project.id ? { ...item, status: !item.status } : item
      );
      setProjectList(updatedProjects);
    }
  };

  const deleteProject = async (project) => {
    const {data, error} = await supabase
    .from("Project")
    .delete()
    .eq("id", project.id);

    if (error) {
      console.log("Error deleting project: ", error);
    } else {
      setProjectList((prev) => prev.filter((item) => item.id !== project.id));
    }
  };

  return (
    <div>
      {""}
      <h1>My Project</h1>
      <div>
        <input type="text" placeholder='New Project...'
        value={newProject} 
        onChange={(e) => setNewProject(e.target.value) } 
        />
        <input type="text" placeholder='Add Deskripsi...' 
        onChange={(e) => setNewDeskripsi(e.target.value) } 
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={addProject}>Add Project</button>
      </div>

      <ul>
      {projectList.filter(Boolean).map((project) => (
        <li key={project.id}>
          <h3>{project.nama}</h3>
          <p>{project.deskripsi}</p>
          <p>Status: {project.status ? "Completed" : "In Progress"}</p>
          <p>
            {project.file && (
              <img
                src={project.file}
                alt={project.nama}
                style={{ width: 120, height: "auto", borderRadius: 8 }}
              />
            )}
          </p>
          <button onClick={() => statusProject(project)}>
            {project.status ? "Mark In Progress" : "Mark Completed"}
          </button>
          <button onClick={() => deleteProject(project)}>Delete Project</button>
        </li>
      ))}
      </ul>
    </div>
  );
}

export default App
