import { useEffect, useState } from "react";
import { api, getApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    bio: "",
  });
  const [pwd, setPwd] = useState({ new_password: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/me", form);
      await refreshMe();
      setStatus("Profile updated");
    } catch (error) {
      setStatus(getApiError(error));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/me/password", pwd);
      setPwd({ new_password: "" });
      setStatus("Password updated");
    } catch (error) {
      setStatus(getApiError(error));
    }
  };

  return (
    <section className="container section-pad profile-grid">
      <form className="card form" onSubmit={save}>
        <h2>My Profile</h2>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Full name"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Bio"
        />
        <button className="btn">Save Profile</button>
      </form>

      <form className="card form" onSubmit={changePassword}>
        <h2>Change Password</h2>
        <input
          type="password"
          value={pwd.new_password}
          onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
          placeholder="New password (min. 8 characters)"
        />
        <button className="btn">Update Password</button>
      </form>
      {status && <p className="status">{status}</p>}
    </section>
  );
}
