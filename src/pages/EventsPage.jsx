import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "../api/client";
import { eventsAPI } from "../api/services";
import Seo from "../components/Seo";
import "./EventsPage.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const res = await eventsAPI.getAll();
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err.response?.data?.error || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (filterCategory !== "all") {
      filtered = filtered.filter((event) => event.category?.toLowerCase() === filterCategory.toLowerCase());
    }

    if (filterType !== "all") {
      filtered = filtered.filter((event) => (event.event_type || event.type || "Other").toLowerCase() === filterType.toLowerCase());
    }

    if (filterDate) {
      filtered = filtered.filter((event) => {
        const date = new Date(event.date || event.created_at);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === filterDate;
      });
    }

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(normalizedSearch) ||
          event.description?.toLowerCase().includes(normalizedSearch)
      );
    }

    filtered.sort((a, b) => {
      const difference = new Date(a.date || a.created_at) - new Date(b.date || b.created_at);
      return sortOrder === "newest" ? -difference : difference;
    });
    return filtered;
  }, [events, filterCategory, filterType, filterDate, searchTerm, sortOrder]);

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categories = ["all", ...new Set(events.map((e) => e.category).filter(Boolean))];
  const eventTypes = ["all", ...new Set(events.map((event) => event.event_type || event.type).filter(Boolean))];

  const today = new Date();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthOffset = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const eventDays = new Set(events.map((event) => {
    const date = new Date(event.date || event.created_at);
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() ? date.getDate() : null;
  }).filter(Boolean));
  const upcomingEvents = [...events]
    .filter((event) => {
      const date = new Date(event.date || event.created_at);
      return !Number.isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    })
    .sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at))
    .slice(0, 6);

  return (
    <main className="main">
      <Seo
        title="Events"
        description="Discover upcoming and recent school events, activities, and celebrations at Lycee Saint Alexandre Sauli de Muhura."
        path="/events"
      />
      {selectedEvent && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedEvent(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ borderRadius: "1rem", overflow: "hidden" }}
            >
              <div className="modal-header border-0" style={{ backgroundColor: "#211c13" }}>
                <h5 className="modal-title text-white fw-bold">{selectedEvent.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedEvent(null)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedEvent.image_path && (
                  <img
                    src={mediaUrl(selectedEvent.image_path)}
                    alt={selectedEvent.title}
                    className="w-100 rounded mb-3"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                    width="1200"
                    height="675"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="mb-3">
                  <span className="badge" style={{ backgroundColor: "var(--brand-accent)" }}>
                    {selectedEvent.category || "General"}
                  </span>
                </div>
                <div className="mb-3 small text-muted">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar-event me-2" style={{ color: "var(--brand-accent)" }}></i>
                    <span>{formatEventDate(selectedEvent.created_at || selectedEvent.date)}</span>
                  </div>
                  {selectedEvent.location && (
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt me-2" style={{ color: "var(--brand-accent)" }}></i>
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                </div>
                <div className="mb-3" style={{ lineHeight: "1.8", fontSize: "1rem" }}>
                  {selectedEvent.description}
                </div>
                {selectedEvent.registration_link && (
                  <a
                    href={selectedEvent.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn fw-semibold text-white"
                    style={{ backgroundColor: "var(--brand-accent)" }}
                  >
                    Register Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="events-page container-fluid px-3 px-lg-4 pb-5" data-aos="fade-up">
        <div className="events-hero">
          <div className="events-hero-copy">
            <span className="events-kicker">Lycee Saint Alexandre Sauli de Muhura</span>
            <h1>Events</h1>
            <p>Stay updated with the latest school activities, celebrations, and important events at Lycee Saint Alexandre Sauli De Muhura.</p>
          </div>
        </div>
        <form className="events-filter-bar" onSubmit={(event) => event.preventDefault()}>
          <label className="events-filter-field"><span><i className="bi bi-calendar-event" /> Search by Date</span><input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} /></label>
          <label className="events-filter-field"><span><i className="bi bi-funnel-fill" /> Event Type</span><select value={filterType} onChange={(event) => setFilterType(event.target.value)}>{eventTypes.map((type) => <option key={type} value={type}>{type === "all" ? "All Event Types" : type}</option>)}</select></label>
          <label className="events-filter-field"><span><i className="bi bi-tag-fill" /> Category</span><select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>{categories.map((category) => <option key={category} value={category}>{category === "all" ? "All Categories" : category}</option>)}</select></label>
          <label className="events-filter-field events-search-field"><span><i className="bi bi-search" /> Search Events</span><input type="search" placeholder="Search events..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
          <button className="events-search-button" type="submit"><i className="bi bi-search" /> Search Events</button>
        </form>
        <div className="events-layout">
          <div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {loading && <div className="alert alert-light" role="status">Fetching latest events...</div>}
            <div className="events-list-heading"><div><h2><i className="bi bi-calendar2-week-fill" /> All Events</h2><p>Showing {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"} from Lycee Saint Alexandre Sauli De Muhura.</p></div><label>Sort by: <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest First</option><option value="oldest">Oldest First</option></select></label></div>
            <div className="events-grid">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.date || event.created_at);
                return <article className="event-card" key={event.id}>
                  <button className="event-image-button" onClick={() => setSelectedEvent(event)} aria-label={`View ${event.title}`}>
                    {event.image_path ? <img src={mediaUrl(event.image_path)} alt={event.title} loading="lazy" decoding="async" /> : <span className="event-image-placeholder"><i className="bi bi-calendar-event" /></span>}
                    <span className="event-date-badge"><b>{Number.isNaN(eventDate.getTime()) ? "-" : String(eventDate.getDate()).padStart(2, "0")}</b><small>{Number.isNaN(eventDate.getTime()) ? "Date" : eventDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</small></span>
                    <span className="event-category">{event.category || "General"}</span>
                  </button>
                  <div className="event-card-content">
                    <h2>{event.title}</h2>
                    <p>{event.description?.slice(0, 145)}{event.description?.length > 145 ? "..." : ""}</p>
                    <div className="event-meta"><span><i className="bi bi-calendar3" />{formatEventDate(event.date || event.created_at)}</span>{event.location && <span><i className="bi bi-geo-alt" />{event.location}</span>}</div>
                    <button className="event-details" onClick={() => setSelectedEvent(event)}>View details <i className="bi bi-arrow-right" /></button>
                  </div>
                </article>;
              })}
              {!loading && filteredEvents.length === 0 && <div className="events-empty">No events match your search.</div>}
            </div>
          </div>
          <aside className="events-sidebar">
            <section className="events-side-panel">
              <div className="events-panel-title"><h2><i className="bi bi-calendar3" /> Event Calendar</h2><span>{monthLabel}</span></div>
              <div className="events-weekdays">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <b key={day}>{day}</b>)}</div>
              <div className="events-calendar">{Array.from({ length: monthOffset }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: monthDays }, (_, i) => <span key={i + 1} className={`${i + 1 === today.getDate() ? "today" : ""} ${eventDays.has(i + 1) ? "has-event" : ""}`}>{i + 1}</span>)}</div>
            </section>
            <section className="events-side-panel quick-events">
              <div className="events-panel-title"><h2><i className="bi bi-calendar2-check-fill" /> Upcoming Events</h2><span>Coming up next</span></div>
              {upcomingEvents.length ? upcomingEvents.map((event) => <button className="quick-event" key={event.id} onClick={() => setSelectedEvent(event)}><span className="quick-date">{new Date(event.date || event.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span><span className="quick-event-info"><b>{event.title}</b><small><i className="bi bi-clock" /> {event.time || "Date to be announced"}</small><small><i className="bi bi-geo-alt-fill" /> {event.location || "School grounds"}</small></span><i className="bi bi-chevron-right" /></button>) : <p className="events-no-quick">No upcoming events are scheduled yet.</p>}
            </section>
            <div className="events-quote"><i className="bi bi-quote" /><p>Together we build a brighter future through education.</p><small>- Lycee Saint Alexandre Sauli de Muhura</small></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
