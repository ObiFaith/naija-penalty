// Naija Penalty Shootout: Main Game Loop, Physics, Stadium Renderer & Controls
import { ALL_CLUBS, NIGERIAN_CLUBS, getRandomOpponentClub } from './clubs.js';
import { sounds, commentator } from './sound.js';
import { getPlayer, saveScore, getLeaderboard, redirectToSignIn } from './startng.js';
import { AnimatedCharacter, createRandomNaijaCharacter } from './character.js';

// Pidgin Commentary Banners
const PIDGIN_GOAL = [
  'GOAL NA GOAL! 🔥',
  'OMO SEE NET TEARING! 🚀',
  'WHICH KIND WICKED SHOT BE THIS?! 💥',
  'E CHOKE! NO KEEPER FIT CATCH AM! ⚡',
  'AS E DEY SWEET US, E DEY PAIN DEM! 😂',
  'TOP CORNER POSTAGE STAMP! 🎯'
];

const PIDGIN_SAVE = [
  'WHAT A SAVE! SUPERMAN GLOVES! 🧤',
  'BRICK WALL! NO ENTRY TODAY! 🧱',
  'YOU THINK SAY YOU FIT SCORE MY GUY?! 😏',
  'CLEAN SHEET THINGS! OYA DANCE! 🕺',
  'SEE REFLEXES LIKE CAT! 🐱'
];

const PIDGIN_MISS = [
  'CHAI! DEM SEND THE BALL GO MILE 2! ✈️',
  'WHICH KIND SHOT BE THAT?! WAN KILL BIRD?! 🦅',
  'NAIJA AIRSPACE DON CLEAR THAT BALL! 😂',
  'CROSSBAR ALMOST BREAK! WAHALA! 💥'
];

class PenaltyGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Teams
    this.playerClub = ALL_CLUBS[0]; // Default Chelsea or user selected
    this.opponentClub = getRandomOpponentClub(this.playerClub.id); // Strictly Nigerian club!

    // Player Identity
    this.playerIdentity = null;
    this.strikerChar = null;
    this.keeperChar = null;

    // Game state
    // 'SELECT_TEAM' | 'PLAYING' | 'BALL_IN_FLIGHT' | 'RESULT_PAUSE' | 'GAME_OVER'
    this.state = 'PLAYING';
    this.turn = 'player'; // 'player' (player shoots) | 'opponent' (player keeps)
    this.round = 1;
    this.isSuddenDeath = false;

    // Shootout records (up to 5 rounds + sudden death)
    this.playerKicks = [];   // array of bool: true (goal), false (miss)
    this.opponentKicks = [];
    this.playerScore = 0;
    this.opponentScore = 0;

    // Career stats for this session to submit to start.ng
    this.totalWins = parseInt(localStorage.getItem('naija_wins') || '0', 10);
    this.totalGoals = parseInt(localStorage.getItem('naija_goals') || '0', 10);
    this.totalSaves = parseInt(localStorage.getItem('naija_saves') || '0', 10);

    // Ball 3D state
    // x: [-1, 1] relative to goal center, y: [0, 1] (0 is turf, 1 is crossbar height), z: [0, 1] (0=spot, 1=net)
    this.ball = {
      x: 0,
      y: 0.08,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: 18,
      rotation: 0,
      rotSpeed: 0,
      trail: [],
      inFlight: false,
      result: null // 'goal' | 'save' | 'post' | 'miss'
    };

    // Goal Frame 3D bounds at z = 1
    this.goalWidth = 320;
    this.goalHeight = 160;
    this.netBulge = 0;

    // Drag / Input
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };

    // Particles (confetti, grass turf, net sparks)
    this.particles = [];

    // Crowd animation
    this.crowdTime = 0;

    // Commentary banner
    this.banner = {
      text: '',
      color: '#ffffff',
      time: 0,
      active: false
    };

    // Viewport
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Input listeners
    this.initInputs();
  }

  async init() {
    // 1. Set up initial characters immediately so the game renders on frame 1
    this.setupMatchCharacters();

    // 2. Populate club selection list
    this.populateClubSelector();

    // 3. Initial whistle and banner
    this.showBanner('NAIJA PENALTY SHOOTOUT! OYA!', '#22c55e');

    // 4. Start loop immediately
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));

    // 5. Fetch player from start.ng asynchronously without blocking rendering
    try {
      this.playerIdentity = await getPlayer();
      this.updateProfileCard();
    } catch (e) {
      console.warn('start.ng player identity fetch skipped/offline:', e);
    }
  }

  resize() {
    const container = document.getElementById('canvas-container');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    // Dynamic goal scaling for phone & tablet screens (preventing out-of-screen posts)
    this.goalWidth = Math.min(320, Math.max(220, this.width * 0.72));
    this.goalHeight = this.goalWidth * 0.50;
  }

  setupMatchCharacters() {
    // 1. Determine kit colors with strict clash-prevention
    const strikerClub = (this.turn === 'player') ? this.playerClub : this.opponentClub;
    const keeperClub = (this.turn === 'player') ? this.opponentClub : this.playerClub;

    // Goalkeepers in real football ALWAYS wear a contrasting fluo kit
    // Determine a keeper color that clashes with NEITHER striker nor outfield kit:
    let keeperJerseyColor = '#facc15'; // Neon Gold/Yellow
    if (strikerClub.colorCategory === 'yellow' || strikerClub.colorCategory === 'green') {
      keeperJerseyColor = '#ec4899'; // Fluo Magenta
    } else if (strikerClub.colorCategory === 'red') {
      keeperJerseyColor = '#06b6d4'; // Electric Cyan
    }

    const humanIsStriker = (this.turn === 'player');

    // Human Style from start.ng
    const humanStyle = {
      ...(this.playerIdentity?.style || {}),
      primaryColor: humanIsStriker ? this.playerClub.primaryColor : keeperJerseyColor,
      secondaryColor: humanIsStriker ? this.playerClub.secondaryColor : '#0f172a'
    };

    // Opponent Style
    const opponentRival = createRandomNaijaCharacter(this.opponentClub);
    const opponentStyle = {
      ...opponentRival.style,
      primaryColor: humanIsStriker ? keeperJerseyColor : this.opponentClub.primaryColor,
      secondaryColor: humanIsStriker ? '#0f172a' : this.opponentClub.secondaryColor
    };

    if (humanIsStriker) {
      this.strikerChar = new AnimatedCharacter(humanStyle, true, this.playerClub);
      this.keeperChar = new AnimatedCharacter(opponentStyle, false, this.opponentClub);
    } else {
      this.strikerChar = new AnimatedCharacter(opponentStyle, true, this.opponentClub);
      this.keeperChar = new AnimatedCharacter(humanStyle, false, this.playerClub);
    }

    this.strikerChar.setState('idle');
    this.keeperChar.setState('ready');

    this.resetBall();
    this.updateScoreboardUI();
    this.updateTurnIndicatorHUD();
  }

  updateTurnIndicatorHUD() {
    const hintEl = document.getElementById('controls-hint');
    if (!hintEl) return;
    if (this.turn === 'player') {
      hintEl.textContent = '⚽ Swipe or Tap Goal to Shoot';
      hintEl.style.borderColor = 'rgba(34, 197, 94, 0.4)';
    } else {
      hintEl.textContent = '🧤 Tap Net to Dive & Save';
      hintEl.style.borderColor = 'rgba(56, 189, 248, 0.4)';
    }
  }

  resetBall() {
    this.ball.x = 0;
    this.ball.y = 0.08;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.rotation = 0;
    this.ball.rotSpeed = 0;
    this.ball.trail = [];
    this.ball.inFlight = false;
    this.ball.result = null;
    this.netBulge = 0;
  }

  updateProfileCard() {
    const card = document.getElementById('player-card');
    const faceEl = document.getElementById('player-face');
    const nameEl = document.getElementById('player-name');
    const accountEl = document.getElementById('player-account');
    const signinBtn = document.getElementById('player-sign-in');

    if (!card) return;

    if (this.playerIdentity) {
      if (this.playerIdentity.face) {
        faceEl.src = this.playerIdentity.face;
      } else {
        // Fallback start.ng SVG face avatar
        faceEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23008751"/><circle cx="20" cy="16" r="8" fill="%2387532d"/><circle cx="17" cy="15" r="1.5" fill="%23fff"/><circle cx="23" cy="15" r="1.5" fill="%23fff"/></svg>';
      }
      nameEl.textContent = this.playerIdentity.name || 'Naija Star';
      if (accountEl) accountEl.textContent = this.playerIdentity.account ? `@${this.playerIdentity.account}` : 'Guest Player';
      if (signinBtn) signinBtn.hidden = !this.playerIdentity.isGuest;
      card.hidden = false;
    }
  }

  populateClubSelector() {
    const listEl = document.getElementById('club-grid');
    if (!listEl) return;
    listEl.innerHTML = '';

    ALL_CLUBS.forEach((club) => {
      const card = document.createElement('div');
      card.className = `club-card ${club.id === this.playerClub.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="badge-wrap">${club.badgeSvg}</div>
        <div class="club-info">
          <h4>${club.name}</h4>
          <span class="club-tag ${club.league.toLowerCase()}">${club.league === 'NPFL' ? '🇳🇬 NPFL' : '⭐ Europe'}</span>
        </div>
      `;
      card.onclick = () => {
        this.selectPlayerClub(club);
      };
      listEl.appendChild(card);
    });
  }

  selectPlayerClub(club) {
    this.playerClub = club;
    // Rule: Opponent is ALWAYS a Nigerian club!
    this.opponentClub = getRandomOpponentClub(club.id);
    this.populateClubSelector();
    this.hideModal('team-modal');
    this.restartMatch();
  }

  restartMatch() {
    this.playerKicks = [];
    this.opponentKicks = [];
    this.playerScore = 0;
    this.opponentScore = 0;
    this.round = 1;
    this.isSuddenDeath = false;
    this.turn = 'player';
    this.state = 'PLAYING';

    this.setupMatchCharacters();
    sounds.playWhistle(true);
    sounds.playVuvuzela(1.2);
    this.showBanner(`${this.playerClub.name} vs ${this.opponentClub.name}!`, '#38bdf8');
  }

  // --- Input & Controls ---
  initInputs() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = (e.touches && e.touches.length > 0)
        ? e.touches[0]
        : (e.changedTouches && e.changedTouches.length > 0)
          ? e.changedTouches[0]
          : e;

      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    };

    const onStart = (e) => {
      if (this.state !== 'PLAYING' || this.ball.inFlight) return;
      if (e.cancelable) e.preventDefault();
      sounds.init(); // unlock audio on first touch
      this.isDragging = true;
      const pos = getPos(e);
      this.dragStart = pos;
      this.dragCurrent = pos;
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      if (e.cancelable) e.preventDefault();
      this.dragCurrent = getPos(e);
    };

    const onEnd = (e) => {
      if (!this.isDragging) return;
      if (e.cancelable) e.preventDefault();
      this.isDragging = false;
      this.handleShootOrDive();
    };

    this.canvas.addEventListener('mousedown', onStart);
    this.canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    this.canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });

    // Audio Mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.onclick = () => {
        const isMuted = sounds.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      };
    }

    // Change Team button
    const changeTeamBtn = document.getElementById('change-team-btn');
    if (changeTeamBtn) {
      changeTeamBtn.onclick = () => {
        this.showModal('team-modal');
      };
    }

    // Sign in button
    const signinBtn = document.getElementById('player-sign-in');
    if (signinBtn) {
      signinBtn.onclick = () => redirectToSignIn();
    }

    // Modal Close
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.hideModal('team-modal');
    }

    // Rematch button
    const rematchBtn = document.getElementById('rematch-btn');
    if (rematchBtn) {
      rematchBtn.onclick = () => {
        this.hideModal('gameover-modal');
        this.restartMatch();
      };
    }
  }

  showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
  }

  hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  }

  handleShootOrDive() {
    const dx = this.dragCurrent.x - this.dragStart.x;
    const dy = this.dragCurrent.y - this.dragStart.y;
    const dist = Math.hypot(dx, dy);

    // Determine target on the goal plane (-1 to 1 X, 0 to 1 Y)
    let targetX = 0;
    let targetY = 0.5;

    const goalCenterScreenX = this.width * 0.5;
    const goalCenterScreenY = this.height * 0.44;
    const halfGoalW = this.goalWidth * 0.5;

    if (dist > 15) {
      // Drag gesture
      targetX = Math.max(-1.15, Math.min(1.15, -dx / 120));
      targetY = Math.max(0.1, Math.min(1.1, -dy / 100));
    } else {
      // Direct tap towards goal spot
      targetX = Math.max(-1.15, Math.min(1.15, (this.dragStart.x - goalCenterScreenX) / halfGoalW));
      targetY = Math.max(0.1, Math.min(1.1, (this.height * 0.54 - this.dragStart.y) / this.goalHeight));
    }

    if (this.turn === 'player') {
      // 1. Player is shooting!
      this.executeKickingTurn(targetX, targetY);
    } else {
      // 2. Player is Goalkeeper diving!
      this.executeGoalkeepingTurn(targetX, targetY);
    }
  }

  // --- Human Kicks, AI Keeper Dives ---
  executeKickingTurn(targetX, targetY) {
    this.state = 'BALL_IN_FLIGHT';

    // AI Keeper decides dive spot (has reaction logic)
    // 60% chance to guess right quadrant, adjusted by randomness
    const keeperGuessesCorrectly = Math.random() < 0.60;
    let keeperTargetX = keeperGuessesCorrectly 
      ? targetX + (Math.random() * 0.4 - 0.2) 
      : (Math.random() * 1.6 - 0.8);
    let keeperTargetY = keeperGuessesCorrectly 
      ? targetY + (Math.random() * 0.3 - 0.15) 
      : (Math.random() * 0.8 + 0.1);

    // Start Striker Run-up
    this.strikerChar.setState('runup');

    // Goalkeeper anticipates and dives simultaneously!
    const goalCenterScreenX = this.width * 0.5;
    const keeperScreenX = goalCenterScreenX + keeperTargetX * (this.goalWidth * 0.45);
    const keeperScreenY = this.height * 0.46 - keeperTargetY * 30;

    setTimeout(() => {
      this.keeperChar.setState('dive', { x: keeperScreenX, y: keeperScreenY });
    }, 120);

    // Strike ball after run-up
    setTimeout(() => {
      this.strikerChar.setState('kick');
      sounds.playKick();

      // Launch ball physics towards target
      this.launchBall(targetX, targetY, keeperTargetX, keeperTargetY);
    }, 280);
  }

  // --- Opponent AI Kicks, Human Goalkeeper Dives ---
  executeGoalkeepingTurn(playerDiveX, playerDiveY) {
    this.state = 'BALL_IN_FLIGHT';

    // AI Striker picks a corner / target
    const aiTargetX = (Math.random() * 1.8 - 0.9);
    const aiTargetY = (Math.random() * 0.85 + 0.15);

    // AI Striker runs up
    this.strikerChar.setState('runup');

    // Player Goalkeeper dives to where human swiped/tapped!
    const goalCenterScreenX = this.width * 0.5;
    const keeperScreenX = goalCenterScreenX + playerDiveX * (this.goalWidth * 0.45);
    const keeperScreenY = this.height * 0.46 - playerDiveY * 30;

    this.keeperChar.setState('dive', { x: keeperScreenX, y: keeperScreenY });

    // Opponent strikes ball
    setTimeout(() => {
      this.strikerChar.setState('kick');
      sounds.playKick();

      this.launchBall(aiTargetX, aiTargetY, playerDiveX, playerDiveY);
    }, 280);
  }

  launchBall(targetX, targetY, keeperX, keeperY) {
    this.ball.inFlight = true;
    this.ball.targetX = targetX;
    this.ball.targetY = targetY;
    this.ball.keeperX = keeperX;
    this.ball.keeperY = keeperY;

    // Flight takes approx 0.52 seconds (32 frames at 60fps)
    const flightFrames = 32;
    this.ball.vx = (targetX - this.ball.x) / flightFrames;
    this.ball.vy = (targetY - this.ball.y) / flightFrames;
    this.ball.vz = 1.0 / flightFrames;
    this.ball.rotSpeed = 0.25;
  }

  // --- Resolve Goal, Save, Post, Miss ---
  resolveBallOutcome() {
    this.ball.inFlight = false;
    const { targetX, targetY, keeperX, keeperY } = this.ball;

    // Goal frame limits: X: [-0.95, 0.95], Y: [0.05, 0.95]
    const isInsidePosts = Math.abs(targetX) <= 0.95;
    const isUnderCrossbar = targetY >= 0.05 && targetY <= 0.95;

    const isHitPost = (Math.abs(targetX) > 0.95 && Math.abs(targetX) <= 1.05 && targetY <= 1.0) ||
                      (Math.abs(targetY - 0.95) <= 0.08 && Math.abs(targetX) <= 1.0);

    // Distance between keeper and ball
    const distToKeeper = Math.hypot(targetX - keeperX, targetY - keeperY);
    const isSaved = distToKeeper < 0.38;

    if (isHitPost && !isSaved) {
      // Woodwork hit
      this.ball.result = 'post';
      sounds.playPost();
      this.createTurfSparks(this.width * 0.5 + targetX * (this.goalWidth * 0.5), this.height * 0.44 - targetY * this.goalHeight, '#ffffff');
      this.showPidginBanner('miss');
      this.recordKickOutcome(false);
    } else if (isInsidePosts && isUnderCrossbar) {
      if (isSaved) {
        // Saved by Goalkeeper!
        this.ball.result = 'save';
        sounds.playSave();
        sounds.playCrowdGasp();
        this.createTurfSparks(this.width * 0.5 + keeperX * (this.goalWidth * 0.5), this.height * 0.44 - keeperY * this.goalHeight, '#f97316');
        this.keeperChar.setState('celebrate');
        this.strikerChar.setState('despair');
        this.showPidginBanner('save');

        if (this.turn === 'opponent') {
          // Human saved it!
          this.totalSaves++;
          localStorage.setItem('naija_saves', this.totalSaves.toString());
        }
        this.recordKickOutcome(false);
      } else {
        // GOAL!
        this.ball.result = 'goal';
        this.netBulge = 1.0;
        sounds.playNet();
        sounds.playGoalCheer();
        this.createGoalConfetti();
        this.strikerChar.setState('celebrate');
        this.keeperChar.setState('conceded');
        this.showPidginBanner('goal');

        if (this.turn === 'player') {
          // Human scored!
          this.totalGoals++;
          localStorage.setItem('naija_goals', this.totalGoals.toString());
        }
        this.recordKickOutcome(true);
      }
    } else {
      // Missed wide or high!
      this.ball.result = 'miss';
      sounds.playCrowdGasp();
      this.strikerChar.setState('despair');
      this.showPidginBanner('miss');
      this.recordKickOutcome(false);
    }

    // Pause briefly then advance to next kick or conclude match
    setTimeout(() => {
      this.advanceShootout();
    }, 2200);
  }

  showPidginBanner(type) {
    let list = PIDGIN_GOAL;
    let color = '#22c55e';
    if (type === 'save') {
      list = PIDGIN_SAVE;
      color = '#38bdf8';
    } else if (type === 'miss') {
      list = PIDGIN_MISS;
      color = '#ef4444';
    }
    const phrase = list[Math.floor(Math.random() * list.length)];
    this.showBanner(phrase, color);

    // Speak matchday commentary audio aloud!
    commentator.speak(phrase);
  }

  showBanner(text, color = '#ffffff') {
    this.banner.text = text;
    this.banner.color = color;
    this.banner.time = 2.4;
    this.banner.active = true;
  }

  recordKickOutcome(isGoal) {
    if (this.turn === 'player') {
      this.playerKicks.push(isGoal);
      if (isGoal) this.playerScore++;
    } else {
      this.opponentKicks.push(isGoal);
      if (isGoal) this.opponentScore++;
    }
    this.updateScoreboardUI();
  }

  updateScoreboardUI() {
    const playerPills = document.getElementById('player-pills');
    const oppPills = document.getElementById('opp-pills');
    const scoreText = document.getElementById('match-score');
    const teamLeftName = document.getElementById('team-left-name');
    const teamRightName = document.getElementById('team-right-name');
    const roundBadge = document.getElementById('round-badge');

    if (teamLeftName) teamLeftName.textContent = this.playerClub.abbr || this.playerClub.shortName;
    if (teamRightName) teamRightName.textContent = this.opponentClub.abbr || this.opponentClub.shortName;
    if (scoreText) scoreText.textContent = `${this.playerScore} - ${this.opponentScore}`;

    if (roundBadge) {
      if (this.isSuddenDeath) {
        roundBadge.textContent = '⚡ SD';
        roundBadge.className = 'round-tag sudden-death';
      } else {
        roundBadge.textContent = `R${Math.min(5, this.round)}/5`;
        roundBadge.className = 'round-tag';
      }
    }

    const renderPills = (el, kicks) => {
      if (!el) return;
      el.innerHTML = '';
      const totalSlots = Math.max(5, kicks.length);
      for (let i = 0; i < totalSlots; i++) {
        const dot = document.createElement('span');
        dot.className = 'pill-dot';
        if (i < kicks.length) {
          dot.classList.add(kicks[i] ? 'goal' : 'miss');
        }
        el.appendChild(dot);
      }
    };

    renderPills(playerPills, this.playerKicks);
    renderPills(oppPills, this.opponentKicks);
  }

  advanceShootout() {
    // Check if regular 5 rounds are done or early win condition is met
    const pKicks = this.playerKicks.length;
    const oKicks = this.opponentKicks.length;

    // Check if either team has won before 5 kicks:
    const pRemaining = 5 - pKicks;
    const oRemaining = 5 - oKicks;

    if (!this.isSuddenDeath && pKicks <= 5 && oKicks <= 5) {
      if (this.playerScore > this.opponentScore + oRemaining) {
        this.endMatch(true);
        return;
      }
      if (this.opponentScore > this.playerScore + pRemaining) {
        this.endMatch(false);
        return;
      }
    }

    // If both have taken 5 kicks:
    if (pKicks >= 5 && oKicks >= 5 && pKicks === oKicks) {
      if (this.playerScore !== this.opponentScore) {
        this.endMatch(this.playerScore > this.opponentScore);
        return;
      } else {
        // Equal score after 5 kicks -> Sudden Death!
        this.isSuddenDeath = true;
      }
    }

    // Toggle turn
    if (this.turn === 'player') {
      this.turn = 'opponent';
      sounds.playWhistle(true);
      this.showBanner(`${this.opponentClub.shortName} stepping up! Dive to save!`, '#f97316');
    } else {
      this.turn = 'player';
      this.round++;
      sounds.playWhistle(true);
      this.showBanner(`Your turn! Score am!`, '#22c55e');
    }

    this.setupMatchCharacters();
    this.state = 'PLAYING';
  }

  async endMatch(playerWon) {
    this.state = 'GAME_OVER';

    if (playerWon) {
      this.totalWins++;
      localStorage.setItem('naija_wins', this.totalWins.toString());
      sounds.playVictoryFanfare();
      this.showBanner(`🎉 UP ${this.playerClub.name.toUpperCase()}! VICTORY!`, '#22c55e');
    } else {
      sounds.playWhistle(false);
      this.showBanner(`Chai! ${this.opponentClub.name} wins the shootout!`, '#ef4444');
    }

    // Submit stats to start.ng
    const stats = {
      wins: this.totalWins,
      goals: this.totalGoals,
      saves: this.totalSaves
    };
    saveScore(stats);

    // Show Game Over Modal
    setTimeout(async () => {
      this.renderGameOverModal(playerWon);
    }, 1200);
  }

  async renderGameOverModal(playerWon) {
    const titleEl = document.getElementById('gameover-title');
    const msgEl = document.getElementById('gameover-message');
    const finalScoreEl = document.getElementById('final-score');
    const statsGoalsEl = document.getElementById('stats-goals');
    const statsSavesEl = document.getElementById('stats-saves');
    const statsWinsEl = document.getElementById('stats-wins');

    if (titleEl) {
      titleEl.textContent = playerWon ? '🏆 YOU WIN THE SHOOTOUT!' : '💔 SHOOTOUT DEFEAT';
      titleEl.style.color = playerWon ? '#22c55e' : '#ef4444';
    }

    if (msgEl) {
      msgEl.textContent = playerWon
        ? `${this.playerClub.name} defeats ${this.opponentClub.name} in classic Lagos style!`
        : `${this.opponentClub.name} held their nerve against ${this.playerClub.name}.`;
    }

    if (finalScoreEl) {
      finalScoreEl.textContent = `${this.playerScore} - ${this.opponentScore}`;
    }

    if (statsGoalsEl) statsGoalsEl.textContent = this.totalGoals;
    if (statsSavesEl) statsSavesEl.textContent = this.totalSaves;
    if (statsWinsEl) statsWinsEl.textContent = this.totalWins;

    // Load top 10 leaderboard
    const boardEl = document.getElementById('leaderboard-list');
    if (boardEl) {
      boardEl.innerHTML = '<li class="loading">Loading start.ng Top Players...</li>';
      const top = await getLeaderboard(10);
      boardEl.innerHTML = '';
      if (Array.isArray(top) && top.length > 0) {
        top.forEach((item, idx) => {
          const li = document.createElement('li');
          const isPlayerRow = (this.playerIdentity?.id && item.player_id === this.playerIdentity.id) ||
                              (item.name === this.playerIdentity?.name);
          if (isPlayerRow) li.classList.add('my-row');

          const rank = item.rank || (idx + 1);
          const name = item.name || 'Anonymous';
          const wins = item.stats?.wins ?? item.score ?? 0;
          const goals = item.stats?.goals ?? 0;

          li.innerHTML = `
            <span class="rank-num">#${rank}</span>
            <span class="player-name">${name}</span>
            <span class="score-badge">${wins} Wins (${goals} ⚽)</span>
          `;
          boardEl.appendChild(li);
        });
      } else {
        boardEl.innerHTML = '<li>Play live at *.start.ng to see shared leaderboard!</li>';
      }
    }

    this.showModal('gameover-modal');
  }

  // --- Particles ---
  createGoalConfetti() {
    const colors = ['#22c55e', '#ffffff', '#f59e0b', '#38bdf8', '#ef4444'];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: this.width * 0.5 + (Math.random() * 200 - 100),
        y: this.height * 0.35 + (Math.random() * 100 - 50),
        vx: (Math.random() * 8 - 4),
        vy: (Math.random() * -6 - 2),
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01
      });
    }
  }

  createTurfSparks(x, y, color = '#ffffff') {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() * 6 - 3),
        vy: (Math.random() * 6 - 3),
        size: Math.random() * 4 + 2,
        color,
        life: 1.0,
        decay: 0.035
      });
    }
  }

  // --- Main Animation Loop ---
  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    this.crowdTime += dt;

    // Update banner timer
    if (this.banner.active) {
      this.banner.time -= dt;
      if (this.banner.time <= 0) this.banner.active = false;
    }

    // Update characters
    if (this.strikerChar) this.strikerChar.update(dt);
    if (this.keeperChar) this.keeperChar.update(dt);

    // Update ball flight
    if (this.ball.inFlight) {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.z += this.ball.vz;
      this.ball.rotation += this.ball.rotSpeed;

      // Add to trail
      const screenPos = this.projectBallToScreen(this.ball.x, this.ball.y, this.ball.z);
      this.ball.trail.push({ ...screenPos, life: 1.0 });

      // Check if reached goal plane
      if (this.ball.z >= 1.0) {
        this.resolveBallOutcome();
      }
    }

    // Update trail
    this.ball.trail.forEach((p) => {
      p.life -= dt * 3.5;
    });
    this.ball.trail = this.ball.trail.filter((p) => p.life > 0);

    // Update particles
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.life -= p.decay;
    });
    this.particles = this.particles.filter((p) => p.life > 0);

    // Net bulge decay
    if (this.netBulge > 0) {
      this.netBulge = Math.max(0, this.netBulge - dt * 1.5);
    }
  }

  // Perspective 3D -> 2D projection
  projectBallToScreen(x, y, z) {
    // z ranges 0 (penalty spot) to 1 (goal net)
    const goalCenterScreenX = this.width * 0.5;
    const goalCenterScreenY = this.height * 0.35;
    const spotScreenX = this.width * 0.5;
    const spotScreenY = this.height * 0.70;

    const currentOriginX = spotScreenX + (goalCenterScreenX - spotScreenX) * z;
    const currentOriginY = spotScreenY + (goalCenterScreenY - spotScreenY) * z;

    const scale = 1.0 - z * 0.52; // shrinks as it flies away
    const screenX = currentOriginX + x * (this.goalWidth * 0.5) * z;
    const screenY = currentOriginY - y * this.goalHeight * z;

    return { x: screenX, y: screenY, scale };
  }

  // --- Rendering ---
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Stadium, Sky & Cheering Crowd
    this.drawStadiumSkyAndCrowd();

    // 2. Football Pitch & Markings
    this.drawPitch();

    // 3. Goal Frame, Net & Backing
    this.drawGoalNetAndPosts();

    // 4. Characters
    this.drawCharacters();

    // 5. Ball Trail & Ball
    this.drawBall();

    // 6. Particles
    this.drawParticles();

    // 7. Aim Reticle / Drag Indicator (when aiming)
    if (this.isDragging && this.state === 'PLAYING') {
      this.drawAimGuide();
    }

    // 8. Nigerian Pidgin Banner
    this.drawCommentaryBanner();
  }

  drawStadiumSkyAndCrowd() {
    const horizon = this.height * 0.30;

    // Stadium Floodlit Sky
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#061c12'); // Deep Nigerian Green Night Sky
    skyGrad.addColorStop(0.7, '#0d3824');
    skyGrad.addColorStop(1, '#1b5e39');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, horizon);

    // Stadium Floodlights (left and right glowing beams)
    this.ctx.fillStyle = 'rgba(255, 255, 200, 0.08)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 20);
    this.ctx.lineTo(this.width * 0.5, horizon);
    this.ctx.lineTo(0, horizon);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(this.width, 20);
    this.ctx.lineTo(this.width * 0.5, horizon);
    this.ctx.lineTo(this.width, horizon);
    this.ctx.fill();

    // Cheering Crowd Silhouette with Nigerian tricolor flags
    const crowdY = horizon - 45;
    for (let i = 0; i < this.width; i += 22) {
      const bob = Math.sin(this.crowdTime * 4 + i) * 5;
      this.ctx.fillStyle = (i % 44 === 0) ? '#008751' : '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(i + 10, crowdY + bob, 7, 0, Math.PI * 2);
      this.ctx.fill();

      // Waving Nigerian green-white-green flags
      if (i % 66 === 0) {
        const flagWave = Math.sin(this.crowdTime * 5 + i) * 6;
        this.ctx.fillStyle = '#008751';
        this.ctx.fillRect(i + 12, crowdY - 26 + flagWave, 7, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(i + 19, crowdY - 26 + flagWave, 7, 10);
        this.ctx.fillStyle = '#008751';
        this.ctx.fillRect(i + 26, crowdY - 26 + flagWave, 7, 10);
        // Flag pole
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(i + 12, crowdY + 5);
        this.ctx.lineTo(i + 12, crowdY - 28 + flagWave);
        this.ctx.stroke();
      }
    }

    // Stadium Advertising LED Banners
    const ledY = horizon - 20;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, ledY, this.width, 20);

    this.ctx.fillStyle = '#22c55e';
    this.ctx.font = '900 11px "Outfit", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⭐ LAGOS NATIONAL STADIUM • NAIJA BET • START.NG • HNG15 • NAIJA NO DEY CARRY LAST ⭐', this.width * 0.5, ledY + 14);
  }

  drawPitch() {
    const horizon = this.height * 0.30;
    const pitchH = this.height - horizon;

    // Grass Stripes
    const stripes = 10;
    for (let i = 0; i < stripes; i++) {
      const y1 = horizon + (i / stripes) * pitchH;
      const y2 = horizon + ((i + 1) / stripes) * pitchH;
      this.ctx.fillStyle = (i % 2 === 0) ? '#166534' : '#15803d'; // Rich Football Green
      this.ctx.fillRect(0, y1, this.width, y2 - y1 + 1);
    }

    // White Pitch Markings (Perspective)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 2.5;

    // Goal line
    const goalLineY = this.height * 0.35;
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.12, goalLineY);
    this.ctx.lineTo(this.width * 0.88, goalLineY);
    this.ctx.stroke();

    // 6-yard box
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.30, goalLineY);
    this.ctx.lineTo(this.width * 0.26, goalLineY + 28);
    this.ctx.lineTo(this.width * 0.74, goalLineY + 28);
    this.ctx.lineTo(this.width * 0.70, goalLineY);
    this.ctx.stroke();

    // Penalty Spot at bottom center
    const spotX = this.width * 0.5;
    const spotY = this.height * 0.70;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(spotX, spotY, 4.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Penalty Arc
    this.ctx.beginPath();
    this.ctx.arc(spotX, spotY, 52, Math.PI * 0.15, Math.PI * 0.85);
    this.ctx.stroke();
  }

  drawGoalNetAndPosts() {
    const cx = this.width * 0.5;
    const cy = this.height * 0.35;
    const halfW = this.goalWidth * 0.5;
    const h = this.goalHeight;

    const postL = cx - halfW;
    const postR = cx + halfW;
    const crossbarY = cy - h;

    // Net Backing Depth (Perspective depth behind posts)
    const netDepthY = cy - h * 1.08;
    const netBackL = cx - halfW * 0.88;
    const netBackR = cx + halfW * 0.88;
    const netGroundY = cy - 6;

    // Draw Net Mesh
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    this.ctx.lineWidth = 1;

    // Horizontal net lines with bulge
    const rows = 12;
    for (let r = 1; r <= rows; r++) {
      const p = r / rows;
      const yFront = crossbarY + p * h;
      const yBack = netDepthY + p * (netGroundY - netDepthY);
      const bulge = (this.netBulge * Math.sin(p * Math.PI) * 16);

      this.ctx.beginPath();
      this.ctx.moveTo(postL, yFront);
      this.ctx.quadraticCurveTo(cx, yBack + bulge, postR, yFront);
      this.ctx.stroke();
    }

    // Vertical net lines
    const cols = 20;
    for (let c = 0; c <= cols; c++) {
      const p = c / cols;
      const xTop = postL + p * this.goalWidth;
      const xBottom = netBackL + p * (netBackR - netBackL);

      this.ctx.beginPath();
      this.ctx.moveTo(xTop, crossbarY);
      this.ctx.lineTo(xBottom, netGroundY);
      this.ctx.stroke();
    }

    // Goal Posts & Crossbar (Glossy White 3D Pipes)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 7;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    // Left Post
    this.ctx.moveTo(postL, cy);
    this.ctx.lineTo(postL, crossbarY);
    // Crossbar
    this.ctx.lineTo(postR, crossbarY);
    // Right Post
    this.ctx.lineTo(postR, cy);
    this.ctx.stroke();

    // Metallic Highlight on Posts
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(postL - 2, cy);
    this.ctx.lineTo(postL - 2, crossbarY - 2);
    this.ctx.lineTo(postR + 2, crossbarY - 2);
    this.ctx.lineTo(postR + 2, cy);
    this.ctx.stroke();
  }

  drawCharacters() {
    const isPlayerStriker = (this.turn === 'player');
    const scaleFactor = Math.min(1.0, Math.max(0.72, this.width / 400));
 
    // 1. Goalkeeper (stands on goal line cx, cy)
    if (this.keeperChar) {
      const cx = this.width * 0.5;
      const cy = this.height * 0.35;
      this.keeperChar.drawGoalkeeper(this.ctx, cx, cy, 0.78 * scaleFactor);

      // Overhead Tag for Goalkeeper (floats right above crossbar)
      this.drawRoleTag(
        cx,
        cy - this.goalHeight - 12,
        !isPlayerStriker ? 'YOU (GOALIE)' : 'OPPONENT',
        !isPlayerStriker ? '#22c55e' : '#f97316'
      );
    }

    // 2. Striker (stands comfortably at penalty spot)
    if (this.strikerChar) {
      const spotX = this.width * 0.5 - 20 * scaleFactor;
      const spotY = this.height * 0.70 + 16;
      const strikerScale = 0.90 * scaleFactor;
      this.strikerChar.drawStriker(this.ctx, spotX, spotY, strikerScale);

      // Overhead Tag for Striker (cleanly above head)
      this.drawRoleTag(
        spotX,
        spotY - 72 * strikerScale,
        isPlayerStriker ? 'YOU (STRIKER)' : 'OPPONENT',
        isPlayerStriker ? '#22c55e' : '#f97316'
      );
    }
  }

  drawRoleTag(x, y, text, color) {
    this.ctx.save();
    this.ctx.font = '900 9.5px "Outfit", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const metrics = this.ctx.measureText(text);
    const w = metrics.width + 12;
    const h = 17;

    // Tag background
    this.ctx.fillStyle = 'rgba(10, 20, 15, 0.85)';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.2;

    this.ctx.beginPath();
    this.ctx.roundRect(x - w * 0.5, y - h * 0.5, w, h, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Little pointer triangle
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 3, y + h * 0.5);
    this.ctx.lineTo(x + 3, y + h * 0.5);
    this.ctx.lineTo(x, y + h * 0.5 + 3);
    this.ctx.fill();

    // Text
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  drawBall() {
    const { x, y, scale } = this.projectBallToScreen(this.ball.x, this.ball.y, this.ball.z);

    // Ball Trail when flying
    if (this.ball.trail.length > 1) {
      this.ctx.lineWidth = 6 * scale;
      for (let i = 0; i < this.ball.trail.length - 1; i++) {
        const p1 = this.ball.trail[i];
        const p2 = this.ball.trail[i + 1];
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${p1.life * 0.4})`;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    }

    // Ground Shadow
    const groundY = this.height * 0.74 + (this.height * 0.36 - this.height * 0.74) * this.ball.z;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, groundY + 8 * scale, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Football Sphere
    const r = this.ball.radius * scale;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.ball.rotation);

    // Ball Base White
    const ballGrad = this.ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.8, '#e2e8f0');
    ballGrad.addColorStop(1, '#94a3b8');
    this.ctx.fillStyle = ballGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Black Pentagons pattern
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    // Center pentagon
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 * Math.PI) / 180;
      const px = Math.cos(angle) * (r * 0.45);
      const py = Math.sin(angle) * (r * 0.45);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Outer patches
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 * Math.PI) / 180;
      this.ctx.beginPath();
      this.ctx.arc(Math.cos(angle) * (r * 0.85), Math.sin(angle) * (r * 0.85), r * 0.22, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawParticles() {
    this.particles.forEach((p) => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }

  drawAimGuide() {
    const dx = this.dragCurrent.x - this.dragStart.x;
    const dy = this.dragCurrent.y - this.dragStart.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      // Swipe drag arrow
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
      this.ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
      this.ctx.stroke();

      // Drag arrowhead
      this.ctx.fillStyle = '#22c55e';
      this.ctx.beginPath();
      this.ctx.arc(this.dragCurrent.x, this.dragCurrent.y, 8, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Tap target crosshair
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.dragStart.x, this.dragStart.y, 16, 0, Math.PI * 2);
      this.ctx.moveTo(this.dragStart.x - 24, this.dragStart.y);
      this.ctx.lineTo(this.dragStart.x + 24, this.dragStart.y);
      this.ctx.moveTo(this.dragStart.x, this.dragStart.y - 24);
      this.ctx.lineTo(this.dragStart.x, this.dragStart.y + 24);
      this.ctx.stroke();
    }
  }

  drawCommentaryBanner() {
    if (!this.banner.active) return;

    this.ctx.save();
    const bx = this.width * 0.5;
    const by = this.height * 0.52; // Midfield turf — completely clear of goal and characters!

    if (this.banner.time < 0.5) {
      this.ctx.globalAlpha = Math.max(0, this.banner.time / 0.5);
    }

    const fontSize = Math.min(15, Math.max(11, this.width * 0.040));
    this.ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const textMetrics = this.ctx.measureText(this.banner.text);
    const boxW = Math.min(this.width * 0.88, textMetrics.width + 36);
    const boxH = Math.min(36, fontSize * 2.3);

    this.ctx.fillStyle = 'rgba(10, 20, 15, 0.92)';
    this.ctx.strokeStyle = this.banner.color;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.roundRect(bx - boxW * 0.5, by - boxH * 0.5, boxW, boxH, boxH * 0.5);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = this.banner.color;
    this.ctx.fillText(this.banner.text, bx, by);
    this.ctx.restore();
  }
}

// Start game instance on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const game = new PenaltyGame();
  game.init();
});
