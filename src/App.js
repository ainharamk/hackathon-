import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [mood, setMood] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [weeklyScore, setWeeklyScore] = useState(null);
  const [lastLog, setLastLog] = useState(null);

    // Load last saved log on app start
    useEffect(() => {
      const saved = localStorage.getItem("dailyLog");
      if (saved) {
        setLastLog(JSON.parse(saved));
      }
    }, []);
  
    // ---------- DAILY TRACKER ----------
    const DailyTracker = () => {

      const handleSubmit = () => {
        if (!mood || !sleep) return;

        const log = {
          mood,
          sleep,
          date: new Date().toLocaleDateString()
        };

        localStorage.setItem("dailyLog", JSON.stringify(log));
        setLastLog(log);
        setPage("dailyResult");
      };

      return (
      <div className="container">

        {/* YESTERDAY */}
        <div className="last-log-wide">
          <h3>YESTERDAY</h3>

          {lastLog ? (
            <>
              <p><strong>Mood:</strong> {lastLog.mood}</p>
              <p><strong>Sleep:</strong> {lastLog.sleep} hrs</p>
            </>
          ) : (
            <p>No previous log.</p>
          )}
        </div>

        <h2>Daily Tracker</h2>

        <p>Mood today (1 = very low, 5 = very good)</p>

        <div className="button-group">
          {[1,2,3,4,5].map(num => (
            <button
              key={num}
              className={mood === num ? "active" : ""}
              onClick={() => setMood(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <p>Hours of sleep last night</p>

        <div className="button-group">
          {[1,2,3,4,5,6,7,8].map(num => (
            <button
              key={num}
              className={sleep === num ? "active" : ""}
              onClick={() => setSleep(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <button className="main-btn" onClick={handleSubmit}>
          Submit
        </button>

        <br /><br />

        <button className="main-btn" onClick={() => setPage("home")}>
          Back to Home
        </button>

      </div>
    );
  }
    // ---------- DAILY RESULT ----------
    const DailyResult = () => {
      let message = "";

      if (mood <= 2) {
        message = "You seem a bit low today, why don't you reach out to someone.";
      } 
      else if (mood === 3) {
        message = "Your mood is ok, do something to cheer yourself up.";
      } 
      else if (mood >= 4) {
        message = "Good job, keep going!";
      }

      return (
        <div className="container">

          <h2>Daily Summary</h2>

          <div className="alert">
            {message}
          </div>

          <button className="main-btn" onClick={() => setPage("home")}>
            Go Back Home
          </button>

        </div>
      );
    };
    
  }
  
  export default App;

