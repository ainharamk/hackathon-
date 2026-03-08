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
                className={`option-btn ${answers[currentQuestion] === option ? "active" : ""}`}
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
  
  // ---------- SUPPORT GROUP ----------
const SupportGroup = () => {

  const [view, setView] = useState("menu");

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("supportPosts");
    return saved ? JSON.parse(saved) : [];
  });

  const [newPost, setNewPost] = useState("");
  const [replyText, setReplyText] = useState({});

  const savePosts = (updatedPosts) => {
    setPosts(updatedPosts);
    localStorage.setItem("supportPosts", JSON.stringify(updatedPosts));
  };

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      content: newPost,
      replies: [],
      createdByUser: true
    };

    const updatedPosts = [post, ...posts];
    savePosts(updatedPosts);
    setNewPost("");
  };

  const handleReplySubmit = (postId) => {
    if (!replyText[postId]?.trim()) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, replyText[postId]]
        };
      }
      return post;
    });

    savePosts(updatedPosts);
    setReplyText({ ...replyText, [postId]: "" });
  };


  // ---------- MAIN MENU ----------
  if (view === "menu") {
    return (
      <div className="container">
        <h2>Support Groups</h2>

        <p>
          Connect with other mothers, join conversations, or seek expert advice.
        </p>

        <div className="vertical-options">
          <button className="main-btn" onClick={() => setView("new")}>
            New Chat
          </button>

          <button className="main-btn" onClick={() => setView("existing")}>
            Existing Chats
          </button>

          <button className="main-btn" onClick={() => setView("expert")}>
            Ask an Expert
          </button>
        </div>

        <button className="main-btn" onClick={() => setPage("home")}>
          Back to Home
        </button>
      </div>
    );
  }
  // ---------- NEW CHAT ----------
  if (view === "new") {
    return (
      <div className="container">
        <h2>Start a New Chat</h2>

        <textarea
          placeholder="Write your question or share something..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          style={{ width: "100%", minHeight: "80px", marginTop: "10px" }}
        />

        <button className="main-btn" onClick={handlePostSubmit}>
          Post
        </button>

        <div className="vertical-options" style={{ marginTop: "20px" }}>
          <button
            className="main-btn"
            onClick={() => setView("yourChats")}
          >
            Your Chats
          </button>
        </div>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }
    // ---------- EXISTING CHATS ----------
  if (view === "existing") {
    return (
      <div className="container">
        <h2>Existing Chats</h2>

        {posts.length === 0 && <p>No chats available yet.</p>}

        {posts.map(post => (
          <div
            key={post.id}
            style={{
              textAlign: "left",
              marginBottom: "15px",
              padding: "10px",
              background: "#f5f3ff",
              borderRadius: "8px"
            }}
          >
            <p><strong>Anonymous:</strong> {post.content}</p>
            <p style={{ fontSize: "12px", color: "gray" }}>
              {post.replies.length} replies
            </p>
          </div>
        ))}

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }

   // ---------- ASK AN EXPERT ----------
  if (view === "expert") {
    return (
      <div className="container">
        <h2>Ask an Expert</h2>

        <p>
          Submit your concern and a qualified health professional will respond.
          This feature can later connect to real clinicians.
        </p>

        <textarea
          placeholder="Describe your concern..."
          style={{ width: "100%", minHeight: "80px", marginTop: "10px" }}
        />

        <button className="main-btn" style={{ marginTop: "15px" }}>
          Submit to Expert
        </button>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }
};



// ---------- EMERGENCY CONTACTS ----------
const EmergencyContacts = () => (
 <div className="container">

 <h2>Emergency Contacts</h2>

 <p>
 This page provides immediate access to support services.
 If you are feeling unsafe, overwhelmed, or experiencing thoughts
 of self-harm, please use one of the options below.
 </p>

 <div className="vertical-options">

 <button className="main-btn">
 Call Emergency Contact
 </button>

 <button className="main-btn">
 Call Postpartum Helpline
 </button>

 <button className="main-btn">
 Request Health Visitor
 </button>

 <button className="main-btn">
 Call Emergency Services
 </button>

 </div>



 <button className="main-btn" onClick={() => setPage("home")}>
 Back to Home
 </button>

 </div>
);




// ---------- INFORMATION ----------
const Information = () => {

  const [view, setView] = useState("menu");

  // ---------- MAIN ARTICLE MENU ----------
  if (view === "menu") {
    return (
      <div className="container">
        <h2>Information & Awareness</h2>

        <p>
          This section provides educational resources about postpartum mental
          health, including symptoms, risk factors, recovery strategies, and
          real-world experiences. Increasing awareness helps families and
          communities better understand how to support new mothers.
        </p>

        <div className="article-grid">

          <div className="article-card" onClick={() => setView("article1")}>
            Understanding Postpartum Depression
          </div>

          <div className="article-card" onClick={() => setView("article2")}>
            Risk Factors
          </div>

          <div className="article-card" onClick={() => setView("article3")}>
            Treatment & Recovery
          </div>

          <div className="article-card" onClick={() => setView("article4")}>
            Public Awareness & Real Stories
          </div>

          <div className="article-card" onClick={() => setView("article5")}>
            Reducing Stigma
          </div>

          <div className="article-card" onClick={() => setView("article6")}>
            When to Seek Help
          </div>

        </div>

        <button className="main-btn" onClick={() => setPage("home")}>
          Back to Home
        </button>
      </div>
    );
  }

  // ---------- ARTICLE 1 ----------
  if (view === "article1") {
    return (
      <div className="container article">
        <h2>Understanding Postpartum Depression</h2>

        <p>
          Postpartum depression (PPD) is a mood disorder that can affect
          individuals after childbirth. It involves emotional, psychological,
          and physical changes that may interfere with a mother's wellbeing
          and her ability to carry out daily activities.
        </p>

        <p>
          Research suggests that postpartum depression affects a significant
          proportion of new mothers worldwide. Early recognition and support
          are essential to ensure healthy recovery for both mother and child.
        </p>

        <h3>Common Symptoms</h3>
        <ul>
          <li>Persistent sadness or low mood</li>
          <li>Loss of interest in previously enjoyed activities</li>
          <li>Sleep disturbances or extreme fatigue</li>
          <li>Feelings of guilt, hopelessness, or worthlessness</li>
          <li>Difficulty bonding with the baby</li>
        </ul>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }

  // ---------- ARTICLE 2 ----------
  if (view === "article2") {
    return (
      <div className="container article">
        <h2>Risk Factors</h2>

        <p>
          Several biological, psychological, and social factors can increase
          the likelihood of developing postpartum depression.
        </p>

        <ul>
          <li>Lack of emotional or practical support</li>
          <li>History of depression or anxiety</li>
          <li>Hormonal changes following childbirth</li>
          <li>Stressful life circumstances</li>
          <li>Traumatic or complicated birth experiences</li>
        </ul>

        <p>
          Identifying these risk factors early can help healthcare providers
          and families provide better preventative support.
        </p>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }

  // ---------- ARTICLE 3 ----------
  if (view === "article3") {
    return (
      <div className="container article">
        <h2>Treatment & Recovery</h2>

        <p>
          Postpartum depression is treatable, and many individuals recover
          successfully with appropriate support. Treatment approaches often
          include psychological therapies, medical care, and strong social
          support systems.
        </p>

        <ul>
          <li>Cognitive behavioural therapy (CBT)</li>
          <li>Professional counselling</li>
          <li>Medication prescribed by healthcare professionals</li>
          <li>Peer support groups</li>
          <li>Family and partner involvement</li>
        </ul>

        <p>
          Early intervention significantly improves recovery outcomes and
          helps mothers regain emotional wellbeing.
        </p>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }

  // ---------- ARTICLE 4 ----------
  if (view === "article4") {
    return (
      <div className="container article">
        <h2>Public Awareness & Real Stories</h2>

        <p>
          Public figures sharing their experiences can help reduce stigma and
          raise awareness of postpartum mental health challenges.
        </p>

        <p>
          Tennis champion Serena Williams publicly discussed the emotional
          difficulties she experienced after giving birth. By speaking openly
          about postpartum struggles, she helped highlight that mental health
          challenges after childbirth can affect anyone regardless of status
          or success.
        </p>

        <p>
          Other public figures such as Adele and Chrissy Teigen have also
          spoken about their experiences, encouraging open conversations
          around maternal mental health.
        </p>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }

  // ---------- ARTICLE 5 ----------
  if (view === "article5") {
    return (
      <div className="container article">
        <h2>Reducing Stigma</h2>

        <p>
          Many mothers hesitate to seek help due to stigma or fear of being
          judged. Increasing awareness and education helps normalize
          discussions around postpartum mental health.
        </p>

        <p>
          Open conversations between families, healthcare providers, and
          communities encourage individuals to seek support earlier and
          improve recovery outcomes.
        </p>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }

  // ---------- ARTICLE 6 ----------
  if (view === "article6") {
    return (
      <div className="container article">
        <h2>When to Seek Help</h2>

        <p>
          Professional support should be considered if symptoms persist for
          more than two weeks, significantly affect daily functioning, or
          include thoughts of self-harm.
        </p>

        <p>
          Healthcare providers, therapists, and support groups can provide
          guidance and treatment options to support recovery.
        </p>

        <button className="main-btn" onClick={() => setView("menu")}>
          Back
        </button>
      </div>
    );
  }
};









    // Add other code above this line as below it is the UI and we want to keep a clean structure







    // ---------- PAGE ROUTING ----------
    if (page === "daily") return <DailyTracker />;
    if (page === "dailyResult") return <DailyResult />;
    if (page === "weekly") return <MonthlyCheckin />;
    if (page === "support") return <SupportGroup />;
    if (page === "emergency") return <EmergencyContacts />;
    if (page === "info") return <Information />;





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

