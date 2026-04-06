import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Register auth HTTP routes (required for token validation)
auth.addHttpRoutes(http);

// Serve the onboarding HTML form
http.route({
  path: "/onboarding",
  method: "GET",
  handler: httpAction(async (_ctx, _req) => {
    return new Response(getOnboardingHTML(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }),
});

// Generate upload URL for photos
http.route({
  path: "/api/onboarding/upload",
  method: "POST",
  handler: httpAction(async (ctx, _req) => {
    const uploadUrl: string = await ctx.runMutation(internal.onboarding.generateUploadUrl, {});
    return new Response(JSON.stringify({ uploadUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Handle profile submission
http.route({
  path: "/api/onboarding/submit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const profileId = await ctx.runMutation(internal.onboarding.submitProfile, body);
      return new Response(JSON.stringify({ success: true, profileId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// CORS preflight for API routes
http.route({
  path: "/api/onboarding/upload",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, _req) => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/api/onboarding/submit",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, _req) => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

function getOnboardingHTML(): string {
  const SA_CITIES = JSON.stringify([
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley',
    'Pietermaritzburg', 'Rustenburg', 'Stellenbosch', 'Sandton', 'Soweto',
    'Centurion', 'Midrand', 'Umhlanga', 'Randburg', 'Roodepoort',
    'Benoni', 'Boksburg', 'Kempton Park', 'George', 'Knysna',
    'Mbombela', 'Witbank', 'Klerksdorp', 'Upington', 'Tzaneen',
  ]);
  const RACES = JSON.stringify(['Black', 'White', 'Coloured', 'Indian', 'Asian', 'Other']);
  const BODY_TYPES = JSON.stringify(['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size']);
  const CATEGORIES = JSON.stringify(['Model', 'Hostess', 'Bottle Girl', 'Promoter', 'Brand Ambassador']);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Diamond Angels - Talent Registration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a; color: #fff; min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
      padding: 32px 16px 24px; text-align: center;
      border-bottom: 1px solid rgba(212,175,55,0.2);
    }
    .header .diamond { font-size: 32px; margin-bottom: 8px; }
    .header h1 {
      font-size: 26px; font-weight: 700; color: #d4af37;
      letter-spacing: 4px; text-transform: uppercase;
    }
    .header p { color: #888; margin-top: 6px; font-size: 13px; font-weight: 300; }
    .container { max-width: 540px; margin: 0 auto; padding: 20px 16px 40px; }
    .progress { display: flex; gap: 6px; margin-bottom: 28px; }
    .progress-step {
      flex: 1; height: 3px; background: #222; border-radius: 2px;
      transition: background 0.4s ease;
    }
    .progress-step.active { background: #d4af37; }
    .step-label {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .step-label .step-num {
      font-size: 12px; color: #666; font-weight: 500;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .step { display: none; animation: fadeIn 0.3s ease; }
    .step.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .step-title { font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .step-subtitle { font-size: 13px; color: #666; margin-bottom: 24px; font-weight: 300; }
    .form-group { margin-bottom: 18px; }
    .form-group label {
      display: block; font-size: 13px; color: #aaa; margin-bottom: 6px; font-weight: 500;
    }
    .form-group .req { color: #d4af37; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 13px 14px; background: #141414;
      border: 1.5px solid #2a2a2a; border-radius: 10px;
      color: #fff; font-size: 15px; font-family: inherit;
      transition: border-color 0.2s;
    }
    .form-group input::placeholder, .form-group textarea::placeholder { color: #444; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: #d4af37; outline: none;
      box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
    }
    .form-group select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center;
    }
    .form-group select option { background: #1a1a1a; color: #fff; }
    .form-group textarea { resize: vertical; min-height: 90px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .section-divider {
      font-size: 13px; font-weight: 600; color: #d4af37;
      text-transform: uppercase; letter-spacing: 1px;
      margin: 28px 0 16px;
      border-bottom: 1px solid rgba(212,175,55,0.15);
    }
    .checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .checkbox-item {
      background: #141414; border: 1.5px solid #2a2a2a; border-radius: 10px;
      padding: 12px 14px; cursor: pointer; text-align: center;
      font-size: 13px; font-weight: 500; color: #999; transition: all 0.2s;
    }
    .checkbox-item:active { transform: scale(0.97); }
    .checkbox-item.selected {
      border-color: #d4af37; background: rgba(212,175,55,0.08); color: #d4af37;
    }
    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .photo-slot {
      aspect-ratio: 3/4; background: #141414; border: 2px dashed #2a2a2a;
      border-radius: 12px; display: flex; align-items: center;
      justify-content: center; cursor: pointer; position: relative;
      overflow: hidden; transition: border-color 0.2s;
    }
    .photo-slot:active { border-color: #d4af37; }
    .photo-slot img { width: 100%; height: 100%; object-fit: cover; }
    .photo-slot .remove-btn {
      position: absolute; top: 6px; right: 6px;
      background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.2);
      color: #fff; border-radius: 50%; width: 26px; height: 26px;
      cursor: pointer; font-size: 14px; display: flex;
      align-items: center; justify-content: center;
    }
    .photo-slot .main-badge {
      position: absolute; bottom: 6px; left: 6px;
      background: #d4af37; color: #000; padding: 2px 8px;
      border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
    }
    .photo-slot .placeholder {
      text-align: center; color: #555; font-size: 12px; font-weight: 500;
    }
    .photo-slot .placeholder .icon { font-size: 28px; display: block; margin-bottom: 6px; opacity: 0.5; }
    .btn {
      display: block; width: 100%; padding: 15px; border-radius: 12px;
      font-size: 15px; font-weight: 600; cursor: pointer; border: none;
      text-align: center; font-family: inherit; transition: all 0.2s;
    }
    .btn:active { transform: scale(0.98); }
    .btn-primary {
      background: linear-gradient(135deg, #d4af37, #c49b2c);
      color: #000; box-shadow: 0 4px 16px rgba(212,175,55,0.25);
    }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-secondary { background: #1a1a1a; color: #999; border: 1px solid #2a2a2a; }
    .btn-row { display: flex; gap: 10px; margin-top: 32px; }
    .btn-row .btn { flex: 1; }
    .success-screen { text-align: center; padding: 48px 16px; }
    .success-icon {
      width: 80px; height: 80px; border-radius: 50%;
      background: rgba(212,175,55,0.1); border: 2px solid #d4af37;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px; font-size: 36px;
    }
    .success-screen h2 { color: #fff; font-size: 22px; margin-bottom: 10px; }
    .success-screen p { color: #888; font-size: 14px; line-height: 1.6; font-weight: 300; }
    .app-links { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
    .app-link {
      display: flex; align-items: center; gap: 14px;
      background: #141414; border: 1.5px solid #2a2a2a; border-radius: 12px;
      padding: 16px; text-decoration: none; color: #fff; transition: all 0.2s;
    }
    .app-link:active { border-color: #d4af37; background: rgba(212,175,55,0.05); }
    .app-link .link-icon { font-size: 28px; flex-shrink: 0; }
    .app-link .link-text { flex: 1; }
    .app-link .link-title { font-size: 14px; font-weight: 600; color: #fff; }
    .app-link .link-desc { font-size: 12px; color: #888; margin-top: 2px; font-weight: 300; }
    .app-link .link-arrow { color: #d4af37; font-size: 18px; }
    .photo-hint {
      background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2);
      border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
      font-size: 13px; color: #d4af37; font-weight: 400; line-height: 1.5;
    }
    .photo-count {
      text-align: center; font-size: 13px; color: #888; margin-top: 8px; font-weight: 400;
    }
    .photo-count span { color: #d4af37; font-weight: 600; }
    .loading-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.85); z-index: 100;
      align-items: center; justify-content: center;
      flex-direction: column; gap: 20px;
    }
    .loading-overlay.active { display: flex; }
    .spinner {
      width: 44px; height: 44px; border: 3px solid #222;
      border-top-color: #d4af37; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-overlay p { color: #d4af37; font-size: 14px; font-weight: 500; }
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #ff4444; color: #fff; padding: 12px 24px;
      border-radius: 10px; font-size: 13px; font-weight: 500;
      z-index: 200; display: none; max-width: 90%;
      text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .toast.show { display: block; animation: slideUp 0.3s ease; }
    @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    @media (max-width: 380px) {
      .form-row { grid-template-columns: 1fr; }
      .photo-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="diamond">\u{1F48E}</div>
    <h1>Diamond Angels</h1>
    <p>Talent Registration Portal</p>
  </div>
  <div class="container">
    <div class="progress" id="progress">
      <div class="progress-step active"></div>
      <div class="progress-step"></div>
      <div class="progress-step"></div>
      <div class="progress-step"></div>
    </div>
    <div class="step active" id="step-1">
      <div class="step-label">
        <div><h2 class="step-title">Personal Details</h2><p class="step-subtitle">Tell us about yourself</p></div>
        <span class="step-num">Step 1 of 4</span>
      </div>
      <div class="form-row">
        <div class="form-group"><label>First Name <span class="req">*</span></label><input type="text" id="firstName" placeholder="First name" autocomplete="given-name"></div>
        <div class="form-group"><label>Last Name <span class="req">*</span></label><input type="text" id="lastName" placeholder="Last name" autocomplete="family-name"></div>
      </div>
      <div class="form-group"><label>Phone Number <span class="req">*</span></label><input type="tel" id="phone" placeholder="07X XXX XXXX" autocomplete="tel"></div>
      <div class="form-group"><label>Email</label><input type="email" id="email" placeholder="email@example.com" autocomplete="email"></div>
      <div class="form-group"><label>Alternative Phone</label><input type="tel" id="altPhone" placeholder="Alternative number"></div>
      <div class="form-row">
        <div class="form-group"><label>City <span class="req">*</span></label><select id="city"><option value="">Select city</option></select></div>
        <div class="form-group"><label>Area / Suburb</label><input type="text" id="area" placeholder="e.g. Sandton"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Race</label><select id="race"><option value="">Select</option></select></div>
        <div class="form-group"><label>Body Type</label><select id="bodyType"><option value="">Select</option></select></div>
      </div>
      <div class="form-group"><label>Height (cm)</label><input type="number" id="heightCm" placeholder="e.g. 170" min="140" max="210" inputmode="numeric"></div>
      <div class="btn-row"><button class="btn btn-primary" onclick="nextStep()">Continue</button></div>
    </div>
    <div class="step" id="step-2">
      <div class="step-label">
        <div><h2 class="step-title">Professional Details</h2><p class="step-subtitle">Your talent categories and socials</p></div>
        <span class="step-num">Step 2 of 4</span>
      </div>
      <div class="form-group"><label>Categories <span class="req">*</span></label><div class="checkbox-grid" id="categoriesGrid"></div></div>
      <div class="form-group"><label>Bio / About You</label><textarea id="bio" placeholder="Tell us about yourself, your experience, and what makes you stand out..."></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Workplace</label><input type="text" id="workplace" placeholder="Current employer"></div>
        <div class="form-group"><label>Job Title</label><input type="text" id="jobTitle" placeholder="Your role"></div>
      </div>
      <div class="section-divider">Social Media</div>
      <div class="form-group"><label>Instagram</label><input type="text" id="instagram" placeholder="@yourusername"></div>
      <div class="form-row">
        <div class="form-group"><label>TikTok</label><input type="text" id="tiktok" placeholder="@yourusername"></div>
        <div class="form-group"><label>Twitter / X</label><input type="text" id="twitter" placeholder="@yourusername"></div>
      </div>
      <div class="form-group"><label>Facebook</label><input type="text" id="facebook" placeholder="Name or profile URL"></div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="prevStep()">Back</button>
        <button class="btn btn-primary" onclick="nextStep()">Continue</button>
      </div>
    </div>
    <div class="step" id="step-3">
      <div class="step-label">
        <div><h2 class="step-title">Photos</h2><p class="step-subtitle">Upload up to 5 photos (3:4 portrait recommended)</p></div>
        <span class="step-num">Step 3 of 4</span>
      </div>
      <div class="photo-hint">\u{1F4F8} Please upload at least 1 clear photo of yourself. Full-body and headshot photos work best. These will be visible to potential clients.</div>
      <div class="photo-grid" id="photoGrid"></div>
      <div class="photo-count" id="photoCount">0 of 5 photos uploaded</div>
      <input type="file" id="photoInput" accept="image/*" style="display:none" multiple>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="prevStep()">Back</button>
        <button class="btn btn-primary" onclick="nextStep()">Continue</button>
      </div>
    </div>
    <div class="step" id="step-4">
      <div class="step-label">
        <div><h2 class="step-title">Additional Info</h2><p class="step-subtitle">Address and emergency contact</p></div>
        <span class="step-num">Step 4 of 4</span>
      </div>
      <div class="section-divider">Residential Address</div>
      <div class="form-group"><label>Street Address</label><input type="text" id="addressStreet" placeholder="Street address" autocomplete="street-address"></div>
      <div class="form-row">
        <div class="form-group"><label>City</label><input type="text" id="addressCity" placeholder="City"></div>
        <div class="form-group"><label>Province</label><input type="text" id="addressState" placeholder="Province"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Postal Code</label><input type="text" id="addressPostalCode" placeholder="Postal code"></div>
        <div class="form-group"><label>Country</label><input type="text" id="addressCountry" placeholder="South Africa" value="South Africa"></div>
      </div>
      <div class="section-divider">Next of Kin / Emergency Contact</div>
      <div class="form-group"><label>Full Name</label><input type="text" id="nokFullName" placeholder="Emergency contact full name"></div>
      <div class="form-row">
        <div class="form-group"><label>Relationship</label><input type="text" id="nokRelationship" placeholder="e.g. Parent, Sibling"></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="nokPhone" placeholder="Phone number"></div>
      </div>
      <div class="form-group"><label>Email</label><input type="email" id="nokEmail" placeholder="Email address"></div>
      <div class="form-group"><label>Address</label><input type="text" id="nokAddress" placeholder="Physical address"></div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="prevStep()">Back</button>
        <button class="btn btn-primary" onclick="submitForm()" id="submitBtn">Submit Registration</button>
      </div>
    </div>
    <div class="step" id="step-success">
      <div class="success-screen">
        <div class="success-icon">\u{2728}</div>
        <h2>Registration Complete!</h2>
        <p>Thank you for registering with Diamond Angels.<br>Your profile is now under review and our team will be in touch shortly.</p>
        <div class="app-links">
          <a href="https://app.diamondangels.co.za/" target="_blank" class="app-link">
            <span class="link-icon">\u{1F310}</span>
            <div class="link-text">
              <div class="link-title">Visit Diamond Angels</div>
              <div class="link-desc">Browse the website and explore opportunities</div>
            </div>
            <span class="link-arrow">\u{203A}</span>
          </a>
          <a href="https://diamondangels895.a0.dev/" target="_blank" class="app-link">
            <span class="link-icon">\u{1F4F1}</span>
            <div class="link-text">
              <div class="link-title">Open the Mobile App</div>
              <div class="link-desc">Sign in with the same email you registered with — you'll be taken straight to your talent profile</div>
            </div>
            <span class="link-arrow">\u{203A}</span>
          </a>
        </div>
        <button class="btn btn-primary" style="margin-top:24px" onclick="location.reload()">Register Another Talent</button>
      </div>
    </div>
  </div>
  <div class="loading-overlay" id="loading"><div class="spinner"></div><p>Submitting your registration...</p></div>
  <div class="toast" id="toast"></div>
  <script>
    var CITIES = ${SA_CITIES};
    var RACES = ${RACES};
    var BODY_TYPES_LIST = ${BODY_TYPES};
    var CATS = ${CATEGORIES};
    var currentStep = 1;
    var selectedCategories = [];
    var uploadedPhotos = [];
    var isUploading = false;

    function showToast(msg, dur) {
      var t = document.getElementById('toast');
      t.textContent = msg; t.classList.add('show');
      setTimeout(function() { t.classList.remove('show'); }, dur || 3000);
    }

    function init() {
      var cs = document.getElementById('city');
      CITIES.forEach(function(c) { var o = document.createElement('option'); o.value = c; o.textContent = c; cs.appendChild(o); });
      var rs = document.getElementById('race');
      RACES.forEach(function(r) { var o = document.createElement('option'); o.value = r; o.textContent = r; rs.appendChild(o); });
      var bs = document.getElementById('bodyType');
      BODY_TYPES_LIST.forEach(function(b) { var o = document.createElement('option'); o.value = b; o.textContent = b; bs.appendChild(o); });
      var cg = document.getElementById('categoriesGrid');
      CATS.forEach(function(c) {
        var d = document.createElement('div'); d.className = 'checkbox-item'; d.textContent = c;
        d.onclick = function() { toggleCat(c, d); }; cg.appendChild(d);
      });
      renderPhotos();
      try {
        var saved = JSON.parse(localStorage.getItem('da_onboarding') || '{}');
        if (saved.firstName) document.getElementById('firstName').value = saved.firstName;
        if (saved.lastName) document.getElementById('lastName').value = saved.lastName;
        if (saved.phone) document.getElementById('phone').value = saved.phone;
        if (saved.email) document.getElementById('email').value = saved.email;
        if (saved.city) document.getElementById('city').value = saved.city;
      } catch(e) {}
    }

    function saveProgress() {
      try { localStorage.setItem('da_onboarding', JSON.stringify({
        firstName: gv('firstName'), lastName: gv('lastName'), phone: gv('phone'), email: gv('email'), city: gv('city')
      })); } catch(e) {}
    }

    function toggleCat(cat, el) {
      var idx = selectedCategories.indexOf(cat);
      if (idx >= 0) { selectedCategories.splice(idx, 1); el.classList.remove('selected'); }
      else { selectedCategories.push(cat); el.classList.add('selected'); }
    }

    function renderPhotos() {
      var grid = document.getElementById('photoGrid'); grid.innerHTML = '';
      uploadedPhotos.forEach(function(photo, idx) {
        var slot = document.createElement('div'); slot.className = 'photo-slot'; slot.style.borderStyle = 'solid';
        var img = document.createElement('img'); img.src = photo.previewUrl; slot.appendChild(img);
        var rm = document.createElement('button'); rm.className = 'remove-btn'; rm.innerHTML = '&times;';
        rm.onclick = function(e) { e.stopPropagation(); removePhoto(idx); }; slot.appendChild(rm);
        if (idx === 0) { var b = document.createElement('div'); b.className = 'main-badge'; b.textContent = 'MAIN'; slot.appendChild(b); }
        grid.appendChild(slot);
      });
      if (uploadedPhotos.length < 5) {
        var add = document.createElement('div'); add.className = 'photo-slot';
        add.innerHTML = '<div class="placeholder"><span class="icon">\u{1F4F7}</span>Add Photo</div>';
        add.onclick = function() { document.getElementById('photoInput').click(); };
        grid.appendChild(add);
      }
      var countEl = document.getElementById('photoCount');
      if (countEl) countEl.innerHTML = '<span>' + uploadedPhotos.length + '</span> of 5 photos uploaded';
    }

    function removePhoto(idx) { uploadedPhotos.splice(idx, 1); renderPhotos(); }

    document.getElementById('photoInput').addEventListener('change', async function(e) {
      var files = Array.from(e.target.files || []);
      var remaining = 5 - uploadedPhotos.length;
      var toUpload = files.slice(0, remaining);
      if (toUpload.length === 0) return;
      isUploading = true;
      for (var i = 0; i < toUpload.length; i++) {
        var file = toUpload[i];
        if (file.size > 10 * 1024 * 1024) { showToast('Photo too large (max 10MB). Skipping.'); continue; }
        try {
          var previewUrl = URL.createObjectURL(file);
          uploadedPhotos.push({ storageId: null, previewUrl: previewUrl });
          renderPhotos();
          var res = await fetch('/api/onboarding/upload', { method: 'POST' });
          if (!res.ok) throw new Error('Failed to get upload URL');
          var data = await res.json();
          var uploadRes = await fetch(data.uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
          if (!uploadRes.ok) throw new Error('Upload failed');
          var uploadData = await uploadRes.json();
          uploadedPhotos[uploadedPhotos.length - 1].storageId = uploadData.storageId;
          renderPhotos();
        } catch (err) {
          uploadedPhotos = uploadedPhotos.filter(function(p) { return p.storageId !== null; });
          renderPhotos(); showToast('Failed to upload photo. Please try again.');
        }
      }
      isUploading = false; e.target.value = '';
    });

    function nextStep() { if (!validateStep(currentStep)) return; saveProgress(); currentStep++; updateUI(); window.scrollTo(0, 0); }
    function prevStep() { saveProgress(); currentStep--; updateUI(); window.scrollTo(0, 0); }

    function updateUI() {
      var steps = document.querySelectorAll('.step');
      for (var i = 0; i < steps.length; i++) steps[i].classList.remove('active');
      document.getElementById('step-' + currentStep).classList.add('active');
      var bars = document.querySelectorAll('.progress-step');
      for (var j = 0; j < bars.length; j++) bars[j].classList.toggle('active', j < currentStep);
    }

    function gv(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

    function validateStep(step) {
      if (step === 1) {
        if (!gv('firstName')) { showToast('Please enter your first name'); return false; }
        if (!gv('lastName')) { showToast('Please enter your last name'); return false; }
        if (!gv('phone')) { showToast('Please enter your phone number'); return false; }
        if (!gv('city')) { showToast('Please select your city'); return false; }
        return true;
      }
      if (step === 2) {
        if (selectedCategories.length === 0) { showToast('Please select at least one category'); return false; }
        return true;
      }
      if (step === 3) {
        if (uploadedPhotos.length === 0) { showToast('Please upload at least 1 photo'); return false; }
        var allUploaded = uploadedPhotos.every(function(p) { return p.storageId !== null; });
        if (!allUploaded) { showToast('Please wait for photos to finish uploading'); return false; }
        return true;
      }
      return true;
    }

    async function submitForm() {
      if (isUploading) { showToast('Please wait for photos to finish uploading'); return; }
      var btn = document.getElementById('submitBtn'); btn.disabled = true;
      var loader = document.getElementById('loading'); loader.classList.add('active');
      try {
        var heightVal = gv('heightCm');
        var data = {
          firstName: gv('firstName'), lastName: gv('lastName'), phone: gv('phone'),
          city: gv('city'), categories: selectedCategories,
          photos: uploadedPhotos.filter(function(p) { return p.storageId; }).map(function(p) { return p.storageId; }),
        };
        var optionals = {
          email: gv('email'), altPhone: gv('altPhone'), area: gv('area'),
          race: gv('race'), bodyType: gv('bodyType'),
          heightCm: heightVal ? parseInt(heightVal) : null,
          bio: gv('bio'), workplace: gv('workplace'), jobTitle: gv('jobTitle'),
          instagram: gv('instagram'), tiktok: gv('tiktok'), twitter: gv('twitter'), facebook: gv('facebook'),
          addressStreet: gv('addressStreet'), addressCity: gv('addressCity'),
          addressState: gv('addressState'), addressPostalCode: gv('addressPostalCode'), addressCountry: gv('addressCountry'),
          nokFullName: gv('nokFullName'), nokRelationship: gv('nokRelationship'),
          nokPhone: gv('nokPhone'), nokEmail: gv('nokEmail'), nokAddress: gv('nokAddress'),
        };
        for (var key in optionals) {
          if (optionals[key] !== null && optionals[key] !== '' && optionals[key] !== undefined) data[key] = optionals[key];
        }
        var res = await fetch('/api/onboarding/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) { var err = await res.json(); throw new Error(err.error || 'Submission failed'); }
        localStorage.removeItem('da_onboarding');
        loader.classList.remove('active');
        var allSteps = document.querySelectorAll('.step');
        for (var s = 0; s < allSteps.length; s++) { allSteps[s].classList.remove('active'); allSteps[s].style.display = 'none'; }
        document.getElementById('step-success').style.display = 'block';
        document.getElementById('step-success').classList.add('active');
        document.getElementById('progress').style.display = 'none';
      } catch (err) {
        loader.classList.remove('active'); btn.disabled = false;
        showToast(err.message || 'Something went wrong. Please try again.', 5000);
      }
    }
    init();
  </script>
</body>
</html>`;
}

export default http;