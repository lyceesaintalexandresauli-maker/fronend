import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../api/client";
import TimetableGrid, { normalizeScheduleData } from "../components/TimetableGrid";

const selectClass =
  "min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";

export default function TimetablesPage() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("");
  const [tradeLevel, setTradeLevel] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/timetables/public/published");
        if (!cancelled) setTimetables(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getApiError(err, "Unable to load timetables. Please try again later."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTimetables = useMemo(() => {
    return timetables.filter((t) => {
      if (department && t.department !== department) return false;
      if (tradeLevel && t.trade_level !== tradeLevel) return false;
      return true;
    });
  }, [timetables, department, tradeLevel]);

  useEffect(() => {
    if (filteredTimetables.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && filteredTimetables.some((t) => t.id === prev)) return prev;
      return filteredTimetables[0].id;
    });
  }, [filteredTimetables]);

  const departments = useMemo(() => {
    const set = new Set();
    timetables.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set).sort();
  }, [timetables]);

  const tradeLevels = useMemo(() => {
    const set = new Set();
    const source = department ? timetables.filter((t) => t.department === department) : timetables;
    source.forEach((t) => {
      if (t.trade_level) set.add(t.trade_level);
    });
    return Array.from(set).sort();
  }, [timetables, department]);

  useEffect(() => {
    if (tradeLevel && !tradeLevels.includes(tradeLevel)) {
      setTradeLevel("");
    }
  }, [tradeLevels, tradeLevel]);

  const selected = useMemo(
    () => filteredTimetables.find((t) => t.id === selectedId) || null,
    [filteredTimetables, selectedId]
  );

  const handlePrint = () => {
    if (!selected) return;
    const scheduleData = normalizeScheduleData(selected.schedule_data);
    if (!scheduleData) return;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const sortedTimes = Object.keys(scheduleData).sort((a, b) => {
      const timeA = parseInt(String(a).split(":")[0], 10) || 0;
      const timeB = parseInt(String(b).split(":")[0], 10) || 0;
      return timeA - timeB;
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let rows = "";
    for (const time of sortedTimes) {
      rows += `<tr><td>${escapeHtml(time)}</td>`;
      for (const day of days) {
        const v = scheduleData[time]?.[day];
        const cell = v == null || v === "" ? "—" : String(v);
        rows += `<td>${escapeHtml(cell)}</td>`;
      }
      rows += "</tr>";
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(selected.class_name)} — Timetable</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    .meta { font-size: 0.9rem; color: #444; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; font-size: 0.85rem; }
    th { background: #1e293b; color: #fff; }
  </style>
</head>
<body>
  <h1>${escapeHtml(selected.class_name)}</h1>
  <div class="meta">
    ${escapeHtml(selected.department || "")} · ${escapeHtml(selected.trade_level || "")}<br/>
    ${escapeHtml(selected.academic_year || "")} · ${escapeHtml(selected.term || "")}
  </div>
  <table>
    <thead><tr><th>Time</th>${days.map((d) => `<th>${escapeHtml(d)}</th>`).join("")}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Class timetables</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Official published schedules from the school database. Select a class to view the full grid.
          </p>
        </header>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:gap-6 print:hidden">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-slate-700">
            Department
            <select
              id="tt-dept"
              className={selectClass}
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setTradeLevel("");
              }}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-slate-700">
            Trade level
            <select id="tt-level" className={selectClass} value={tradeLevel} onChange={(e) => setTradeLevel(e.target.value)}>
              <option value="">All levels</option>
              {tradeLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-600">
            Loading timetables…
          </div>
        ) : filteredTimetables.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-base font-medium text-slate-800">
              {timetables.length > 0
                ? "No timetables match the selected filters."
                : "No published timetables are available yet."}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              {timetables.length > 0
                ? "Try clearing department or trade level filters."
                : "Schedules appear here once administrators publish them. Please check back later."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4 print:hidden">
              <label htmlFor="tt-class" className="shrink-0 text-sm font-semibold text-slate-700">
                Class
              </label>
              <select
                id="tt-class"
                className={`${selectClass} sm:max-w-xl`}
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                {filteredTimetables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.class_name} — {t.trade_level} ({t.academic_year}, {t.term})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handlePrint}
                className="!inline-flex shrink-0 items-center justify-center rounded-lg !border border-slate-800 !bg-slate-800 px-4 py-2 text-sm font-semibold !text-white hover:!bg-slate-900 print:hidden"
              >
                Print
              </button>
            </div>

            {selected && (
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{selected.class_name}</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <p className="mb-4 text-sm text-slate-600">
                    {selected.department} · {selected.trade_level} · {selected.academic_year} · {selected.term}
                  </p>
                  <TimetableGrid schedule={selected.schedule_data} />
                </div>
              </article>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
