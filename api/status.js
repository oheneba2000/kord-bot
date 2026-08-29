const SHEET_ID     = "1W7AVhwpkDVuHn1It5-QJmgnZRksXp002tEPIktOep_w";
const CLIENT_EMAIL = "kord-sheets@kord-bot.iam.gserviceaccount.com";
const PRIVATE_KEY  = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCt0fNeeUiPCbW3\nnT2bszJD4kbTaczt6Er6eD8x4LYzdXKCY1bddJe5agJT2NwCJzMrjffjD5r7tCe4\nOO1xNNpCPyMdHXl6idY7qTGynOxw/ZJmhnG7W4OEby5ytbfx3Vm05Nf2cm71z1E9\nZ94F5+ttZjuIT8T0WGQ08tyPpJLbc82iCfjP9Y2MLpHA146SPNQRcGIBzPxqXwzW\n5aeAWyomAJV25XByIMkjWd8L3JKymDDIiu8sxbssNLGUamcOWjzcuAdUPmmzMsGI\nmxekGRNyMBECfs4U4YBJS0NVQlCb/bi9AzYfsiE42rW+LPpZoQ7o3MrAJE1eRReX\nl5Xxhj5xAgMBAAECggEAFSxA194wL3RAVVhq+79NPSWf+PqnQseL8oyZLgswRn5k\n72sIVrtwC97U37/HtN9vhTuq2Va6SzS7rd4JVkPY3j7wmQhRFtMZbHUEn7wrtOu+\nXIy959OS5pvgbYqjGGwdFELX56Yyy/Bv9enkCpYggFf2onkNBbKKqkR3B2xFk0OJ\ngcQngAgTJEes2KZ8T4dchppx8LAIVhQWkGSc1o29/eWv0YbuwjytGNUUm7KTcv4k\nGx5pSjc5nywGAh9QVmDAdf6iFm59WeSngd8FBDt8b23h0U47Fs/x7mHxCwBoT37T\n4DSY/bzuGNm6LH67o2ib9wqhXQsq4RsOBuFUFNRf3QKBgQDTDkBZprHQ25hdQmW2\nsJeOmX+1VaoONhJj4iF3HrMpXAT2pc4q8ItyFXJcDFH1/d88ZoKT1h4FrJlxTi2p\nGYvPlBvE6WwaXFsd412dMsFID3sYcgABOYp8ig6DYrsUZ2+H1wq9TjvyFQoN8LVN\nEdYCD0CCWI3of/wMljPz/b107wKBgQDS1ctw6bgbV/TNUfzT78QegcEA+a2Xphh/\nH7Mvem0j+rRn+S8e/KWetdbrGTjdoC4Qd1+Z4iKRN3bpfkg1Kdgd2+V356TwwgvE\n6lSBvwcnXBc4Rx8xQsIx0YUtlxZo0LDYQsrtysMOiJxiNSWUAZaK685cO7ODrVHC\n4uGIjJtCnwKBgH3YAIy0NVBor5fj8EwXTbcMVbalBooEucBu5C9n0cI2iQscYCsA\nVNVIbnDuM6yunH4iTXei8zHE8ZU63UT344J5OHmYCQpKyVWv7XC/A7pY6LfxuYkB\na07I7tBufUg0SK9BjLjFvj6hRuZ7AU+b8/Q0be2KqcrZDUvf/8hbIq1nAoGAbaZL\nG/oxiecAphfRydeUw9jvq7YulgQIEXVHF5YwVNn6IWjzHMaAzD39/F8tt/Wqf13W\nFo4JNEUITv8iRqPwhfbrLKUInz4MKOlF8gSLj+jRGq/ChTgXDxnMjZ1aRkDi+FYk\ne+9L6q8ZxemmFYeN58ojlMxn3D+zmgutB/s4dDkCgYAep1qsHX8txnUKuWcCScIj\nA4n4uK3/wXzjOGno5vJfv4x+0iVZSNJAqIaLdX77z2zRiCvc9RgyRtHf0V5o3oK+\n9W9m/gDthMzynWRqc1bwoky5Tj4HClWXk/SQ4zpX7ZkWjfCL2mcqGj5Ku5L4qClt\nWixFmPigd+4HuxF4K4lhqg==\n-----END PRIVATE KEY-----\n";
const APP_PASSWORD = "0249";

