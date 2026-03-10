import React, { useState, useEffect } from "react";
import './App.css';

// ---- HER VISUAL SHELL ----
const MovingBackground = React.memo(function MovingBackground() {
  const images = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/bg4.jpg", "/bg5.jpg", "/bg6.jpg"];
  return (
    <div className="bg-scroll-wrap" aria-hidden="true">
      <div className="bg-marquee">
        {[0, 1].map((copy) => (
          <div className="bg-scroll-track" key={copy}>
            {images.map((src, index) => (
              <img key={`${copy}-${index}`} src={src} alt="" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

const PhoneOverlay = React.memo(function PhoneOverlay() {
  return <div className="phone-overlay"></div>;
});

const AppShell = ({ children, onSOS }) => (
  <div className="app-shell">
    <div className="phone-frame">
      <MovingBackground />
      <PhoneOverlay />
      {onSOS && (
        <button className="sos-btn" onClick={onSOS} title="Emergency Contacts">
          !
        </button>
      )}
      <div className="phone-content">
        {children}
      </div>
    </div>
  </div>
);

const BrandLogo = ({ compact = false }) => (
  <div className={`brand-wrap ${compact ? "brand-wrap-compact" : ""}`}>
    <div className="logo-glow"></div>
    <img src="/after9-logo.png" className="logo no-refade" alt="After 9" />
  </div>
);
// ---- END VISUAL SHELL ----


function App() {
  // ---------- GLOBAL STATES ----------
  const [user, setUser] = useState(() => localStorage.getItem("currentUser") || null);
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [page, setPage] = useState("home");
  const [mood, setMood] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [lastLog, setLastLog] = useState(null);

  // ---------------- LOGIN HANDLER ----------------
  const handleLogin = async () => {
    const name = inputName.trim();
    const pass = inputPassword.trim();
    if (!name || !pass) {
      setLoginError("Please enter both a username and password.");
      return;
    }
    try {
      if (authMode === "register") {
        const res = await fetch("/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password: pass }),
        });
        if (!res.ok) {
          const msg = await res.text();
          setLoginError(msg || "Registration failed.");
          return;
        }
        localStorage.setItem("currentUser", name);
        setUser(name);
      } else {
        const res = await fetch("/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password: pass }),
        });
        if (!res.ok) {
          const msg = await res.text();
          setLoginError(msg || "Login failed.");
          return;
        }
        localStorage.setItem("currentUser", name);
        setUser(name);
      }
    } catch (err) {
      console.error(err);
      setLoginError("Error connecting to server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setMood(null);
    setSleep(null);
    setLastLog(null);
    setPage("home");
    setUser(null);
  };

  // ---------------- LOAD LAST LOG ----------------
  useEffect(() => {
    if (!user) return;
    const loadLastLog = async () => {
      try {
        const response = await fetch(`/tracker?username=${encodeURIComponent(user)}`);
        const logs = await response.json();
        // Server returns mood as Number and filters by user already
        if (logs.length > 0) setLastLog(logs[0]);
        else setLastLog(null);
      } catch (err) {
        console.error(err);
        setLastLog(null);
      }
    };
    loadLastLog();
  }, [user]);

  // ================== CHILD COMPONENTS ==================

  const DailyTracker = () => {
    const [localMood, setLocalMood] = useState(null);
    const [localSleep, setLocalSleep] = useState(null);
    const [localLastLog, setLocalLastLog] = useState(
      JSON.parse(localStorage.getItem(`${user}_dailyLog`)) || null
    );

    const handleSubmit = async () => {
      if (!localMood || !localSleep) return;
      const log = { mood: localMood, sleep: localSleep, date: new Date().toLocaleDateString() };
      localStorage.setItem(`${user}_dailyLog`, JSON.stringify(log));
      setLocalLastLog(log);

      const key = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
      const allLogs = JSON.parse(localStorage.getItem(`${user}_allLogs`) || "{}");
      allLogs[key] = { mood: localMood, sleep: localSleep };
      localStorage.setItem(`${user}_allLogs`, JSON.stringify(allLogs));

      setMood(localMood);
      setSleep(localSleep);
      setPage("dailyResult");

      try {
        await fetch("/tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user, mood: localMood, hoursSlept: localSleep }),
        });
      } catch (err) {
        console.error(err);
      }
    };

    // Use server lastLog if available, otherwise fall back to localStorage
    const displayLog = lastLog || localLastLog;

    return (
      <div className="container">
        <h2>Daily Tracker</h2>

        <div className="last-log-wide">
          <p style={{ margin: "0 0 8px 0", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8a6f5a", fontWeight: "700" }}>Yesterday</p>
          {displayLog ? (
            <div style={{ display: "flex", justifyContent: "center", gap: "28px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#8a6f5a", marginBottom: "2px" }}>Mood</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#3f3732", lineHeight: 1 }}>{displayLog.mood}</div>
                <div style={{ fontSize: "10px", color: "#8a6f5a" }}>/ 5</div>
              </div>
              <div style={{ width: "1px", background: "rgba(120,95,70,0.15)", borderRadius: "1px" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#8a6f5a", marginBottom: "2px" }}>Sleep</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#3f3732", lineHeight: 1 }}>{displayLog.hours_slept != null ? displayLog.hours_slept : displayLog.sleep}</div>
                <div style={{ fontSize: "10px", color: "#8a6f5a" }}>hrs</div>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "13px", color: "#8a6f5a" }}>No previous log yet.</p>
          )}
        </div>

        <p style={{ marginTop: "20px", marginBottom: "6px" }}>Mood today (1 = very low, 5 = very good)</p>
        <div className="button-group">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} className={localMood === n ? "active" : ""} onClick={() => setLocalMood(n)}>{n}</button>
          ))}
        </div>
        <p style={{ marginTop: "16px", marginBottom: "6px" }}>Hours of sleep last night</p>
        <div className="button-group">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <button key={n} className={localSleep === n ? "active" : ""} onClick={() => setLocalSleep(n)}>{n}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <button className="main-btn" onClick={handleSubmit}>Submit</button>
          <button className="main-btn" onClick={() => setPage("home")}>Back to Home</button>
        </div>
      </div>
    );
  };

  const DailyResult = () => {
    const lowMood = mood <= 2;
    const okMood = mood === 3;
    const lowSleep = sleep <= 4;
    const okSleep = sleep <= 6;

    let moodMessage = lowMood
      ? "Your mood is quite low today — please reach out to someone you trust."
      : okMood
      ? "Your mood is okay today. Try to do one small thing for yourself."
      : "Your mood is good today, keep it up!";

    let sleepMessage = lowSleep
      ? "You've had very little sleep. Try to rest when you can and ask for help today."
      : okSleep
      ? "Your sleep was a little below ideal. Even a short nap can help."
      : "You got a good amount of sleep — that makes a real difference.";

    // Combined advice for worst-case scenario
    let combinedAlert = null;
    if (lowMood && lowSleep) {
      combinedAlert = "Low mood and poor sleep together can feel overwhelming. Please don't face this alone — talk to someone or contact your health visitor.";
    }

    const moodEmoji = lowMood ? "😔" : okMood ? "😐" : "😊";
    const moodLabel = lowMood ? "Low" : okMood ? "Okay" : "Good";
    const sleepLabel = lowSleep ? "Very Low" : okSleep ? "Below Ideal" : "Good";

    return (
      <div className="container">
        <div className="support-hero" style={{ marginBottom: "14px" }}>
          <div className="support-hero-icon">{moodEmoji}</div>
          <h2>Daily Summary</h2>
          <p className="support-hero-sub">Here's how today is looking for you.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div style={{ flex: 1, borderRadius: "16px", padding: "16px 10px", textAlign: "center", background: lowMood ? "#f5c4c4" : okMood ? "#f5e6b0" : "#b8dfc0", backdropFilter: "blur(6px)" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>🧠</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#3f3732" }}>{mood}<span style={{ fontSize: "13px", fontWeight: "500" }}>/5</span></div>
            <div style={{ fontSize: "11px", color: "#7a6555", marginTop: "2px" }}>Mood · {moodLabel}</div>
          </div>
          <div style={{ flex: 1, borderRadius: "16px", padding: "16px 10px", textAlign: "center", background: lowSleep ? "#f5c4c4" : okSleep ? "#f5e6b0" : "#b8dfc0", backdropFilter: "blur(6px)" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>😴</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#3f3732" }}>{sleep}<span style={{ fontSize: "13px", fontWeight: "500" }}>h</span></div>
            <div style={{ fontSize: "11px", color: "#7a6555", marginTop: "2px" }}>Sleep · {sleepLabel}</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)", borderRadius: "16px", padding: "16px", textAlign: "left", marginBottom: "10px", border: "1.5px solid rgba(120,95,70,0.1)" }}>
          <p style={{ fontSize: "13px", color: "#3f3732", fontWeight: "700", marginBottom: "6px", marginTop: 0 }}>🧠 Mood</p>
          <p style={{ fontSize: "13px", color: "#4b4038", margin: "0 0 14px 0", lineHeight: "1.5" }}>{moodMessage}</p>
          <p style={{ fontSize: "13px", color: "#3f3732", fontWeight: "700", marginBottom: "6px", marginTop: 0 }}>😴 Sleep</p>
          <p style={{ fontSize: "13px", color: "#4b4038", margin: 0, lineHeight: "1.5" }}>{sleepMessage}</p>
        </div>

        {combinedAlert && (
          <div className="article-callout alert-red" style={{ marginBottom: "10px" }}>
            ⚠️ {combinedAlert}
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: "16px", padding: "14px 16px", marginBottom: "14px", border: "1.5px solid rgba(120,95,70,0.08)", textAlign: "left" }}>
          <p style={{ fontSize: "12px", color: "#8a6f5a", fontWeight: "700", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>A gentle reminder</p>
          <p style={{ fontSize: "13px", color: "#4b4038", margin: 0, lineHeight: "1.5" }}>Every day is different. Be kind to yourself — you're doing better than you think. 💜</p>
        </div>

        <button className="main-btn" style={{ width: "100%" }} onClick={() => setPage("home")}>Back to Home</button>
      </div>
    );
  };

  // ---------- CALENDAR PAGE ----------
  const CalendarPage = () => {
    const today = new Date();
    const [view, setView] = useState("calendar");
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const logs = (() => {
      const saved = localStorage.getItem(`${user}_allLogs`);
      return saved ? JSON.parse(saved) : {};
    })();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString("default", { month: "long" });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const getMoodColor = (mood) => {
      if (!mood) return "rgba(255,255,255,0.35)";
      if (mood <= 2) return "#ffb3b3";
      if (mood === 3) return "#fff0a0";
      return "#b3f0c2";
    };

    const moodData = Array.from({ length: daysInMonth }, (_, i) => {
      const key = `${year}-${month + 1}-${i + 1}`;
      return logs[key]?.mood ?? null;
    });

    const sleepData = Array.from({ length: daysInMonth }, (_, i) => {
      const key = `${year}-${month + 1}-${i + 1}`;
      return logs[key]?.sleep ?? null;
    });

    const gW = 320, gH = 150, padL = 24, padB = 20, padT = 10, padR = 10;
    const innerW = gW - padL - padR;
    const innerH = gH - padT - padB;

    const toX = (i) => padL + (i / (daysInMonth - 1)) * innerW;
    const toYMood = (v) => padT + innerH - ((v - 1) / 4) * innerH;
    const toYSleep = (v) => padT + innerH - ((v - 1) / 7) * innerH;

    const buildPath = (data, toY) => {
      const points = data
        .map((v, i) => v !== null ? `${toX(i)},${toY(v)}` : null)
        .filter(Boolean);
      return points.length > 1 ? "M " + points.join(" L ") : "";
    };

    const moodPath = buildPath(moodData, toYMood);
    const sleepPath = buildPath(sleepData, toYSleep);

    const Toggle = () => (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "15px" }}>
        {["calendar", "graph", "summary"].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              border: "none",
              background: view === v ? "linear-gradient(135deg, #c9a889, #b88f6e)" : "rgba(255,255,255,0.3)",
              color: view === v ? "white" : "#7a6555",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "capitalize",
              backdropFilter: "blur(8px)",
              boxShadow: view === v ? "0 4px 12px rgba(140,107,82,0.2)" : "none",
              fontSize: "13px"
            }}
          >
            {v === "calendar" ? "Calendar" : v === "graph" ? "Graph" : "Summary"}
          </button>
        ))}
      </div>
    );

    const NavRow = () => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <button className="main-btn" style={{ marginTop: 0 }} onClick={prevMonth}>← Prev</button>
        <strong>{monthName} {year}</strong>
        <button className="main-btn" style={{ marginTop: 0 }} onClick={nextMonth}>Next →</button>
      </div>
    );

    if (view === "calendar") {
      const blanks = Array(firstDay).fill(null);
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      return (
        <div className="container">
          <h2>Mood Tracker</h2>
          <Toggle />
          <NavRow />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <div key={d} style={{ fontWeight: "bold", fontSize: "11px", padding: "4px", color: "#8a6f5a" }}>{d}</div>
            ))}
            {blanks.map((_, i) => <div key={"b" + i} />)}
            {days.map(day => {
              const key = `${year}-${month + 1}-${day}`;
              const log = logs[key];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={day} style={{
                  background: getMoodColor(log?.mood),
                  borderRadius: "6px",
                  padding: "5px 2px",
                  fontSize: "12px",
                  border: isToday ? "2px solid #b88f6e" : "2px solid transparent"
                }}>
                  <div style={{ fontWeight: isToday ? "bold" : "normal" }}>{day}</div>
                  {log && <div style={{ fontSize: "9px", color: "#555" }}>😴{log.sleep}h</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "15px", fontSize: "12px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ background: "#b8dfc0", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>Good</span>
            <span style={{ background: "#f5e6b0", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>OK</span>
            <span style={{ background: "#f5c4c4", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>Low</span>
            <span style={{ background: "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", border: "1px solid rgba(120,95,70,0.15)" }}>No data</span>
          </div>
          <div style={{ height: "16px" }} />
          <button className="main-btn" style={{ width: "100%" }} onClick={() => setPage("home")}>Back to Home</button>
        </div>
      );
    }

    if (view === "graph") {
      return (
        <div className="container">
          <h2>Mood Graph</h2>
          <Toggle />
          <NavRow />
          <p style={{ fontWeight: "bold", marginBottom: "4px", textAlign: "left" }}>Mood (1–5)</p>
          <svg width={gW} height={gH} style={{ overflow: "visible" }}>
            {[1, 2, 3, 4, 5].map(v => (
              <g key={v}>
                <line x1={padL} x2={gW - padR} y1={toYMood(v)} y2={toYMood(v)} stroke="rgba(120,95,70,0.15)" strokeWidth="1" />
                <text x={padL - 4} y={toYMood(v) + 4} fontSize="10" textAnchor="end" fill="#999">{v}</text>
              </g>
            ))}
            {moodPath && <path d={moodPath} fill="none" stroke="#c9a889" strokeWidth="2.5" strokeLinejoin="round" />}
            {moodData.map((v, i) => v !== null && (
              <circle key={i} cx={toX(i)} cy={toYMood(v)} r="4" fill="#8b5cf6" />
            ))}
            <line x1={padL} x2={gW - padR} y1={padT + innerH} y2={padT + innerH} stroke="#ccc" strokeWidth="1" />
          </svg>
          <p style={{ fontWeight: "bold", marginBottom: "4px", marginTop: "20px", textAlign: "left" }}>Sleep (hrs)</p>
          <svg width={gW} height={gH} style={{ overflow: "visible" }}>
            {[2, 4, 6, 8].map(v => (
              <g key={v}>
                <line x1={padL} x2={gW - padR} y1={toYSleep(v)} y2={toYSleep(v)} stroke="rgba(120,95,70,0.15)" strokeWidth="1" />
                <text x={padL - 4} y={toYSleep(v) + 4} fontSize="10" textAnchor="end" fill="#999">{v}</text>
              </g>
            ))}
            {sleepPath && <path d={sleepPath} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />}
            {sleepData.map((v, i) => v !== null && (
              <circle key={i} cx={toX(i)} cy={toYSleep(v)} r="4" fill="#34d399" />
            ))}
            <line x1={padL} x2={gW - padR} y1={padT + innerH} y2={padT + innerH} stroke="#ccc" strokeWidth="1" />
          </svg>
          <div style={{ fontSize: "12px", display: "flex", gap: "15px", justifyContent: "center", marginTop: "10px" }}>
            <span><span style={{ color: "#c9a889", fontWeight: "bold" }}>●</span> Mood</span>
            <span><span style={{ color: "#34d399", fontWeight: "bold" }}>●</span> Sleep</span>
          </div>
          <div style={{ height: "16px" }} />
          <button className="main-btn" style={{ width: "100%" }} onClick={() => setPage("home")}>Back to Home</button>
        </div>
      );
    }

    if (view === "summary") {
      const monthEntries = Object.entries(logs).filter(([key]) =>
        key.startsWith(`${year}-${month + 1}-`)
      );
      const avgMood = monthEntries.length
        ? (monthEntries.reduce((sum, [, v]) => sum + v.mood, 0) / monthEntries.length).toFixed(1)
        : null;
      const avgSleep = monthEntries.length
        ? (monthEntries.reduce((sum, [, v]) => sum + v.sleep, 0) / monthEntries.length).toFixed(1)
        : null;
      const moodAdvice = !avgMood ? "No data yet."
        : avgMood <= 2 ? "Your mood has been quite low this month. Consider reaching out to someone you trust or speaking to a professional."
        : avgMood <= 3 ? "Your mood has been average this month. Try to carve out some time for yourself each day."
        : "Your mood has been good this month. Keep up whatever is working for you!";
      const sleepAdvice = !avgSleep ? "No data yet."
        : avgSleep <= 4 ? "You've been getting very little sleep. Try to rest when your baby rests and ask for help where possible."
        : avgSleep <= 6 ? "Your sleep has been below the recommended amount. Even short naps can help with recovery."
        : "You're getting a decent amount of sleep. Keep prioritising rest.";
      const moodColor = !avgMood ? "#f3e8ff" : avgMood <= 2 ? "#f5c4c4" : avgMood <= 3 ? "#f5e6b0" : "#b8dfc0";
      const sleepColor = !avgSleep ? "#f3e8ff" : avgSleep <= 4 ? "#f5c4c4" : avgSleep <= 6 ? "#f5e6b0" : "#b8dfc0";

      return (
        <div className="container">
          <h2>Monthly Summary</h2>
          <Toggle />
          <NavRow />
          {monthEntries.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>No data logged for this month yet.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: moodColor, borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#555" }}>Avg Mood</div>
                  <div style={{ fontSize: "26px", fontWeight: "bold" }}>{avgMood}</div>
                  <div style={{ fontSize: "10px", color: "#555" }}>out of 5</div>
                </div>
                <div style={{ flex: 1, background: sleepColor, borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#555" }}>Avg Sleep</div>
                  <div style={{ fontSize: "26px", fontWeight: "bold" }}>{avgSleep}</div>
                  <div style={{ fontSize: "10px", color: "#555" }}>hours</div>
                </div>
                <div style={{ flex: 1, background: "rgba(201,168,137,0.2)", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#555" }}>Days Logged</div>
                  <div style={{ fontSize: "26px", fontWeight: "bold" }}>{monthEntries.length}</div>
                  <div style={{ fontSize: "10px", color: "#555" }}>this month</div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)", borderRadius: "14px", padding: "15px", textAlign: "left", border: "1.5px solid rgba(120,95,70,0.1)" }}>
                <p style={{ fontSize: "14px", color: "#4b4038", marginBottom: "12px" }}>
                  🧠 <strong>Mood:</strong> {moodAdvice}
                </p>
                <p style={{ fontSize: "14px", color: "#4b4038", margin: 0 }}>
                  😴 <strong>Sleep:</strong> {sleepAdvice}
                </p>
              </div>
            </>
          )}
          <div style={{ height: "16px" }} />
          <button className="main-btn" style={{ width: "100%" }} onClick={() => setPage("home")}>Back to Home</button>
        </div>
      );
    }

    return null;
  };

  // ---------- MONTHLY CHECK-IN ----------
  const MonthlyCheckin = () => {
    const questions = [
      { question: "1. I have been able to laugh and see the funny side of things:", options: ["As much as I always could", "Not quite as much now", "Definitely not so much now", "Not at all"] },
      { question: "2. I have looked forward with enjoyment to things:", options: ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"] },
      { question: "3. I have blamed myself unnecessarily when things went wrong:", options: ["Yes, most of the time", "Yes, some of the time", "Not very often", "No, never"] },
      { question: "4. I have been anxious or worried for no good reason:", options: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"] },
      { question: "5. I have felt scared or panicky for no very good reason:", options: ["Yes, quite a lot", "Yes, sometimes", "No, not much", "No, not at all"] },
      { question: "6. Things have been getting on top of me:", options: ["Yes, most of the time I haven't been able to cope at all", "Yes, sometimes I haven't been coping as well as usual", "No, most of the time I have coped quite well", "No, I have been coping as well as ever"] },
      { question: "7. I have been so unhappy that I have had difficulty sleeping:", options: ["Yes, most of the time", "Yes, sometimes", "Not very often", "No, not at all"] },
      { question: "8. I have felt sad or miserable:", options: ["Yes, most of the time", "Yes, quite often", "Not very often", "No, not at all"] },
      { question: "9. I have been so unhappy that I have been crying:", options: ["Yes, most of the time", "Yes, quite often", "Only occasionally", "No, never"] },
      { question: "10. The thought of harming myself has occurred to me:", options: ["Yes, quite often", "Sometimes", "Hardly ever", "Never"] }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(Array(questions.length).fill(null));
    const [submitted, setSubmitted] = useState(false);

    const handleAnswer = (option) => {
      const updated = [...answers];
      updated[currentQuestion] = option;
      setAnswers(updated);
    };

    if (submitted) {
      return (
        <div className="container">
          <div className="support-hero">
            <div className="support-hero-icon">✅</div>
            <h2>Check-In Complete</h2>
            <p className="support-hero-sub">Thank you for taking the time to check in with yourself.</p>
          </div>
          <div className="article-callout alert-red" style={{ marginTop: "16px" }}>
            🚨 If you are experiencing persistent low mood or thoughts of self-harm, please seek professional support immediately or visit the Emergency Contacts page.
          </div>
          <button className="main-btn" style={{ marginTop: "16px", width: "100%" }} onClick={() => setPage("home")}>Back to Home</button>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="support-hero" style={{ marginBottom: "10px" }}>
          <div className="support-hero-icon">🧠</div>
          <h2>Monthly Check-In</h2>
          <p className="support-hero-sub">Question {currentQuestion + 1} of {questions.length}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.28)", borderRadius: "14px", padding: "14px 16px", marginBottom: "14px", border: "1.5px solid rgba(120,95,70,0.1)", backdropFilter: "blur(8px)" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#3f3732", lineHeight: "1.5" }}>{questions[currentQuestion].question}</p>
        </div>

        <div className="vertical-options">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQuestion] === option ? "active" : ""}`}
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {currentQuestion === 0 ? (
            <button className="main-btn" style={{ flex: 1 }} onClick={() => setPage("home")}>← Home</button>
          ) : (
            <button className="main-btn" style={{ flex: 1 }} onClick={() => setCurrentQuestion(currentQuestion - 1)}>← Prev</button>
          )}
          {currentQuestion < questions.length - 1 ? (
            <button className="main-btn" style={{ flex: 1 }} onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next →</button>
          ) : (
            <button className="main-btn" style={{ flex: 1 }} onClick={() => setSubmitted(true)}>Submit ✓</button>
          )}
        </div>
      </div>
    );
  };

// ---------- SUPPORT GROUP ----------
  const SupportGroup = () => {
    const [view, setView] = useState("menu");
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [replyText, setReplyText] = useState({});
    const [showReplies, setShowReplies] = useState({});
    const [expertMsg, setExpertMsg] = useState("");
    const [expertSubmitted, setExpertSubmitted] = useState(false);
    const [anonymous, setAnonymous] = useState(false);

    useEffect(() => {
      loadPosts();
    }, []);

    const loadPosts = async () => {
      try {
        const res = await fetch("/forum/posts");
        const data = await res.json();
        setPosts(data.reverse());
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    const handlePostSubmit = async () => {
      if (!newPost.trim()) return;
      try {
        const res = await fetch("/forum/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newPost, username: user, anonymous })
        });
        const createdPost = await res.json();
        setPosts([createdPost, ...posts]);
        setNewPost("");
        setView("existing");
      } catch (err) {
        console.error("Error creating post:", err);
      }
    };

    const handleReplySubmit = async (postId) => {
      if (!replyText[postId]?.trim()) return;
      try {
        const res = await fetch(`/forum/posts/${postId}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user, content: replyText[postId] })
        });
        const updatedReply = await res.json();
        setPosts(posts.map(p =>
          p.id === postId ? { ...p, replies: [...(p.replies || []), updatedReply] } : p
        ));
        setReplyText({ ...replyText, [postId]: "" });
      } catch (err) {
        console.error("Error submitting reply:", err);
      }
    };

    const handleDeletePost = async (postId) => {
      try {
        await fetch(`/forum/posts/${postId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user })
        });
        setPosts(posts.filter(p => p.id !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    };

    const handleExpertSubmit = async () => {
      if (!expertMsg.trim()) return;
      try {
        await fetch("/forum/experts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user, content: expertMsg })
        });
        setExpertSubmitted(true);
      } catch (err) {
        console.error(err);
      }
    };

    // Avatar initials helper
    const getInitial = (name) => (name || "?")[0].toUpperCase();

    // ---------- MENU ----------
    if (view === "menu") {
      return (
        <div className="container">
          <div className="support-hero">
            <div className="support-hero-icon">💜</div>
            <h2>Support Groups</h2>
            <p className="support-hero-sub">You're not alone. Connect with mothers who understand.</p>
          </div>

          <div className="support-menu-grid">
            <button className="support-menu-card" onClick={() => setView("new")}>
              <span className="support-menu-icon">✏️</span>
              <span className="support-menu-label">New Post</span>
              <span className="support-menu-desc">Share something on your mind</span>
            </button>
            <button className="support-menu-card" onClick={() => setView("existing")}>
              <span className="support-menu-icon">💬</span>
              <span className="support-menu-label">Chats</span>
              <span className="support-menu-desc">Join the conversation</span>
            </button>
            <button className="support-menu-card support-menu-card--expert" onClick={() => setView("expert")}>
              <span className="support-menu-icon">🩺</span>
              <span className="support-menu-label">Ask an Expert</span>
              <span className="support-menu-desc">Get professional guidance</span>
            </button>
          </div>

          <button className="main-btn" onClick={() => setPage("home")}>Back to Home</button>
        </div>
      );
    }

    // ---------- NEW POST ----------
    if (view === "new") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back</button>
          <h2>Share Something</h2>
          <p className="support-hero-sub">This is a safe space. Say whatever's on your mind.</p>
          <textarea
            className="support-textarea"
            placeholder="How are you feeling today? Ask a question, share an experience, or just vent..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 14px 0" }}>
            <input
              type="checkbox"
              id="anon-check"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#b88f6e" }}
            />
            <label htmlFor="anon-check" style={{ fontSize: "13px", color: "#4b4038", cursor: "pointer", userSelect: "none" }}>
              Post anonymously
            </label>
          </div>
          <button className="main-btn" style={{ width: "100%" }} onClick={handlePostSubmit}>
            Post 💜
          </button>
        </div>
      );
    }

    // ---------- EXISTING CHATS ----------
    if (view === "existing") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back</button>
          <h2>Community Chats</h2>

          {posts.length === 0 ? (
            <div className="support-empty">
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🌸</div>
              <p>No posts yet — be the first to share!</p>
              <button className="main-btn" onClick={() => setView("new")}>Start a conversation</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
              {posts.map(post => {
                const isOwn = (post.real_username || post.username) === user;
                const replyCount = post.replies?.length || 0;
                return (
                  <div key={post.id} style={{
                    background: isOwn ? "rgba(201,168,137,0.18)" : "rgba(255,255,255,0.26)",
                    borderRadius: "16px",
                    padding: "14px",
                    border: "1.5px solid rgba(120,95,70,0.1)",
                    backdropFilter: "blur(8px)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div className="post-avatar">{getInitial(post.username)}</div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#3f3732", flex: 1 }}>
                        {isOwn ? "You" : post.username}
                        {isOwn && <span className="post-own-badge" style={{ marginLeft: "6px" }}>your post</span>}
                      </span>
                      {isOwn && (
                        <button className="post-delete-btn" onClick={() => handleDeletePost(post.id)}>✕</button>
                      )}
                    </div>

                    <p style={{ fontSize: "14px", color: "#4b4038", margin: "0 0 10px 0", lineHeight: "1.5" }}>{post.content}</p>

                    <button className="main-btn" style={{ fontSize: "12px", padding: "7px 14px", marginTop: 0 }}
                      onClick={() => setShowReplies({ ...showReplies, [post.id]: !showReplies[post.id] })}>
                      {showReplies[post.id] ? "Hide replies" : `💬 ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                    </button>

                    {showReplies[post.id] && (
                      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(120,95,70,0.1)" }}>
                        {replyCount === 0 && (
                          <p style={{ fontSize: "12px", color: "#aaa", fontStyle: "italic", margin: "0 0 8px 0" }}>No replies yet — be the first 💜</p>
                        )}
                        {post.replies?.map((r, i) => (
                          <div key={i} style={{
                            marginBottom: "6px",
                            textAlign: r.username === user ? "right" : "left"
                          }}>
                            <span style={{ fontSize: "10px", color: "#8a6f5a", fontWeight: "700", display: "block", marginBottom: "2px" }}>
                              {r.username === user ? "You" : r.username}
                            </span>
                            <span style={{
                              display: "inline-block",
                              background: r.username === user ? "rgba(201,168,137,0.25)" : "rgba(255,255,255,0.4)",
                              borderRadius: "10px",
                              padding: "6px 10px",
                              fontSize: "13px",
                              color: "#4b4038",
                              maxWidth: "80%",
                              textAlign: "left"
                            }}>{r.content}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
                          <input
                            type="text"
                            className="reply-input"
                            placeholder="Write a reply..."
                            value={replyText[post.id] || ""}
                            onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleReplySubmit(post.id)}
                          />
                          <button className="reply-send-btn" onClick={() => handleReplySubmit(post.id)}>↑</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // ---------- ASK AN EXPERT ----------
    if (view === "expert") {
      if (expertSubmitted) {
        return (
          <div className="container">
            <div className="expert-success">
              <div style={{ fontSize: "50px", marginBottom: "12px" }}>🩺</div>
              <h2>Question Sent!</h2>
              <p>A qualified health professional will review your question and get back to you. You're doing the right thing by reaching out.</p>
              <button className="main-btn" onClick={() => { setExpertSubmitted(false); setExpertMsg(""); setView("menu"); }}>
                Back to Support
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back</button>
          <div className="expert-header">
            <div style={{ fontSize: "36px" }}>🩺</div>
            <h2>Ask an Expert</h2>
            <p className="support-hero-sub">Your question goes directly to a qualified health professional. All responses are confidential.</p>
          </div>
          <textarea
            className="support-textarea"
            placeholder="Describe your concern in as much detail as you feel comfortable sharing..."
            value={expertMsg}
            onChange={(e) => setExpertMsg(e.target.value)}
          />
          <button className="main-btn" style={{ width: "100%" }} onClick={handleExpertSubmit}>
            Send to Expert 🩺
          </button>
        </div>
      );
    }

    return null;
  };


    // ---------- EMERGENCY CONTACTS ----------
  const EmergencyContacts = () => (
    <div className="container">
      <div className="support-hero">
        <div className="support-hero-icon">🚨</div>
        <h2>Emergency Contacts</h2>
        <p className="support-hero-sub">If you are feeling unsafe or overwhelmed, you are not alone. Help is available right now.</p>
      </div>
      <div className="support-menu-grid">
        <button className="support-menu-card" onClick={() => window.location.href = "tel:"}>
          <span className="support-menu-icon">👤</span>
          <div>
            <span className="support-menu-label">Call Emergency Contact</span>
            <span className="support-menu-desc">Reach someone you trust</span>
          </div>
        </button>
        <button className="support-menu-card" onClick={() => window.location.href = "tel:08081961776"}>
          <span className="support-menu-icon">💜</span>
          <div>
            <span className="support-menu-label">PANDAS Helpline</span>
            <span className="support-menu-desc">0808 196 1776 · 11am–10pm daily</span>
          </div>
        </button>
        <button className="support-menu-card" onClick={() => window.location.href = "tel:"}>
          <span className="support-menu-icon">🩺</span>
          <div>
            <span className="support-menu-label">Request Health Visitor</span>
            <span className="support-menu-desc">Contact your local service</span>
          </div>
        </button>
        <button className="support-menu-card support-menu-card--expert" onClick={() => window.location.href = "tel:999"}>
          <span className="support-menu-icon">🚑</span>
          <div>
            <span className="support-menu-label">Call 999</span>
            <span className="support-menu-desc">Emergency services — immediate danger</span>
          </div>
        </button>
      </div>
      <button className="main-btn" style={{ marginTop: "10px" }} onClick={() => setPage("home")}>Back to Home</button>
    </div>
  );

  // ---------- INFORMATION ----------
  const Information = () => {
    const [view, setView] = useState("menu");

    const ExternalLink = ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="article-link">
        {children} ↗
      </a>
    );

    const Helpline = ({ name, number, hours, href }) => (
      <div className="helpline-card">
        <div className="helpline-name">{name}</div>
        {number && <div className="helpline-number">{number}</div>}
        {hours && <div className="helpline-hours">{hours}</div>}
        {href && <ExternalLink href={href}>Visit website</ExternalLink>}
      </div>
    );

    if (view === "menu") {
      const articles = [
        { key: "article1", icon: "🧠", title: "What is Postnatal Depression?", desc: "Symptoms & how it differs from baby blues" },
        { key: "article2", icon: "⚠️", title: "Risk Factors", desc: "Who is more likely to be affected and why" },
        { key: "article3", icon: "💊", title: "Treatment & Recovery", desc: "Therapy, medication & self-help" },
        { key: "article4", icon: "🌟", title: "You're Not Alone", desc: "Public figures who have spoken out" },
        { key: "article5", icon: "💬", title: "Reducing Stigma", desc: "Breaking barriers to seeking help" },
        { key: "article6", icon: "🚨", title: "When to Seek Help", desc: "Warning signs & what to do" },
      ];
      return (
        <div className="container">
          <h2>Information & Awareness</h2>
          <p style={{ fontSize: "13px", color: "#7a6555", marginBottom: "16px" }}>
            Trusted resources from the NHS, WHO, and leading health organisations.
          </p>
          <div className="article-grid">
            {articles.map(a => (
              <div key={a.key} className="article-card" onClick={() => setView(a.key)}>
                <div className="article-card-icon">{a.icon}</div>
                <div className="article-card-title">{a.title}</div>
                <div className="article-card-desc">{a.desc}</div>
              </div>
            ))}
          </div>
          <button className="main-btn" onClick={() => setPage("home")}>Back to Home</button>
        </div>
      );
    }

    if (view === "article1") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back to Articles</button>
          <div className="article">
            <div className="article-badge">🧠 Understanding PND</div>
            <h2>What is Postnatal Depression?</h2>
            <p>
              Postnatal depression (PND) is a type of depression that can affect parents after having a baby.
              It's more common than many people realise — <strong>affecting more than 1 in every 10 women
              within a year of giving birth</strong>, and it can also affect fathers and partners.
            </p>
            <div className="article-callout">
              💡 PND is different from the "baby blues" — a normal period of tearfulness and low mood in the
              first week after birth that usually passes within 2 weeks. PND lasts longer and requires support.
            </div>
            <h3>Common Symptoms</h3>
            <ul>
              <li>Persistent low mood or sadness</li>
              <li>Feeling unable to enjoy things you used to love</li>
              <li>Withdrawing from family and friends</li>
              <li>Feeling exhausted but unable to sleep</li>
              <li>Difficulty bonding with your baby</li>
              <li>Frightening thoughts about harming yourself or your baby</li>
              <li>Feelings of guilt, worthlessness, or being a bad mother</li>
            </ul>
            <p>
              PND can develop gradually and is often hard to recognise. Many mothers don't seek help
              because they worry they'll be judged — but it is a medical condition, not a personal failing.
            </p>
            <div className="article-video">
              <p className="video-label">📺 Watch: NHS — Understanding Postnatal Depression</p>
              <ExternalLink href="https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/">
                NHS Postnatal Depression Guide
              </ExternalLink>
            </div>
            <h3>Trusted Sources</h3>
            <div className="link-list">
              <ExternalLink href="https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/">NHS — Postnatal Depression Overview</ExternalLink>
              <ExternalLink href="https://www.who.int/teams/mental-health-and-substance-use/promotion-prevention/maternal-mental-health">WHO — Maternal Mental Health</ExternalLink>
              <ExternalLink href="https://www.unicef.org/parenting/mental-health/what-postpartum-depression">UNICEF — What is Postpartum Depression?</ExternalLink>
              <ExternalLink href="https://www.rcpsych.ac.uk/mental-health/problems-disorders/post-natal-depression">Royal College of Psychiatrists — PND</ExternalLink>
            </div>
            <div style={{ height: "16px" }} />
            <button className="main-btn" style={{ width: "100%" }} onClick={() => setView("menu")}>← Back to Articles</button>
          </div>
        </div>
      );
    }

    if (view === "article2") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back to Articles</button>
          <div className="article">
            <div className="article-badge">⚠️ Risk Factors</div>
            <h2>Who is at Risk?</h2>
            <p>
              Postnatal depression can affect <em>anyone</em> — even those with no previous mental health history.
              However, certain factors can increase the likelihood of developing it.
            </p>
            <div className="article-callout">
              ⚠️ Having risk factors doesn't mean you will develop PND, and having none of them doesn't mean
              you won't. The important thing is knowing what to watch for.
            </div>
            <h3>Known Risk Factors</h3>
            <ul>
              <li>A personal or family history of depression or mental illness</li>
              <li>Mental health problems during pregnancy (antenatal depression or anxiety)</li>
              <li>A difficult or traumatic birth experience</li>
              <li>Lack of support from a partner, family or friends</li>
              <li>Relationship difficulties or domestic stress</li>
              <li>Financial worries or housing insecurity</li>
              <li>A premature baby or baby with health complications</li>
              <li>Significant hormonal changes after birth</li>
              <li>Previous miscarriage or pregnancy loss</li>
              <li>Having an unplanned pregnancy</li>
            </ul>
            <h3>Why Hormones Matter</h3>
            <p>
              After birth, levels of oestrogen and progesterone drop sharply. This sudden hormonal shift
              can affect brain chemistry in ways that trigger depression — similar to how smaller hormonal
              changes can cause premenstrual mood changes, but more intense.
            </p>
            <h3>Trusted Sources</h3>
            <div className="link-list">
              <ExternalLink href="https://www.nhs.uk/mental-health/conditions/post-natal-depression/causes/">NHS — Causes of Postnatal Depression</ExternalLink>
              <ExternalLink href="https://www.acog.org/womens-health/faqs/postpartum-depression">American College of Obstetricians &amp; Gynecologists</ExternalLink>
              <ExternalLink href="https://www.psychiatry.org/patients-families/peripartum-depression/what-is-peripartum-depression">American Psychiatric Association — Perinatal Depression</ExternalLink>
            </div>
            <div style={{ height: "16px" }} />
            <button className="main-btn" style={{ width: "100%" }} onClick={() => setView("menu")}>← Back to Articles</button>
          </div>
        </div>
      );
    }

    if (view === "article3") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back to Articles</button>
          <div className="article">
            <div className="article-badge">💊 Treatment & Recovery</div>
            <h2>Treatment & Recovery</h2>
            <p>
              With the right treatment and support, <strong>most people make a full recovery from postnatal
              depression</strong> — although it can take time. The sooner you seek help, the sooner you can
              start feeling better.
            </p>
            <h3>Talking Therapies</h3>
            <ul>
              <li><strong>Cognitive Behavioural Therapy (CBT)</strong> — helps you identify and change negative thought patterns</li>
              <li><strong>Interpersonal Therapy (IPT)</strong> — focuses on relationships and communication</li>
              <li><strong>Guided self-help</strong> — working through a programme, sometimes with therapist support</li>
            </ul>
            <h3>Medication</h3>
            <p>
              Antidepressants may be recommended for moderate to severe PND, or if therapy alone isn't helping.
              Your GP can prescribe options that are safe to take while breastfeeding. They usually take
              1–2 weeks to start working and are typically taken for at least 6 months.
            </p>
            <h3>Self-Help Strategies</h3>
            <ul>
              <li>Talk openly with your partner, family, or friends</li>
              <li>Accept help when it's offered — you don't need to do it all alone</li>
              <li>Rest when your baby rests</li>
              <li>Eat regular nutritious meals</li>
              <li>Gentle exercise such as walking can significantly improve mood</li>
              <li>Join a local or online mothers' support group</li>
            </ul>
            <div className="article-callout">
              🩺 You can self-refer to NHS talking therapies in England — you don't need a GP referral.{" "}
              <ExternalLink href="https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service/">Find a service near you</ExternalLink>
            </div>
            <h3>Trusted Sources</h3>
            <div className="link-list">
              <ExternalLink href="https://www.nhs.uk/mental-health/conditions/post-natal-depression/treatment/">NHS — Treatment for Postnatal Depression</ExternalLink>
              <ExternalLink href="https://www.mind.org.uk/information-support/types-of-mental-health-problems/postnatal-depression-and-perinatal-mental-health/">Mind — Postnatal Depression Support</ExternalLink>
            </div>
            <div style={{ height: "16px" }} />
            <button className="main-btn" style={{ width: "100%" }} onClick={() => setView("menu")}>← Back to Articles</button>
          </div>
        </div>
      );
    }

    if (view === "article4") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back to Articles</button>
          <div className="article">
            <div className="article-badge">🌟 Real Stories</div>
            <h2>You're Not Alone</h2>
            <p>
              Postnatal depression affects women across all walks of life. When public figures speak openly
              about their experiences, it helps break the silence and encourages others to seek help.
            </p>
            <div className="article-callout">
              💜 "You are not alone, you are not to blame, and with help, you will get better." — Postpartum Support International
            </div>
            <h3>Voices That Helped Break the Stigma</h3>
            <div className="story-card">
              <div className="story-name">Adele</div>
              <p>The singer has spoken about experiencing postnatal depression after the birth of her son,
              describing feeling like she didn't recognise herself. Talking to other mothers and realising
              she wasn't alone was what began to help her.</p>
            </div>
            <div className="story-card">
              <div className="story-name">Chrissy Teigen</div>
              <p>Chrissy Teigen wrote an open essay describing her postpartum depression experience — including
              not being able to get out of bed and feeling completely detached. Her honesty helped millions
              of women recognise their own symptoms.</p>
            </div>
            <div className="story-card">
              <div className="story-name">Serena Williams</div>
              <p>Serena Williams has spoken about the emotional challenges she faced after the birth of her
              daughter, including feeling overwhelmed and anxious. She has used her platform to encourage
              mothers to speak up without shame.</p>
            </div>
            <div className="story-card">
              <div className="story-name">Hayden Panettiere</div>
              <p>The actress sought inpatient treatment for postnatal depression and has spoken publicly about
              how serious the condition can be, urging other mothers not to wait to get professional help.</p>
            </div>
            <h3>More Real Stories</h3>
            <div className="link-list">
              <ExternalLink href="https://www.pandasfoundation.org.uk/stories/">PANDAS Foundation — Real Stories</ExternalLink>
              <ExternalLink href="https://apni.org/">Association for Post Natal Illness — Personal Experiences</ExternalLink>
            </div>
            <div style={{ height: "16px" }} />
            <button className="main-btn" style={{ width: "100%" }} onClick={() => setView("menu")}>← Back to Articles</button>
          </div>
        </div>
      );
    }

    if (view === "article5") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back to Articles</button>
          <div className="article">
            <div className="article-badge">💬 Reducing Stigma</div>
            <h2>Reducing Stigma</h2>
            <p>
              Despite being one of the most common complications of childbirth, postnatal depression remains
              widely misunderstood. Stigma — both social and self-imposed — is one of the biggest barriers
              to mothers getting the help they need.
            </p>
            <h3>Common Myths — Debunked</h3>
            <ul>
              <li><strong>"Good mothers don't get depressed."</strong> — False. PND is a medical condition, not a reflection of your love for your baby or your ability as a mother.</li>
              <li><strong>"It's just hormones — it will pass."</strong> — PND is caused by many factors and doesn't always resolve on its own. It needs proper support.</li>
              <li><strong>"If I tell someone, they'll take my baby away."</strong> — False. Seeking help shows you're a caring parent. Babies are very rarely removed due to a parent's mental health.</li>
              <li><strong>"It only affects certain types of people."</strong> — PND can affect anyone, regardless of background, income, or how much they wanted their baby.</li>
            </ul>
            <div className="article-callout">
              📢 The more openly we talk about postnatal depression, the easier it becomes for mothers to
              recognise their symptoms and reach out before things get worse.
            </div>
            <h3>What You Can Do</h3>
            <ul>
              <li>Talk openly with friends and family about how you're feeling</li>
              <li>Share reliable resources with people you know</li>
              <li>Challenge misconceptions when you hear them</li>
              <li>Reach out to a mother you're worried about — a simple check-in makes all the difference</li>
            </ul>
            <h3>Trusted Sources</h3>
            <div className="link-list">
              <ExternalLink href="https://maternalmentalhealthalliance.org/">Maternal Mental Health Alliance</ExternalLink>
              <ExternalLink href="https://www.mind.org.uk/information-support/types-of-mental-health-problems/postnatal-depression-and-perinatal-mental-health/">Mind UK — Perinatal Mental Health</ExternalLink>
              <ExternalLink href="https://www.nhsinform.scot/illnesses-and-conditions/mental-health/postnatal-depression/">NHS Inform — Postnatal Depression</ExternalLink>
            </div>
            <div style={{ height: "16px" }} />
            <button className="main-btn" style={{ width: "100%" }} onClick={() => setView("menu")}>← Back to Articles</button>
          </div>
        </div>
      );
    }

    if (view === "article6") {
      return (
        <div className="container">
          <button className="back-link" onClick={() => setView("menu")}>← Back to Articles</button>
          <div className="article">
            <div className="article-badge">🚨 Getting Help</div>
            <h2>When to Seek Help</h2>
            <p>
              If you or someone you know is experiencing symptoms of postnatal depression,
              <strong> please don't wait</strong>. Early support leads to faster recovery.
            </p>
            <h3>Seek Help If You Experience:</h3>
            <ul>
              <li>Low mood or sadness lasting more than 2 weeks</li>
              <li>Feeling unable to cope with day-to-day life</li>
              <li>Difficulty caring for yourself or your baby</li>
              <li>Thoughts of harming yourself or your baby</li>
              <li>Feeling detached from reality or experiencing confusion</li>
            </ul>
            <div className="article-callout alert-red">
              🚨 If you are having thoughts of harming yourself or your baby <strong>right now</strong>, call <strong>999</strong> or go to your nearest A&amp;E immediately.
            </div>
            <h3>UK Helplines &amp; Support</h3>
            <Helpline name="PANDAS Foundation" number="0808 196 1776" hours="11am–10pm, every day" href="https://www.pandasfoundation.org.uk/" />
            <Helpline name="Association for Post Natal Illness (APNI)" number="020 7386 0868" hours="Mon–Fri, 10am–2pm" href="https://apni.org/" />
            <Helpline name="Mind Infoline" number="0300 123 3393" hours="Mon–Fri, 9am–6pm" href="https://www.mind.org.uk/" />
            <Helpline name="Samaritans (24/7)" number="116 123" hours="Available 24 hours a day, 7 days a week" href="https://www.samaritans.org/" />
            <Helpline name="NCT Helpline" number="0300 330 0700" hours="Mon–Fri, 9am–5pm" href="https://www.nct.org.uk/" />
            <h3>NHS Resources</h3>
            <div className="link-list">
              <ExternalLink href="https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service/">Find NHS Talking Therapies near you</ExternalLink>
              <ExternalLink href="https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/">NHS — Postnatal Depression</ExternalLink>
              <ExternalLink href="https://maternalmentalhealthalliance.org/campaign/help/">Maternal Mental Health Alliance — Get Help</ExternalLink>
            </div>
            <div style={{ height: "16px" }} />
            <button className="main-btn" style={{ width: "100%" }} onClick={() => setView("menu")}>← Back to Articles</button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ---------------- LOGIN SCREEN ----------------
  if (!user) {
    return (
      <AppShell>
        <div className="container auth-screen">
          <BrandLogo />
          <p style={{ fontSize: "13px", color: "#8a6f5a", margin: "0 0 20px 0", textAlign: "center", lineHeight: "1.5" }}>
            A safe space where mothers support mothers.
          </p>
          <div className="auth-toggle">
            <button className="main-btn" style={{ opacity: authMode === "login" ? 1 : 0.4, minWidth: "110px" }} onClick={() => { setAuthMode("login"); setLoginError(""); }}>Login</button>
            <button className="main-btn" style={{ opacity: authMode === "register" ? 1 : 0.4, minWidth: "110px" }} onClick={() => { setAuthMode("register"); setLoginError(""); }}>Register</button>
          </div>
          <div style={{ width: "100%", maxWidth: "280px", margin: "0 auto" }}>
            <p className="field-label" style={{ textAlign: "left", fontSize: "12px", color: "#8a6f5a", fontWeight: "600", marginBottom: "4px" }}>Username</p>
            <input className="auth-input" style={{ width: "100%", marginBottom: "12px" }} placeholder="Enter your username..." value={inputName} onChange={(e) => { setInputName(e.target.value); setLoginError(""); }} />
            <p className="field-label" style={{ textAlign: "left", fontSize: "12px", color: "#8a6f5a", fontWeight: "600", marginBottom: "4px" }}>Password</p>
            <input className="auth-input" style={{ width: "100%", marginBottom: "4px" }} type="password" placeholder="Enter your password..." value={inputPassword} onChange={(e) => { setInputPassword(e.target.value); setLoginError(""); }} />
          </div>
          {loginError && <p className="error-text" style={{ marginTop: "6px" }}>{loginError}</p>}
          <button className="main-btn" style={{ marginTop: "16px", minWidth: "160px" }} onClick={handleLogin}>
            {authMode === "login" ? "Login" : "Create Account"}
          </button>
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "20px", textAlign: "center", lineHeight: "1.5" }}>
            Your data is private and secure.
          </p>
        </div>
      </AppShell>
    );
  }

  // ---------------- PAGE ROUTING ----------------
  if (page === "daily") return <AppShell onSOS={() => setPage("emergency")}><DailyTracker /></AppShell>;
  if (page === "dailyResult") return <AppShell onSOS={() => setPage("emergency")}><DailyResult /></AppShell>;
  if (page === "monthly") return <AppShell onSOS={() => setPage("emergency")}><MonthlyCheckin /></AppShell>;
  if (page === "calendar") return <AppShell onSOS={() => setPage("emergency")}><CalendarPage /></AppShell>;
  if (page === "support") return <AppShell onSOS={() => setPage("emergency")}><SupportGroup /></AppShell>;
  if (page === "emergency") return <AppShell><EmergencyContacts /></AppShell>;
  if (page === "info") return <AppShell onSOS={() => setPage("emergency")}><Information /></AppShell>;

  // ---------------- HOME PAGE ----------------
  return (
    <AppShell onSOS={() => setPage("emergency")}>
      <div className="container home-screen">
        <BrandLogo />
        <p className="hello-text">Hi, {user} 👋</p>
        <div className="home-grid">
          <div className="home-card home-card-large" onClick={() => setPage("daily")}>
            Daily Tracker
          </div>
          <div className="home-card" onClick={() => setPage("monthly")}>
            Monthly Check-In
          </div>
          <div className="home-card" onClick={() => setPage("calendar")}>
            Calendar
          </div>
          <div className="home-card" onClick={() => setPage("support")}>
            Support Groups
          </div>
          <div className="home-card" onClick={() => setPage("emergency")}>
            Emergency Contacts
          </div>
          <div className="home-card home-card-large" onClick={() => setPage("info")}>
            Information & Awareness
          </div>
        </div>
        <button className="main-btn" onClick={handleLogout} style={{ marginTop: "20px" }}>Log Out</button>
      </div>
    </AppShell>
  );
}

export default App;