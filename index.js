const BOT_TOKEN   = "8284872523:AAHgec_-A5fRZHHQErJDHw4c0OAhmFOjhcs";
const ADMIN_ID    = 8341909387;
const GROUP_1     = -1003837168073;
const GROUP_2     = -1003757012314;
const BACKOFFICE  = -1003681110338;
const SHEET_URL   = "https://script.google.com/macros/s/AKfycbzHElP69tfzGCuJw6fASflv9DL8fd_bYDOchS32HpPoCg2H9vAPCAjyjr0cTIImLEyI/exec";

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
  const msg          = update.message;
  const chatId       = msg.chat.id;
  const text         = msg.text || "";
  const isOrderGroup = (chatId === GROUP_1 || chatId === GROUP_2);

  if (!isOrderGroup) {
    await sendMessage(chatId, "✅ KORD Bot is running and watching order groups.");
    return;
  }

  if (isOrderGroup && isOrder(text)) {
    await validateOrder(msg);
  }
}

function isOrder(text) {
  const fieldCount = [
    /^name\s*:/im,
    /^customer\s*:/im,
    /^contact\s*:/im,
    /^location\s*:/im,
    /^product\s*:/im,
    /^operator\s*:/im,
    /^date\s*:/im
  ].filter(re => re.test(text)).length;
  return fieldCount >= 3;
}

async function validateOrder(msg) {
  const text   = msg.text || "";
  const chatId = msg.chat.id;
  const msgId  = msg.message_id;
  const userId = msg.from.id;

  const missing = [];
  const invalid = [];

  // ── Extract fields ─────────────────────────────────
  const date     = extractField(text, "Date");
  const name     = extractField(text, "Name|Customer");
  const location = extractField(text, "Location|Address|Zone|Delivery");
  const contact  = extractField(text, "Contact|Phone|Tel");
  const product  = extractField(text, "Product|Item");
  const qty      = extractField(text, "Quantity|Qty");
  const price    = extractField(text, "Price|Amount");
  const operator = extractField(text, "Operator|Agent");

  // ── Check returning customer ───────────────────────
  const isReturning = /returning\s*(customer|client)/i.test(text);

  // ── Missing fields ─────────────────────────────────
  if (!date)     missing.push("Date");
  if (!name)     missing.push("Name");
  if (!location) missing.push("Location");
  if (!contact)  missing.push("Contact");
  if (!product)  missing.push("Product");
  if (!qty)      missing.push("Quantity");
  if (!price)    missing.push("Price");
  if (!operator) missing.push("Operator");

  // ── Date format ────────────────────────────────────
  if (date) {
    const dateValid = /^\d{1,2}[\/\-]\d{1,2}[\/\-](\d{2}|\d{4})$/.test(date.trim());
    if (!dateValid) invalid.push("Date: wrong format (use DD/MM/YY)");
  }

  // ── Contact validation ─────────────────────────────
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

  // ── Quantity ───────────────────────────────────────
  if (qty && isNaN(parseInt(qty))) {
    invalid.push("Quantity: must be a number");
  }

  // ── Price ──────────────────────────────────────────
  if (price && isNaN(parseInt(price.replace(/[,\s]/g, "")))) {
    invalid.push("Price: must be a number");
  }

  // ── Build validation reply ─────────────────────────
  const parts = [];
  if (missing.length > 0) parts.push(`Missing: ${missing.join(", ")}`);
  if (invalid.length > 0) parts.push(invalid.join(" | "));

  if (parts.length > 0) {
    const groupMsg = `⚠️ ${parts.join(" | ")}`;
    await sendMessage(chatId, groupMsg, msgId);

    // ── DM the poster ──────────────────────────────
    const dmMsg =
      `⚠️ Issue with your order\n\n` +
      `Customer: ${name || "—"}\n` +
      `Contact posted: ${contact || "—"}\n\n` +
      parts.map(p => `❌ ${p}`).join("\n") +
      `\n\nPlease fix and repost.`;
    try {
      await sendMessage(userId, dmMsg);
    } catch(e) {
      // Operator hasn't started the bot
    }
  }

  // ── Duplicate contact check (skip if returning) ────
  if (contact && name && !isReturning) {
    const raw      = contact.replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1")
                            .replace(/[\s\-\(\)]/g, "");
    const stripped = raw.startsWith("+233") ? "0" + raw.substring(4)
                   : raw.startsWith("233")  ? "0" + raw.substring(3)
                   : raw;

    try {
      const checkRes = await fetch(
        `${SHEET_URL}?action=checkContact&contact=${encodeURIComponent(stripped)}&name=${encodeURIComponent(name)}`
      );
      const result = await checkRes.json();

      if (result.found) {
        const warning =
          `⚠️ Contact ${stripped} was used ${result.daysAgo} day(s) ago ` +
          `for a different customer (${result.name}) — please verify`;
        await sendMessage(chatId, warning, msgId);
      }

      // ── Log this contact for future checks ─────────
      await fetch(
        `${SHEET_URL}?action=logContact&contact=${encodeURIComponent(stripped)}&name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}`
      );
    } catch(e) {
      console.error("Sheet check error:", e);
    }
  }
}

function extractField(text, pattern) {
  const cleaned = text.replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1");
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:${pattern})\\s*:?\\s*([^\\n]*)`, "im"
  );
  return (cleaned.match(re) || [])[1]?.trim() || "";
}

async function sendMessage(chatId, text, replyToId) {
  const payload = {
    chat_id: chatId,
    text:    text
  };
  if (replyToId) payload.reply_to_message_id = replyToId;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload)
  });
}
