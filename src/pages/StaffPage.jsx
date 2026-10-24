import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { mediaUrl } from "../api/client";
import { staffAPI, departmentsAPI } from "../api/services";
import "./StaffPage.css";

const sortStaffByIdAsc = (members = []) =>
  [...members].sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0));

const formatWhatsAppNumber = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("00250")) return digits.slice(2);
  if (digits.startsWith("250")) return digits;
  if (digits.startsWith("0")) return `250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("7")) return `250${digits}`;
  return digits;
};

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
        setError(null);

        const [staffRes, deptsRes] = await Promise.all([
          staffAPI.getAll().catch(() => ({ data: [] })),
          departmentsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const sortedStaff = sortStaffByIdAsc(staffRes.data || []);
        setStaff(sortedStaff);
        setDepartments(deptsRes.data || []);
        setFilteredStaff(sortedStaff);
      } catch {
        setError("We could not load staff information right now.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...staff];

    if (filterDepartment !== "all") {
      filtered = filtered.filter((member) => member.department === filterDepartment);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(query) ||
          member.position?.toLowerCase().includes(query) ||
          member.bio?.toLowerCase().includes(query)
      );
    }

    setFilteredStaff(sortStaffByIdAsc(filtered));
  }, [filterDepartment, searchTerm, staff]);

  if (loading) {
    return (
      <main className="main">
        <Seo
          title="Our Staff"
          description="Meet the teaching staff, administrators, and support team at Lycee Saint Alexandre Sauli de Muhura."
          path="/trainers"
        />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading staff...</span>
          </div>
          <p className="mt-3 text-muted">Loading staff...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main ui-page-shell">
      <Seo
        title="Our Staff"
        description="Meet the teaching staff, administrators, and support team at Lycee Saint Alexandre Sauli de Muhura."
        path="/trainers"
      />

      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Staff</h1>
                <p>Meet our dedicated teachers, administrators, and support staff committed to student success.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-4 ui-staff-filter-shell" data-aos="fade-up">
        <div className="ui-staff-filter-controls">
          <div className={`input-group ui-staff-search-group${searchTerm ? " has-clear" : ""}`}>
            <span className="input-group-text ui-staff-search-icon">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, position, or bio..."
              aria-label="Search staff by name, position, or biography"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button
                className="btn ui-staff-clear-search"
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear staff search"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
          <div className="ui-staff-department-wrap">
            <select
              className="form-select ui-staff-department-select"
              aria-label="Filter staff by department"
              value={filterDepartment}
              onChange={(event) => setFilterDepartment(event.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          {(searchTerm || filterDepartment !== "all") && (
            <button
              className="btn btn-outline-secondary btn-sm ui-staff-clear-filters"
              onClick={() => {
                setFilterDepartment("all");
                setSearchTerm("");
              }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <section className="container" data-aos="fade-up">
        {error && (
          <div className="alert alert-warning d-flex align-items-start" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
            <div className="flex-grow-1">
              <p className="mb-0">{error}</p>
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
                <article className="ui-staff-card">
                  <div className="ui-staff-cover">
                    {member.department && (
                      <span className="ui-staff-department">
                        <i className="bi bi-building" aria-hidden="true"></i>
                        {member.department}
                      </span>
                    )}
                  </div>

                  <div className="ui-staff-body">
                    <div className="ui-staff-avatar">
                      {member.image_path && (
                        <img
                          src={mediaUrl(member.image_path)}
                          alt={member.name}
                          loading="lazy"
                          decoding="async"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <i className="bi bi-person-fill" aria-hidden="true"></i>
                    </div>

                    <h2 className="ui-staff-name">{member.name}</h2>
                    <p className="ui-staff-position">{member.position || "Staff Member"}</p>
                    <p className="ui-staff-bio">
                      {member.bio
                        ? `${member.bio.slice(0, 120)}${member.bio.length > 120 ? "..." : ""}`
                        : "No biography available."}
                    </p>

                    {member.phone && (
                      <a className="ui-staff-phone" href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}>
                        <i className="bi bi-telephone" aria-hidden="true"></i>
                        <span>{member.phone}</span>
                      </a>
                    )}

                    <div className="ui-staff-footer">
                      <Link to={`/staff/${member.id}`} className="ui-staff-profile-link">
                        View Profile <i className="bi bi-arrow-right" aria-hidden="true"></i>
                      </Link>

                      <div className="ui-staff-socials" role="group" aria-label={`${member.name} contact links`}>
                        {member.email && (
                          <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`} title="Email">
                            <i className="bi bi-envelope" aria-hidden="true"></i>
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(member.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Chat with ${member.name} on WhatsApp`}
                            title="WhatsApp"
                          >
                            <i className="bi bi-whatsapp" aria-hidden="true"></i>
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} on LinkedIn`}
                            title="LinkedIn"
                          >
                            <i className="bi bi-linkedin" aria-hidden="true"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-people text-muted" style={{ fontSize: "4rem" }}></i>
                </div>
                <h3 className="fw-bold text-muted mb-3">No Staff Found</h3>
                <p className="text-muted mb-4 px-4">
                  No staff members match your current filters. Try adjusting your search criteria or clear all filters.
                </p>
                <button
                  onClick={() => {
                    setFilterDepartment("all");
                    setSearchTerm("");
                  }}
                  className="btn text-white fw-semibold px-4"
                  style={{ backgroundColor: "var(--brand-accent)" }}
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
