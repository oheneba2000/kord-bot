const BOT_TOKEN  = "8284872523:AAHgec_-A5fRZHHQErJDHw4c0OAhmFOjhcs";
const ADMIN_ID   = 8341909387;
const GROUP_1    = -1003837168073;
const GROUP_2    = -1003757012314;
const BACKOFFICE = -1003681110338;

const UPSTASH_URL   = "https://crack-minnow-180173.upstash.io";
const UPSTASH_TOKEN = "gQAAAAAAAr_NAAIgcDIxOGJjMTRhMGE2OTc0NmE0YjRkNTViMWYwNzM4ZjgxZg";

const SHEET_ID     = "1W7AVhwpkDVuHn1It5-QJmgnZRksXp002tEPIktOep_w";
const CLIENT_EMAIL = "kord-sheets@kord-bot.iam.gserviceaccount.com";
const PRIVATE_KEY  = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCt0fNeeUiPCbW3\nnT2bszJD4kbTaczt6Er6eD8x4LYzdXKCY1bddJe5agJT2NwCJzMrjffjD5r7tCe4\nOO1xNNpCPyMdHXl6idY7qTGynOxw/ZJmhnG7W4OEby5ytbfx3Vm05Nf2cm71z1E9\nZ94F5+ttZjuIT8T0WGQ08tyPpJLbc82iCfjP9Y2MLpHA146SPNQRcGIBzPxqXwzW\n5aeAWyomAJV25XByIMkjWd8L3JKymDDIiu8sxbssNLGUamcOWjzcuAdUPmmzMsGI\nmxekGRNyMBECfs4U4YBJS0NVQlCb/bi9AzYfsiE42rW+LPpZoQ7o3MrAJE1eRReX\nl5Xxhj5xAgMBAAECggEAFSxA194wL3RAVVhq+79NPSWf+PqnQseL8oyZLgswRn5k\n72sIVrtwC97U37/HtN9vhTuq2Va6SzS7rd4JVkPY3j7wmQhRFtMZbHUEn7wrtOu+\nXIy959OS5pvgbYqjGGwdFELX56Yyy/Bv9enkCpYggFf2onkNBbKKqkR3B2xFk0OJ\ngcQngAgTJEes2KZ8T4dchppx8LAIVhQWkGSc1o29/eWv0YbuwjytGNUUm7KTcv4k\nGx5pSjc5nywGAh9QVmDAdf6iFm59WeSngd8FBDt8b23h0U47Fs/x7mHxCwBoT37T\n4DSY/bzuGNm6LH67o2ib9wqhXQsq4RsOBuFUFNRf3QKBgQDTDkBZprHQ25hdQmW2\nsJeOmX+1VaoONhJj4iF3HrMpXAT2pc4q8ItyFXJcDFH1/d88ZoKT1h4FrJlxTi2p\nGYvPlBvE6WwaXFsd412dMsFID3sYcgABOYp8ig6DYrsUZ2+H1wq9TjvyFQoN8LVN\nEdYCD0CCWI3of/wMljPz/b107wKBgQDS1ctw6bgbV/TNUfzT78QegcEA+a2Xphh/\nH7Mvem0j+rRn+S8e/KWetdbrGTjdoC4Qd1+Z4iKRN3bpfkg1Kdgd2+V356TwwgvE\n6lSBvwcnXBc4Rx8xQsIx0YUtlxZo0LDYQsrtysMOiJxiNSWUAZaK685cO7ODrVHC\n4uGIjJtCnwKBgH3YAIy0NVBor5fj8EwXTbcMVbalBooEucBu5C9n0cI2iQscYCsA\nVNVIbnDuM6yunH4iTXei8zHE8ZU63UT344J5OHmYCQpKyVWv7XC/A7pY6LfxuYkB\na07I7tBufUg0SK9BjLjFvj6hRuZ7AU+b8/Q0be2KqcrZDUvf/8hbIq1nAoGAbaZL\nG/oxiecAphfRydeUw9jvq7YulgQIEXVHF5YwVNn6IWjzHMaAzD39/F8tt/Wqf13W\nFo4JNEUITv8iRqPwhfbrLKUInz4MKOlF8gSLj+jRGq/ChTgXDxnMjZ1aRkDi+FYk\ne+9L6q8ZxemmFYeN58ojlMxn3D+zmgutB/s4dDkCgYAep1qsHX8txnUKuWcCScIj\nA4n4uK3/wXzjOGno5vJfv4x+0iVZSNJAqIaLdX77z2zRiCvc9RgyRtHf0V5o3oK+\n9W9m/gDthMzynWRqc1bwoky5Tj4HClWXk/SQ4zpX7ZkWjfCL2mcqGj5Ku5L4qClt\nWixFmPigd+4HuxF4K4lhqg==\n-----END PRIVATE KEY-----\n";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("KORD Bot is running.");
  }
  try {
    const update = req.body;
    await handleUpdate(update);
  } catch (err) {
    console.error("Error:", err);
  }
  res.status(200).send("OK");
}

