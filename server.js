const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simulated Knowledge Base / World Bible for Lore
const worldLore = {
  "sword": "The Sunblade of Aethelgard: Forged in the primordial fires of Mount Vesuvius, it deals radiant damage and blinds undead foes.",
  "boss": "Malakor the Defiled: A fallen paladin turned necromancer. Weak to frost and lightning magic.",
  "quest": "The Tears of the Moon: Retrieve the celestial artifact from the sunken ruins of Atlantis before the blood moon rises.",
  "rules": "Stream rules: Be respectful, no backseat gaming unless asked, and enjoy the chaotic journey!"
};

// Simple heuristic / OpenAI Codex simulated keyword match for lore questions
function findLoreAnswer(message) {
  const lowerMsg = message.toLowerCase();
  for (const [keyword, answer] of Object.entries(worldLore)) {
    if (lowerMsg.includes(keyword)) {
      return { question: message, answer: answer };
    }
  }
  // Fallback default answer if no exact match
  if (lowerMsg.includes('what') || lowerMsg.includes('who') || lowerMsg.includes('where')) {
    return { question: message, answer: "The chronicles remain silent on this matter... for now." };
  }
  return null;
}

// Broadcast to all connected OBS overlays via WebSockets
function broadcastToOverlay(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// REST endpoint to simulate incoming Twitch chat messages or test triggers
app.post('/api/chat-webhook', (req, res) => {
  const { username, message } = req.body;
  console.log(`[Twitch Chat] ${username}: ${message}`);

  const loreResult = findLoreAnswer(message);
  if (loreResult) {
    const payload = {
      type: 'LORE_ALERT',
      user: username,
      ...loreResult
    };
    broadcastToOverlay(payload);
    return res.json({ status: 'triggered', data: payload });
  }

  res.json({ status: 'ignored_not_lore' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Lorekeeper Live server running on http://localhost:${PORT}`);
});
