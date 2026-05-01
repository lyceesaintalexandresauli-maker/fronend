import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client";
import { staffAPI, departmentsAPI } from "../api/services";

const sortStaffByIdAsc = (members = []) =>
  [...members].sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0));

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [staffRes, deptsRes] = await Promise.all([
          staffAPI.getAll(),
          departmentsAPI.getAll()
        ]);
        const sortedStaff = sortStaffByIdAsc(staffRes.data || []);
        setStaff(sortedStaff);
        setDepartments(deptsRes.data || []);
        setFilteredStaff(sortedStaff);
      } catch (err) {
        console.error('Error loading staff:', err);
        setError(err.response?.data?.error || 'Failed to load staff data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...staff];

    if (filterDepartment !== "all") {
      filtered = filtered.filter(member => member.department === filterDepartment);
    }

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStaff(sortStaffByIdAsc(filtered));
  }, [filterDepartment, searchTerm, staff]);

  if (loading) return (
    <main className="main">
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading staff...</span>
        </div>
        <p className="mt-3 text-muted">Loading staff...</p>
      </div>
    </main>
  );

  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Staff</h1>
                <p>Meet our dedicated team of experienced trainers, administrators, and support staff committed to student success.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mb-4" data-aos="fade-up">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, position, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
             >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            {(searchTerm || filterDepartment !== "all") && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setFilterDepartment("all"); setSearchTerm(""); }}
              >
                Clear all
              </button>
            )}
          </div>
          <Link
            to="/admin/staff"
            className="btn btn-sm text-white fw-semibold"
            style={{ backgroundColor: '#E6C56A' }}
          >
            <i className="bi bi-gear me-1"></i> Manage Staff
          </Link>
        </div>
      </div>

      {/* Staff Grid */}
      <section className="container" data-aos="fade-up">
        {error && (
          <div className="alert alert-danger d-flex align-items-start" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
            <div className="flex-grow-1">
              <p className="mb-0">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-sm btn-outline-danger mt-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="row g-4">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((member, index) => (
              <div
                key={member.id}
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="member-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" style={{ transition: 'transform 0.3s, box-shadow 0.3s' }}>
                  {/* Photo */}
                  <div className="position-relative" style={{ height: '280px', backgroundColor: '#f0f0f0' }}>
                    {member.image_path ? (
                      <img
                        src={mediaUrl(member.image_path)}
                        className="w-100 h-100 object-fit-cover"
                        alt={member.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/img/default-avatar.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-circle text-muted" style={{ fontSize: '5rem' }}></i>
                      </div>
                    )}
                    {member.department && (
                      <span className="badge position-absolute top-0 start-0 m-2" style={{ backgroundColor: '#E6C56A' }}>
                        <i className="bi bi-building me-1"></i>
                        {member.department}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center bg-white">
                    <h4 className="fw-bold mb-2">{member.name}</h4>
                    <span className="badge text-white mb-3 px-3 py-2" style={{ backgroundColor: '#004080' }}>
                      {member.position || "Staff Member"}
                    </span>
                    <p className="text-muted small mb-3" style={{ lineHeight: '1.6' }}>
                      {member.bio ? `"${member.bio.slice(0, 150)}${member.bio.length > 150 ? '...' : ''}"` : 'No biography available.'}
                    </p>

                    {/* Contact Icons */}
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="btn btn-sm btn-outline-secondary rounded-circle"
                          style={{ width: '36px', height: '36px', padding: '0' }}
                          title="Email"
                        >
                          <i className="bi bi-envelope"></i>
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="btn btn-sm btn-outline-secondary rounded-circle"
                          style={{ width: '36px', height: '36px', padding: '0' }}
                          title="Phone"
                        >
                          <i className="bi bi-telephone"></i>
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary rounded-circle"
                          style={{ width: '36px', height: '36px', padding: '0' }}
                          title="LinkedIn"
                        >
                          <i className="bi bi-linkedin"></i>
                        </a>
                      )}
                    </div>

                    <Link
                      to={`/staff/${member.id}`}
                      className="btn btn-sm fw-semibold"
                      style={{ color: '#004080' }}
                    >
                      View Profile <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-people text-muted" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="fw-bold text-muted mb-3">No Staff Found</h3>
                <p className="text-muted mb-4 px-4">
                  {loading
                    ? "Loading staff information..."
                    : "No staff members match your current filters. Try adjusting your search criteria or clear all filters."}
                </p>
                <button
                  onClick={() => {
                    setFilterDepartment("all");
                    setSearchTerm("");
                  }}
                  className="btn text-white fw-semibold px-4"
                  style={{ backgroundColor: '#E6C56A' }}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
