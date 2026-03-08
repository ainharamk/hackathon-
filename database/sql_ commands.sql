DROP DATABASE hackathon;
CREATE DATABASE hackathon;

USE hackathon;


CREATE TABLE daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(100),
    action VARCHAR(100),
    value INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Daily mood/sleep tracker
CREATE TABLE daily_tracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mood VARCHAR(50),
    hours_slept INT,
    created_at DATE DEFAULT (CURRENT_DATE)
);

drop table forum_posts;

CREATE TABLE forum_posts (
  id BIGINT PRIMARY KEY,
  content TEXT,
  created_by_user BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);


select * from forum_posts;






