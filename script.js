/**
 * CYBER SQUAD MASTER CLIENT-SIDE LOGIC SYSTEM ENGINE
 */

// DOM COMPONENT TARGET NODES
const loginModal = document.getElementById('loginModal');
const heroLoginBtn = document.getElementById('hero-login-btn');
const navLoginBtn = document.getElementById('nav-login-btn');
const closeBtn = document.getElementById('closeBtn');
const loginForm = document.getElementById('terminalLoginForm');
const sysStatus = document.getElementById('sysStatus');
const statusDropdown = document.getElementById('statusDropdown');
const logoutBtn = document.getElementById('logoutBtn');

const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const authSubtitle = document.getElementById('authSubtitle');
const submitAuthBtn = document.getElementById('submitAuthBtn');

const interceptModal = document.getElementById('interceptModal');
const agreementCheckbox = document.getElementById('agreementCheckbox');
const acceptMissionBtn = document.getElementById('acceptMissionBtn');
const agreementForm = document.getElementById('agreementForm');

const parallaxLayers = document.querySelectorAll('.parallax-bg');
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-item');

// PROGRESS ELEMENT INTERFACE CONSOLE
const workoutLogForm = document.getElementById('workoutLogForm');
const leaderboardBody = document.getElementById('leaderboardBody');
const xpCurrentDisplay = document.getElementById('xpCurrentDisplay');
const xpNeededDisplay = document.getElementById('xpNeededDisplay');
const xpBarFill = document.getElementById('xpBarFill');
const levelDisplay = document.getElementById('levelDisplay');
const totalSetsDisplay = document.getElementById('totalSetsDisplay');
const sidebarRankBadge = document.getElementById('sidebarRankBadge');
const terminalDashboardContainer = document.querySelector('.terminal-dashboard-container');
const hubHeader = document.querySelector('.hub-header');

// RANK PROGRESS CELEBRATION MODAL TARGET NODES
const promotionModal = document.getElementById('promotionModal');
const popupRankBadge = document.getElementById('popupRankBadge');
const closePromoBtn = document.getElementById('closePromoBtn');

let currentAuthMode = 'login'; 

// ==========================================
// EXPONENTIAL TIER LEVEL MATH FORMULAS
// ==========================================
function getXpNeededForLevel(level) {
  if (level === 1) return 200;
  if (level === 2) return 500;
  if (level === 3) return 1000;
  if (level === 4) return 1800;
  return Math.floor(2500 * Math.pow(1.4, level - 5));
}

const OPERATIONAL_RANKS = [
  { minLevel: 1, title: "RECRUIT" },
  { minLevel: 3, title: "CYBER_GRIDDER" },
  { minLevel: 5, title: "ALPHA_ENFORCER" },
  { minLevel: 8, title: "TITAN_FRAME" },
  { minLevel: 12, title: "CYBER_DEITY" }
];

// Read specific user identity state structures dynamically 
let currentOperator = localStorage.getItem('cyberOperatorId') || 'YOU (ANON_NODE)';
let trackingState = { xp: 0, level: 1, totalSets: 0 };

// Dynamically keys stats per unique operator profile to prevent account overwrites
function loadOperatorStats() {
  const statsKey = `cyberStats_${currentOperator.toLowerCase()}`;
  const savedStats = localStorage.getItem(statsKey);
  
  if (savedStats && currentOperator !== 'YOU (ANON_NODE)') {
    trackingState = JSON.parse(savedStats);
  } else {
    trackingState = { xp: 0, level: 1, totalSets: 0 };
  }
}

// Global UI Layout Modifier Evaluator Loop
function evaluateUiState() {
  const sessionToken = localStorage.getItem('cyberOperatorId');
  if (sessionToken) {
    // Verified User is Active
    terminalDashboardContainer.classList.remove('logged-out-state');
    hubHeader.textContent = "OPERATOR_LOGS // METRIC_SUBMISSION_INTERFACE";
    sysStatus.textContent = `SYS_STATUS: ONLINE // OPERATOR: ${sessionToken.toUpperCase()}`;
    sysStatus.classList.remove('status-offline');
    sysStatus.classList.add('status-online');
  } else {
    // Anonymous Viewing State Only
    terminalDashboardContainer.classList.add('logged-out-state');
    hubHeader.textContent = "🔒 TERMINAL CONSOLE SECURED // SYSTEM INITIALIZATION REQUIRED TO TRANSMIT LOGS";
    sysStatus.textContent = `SYS_STATUS: OFFLINE`;
    sysStatus.classList.remove('status-online');
    sysStatus.classList.add('status-offline');
  }
}

