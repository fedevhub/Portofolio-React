import { BrowserRouter, Route, Routes } from "react-router-dom";

import About from "./components/About";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Project, {
  AddProjectPage,
  EditProjectPage,
} from "./components/Project";
import Footer from "./components/Footer";
import Skills from "./components/Skills";
import SplashScreen from "./components/Splash-screen";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";

import Login from "./Admin/Login";
import Admin from "./Admin/Admin";

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
      <SplashScreen />
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
      <Skills />
      <Project />
      <Footer />
    </SiteLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/admin" element={<Login />} />

          <Route path="/admin/dashboard" element={<LandingPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/add"
            element={
              <ProtectedRoute>
                <SiteLayout>
                  <AddProjectPage />
                </SiteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/edit/:id"
            element={
              <ProtectedRoute>
                <SiteLayout>
                  <EditProjectPage />
                </SiteLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;