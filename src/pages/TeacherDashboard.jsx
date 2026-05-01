import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, getApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/timetables.css";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState(null);

  const department = searchParams.get("department");
  const tradeLevel = searchParams.get("trade_level");

  useEffect(() => {
    loadTimetables();
  }, [department, tradeLevel]);

  const loadTimetables = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (department) params.append("department", department);
      if (tradeLevel) params.append("trade_level", tradeLevel);
      params.append("status", "published");

      const response = await api.get(`/timetables?${params.toString()}`);
      setTimetables(response.data || []);
    } catch (err) {
      setError(getApiError(err, "Failed to load timetables"));
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimetable = (timetable) => {
    setSelectedTimetable(timetable);
  };

  const handleDownloadTimetable = (timetable) => {
    if (!timetable.schedule_data) return;

    const dataStr = JSON.stringify(timetable.schedule_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timetable_${timetable.class_name}_${timetable.trade_level}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintTimetable = (timetable) => {
    if (!timetable.schedule_data) return;

    const printWindow = window.open("", "_blank");
    const scheduleData = timetable.schedule_data;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Timetable - ${timetable.class_name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
          .info { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Timetable</h1>
        <div class="info">
          <p><strong>Class:</strong> ${timetable.class_name}</p>
          <p><strong>Department:</strong> ${timetable.department}</p>
          <p><strong>Trade Level:</strong> ${timetable.trade_level}</p>
          <p><strong>Academic Year:</strong> ${timetable.academic_year}</p>
          <p><strong>Term:</strong> ${timetable.term}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              ${days.map(day => `<th>${day}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
    `;

    const sortedTimes = Object.keys(scheduleData).sort((a, b) => {
      const timeA = parseInt(a.split(":")[0]);
      const timeB = parseInt(b.split(":")[0]);
      return timeA - timeB;
    });

    for (const time of sortedTimes) {
      tableHTML += `<tr><td>${time}</td>`;
      for (const day of days) {
        const cellValue = scheduleData[time][day] || "--";
        tableHTML += `<td>${cellValue}</td>`;
      }
      tableHTML += `</tr>`;
    }

    tableHTML += `
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
  };

  return (
    <div className="page-container teacher-dashboard">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome, {user?.full_name || user?.username}</p>
      </div>

      <div className="dashboard-content">
        <div className="timetables-section">
          <div className="section-header">
            <h2>Time Tables</h2>
            {department && <p>Department: {department}</p>}
            {tradeLevel && <p>Trade Level: {tradeLevel}</p>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="timetables-layout">
            <div className="timetables-list">
              {loading ? (
                <p>Loading timetables...</p>
              ) : timetables.length === 0 ? (
                <p>No timetables available.</p>
              ) : (
                <div className="timetable-cards">
                  {timetables.map((timetable) => (
                    <div key={timetable.id} className="timetable-card">
                      <h3>{timetable.class_name}</h3>
                      <p><strong>Department:</strong> {timetable.department}</p>
                      <p><strong>Trade Level:</strong> {timetable.trade_level}</p>
                      <p><strong>Academic Year:</strong> {timetable.academic_year}</p>
                      <p><strong>Term:</strong> {timetable.term}</p>
                      <div className="timetable-actions">
                        <button onClick={() => handleViewTimetable(timetable)} className="btn btn-primary">
                          View
                        </button>
                        <button onClick={() => handleDownloadTimetable(timetable)} className="btn btn-secondary">
                          Download
                        </button>
                        <button onClick={() => handlePrintTimetable(timetable)} className="btn btn-secondary">
                          Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="timetable-viewer">
              {selectedTimetable ? (
                <div className="timetable-detail">
                  <div className="timetable-detail-header">
                    <h2>{selectedTimetable.class_name}</h2>
                    <button onClick={() => setSelectedTimetable(null)} className="btn btn-light">Close</button>
                  </div>
                  <div className="timetable-info">
                    <p><strong>Department:</strong> {selectedTimetable.department}</p>
                    <p><strong>Trade Level:</strong> {selectedTimetable.trade_level}</p>
                    <p><strong>Academic Year:</strong> {selectedTimetable.academic_year}</p>
                    <p><strong>Term:</strong> {selectedTimetable.term}</p>
                  </div>
                  {selectedTimetable.schedule_data && (
                    <TimetableGrid schedule={selectedTimetable.schedule_data} />
                  )}
                </div>
              ) : (
                <div className="timetable-placeholder">
                  <p>Select a timetable to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimetableGrid({ schedule }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const sortedTimes = Object.keys(schedule).sort((a, b) => {
    const timeA = parseInt(a.split(":")[0]);
    const timeB = parseInt(b.split(":")[0]);
    return timeA - timeB;
  });

  return (
    <div className="timetable-grid-container">
      <table className="timetable-table">
        <thead>
          <tr>
            <th>Time</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTimes.map((time) => (
            <tr key={time}>
              <td className="time-cell">{time}</td>
              {days.map((day) => {
                const cellValue = schedule[time][day] || "--";
                const isFixed = ["ASSEMBLY", "BREAK", "LUNCH"].includes(cellValue.toUpperCase());
                return (
                  <td key={day} className={isFixed ? "fixed-cell" : "schedule-cell"}>
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
