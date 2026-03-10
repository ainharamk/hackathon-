# After9 💜

A full-stack web platform designed to support mothers experiencing **Postnatal Depression (PND)** through mood tracking, peer support, and mental health resources.

Built during a hackathon, **After9** combines community support, wellbeing tracking, and educational resources into a simple mobile-style interface designed to feel supportive and accessible during difficult moments.

---

# 🌍 Live Deployment

The application is deployed using Railway.

Application (Frontend + Backend)

https://hackathon-production-a0f1.up.railway.app

GitHub Repository

https://github.com/ainharamk/hackathon-

The web application and database are hosted through Railway, allowing the frontend interface and backend API to run from the same deployment.

---

# 📊 Project Architecture

The project follows a **full-stack architecture**.

```
React Frontend
      │
      │ REST API Requests
      ▼
Express.js Backend
      │
      │ SQL Queries
      ▼
MySQL Database
```

All services are deployed using Railway.

---

# 🧠 Features

## 🔐 User Authentication

Users can create accounts and securely log in.

Security features include:

* Password hashing using **bcrypt**
* Username uniqueness validation
* Backend authentication verification

API routes

```
POST /users/register
POST /users/login
```

---

# 📅 Daily Mood & Sleep Tracker

Users can track their daily wellbeing by logging:

* Mood (1–5 scale)
* Hours of sleep

This information is stored in the **daily_tracker** table.

API routes

```
POST /tracker
GET /tracker?username=example
```

The backend returns the **most recent entry for the user**, allowing the interface to display their latest wellbeing update.

### Future Improvements

Future versions of the tracker could include:

* Calculating **average mood scores**
* Weekly and monthly wellbeing summaries
* Mood trend visualisations
* Pattern detection for sleep and emotional health

These features would help users better understand long-term wellbeing patterns.

---

# 💬 Community Support Forum

The platform includes a **community support forum** where users can connect with others experiencing similar challenges.

Users can:

* Create posts
* Reply to posts
* Post anonymously
* Delete their own posts

API routes

```
GET /forum/posts
POST /forum/posts
POST /forum/posts/:id/reply
DELETE /forum/posts/:id
```

### Anonymous Posting System

Users can choose to post anonymously.

When this happens:

* The displayed username becomes **"Anonymous"**
* The **real username is still securely stored in the database**

This design allows important safety features in future updates, including:

* Reporting harassment
* Moderator review of harmful posts
* Removing abusive content
* Identifying concerning posts such as suicidal messages

Storing the real username also ensures the **original poster can still delete their own post**, even when it appears anonymous to other users.

This approach balances **privacy with safety and accountability**.

---

# 👩‍⚕️ Ask an Expert

Users can submit questions to professionals through the **Ask an Expert** feature.

Currently these questions are stored as special forum posts marked as expert enquiries.

API route

```
POST /forum/experts
```

Example stored format

```
[EXPERT QUESTION] message text
```

### Future Improvements

In future versions this feature could become a **secure enquiry system**, where:

* Only **verified or hired professionals** can access expert questions
* Professionals can respond directly to users
* Conversations can function similarly to **support tickets**
* Responses can be moderated to ensure reliable medical guidance

This would allow the platform to connect users with **qualified mental health professionals**.

---

# 🚑 Emergency Support Access

Emergency resources are always visible in the **top-right corner of the application**.

This ensures users can quickly access help without needing to navigate through menus.

Available resources include:

* Emergency services
* Mental health helplines
* Support organisations

The goal is to ensure **help is always immediately accessible if a user is in distress**.

---

# 📸 Application Screenshots

---

### 🔐 Login Screen &nbsp;&nbsp;&nbsp; 📊 Mood Tracker

<p float="left">
  <img width="380" alt="Login Screen" src="https://github.com/user-attachments/assets/502c8c20-6b93-4f71-88e2-10637f22125d" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="380" alt="Mood Tracker" src="https://github.com/user-attachments/assets/b7adb458-372f-4477-a91b-abe6a0dcb62c" />
</p>

---

### 💬 Community Forum

<p float="left">
  <img width="380" alt="Community Forum" src="https://github.com/user-attachments/assets/c1ca2b9c-0ee4-455a-9b36-fdb6e9486ea4" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="380" alt="Community Forum Thread" src="https://github.com/user-attachments/assets/0ffe7770-8dea-41e5-b396-2c342276eb7d" />
</p>

---

### 📅 Monthly Summary Dashboard

<p>
  <img width="380" alt="Monthly Summary Dashboard" src="https://github.com/user-attachments/assets/7460823f-4554-4c92-a38f-f5b44b11495d" />
</p>

---

# 🛠 Tech Stack

Frontend

* React
* JavaScript
* CSS

Backend

* Node.js
* Express.js

Database

* MySQL

Security

* bcrypt password hashing

Deployment

* Railway

Development Tools

* Git
* GitHub
* npm

---

# 🗄 Database Structure

### users

```
id
username
password
```

### daily_tracker

```
id
username
mood
hours_slept
created_at
```

### forum_posts

```
id
username
real_username
message
created_by_user
created_at
```

### forum_replies

```
id
post_id
username
message
created_at
```

---

# 🚀 Future Roadmap

Planned improvements for After9 include:

* AI-powered mood pattern detection
* Weekly and monthly wellbeing insights
* Professional mental health expert dashboard
* Secure expert enquiry system
* Real-time community chat
* Push notifications for wellbeing reminders
* Mobile application version
* Moderation tools for harmful posts
* Crisis detection alerts for concerning messages

The long-term goal is to evolve After9 into a **complete digital support platform for maternal mental health**.

---

# 👥 Hackathon Project Team

This project was developed collaboratively during a hackathon focused on **innovative technology that improves the lives of women.**. Team members contributed across different areas including frontend design, backend development, database structure, and deployment.

**Adnan**
Worked mainly on backend development for the daily mood tracker, implementing the logic for recording and retrieving mood and sleep data. He also helped improve and adapt the SQL database structure to support the tracker functionality and ensure the stored data worked effectively with the backend API.

**Ainhara**
Played a major role in the frontend design and overall presentation of the platform. This included developing much of the website’s CSS styling, choosing colour schemes, selecting imagery, and organising informational resources and articles related to postnatal depression. She also helped shape the overall UI and user experience to make the platform approachable and supportive.

**Dhruvesh**
Originally proposed the idea for the project and contributed significantly to backend development. He helped design the SQL database structure and played an important role in building the community support group system, including the structure for posts and replies that allows users to share experiences and support one another.

**Justin**
Worked on backend development and deployment, including hosting the SQL database and application using Railway. Also helped integrate the project by merging features from separate development branches and ensuring the different components worked together correctly.

**Zakariya**
Worked extensively on frontend functionality, including implementing the login interface and authentication interactions. He also contributed multiple improvements to the user interface such as button behaviour, layout adjustments, and other interaction logic to improve usability.

The project was developed collaboratively with team members contributing across both frontend and backend areas throughout the hackathon.

---

# ⚠️ Disclaimer

After9 is designed to **support mental wellbeing**, not replace professional medical advice.

If you or someone you know is experiencing severe distress or thoughts of self-harm, please contact emergency services or a qualified healthcare professional immediately.
