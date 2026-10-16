// start.ng Character Engine: Procedural Canvas Renderer & Animator
// Renders characters matching the start.ng character specification with realistic football gear

export const NIGERIAN_NAMES = [
  'Emeka Okafor', 'Chidi Nwosu', 'Tunde Bakare', 'Ibrahim Musa',
  'Sadiq Abubakar', 'Kelechi Iheanacho', 'Obinna Victor', 'Babajide Adeleke',
  'Sunday Oliseh', 'Ahmed Musa', 'Finidi George', 'Taribo West'
];

export function createRandomNaijaCharacter(club, isGoalkeeper = false) {
  const skins = ['#52311b', '#6f4326', '#87532d', '#9b6437', '#422413', '#7d4a27'];
  const hairs = ['dreads', 'braids', 'afro', 'short', 'bald'];
  const hairColors = ['#151210', '#1c1917', '#292524', '#0c0a09'];
  const hats = ['none', 'none', 'none', 'cap', 'beanie', 'crown'];
  const accessories = ['none', 'none', 'beard', 'glasses', 'earrings'];

  const skinColor = skins[Math.floor(Math.random() * skins.length)];
  const hair = hairs[Math.floor(Math.random() * hairs.length)];
  const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
  const hat = hats[Math.floor(Math.random() * hats.length)];
  const accessory = accessories[Math.floor(Math.random() * accessories.length)];
  const name = NIGERIAN_NAMES[Math.floor(Math.random() * NIGERIAN_NAMES.length)];

  return {
    name,
    account: name.toLowerCase().replace(/\s+/g, '_'),
    style: {
      body: Math.random() > 0.5 ? 'male' : 'female',
      skinColor,
      hairColor,
      hair,
      hat,
      accessory,
      // If keeper, jersey is contrast neon/fluorescent color as standard football keepers wear!
      primaryColor: isGoalkeeper ? '#eab308' : club.primaryColor,
      secondaryColor: isGoalkeeper ? '#1e293b' : club.secondaryColor
    }
  };
}

export class AnimatedCharacter {
  constructor(style, isStriker = true, club = null) {
    this.style = {
      body: 'male',
      skinColor: '#6f4326',
      hairColor: '#151210',
      hair: 'dreads',
      hat: 'none',
      accessory: 'none',
      primaryColor: '#008751',
      secondaryColor: '#ffffff',
      ...style
    };
    this.isStriker = isStriker;
    this.club = club;
    this.state = 'idle'; // idle, runup, kick, dive, celebrate, despair
    this.stateTime = 0;

    // Spatial coordinates on pitch
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.diveTarget = { x: 0, y: 0 };
    this.diveStartX = 0;
    this.diveStartY = 0;
  }

  update(dt) {
    this.stateTime += dt;
  }

  setState(newState, diveTarget = null) {
    this.state = newState;
    this.stateTime = 0;
    if (diveTarget) {
      this.diveTarget = diveTarget;
      this.diveStartX = this.x;
      this.diveStartY = this.y;
    }
  }

