import { useEffect, useState } from "react";
import { mediaUrl } from "../api/client";
import Seo from "../components/Seo";

export default function GalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/gallery");
        if (!response.ok) throw new Error("Failed to load gallery");
        const data = await response.json();
        setGallery(data || []);
      } catch (err) {
        console.error("Error loading gallery:", err);
        setError(err.message || "Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  const filteredGallery = filterType === "all" 
    ? gallery 
    : gallery.filter(item => item.media_type === filterType);

  if (loading) {
    return (
      <main className="main">
        <section className="section py-5">
          <div className="container text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 mb-0">Loading gallery...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <Seo
        title="Gallery - Lycee Saint Alexandre Sauli de Muhura"
        description="View our school gallery with photos and videos from events and activities."
        path="/gallery"
      />

      <div className="page-title" data-aos="fade" style={{ backgroundColor: "var(--brand-accent)" }}>
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center py-5">
              <div className="col-lg-8">
                <h1 className="text-white fw-bold">Gallery</h1>
                <p className="text-white" style={{ opacity: 0.9 }}>
                  Explore photos and videos from our school activities, events, and moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section py-5">
        <div className="container">
          {/* Filter buttons */}
          <div className="d-flex justify-content-center gap-2 mb-5" data-aos="fade-up">
            <button
              className={`btn ${filterType === "all" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button
              className={`btn ${filterType === "image" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilterType("image")}
            >
              <i className="bi bi-image me-2"></i>Photos
            </button>
            <button
              className={`btn ${filterType === "video" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilterType("video")}
            >
              <i className="bi bi-play-circle me-2"></i>Videos
            </button>
          </div>

          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}

          {filteredGallery.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted fs-5">No gallery items found.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredGallery.map((item, index) => (
                <div
                  key={item.id}
                  className="col-md-6 col-lg-4"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {item.media_type === "image" ? (
                    <div
                      className="gallery-item position-relative overflow-hidden rounded"
                      style={{ cursor: "pointer", height: "300px" }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <img
                        src={mediaUrl(item.media_path)}
                        alt={item.title || "Gallery image"}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "/assets/img/placeholder.jpg";
                        }}
                      />
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.3)",
                          opacity: 0,
                          transition: "opacity 0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                      >
                        <i className="bi bi-zoom-in text-white fs-3"></i>
                      </div>
                      {item.title && (
                        <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-75 text-white">
                          <p className="mb-0 text-truncate">{item.title}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="gallery-item position-relative overflow-hidden rounded"
                      style={{ cursor: "pointer", height: "300px" }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <video
                        src={mediaUrl(item.media_path)}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                      <div
                        className="position-absolute top-50 start-50 translate-middle"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.9)",
                          borderRadius: "50%",
                          width: "60px",
                          height: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="bi bi-play-fill text-primary fs-3"></i>
                      </div>
                      {item.title && (
                        <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-75 text-white">
                          <p className="mb-0 text-truncate">{item.title}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for expanded view */}
      {selectedItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelectedItem(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header border-0">
                <h5 className="modal-title">{selectedItem.title || "Gallery Item"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedItem(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                {selectedItem.media_type === "image" ? (
                  <img
                    src={mediaUrl(selectedItem.media_path)}
                    alt={selectedItem.title || "Gallery image"}
                    className="w-100"
                    onError={(e) => {
                      e.target.src = "/assets/img/placeholder.jpg";
                    }}
                  />
                ) : (
                  <video
                    src={mediaUrl(selectedItem.media_path)}
                    className="w-100"
                    controls
                    autoPlay
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
