import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ContentPage from "./pages/ContentPage";
import EventsPage from "./pages/EventsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import StaffPage from "./pages/StaffPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import AcademicPage from "./pages/AcademicPage";
import SodPage from "./pages/SodPage";
import CsaPage from "./pages/CsaPage";
import NitPage from "./pages/NitPage";
import FadPage from "./pages/FadPage";
import AccPage from "./pages/AccPage";
import TimetablesPage from "./pages/TimetablesPage";
import AdminTimetablesPage from "./pages/AdminTimetablesPage";
import { getSupabaseBrowserClient } from "./supabase";

export default function App() {
  const supabase = getSupabaseBrowserClient();
  const [loadingSession, setLoadingSession] = useState(true);

  // 🔥 FIX: ensure session is checked before routing
  useEffect(() => {
    const init = async () => {
      await supabase.auth.getSession();
      setLoadingSession(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // just refresh state awareness
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (loadingSession) {
    return (
      <div style={{ padding: 20 }}>
        Loading session...
      </div>
    );
  }

  return (
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
          <Route path="/profile" element={<ProfilePage />} />
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

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/timetables" element={<AdminTimetablesPage />} />
      </Route>
    </Routes>
  );
}