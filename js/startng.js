// Official start.ng integration layer
// Follows all start.ng communication standards: connect iframe postMessage & HTTP API session fallback

const START_NG = 'https://start.ng';
const API = 'https://api.start.ng';
const GAME_NAME = (location.hostname.includes('.start.ng')) 
  ? location.hostname.split('.')[0] 
  : 'naija-penalty';

let connectFramePromise = null;

function getConnectFrame() {
  if (!connectFramePromise) {
    connectFramePromise = new Promise((resolve, reject) => {
      // If we are running locally or in sandbox, connect frame won't be on *.start.ng origin,
      // so we handle timeouts gracefully
      const el = document.createElement('iframe');
      el.src = `${START_NG}/connect`;
      el.hidden = true;
      el.onload = () => resolve(el);
      el.onerror = (err) => resolve(null); // Resolve to null rather than hard reject
      document.body.append(el);
      // Fallback timer if iframe fails to load or is blocked
      setTimeout(() => resolve(el), 3000);
    });
  }
  return connectFramePromise;
}

export async function askStartNg(message, replyType, timeoutMs = 4000) {
  try {
    const el = await getConnectFrame();
    if (!el || !el.contentWindow) return null;

    return new Promise((resolve) => {
      const requestId = Math.random().toString(36).slice(2);
      const timer = setTimeout(() => done(null), timeoutMs);

      const done = (reply) => {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        resolve(reply);
      };

      function onMessage(e) {
        if (e.origin !== START_NG || e.source !== el.contentWindow) return;
        if (e.data?.type === replyType && e.data.requestId === requestId) {
          done(e.data);
        }
      }

      window.addEventListener('message', onMessage);
      try {
        el.contentWindow.postMessage({ ...message, requestId }, START_NG);
      } catch (err) {
        done(null);
      }
    });
  } catch (e) {
    return null;
  }
}

// Session handling for HTTP API
export function initGameSession() {
  try {
    const params = new URLSearchParams(location.hash.slice(1));
    const token = params.get('startng_session');
    if (token) {
      sessionStorage.setItem('startng_session', token);
      history.replaceState(null, '', location.pathname + location.search);
    }
  } catch (e) {
    console.warn('Session init error:', e);
  }
  return getGameSession();
}

export function getGameSession() {
  try {
    return sessionStorage.getItem('startng_session');
  } catch (e) {
    return null;
  }
}

export function redirectToSignIn() {
  const returnTo = location.origin + location.pathname;
  location.href = `https://start.ng/?return_to=${encodeURIComponent(returnTo)}`;
}

// Default fallback character if running locally without start.ng login
export const DEFAULT_CHARACTER = {
  name: 'Naija Star',
  account: 'guest',
  style: {
    body: 'male',
    skinColor: '#6d4327',
    hairColor: '#17120f',
    hair: 'dreads',
    hat: 'none',
    accessory: 'none',
    primaryColor: '#008751',
    secondaryColor: '#ffffff'
  },
  face: null
};

// Fetch current player (User or Guest)
export async function getPlayer() {
  // 1. Try connect frame
  const reply = await askStartNg({ type: 'startng:whoami' }, 'startng:user');
  if (reply) {
    if (reply.user) {
      return { isGuest: false, ...reply.user };
    }
    if (reply.guest) {
      return { isGuest: true, ...reply.guest };
    }
  }

  // 2. Try HTTP session if available
  const session = getGameSession();
  if (session) {
    try {
      const res = await fetch(`${API}/games/${GAME_NAME}/player`, {
        headers: { Authorization: `Bearer ${session}` }
      });
      if (res.ok) {
        const data = await res.json();
        return { isGuest: false, ...data };
      }
    } catch (e) {
      // offline / local fallback
    }
  }

  // 3. Fallback to default local character
  return { isGuest: true, ...DEFAULT_CHARACTER };
}

// Submit score
export async function saveScore(stats) {
  // Try connect iframe first
  const savedViaFrame = await askStartNg({ type: 'startng:score', stats }, 'startng:scoreSaved');
  if (savedViaFrame && savedViaFrame.ok) {
    return savedViaFrame.result;
  }

  // Fallback to HTTP API
  const session = getGameSession();
  if (session) {
    try {
      const res = await fetch(`${API}/games/${GAME_NAME}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session}`
        },
        body: JSON.stringify({ stats })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('HTTP score submission failed:', e);
    }
  }

  return null;
}

// Fetch leaderboard
export async function getLeaderboard(limit = 10) {
  // Try connect frame first
  const frameBoard = await askStartNg({ type: 'startng:leaderboard', limit }, 'startng:leaderboardData');
  if (frameBoard && frameBoard.ok && Array.isArray(frameBoard.entries)) {
    return frameBoard.entries;
  }

  // Try HTTP API
  try {
    const res = await fetch(`${API}/games/${GAME_NAME}/leaderboard?limit=${limit}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Offline fallback mock data
  }

  // Mock sample leaderboard for local testing
  return [
    { rank: 1, name: 'Okocha10', stats: { wins: 14, goals: 62, saves: 38 } },
    { rank: 2, name: 'KanuHeart', stats: { wins: 11, goals: 51, saves: 31 } },
    { rank: 3, name: 'SuperStriker', stats: { wins: 9, goals: 42, saves: 24 } },
    { rank: 4, name: 'EnyimbaBoss', stats: { wins: 8, goals: 39, saves: 22 } },
    { rank: 5, name: 'LagosDribbler', stats: { wins: 6, goals: 31, saves: 19 } }
  ];
}
