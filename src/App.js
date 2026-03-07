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

    // ---------- MONTHLY CHECK-IN ----------
    const MonthlyCheckin = () => {
      const questions = [
        {
          question: "1. I have been able to laugh and see the funny side of things:",
          options: [
            "As much as I always could",
            "Not quite as much now",
            "Definitely not so much now",
            "Not at all"
          ]
        },
        {
          question: "2. I have looked forward with enjoyment to things:",
          options: [
            "As much as I ever did",
            "Rather less than I used to",
            "Definitely less than I used to",
            "Hardly at all"
          ]
        },
        {
          question: "3. I have blamed myself unnecessarily when things went wrong:",
          options: [
            "Yes, most of the time",
            "Yes, some of the time",
            "Not very often",
            "No, never"
          ]
        },
        {
          question: "4. I have been anxious or worried for no good reason:",
          options: [
            "No, not at all",
            "Hardly ever",
            "Yes, sometimes",
            "Yes, very often"
          ]
        },
        {
          question: "5. I have felt scared or panicky for no very good reason:",
          options: [
            "Yes, quite a lot",
            "Yes, sometimes",
            "No, not much",
            "No, not at all"
          ]
        },
        {
          question: "6. Things have been getting on top of me:",
          options: [
            "Yes, most of the time I haven’t been able to cope at all",
            "Yes, sometimes I haven’t been coping as well as usual",
            "No, most of the time I have coped quite well",
            "No, I have been coping as well as ever"
          ]
        },
        {
          question: "7. I have been so unhappy that I have had difficulty sleeping:",
          options: [
            "Yes, most of the time",
            "Yes, sometimes",
            "Not very often",
            "No, not at all"
          ]
        },
        {
          question: "8. I have felt sad or miserable:",
          options: [
            "Yes, most of the time",
            "Yes, quite often",
            "Not very often",
            "No, not at all"
          ]
        },
        {
          question: "9. I have been so unhappy that I have been crying:",
          options: [
            "Yes, most of the time",
            "Yes, quite often",
            "Only occasionally",
            "No, never"
          ]
        },
        {
          question: "10. The thought of harming myself has occurred to me:",
          options: [
            "Yes, quite often",
            "Sometimes",
            "Hardly ever",
            "Never"
          ]
        }
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
            <h2>Monthly Check-In Submitted</h2>
            <p>Your responses have been recorded.</p>

            <div className="alert">
              If you are experiencing persistent low mood or thoughts of self-harm,
              please seek professional support immediately.
            </div>

            <button className="main-btn" onClick={() => setPage("home")}>
              Back to Home
            </button>
          </div>
        );
      }

      return (
        <div className="container">
          <h2>Monthly Mental Health Check-In</h2>

          <p>{questions[currentQuestion].question}</p>

          <div className="vertical-options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className="option-btn"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "20px" }}>

            {currentQuestion === 0 && (
              <button
                className="main-btn"
                onClick={() => setPage("home")}
              >
                Back to Home
              </button>
            )}

            {currentQuestion > 0 && (
              <button
                className="main-btn"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                Previous
              </button>
            )}

            {currentQuestion < questions.length - 1 && (
              <button
                className="main-btn"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </button>
            )}

            {currentQuestion === questions.length - 1 && (
              <button
                className="main-btn"
                onClick={() => setSubmitted(true)}
              >
                Submit
              </button>
            )}

          </div>

        </div>
      );
    };














   



    // Add other code above this line as below it is the UI and we want to keep a clean structure


    // ---------- HOME ----------
    return (
      <div className="container">
        <h1 className="app-title">AFTER 9</h1>
      

        <div className="home-grid">

        <div
          className="home-card home-card-large"
          onClick={() => setPage("daily")}
        >
          Daily Tracker
        </div>

        <div
          className="home-card"
          onClick={() => setPage("weekly")}
        >
          Monthly Check-In
        </div>

        <div
          className="home-card"
          onClick={() => setPage("support")}
        >
          Support Groups
        </div>

        <div
          className="home-card"
          onClick={() => setPage("emergency")}
        >
          Emergency Contacts
        </div>

        <div
          className="home-card"
          onClick={() => setPage("info")}
        >
          Information & Awareness
        </div>

      </div>
      </div>
    );
    

  }
  
  export default App;

