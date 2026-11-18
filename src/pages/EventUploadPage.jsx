import { useState } from "react";
import { eventsAPI, uploadsAPI } from "../api/services";
import { getApiError } from "../api/client";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo";

const mediaFields = [
  { key: "image", label: "Event image", accept: "image/*", upload: uploadsAPI.uploadImage, field: "image_path" },
  { key: "video", label: "Event video", accept: "video/*", upload: uploadsAPI.uploadVideo, field: "video_path" },
  { key: "audio", label: "Event audio", accept: "audio/*", upload: uploadsAPI.uploadVideo, field: "audio_path" },
];

function uploadedPath(response) {
  const data = response?.data?.data || response?.data || {};
  return data.url || data.file_url || data.file_path || data.path || data.filename || data.file?.url || data.file?.path || null;
}

export default function EventUploadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", date: "", time: "", category: "General", location: "", description: "", registration_link: "" });
  const [files, setFiles] = useState({ image: null, video: null, audio: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const payload = { ...form };
      for (const item of mediaFields) {
        if (!files[item.key]) continue;
        const response = await item.upload(files[item.key]);
        const path = uploadedPath(response);
        if (!path) throw new Error(`The server uploaded ${item.label.toLowerCase()} but returned no file URL.`);
        payload[item.field] = path;
      }
      await eventsAPI.create(payload);
      navigate("/events", { replace: true });
    } catch (err) {
      setError(getApiError(err, err.message || "Could not save the event. Check the upload and try again."));
    } finally {
      setBusy(false);
    }
  };

  return <main className="container py-5" style={{ maxWidth: 820 }}>
    <Seo title="Add Event" description="Create a school event." path="/admin/events" />
    <div className="d-flex justify-content-between align-items-center mb-4"><div><p className="text-uppercase text-muted mb-1">Event management</p><h1 className="h2 mb-0">Add an event</h1></div><button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/events")}>View events</button></div>
    <form onSubmit={submit} className="card border-0 shadow-sm p-4">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row g-3">
        <div className="col-md-8"><label className="form-label" htmlFor="event-title">Event title *</label><input id="event-title" className="form-control" name="title" value={form.title} onChange={update} required maxLength={180} /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="event-category">Category</label><input id="event-category" className="form-control" name="category" value={form.category} onChange={update} maxLength={80} /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="event-date">Date *</label><input id="event-date" className="form-control" type="date" name="date" value={form.date} onChange={update} required /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="event-time">Time</label><input id="event-time" className="form-control" type="time" name="time" value={form.time} onChange={update} /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="event-location">Location</label><input id="event-location" className="form-control" name="location" value={form.location} onChange={update} maxLength={180} /></div>
        <div className="col-12"><label className="form-label" htmlFor="event-description">Description</label><textarea id="event-description" className="form-control" name="description" rows="4" value={form.description} onChange={update} maxLength={5000} /></div>
        {mediaFields.map((item) => <div className="col-md-4" key={item.key}><label className="form-label" htmlFor={`event-${item.key}`}>{item.label}</label><input id={`event-${item.key}`} className="form-control" type="file" accept={item.accept} onChange={(e) => setFiles((current) => ({ ...current, [item.key]: e.target.files?.[0] || null }))} /><small className="text-muted">Optional. Choose one {item.key} file.</small></div>)}
        <div className="col-12"><label className="form-label" htmlFor="event-link">Registration or information link</label><input id="event-link" className="form-control" type="url" name="registration_link" value={form.registration_link} onChange={update} placeholder="https://" /></div>
        <div className="col-12 d-flex justify-content-end"><button className="btn btn-primary px-4" type="submit" disabled={busy}>{busy ? "Uploading and saving…" : "Save event"}</button></div>
      </div>
    </form>
  </main>;
}
