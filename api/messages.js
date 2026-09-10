const APP_PASSWORD = "0249";

const UPSTASH_URL   = "https://crack-minnow-180173.upstash.io";
const UPSTASH_TOKEN = "gQAAAAAAAr_NAAIgcDIxOGJjMTRhMGE2OTc0NmE0YjRkNTViMWYwNzM4ZjgxZg";

const CHAT_LABELS = {
  "-1003837168073": "Group 1",
  "-1003757012314": "Group 2",
  "-1003681110338": "Backoffice"
};

export default async function handler(req, res) {
  const action = req.query.action || "";
  const pw     = req.query.pw     || "";

  if (action === "getMessages") {
    if (pw !== APP_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const date = req.query.date || todayKey();
    const messages = await getMessagesForDate(date);
    return res.status(200).json({ date, messages });
  }

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(getHTML());
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // UTC == Ghana date
}

async function getMessagesForDate(date) {
  const raw = await redisLRange("msglog:" + date, 0, -1);
  if (!raw || !raw.length) return [];
  return raw
    .map(s => { try { return JSON.parse(s); } catch { return null; } })
    .filter(Boolean)
    .map(m => ({
      chatId: m.chatId,
      chat:   CHAT_LABELS[String(m.chatId)] || String(m.chatId),
      sender: m.sender,
      text:   m.text,
      ts:     m.ts
    }))
    .sort((a, b) => a.ts - b.ts);
}

// ─── Upstash Redis ─────────────────────────────────────
async function redisLRange(key, start, stop) {
  const r = await fetch(UPSTASH_URL + "/lrange/" + encodeURIComponent(key) + "/" + start + "/" + stop, {
    headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
  });
  const data = await r.json();
  return data.result || [];
}

// ─── Page ───────────────────────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KORD Messages</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f0f0; color: #222; }
    .header { background: #8B0000; color: white; padding: 14px 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .header h1 { font-size: 17px; font-weight: 700; }
    .header p  { font-size: 12px; opacity: 0.8; margin-top: 2px; }
    .date-bar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 10px 12px; background: #6b0000; }
    .date-bar button { background: rgba(255,255,255,0.15); border: none; color: white; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .date-bar button:active { background: rgba(255,255,255,0.3); }
    .date-label { color: white; font-size: 14px; font-weight: 600; min-width: 110px; text-align: center; }
    .chat-bar { display: flex; gap: 6px; padding: 8px 12px; background: white; border-bottom: 1px solid #eee; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
    .chat-bar::-webkit-scrollbar { display: none; }
    .chat-chip { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f0f0f0; color: #444; cursor: pointer; border: 1.5px solid transparent; white-space: nowrap; }
    .chat-chip.active { background: #8B0000; color: white; border-color: #8B0000; }
    .content { padding: 10px 12px; max-width: 640px; margin: 0 auto; }
    .msg-card { background: white; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.07); }
    .msg-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .msg-sender { font-size: 13px; font-weight: 700; }
    .msg-time { font-size: 11px; color: #888; }
    .msg-chat { display: inline-block; font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 8px; background: #f0f0f0; color: #555; margin-bottom: 6px; }
    .msg-text { font-size: 14px; color: #333; white-space: pre-wrap; word-break: break-word; }
    .login-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .login-card { background: white; border-radius: 14px; padding: 30px 24px; width: 100%; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .login-logo { text-align: center; font-size: 36px; font-weight: 900; color: #8B0000; margin-bottom: 8px; }
    .login-sub  { text-align: center; font-size: 13px; color: #888; margin-bottom: 24px; }
    .login-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 18px; text-align: center; letter-spacing: 8px; }
    .login-input:focus { border-color: #8B0000; outline: none; }
    .login-btn { width: 100%; padding: 13px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; margin-top: 14px; cursor: pointer; }
    .login-error { color: #c00; font-size: 13px; text-align: center; margin-top: 10px; display: none; }
    .empty { text-align: center; padding: 40px 20px; color: #888; font-size: 14px; }
  </style>
</head>
<body>

<div id="loginWrap" class="login-wrap">
  <div class="login-card">
    <div class="login-logo">KORD</div>
    <div class="login-sub">Messages</div>
    <input id="pwInput" class="login-input" type="password" placeholder="••••" maxlength="6">
    <button class="login-btn" onclick="login()">Enter</button>
    <div id="loginError" class="login-error">Wrong password</div>
  </div>
</div>

<div id="mainApp" style="display:none;">
  <div class="header">
    <h1>KORD Messages</h1>
    <p id="countLabel">Loading...</p>
  </div>
  <div class="date-bar">
    <button onclick="shiftDay(-1)">‹ Prev</button>
    <div class="date-label" id="dateLabel"></div>
    <button onclick="shiftDay(1)">Next ›</button>
  </div>
  <div class="chat-bar" id="chatBar"></div>
  <div class="content" id="msgList"></div>
</div>

<script>
  let pw = "";
  let currentDate = new Date().toISOString().slice(0, 10);
  let currentChat = "All";
  let messages = [];

  const CHATS = ["All", "Group 1", "Group 2", "Backoffice"];

  function login() {
    pw = document.getElementById("pwInput").value.trim();
    fetchMessages().then(ok => {
      if (!ok) {
        document.getElementById("loginError").style.display = "block";
        return;
      }
      document.getElementById("loginWrap").style.display = "none";
      document.getElementById("mainApp").style.display   = "block";
      buildChatBar();
      renderDateLabel();
      renderMessages();
    });
  }

  function fetchMessages() {
    return fetch("?action=getMessages&pw=" + encodeURIComponent(pw) + "&date=" + currentDate)
      .then(r => r.json())
      .then(data => {
        if (data.error) return false;
        messages = data.messages || [];
        return true;
      })
      .catch(() => false);
  }

  function buildChatBar() {
    const bar = document.getElementById("chatBar");
    bar.innerHTML = "";
    CHATS.forEach(function(c) {
      const chip = document.createElement("div");
      chip.className = "chat-chip" + (c === currentChat ? " active" : "");
      chip.textContent = c;
      chip.addEventListener("click", function() {
        currentChat = c;
        document.querySelectorAll(".chat-chip").forEach(function(el) { el.classList.remove("active"); });
        chip.classList.add("active");
        renderMessages();
      });
      bar.appendChild(chip);
    });
  }

  function shiftDay(delta) {
    const d = new Date(currentDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + delta);
    currentDate = d.toISOString().slice(0, 10);
    renderDateLabel();
    fetchMessages().then(function() { renderMessages(); });
  }

  function renderDateLabel() {
    const d = new Date(currentDate + "T00:00:00Z");
    document.getElementById("dateLabel").textContent =
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }

  function renderMessages() {
    const filtered = currentChat === "All" ? messages : messages.filter(function(m) { return m.chat === currentChat; });
    document.getElementById("countLabel").textContent = filtered.length + " message(s)";

    const list = document.getElementById("msgList");
    if (!filtered.length) {
      list.innerHTML = '<div class="empty">No messages logged for this day</div>';
      return;
    }

    list.innerHTML = filtered.map(function(m) {
      const time = new Date(m.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
      return '<div class="msg-card">' +
        '<div class="msg-chat">' + escapeHtml(m.chat) + '</div>' +
        '<div class="msg-top"><span class="msg-sender">' + escapeHtml(m.sender) + '</span><span class="msg-time">' + time + '</span></div>' +
        '<div class="msg-text">' + escapeHtml(m.text) + '</div>' +
      '</div>';
    }).join("");
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  document.getElementById("pwInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") login();
  });
</script>
</body>
</html>`;
}
