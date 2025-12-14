import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

const API_BASE = "";

function getColor(p) {
  if (p < 50) return "danger";
  if (p < 80) return "warning";
  return "safe";
}

export default function App() {
  const [streams, setStreams] = useState([]);
  const [active, setActive] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/streams`);
        const json = await res.json();
        if (json.streams?.length) {
          setStreams(json.streams);
          if (!active || !json.streams.find(s => s.id === active.id)) {
            setActive(json.streams[0]);
          }
        }
      } catch (err) {
        console.error("API fetch error:", err);
      }
    };

    fetchStreams();
    const interval = setInterval(fetchStreams, 3000);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const hlsUrl = `${API_BASE}/hls/${active.id}.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else {
      videoRef.current.src = hlsUrl;
    }
  }, [active]);

  if (!active) {
    return (
      <div className="app">
        <p>Waiting for streams...</p>
      </div>
    );
  }

  const colorClass = getColor(active.helmet_percent);

  return (
    <div className="app">
      <div className="stream-bar">
        <select
          value={active.id}
          onChange={(e) =>
            setActive(streams.find((s) => s.id === e.target.value))
          }
        >
          {streams.map((s) => (
            <option key={s.id} value={s.id}>
              {s.location || s.id}
            </option>
          ))}
        </select>
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }}
      />

      <div className="content">
        <div className={`helmet ${colorClass}`}>
          <img src="/helmet.png" alt="Helmet" />
        </div>
        <div className="stats">
          <div className={`percent ${colorClass}`}>
            {active.helmet_percent.toFixed(1)}%
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
