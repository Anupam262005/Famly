// src/components/DashboardComponents/SendMessageForm.jsx

import { useState, useEffect } from "react";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { Send, Users, Home } from "lucide-react";

export default function SendMessageForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audienceType, setAudienceType] = useState("all_families");
  const [audienceId, setAudienceId] = useState("");

  const [families, setFamilies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load families and private groups on mount
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [famRes, grpRes] = await Promise.all([
          api.get("/family/my-families"),
          api.get("/private-group/my"),
        ]);
        setFamilies(famRes.data.data || []);
        setGroups(grpRes.data.data || []);
      } catch (err) {
        console.error("Could not load families/groups", err);
        toast.error("Failed to load your families and groups");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // Reset audienceId whenever audience type changes
  const handleAudienceTypeChange = (type) => {
    setAudienceType(type);
    setAudienceId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (audienceType === "family" && !audienceId) {
      toast.warn("Please select a family to send to");
      return;
    }
    if (audienceType === "privategroup" && !audienceId) {
      toast.warn("Please select a group to send to");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/notification/send-message", {
        title: title.trim(),
        message: message.trim(),
        audienceType,
        audienceId: audienceType === "all_families" ? undefined : audienceId,
      });

      toast.success("Message sent!");
      setTitle("");
      setMessage("");
      setAudienceId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <Send size={20} className="text-indigo-500" />
        Send Message to Family / Group
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Audience type buttons ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Send To</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all_families", label: "All My Families", icon: <Home size={14} /> },
              { value: "family", label: "A Specific Family", icon: <Home size={14} /> },
              { value: "privategroup", label: "A Private Group", icon: <Users size={14} /> },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAudienceTypeChange(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${audienceType === opt.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Family picker ───────────────────────────────────────────────── */}
        {audienceType === "family" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Family
            </label>
            {loadingData ? (
              <p className="text-sm text-gray-400">Loading your families...</p>
            ) : families.length === 0 ? (
              <p className="text-sm text-red-400">You are not part of any family yet.</p>
            ) : (
              <select
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="">-- Choose a family --</option>
                {families.map((f) => (
                  <option key={f.family_id} value={f.family_id}>
                    {f.family_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* ── Private group picker ────────────────────────────────────────── */}
        {audienceType === "privategroup" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Group
            </label>
            {loadingData ? (
              <p className="text-sm text-gray-400">Loading your groups...</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-red-400">You are not part of any private group yet.</p>
            ) : (
              <select
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="">-- Choose a group --</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Family reunion this Sunday!"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* ── Message ────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Write your message here..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || loadingData}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send size={16} />
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}