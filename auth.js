/*
  auth.js — simple client-side gate for Jay's Method Hub
  ---------------------------------------------------------
  Drop <script src="auth.js"></script> as the FIRST thing in <head>
  on every page you want gated.

  NOTE: this is a casual deterrent, not real security. Anyone who
  opens dev tools or fetches the raw files from GitHub can still see
  everything. Good for "don't let randoms stumble in," not good for
  truly private/sensitive material.
*/

(function () {
  // ---- CONFIG ----------------------------------------------------
  var SITE_PASSWORD = "changeme"; // <-- set your shared password here
  var SESSION_KEY = "jmh_unlocked";
  var SESSION_HOURS = 12; // how long an unlock lasts before re-asking
  // ------------------------------------------------------------------

  function isUnlocked() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      return data.until && Date.now() < data.until;
    } catch (e) {
      return false;
    }
  }

  function setUnlocked() {
    var until = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ until: until }));
  }

  if (isUnlocked()) return; // already in, do nothing

  // Hide page content immediately while gate is up
  document.documentElement.style.visibility = "hidden";

  function buildGate() {
    var overlay = document.createElement("div");
    overlay.id = "jmhGate";
    overlay.innerHTML =
      '<div class="jmh-gate-bg"></div>' +
      '<div class="jmh-gate-card" role="dialog" aria-modal="true" aria-label="Site locked">' +
      '  <div class="jmh-gate-eyebrow">EasyP55</div>' +
      '  <h1 class="jmh-gate-title">Locked.</h1>' +
      '  <p class="jmh-gate-lede">Enter the password to continue.</p>' +
      '  <form id="jmhGateForm" autocomplete="off">' +
      '    <input id="jmhGateInput" type="password" placeholder="Password" aria-label="Password" autofocus />' +
      '    <button type="submit">Unlock</button>' +
      '  </form>' +
      '  <p class="jmh-gate-error" id="jmhGateError">Wrong password. Try again.</p>' +
      '  <p class="jmh-gate-foot">Jay&rsquo;s Method Hub <span class="mark">55</span></p>' +
      "</div>";
    document.documentElement.appendChild(overlay);

    var style = document.createElement("style");
    style.textContent = GATE_CSS;
    document.documentElement.appendChild(style);

    document.documentElement.style.visibility = "visible";

    var form = overlay.querySelector("#jmhGateForm");
    var input = overlay.querySelector("#jmhGateInput");
    var error = overlay.querySelector("#jmhGateError");
    var card = overlay.querySelector(".jmh-gate-card");

    input.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value === SITE_PASSWORD) {
        setUnlocked();
        card.classList.add("jmh-gate-success");
        overlay.classList.add("jmh-gate-leaving");
        setTimeout(function () {
          overlay.remove();
        }, 550);
      } else {
        error.classList.add("show");
        card.classList.remove("jmh-gate-shake");
        // restart shake animation
        void card.offsetWidth;
        card.classList.add("jmh-gate-shake");
        input.value = "";
        input.focus();
      }
    });

    input.addEventListener("input", function () {
      error.classList.remove("show");
    });
  }

  var GATE_CSS =
    "#jmhGate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;}" +
    "#jmhGate .jmh-gate-bg{position:absolute;inset:0;background:#0c0d10;background-image:radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent 40%),radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04), transparent 45%);}" +
    "#jmhGate .jmh-gate-card{position:relative;width:min(380px,88vw);padding:40px 32px 32px;border-radius:18px;background:#16181d;border:1px solid rgba(255,255,255,0.08);box-shadow:0 30px 60px -20px rgba(0,0,0,0.6);text-align:left;animation:jmhRise .5s cubic-bezier(.16,1,.3,1);}" +
    "@keyframes jmhRise{from{opacity:0;transform:translateY(18px) scale(.98);}to{opacity:1;transform:translateY(0) scale(1);}}" +
    "#jmhGate .jmh-gate-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8f98;margin:0 0 10px;}" +
    "#jmhGate .jmh-gate-title{font-family:'Fraunces',serif;font-weight:600;font-size:32px;color:#f3f3f1;margin:0 0 6px;}" +
    "#jmhGate .jmh-gate-lede{font-size:14px;color:#9a9fa8;margin:0 0 24px;}" +
    "#jmhGate form{display:flex;gap:8px;}" +
    "#jmhGate input{flex:1;min-width:0;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:#0f1014;color:#f3f3f1;font-size:14px;font-family:'JetBrains Mono',monospace;outline:none;transition:border-color .2s;}" +
    "#jmhGate input:focus{border-color:#6c7bff;}" +
    "#jmhGate button{padding:12px 18px;border-radius:10px;border:none;background:#f3f3f1;color:#0c0d10;font-weight:600;font-size:14px;cursor:pointer;transition:transform .15s,opacity .15s;font-family:'Inter',sans-serif;}" +
    "#jmhGate button:hover{opacity:.88;}" +
    "#jmhGate button:active{transform:scale(.96);}" +
    "#jmhGate .jmh-gate-error{height:0;overflow:hidden;opacity:0;color:#ff6b6b;font-size:13px;margin:0;transition:opacity .2s;}" +
    "#jmhGate .jmh-gate-error.show{height:auto;opacity:1;margin-top:12px;}" +
    "#jmhGate .jmh-gate-foot{margin:28px 0 0;font-size:11px;color:#5a5f68;font-family:'JetBrains Mono',monospace;letter-spacing:.04em;}" +
    "#jmhGate .jmh-gate-foot .mark{color:#6c7bff;margin-left:4px;}" +
    "#jmhGate .jmh-gate-shake{animation:jmhShake .4s;}" +
    "@keyframes jmhShake{10%,90%{transform:translateX(-1px);}20%,80%{transform:translateX(2px);}30%,50%,70%{transform:translateX(-4px);}40%,60%{transform:translateX(4px);}}" +
    "#jmhGate.jmh-gate-leaving{animation:jmhFadeOut .5s forwards;}" +
    "@keyframes jmhFadeOut{to{opacity:0;visibility:hidden;}}" +
    "#jmhGate .jmh-gate-success input,#jmhGate .jmh-gate-success button{opacity:.6;pointer-events:none;}";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildGate);
  } else {
    buildGate();
  }

  // ===================================================================
  // DEV TOOLS GUARD
  // -------------------------------------------------------------------
  // Heuristic only — catches DOCKED dev tools via the outerWidth/innerWidth
  // delta. Does NOT catch undocked windows, View Source, or someone who
  // disables JS first. Debounced so normal resizing/zooming doesn't
  // false-trigger. On detection: full-screen red warning over EVERYTHING
  // (including the password gate), then a 3s auto-reload.
  // ===================================================================
  (function devToolsGuard() {
    var THRESHOLD = 160; // px delta that suggests a docked panel is open
    var DEBOUNCE_MS = 700; // ignore brief/transient deltas (real resizing, mobile chrome, etc.)
    var RELOAD_DELAY_MS = 3000;
    var checkTimer = null;
    var triggered = false;

    var WARN_CSS =
      "#jmhDevWarn{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#0a0000;font-family:'Inter',system-ui,sans-serif;animation:jmhWarnIn .25s ease-out;}" +
      "@keyframes jmhWarnIn{from{opacity:0;}to{opacity:1;}}" +
      "#jmhDevWarn .jmh-warn-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%, rgba(255,40,40,0.25), transparent 60%),repeating-linear-gradient(135deg, rgba(255,0,0,0.04) 0px, rgba(255,0,0,0.04) 2px, transparent 2px, transparent 14px);}" +
      "#jmhDevWarn .jmh-warn-card{position:relative;text-align:center;padding:0 24px;animation:jmhWarnPulse 1.4s ease-in-out infinite;}" +
      "@keyframes jmhWarnPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.015);}}" +
      "#jmhDevWarn .jmh-warn-icon{font-size:48px;line-height:1;margin-bottom:18px;filter:drop-shadow(0 0 18px rgba(255,40,40,0.7));}" +
      "#jmhDevWarn .jmh-warn-title{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:clamp(22px,4vw,34px);letter-spacing:.08em;text-transform:uppercase;color:#ff3b3b;text-shadow:0 0 24px rgba(255,40,40,0.6);margin:0 0 10px;}" +
      "#jmhDevWarn .jmh-warn-sub{font-family:'Inter',sans-serif;font-size:14px;color:#ff9b9b;margin:0 0 4px;}" +
      "#jmhDevWarn .jmh-warn-meta{font-family:'JetBrains Mono',monospace;font-size:11px;color:#7a3030;letter-spacing:.05em;margin-top:18px;}" +
      "#jmhDevWarn .jmh-warn-bar{width:min(280px,70vw);height:3px;background:rgba(255,59,59,0.2);border-radius:2px;margin:22px auto 0;overflow:hidden;}" +
      "#jmhDevWarn .jmh-warn-bar-fill{height:100%;background:#ff3b3b;width:100%;transform-origin:left;animation:jmhWarnDrain 3s linear forwards;}" +
      "@keyframes jmhWarnDrain{from{transform:scaleX(1);}to{transform:scaleX(0);}}";

    function showWarningAndReload() {
      if (triggered) return;
      triggered = true;

      var style = document.createElement("style");
      style.id = "jmhDevWarnStyle";
      style.textContent = WARN_CSS;
      document.documentElement.appendChild(style);

      var warn = document.createElement("div");
      warn.id = "jmhDevWarn";
      warn.innerHTML =
        '<div class="jmh-warn-bg"></div>' +
        '<div class="jmh-warn-card">' +
        '  <div class="jmh-warn-icon">&#9888;</div>' +
        '  <h1 class="jmh-warn-title">Dev Tools Detected</h1>' +
        '  <p class="jmh-warn-sub">Close dev tools to continue.</p>' +
        '  <p class="jmh-warn-sub">Reloading automatically&hellip;</p>' +
        '  <div class="jmh-warn-bar"><div class="jmh-warn-bar-fill"></div></div>' +
        '  <p class="jmh-warn-meta">JMH-SEC // AUTO-RELOAD IN 3s</p>' +
        "</div>";
      document.documentElement.appendChild(warn);

      setTimeout(function () {
        window.location.reload();
      }, RELOAD_DELAY_MS);
    }

    function looksOpen() {
      var wDelta = window.outerWidth - window.innerWidth;
      var hDelta = window.outerHeight - window.innerHeight;
      return wDelta > THRESHOLD || hDelta > THRESHOLD;
    }

    function check() {
      if (triggered) return;
      if (looksOpen()) {
        clearTimeout(checkTimer);
        checkTimer = setTimeout(function () {
          if (looksOpen()) showWarningAndReload();
        }, DEBOUNCE_MS);
      } else {
        clearTimeout(checkTimer);
      }
    }

    window.addEventListener("resize", check);
    setInterval(check, 500);
  })();
})();
