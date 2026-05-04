import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, user, loginStep1, registerStudent, authConfigError, isReady } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const destinationForRole = (role) => {
    if (role === "admin") return "/admin";
    if (role === "teacher" || role === "secretary" || role === "dos") return "/profile";
    if (role === "student") return "/student";
    return "/";
  };

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={destinationForRole(user?.role)} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (mode === "signup") {
        const result = await registerStudent({ email, password, fullName });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        if (result.needsEmailConfirmation) {
          setNotice("Account created. Check your email to confirm your student account.");
          return;
        }
        setNotice("Account created successfully. You are now signed in.");
        navigate("/student", { replace: true });
        return;
      }

      const result = await loginStep1(email, password);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      navigate(destinationForRole(result.data.user.role), { replace: true });
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <Seo
        title="Student Login / Signup"
        description="Student portal access and account registration for Lycee Saint Alexandre Sauli de Muhura."
        path="/login"
      />

      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Student Portal</h1>
                <p className="mb-0">Sign in or create your student account to access student services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="login section py-5">
        <div className="container">
          <div className="row justify-content-center" data-aos="fade-up">
            <div className="col-lg-5 col-md-8">
              <div className="card shadow-lg border-0 rounded-lg">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <img
                      src="/assets/img/logo1.jpg"
                      alt="School Logo"
                      style={{ width: "80px", borderRadius: "5px" }}
                      className="mb-3"
                    />
                    <h3 className="fw-bold" style={{ color: "#37423b" }}>
                      {mode === "login" ? "Student Login" : "Student Signup"}
                    </h3>
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                      {mode === "login"
                        ? "Use your student account to continue."
                        : "Create a student account with your email and password."}
                    </p>
                  </div>

                  <div className="d-flex gap-2 mb-3">
                    <button
                      type="button"
                      className={`btn btn-sm ${mode === "login" ? "btn-dark text-white" : "btn-outline-secondary"}`}
                      onClick={() => setMode("login")}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${mode === "signup" ? "btn-dark text-white" : "btn-outline-secondary"}`}
                      onClick={() => setMode("signup")}
                    >
                      Signup
                    </button>
                  </div>

                  {authConfigError && (
                    <div className="alert alert-warning" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {authConfigError}
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  {notice && (
                    <div className="alert alert-success" role="alert">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {notice}
                    </div>
                  )}

                  <form onSubmit={submit}>
                    {mode === "signup" && (
                      <div className="mb-3">
                        <label className="form-label text-muted">Full name</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Student full name"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                        />
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label text-muted">Email address</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-muted">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control form-control-lg border-end-0"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary border-start-0 bg-transparent"
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          style={{ borderColor: "#dee2e6" }}
                        >
                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="d-grid mt-4">
                      <button
                        className="btn btn-lg text-white"
                        style={{ backgroundColor: "#004080" }}
                        type="submit"
                        disabled={loading || !!authConfigError}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <i className={`bi ${mode === "login" ? "bi-box-arrow-in-right" : "bi-person-plus"} me-2`}></i>
                            {mode === "login" ? "Login" : "Create account"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  <p className="small text-muted mt-3 mb-0">
                    Staff/admin accounts should use the dedicated admin portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
