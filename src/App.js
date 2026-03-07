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
  
    return (
      <div className="App">
        {/* Your component JSX here */}
      </div>
    );
  }
  
  export default App;

