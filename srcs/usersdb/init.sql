-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    winner_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Insert sample data
INSERT OR IGNORE INTO users (id, username, email, password_hash, status, score) VALUES
(1, 'Jobert', 'jojo-13@example.com', 'hash1', 'online', 100),
(2, 'Lascal', 'lascalinette@example.com', 'hash2', 'offline', 200),
(3, 'Peoni', 'pletore@example.com', 'hash3', 'in-game', 150);

INSERT OR IGNORE INTO games (player1_id, player2_id, player1_score, player2_score, status, winner_id) VALUES
(1, 2, 5, 3, 'completed', 1),
(2, 3, 2, 5, 'completed', 3);


