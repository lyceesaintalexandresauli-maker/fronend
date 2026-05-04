import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client";
import { contentAPI } from "../api/services";
import { getContentSections } from "../utils/helpers";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";

export default function AboutPage() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [readMoreOpen, setReadMoreOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await contentAPI.getByPage('about');
        setSections(getContentSections(res.data));
      } catch (err) {
        console.error("Error fetching about content:", err);
        setSections({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        duration: 600,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const counters = document.querySelectorAll(".count");
    counters.forEach((counter) => {
      const target = Number(counter.getAttribute("data-target") || "0");
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 120));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = String(target);
          clearInterval(timer);
        } else {
          counter.textContent = String(current);
        }
      }, 12);
    });
  }, [loading]);

  const getSection = (slug) => sections[slug] || {};

  if (loading) return <PageLoader label="Loading about page..." />;

  const whoWeAre = getSection("who_we_are");
  const mission = getSection("our_mission");
  const vision = getSection("our_vision");
  const values = getSection("core_values");
  const saint = getSection("who_was_saint_alexandre_sauli");
  const fathers = getSection("the_barnabite_fathers");
  const whyChoose = getSection("why_choose_our_school");

  return (
    <main className="main ui-page-shell">
      <Seo
        title="About"
        description="Learn about Lycee Saint Alexandre Sauli de Muhura, our mission, values, and the Barnabite educational approach."
        path="/about"
      />
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center">
              <div className="col-lg-8">
                <h1>About Our School</h1>
                <h4 className="mb-0">
                  Lycee Saint Alexandre Sauli De Muhura is committed to nurturing bright minds and talented individuals.
                  With modern facilities, qualified teachers, and strong moral formation, we prepare students for a future
                  of excellence, leadership, and service.
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="about-us container py-5">
        <div className="row align-items-center mb-5">
          <div className="col-lg-6" data-aos="fade-right">
            <h2>{whoWeAre.title || "Who We Are"}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  whoWeAre.content ||
                  `Lycee Saint Alexandre Sauli de Muhura is a Catholic secondary school located in the Eastern Province of Rwanda,
founded under the spiritual guidance of the <strong>Barnabite Fathers</strong>. We provide a balanced education
integrating academic excellence, Christian morals, discipline, and practical skills.`,
              }}
            />
          </div>
          <div className="col-lg-6" data-aos="fade-left">
            <img
              src={mediaUrl(whoWeAre.image_path) || "/assets/img/sauli2.jpg"}
              className="img-fluid rounded"
              alt="Our School"
              width="960"
              height="640"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card shadow h-100 py-2 stats-card ui-stat-card">
              <div className="card-body text-center">
                <h5 className="card-title text-primary">Students</h5>
                <h2 className="card-text count" data-target="629">0</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card shadow h-100 py-2 stats-card ui-stat-card">
              <div className="card-body text-center">
                <h5 className="card-title text-success">Teachers / Trainers</h5>
                <h2 className="card-text count" data-target="34">0</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row text-center mb-5">
          <div className="col-lg-4" data-aos="zoom-in">
            <h3>{mission.title || "Our Mission"}</h3>
            <p>{mission.content || "To provide quality education rooted in Christian values."}</p>
          </div>
          <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="150">
            <h3>{vision.title || "Our Vision"}</h3>
            <p>{vision.content || "To be a leading educational institution nurturing excellence."}</p>
          </div>
          <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="300">
            <h3>{values.title || "Core Values"}</h3>
            <div dangerouslySetInnerHTML={{ __html: values.content || "Respect, Discipline, Integrity, Excellence." }} />
          </div>
        </div>

        <div className="programs mb-5">
          <h2 className="text-center mb-4" data-aos="fade-up">Academic Programs Offered</h2>
          <div className="row text-center gy-4">
            <div style={{ background: "#E6C56A" }} className="col-md-4 ui-program-tile" data-aos="fade-up">
              <h5>SOD</h5>
              <p>Software Development</p>
            </div>
            <div style={{ background: "#E6C56A" }} className="col-md-4 ui-program-tile" data-aos="fade-up" data-aos-delay="200">
              <h5>NIT</h5>
              <p>Networking & Internet Technology</p>
            </div>
            <div style={{ background: "#E6C56A" }} className="col-md-4 ui-program-tile" data-aos="fade-up" data-aos-delay="200">
              <h5>CSA</h5>
              <p>Computer Systems & Architecture</p>
            </div>
            <div style={{ background: "#E6C56A" }} className="col-md-6 ui-program-tile" data-aos="fade-up" data-aos-delay="200">
              <h5>FAD</h5>
              <p>Fashion & Design</p>
            </div>
            <div style={{ background: "#E6C56A" }} className="col-md-6 ui-program-tile" data-aos="fade-up" data-aos-delay="200">
              <h5>ACC</h5>
              <p>Accounting & Business Management</p>
            </div>
          </div>
        </div>

        <div className="row align-items-center mb-5">
          <div className="col-lg-6 order-lg-2" data-aos="fade-left">
            <h2>{saint.title || "Who Was Saint Alexandre Sauli?"}</h2>
            <p>{(saint.content || "Saint Alexandre Sauli (1534–1592) was a Barnabite priest, bishop, and scholar.").split("Sauli studied")[0]}</p>
            {readMoreOpen && (
              <p>
                {saint.content?.includes("Sauli studied")
                  ? `Sauli studied${saint.content.split("Sauli studied")[1]}`
                  : "He dedicated his life to education, peacebuilding, and spiritual guidance."}
              </p>
            )}
            <button className="btn btn-primary mt-3" onClick={() => setReadMoreOpen((v) => !v)}>
              {readMoreOpen ? "Show Less" : "Read More About Sauli"}
            </button>
          </div>
          <div className="col-lg-6 order-lg-1" data-aos="fade-right">
            <div
              className="rounded p-3 p-sm-4 mx-auto"
              style={{ backgroundColor: "#E6C56A", maxWidth: "460px" }}
            >
              <img
                src={mediaUrl(saint.image_path) || "/assets/img/sauli1.jfif"}
                className="img-fluid rounded w-100"
                style={{ aspectRatio: "4 / 5", objectFit: "cover" }}
                alt="Saint Alexandre Sauli"
                width="800"
                height="1000"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <div className="row align-items-center mb-5">
          <div className="col-lg-6" data-aos="fade-right">
            <h2>{fathers.title || "The Barnabite Fathers"}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  fathers.content ||
                  "The Barnabites were founded in 1530 and focus on youth education, pastoral care, and moral guidance.",
              }}
            />
          </div>
          <div className="col-lg-6" data-aos="fade-left">
            <img
              src={mediaUrl(fathers.image_path) || "/assets/img/saul2.jpg"}
              className="img-fluid rounded"
              alt="Barnabite Fathers"
              width="960"
              height="640"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="why-us text-center mt-5">
          <h2 data-aos="fade-up">{whyChoose.title || "Why Choose Our School?"}</h2>
          <div className="row mt-4 gy-4">
            <div className="col-md-3" data-aos="zoom-in"><p>Qualified Teachers</p></div>
            <div className="col-md-3" data-aos="zoom-in" data-aos-delay="100"><p>Strong Moral Foundation</p></div>
            <div className="col-md-3" data-aos="zoom-in" data-aos-delay="200"><p>Modern Learning Facilities</p></div>
            <div className="col-md-3" data-aos="zoom-in" data-aos-delay="300"><p>Practical & Technical Skills</p></div>
          </div>
          {whyChoose.content ? <p className="mt-3">{whyChoose.content}</p> : null}
        </div>

        <div className="text-center mt-4">
          <Link to="/academic" className="btn btn-outline-primary">Explore Academics</Link>
        </div>
      </section>
    </main>
  );
}
