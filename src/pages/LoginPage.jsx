import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, user, loginStep1 } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/profile"} replace />;
  }

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginStep1(email, password);
    setLoading(false);
    if (!result.ok) return setError(result.error);
    navigate(result.data.user.role === "admin" ? "/admin" : "/profile");
  };

  return (
    <main className="main">
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Staff Portal</h1>
                <p className="mb-0">Secure login interface for faculty and administrators.</p>
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

                  {/* Header */}
                  <div className="text-center mb-4">
                    <img
                      src="/assets/img/logo1.jpg"
                      alt="School Logo"
                      style={{ width: "80px", borderRadius: "5px" }}
                      className="mb-3"
                    />
                    <h3 className="fw-bold" style={{ color: "#37423b" }}>
                      Sign In
                    </h3>
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Login with your email and password.
                    </p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={submitLogin}>
                    <div className="mb-3">
                      <label className="form-label text-muted">Email address</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label text-muted">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control form-control-lg border-end-0"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary border-start-0 bg-transparent"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
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
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-lock me-2"></i>Login
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