async function handleUpdate(update) {
  if (!update.message) return;
  const msg    = update.message;
  const chatId = msg.chat.id;
  const text   = msg.text || "";
  const userId = msg.from.id;
  const isOrderGroup = (chatId === GROUP_1 || chatId === GROUP_2);

  // ── Private DM commands ────────────────────────────
  if (!isOrderGroup) {
    const trimmed = text.trim();

    // Forwarded / pasted order — cache it so /store can pull the contact automatically
    if (!trimmed.startsWith("/") && isOrder(text)) {
      await cacheOrderForChat(chatId, text);
      const name = extractField(text, "Name|Customer") || "order";
      await sendMessage(chatId, "📦 Got it — " + name + ". Reply with /store CourierName to assign a courier.");
      return;
    }

    // /store Prince 0244745477
    if (text.startsWith("/store ")) {
      await handleStore(msg);
      return;
    }
    // /assign
    if (text.trim() === "/assign") {
      await handleAssign(msg);
      return;
    }
    // /stored — show all stored pairs
    if (text.trim() === "/stored") {
      await handleShowStored(msg);
      return;
    }
    // /clear — clear all stored pairs
    if (text.trim() === "/clear") {
      await handleClear(msg);
      return;
    }
    await sendMessage(chatId,
      "✅ KORD Bot commands:\n\n" +
      "Forward me an order, then reply /store CourierName — I'll grab the contact for you\n" +
      "/store Prince 0244745477 — or store a courier + contact manually\n" +
      "/stored — show what's still queued\n" +
      "/assign — assign everything queued to the sheet (checks ORDERS and MODS) in one go\n" +
      "/clear — wipe leftover queue entries from memory only (never touches the sheet); use at end of day for anything that never matched"
    );
    return;
  }

  // ── Order validation in groups ─────────────────────
  if (isOrderGroup && isOrder(text)) {
    await validateOrder(msg);
  }
}

// ─── /store Prince [0244745477] ─────────────────────────
async function handleStore(msg) {
  const chatId = msg.chat.id;
  const parts  = msg.text.trim().split(/\s+/);

  if (parts.length < 2) {
    await sendMessage(chatId, "⚠️ Format: /store CourierName [ContactNumber]\nExample: /store Prince 0244745477\nOr forward the order first, then just: /store Prince");
    return;
  }

  const courier = parts[1];
  let contact = "";

  if (parts.length >= 3) {
    // Explicit contact number given — works exactly as before
    contact = normalizeContact(parts[2]);
    if (!contact) {
      await sendMessage(chatId, "⚠️ Invalid contact number: " + parts[2]);
      return;
    }
  } else {
    // No contact given — pull it from a replied-to order, or the last order forwarded to this chat
    const orderText =
      (msg.reply_to_message && (msg.reply_to_message.text || msg.reply_to_message.caption)) ||
      (await getCachedOrderForChat(chatId));

    if (!orderText) {
      await sendMessage(chatId, "⚠️ No order on file. Forward the order to me first, then send /store " + courier);
      return;
    }

    const rawContact = extractField(orderText, "Contact|Phone|Tel")
      .replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1")
      .replace(/[\s\-\(\)]/g, "");
    contact = normalizeContact(rawContact);

    if (!contact) {
      await sendMessage(chatId, "⚠️ Couldn't find a valid contact number in that order. Use /store " + courier + " ContactNumber instead.");
      return;
    }
  }

  await redisSet("courier:" + contact, JSON.stringify({
    courier,
    contact,
    storedAt: Date.now()
  }));

  // Add to index list
  const listRaw = await redisGet("courier:list");
  const list    = listRaw ? JSON.parse(listRaw) : [];
  if (!list.includes(contact)) {
    list.push(contact);
    await redisSet("courier:list", JSON.stringify(list));
  }

  await sendMessage(chatId, "✅ Stored: " + courier + " → " + contact);
}

