import { useEffect, useState } from "react";

const API_BASE = window.location.origin; 
// IMPORTANT: frontend + backend must be same origin

function getColor(p) {
  if (p < 50) return "danger";
  if (p < 80) return "warning";
  return "safe";
}

export default function App() {
  const [streams, setStreams] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStreams = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/streams`);
        const data = await res.json();

        if (data.streams && data.streams.length > 0) {
          setStreams(data.streams);
          setActive(data.streams[0]);
        } else {
          setStreams([]);
        }
      } catch (err) {
        console.error("Failed to fetch streams", err);
      } finally {
        setLoading(false);
      }
    };

    loadStreams();
    const i = setInterval(loadStreams, 3000);
    return () => clearInterval(i);
  }, []);

  if (loading) {
    return <div className="loading">Loading streams…</div>;
  }

  if (!active) {
    return <div className="loading">Waiting for streams…</div>;
  }

  const percent = active.helmet_percent || 0;
  const colorClass = getColor(percent);
  const hlsUrl = `${API_BASE}/hls/${active.id}.m3u8`;

  return (
    <div className="app">
      {/* Stream Selector */}
      <div className="stream-bar">
        <select
          value={active.id}
          onChange={(e) =>
            setActive(streams.find((s) => s.id === e.target.value))
          }
        >
          {streams.map((s) => (
            <option key={s.id} value={s.id}>
              {s.location}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className="content">
        <video
          src={hlsUrl}
          controls
          autoPlay
          muted
          playsInline
          className="video"
        />

        <div className="stats">
          <div className={`percent ${colorClass}`}>
            {percent.toFixed(1)}%
          </div>
          <div className="label">Helmet Compliance</div>
          <div className="counts">
            Helmet: {active.helmet} | No Helmet: {active.no_helmet}
          </div>
        </div>
      </div>
    </div>
  );
}
