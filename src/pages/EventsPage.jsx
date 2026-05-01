import { useEffect, useMemo, useRef, useState } from "react";
import { mediaUrl } from "../api/client";
import { eventsAPI } from "../api/services";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [eventBgColor, setEventBgColor] = useState("#E6C56A");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef(null);

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

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(normalizedSearch) ||
          event.description?.toLowerCase().includes(normalizedSearch)
      );
    }

    return filtered;
  }, [events, filterCategory, searchTerm]);

  useEffect(() => {
    if (filteredEvents.length === 0) {
      setActiveSlide(0);
      return;
    }
    setActiveSlide((current) => Math.min(current, filteredEvents.length - 1));
  }, [filteredEvents.length]);

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

  const goToSlide = (index) => {
    if (!sliderRef.current || filteredEvents.length === 0) return;
    const cards = sliderRef.current.querySelectorAll("[data-event-card]");
    const nextCard = cards[index];
    if (!nextCard) return;
    nextCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActiveSlide(index);
  };

  const slideCards = (direction) => {
    if (filteredEvents.length === 0) return;
    const nextIndex = (activeSlide + direction + filteredEvents.length) % filteredEvents.length;
    goToSlide(nextIndex);
  };

  useEffect(() => {
    if (!sliderRef.current) return undefined;

    const slider = sliderRef.current;
    const handleScroll = () => {
      const cards = [...slider.querySelectorAll("[data-event-card]")];
      if (cards.length === 0) return;

      const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(sliderCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveSlide(closestIndex);
    };

    slider.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => slider.removeEventListener("scroll", handleScroll);
  }, [filteredEvents.length]);

  useEffect(() => {
    if (filteredEvents.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => {
        const nextIndex = (current + 1) % filteredEvents.length;
        const cards = sliderRef.current?.querySelectorAll("[data-event-card]");
        const nextCard = cards?.[nextIndex];
        nextCard?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        return nextIndex;
      });
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [filteredEvents.length]);

  if (loading) {
    return (
      <main className="main">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading events...</span>
          </div>
          <p className="mt-3 text-muted">Loading events...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
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
              <div className="modal-header border-0" style={{ backgroundColor: "#004080" }}>
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
                  />
                )}
                <div className="mb-3">
                  <span className="badge" style={{ backgroundColor: "#E6C56A" }}>
                    {selectedEvent.category || "General"}
                  </span>
                </div>
                <div className="mb-3 small text-muted">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar-event me-2" style={{ color: "#E6C56A" }}></i>
                    <span>{formatEventDate(selectedEvent.created_at || selectedEvent.date)}</span>
                  </div>
                  {selectedEvent.location && (
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt me-2" style={{ color: "#E6C56A" }}></i>
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
                    style={{ backgroundColor: "#E6C56A" }}
                  >
                    Register Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-title" data-aos="fade" style={{ backgroundColor: "#E6C56A" }}>
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center py-5">
              <div className="col-lg-8">
                <h1 className="text-white fw-bold">Events</h1>
                <p className="text-white" style={{ opacity: 0.9 }}>
                  Stay updated with the latest school activities, celebrations, and important events at Lycee Saint Alexandre Sauli De Muhura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-4" data-aos="fade-up">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="d-flex flex-wrap gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ minWidth: "200px", maxWidth: "350px" }}
              placeholder="Search title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0 small">Card Color:</label>
              <input
                type="color"
                className="form-control form-control-color form-control-sm"
                style={{ width: "40px", height: "30px", padding: "2px" }}
                value={eventBgColor}
                onChange={(e) => setEventBgColor(e.target.value)}
                title="Change event card background color"
              />
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setFilterCategory("all");
                setSearchTerm("");
                setEventBgColor("#E6C56A");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <section className="container mb-5" data-aos="fade-up">
        <div
          className="rounded-4 p-4 p-lg-5"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(246,239,214,0.9))",
            border: "1px solid rgba(230,197,106,0.35)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "#004080" }}>Featured Events</h2>
              <p className="mb-0 text-muted">
                Slide through the latest activities and open any card for the full event.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => slideCards(-1)}
                className="btn rounded-circle border-0"
                style={{
                  width: "46px",
                  height: "46px",
                  backgroundColor: "#E6C56A",
                  color: "#000",
                  boxShadow: "0 10px 24px rgba(230,197,106,0.35)",
                }}
                aria-label="Previous events"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                type="button"
                onClick={() => slideCards(1)}
                className="btn rounded-circle border-0"
                style={{
                  width: "46px",
                  height: "46px",
                  backgroundColor: "#E6C56A",
                  color: "#000",
                  boxShadow: "0 10px 24px rgba(230,197,106,0.35)",
                }}
                aria-label="Next events"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}

          <div
            ref={sliderRef}
            className="d-flex gap-4 overflow-auto pb-3"
            style={{
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
            }}
          >
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  data-event-card
                  className="flex-shrink-0"
                  style={{
                    width: "min(360px, 82vw)",
                    scrollSnapAlign: "center",
                    transform: index === activeSlide ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(0.97)",
                    opacity: index === activeSlide ? 1 : 0.8,
                    transition: "transform 0.4s ease, opacity 0.4s ease",
                  }}
                >
                  <div
                    className="card border-0 overflow-hidden h-100"
                    style={{
                      cursor: "pointer",
                      borderRadius: "1.5rem",
                      backgroundColor: eventBgColor,
                      border: "2px solid #E6C56A",
                      boxShadow: index === activeSlide
                        ? "0 24px 50px rgba(0,0,0,0.22)"
                        : "0 16px 32px rgba(0,0,0,0.12)",
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="position-relative">
                      {event.image_path ? (
                        <img
                          src={mediaUrl(event.image_path)}
                          className="card-img-top"
                          alt={event.title}
                          style={{ height: "240px", objectFit: "cover" }}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div
                          className="card-img-top d-flex align-items-center justify-content-center"
                          style={{
                            height: "240px",
                            background: "linear-gradient(135deg, #f8f9fa, #dbe8f4)",
                          }}
                        >
                          <i className="bi bi-calendar3-event" style={{ fontSize: "3.4rem", color: "#004080" }}></i>
                        </div>
                      )}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                          background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.5))",
                          pointerEvents: "none",
                        }}
                      ></div>
                      <div className="position-absolute top-0 start-0 p-3">
                        <span
                          className="badge text-dark fw-semibold px-3 py-2"
                          style={{ backgroundColor: "#E6C56A", borderRadius: "999px" }}
                        >
                          {event.category || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                        <i className="bi bi-calendar-event" style={{ color: "#004080" }}></i>
                        <span>{formatEventDate(event.created_at || event.date)}</span>
                      </div>
                      <h5 className="card-title fw-bold mb-3" style={{ color: "#0f172a" }}>
                        {event.title}
                      </h5>
                      <p className="card-text mb-4" style={{ color: "#334155", minHeight: "72px" }}>
                        {event.description?.slice(0, 180)}
                        {event.description?.length > 180 ? "..." : ""}
                      </p>
                      <button
                        className="btn btn-sm fw-semibold mt-auto align-self-start px-4 py-2"
                        style={{
                          backgroundColor: "#E6C56A",
                          color: "#000",
                          borderRadius: "999px",
                        }}
                      >
                        Explore Event <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-100">
                <div className="alert alert-info mb-0">No events available.</div>
              </div>
            )}
          </div>

          {filteredEvents.length > 1 && (
            <div className="mt-4">
              <div className="d-flex justify-content-center gap-2 mb-3">
                {filteredEvents.map((event, index) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to event ${index + 1}`}
                    className="border-0 p-0"
                    style={{
                      width: index === activeSlide ? "34px" : "10px",
                      height: "10px",
                      borderRadius: "999px",
                      backgroundColor: index === activeSlide ? "#004080" : "rgba(0,64,128,0.2)",
                      transition: "all 0.3s ease",
                    }}
                  ></button>
                ))}
              </div>

              <div className="d-flex justify-content-center gap-2 gap-md-3 flex-wrap">
                {filteredEvents.map((event, index) => (
                  <button
                    key={`${event.id}-thumb`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className="border-0 p-0 bg-transparent"
                    aria-label={`Preview ${event.title}`}
                    style={{
                      opacity: index === activeSlide ? 1 : 0.72,
                      transform: index === activeSlide ? "translateY(-2px)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      className="overflow-hidden"
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "16px",
                        border: index === activeSlide ? "3px solid #004080" : "2px solid rgba(230,197,106,0.8)",
                        boxShadow: index === activeSlide ? "0 10px 24px rgba(0,64,128,0.2)" : "0 6px 14px rgba(0,0,0,0.08)",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      {event.image_path ? (
                        <img
                          src={mediaUrl(event.image_path)}
                          alt={event.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center w-100 h-100"
                          style={{ background: "linear-gradient(135deg, #f8f9fa, #ece4bf)" }}
                        >
                          <i className="bi bi-calendar3-event" style={{ fontSize: "1.4rem", color: "#004080" }}></i>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
