import DOSTimetableManager from "./admin/DOSTimetableManager";

/**
 * Admin timetable management backed by the API and database.
 */
export default function AdminTimetablesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <DOSTimetableManager />
    </div>
  );
}