// ─── /stored — show all stored pairs ──────────────────
async function handleShowStored(msg) {
  const chatId  = msg.chat.id;
  const listRaw = await redisGet("courier:list");
  const list    = listRaw ? JSON.parse(listRaw) : [];

  if (!list.length) {
    await sendMessage(chatId, "No stored courier assignments.");
    return;
  }

  const lines = ["📋 Stored courier assignments:\n"];
  for (const contact of list) {
    const raw  = await redisGet("courier:" + contact);
    const data = raw ? JSON.parse(raw) : null;
    if (data) lines.push(data.courier + " → " + contact);
  }

  await sendMessage(chatId, lines.join("\n"));
}

// ─── /clear — clear all stored pairs ──────────────────
async function handleClear(msg) {
  const chatId  = msg.chat.id;
  const listRaw = await redisGet("courier:list");
  const list    = listRaw ? JSON.parse(listRaw) : [];

  for (const contact of list) {
    await redisDel("courier:" + contact);
  }
  await redisDel("courier:list");

  await sendMessage(chatId, "✅ All stored assignments cleared.");
}

// ─── /assign — write couriers to sheet ────────────────
async function handleAssign(msg) {
  const chatId  = msg.chat.id;
  const listRaw = await redisGet("courier:list");
  const list    = listRaw ? JSON.parse(listRaw) : [];

  if (!list.length) {
    await sendMessage(chatId, "No stored assignments to process.");
    return;
  }

  await sendMessage(chatId, "⏳ Processing " + list.length + " assignments...");

  try {
    const token       = await getAccessToken();
    const ordersRows  = await getSheetRows(token, "ORDERS", "A7:D");
    const modsRows    = await getSheetRows(token, "MODS",   "A4:D");

    const assigned = [];
    const notFound = [];
    const remaining = []; // contacts that stay queued (no match found)

    for (const contact of list) {
      const raw  = await redisGet("courier:" + contact);
      const data = raw ? JSON.parse(raw) : null;
      if (!data) continue;

      // Search ORDERS first (header row 7), then MODS (header row 4)
      let sheetName = null, foundRow = -1;

      for (let i = 0; i < ordersRows.length; i++) {
        const rowContact = normalizeContact(String(ordersRows[i][3] || ""));
        if (rowContact === contact) { sheetName = "ORDERS"; foundRow = 7 + i; break; }
      }
      if (foundRow < 0) {
        for (let i = 0; i < modsRows.length; i++) {
          const rowContact = normalizeContact(String(modsRows[i][3] || ""));
          if (rowContact === contact) { sheetName = "MODS"; foundRow = 4 + i; break; }
        }
      }

      if (foundRow > 0) {
        await writeSheetCell(token, sheetName, "F" + foundRow, data.courier);
        assigned.push(data.courier + " → " + contact + " (" + sheetName + ")");
        // Successfully assigned — remove from the queue immediately
        await redisDel("courier:" + contact);
      } else {
        notFound.push(data.courier + " → " + contact + " (not found in ORDERS or MODS)");
        remaining.push(contact);
      }
    }

    // Rewrite the queue to only contain contacts that still need attention
    if (remaining.length) {
      await redisSet("courier:list", JSON.stringify(remaining));
    } else {
      await redisDel("courier:list");
    }

    let reply = "";
    if (assigned.length) {
      reply += "✅ Assigned (" + assigned.length + "):\n" + assigned.join("\n");
    }
    if (notFound.length) {
      reply += "\n\n⚠️ Still pending (" + notFound.length + "):\n" + notFound.join("\n");
    }

    await sendMessage(chatId, reply || "Nothing processed.");

  } catch (err) {
    await sendMessage(chatId, "❌ Error: " + err.message);
  }
}

