import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteSeo from "./components/RouteSeo";
import PageLoader from "./components/PageLoader";
import { useAuth } from "./context/AuthContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const StaffPage = lazy(() => import("./pages/StaffPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AcademicPage = lazy(() => import("./pages/AcademicPage"));
const SodPage = lazy(() => import("./pages/SodPage"));
const CsaPage = lazy(() => import("./pages/CsaPage"));
const NitPage = lazy(() => import("./pages/NitPage"));
const FadPage = lazy(() => import("./pages/FadPage"));
const AccPage = lazy(() => import("./pages/AccPage"));
const TimetablesPage = lazy(() => import("./pages/TimetablesPage"));



export default function App() {
  const { isReady } = useAuth();

  if (!isReady) {
    return <PageLoader label="Preparing your session..." />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <RouteSeo />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/anouncement" element={<AnnouncementsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/trainers" element={<StaffPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute roles={["admin", "teacher", "secretary"]} />}>
           
          </Route>
          <Route element={<ProtectedRoute roles={["student"]} />}>
            <Route path="/student" element={<StudentDashboardPage />} />
          </Route>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/academic" element={<AcademicPage />} />
          <Route path="/sod" element={<SodPage />} />
          <Route path="/csa" element={<CsaPage />} />
          <Route path="/nit" element={<NitPage />} />
          <Route path="/fad" element={<FadPage />} />
          <Route path="/acc" element={<AccPage />} />
          <Route path="/timetables" element={<TimetablesPage />} />
          <Route path="/:slug" element={<ContentPage />} />
        </Route>

       
   
      </Routes>
    </Suspense>
  );
}
