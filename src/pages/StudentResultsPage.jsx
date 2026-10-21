import { useState } from "react";
import { resultsAPI } from "../api/services";
import Seo from "../components/Seo";
import "./StudentResultsPage.css";

const programs = [
  { value: "SWD", label: "Software Development (SWD)" },
  { value: "NIT", label: "Networking & Internet Technology (NIT)" },
  { value: "CSA", label: "Computer Systems & Architecture (CSA)" },
  { value: "ACC", label: "Accounting (ACC — Senior)" },
  { value: "FAD", label: "Fashion & Design (FAD)" },
];

const number = (value) => Number(value || 0);

function ResultCard({ result }) {
  const totalScore = result.subjects.reduce((sum, subject) => sum + number(subject.score), 0);
  const totalMaximum = result.subjects.reduce((sum, subject) => sum + number(subject.max_score), 0);
  const percentage = totalMaximum ? (totalScore / totalMaximum) * 100 : 0;

  return (
    <article className="student-result-card">
      <div className="student-result-heading">
        <div>
          <span>{programs.find((program) => program.value === result.program_code)?.label || result.program_code}</span>
          <h2>{result.academic_year} · {result.term}</h2>
        </div>
        <div className="student-result-total">
          <strong>{percentage.toFixed(1)}%</strong>
          <small>{totalScore.toFixed(2)} / {totalMaximum.toFixed(2)} total marks</small>
        </div>
      </div>

      <div className="student-result-table-wrap">
        <table className="student-result-table">
          <thead><tr><th>Subject</th><th>Marks</th><th>Out of</th><th>Percentage</th></tr></thead>
          <tbody>
            {result.subjects.map((subject) => {
              const score = number(subject.score);
              const maximum = number(subject.max_score);
              return (
                <tr key={subject.id || subject.subject_name}>
                  <td>{subject.subject_name}</td>
                  <td>{score.toFixed(2)}</td>
                  <td>{maximum.toFixed(2)}</td>
                  <td>{maximum ? `${((score / maximum) * 100).toFixed(1)}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {result.remarks && <p className="student-result-remarks"><strong>Teacher’s remarks:</strong> {result.remarks}</p>}
    </article>
  );
}

export default function StudentResultsPage() {
  const [studentName, setStudentName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);

  const handleLookup = async (event) => {
    event.preventDefault();
    setMessage("");
    setResults([]);
    setSearchBusy(true);
    try {
      const { data } = await resultsAPI.lookup(studentName.trim(), programCode);
      setResults(Array.isArray(data?.results) ? data.results : []);
      if (!data?.results?.length) {
        setMessage("No published results matched that student name and program.");
      }
    } catch (error) {
      setMessage(error?.response?.data?.error || "Unable to retrieve results. Please try again.");
    } finally {
      setSearchBusy(false);
    }
  };

  return (
    <main className="main student-results-page">
      <Seo
        title="Student Results"
        description="Search and view published student examination results from Lycée Saint Alexandre Sauli."
        path="/results"
        robots="noindex,nofollow"
      />
      <header className="student-results-hero">
        <div className="container">
          <span className="student-results-kicker"><i className="bi bi-mortarboard me-2" />STUDENT RESULT SERVICE</span>
          <h1>Student Results</h1>
          <p>Enter the student’s full name and program to view published examination results.</p>
        </div>
      </header>

      <section className="container student-results-content">
        <form className="student-results-panel student-results-form" onSubmit={handleLookup}>
          <div>
            <h2>Find a student’s result</h2>
            <p>Enter the student’s full name and select their program.</p>
          </div>
          <label>
            <span>Student full name</span>
            <input
              autoComplete="off"
              maxLength={160}
              minLength={3}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Enter the student’s first and last name"
              required
              value={studentName}
            />
          </label>
          <label>
            <span>Program / level</span>
            <select onChange={(event) => setProgramCode(event.target.value)} required value={programCode}>
              <option value="">Select a program</option>
              {programs.map((program) => <option key={program.value} value={program.value}>{program.label}</option>)}
            </select>
          </label>
          <button className="student-results-submit" disabled={searchBusy} type="submit">
            {searchBusy ? "Searching…" : "Get Result"}
          </button>
        </form>
        {message && <p className="student-results-message" role="status">{message}</p>}
        {results.length > 0 && (
          <section className="student-results-list" aria-label="Published results">
            <div className="student-results-list-heading">
              <div><span>Published records for</span><h2>{results[0].student_name}</h2></div>
              <button className="student-results-print" type="button" onClick={() => window.print()}>
                <i className="bi bi-printer me-2" />Print results
              </button>
            </div>
            {results.map((result) => <ResultCard key={result.id} result={result} />)}
          </section>
        )}
        <p className="student-results-privacy">Only published results are shown. Contact the school if a published result is missing.</p>
      </section>
    </main>
  );
}
