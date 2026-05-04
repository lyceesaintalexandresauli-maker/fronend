import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="main">
      <Seo
        title="Student Dashboard"
        description="Your student portal at Lycee Saint Alexandre Sauli de Muhura."
        path="/student"
      />

      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center py-4">
              <div className="col-lg-9">
                <h1 className="text-white fw-bold">Student dashboard</h1>
                <p className="text-white mb-0" style={{ opacity: 0.95 }}>
                  Welcome back{user?.full_name ? `, ${user.full_name}` : user?.email ? `, ${user.email}` : ""}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4" data-aos="fade-up">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: "#004080" }}>
                  <i className="bi bi-person-circle me-2" style={{ color: "#E6C56A" }}></i>
                  Your account
                </h3>
                <p className="text-muted small mb-2">
                  <strong>Email:</strong> {user?.email || "—"}
                </p>
                {user?.full_name && (
                  <p className="text-muted small mb-2">
                    <strong>Name:</strong> {user.full_name}
                  </p>
                )}
                <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => logout()}>
                  Sign out
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-8" data-aos="fade-up" data-aos-delay="100">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3" style={{ color: "#004080" }}>
                  Quick links
                </h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Link
                      to="/timetables"
                      className="d-block rounded-3 border p-3 text-decoration-none h-100"
                      style={{ borderColor: "rgba(0,64,128,0.2)" }}
                    >
                      <div className="fw-bold text-dark mb-1">
                        <i className="bi bi-calendar3 me-2" style={{ color: "#E6C56A" }}></i>
                        Timetables
                      </div>
                      <div className="small text-muted">View published class schedules.</div>
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <Link
                      to="/announcements"
                      className="d-block rounded-3 border p-3 text-decoration-none h-100"
                      style={{ borderColor: "rgba(0,64,128,0.2)" }}
                    >
                      <div className="fw-bold text-dark mb-1">
                        <i className="bi bi-megaphone me-2" style={{ color: "#E6C56A" }}></i>
                        Announcements
                      </div>
                      <div className="small text-muted">School news and updates.</div>
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <Link
                      to="/events"
                      className="d-block rounded-3 border p-3 text-decoration-none h-100"
                      style={{ borderColor: "rgba(0,64,128,0.2)" }}
                    >
                      <div className="fw-bold text-dark mb-1">
                        <i className="bi bi-calendar-event me-2" style={{ color: "#E6C56A" }}></i>
                        Events
                      </div>
                      <div className="small text-muted">Upcoming activities.</div>
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <Link
                      to="/academic"
                      className="d-block rounded-3 border p-3 text-decoration-none h-100"
                      style={{ borderColor: "rgba(0,64,128,0.2)" }}
                    >
                      <div className="fw-bold text-dark mb-1">
                        <i className="bi bi-book me-2" style={{ color: "#E6C56A" }}></i>
                        Academic
                      </div>
                      <div className="small text-muted">Programs and information.</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
