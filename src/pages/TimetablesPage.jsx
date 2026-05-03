export default function TimetablesPage() {
  const flaskTimetableUrl = "https://admin-timetable.onrender.com";

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <iframe
        src={`${flaskTimetableUrl}/?_t=${Date.now()}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Timetable Viewer"
        allow="clipboard-write; clipboard-read"
      />
    </div>
  );
}