const COURIERS = [
  "Prince","Embeunice","Innocent","Mathew","Takoradi","Tarkwa",
  "Christopher","Adu","Charles","Ernest","Richard","Abdul","AT",
  "Gertrude","Amos","Jesse","Michael","Cape Coast","Foster","Paul",
  "Vimax","Eric","Padmore"
];

export default async function handler(req, res) {
  const url    = new URL(req.url, "https://" + req.headers.host);
  const action = url.searchParams.get("action") || "";
  const pw     = url.searchParams.get("pw")     || "";
  const sheet  = url.searchParams.get("sheet")  || "ORDERS";

  if (req.method === "GET" && !action) {
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(getHTML());
  }

  if (pw !== APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = await getAccessToken();

    if (action === "getOrders") {
      const orders    = await getTodayOrders(token, sheet);
      const dashboard = await getDashboard(token);
      return res.status(200).json({ orders, dashboard });
    }

    if (action === "updateRow") {
      const row             = parseInt(url.searchParams.get("row"));
      const status          = url.searchParams.get("status")          || "";
      const courier         = url.searchParams.get("courier")         || "";
      const customerPayment = url.searchParams.get("customerPayment") || "";
      const riderPayment    = url.searchParams.get("riderPayment")    || "";
      const comment         = url.searchParams.get("comment")         || "";
      const result = await updateSheetRow(token, sheet, row, status, courier, customerPayment, riderPayment, comment);
      return res.status(200).json({ ok: true, result });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
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

  const res = await fetch("https://oauth2.googleapis.com/token", {
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

async function getDashboard(token) {
  const rows = await getSheetRows(token, "ORDERS", "B3:D3");
  if (!rows.length) return {};
  const r = rows[0];
  return {
    todayOrders:    r[0] || "0",
    onDelivery:     r[1] || "0",
    deliveredToday: r[2] || "0"
  };
}

async function updateSheetRow(token, sheetName, rowNum, status, courier, customerPayment, riderPayment, comment) {
  const range  = sheetName + "!E" + rowNum + ":H" + rowNum;
  const values = [[status, courier, customerPayment, riderPayment]];

  const res = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(range) + "?valueInputOption=USER_ENTERED",
    {
      method:  "PUT",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body:    JSON.stringify({ range, majorDimension: "ROWS", values })
    }
  );
  const data = await res.json();

  if (comment) {
    const commentRange = sheetName + "!O" + rowNum;
    await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(commentRange) + "?valueInputOption=USER_ENTERED",
      {
        method:  "PUT",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body:    JSON.stringify({ range: commentRange, majorDimension: "ROWS", values: [[comment]] })
      }
    );
  }

  return data;
}

async function getTodayOrders(token, sheetName) {
  const headerRow = sheetName === "MODS" ? 4 : 7;
  const rows      = await getSheetRows(token, sheetName, "A" + headerRow + ":O");

  const now      = new Date();
  const dd       = String(now.getDate());
  const months   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mmm      = months[now.getMonth()];
  const todayStr = dd + "-" + mmm;

  const orders = [];
  rows.forEach(function(row, idx) {
    if (!row[0]) return;
    const dateVal = String(row[0]).trim();
    if (dateVal !== todayStr) return;
    orders.push({
      row:             headerRow + idx,
      date:            row[0]  || "",
      customer:        row[1]  || "",
      location:        row[2]  || "",
      contact:         row[3]  || "",
      status:          row[4]  || "",
      courier:         row[5]  || "",
      customerPayment: row[6]  || "",
      riderPayment:    row[7]  || "",
      product:         row[9]  || "",
      qty:             row[10] || "",
      price:           row[11] || "",
      operator:        row[12] || "",
      comment:         row[14] || ""
    });
  });
  return orders;
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KORD Status</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f0f0; color: #222; }
    .header { background: #8B0000; color: white; padding: 14px 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .header h1 { font-size: 17px; font-weight: 700; }
    .header p  { font-size: 12px; opacity: 0.8; margin-top: 2px; }
    .dashboard { display: flex; gap: 8px; padding: 10px 12px; background: #6b0000; }
    .dash-card { flex: 1; background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px; text-align: center; color: white; }
    .dash-num  { font-size: 20px; font-weight: 700; }
    .dash-lbl  { font-size: 10px; opacity: 0.8; margin-top: 2px; }
    .tab-bar { display: flex; background: #550000; }
    .tab { flex: 1; padding: 10px; text-align: center; color: white; font-size: 13px; font-weight: 600; cursor: pointer; opacity: 0.6; border-bottom: 3px solid transparent; }
    .tab.active { opacity: 1; border-bottom-color: white; }
    .courier-bar { display: flex; gap: 6px; padding: 8px 12px; background: white; border-bottom: 1px solid #eee; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
    .courier-bar::-webkit-scrollbar { display: none; }
    .courier-chip { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f0f0f0; color: #444; cursor: pointer; border: 1.5px solid transparent; white-space: nowrap; }
    .courier-chip.active { background: #8B0000; color: white; border-color: #8B0000; }
    .search-wrap { padding: 8px 12px; background: white; border-bottom: 1px solid #eee; }
    .search-input { width: 100%; padding: 9px 12px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 14px; }
    .search-input:focus { border-color: #8B0000; outline: none; }
    .content { padding: 10px 12px; max-width: 640px; margin: 0 auto; }
    .order-card { background: white; border-radius: 10px; padding: 14px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.07); }
    .order-card.updated { border-left: 4px solid #2a7a2a; }
    .order-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .order-meta { font-size: 12px; color: #666; margin-bottom: 8px; line-height: 1.6; }
    .order-courier { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: #e8f4fd; color: #1a5276; margin-bottom: 6px; margin-right: 4px; }
    .order-courier.unassigned { background: #fdf2e9; color: #935116; }
    .order-comment { font-size: 11px; color: #8B0000; background: #fff5f5; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px; }
    .order-status { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: #eee; color: #444; margin-bottom: 10px; }
    .order-status.delivered  { background: #d4edda; color: #155724; }
    .order-status.reconfirm  { background: #d6d6f5; color: #333; }
    .order-status.cancelled  { background: #f8d7da; color: #721c24; }
    .order-status.rescheduled { background: #fff3cd; color: #856404; }
    .order-status.failed     { background: #f8d7da; color: #721c24; }
    .update-btn { width: 100%; padding: 10px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; overflow-y: auto; }
    .modal-overlay.open { display: flex; align-items: flex-end; }
    .modal { background: white; width: 100%; max-width: 640px; margin: 0 auto; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; }
    .modal-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; color: #8B0000; }
    .modal-sub { font-size: 12px; color: #888; margin-bottom: 16px; }
    .field-label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; margin-top: 14px; }
    select, textarea { width: 100%; padding: 10px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 14px; background: white; font-family: inherit; }
    select:focus, textarea:focus { border-color: #8B0000; outline: none; }
    textarea { height: 80px; resize: vertical; }
    .modal-btns { display: flex; gap: 10px; margin-top: 20px; }
    .btn-save { flex: 1; padding: 12px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-cancel { padding: 12px 20px; background: #f0f0f0; color: #444; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
    .login-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .login-card { background: white; border-radius: 14px; padding: 30px 24px; width: 100%; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .login-logo { text-align: center; font-size: 36px; font-weight: 900; color: #8B0000; margin-bottom: 8px; }
    .login-sub  { text-align: center; font-size: 13px; color: #888; margin-bottom: 24px; }
    .login-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 18px; text-align: center; letter-spacing: 8px; }
    .login-input:focus { border-color: #8B0000; outline: none; }
    .login-btn { width: 100%; padding: 13px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; margin-top: 14px; cursor: pointer; }
    .login-error { color: #c00; font-size: 13px; text-align: center; margin-top: 10px; display: none; }
    .empty { text-align: center; padding: 40px 20px; color: #888; font-size: 14px; }
    .count-badge { font-size: 12px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .refresh-btn { background: none; border: 1px solid rgba(255,255,255,0.4); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; margin-left: 8px; }
  </style>
</head>
<body>

<div id="loginWrap" class="login-wrap">
  <div class="login-card">
    <div class="login-logo">KORD</div>
    <div class="login-sub">Status Update</div>
    <input id="pwInput" class="login-input" type="password" placeholder="••••" maxlength="6">
    <button class="login-btn" onclick="login()">Enter</button>
    <div id="loginError" class="login-error">Wrong password</div>
  </div>
</div>

<div id="mainApp" style="display:none;">
  <div class="header">
    <h1>KORD Status <span id="dateLabel"></span> <button class="refresh-btn" onclick="refreshOrders()">↻</button></h1>
    <p id="orderCount">Loading...</p>
  </div>
  <div class="dashboard">
    <div class="dash-card">
      <div class="dash-num" id="dashOrders">—</div>
      <div class="dash-lbl">Today</div>
    </div>
    <div class="dash-card">
      <div class="dash-num" id="dashDelivery">—</div>
      <div class="dash-lbl">On Delivery</div>
    </div>
    <div class="dash-card">
      <div class="dash-num" id="dashDelivered">—</div>
      <div class="dash-lbl">Delivered</div>
    </div>
  </div>
  <div class="tab-bar">
    <div class="tab active" onclick="switchTab('ORDERS',this)">ORDERS <span class="count-badge" id="ordersCount">0</span></div>
    <div class="tab" onclick="switchTab('MODS',this)">MODS <span class="count-badge" id="modsCount">0</span></div>
  </div>
  <div class="courier-bar" id="courierBar"></div>
  <div class="search-wrap">
    <input class="search-input" id="searchInput" placeholder="Search customer, contact or location..." oninput="renderOrders()">
  </div>
  <div class="content" id="orderList"></div>
</div>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-title" id="modalTitle">Update Order</div>
    <div class="modal-sub" id="modalSub"></div>
    <div class="field-label">Status</div>
    <select id="selStatus">
      <option value="">— select —</option>
      <option>Delivered</option>
      <option>Rescheduled</option>
      <option>Reconfirm</option>
      <option>Cancelled</option>
      <option>Scheduled</option>
      <option>On Delivery</option>
      <option>Failed</option>
    </select>
    <div class="field-label">Courier</div>
    <select id="selCourier">
      <option value="">— select —</option>
      <option>Prince</option><option>Embeunice</option><option>Innocent</option>
      <option>Mathew</option><option>Takoradi</option><option>Tarkwa</option>
      <option>Christopher</option><option>Adu</option><option>Charles</option>
      <option>Ernest</option><option>Richard</option><option>Abdul</option>
      <option>AT</option><option>Gertrude</option><option>Amos</option>
      <option>Jesse</option><option>Michael</option><option>Cape Coast</option>
      <option>Foster</option><option>Paul</option><option>Vimax</option>
      <option>Eric</option><option>Padmore</option>
    </select>
    <div class="field-label">Customer Payment</div>
    <select id="selCustomerPay">
      <option value="">— select —</option>
      <option>Paid</option>
      <option>Unpaid</option>
      <option>No Revenue</option>
      <option>Pending Payment</option>
    </select>
    <div class="field-label">Riders Payment</div>
    <select id="selRiderPay">
      <option value="">— select —</option>
      <option>Received</option>
      <option>Unpaid</option>
      <option>No Revenue</option>
    </select>
    <div class="field-label" id="commentLabel">Comment</div>
    <textarea id="selComment" placeholder="Add a comment..."></textarea>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-save" id="saveBtn" onclick="saveUpdate()">Save</button>
    </div>
  </div>
</div>

<script>
  var BASE = window.location.href.split("?")[0];
  var pw = "", currentTab = "ORDERS", currentRow = null, activeCourier = "All";
  var allOrders = { ORDERS: [], MODS: [] };
  var COURIERS = ["Prince","Embeunice","Innocent","Mathew","Takoradi","Tarkwa","Christopher","Adu","Charles","Ernest","Richard","Abdul","AT","Gertrude","Amos","Jesse","Michael","Cape Coast","Foster","Paul","Vimax","Eric","Padmore"];

  function login() {
    pw = document.getElementById("pwInput").value.trim();
    fetch(BASE + "?action=getOrders&sheet=ORDERS&pw=" + pw)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) {
          document.getElementById("loginError").style.display = "block";
          return;
        }
        document.getElementById("loginWrap").style.display = "none";
        document.getElementById("mainApp").style.display   = "block";
        allOrders.ORDERS = data.orders || [];
        document.getElementById("ordersCount").textContent = allOrders.ORDERS.length;
        updateDashboard(data.dashboard);
        buildCourierBar();
        loadTab("MODS");
        renderOrders();
        setDateLabel();
      });
  }

  function loadTab(sheet) {
    fetch(BASE + "?action=getOrders&sheet=" + sheet + "&pw=" + pw)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allOrders[sheet] = data.orders || [];
        document.getElementById(sheet === "ORDERS" ? "ordersCount" : "modsCount").textContent = allOrders[sheet].length;
        if (sheet === currentTab) renderOrders();
      });
  }

  function buildCourierBar() {
    var bar  = document.getElementById("courierBar");
    var html = '<div class="courier-chip active" onclick="filterCourier(\'All\',this)">All</div>';
    COURIERS.forEach(function(c) {
      html += '<div class="courier-chip" onclick="filterCourier(\'' + c + '\',this)">' + c + '</div>';
    });
    bar.innerHTML = html;
  }

  function filterCourier(name, el) {
    activeCourier = name;
    document.querySelectorAll(".courier-chip").forEach(function(c) { c.classList.remove("active"); });
    el.classList.add("active");
    renderOrders();
  }

  function updateDashboard(d) {
    if (!d) return;
    document.getElementById("dashOrders").textContent    = d.todayOrders    || "—";
    document.getElementById("dashDelivery").textContent  = d.onDelivery     || "—";
    document.getElementById("dashDelivered").textContent = d.deliveredToday || "—";
  }

  function refreshOrders() {
    document.getElementById("orderCount").textContent = "Refreshing...";
    fetch(BASE + "?action=getOrders&sheet=ORDERS&pw=" + pw)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allOrders.ORDERS = data.orders || [];
        document.getElementById("ordersCount").textContent = allOrders.ORDERS.length;
        updateDashboard(data.dashboard);
        if (currentTab === "ORDERS") renderOrders();
      });
    loadTab("MODS");
  }

  function setDateLabel() {
    var t = new Date();
    document.getElementById("dateLabel").textContent =
      t.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function switchTab(tab, el) {
    currentTab = tab;
    activeCourier = "All";
    document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
    el.classList.add("active");
    document.querySelectorAll(".courier-chip").forEach(function(c) { c.classList.remove("active"); });
    document.querySelector(".courier-chip").classList.add("active");
    document.getElementById("searchInput").value = "";
    renderOrders();
  }

  function renderOrders() {
    var query  = document.getElementById("searchInput").value.toLowerCase().trim();
    var orders = allOrders[currentTab] || [];

    if (activeCourier !== "All") {
      orders = orders.filter(function(o) {
        if (activeCourier === "Unassigned") return !o.courier;
        return o.courier === activeCourier;
      });
    }

    if (query) {
      orders = orders.filter(function(o) {
        return o.customer.toLowerCase().indexOf(query) >= 0 ||
               o.contact.toLowerCase().indexOf(query) >= 0 ||
               o.location.toLowerCase().indexOf(query) >= 0;
      });
    }

    var list = document.getElementById("orderList");
    document.getElementById("orderCount").textContent = orders.length + " order(s) today";

    if (!orders.length) {
      list.innerHTML = '<div class="empty">No orders found</div>';
      return;
    }

    list.innerHTML = orders.map(function(o) {
      var sc = o.status.toLowerCase().indexOf("deliver") >= 0 ? "delivered"
             : o.status.toLowerCase() === "reconfirm"         ? "reconfirm"
             : o.status.toLowerCase() === "cancelled"          ? "cancelled"
             : o.status.toLowerCase() === "rescheduled"        ? "rescheduled"
             : o.status.toLowerCase() === "failed"             ? "failed" : "";
      var realIdx = allOrders[currentTab].indexOf(o);
      var courierLabel = o.courier
        ? '<span class="order-courier">🚗 ' + o.courier + '</span>'
        : '<span class="order-courier unassigned">⚠️ Unassigned</span>';
      return '<div class="order-card ' + (o._updated ? "updated" : "") + '">' +
        '<div class="order-name">' + o.customer + '</div>' +
        '<div class="order-meta">' +
          '📍 ' + o.location + '<br>' +
          '📞 ' + o.contact + '<br>' +
          '📦 ' + o.product + ' x' + o.qty + ' — ' + o.price + '<br>' +
          '🧑 ' + o.operator +
        '</div>' +
        courierLabel +
        (o.comment ? '<div class="order-comment">💬 ' + o.comment + '</div>' : '') +
        (o.status ? '<div class="order-status ' + sc + '">' + o.status + (o.customerPayment ? ' · ' + o.customerPayment : '') + '</div>' : '') +
        '<button class="update-btn" onclick="openModal(' + realIdx + ')">Update</button>' +
      '</div>';
    }).join("");
  }

  function openModal(idx) {
    var o = allOrders[currentTab][idx];
    currentRow = { row: o.row, idx: idx };
    document.getElementById("modalTitle").textContent   = o.customer;
    document.getElementById("modalSub").textContent     = o.location + " · " + o.contact;
    document.getElementById("selStatus").value          = o.status          || "";
    document.getElementById("selCourier").value         = o.courier         || "";
    document.getElementById("selCustomerPay").value     = o.customerPayment || "";
    document.getElementById("selRiderPay").value        = o.riderPayment    || "";
    document.getElementById("selComment").value         = o.comment         || "";
    document.getElementById("commentLabel").textContent = currentTab === "MODS" ? "Backoffice Comment" : "Delivery Team Comment";
    document.getElementById("modal").classList.add("open");
  }

  function closeModal() {
    document.getElementById("modal").classList.remove("open");
    currentRow = null;
  }

  function saveUpdate() {
    if (!currentRow) return;
    var btn             = document.getElementById("saveBtn");
    var status          = document.getElementById("selStatus").value;
    var courier         = document.getElementById("selCourier").value;
    var customerPayment = document.getElementById("selCustomerPay").value;
    var riderPayment    = document.getElementById("selRiderPay").value;
    var comment         = document.getElementById("selComment").value;

    btn.textContent = "Saving...";
    btn.disabled    = true;

    var params = "action=updateRow&sheet=" + currentTab + "&pw=" + pw +
      "&row=" + currentRow.row +
      "&status=" + encodeURIComponent(status) +
      "&courier=" + encodeURIComponent(courier) +
      "&customerPayment=" + encodeURIComponent(customerPayment) +
      "&riderPayment=" + encodeURIComponent(riderPayment) +
      "&comment=" + encodeURIComponent(comment);

    fetch(BASE + "?" + params)
      .then(function(r) { return r.json(); })
      .then(function() {
        var o = allOrders[currentTab][currentRow.idx];
        if (status)          o.status          = status;
        if (courier)         o.courier         = courier;
        if (customerPayment) o.customerPayment = customerPayment;
        if (riderPayment)    o.riderPayment    = riderPayment;
        if (comment)         o.comment         = comment;
        o._updated = true;
        btn.textContent = "Save";
        btn.disabled    = false;
        closeModal();
        renderOrders();
      })
      .catch(function() {
        btn.textContent = "Save";
        btn.disabled    = false;
      });
  }

  document.getElementById("pwInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") login();
  });
</script>
</body>
</html>`;
}
