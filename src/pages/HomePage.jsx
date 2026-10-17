import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client";
import { eventsAPI, contentAPI, departmentsAPI } from "../api/services";
import Seo from "../components/Seo";
import "./HomePage.css";

const slides = [
  "/assets/img/photos/sod10.jpg",
  "/assets/img/photos/sod0.jpg",
  "/assets/img/photos/sod1.jpg",
];

const trades = [
  { code: "ACC", name: "Accounting and Business", description: "The Accounting Department equips students with practical and theoretical skills in financial management and business.", image: "/assets/img/acc1_resized.jpg", href: "/acc" },
  { code: "CSA", name: "Computer System and Architecture", description: "Learn how computer systems work, from hardware and software to servicing and support.", image: "/assets/img/photos/csa3.jpg", href: "/csa" },
  { code: "FAD", name: "Fashion Design", description: "Build creative skills in clothing, accessories, and footwear design.", image: "/assets/img/fad2_resized.jpg", href: "/fad" },
  { code: "SOD", name: "Software Development", description: "Learn programming and build useful software for real world needs.", image: "/assets/img/photos/sod4.jpg", href: "/sod" },
  { code: "NIT", name: "Networking and Internet Technology", description: "Develop practical skills in networks, connectivity, and internet technology.", image: "/assets/img/photos/nit1.jpg", href: "/nit" },
];

const values = [
  ["bi-clipboard-data", "Technical Excellence", "Quality training in ICT, Fashion Design, and related skills."],
  ["bi-gem", "Discipline & Integrity", "We mold students into confident, disciplined, responsible citizens."],
  ["bi-book", "Faith & Moral Formation", "Daily spiritual guidance from the Barnabite Fathers."],
  ["bi-people-fill", "Holistic Development", "Academic, moral, cultural, and practical training for life."],
];

const quickLinks = [
  ["bi-mortarboard", "Our Programs", "Quality education with technical and vocational training.", "/academic", "Learn More"],
  ["bi-calendar-event", "News & Events", "Stay informed about school activities.", "/events", "View News"],
  ["bi-people-fill", "Our Teachers", "Meet our dedicated teachers.", "/trainers", "Meet Our Staff"],
  ["bi-file-earmark-text", "Student Portal", "Access your timetable and school updates.", "/login", "Login"],
];

const galleryImages = [
  "/assets/img/photos/sod0.jpg",
  "/assets/img/photos/sod2.jpg",
  "/assets/img/photos/acc1_resized.jpg",
  "/assets/img/photos/csa3.jpg",
  "/assets/img/photos/fad4.jpg",
  "/assets/img/photos/nit1.jpg",
];

