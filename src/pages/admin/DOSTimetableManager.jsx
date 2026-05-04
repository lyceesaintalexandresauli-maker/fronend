import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import TimetableGrid from "../../components/TimetableGrid";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
const labelClass = "mb-1 block text-sm font-semibold text-slate-700";
const btnPrimary =
  "!inline-flex items-center justify-center rounded-lg !border border-slate-800 !bg-slate-800 px-4 py-2 text-sm font-semibold !text-white hover:!bg-slate-900 disabled:!opacity-50";
const btnMuted =
  "!inline-flex items-center justify-center rounded-lg !border border-slate-300 !bg-white px-4 py-2 text-sm font-semibold !text-slate-800 hover:!bg-slate-50";
const btnSuccess =
  "!inline-flex items-center justify-center rounded-lg !border border-emerald-700 !bg-emerald-600 px-3 py-1.5 text-xs font-semibold !text-white hover:!bg-emerald-700";
const btnDanger =
  "!inline-flex items-center justify-center rounded-lg !border border-red-700 !bg-red-600 px-3 py-1.5 text-xs font-semibold !text-white hover:!bg-red-700";

export default function DOSTimetableManager() {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    class_name: "",
    department: "",
    trade_level: "",
    academic_year: "2024-2025",
    term: "Term 1",
    schedule_data: {},
    status: "draft",
  });

  const [cadeauSyncing, setCadeauSyncing] = useState(false);
  const [cadeauStatus, setCadeauStatus] = useState({ classes: [], teachers: [] });

  useEffect(() => {
    loadTimetables();
  }, []);

  const loadTimetables = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/timetables");
      setTimetables(response.data || []);
    } catch (err) {
      setError(getApiError(err, "Failed to load timetables"));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromCadeau = async () => {
    setCadeauSyncing(true);
    try {
      const response = await api.post("/timetables/sync-cadeau");
      setCadeauStatus({
        success: true,
        message: `Synced ${response.data.classes_count} classes and ${response.data.teachers_count} teachers`,
        timestamp: new Date().toISOString(),
      });
      loadTimetables();
    } catch (err) {
      setCadeauStatus({
        success: false,
        message: getApiError(err, "Failed to sync from the external timetable service"),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setCadeauSyncing(false);
    }
  };

  const handleCreateTimetable = async (e) => {
    e.preventDefault();
    try {
      await api.post("/timetables", formData);
      setShowCreateForm(false);
      setFormData({
        class_name: "",
        department: "",
        trade_level: "",
        academic_year: "2024-2025",
        term: "Term 1",
        schedule_data: {},
        status: "draft",
      });
      loadTimetables();
    } catch (err) {
      setError(getApiError(err, "Failed to create timetable"));
    }
  };

  const handlePublishTimetable = async (id) => {
    try {
      await api.put(`/timetables/${id}`, { status: "published" });
      loadTimetables();
    } catch (err) {
      setError(getApiError(err, "Failed to publish timetable"));
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return;
    try {
      await api.delete(`/timetables/${id}`);
      loadTimetables();
    } catch (err) {
      setError(getApiError(err, "Failed to delete timetable"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Timetable management</h1>
        <p className="mt-2 text-slate-600">
          Welcome, {user?.full_name || user?.username}
          {user?.role === "dos" ? " (Director of Studies)" : ""}
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      {cadeauStatus.message && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            cadeauStatus.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {cadeauStatus.message}
          <div className="mt-1 text-xs opacity-80">{cadeauStatus.timestamp}</div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <button type="button" onClick={handleSyncFromCadeau} disabled={cadeauSyncing} className={btnPrimary}>
          {cadeauSyncing ? "Syncing…" : "Sync from external timetable service"}
        </button>
        <button type="button" onClick={() => setShowCreateForm(!showCreateForm)} className={btnMuted}>
          {showCreateForm ? "Cancel" : "Create timetable"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Create new timetable</h2>
          <form onSubmit={handleCreateTimetable} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="dm-class">
                  Class name
                </label>
                <input
                  id="dm-class"
                  type="text"
                  name="class_name"
                  className={inputClass}
                  value={formData.class_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Level 3 SOD"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="dm-dept">
                  Department
                </label>
                <select
                  id="dm-dept"
                  name="department"
                  className={inputClass}
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select department</option>
                  <option value="ICT">ICT</option>
                  <option value="FAD">Fashion Design (FAD)</option>
                  <option value="ACC">Accounting (ACC)</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="dm-trade">
                  Trade level
                </label>
                <input
                  id="dm-trade"
                  type="text"
                  name="trade_level"
                  className={inputClass}
                  value={formData.trade_level}
                  onChange={handleInputChange}
                  placeholder="e.g., L3 SWD"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="dm-year">
                  Academic year
                </label>
                <input
                  id="dm-year"
                  type="text"
                  name="academic_year"
                  className={inputClass}
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="dm-term">
                  Term
                </label>
                <select id="dm-term" name="term" className={inputClass} value={formData.term} onChange={handleInputChange} required>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="dm-status">
                  Status
                </label>
                <select id="dm-status" name="status" className={inputClass} value={formData.status} onChange={handleInputChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="dm-json">
                Schedule data (JSON)
              </label>
              <textarea
                id="dm-json"
                name="schedule_data"
                className={`${inputClass} min-h-[200px] font-mono text-xs`}
                value={JSON.stringify(formData.schedule_data, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData((prev) => ({ ...prev, schedule_data: parsed }));
                  } catch {
                    /* invalid JSON */
                  }
                }}
                rows={10}
                placeholder='{"8:00-8:50": {"Monday": "MATH(1)", "Tuesday": "ENG(2)"}}'
              />
              <p className="mt-1 text-xs text-slate-500">Format: {"{ time_slot: { day: subject(teacher_code) } }"}</p>
            </div>

            <button type="submit" className={btnPrimary}>
              Create timetable
            </button>
          </form>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">All timetables</h2>
        {loading ? (
          <p className="text-slate-600">Loading timetables…</p>
        ) : timetables.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
            No timetables found. Sync from the external service or create one manually.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {timetables.map((tt) => (
              <article
                key={tt.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
                  <h3 className="font-bold text-slate-900">{tt.class_name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                      tt.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {tt.status}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 px-4 py-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Department: </span>
                    {tt.department}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Trade level: </span>
                    {tt.trade_level}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Academic year: </span>
                    {tt.academic_year}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Term: </span>
                    {tt.term}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Created by: </span>
                    {tt.created_by_name || tt.created_by_username || "System"}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
                  <button type="button" onClick={() => setSelectedTimetable(tt)} className={`${btnPrimary} !px-3 !py-1.5 !text-xs`}>
                    View
                  </button>
                  {tt.status === "draft" && (
                    <button type="button" onClick={() => handlePublishTimetable(tt.id)} className={btnSuccess}>
                      Publish
                    </button>
                  )}
                  <button type="button" onClick={() => handleDeleteTimetable(tt.id)} className={btnDanger}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTimetable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="timetable-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <h2 id="timetable-modal-title" className="text-lg font-bold text-slate-900">
                {selectedTimetable.class_name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTimetable(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="max-h-[calc(90vh-4rem)] overflow-y-auto p-4 sm:p-6">
              <TimetableGrid schedule={selectedTimetable.schedule_data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
