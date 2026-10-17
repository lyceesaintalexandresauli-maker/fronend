import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "../api/client";
import { eventsAPI } from "../api/services";
import Seo from "../components/Seo";
import { fetchAllEventsFromSupabase } from "../api/supabaseEvents";
import { isSupabaseConfigured } from "../supabase";
import "./EventsPage.css";

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getEventVideoUrl = (event) => {
  if (!event) return null;
  return event.video_url || event.video_path || event.video || event.media_url || null;
};

const isDirectVideoUrl = (value) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(value));

const getYoutubeEmbedUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      const shortCode = url.pathname.match(/\/shorts\/(.+)/)?.[1];
      if (shortCode) return `https://www.youtube.com/embed/${shortCode}`;
    }
    if (url.hostname.includes("vimeo.com")) {
      const match = url.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch {
    return null;
  }
  return null;
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let alive = true;
    let loadingRequest = false;
    let hasLoaded = false;
    const loadEvents = async () => {
      if (loadingRequest) return;
      loadingRequest = true;
      let nextEvents;
      try {
        if (!hasLoaded && alive) setLoading(true);
        if (isSupabaseConfigured()) {
          nextEvents = await fetchAllEventsFromSupabase();
        } else {
          const res = await eventsAPI.getAll();
          nextEvents = res.data || [];
        }
      } catch (err) {
        console.error("Error loading events:", err);
        if (!hasLoaded && alive) setError(err.response?.data?.error || "Failed to load events");
      } finally {
        if (!hasLoaded && alive) setLoading(false);
        hasLoaded = true;
        loadingRequest = false;
      }
      if (alive && typeof nextEvents !== "undefined") {
        setEvents(nextEvents);
        setError(null);
      }
    };
    loadEvents();
    const refreshTimer = window.setInterval(loadEvents, 20000);
    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") loadEvents();
    };
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      alive = false;
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (filterDate) {
      filtered = filtered.filter((event) => {
        const date = new Date(event.date || event.created_at);
        return !Number.isNaN(date.getTime()) && toLocalDateValue(date) === filterDate;
      });
    }

    if (mediaFilter === "videos") {
      filtered = filtered.filter((event) => Boolean(getEventVideoUrl(event)));
    } else if (mediaFilter === "images") {
      filtered = filtered.filter((event) => Boolean(event.image_path) && !getEventVideoUrl(event));
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at).getTime();
      const dateB = new Date(b.date || b.created_at).getTime();
      return dateB - dateA;
    });
    return filtered;
  }, [events, filterDate, mediaFilter]);

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const today = new Date();
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const monthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthDays = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const monthOffset = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const eventDays = new Map();
  events.forEach((event) => {
    const date = new Date(event.date || event.created_at);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== calendarYear || date.getMonth() !== calendarMonthIndex) return;
    eventDays.set(date.getDate(), [...(eventDays.get(date.getDate()) || []), event]);
  });
  const changeCalendarMonth = (offset) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };
  const selectCalendarDay = (day) => {
    const selectedDate = new Date(calendarYear, calendarMonthIndex, day);
    const value = toLocalDateValue(selectedDate);
    setFilterDate((current) => current === value ? "" : value);
  };
  const upcomingEvents = [...events]
    .filter((event) => {
      const date = new Date(event.date || event.created_at);
      return !Number.isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    })
    .sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at))
    .slice(0, 6);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedEvent(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <main className="main">
      <Seo
        title="Events"
        description="Discover upcoming and recent school events, activities, and celebrations at Lycee Saint Alexandre Sauli de Muhura."
        path="/events"
      />
      {selectedEvent && <div className="events-detail-overlay" role="presentation" onClick={() => setSelectedEvent(null)}>
        <article className="events-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="event-detail-title" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="events-detail-close" aria-label="Close event details" onClick={() => setSelectedEvent(null)}><i className="bi bi-x-lg" /></button>
          <div className="events-detail-image-wrap">
            {(() => {
              const videoUrl = getEventVideoUrl(selectedEvent);
              const embedUrl = videoUrl ? getYoutubeEmbedUrl(videoUrl) : null;
              if (videoUrl && embedUrl) {
                return (
                  <div className="events-detail-video-wrap">
                    <iframe
                      src={embedUrl}
                      title={`${selectedEvent.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              }
              if (videoUrl && isDirectVideoUrl(videoUrl)) {
                return <video className="events-detail-video" controls preload="metadata" src={videoUrl.startsWith("http") ? videoUrl : mediaUrl(videoUrl)} />;
              }
              if (selectedEvent.image_path) {
                return <img src={mediaUrl(selectedEvent.image_path)} alt={selectedEvent.title} />;
              }
              return <div className="events-detail-image-empty"><i className="bi bi-calendar-event" /></div>;
            })()}
            <span className="events-detail-category">{selectedEvent.category || "School event"}</span>
          </div>
          <div className="events-detail-content">
            <span className="events-detail-eyebrow"><i className="bi bi-stars" /> SCHOOL COMMUNITY</span>
            <h2 id="event-detail-title">{selectedEvent.title}</h2>
            <div className="events-detail-meta"><span><i className="bi bi-calendar-event" />{formatEventDate(selectedEvent.date || selectedEvent.created_at)}</span><span><i className="bi bi-geo-alt-fill" />{selectedEvent.location || "School grounds"}</span>{selectedEvent.time && <span><i className="bi bi-clock-fill" />{selectedEvent.time}</span>}</div>
            <p>{selectedEvent.description || "Join the school community for this special event."}</p>
            {getEventVideoUrl(selectedEvent) && <div className="events-video-tag"><i className="bi bi-play-circle-fill" /> Video event</div>}
            {selectedEvent.registration_link && <a className="events-detail-register" href={selectedEvent.registration_link} target="_blank" rel="noopener noreferrer">Learn more <i className="bi bi-arrow-up-right" /></a>}
          </div>
        </article>
      </div>}
      <section className="events-page container-fluid px-3 px-lg-4 pb-5" data-aos="fade-up">
        <div className="events-hero">
          <div className="events-hero-copy">
            <span className="events-kicker">Lycee Saint Alexandre Sauli de Muhura</span>
            <h1>Events</h1>
            <p>Stay updated with the latest school activities, celebrations, and important events at Lycee Saint Alexandre Sauli De Muhura.</p>
          </div>
        </div>
        <div className="events-filter-bar" aria-label="Calendar is the active event control">
          <div className="events-filter-field active-filter"><span><i className="bi bi-calendar-event" /> Select a date in the calendar</span><div className="events-filter-display active-display">{filterDate ? formatEventDate(filterDate) : "Choose an event date"}</div></div>
          <div className="events-filter-field active-filter"><span><i className="bi bi-funnel-fill" /> Event Type</span><div className="events-filter-display active-display">All event types</div></div>
          <label className="events-filter-field active-filter"><span><i className="bi bi-tag-fill" /> Category</span><select className="events-filter-display active-display" value={mediaFilter} onChange={(event) => setMediaFilter(event.target.value)} aria-label="Filter events by media category"><option value="all">All events</option><option value="videos">Videos</option><option value="images">Images</option></select></label>
          <div className="events-search-field active-filter"><span><i className="bi bi-info-circle" /> Browse events</span><div className="events-filter-display active-display">Use the calendar to choose a day</div></div>
          <div className="events-search-button active-button"><i className="bi bi-calendar-check" /> Calendar active</div>
        </div>
        <div className="events-layout">
          <div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {loading && <div className="alert alert-light" role="status">Fetching latest events...</div>}
            <div className="events-list-heading"><div><h2><i className="bi bi-calendar2-week-fill" /> {filterDate ? `Events on ${formatEventDate(filterDate)}` : "All Events"}</h2><p>Showing {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"} from Lycee Saint Alexandre Sauli De Muhura.</p></div></div>
            <div className="events-grid">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.date || event.created_at);
                return <article className="event-card" key={event.id}>
                  <div className="event-image-button" aria-label={event.title}>
                    {event.image_path ? <img src={mediaUrl(event.image_path)} alt={event.title} loading="lazy" decoding="async" /> : <span className="event-image-placeholder"><i className="bi bi-calendar-event" /></span>}
                    <span className="event-date-badge"><b>{Number.isNaN(eventDate.getTime()) ? "-" : String(eventDate.getDate()).padStart(2, "0")}</b><small>{Number.isNaN(eventDate.getTime()) ? "Date" : eventDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</small></span>
                    <span className="event-category">{event.category || "General"}</span>
                  </div>
                  <div className="event-card-content">
                    <h2>{event.title}</h2>
                    <p>{event.description?.slice(0, 145)}{event.description?.length > 145 ? "..." : ""}</p>
                    <div className="event-meta"><span><i className="bi bi-calendar3" />{formatEventDate(event.date || event.created_at)}</span>{event.location && <span><i className="bi bi-geo-alt" />{event.location}</span>}</div>
                    <button type="button" className="event-details" onClick={() => setSelectedEvent(event)}>View details <i className="bi bi-arrow-right" /></button>
                  </div>
                </article>;
              })}
              {!loading && filteredEvents.length === 0 && <div className="events-empty">No events match your search.</div>}
            </div>
          </div>
          <aside className="events-sidebar">
            <section className="events-side-panel">
              <div className="events-panel-title events-calendar-heading">
                <h2><i className="bi bi-calendar3" /> Event Calendar</h2>
                <div className="events-month-controls">
                  <button type="button" aria-label="Previous month" title="Previous month" onClick={() => changeCalendarMonth(-1)}><i className="bi bi-chevron-left" /></button>
                  <span>{monthLabel}</span>
                  <button type="button" aria-label="Next month" title="Next month" onClick={() => changeCalendarMonth(1)}><i className="bi bi-chevron-right" /></button>
                </div>
              </div>
              <div className="events-weekdays">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <b key={day}>{day}</b>)}</div>
              <div className="events-calendar">
                {Array.from({ length: monthOffset }, (_, i) => <span className="calendar-empty" key={`blank-${calendarYear}-${calendarMonthIndex}-${i}`} />)}
                {Array.from({ length: monthDays }, (_, i) => {
                  const day = i + 1;
                  const dateValue = toLocalDateValue(new Date(calendarYear, calendarMonthIndex, day));
                  const hasEvents = eventDays.has(day);
                  const isToday = day === today.getDate() && calendarMonthIndex === today.getMonth() && calendarYear === today.getFullYear();
                  const isSelected = filterDate === dateValue;
                  return <button type="button" key={dateValue} className={`calendar-day ${isToday ? "today" : ""} ${hasEvents ? "has-event" : ""} ${isSelected ? "selected" : ""}`} onClick={() => selectCalendarDay(day)} aria-label={`${monthLabel} ${day}${hasEvents ? `, ${eventDays.get(day).length} event${eventDays.get(day).length === 1 ? "" : "s"}` : ""}`} aria-pressed={isSelected} title={hasEvents ? `${eventDays.get(day).length} event${eventDays.get(day).length === 1 ? "" : "s"}` : "Filter by this date"}>
                    {day}{hasEvents && <i className="calendar-event-dot" />}
                  </button>;
                })}
              </div>
              {filterDate && <button type="button" className="events-clear-date" onClick={() => setFilterDate("")}>Clear selected date</button>}
            </section>
            <section className="events-side-panel quick-events">
              <div className="events-panel-title"><h2><i className="bi bi-calendar2-check-fill" /> Upcoming Events</h2><span>Coming up next</span></div>
              {upcomingEvents.length ? upcomingEvents.map((event) => <div className="quick-event" key={event.id}><span className="quick-date">{new Date(event.date || event.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span><span className="quick-event-info"><b>{event.title}</b><small><i className="bi bi-clock" /> {event.time || "Date to be announced"}</small><small><i className="bi bi-geo-alt-fill" /> {event.location || "School grounds"}</small></span><i className="bi bi-chevron-right" /></div>) : <p className="events-no-quick">No upcoming events are scheduled yet.</p>}
            </section>
            <div className="events-quote"><i className="bi bi-quote" /><p>Together we build a brighter future through education.</p><small>- Lycee Saint Alexandre Sauli de Muhura</small></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