const getDate = (value) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase() : "SCHOOL";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [content, setContent] = useState({});
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 8000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      eventsAPI.getAll().catch(() => ({ data: [] })),
      departmentsAPI.getAll().catch(() => ({ data: [] })),
      contentAPI.getGrouped().catch(() => ({ data: {} })),
    ]).then(([eventRes, departmentRes, contentRes]) => {
      if (!active) return;
      setEvents(eventRes.data || []);
      setDepartments(departmentRes.data || []);
      setContent(contentRes.data || {});
    });
    return () => { active = false; };
  }, []);

  const about = content.about?.[0];
  const programCards = trades.map((trade) => {
    const department = departments.find((item) => `${item.code || ""} ${item.name || ""}`.toLowerCase().includes(trade.code.toLowerCase()));
    return {
      ...trade,
      image: mediaUrl(department?.image_path) || trade.image,
      description: department?.description || trade.description,
    };
  });
  const aboutText = about?.content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    || "Lycée St Alexandre Sauli de Muhura is a Catholic secondary school run by the Barnabite Fathers, committed to providing holistic education, moral values, and practical skills to help students build a better future.";

  return (
    <main className="home-page">
      <Seo title="Home" description="Quality education, moral formation, and practical training for future leaders at Lycée Saint Alexandre Sauli de Muhura." path="/" />

      <section className="home-hero" aria-label="Welcome">
        <div key={slide} className="home-hero-photo" style={{ backgroundImage: `url('${slides[slide]}')` }} role="img" aria-label={`Students learning at school, slide ${slide + 1}`} />
        <div className="home-hero-overlay" />
        <button className="home-hero-arrow home-hero-prev" type="button" aria-label="Previous slide" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}><i className="bi bi-chevron-left" /></button>
        <button className="home-hero-arrow home-hero-next" type="button" aria-label="Next slide" onClick={() => setSlide((slide + 1) % slides.length)}><i className="bi bi-chevron-right" /></button>
        <div className="home-wrap home-hero-copy">
          <p className="home-kicker" aria-label="Discipline, Excellence, Service">
            <span>Discipline</span><i aria-hidden="true">·</i><span>Excellence</span><i aria-hidden="true">·</i><span>Service</span>
          </p>
          <h1>Welcome to<br />Lycée St Alexandre Sauli<br />de Muhura</h1>
          <p>Quality education, moral formation, and practical training for future leaders.</p>
          <div className="home-hero-actions"><Link className="home-btn" to="/about">Explore Our School <i className="bi bi-arrow-right" /></Link><Link className="home-btn home-btn-outline" to="/academic">Learn More</Link></div>
        </div>
      </section>

      <section className="home-wrap home-shortcuts" aria-label="Quick links">
        {quickLinks.map(([icon, title, description, href, action]) => <Link className="home-shortcut-card" to={href} key={title}><span><i className={`bi ${icon}`} /></span><h2>{title}</h2><p>{description}</p><b>{action} <i className="bi bi-arrow-right" /></b></Link>)}
      </section>

      <section className="home-wrap home-intro">
        <div className="home-intro-copy"><span className="home-rule" /><h2>Who We Are</h2><p>{aboutText}</p><Link className="home-btn" to="/about">About Our School <i className="bi bi-arrow-right" /></Link></div>
        <figure className="home-founder"><img src="/assets/img/sauli2.jfif" alt="Painting of St. Alessandro Sauli" loading="lazy" /><figcaption><strong>St. Alessandro Sauli</strong><small>Barnabite</small></figcaption></figure>
      </section>

      <section className="home-values"><div className="home-wrap home-value-grid">{values.map(([icon, title, description]) => <article className="home-value-card" key={title}><span className="home-value-icon"><i className={`bi ${icon}`} /></span><h3>{title}</h3><p>{description}</p><Link to="/about" aria-label={`Learn about ${title}`}><i className="bi bi-arrow-right" /></Link></article>)}</div></section>

      <section className="home-wrap home-programs">
        <div className="home-heading"><span>Our Dedicated Team <i /></span><h2>Programs</h2><strong>Our Technical Courses</strong></div>
        <div className="home-program-grid">{programCards.map((program) => <article className="home-program-card" key={program.code}><Link to={program.href} className="home-program-photo"><img src={program.image} alt={program.name} loading="lazy" /><span>{program.code}</span></Link><div className="home-program-copy"><h3>{program.name}</h3><p>{program.description}</p><Link to={program.href}>Read More <i className="bi bi-arrow-right" /></Link></div></article>)}</div>
      </section>

      <section className="home-wrap home-community">
        <div className="home-events"><div className="home-events-head"><div className="home-small-heading"><span>Recent Events</span><h2>Latest Events</h2></div><Link className="home-btn home-btn-small" to="/events">View All Events <i className="bi bi-arrow-right" /></Link></div><div className="home-event-list">{events.slice(0, 3).map((event) => <article className="home-event" key={event.id}><img src={mediaUrl(event.image_path) || "/assets/img/photos/acc2.jpg"} alt="" loading="lazy" /><time>{getDate(event.created_at)}</time><div><h3>{event.title}</h3><p>{event.description}</p></div></article>)}{events.length === 0 && <div className="home-empty-state">School events and activities will appear here.</div>}</div></div>
      </section>

      <section className="home-gallery-strip"><div className="home-wrap"><div className="home-gallery-heading"><div className="home-small-heading"><span>Our Gallery</span><h2>Moments That Inspire</h2></div><Link to="/gallery">View All Photos <i className="bi bi-arrow-right" /></Link></div><div className="home-gallery-grid">{galleryImages.map((image) => <Link to="/gallery" key={image}><img src={image} alt="School life at Lycée Saint Alexandre Sauli" loading="lazy" /></Link>)}</div></div></section>

      <section className="home-join"><div className="home-join-overlay" /><div className="home-wrap home-join-content"><span className="home-join-icon"><i className="bi bi-mortarboard" /></span><div><h2>Ready to Join Our School?</h2><p>Take the first step towards a brighter future. Apply now or contact us to learn more.</p></div><div className="home-join-actions"><Link className="home-btn home-btn-white" to="/contact">Apply for Admission <i className="bi bi-arrow-right" /></Link><Link className="home-btn home-btn-outline" to="/contact">Contact Us</Link></div></div></section>
    </main>
  );
}