// ─── Normalize contact number ──────────────────────────
function normalizeContact(raw) {
  if (!raw) return "";
  const cleaned = raw.replace(/[\s\-\(\)\+]/g, "");
  if (/^233\d{9}$/.test(cleaned)) return "0" + cleaned.substring(3);
  if (/^0\d{9}$/.test(cleaned))   return cleaned;
  return "";
}

// ─── Order validation ──────────────────────────────────
function isOrder(text) {
  const fieldCount = [
    /^name\s*:/im,
    /^customer\s*:/im,
    /^contact\s*:/im,
    /^location\s*:/im,
    /^product\s*:/im,
    /^operator\s*:/im,
    /^date\s*:/im
  ].filter(function(re) { return re.test(text); }).length;
  return fieldCount >= 3;
}

async function validateOrder(msg) {
  const text   = msg.text || "";
  const chatId = msg.chat.id;
  const msgId  = msg.message_id;
  const userId = msg.from.id;

  const missing = [];
  const invalid = [];

  const date     = extractField(text, "Date");
  const name     = extractField(text, "Name|Customer");
  const location = extractField(text, "Location|Address|Zone|Delivery");
  const contact  = extractField(text, "Contact|Phone|Tel");
  const product  = extractField(text, "Product|Item");
  const qty      = extractField(text, "Quantity|Qty");
  const price    = extractField(text, "Price|Amount");
  const operator = extractField(text, "Operator|Agent");

  const isReturning = /returning\s*(customer|client)/i.test(text);

  if (!date)     missing.push("Date");
  if (!name)     missing.push("Name");
  if (!location) missing.push("Location");
  if (!contact)  missing.push("Contact");
  if (!product)  missing.push("Product");
  if (!qty)      missing.push("Quantity");
  if (!price)    missing.push("Price");
  if (!operator) missing.push("Operator");

  if (date) {
    const dateValid = /^\d{1,2}[\/\-]\d{1,2}[\/\-](\d{2}|\d{4})$/.test(date.trim());
    if (!dateValid) invalid.push("Date: wrong format (use DD/MM/YY)");
  }

  if (contact) {
    const raw = contact.replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1");
    if (/\s/.test(raw)) {
      invalid.push("Contact: remove spaces");
    } else {
      const stripped = raw.replace(/[\-\(\)]/g, "");
      const valid10  = /^0\d{9}$/.test(stripped);
      const valid12  = /^233\d{9}$/.test(stripped);
      const valid13  = /^\+233\d{9}$/.test(stripped);
      if (!valid10 && !valid12 && !valid13) {
        const len = stripped.replace(/^\+/, "").length;
        if (len < 10)      invalid.push("Contact: too short");
        else if (len > 13) invalid.push("Contact: too long");
        else               invalid.push("Contact: wrong format");
      }
    }
  }

  if (qty   && isNaN(parseInt(qty)))                        invalid.push("Quantity: must be a number");
  if (price && isNaN(parseInt(price.replace(/[,\s]/g,"")))) invalid.push("Price: must be a number");

  const parts = [];
  if (missing.length > 0) parts.push("Missing: " + missing.join(", "));
  if (invalid.length > 0) parts.push(invalid.join(" | "));

  if (parts.length > 0) {
    await sendMessage(chatId, "⚠️ " + parts.join(" | "), msgId);
    const dmMsg =
      "⚠️ Issue with your order\n\n" +
      "Customer: " + (name || "—") + "\n" +
      "Contact posted: " + (contact || "—") + "\n\n" +
      parts.map(function(p) { return "❌ " + p; }).join("\n") +
      "\n\nPlease fix and repost.";
    try { await sendMessage(userId, dmMsg); } catch(e) {}
  }

  if (contact && name && !isReturning) {
    const raw = contact
      .replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1")
      .replace(/[\s\-\(\)]/g, "");
    const stripped = raw.startsWith("+233") ? "0" + raw.substring(4)
                   : raw.startsWith("233")  ? "0" + raw.substring(3)
                   : raw;

    try {
      const existing = await redisGet("contact:" + stripped);
      if (existing) {
        const data = JSON.parse(existing);
        if (data.name.toLowerCase() !== name.trim().toLowerCase()) {
          const daysAgo = Math.floor((Date.now() - data.timestamp) / (1000 * 60 * 60 * 24));
          await sendMessage(chatId,
            "⚠️ Contact " + stripped + " was used " + daysAgo + " day(s) ago for a different customer (" + data.name + ") — please verify",
            msgId
          );
        }
      }
      await redisSet("contact:" + stripped, JSON.stringify({ name: name.trim(), timestamp: Date.now() }));
    } catch(e) {
      console.error("Redis error:", e);
    }
  }
}