// Initial Core Boot Setup Run
loadOperatorStats();
evaluateUiState();
updateProgressionUI();
fetchNetworkLeaderboard();

function computeRank(levelValue) {
  let matchedRank = OPERATIONAL_RANKS[0].title;
  for (let i = 0; i < OPERATIONAL_RANKS.length; i++) {
    if (levelValue >= OPERATIONAL_RANKS[i].minLevel) {
      matchedRank = OPERATIONAL_RANKS[i].title;
    }
  }
  return "RANK: " + matchedRank;
}

function saveOperatorStats() {
  if (currentOperator === 'YOU (ANON_NODE)') return;
  const statsKey = `cyberStats_${currentOperator.toLowerCase()}`;
  localStorage.setItem(statsKey, JSON.stringify(trackingState));
}

function addExperience(amount, loggedSets) {
  if (currentOperator === 'YOU (ANON_NODE)') return;
  
  trackingState.xp += amount;
  trackingState.totalSets += loggedSets;
  
  let currentRankBeforeLog = computeRank(trackingState.level);

  while (trackingState.xp >= getXpNeededForLevel(trackingState.level)) {
    trackingState.xp -= getXpNeededForLevel(trackingState.level);
    trackingState.level += 1;
  }

  let currentRankAfterLog = computeRank(trackingState.level);
  
  if (currentRankBeforeLog !== currentRankAfterLog) {
    triggerPromotionPopup(currentRankAfterLog);
  }

  saveOperatorStats();
  updateProgressionUI();
  fetchNetworkLeaderboard(); 
}

function updateProgressionUI() {
  const currentNeeded = getXpNeededForLevel(trackingState.level);
  
  xpCurrentDisplay.textContent = trackingState.xp;
  xpNeededDisplay.textContent = currentNeeded;
  levelDisplay.textContent = trackingState.level;
  totalSetsDisplay.textContent = trackingState.totalSets;
  
  const percentage = (trackingState.xp / currentNeeded) * 100;
  xpBarFill.style.width = `${percentage}%`;
  
  sidebarRankBadge.textContent = computeRank(trackingState.level);
}

function triggerPromotionPopup(newRankTitle) {
  promotionModal.classList.add('active');
  popupRankBadge.textContent = newRankTitle;
}

if (closePromoBtn) { closePromoBtn.addEventListener('click', () => promotionModal.classList.remove('active')); }

// ==========================================
// LEADERBOARD RENDER SYSTEM ENGINE
// ==========================================
function fetchNetworkLeaderboard() {
  const currentPayload = {
    username: currentOperator,
    level: trackingState.level,
    totalSets: trackingState.totalSets,
    rank: computeRank(trackingState.level)
  };

  fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentPayload)
  })
  .then(res => res.json())
  .then(data => {
    renderLeaderboard(data.leaderboard, currentOperator);
  })
  .catch(() => {
    const mockData = [
      { username: currentPayload.username, rank: currentPayload.rank, level: currentPayload.level, totalSets: currentPayload.totalSets }
    ];
    renderLeaderboard(mockData, currentOperator);
  });
}

