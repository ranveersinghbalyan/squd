/**
 * CYBER SQUAD MASTER BACKEND ENGINE SERVER FRAMEWORK
 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Local user validation arrays
const usersDatabase = [
  { username: 'GHOST_7', accessPhrase: 'cyber123' }
];

// High-tech shared in-memory leader directory array 
let globalLeaderboard = [];

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "FIELDS EMPTY" });
  
  const userExists = usersDatabase.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (userExists) return res.status(400).json({ success: false, message: "OPERATOR ID TAKEN" });

  usersDatabase.push({ username, accessPhrase: password });
  return res.json({ success: true, message: `REGISTRATION COMMITTED` });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const foundUser = usersDatabase.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!foundUser || foundUser.accessPhrase !== password) {
    return res.status(401).json({ success: false, message: "DECRYPTION CONFLICT" });
  }
  return res.json({ success: true, message: `ACCESS KEY CONFIRMED` });
});

// ==========================================
// REAL-TIME PERSISTENT LEADERBOARD ROUTE
// ==========================================
app.post('/api/leaderboard', (req, res) => {
  const { username, level, totalSets, rank } = req.body;
  
  // If the data payload belongs to a real logged-in user profile, update it
  if (username && username !== 'YOU (ANON_NODE)') {
    const existingPlayerIndex = globalLeaderboard.findIndex(
      p => p.username.toLowerCase() === username.toLowerCase()
    );

    if (existingPlayerIndex !== -1) {
      // Retain tracking indices over the running server lifespan contextually
      globalLeaderboard[existingPlayerIndex] = { username, rank, level, totalSets };
    } else {
      globalLeaderboard.push({ username, rank, level, totalSets });
    }
  }

  // Sort global ledger matrices: Level sequence takes structural priority over total volume sets completed
  globalLeaderboard.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.totalSets - a.totalSets;
  });

  return res.json({
    success: true,
    leaderboard: globalLeaderboard
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`   CYBER SYSTEM CORE ONLINE // PERSISTENT SCOREBOARD REGISTERED`);
  console.log(`   Internal Environment Link: http://localhost:${PORT}   `);
  console.log(`======================================================\n`);
});