function extractField(text, pattern) {
  const cleaned = text.replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1");
  const re = new RegExp("(?:^|\\n)\\s*(?:" + pattern + ")\\s*:?\\s*([^\\n]*)", "im");
  return (cleaned.match(re) || [])[1]?.trim() || "";
}

// ─── Google Sheets ─────────────────────────────────────
async function getAccessToken() {
  const now   = Math.floor(Date.now() / 1000);
  const claim = {
    iss:   CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud:   "https://oauth2.googleapis.com/token",
    exp:   now + 3600,
    iat:   now
  };

  const header  = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = toBase64Url(JSON.stringify(claim));
  const input   = header + "." + payload;

  const keyData   = PRIVATE_KEY
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "").trim();

  const binaryKey = Uint8Array.from(atob(keyData), function(c) { return c.charCodeAt(0); });
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(input));
  var sigStr = "";
  new Uint8Array(signature).forEach(function(b) { sigStr += String.fromCharCode(b); });
  const jwt = input + "." + toBase64Url(sigStr, true);

  const res  = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt
  });
  const data = await res.json();
  return data.access_token;
}

function toBase64Url(str, isBinary) {
  var b64 = isBinary ? btoa(str) : btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getSheetRows(token, sheetName, range) {
  const url  = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(sheetName + "!" + range);
  const res  = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  const data = await res.json();
  return data.values || [];
}

async function writeSheetCell(token, sheetName, cell, value) {
  const range = sheetName + "!" + cell;
  await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(range) + "?valueInputOption=USER_ENTERED",
    {
      method:  "PUT",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body:    JSON.stringify({ range, majorDimension: "ROWS", values: [[value]] })
    }
  );
}

// ─── Upstash Redis ─────────────────────────────────────
async function redisGet(key) {
  const res  = await fetch(UPSTASH_URL + "/get/" + encodeURIComponent(key), {
    headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
  });
  const data = await res.json();
  return data.result;
}

async function redisSet(key, value) {
  await fetch(UPSTASH_URL + "/set/" + encodeURIComponent(key) + "/" + encodeURIComponent(value), {
    headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
  });
}

async function redisDel(key) {
  await fetch(UPSTASH_URL + "/del/" + encodeURIComponent(key), {
    headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
  });
}

async function redisSetEx(key, value, seconds) {
  await fetch(UPSTASH_URL + "/setex/" + encodeURIComponent(key) + "/" + seconds + "/" + encodeURIComponent(value), {
    headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
  });
}

// ─── Last forwarded order per chat (12 hour expiry) ────
async function cacheOrderForChat(chatId, text) {
  await redisSetEx("lastOrder:" + chatId, text, 43200);
}

async function getCachedOrderForChat(chatId) {
  return await redisGet("lastOrder:" + chatId);
}

// ─── Send Telegram message ─────────────────────────────
async function sendMessage(chatId, text, replyToId) {
  const payload = { chat_id: chatId, text };
  if (replyToId) payload.reply_to_message_id = replyToId;
  await fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload)
  });
}

function doGet(e) {
  return new Response("KORD Bot is running.");
}
