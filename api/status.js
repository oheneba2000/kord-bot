const SHEET_ID     = "1W7AVhwpkDVuHn1It5-QJmgnZRksXp002tEPIktOep_w";
const CLIENT_EMAIL = "kord-sheets@kord-bot.iam.gserviceaccount.com";
const PRIVATE_KEY  = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCt0fNeeUiPCbW3\nnT2bszJD4kbTaczt6Er6eD8x4LYzdXKCY1bddJe5agJT2NwCJzMrjffjD5r7tCe4\nOO1xNNpCPyMdHXl6idY7qTGynOxw/ZJmhnG7W4OEby5ytbfx3Vm05Nf2cm71z1E9\nZ94F5+ttZjuIT8T0WGQ08tyPpJLbc82iCfjP9Y2MLpHA146SPNQRcGIBzPxqXwzW\n5aeAWyomAJV25XByIMkjWd8L3JKymDDIiu8sxbssNLGUamcOWjzcuAdUPmmzMsGI\nmxekGRNyMBECfs4U4YBJS0NVQlCb/bi9AzYfsiE42rW+LPpZoQ7o3MrAJE1eRReX\nl5Xxhj5xAgMBAAECggEAFSxA194wL3RAVVhq+79NPSWf+PqnQseL8oyZLgswRn5k\n72sIVrtwC97U37/HtN9vhTuq2Va6SzS7rd4JVkPY3j7wmQhRFtMZbHUEn7wrtOu+\nXIy959OS5pvgbYqjGGwdFELX56Yyy/Bv9enkCpYggFf2onkNBbKKqkR3B2xFk0OJ\ngcQngAgTJEes2KZ8T4dchppx8LAIVhQWkGSc1o29/eWv0YbuwjytGNUUm7KTcv4k\nGx5pSjc5nywGAh9QVmDAdf6iFm59WeSngd8FBDt8b23h0U47Fs/x7mHxCwBoT37T\n4DSY/bzuGNm6LH67o2ib9wqhXQsq4RsOBuFUFNRf3QKBgQDTDkBZprHQ25hdQmW2\nsJeOmX+1VaoONhJj4iF3HrMpXAT2pc4q8ItyFXJcDFH1/d88ZoKT1h4FrJlxTi2p\nGYvPlBvE6WwaXFsd412dMsFID3sYcgABOYp8ig6DYrsUZ2+H1wq9TjvyFQoN8LVN\nEdYCD0CCWI3of/wMljPz/b107wKBgQDS1ctw6bgbV/TNUfzT78QegcEA+a2Xphh/\nH7Mvem0j+rRn+S8e/KWetdbrGTjdoC4Qd1+Z4iKRN3bpfkg1Kdgd2+V356TwwgvE\n6lSBvwcnXBc4Rx8xQsIx0YUtlxZo0LDYQsrtysMOiJxiNSWUAZaK685cO7ODrVHC\n4uGIjJtCnwKBgH3YAIy0NVBor5fj8EwXTbcMVbalBooEucBu5C9n0cI2iQscYCsA\nVNVIbnDuM6yunH4iTXei8zHE8ZU63UT344J5OHmYCQpKyVWv7XC/A7pY6LfxuYkB\na07I7tBufUg0SK9BjLjFvj6hRuZ7AU+b8/Q0be2KqcrZDUvf/8hbIq1nAoGAbaZL\nG/oxiecAphfRydeUw9jvq7YulgQIEXVHF5YwVNn6IWjzHMaAzD39/F8tt/Wqf13W\nFo4JNEUITv8iRqPwhfbrLKUInz4MKOlF8gSLj+jRGq/ChTgXDxnMjZ1aRkDi+FYk\ne+9L6q8ZxemmFYeN58ojlMxn3D+zmgutB/s4dDkCgYAep1qsHX8txnUKuWcCScIj\nA4n4uK3/wXzjOGno5vJfv4x+0iVZSNJAqIaLdX77z2zRiCvc9RgyRtHf0V5o3oK+\n9W9m/gDthMzynWRqc1bwoky5Tj4HClWXk/SQ4zpX7ZkWjfCL2mcqGj5Ku5L4qClt\nWixFmPigd+4HuxF4K4lhqg==\n-----END PRIVATE KEY-----\n";
const APP_PASSWORD = "0249";

