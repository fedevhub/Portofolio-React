import { useEffect, useLayoutEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

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

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function addMediaQueryListener(mediaQuery, listener) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}

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

function ViewportManager() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const visualViewport = window.visualViewport;
    const supportsDynamicViewport = CSS.supports("height", "100dvh");
    const supportsStableViewport = CSS.supports("height", "100svh");

    let settleFrame = 0;
    let followUpFrame = 0;
    let settleTimer = 0;

    const applyViewportVars = () => {
      const viewportHeight = Math.round(visualViewport?.height ?? window.innerHeight);

      if (!supportsDynamicViewport) {
        root.style.setProperty("--viewport-height", `${viewportHeight}px`);
      }

      if (!supportsStableViewport) {
        root.style.setProperty("--viewport-stable-height", `${viewportHeight}px`);
      }

      window.dispatchEvent(new Event("viewport:change"));
    };

    const syncViewport = () => {
      window.cancelAnimationFrame(settleFrame);
      window.cancelAnimationFrame(followUpFrame);
      window.clearTimeout(settleTimer);

      applyViewportVars();
      settleFrame = window.requestAnimationFrame(applyViewportVars);
      followUpFrame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(applyViewportVars);
      });
      settleTimer = window.setTimeout(applyViewportVars, 180);
    };

    syncViewport();

    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    window.addEventListener("pageshow", syncViewport);
    visualViewport?.addEventListener("resize", syncViewport);

    return () => {
      window.cancelAnimationFrame(settleFrame);
      window.cancelAnimationFrame(followUpFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      window.removeEventListener("pageshow", syncViewport);
      visualViewport?.removeEventListener("resize", syncViewport);
    };
  }, []);

  return null;
}

function AosManager() {
  const location = useLocation();

  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    const syncAos = () => {
      AOS.init({
        duration: 520,
        delay: 0,
        easing: "ease-out-quart",
        once: true,
        offset: 24,
        disable: reducedMotion.matches,
      });
      AOS.refreshHard();
    };

    syncAos();

    const removeMotionListener = addMediaQueryListener(reducedMotion, syncAos);

    return () => {
      removeMotionListener();
    };
  }, []);

  useEffect(() => {
    let refreshFrame = 0;
    let refreshTimer = 0;
    const visualViewport = window.visualViewport;

    const scheduleRefresh = () => {
      window.cancelAnimationFrame(refreshFrame);
      window.clearTimeout(refreshTimer);

      refreshFrame = window.requestAnimationFrame(() => {
        AOS.refreshHard();
      });
      refreshTimer = window.setTimeout(() => {
        AOS.refreshHard();
      }, 180);
    };

    scheduleRefresh();

    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("orientationchange", scheduleRefresh);
    window.addEventListener("pageshow", scheduleRefresh);
    window.addEventListener("viewport:change", scheduleRefresh);
    window.addEventListener("splashscreen:complete", scheduleRefresh);
    visualViewport?.addEventListener("resize", scheduleRefresh);
    document.fonts?.ready?.then(scheduleRefresh).catch(() => {});

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      window.clearTimeout(refreshTimer);
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("orientationchange", scheduleRefresh);
      window.removeEventListener("pageshow", scheduleRefresh);
      window.removeEventListener("viewport:change", scheduleRefresh);
      window.removeEventListener("splashscreen:complete", scheduleRefresh);
      visualViewport?.removeEventListener("resize", scheduleRefresh);
    };
  }, [location.pathname, location.hash]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ViewportManager />
        <AosManager />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/admin"
            element={
              <>
                <BackgroundLayer />
                <Login />
              </>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <LandingPage />
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
