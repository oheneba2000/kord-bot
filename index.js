const BOT_TOKEN  = "8284872523:AAHgec_-A5fRZHHQErJDHw4c0OAhmFOjhcs";
const ADMIN_ID   = 8341909387;
const GROUP_1    = -1003837168073;
const GROUP_2    = -1003757012314;
const BACKOFFICE = -1003681110338;

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
  const msg = update.message;
  if (!msg) return;

  const chatId       = msg.chat.id;
  const text         = msg.text || "";
  const isOrderGroup = (chatId === GROUP_1 || chatId === GROUP_2);

  // ── Respond to direct messages ─────────────────────
  if (!isOrderGroup) {
    await sendMessage(chatId, "✅ KORD Bot is running and watching order groups.");
    return;
  }

  if (isOrderGroup && isOrder(text)) {
    await validateOrder(msg);
  }
}

function isOrder(text) {
  return /name|customer|contact|location|operator/i.test(text);
}

async function validateOrder(msg) {
  const text   = msg.text || "";
  const chatId = msg.chat.id;
  const msgId  = msg.message_id;

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
    if (!dateValid) invalid.push("Date format");
  }

  if (contact) {
    const stripped = contact
      .replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1")
      .replace(/[\s\-\(\)]/g, "");
    const valid10 = /^0\d{9}$/.test(stripped);
    const valid12 = /^233\d{9}$/.test(stripped);
    const valid13 = /^\+233\d{9}$/.test(stripped);
    if (!valid10 && !valid12 && !valid13) {
      invalid.push("Contact format");
    }
  }

  if (qty && isNaN(parseInt(qty))) invalid.push("Quantity must be a number");
  if (price && isNaN(parseInt(price.replace(/[,\s]/g, "")))) invalid.push("Price must be a number");

  const parts = [];
  if (missing.length > 0) parts.push(`Missing: ${missing.join(", ")}`);
  if (invalid.length > 0) parts.push(invalid.join(" | "));

  if (parts.length === 0) return;

  await sendMessage(chatId, `⚠️ ${parts.join(" | ")}`, msgId);
}

function extractField(text, pattern) {
  const cleaned = text.replace(/\[([^\]]+)\]\(tel:[^\)]+\)/g, "$1");
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:${pattern})\\s*:?\\s*([^\\n]*)`, "im"
  );
  const match = (cleaned.match(re) || [])[1]?.trim() || "";
  return match;
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