export default async function handler(req, res) {
  const url    = new URL(req.url, `https://${req.headers.host}`);
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
      const dateStr = url.searchParams.get("date") || "";
      const orders  = await getTodayOrders(token, sheet, dateStr);
      return res.status(200).json(orders);
    }

    if (action === "debug") {
  const token2 = await getAccessToken();
  const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ORDERS!A1:B5`;
  const testRes = await fetch(testUrl, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  const testData = await testRes.json();
  return res.status(200).json({ testData, sheet });
}

    if (action === "updateRow") {
      const row             = parseInt(url.searchParams.get("row"));
      const status          = url.searchParams.get("status")          || "";
      const courier         = url.searchParams.get("courier")         || "";
      const customerPayment = url.searchParams.get("customerPayment") || "";
      const riderPayment    = url.searchParams.get("riderPayment")    || "";
      await updateSheetRow(token, sheet, row, status, courier, customerPayment, riderPayment);
      return res.status(200).json({ ok: true });
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
    .replace(/\n/g, "")
    .trim();

  const binaryKey = Uint8Array.from(atob(keyData), function(c) { return c.charCodeAt(0); });

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder   = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(input)
  );

  const sigBytes = new Uint8Array(signature);
  let sigStr = "";
  sigBytes.forEach(function(b) { sigStr += String.fromCharCode(b); });
  const sig = toBase64Url(sigStr, true);

  const jwt = input + "." + sig;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt
  });

  const data = await res.json();
  return data.access_token;
}

function toBase64Url(str, isBinary) {
  var b64;
  if (isBinary) {
    b64 = btoa(str);
  } else {
    b64 = btoa(unescape(encodeURIComponent(str)));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getSheetRows(token, sheetName, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName + "!" + range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.values || [];
}

async function updateSheetRow(token, sheetName, rowNum, status, courier, customerPayment, riderPayment) {
  const range  = `${sheetName}!E${rowNum}:H${rowNum}`;
  const values = [[status, courier, customerPayment, riderPayment]];
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method:  "PUT",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ range, majorDimension: "ROWS", values })
    }
  );
}

async function getTodayOrders(token, sheetName, dateStr) {
  const headerRow = sheetName === "MODS" ? 4 : 7;
  const rows      = await getSheetRows(token, sheetName, `A${headerRow}:N1000`);

  const todayStr = dateStr || (() => {
    const now  = new Date();
    const mm   = String(now.getMonth() + 1);
    const dd   = String(now.getDate());
    const yyyy = String(now.getFullYear());
    return mm + "/" + dd + "/" + yyyy;
  })();

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
      operator:        row[12] || ""
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
    .header { background: #8B0000; color: white; padding: 16px 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .header h1 { font-size: 18px; font-weight: 700; }
    .header p { font-size: 12px; opacity: 0.8; margin-top: 2px; }
    .tab-bar { display: flex; background: #6b0000; }
    .tab { flex: 1; padding: 10px; text-align: center; color: white; font-size: 13px; font-weight: 600; cursor: pointer; opacity: 0.6; border-bottom: 3px solid transparent; }
    .tab.active { opacity: 1; border-bottom-color: white; }
    .content { padding: 12px; max-width: 640px; margin: 0 auto; }
    .order-card { background: white; border-radius: 10px; padding: 14px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .order-card.updated { border-left: 4px solid #2a7a2a; }
    .order-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .order-meta { font-size: 12px; color: #666; margin-bottom: 8px; line-height: 1.6; }
    .order-status { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: #eee; color: #444; margin-bottom: 10px; }
    .order-status.delivered { background: #d4edda; color: #155724; }
    .order-status.reconfirm { background: #d6d6f5; color: #333; }
    .order-status.cancelled { background: #f8d7da; color: #721c24; }
    .order-status.rescheduled { background: #fff3cd; color: #856404; }
    .update-btn { width: 100%; padding: 10px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; overflow-y: auto; }
    .modal-overlay.open { display: flex; align-items: flex-end; }
    .modal { background: white; width: 100%; max-width: 640px; margin: 0 auto; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; }
    .modal-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #8B0000; }
    .field-label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; margin-top: 14px; }
    select { width: 100%; padding: 10px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 14px; background: white; }
    select:focus { border-color: #8B0000; outline: none; }
    .modal-btns { display: flex; gap: 10px; margin-top: 20px; }
    .btn-save { flex: 1; padding: 12px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-cancel { padding: 12px 20px; background: #f0f0f0; color: #444; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
    .login-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .login-card { background: white; border-radius: 14px; padding: 30px 24px; width: 100%; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .login-logo { text-align: center; font-size: 36px; font-weight: 900; color: #8B0000; margin-bottom: 8px; }
    .login-sub { text-align: center; font-size: 13px; color: #888; margin-bottom: 24px; }
    .login-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 18px; text-align: center; letter-spacing: 8px; }
    .login-input:focus { border-color: #8B0000; outline: none; }
    .login-btn { width: 100%; padding: 13px; background: #8B0000; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; margin-top: 14px; cursor: pointer; }
    .login-error { color: #c00; font-size: 13px; text-align: center; margin-top: 10px; display: none; }
    .empty { text-align: center; padding: 40px 20px; color: #888; font-size: 14px; }
    .count-badge { font-size: 12px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .refresh-btn { background: none; border: 1px solid rgba(255,255,255,0.4); color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-top: 4px; }
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
    <h1>KORD Status <span id="dateLabel"></span></h1>
    <p id="orderCount">Loading...</p>
    <button class="refresh-btn" onclick="refreshOrders()">↻ Refresh</button>
  </div>
  <div class="tab-bar">
    <div class="tab active" onclick="switchTab('ORDERS',this)">ORDERS <span class="count-badge" id="ordersCount">0</span></div>
    <div class="tab" onclick="switchTab('MODS',this)">MODS <span class="count-badge" id="modsCount">0</span></div>
  </div>
  <div class="content" id="orderList"></div>
</div>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-title" id="modalTitle">Update Order</div>
    <div class="field-label">Status</div>
    <select id="selStatus">
      <option value="">— select —</option>
      <option>Delivered</option>
      <option>Rescheduled</option>
      <option>Reconfirm</option>
      <option>Cancelled</option>
      <option>Scheduled</option>
      <option>On Delivery</option>
      <option>Delivery Problem</option>
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
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-save" id="saveBtn" onclick="saveUpdate()">Save</button>
    </div>
  </div>
</div>

<script>
  const BASE = window.location.href.split('?')[0];
  let pw = "", currentTab = "ORDERS", currentRow = null;
  let allOrders = { ORDERS: [], MODS: [] };

  function login() {
    pw = document.getElementById("pwInput").value.trim();
    var now  = new Date();
    var date = (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear();
    fetch(BASE + "?action=getOrders&sheet=ORDERS&pw=" + pw + "&date=" + date)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) {
          document.getElementById("loginError").style.display = "block";
          return;
        }
        document.getElementById("loginWrap").style.display = "none";
        document.getElementById("mainApp").style.display   = "block";
        allOrders.ORDERS = data;
        document.getElementById("ordersCount").textContent = data.length;
        loadTab("MODS");
        renderOrders();
        setDateLabel();
      });
  }

  function loadTab(sheet) {
    var now  = new Date();
    var date = (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear();
    fetch(BASE + "?action=getOrders&sheet=" + sheet + "&pw=" + pw + "&date=" + date)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allOrders[sheet] = data;
        document.getElementById(sheet === "ORDERS" ? "ordersCount" : "modsCount").textContent = data.length;
        if (sheet === currentTab) renderOrders();
      });
  }

  function refreshOrders() {
    document.getElementById("orderCount").textContent = "Refreshing...";
    loadTab("ORDERS");
    loadTab("MODS");
  }

  function setDateLabel() {
    var t = new Date();
    document.getElementById("dateLabel").textContent =
      t.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function switchTab(tab, el) {
    currentTab = tab;
    document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
    el.classList.add("active");
    renderOrders();
  }

  function renderOrders() {
    var orders = allOrders[currentTab] || [];
    var list   = document.getElementById("orderList");
    document.getElementById("orderCount").textContent = orders.length + " order(s) today";
    if (!orders.length) {
      list.innerHTML = '<div class="empty">No orders for today</div>';
      return;
    }
    list.innerHTML = orders.map(function(o, idx) {
      var sc = o.status.toLowerCase().indexOf("deliver") >= 0 ? "delivered"
             : o.status.toLowerCase() === "reconfirm"         ? "reconfirm"
             : o.status.toLowerCase() === "cancelled"          ? "cancelled"
             : o.status.toLowerCase() === "rescheduled"        ? "rescheduled" : "";
      return '<div class="order-card ' + (o._updated ? "updated" : "") + '">' +
        '<div class="order-name">' + o.customer + '</div>' +
        '<div class="order-meta">' +
          '📍 ' + o.location + '<br>' +
          '📞 ' + o.contact + '<br>' +
          '📦 ' + o.product + ' x' + o.qty + ' — ' + o.price + '<br>' +
          '🧑‍💼 ' + o.operator + (o.courier ? ' | 🚗 ' + o.courier : '') +
        '</div>' +
        (o.status ? '<div class="order-status ' + sc + '">' + o.status + (o.customerPayment ? ' · ' + o.customerPayment : '') + '</div>' : '') +
        '<button class="update-btn" onclick="openModal(' + idx + ')">Update</button>' +
      '</div>';
    }).join("");
  }

  function openModal(idx) {
    var o = allOrders[currentTab][idx];
    currentRow = { row: o.row, idx: idx };
    document.getElementById("modalTitle").textContent   = o.customer;
    document.getElementById("selStatus").value          = o.status          || "";
    document.getElementById("selCourier").value         = o.courier         || "";
    document.getElementById("selCustomerPay").value     = o.customerPayment || "";
    document.getElementById("selRiderPay").value        = o.riderPayment    || "";
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

    btn.textContent = "Saving...";
    btn.disabled    = true;

    var params = "action=updateRow&sheet=" + currentTab + "&pw=" + pw +
      "&row=" + currentRow.row +
      "&status=" + encodeURIComponent(status) +
      "&courier=" + encodeURIComponent(courier) +
      "&customerPayment=" + encodeURIComponent(customerPayment) +
      "&riderPayment=" + encodeURIComponent(riderPayment);

    fetch(BASE + "?" + params)
      .then(function(r) { return r.json(); })
      .then(function() {
        var o = allOrders[currentTab][currentRow.idx];
        if (status)          o.status          = status;
        if (courier)         o.courier         = courier;
        if (customerPayment) o.customerPayment = customerPayment;
        if (riderPayment)    o.riderPayment    = riderPayment;
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
