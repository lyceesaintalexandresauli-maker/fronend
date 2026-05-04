import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";

const tiles = [
  {
    to: "/timetables",
    title: "Timetables",
    blurb: "Published class schedules",
    icon: "bi-calendar3",
  },
  {
    to: "/announcements",
    title: "Announcements",
    blurb: "News and notices",
    icon: "bi-megaphone",
  },
  {
    to: "/events",
    title: "Events",
    blurb: "Activities and dates",
    icon: "bi-calendar-event",
  },
  {
    to: "/academic",
    title: "Academic",
    blurb: "Programs and options",
    icon: "bi-mortarboard",
  },
];

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const displayName =
    user?.full_name?.trim() ||
    (user?.email ? String(user.email).split("@")[0] : "Student");
  const initial = displayName.charAt(0).toUpperCase() || "S";

  return (
    <main className="main student-portal bg-slate-100">
      <Seo
        title="Student Portal"
        description="Your student portal at Lycee Saint Alexandre Sauli de Muhura."
        path="/student"
      />

      <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#003d7a] via-[#004080] to-[#001f40] pb-28 pt-10 sm:pt-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--brand-accent-soft)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-brand-muted text-center text-xs font-semibold uppercase tracking-[0.2em]">
            Student portal
          </p>
          <h1 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back, {displayName}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-white/85 sm:text-base">
            Use the shortcuts below for timetables, announcements, and school information. Your session is
            private to this device until you sign out.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-20 max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5">
              <div className="h-20 bg-gradient-to-r from-[#004080] to-[#002a52]" />
              <div className="relative -mt-12 px-6 pb-6 text-center">
                <div
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white text-3xl font-bold shadow-md"
                  style={{ backgroundColor: "var(--brand-accent)", color: "#f7efe8" }}
                  aria-hidden
                >
                  {initial}
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{displayName}</h2>
                <p className="mt-1 truncate text-sm text-slate-500" title={user?.email || ""}>
                  {user?.email || "—"}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">Student account</p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    className="student-portal-btn-muted inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:ring-slate-300"
                    onClick={() => logout()}
                  >
                    Sign out
                  </button>
                  <Link
                    to="/"
                    className="link-brand-accent inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                  >
                    School home
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Shortcuts</h3>
                  <p className="text-sm text-slate-500">Jump to the most-used student pages</p>
                </div>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#004080] underline-offset-2 hover:underline"
                >
                  Account help
                </Link>
              </div>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {tiles.map(({ to, title, blurb, icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group flex gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-[#004080]/25 hover:bg-white hover:shadow-md"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-[#004080] shadow-sm ring-1 ring-slate-200/80 transition group-hover:bg-[#004080] group-hover:text-[color:var(--brand-on-dark)] group-hover:ring-[#004080]">
                        <i className={`bi ${icon}`} aria-hidden />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block font-semibold text-slate-900 group-hover:text-[#004080]">
                          {title}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-500">{blurb}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