  // --- Draw Striker (taking penalty kick from behind/side angle) ---
  drawStriker(ctx, px, py, scale = 1.0) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);

    const t = this.stateTime;
    let legL = 0;
    let legR = 0;
    let armL = 0;
    let armR = 0;
    let bodyY = 0;
    let bodyRot = 0;

    if (this.state === 'idle') {
      bodyY = Math.sin(t * 5) * 2;
      legL = -5;
      legR = 5;
      armL = Math.sin(t * 5) * 4;
      armR = -Math.sin(t * 5) * 4;
    } else if (this.state === 'runup') {
      const cycle = t * 14;
      bodyY = -Math.abs(Math.sin(cycle)) * 6;
      bodyRot = 0.08;
      legL = Math.sin(cycle) * 22;
      legR = -Math.sin(cycle) * 22;
      armL = -Math.sin(cycle) * 20;
      armR = Math.sin(cycle) * 20;
    } else if (this.state === 'kick') {
      // Plant left foot, swing right foot through
      const p = Math.min(1, t / 0.28);
      if (p < 0.35) {
        // Backswing
        legR = -25 * (p / 0.35);
        armR = 15;
        armL = -15;
        bodyRot = -0.05;
      } else {
        // Forward strike & follow through
        const snap = (p - 0.35) / 0.65;
        legR = -25 + snap * 65;
        legL = -10;
        bodyRot = 0.12;
        armL = 25;
        armR = -25;
      }
    } else if (this.state === 'celebrate') {
      // Afrobeat legwork / Shaku Shaku dance!
      const danceCycle = t * 9;
      bodyY = -Math.abs(Math.sin(danceCycle)) * 12;
      bodyRot = Math.sin(danceCycle) * 0.15;
      legL = Math.sin(danceCycle) * 24;
      legR = -Math.sin(danceCycle) * 24;
      armL = -45 + Math.sin(danceCycle) * 20;
      armR = -45 - Math.sin(danceCycle) * 20;
    } else if (this.state === 'despair') {
      bodyY = 6;
      bodyRot = 0.02;
      legL = -8;
      legR = 8;
      armL = -30;
      armR = -30;
    }

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 24 * Math.max(0.6, 1 + bodyY * 0.04), 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Boots
    const skin = this.style.skinColor;
    const shortsColor = this.style.secondaryColor || '#ffffff';
    const jerseyColor = this.style.primaryColor || '#008751';

    // Left Leg
    ctx.save();
    ctx.translate(-9, -20);
    ctx.rotate((legL * Math.PI) / 180);
    // Thigh / Shorts
    ctx.fillStyle = shortsColor;
    ctx.fillRect(-5, 0, 10, 14);
    // Lower leg (skin)
    ctx.fillStyle = skin;
    ctx.fillRect(-4, 14, 8, 12);
    // Sock & Boot
    ctx.fillStyle = jerseyColor;
    ctx.fillRect(-4, 20, 8, 8);
    ctx.fillStyle = '#1e293b'; // Boot
    ctx.fillRect(-6, 26, 12, 6);
    ctx.restore();

    // Right Leg (Kicking leg)
    ctx.save();
    ctx.translate(9, -20);
    ctx.rotate((legR * Math.PI) / 180);
    ctx.fillStyle = shortsColor;
    ctx.fillRect(-5, 0, 10, 14);
    ctx.fillStyle = skin;
    ctx.fillRect(-4, 14, 8, 12);
    ctx.fillStyle = jerseyColor;
    ctx.fillRect(-4, 20, 8, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, 26, 12, 6);
    ctx.restore();

    // Torso / Jersey
    ctx.save();
    ctx.translate(0, -38 + bodyY);
    ctx.rotate(bodyRot);

    // Jersey body
    ctx.fillStyle = jerseyColor;
    ctx.beginPath();
    ctx.roundRect(-16, -18, 32, 34, [6, 6, 2, 2]);
    ctx.fill();

    // Squad Number on back (#10 or #7)
    ctx.fillStyle = this.style.secondaryColor || '#ffffff';
    ctx.font = '900 14px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('10', 0, 0);

    // Collar trim
    ctx.fillStyle = this.style.secondaryColor || '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI);
    ctx.fill();

    // Arms
    // Left Arm
    ctx.save();
    ctx.translate(-16, -14);
    ctx.rotate((armL * Math.PI) / 180);
    ctx.fillStyle = jerseyColor;
    ctx.fillRect(-4, 0, 8, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(-3, 10, 6, 14);
    ctx.restore();

    // Right Arm
    ctx.save();
    ctx.translate(16, -14);
    ctx.rotate((armR * Math.PI) / 180);
    ctx.fillStyle = jerseyColor;
    ctx.fillRect(-4, 0, 8, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(-3, 10, 6, 14);
    ctx.restore();

    // Head, Hair & Accessories
    this.drawHead(ctx, 0, -34, skin, true);

    ctx.restore(); // torso
    ctx.restore(); // base
  }

  // --- Draw Goalkeeper (guarding the net facing forward) ---
  drawGoalkeeper(ctx, px, py, scale = 1.0) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);

    const t = this.stateTime;
    let bodyY = 0;
    let bodyRot = 0;
    let armLAngle = 30;
    let armRAngle = -30;
    let legLAngle = 0;
    let legRAngle = 0;

    if (this.state === 'ready') {
      // Ready bounce / alertness
      bodyY = Math.sin(t * 6) * 3;
      armLAngle = 25 + Math.sin(t * 6) * 5;
      armRAngle = -25 - Math.sin(t * 6) * 5;
      legLAngle = -10;
      legRAngle = 10;
    } else if (this.state === 'dive') {
      // Horizontal dive animation towards diveTarget
      const diveProgress = Math.min(1, t / 0.45);
      const isLeft = (this.diveTarget.x < px);
      const isCenter = Math.abs(this.diveTarget.x - px) < 25;

      if (!isCenter) {
        bodyRot = isLeft ? -0.85 : 0.85;
        bodyY = -Math.sin(diveProgress * Math.PI) * 25;
        armLAngle = isLeft ? -75 : 45;
        armRAngle = isLeft ? -45 : 75;
        legLAngle = isLeft ? 15 : -30;
        legRAngle = isLeft ? 30 : -15;
      } else {
        // High jump or crouch
        bodyY = -Math.sin(diveProgress * Math.PI) * 30;
        armLAngle = -80;
        armRAngle = 80;
      }
    } else if (this.state === 'celebrate') {
      // Hero save celebration!
      bodyY = -Math.abs(Math.sin(t * 8)) * 8;
      armLAngle = -75;
      armRAngle = 75;
    } else if (this.state === 'conceded') {
      bodyY = 10;
      bodyRot = 0.05;
      armLAngle = 15;
      armRAngle = -15;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const skin = this.style.skinColor;
    const keeperJersey = this.style.primaryColor;
    const keeperShorts = this.style.secondaryColor || '#1e293b';

    // Legs
    ctx.save();
    ctx.translate(-10, -20);
    ctx.rotate((legLAngle * Math.PI) / 180);
    ctx.fillStyle = keeperShorts;
    ctx.fillRect(-6, 0, 11, 14);
    ctx.fillStyle = skin;
    ctx.fillRect(-4, 14, 8, 12);
    ctx.fillStyle = '#0f172a'; // Goalie socks/boots
    ctx.fillRect(-5, 22, 10, 10);
    ctx.restore();

    ctx.save();
    ctx.translate(10, -20);
    ctx.rotate((legRAngle * Math.PI) / 180);
    ctx.fillStyle = keeperShorts;
    ctx.fillRect(-5, 0, 11, 14);
    ctx.fillStyle = skin;
    ctx.fillRect(-4, 14, 8, 12);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, 22, 10, 10);
    ctx.restore();

    // Torso / Keeper Jersey
    ctx.save();
    ctx.translate(0, -38 + bodyY);
    ctx.rotate(bodyRot);

    ctx.fillStyle = keeperJersey;
    ctx.beginPath();
    ctx.roundRect(-17, -18, 34, 34, [6, 6, 2, 2]);
    ctx.fill();

    // Goalie Number #1 on chest
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', 0, -2);

    // Arms & Large Padded Goalie Gloves!
    // Left Arm
    ctx.save();
    ctx.translate(-16, -14);
    ctx.rotate((armLAngle * Math.PI) / 180);
    ctx.fillStyle = keeperJersey;
    ctx.fillRect(-4, 0, 8, 12);
    ctx.fillStyle = skin;
    ctx.fillRect(-3, 12, 6, 10);
    // Goalkeeper Glove (Bright fluo padding)
    ctx.fillStyle = '#f97316'; // Fluo Orange
    ctx.beginPath();
    ctx.roundRect(-6, 20, 12, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, 24, 8, 3);
    ctx.restore();

    // Right Arm
    ctx.save();
    ctx.translate(16, -14);
    ctx.rotate((armRAngle * Math.PI) / 180);
    ctx.fillStyle = keeperJersey;
    ctx.fillRect(-4, 0, 8, 12);
    ctx.fillStyle = skin;
    ctx.fillRect(-3, 12, 6, 10);
    // Goalkeeper Glove
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(-6, 20, 12, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, 24, 8, 3);
    ctx.restore();

    // Head, Hair & Hat
    this.drawHead(ctx, 0, -32, skin, false);

    ctx.restore(); // torso
    ctx.restore(); // base
  }

  // --- Draw Head, Hairstyle, Hat & Accessories based on start.ng style ---
  drawHead(ctx, hx, hy, skin, isFacingAway = false) {
    ctx.save();
    ctx.translate(hx, hy);

    // Head shape
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // If facing forward (Goalkeeper): draw facial features
    if (!isFacingAway) {
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-5, -1, 3, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -1, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(-5, -1, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -1, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = this.style.hairColor || '#151210';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -4); ctx.lineTo(-2, -4);
      ctx.moveTo(2, -4); ctx.lineTo(8, -4);
      ctx.stroke();

      // Mouth (Smile or determination)
      ctx.strokeStyle = '#3e1a00';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 5, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Accessory: Beard
      if (this.style.accessory === 'beard') {
        ctx.fillStyle = this.style.hairColor || '#151210';
        ctx.beginPath();
        ctx.arc(0, 6, 7, 0, Math.PI);
        ctx.fill();
      }

      // Accessory: Glasses
      if (this.style.accessory === 'glasses') {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-8, -4, 6, 6);
        ctx.strokeRect(2, -4, 6, 6);
        ctx.beginPath();
        ctx.moveTo(-2, -1); ctx.lineTo(2, -1);
        ctx.stroke();
      }

      // Accessory: Earrings
      if (this.style.accessory === 'earrings') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(-14, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Hairstyle
    const hair = this.style.hair || 'dreads';
    const hairColor = this.style.hairColor || '#151210';
    ctx.fillStyle = hairColor;

    if (hair === 'afro') {
      ctx.beginPath();
      ctx.arc(0, -6, 19, 0, Math.PI * 2);
      ctx.fill();
    } else if (hair === 'dreads') {
      // Stylized dreadlocks hanging
      ctx.beginPath();
      ctx.arc(0, -8, 16, Math.PI, 0);
      ctx.fill();
      for (let i = -14; i <= 14; i += 5) {
        ctx.beginPath();
        ctx.roundRect(i - 2, -12, 4, 18, 2);
        ctx.fill();
      }
    } else if (hair === 'braids') {
      ctx.beginPath();
      ctx.arc(0, -8, 15, Math.PI, 0);
      ctx.fill();
      for (let i = -12; i <= 12; i += 6) {
        ctx.beginPath();
        ctx.roundRect(i - 1.5, -6, 3, 14, 1.5);
        ctx.fill();
      }
    } else if (hair === 'short') {
      ctx.beginPath();
      ctx.arc(0, -5, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    } else if (hair === 'bun') {
      ctx.beginPath();
      ctx.arc(0, -6, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.arc(0, -20, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (hair === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, -6, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.arc(12, -10, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hat
    const hat = this.style.hat || 'none';
    if (hat === 'cap') {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, -8, 15, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-16, -10, 32, 4);
      // Visor
      ctx.fillRect(isFacingAway ? -16 : 4, -10, 16, 4);
    } else if (hat === 'beanie') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(0, -10, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -22, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'crown') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(-14, -20);
      ctx.lineTo(-7, -14);
      ctx.lineTo(0, -24);
      ctx.lineTo(7, -14);
      ctx.lineTo(14, -20);
      ctx.lineTo(14, -8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
