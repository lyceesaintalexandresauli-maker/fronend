const timetableUrl = String(import.meta.env.VITE_CLIENT_TIMETABLE_URL || "").replace(/\/+$/, "");

export default function TimetablesPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Class timetables
          </h1>
        </header>

        {timetableUrl ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src={timetableUrl}
              title="Client Timetable"
              className="block h-[78vh] w-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Set <code>VITE_CLIENT_TIMETABLE_URL</code> in <code>fronend/.env</code>.
          </div>
        )}
      </main>
    </div>
  );
}
