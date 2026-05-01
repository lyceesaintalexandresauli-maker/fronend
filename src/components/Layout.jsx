import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import NavTree from "./NavTree";

const fallbackNavigation = [
  { id: 1, label: "Home", href: "/", children: [] },
  { id: 2, label: "About", href: "/about", children: [] },
  { id: 3, label: "Academic", href: "/academic", children: [] },
  { id: 15, label: "Time Tables", href: "/timetables", children: [] },
  { id: 4, label: "Staff", href: "/trainers", children: [] },
  { id: 5, label: "Events", href: "/events", children: [] },
  { id: 6, label: "Announcements", href: "/anouncement", children: [] },
  {
    id: 7,
    label: "Departments",
    href: null,
    children: [
      { id: 8, label: "Fashion Design (FAD)", href: "/fad", children: [] },
      { id: 9, label: "Accounting", href: "/acc", children: [] },
      {
        id: 10,
        label: "ICT",
        href: null,
        children: [
          { id: 11, label: "Software Development (SOD)", href: "/sod", children: [] },
          { id: 12, label: "Computer Systems & Architecture (CSA)", href: "/csa", children: [] },
          { id: 13, label: "Networking & Internet Technology (NIT)", href: "/nit", children: [] },
        ],
      },
    ],
  },
  { id: 14, label: "Contact", href: "/contact", children: [] },
];

const pathToPage = (pathname) => {
  if (!pathname || pathname === "/") return "index";
  const slug = pathname.replace(/^\//, "").replace(/\.html$/i, "").toLowerCase();
  if (slug === "login") return "index";
  if (slug === "announcements") return "anouncement";
  return slug;
};

const flattenNav = (items = [], seen = new Set(), depth = 0) => {
  if (!Array.isArray(items) || depth > 6) return [];
  const out = [];
  for (const item of items) {
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (Array.isArray(item.children) && item.children.length > 0) {
      out.push(...flattenNav(item.children, seen, depth + 1));
    }
  }
  return out;
};

export default function Layout() {
  const [boot, setBoot] = useState({
    settings: {},
    navigation: fallbackNavigation,
    content: [],
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
        const page = pathToPage(pathname);
        const { data } = await api.get(`/site/bootstrap?page=${page}`);
        setBoot({
          settings: data?.settings || {},
          navigation:
            Array.isArray(data?.navigation) && data.navigation.length > 0
              ? data.navigation
              : fallbackNavigation,
          content: data?.content || [],
        });
      } catch {
        setBoot((prev) => ({
          settings: prev.settings || {},
          navigation:
            Array.isArray(prev.navigation) && prev.navigation.length > 0
              ? prev.navigation
              : fallbackNavigation,
          content: prev.content || [],
        }));
      }
    };
    load();
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
    if (window.AOS) {
      setTimeout(() => {
         window.AOS.refresh();
      }, 100);
    }
  }, [pathname]);

  // Handle body class for mobile nav
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('mobile-nav-active');
    } else {
      document.body.classList.remove('mobile-nav-active');
    }
    return () => document.body.classList.remove('mobile-nav-active');
  }, [menuOpen]);

  // Global AOS Init
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }, []);

  return (
    <div className="app-shell index-page">
      <header id="header" className="header fixed-top" style={{ backgroundColor: '#E6C56A', padding: '10px 0', position: 'fixed', top: '0', left: '0', right: '0', width: '100%', zIndex: '9999', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="container-fluid px-3 px-sm-4 d-flex align-items-center justify-content-between">
          <Link to="/" className="logo d-flex align-items-center gap-2 text-decoration-none flex-shrink-0">
            <img
              src="/assets/img/logo1.jpg"
              alt="School Logo"
              style={{
                width: "clamp(32px, 6vw, 40px)",
                height: "clamp(32px, 6vw, 40px)",
                objectFit: "contain",
                backgroundColor: "white",
                padding: "2px",
                borderRadius: "6px",
              }}
            />
            <div className="d-block" style={{ minWidth: 0 }}>
              <h1
                className="mb-0 text-white fw-bold"
                style={{ fontSize: "clamp(0.62rem, 2.6vw, 0.7rem)", lineHeight: "1.1", letterSpacing: "0.3px" }}
              >
                LYCEE S<sup>T</sup> ALEXANDRE
              </h1>
              <p
                className="mb-0 text-white fw-bold"
                style={{ fontSize: "clamp(0.58rem, 2.35vw, 0.65rem)", lineHeight: "1.1", letterSpacing: "0.3px" }}
              >
                SAULI DE MUHURA
              </p>
              <p
                className="mb-0 text-white fw-bold"
                style={{ fontSize: "clamp(0.58rem, 2.35vw, 0.65rem)", lineHeight: "1.1", letterSpacing: "0.3px" }}
              >
                PERES BARNABITES
              </p>
            </div>
          </Link>

          <nav id="navmenu" className={`navmenu d-flex align-items-center ${menuOpen ? "nav-open" : ""}`}>
            <NavTree
              items={boot.navigation}
              onNavigate={() => setMenuOpen(false)}
              includeMobileClose
            />
            <Link className="ms-3 d-none d-xl-inline-block rounded-pill px-3 py-2 fw-bold text-decoration-none flex-shrink-0" to="/login" style={{ backgroundColor: 'white', color: '#333', border: '2px solid #333', fontSize: '0.9rem' }}>
              Login
            </Link>
            <i
              className={`mobile-nav-toggle d-xl-none bi ms-3 ${menuOpen ? "bi-x" : "bi-list"}`}
              style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#333', flexShrink: '0' }}
              onClick={() => setMenuOpen((v) => !v)}
            ></i>
          </nav>
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div style={{ height: "clamp(56px, 8vw, 65px)" }}></div>

      <Outlet />

      <footer id="footer" className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Developers</h4>
            <div dangerouslySetInnerHTML={{ __html: boot.settings.developers || 'IRASUBIZA Jean Cadeau<br/>IHIRWE Aimee Saina<br/>HABAKUBAHO Brainy Justin<br/>TUMURAMYWE Placide' }} />
            <p><strong>Email:</strong> {boot.settings.primary_email || "lycemuhur@gmail.com"}</p>
          </div>

          <div className="footer-section">
            <h4>School Location</h4>
            <div dangerouslySetInnerHTML={{ __html: boot.settings.location || 'Rwanda, Eastern Province<br/>Gatsibo District<br/>Muhura Sector, Taba Cell<br/>Kanyinya Village' }} />
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#" target="_blank" rel="noopener"><i className="bi bi-facebook"></i></a>
              <a href="#" target="_blank" rel="noopener"><i className="bi bi-twitter"></i></a>
              <a href="#" target="_blank" rel="noopener"><i className="bi bi-instagram"></i></a>
              <a href="#" target="_blank" rel="noopener"><i className="bi bi-linkedin"></i></a>
              <a href="#" target="_blank" rel="noopener"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} <strong>LYCEE SAINT ALEXANDRE SAULI DE MUHURA</strong> — All Rights Reserved
        </div>
      </footer>

      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </div>
  );
}

