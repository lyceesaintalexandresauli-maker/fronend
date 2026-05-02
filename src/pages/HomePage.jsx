import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { eventsAPI, staffAPI, contentAPI, departmentsAPI } from "../api/services";
import { getContentRows } from "../utils/helpers";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [content, setContent] = useState({});
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, staffRes, depsRes, contentRes, heroRes] = await Promise.all([
          eventsAPI.getAll().catch(() => ({ data: [] })),
          staffAPI.getAll().catch(() => ({ data: [] })),
          departmentsAPI.getAll().catch(() => ({ data: [] })),
          contentAPI.getGrouped().catch(() => ({ data: {} })),
          contentAPI.getByPageAndSection('index', 'hero-carousel').catch(() => ({ data: [] }))
        ]);
        setEvents((eventsRes.data || []).slice(0, 4));
        setStaff((staffRes.data || []).slice(0, 4));
        setDepartments(depsRes.data || []);
        setContent(contentRes.data || {});
        setHeroSlides(getContentRows(heroRes.data));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && window.Swiper) {
      new window.Swiper('.heroSwiper', {
        loop: true, speed: 800,
        autoplay: { delay: 4000, disableOnInteraction: false },
        slidesPerView: 1, spaceBetween: 0,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        effect: 'slide'
      });
    }
  }, [loading]);

  // Auto-play event slider
  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [events.length]);

  if (loading) return <div id="preloader"></div>;

  return (
    <main className="main">
      {/* Hero Section - Full Screen Slider */}
      <section id="hero" className="hero section position-relative">
        <div className="swiper heroSwiper" style={{ width: '100%', height: '100vh' }}>
          <div className="swiper-wrapper">
            {heroSlides.length > 0 ? heroSlides.map((slide, index) => (
              <div key={slide.id || index} className="swiper-slide position-relative">
                <img
                  src={mediaUrl(slide.image_path) || `/assets/img/photos/sod${10 - index}.jpg`}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover', width: '100%', height: '100vh' }}
                  alt={slide.title || `Slide ${index + 1}`}
                />
                <div className="container position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <div className="text-center px-4" style={{ color: '#ffffff' }}>
                    <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.3', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="50">
                      {slide.title || 'Welcome to Lycee saint Alexandre Sauli'}
                    </h2>
                    <h3 className="mb-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '400', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="100">
                      {slide.content || 'De Muhura Barnabites School'}
                    </h3>
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="swiper-slide position-relative">
                  <img src="/assets/img/photos/sod10.jpg" className="w-100 h-100" style={{ objectFit: 'cover', width: '100%', height: '100vh' }} alt="Welcome" />
                  <div className="container position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="text-center px-4" style={{ color: '#ffffff' }}>
                      <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.3', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="50">
                        Welcome to Lycee saint Alexandre Sauli
                      </h2>
                      <h3 className="mb-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '400', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="100">
                        De Muhura Barnabites's School
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide position-relative">
                  <img src="/assets/img/photos/sod0.jpg" className="w-100 h-100" style={{ objectFit: 'cover', width: '100%', height: '100vh' }} alt="Education" />
                  <div className="container position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="text-center px-4" style={{ color: '#ffffff' }}>
                      <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.3', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="50">
                        Quality Education & Moral Formation
                      </h2>
                      <h3 className="mb-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '400', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="100">
                        Building Tomorrow's Leaders Today
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide position-relative">
                  <img src="/assets/img/photos/sod1.jpg" className="w-100 h-100" style={{ objectFit: 'cover', width: '100%', height: '100vh' }} alt="Excellence" />
                  <div className="container position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="text-center px-4" style={{ color: '#ffffff' }}>
                      <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.3', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="50">
                        Excellence in Technical Education
                      </h2>
                      <h3 className="mb-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '400', color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} data-aos="fade-up" data-aos-delay="100">
                        ICT, Fashion Design, and Accounting Programs
                      </h3>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="swiper-pagination" style={{ bottom: '30px' }}></div>
          <div className="swiper-button-next" style={{ color: 'white' }}></div>
          <div className="swiper-button-prev" style={{ color: 'white' }}></div>
        </div>
      </section>

      {/* Events Section */}
      {events.length > 0 && (
        <section className="py-2" style={{ backgroundColor: '#E6C56A' }}>
          <div className="container" data-aos="fade-up">
            <div className="mb-2">
              <h2 className="fw-bold mb-1 text-white" style={{ fontSize: '1.5rem' }}>Recent Events</h2>
            </div>
            <div style={{ width: '100%', height: '86px', position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  height: '100%',
                  transition: 'transform 0.6s ease-in-out',
                  transform: `translateX(-${currentEventIndex * 100}%)`
                }}
              >
                {events.map((event) => (
                  <div key={event.id} style={{ minWidth: '100%', height: '100%', position: 'relative' }}>
                    <div className="card h-100 border-0 shadow-sm" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
                      <div style={{ width: '220px', flexShrink: 0, overflow: 'hidden' }}>
                        {event.image_path && (
                          <img
                            src={mediaUrl(event.image_path)}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover', height: '86px', transform: 'scale(1.15)', transformOrigin: 'center center' }}
                            alt={event.title}
                          />
                        )}
                      </div>
                      <div className="p-2 d-flex flex-column justify-content-center" style={{ flex: 1, backgroundColor: '#E6C56A' }}>
                        <span className="badge d-inline-block mb-0 px-2 py-1" style={{ backgroundColor: 'white', color: '#333', fontSize: '0.7rem', borderRadius: '4px', width: 'fit-content' }}>
                          {event.category || 'General'}
                        </span>
                        <h3 className="fw-bold mb-0" style={{ fontSize: '1rem', color: 'white' }}>
                          {event.title}
                        </h3>
                        <p className="text-white mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.3', flex: 1, opacity: 0.9 }}>
                          {event.description}
                        </p>
                        <div className="small text-white mb-0" style={{ opacity: 0.8, fontSize: '0.75rem' }}>
                          <i className="bi bi-calendar-event me-2"></i>
                          {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {events.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentEventIndex((prev) => (prev - 1 + events.length) % events.length)}
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <i className="bi bi-chevron-left" style={{ fontSize: '1.1rem', color: '#333' }}></i>
                  </button>
                  <button
                    onClick={() => setCurrentEventIndex((prev) => (prev + 1) % events.length)}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <i className="bi bi-chevron-right" style={{ fontSize: '1.1rem', color: '#333' }}></i>
                  </button>
                  <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                    {events.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentEventIndex(index)}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: index === currentEventIndex ? 'white' : 'rgba(255,255,255,0.5)',
                          transition: 'background-color 0.3s'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="text-end mt-2">
              <Link
                to="/events"
                className="btn fw-bold text-white"
                style={{ backgroundColor: '#004080', color: 'white', padding: '0.6rem 2rem', borderRadius: '8px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid white' }}
              >
                View All Events <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="about section py-5">
        <div className="container" data-aos="fade-up">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5 order-lg-2" data-aos="fade-left" data-aos-delay="100">
              <div className="about-img position-relative" style={{ backgroundColor: '#E6C56A', padding: '2rem', borderRadius: '8px' }}>
                <img
                  src={mediaUrl(content['about']?.[0]?.image_path) || "/assets/img/logo1.jpg"}
                  className="img-fluid rounded"
                  alt="About Our School"
                  style={{ maxHeight: '450px', objectFit: 'cover', width: '100%', display: 'block', margin: '0 auto' }}
                />
              </div>
            </div>
            <div className="col-lg-7 order-lg-1" data-aos="fade-right" data-aos-delay="200">
              <h3 className="mb-3" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#333' }}>
                {content['about']?.[0]?.title || 'Who We Are'}
              </h3>
              <div className="fst-italic mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }} dangerouslySetInnerHTML={{ __html: content['about']?.[0]?.content || '' }} />
              
              <ul className="list-unstyled mb-4">
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-circle me-2" style={{ color: '#E6C56A', fontSize: '1.3rem', marginTop: '2px' }}></i>
                  <span style={{ fontSize: '1.05rem' }}>Strong discipline and character formation.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-circle me-2" style={{ color: '#E6C56A', fontSize: '1.3rem', marginTop: '2px' }}></i>
                  <span style={{ fontSize: '1.05rem' }}>High-quality technical and vocational training.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-circle me-2" style={{ color: '#E6C56A', fontSize: '1.3rem', marginTop: '2px' }}></i>
                  <span style={{ fontSize: '1.05rem' }}>Catholic education rooted in moral and spiritual values.</span>
                </li>
              </ul>
              
              <Link to="/about" className="btn btn-wall-yellow btn-lg rounded-pill px-4">
                <span>Read More</span> <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="section why-us py-5">
        <div className="container" data-aos="fade-up">
          <div className="row gy-4">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="why-box h-100 p-5" style={{ backgroundColor: '#E6C56A', color: 'white', borderRadius: '8px' }}>
                <h3 className="mb-4" style={{ fontSize: '2rem', fontWeight: '700' }}>
                  {content['index']?.[0]?.title || 'Why Choose Our School?'}
                </h3>
                <p className="mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: content['index']?.[0]?.content || '' }} />
                <div className="text-center">
                  <Link to="/about" className="btn btn-light rounded-pill px-4 py-2">
                    <span>Learn More</span> <i className="bi bi-chevron-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row gy-4">
                <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                  <div className="icon-box text-center h-100 p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: 'white' }}>
                    <div className="mb-3" style={{ width: '60px', height: '60px', margin: '0 auto', borderRadius: '50%', backgroundColor: '#FFF8E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-clipboard-data" style={{ fontSize: '1.8rem', color: '#E6C56A' }}></i>
                    </div>
                    <h4 className="mb-3" style={{ fontSize: '1.3rem', fontWeight: '700', color: '#333' }}>Technical Excellence</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>Quality training in ICT, Fashion Design, and Accounting.</p>
                  </div>
                </div>
                <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                  <div className="icon-box text-center h-100 p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: 'white' }}>
                    <div className="mb-3" style={{ width: '60px', height: '60px', margin: '0 auto', borderRadius: '50%', backgroundColor: '#FFF8E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-gem" style={{ fontSize: '1.8rem', color: '#E6C56A' }}></i>
                    </div>
                    <h4 className="mb-3" style={{ fontSize: '1.3rem', fontWeight: '700', color: '#333' }}>Discipline & Integrity</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>We mold students into confident, disciplined citizens.</p>
                  </div>
                </div>
                <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                  <div className="icon-box text-center h-100 p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: 'white' }}>
                    <div className="mb-3" style={{ width: '60px', height: '60px', margin: '0 auto', borderRadius: '50%', backgroundColor: '#FFF8E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-book" style={{ fontSize: '1.8rem', color: '#E6C56A' }}></i>
                    </div>
                    <h4 className="mb-3" style={{ fontSize: '1.3rem', fontWeight: '700', color: '#333' }}>Faith & Moral Formation</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>Daily spiritual guidance from Barnabite Fathers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="courses section py-5">
        <div className="container" data-aos="fade-up">
          <div className="section-title text-center mb-5">
            <h2 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#333' }}>Programs</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Our Technical Courses</p>
          </div>
          {departments.length > 0 ? (
            <div className="row gy-4">
              {departments.map((dep, index) => (
                <div key={dep.id} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={index * 100}>
                  <div className="card h-100 border-0 shadow-sm" style={{ transition: 'transform 0.3s, box-shadow 0.3s' }}>
                    <div className="position-relative overflow-hidden" style={{ height: '180px' }}>
                      <img
                        src={mediaUrl(dep.image_path) || "/assets/img/photos/sod1.jpg"}
                        className="w-100 h-100 object-fit-cover"
                        style={{ transition: 'transform 0.5s' }}
                        alt={dep.name}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="badge position-absolute top-0 start-0 m-2" style={{ backgroundColor: '#E6C56A' }}>
                        {dep.code || dep.name?.substring(0,3).toUpperCase() || "N/A"}
                      </span>
                    </div>
                    <div className="card-body p-4">
                      <h5 className="card-title fw-bold mb-2">{dep.name}</h5>
                      <p className="card-text text-muted small" style={{ lineHeight: '1.6' }}>
                        {dep.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-12 text-center py-5">
              <p className="text-muted">Loading courses...</p>
            </div>
          )}
        </div>
      </section>

      {/* Staff Section */}
      <section id="trainers-index" className="section trainers-index">
        <div className="container" data-aos="fade-up">
          <div className="section-title text-center mb-5">
            <h2>Our Dedicated Team</h2>
            <p>Trainers & Staff</p>
          </div>
          <div className="row gy-4">
            {staff.length > 0 ? staff.map((member, index) => (
              <div key={member.id} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="member">
                  <div className="member-img" style={{ height: '250px', overflow: 'hidden' }}>
                    {member.image_path ? (
                      <img 
                        src={mediaUrl(member.image_path)} 
                        className="img-fluid w-100 h-100" 
                        style={{ objectFit: 'cover' }}
                        alt={member.name}
                      />
                    ) : (
                      <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-circle text-muted" style={{ fontSize: '4rem' }}></i>
                      </div>
                    )}
                  </div>
                  <div className="member-info p-4">
                    <h4>{member.name}</h4>
                    <span>{member.position || member.department || 'Staff'}</span>
                    <p className="text-muted small">{member.bio}</p>
                    <div className="social">
                      {member.email && <a href={`mailto:${member.email}`}><i className="bi bi-envelope"></i></a>}
                      {member.phone && <a href={`tel:${member.phone}`}><i className="bi bi-telephone"></i></a>}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12 text-center py-5">
                <p className="text-muted">Loading staff...</p>
              </div>
            )}
          </div>
          <div className="text-end mt-4">
            <Link
              to="/trainers"
              className="btn fw-semibold text-white"
              style={{ backgroundColor: '#004080', borderRadius: '8px', padding: '0.7rem 1.6rem' }}
            >
              View All Staff <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
