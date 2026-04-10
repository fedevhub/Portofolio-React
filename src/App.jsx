import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./components/About";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Project, { AddProjectPage, EditProjectPage } from "./components/Project";

function BackgroundLayer() {
  return (
    <div className="background">
      <div className="floating-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
      </div>
      <div className="grid"></div>
      <div className="particles" id="particles"></div>
      <div className="waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>
    </div>
  );
}

function SiteLayout({ children }) {
  return (
    <>
      <BackgroundLayer />
      <Navbar />
      <main className="page-content">{children}</main>
    </>
  );
}

function LandingPage() {
  return (
    <SiteLayout>
      <Home />
      <About />
      <Project />
    </SiteLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/project/add"
          element={
            <SiteLayout>
              <AddProjectPage />
            </SiteLayout>
          }
        />
        <Route
          path="/project/edit/:id"
          element={
            <SiteLayout>
              <EditProjectPage />
            </SiteLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