function renderLeaderboard(list, activeUser) {
  leaderboardBody.innerHTML = '';
  
  if (!list || list.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4" class="leaderboard-empty-state">
          <div class="glitch-text-loader">> NO OTHER OPERATORS ACTIVE ON THIS NODE...</div>
        </td>
      </tr>`;
    return;
  }
  
  list.forEach((player, index) => {
    const row = document.createElement('tr');
    
    if (player.username.toLowerCase() === activeUser.toLowerCase() && activeUser !== 'YOU (ANON_NODE)') {
      row.classList.add('active-focused-row');
    }
    
    let rankBadgeClass = 'tier-standard';
    if (index === 0) rankBadgeClass = 'tier-1st';
    if (index === 1) rankBadgeClass = 'tier-2nd';
    
    row.innerHTML = `
      <td class="col-align-left">
        <span class="leaderboard-rank-badge ${rankBadgeClass}">0${index + 1}</span>
      </td>
      <td class="col-align-left operator-id-cell">
        ${player.username.toUpperCase()}
      </td>
      <td class="col-align-center">
        <span class="level-pill">LVL ${player.level}</span>
      </td>
      <td class="col-align-right volume-count-text">
        ${player.totalSets} PST
      </td>
    `;
    leaderboardBody.appendChild(row);
  });
}

if (workoutLogForm) {
  workoutLogForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (currentOperator === 'YOU (ANON_NODE)') return;
    
    const sets = parseInt(document.getElementById('workoutSets').value);
    const reps = parseInt(document.getElementById('workoutReps').value);
    const cardio = parseInt(document.getElementById('cardioTime').value);
    
    const calculatedXP = (sets * reps * 2) + (cardio * 5);
    addExperience(calculatedXP, sets);
    
    workoutLogForm.reset();
  });
}

// ==========================================
// USER VALIDATION & INTERFACE ROUTINES
// ==========================================
const missionAccepted = localStorage.getItem('cyberMissionAccepted');
if (missionAccepted === 'true' && interceptModal) {
  interceptModal.classList.remove('active');
}

function setAuthMode(mode) {
  currentAuthMode = mode;
  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    authSubtitle.textContent = "AUTHENTICATION REQUIRED // ENTER REGISTERED CREDENTIALS";
    submitAuthBtn.textContent = "INITIALIZE_BYPASS";
  } else {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    authSubtitle.textContent = "NEW OPERATOR DETECTED // REGISTER STRUCTURAL ACCESS CODES";
    submitAuthBtn.textContent = "CREATE_IDENTITY_KEY";
  }
}

tabLogin.addEventListener('click', () => setAuthMode('login'));
tabSignup.addEventListener('click', () => setAuthMode('signup'));

function openTerminal() { setAuthMode('login'); loginModal.classList.add('active'); }
function closeTerminal() { loginModal.classList.remove('active'); }

heroLoginBtn.addEventListener('click', openTerminal);
navLoginBtn.addEventListener('click', function(e) { e.preventDefault(); openTerminal(); });
closeBtn.addEventListener('click', closeTerminal);
window.addEventListener('click', function(e) { if (e.target === loginModal) closeTerminal(); });

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const operatorId = document.getElementById('username').value;
  const accessPhrase = document.getElementById('password').value;
  const endpointUrl = currentAuthMode === 'login' ? '/api/login' : '/api/register';

  fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: operatorId, password: accessPhrase })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (currentAuthMode === 'signup') {
        alert("IDENTITY SEEDED SUCCESSFULLY. PROCEED TO SYSTEM LOG IN.");
        setAuthMode('login');
        document.getElementById('password').value = ""; 
      } else {
        closeTerminal();
        localStorage.setItem('cyberOperatorId', operatorId);
        
        currentOperator = operatorId;
        loadOperatorStats();
        evaluateUiState();
        updateProgressionUI();
        fetchNetworkLeaderboard();
      }
    } else {
      alert(`ACCESS DENIED: ${data.message}`);
    }
  });
});

sysStatus.addEventListener('click', function(e) { 
  e.stopPropagation(); 
  if (localStorage.getItem('cyberOperatorId')) {
    statusDropdown.classList.toggle('show'); 
  }
});

logoutBtn.addEventListener('click', function(e) {
  e.preventDefault();
  localStorage.removeItem('cyberOperatorId'); 
  
  currentOperator = 'YOU (ANON_NODE)';
  loadOperatorStats();
  evaluateUiState();
  updateProgressionUI();
  fetchNetworkLeaderboard();
  
  statusDropdown.classList.remove('show');
});

// Structural UI Close Bindings
window.addEventListener('click', () => statusDropdown.classList.remove('show'));

if (agreementCheckbox) {
  agreementCheckbox.addEventListener('change', function() {
    if (this.checked) { acceptMissionBtn.disabled = false; acceptMissionBtn.classList.add('enabled'); }
    else { acceptMissionBtn.disabled = true; acceptMissionBtn.classList.remove('enabled'); }
  });
}

if (agreementForm) {
  agreementForm.addEventListener('submit', function(e) {
    e.preventDefault();
    localStorage.setItem('cyberMissionAccepted', 'true');
    interceptModal.classList.remove('active');
  });
}

window.addEventListener('scroll', function() {
  let scrolledPixels = window.scrollY;
  parallaxLayers.forEach(layer => { layer.style.transform = `translateY(${scrolledPixels * 0.4}px)`; });

  let activeSectionId = "";
  sections.forEach(section => {
    if (scrolledPixels >= (section.offsetTop - section.clientHeight / 3)) activeSectionId = section.getAttribute('id');
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${activeSectionId}`) item.classList.add('active');
  });
});