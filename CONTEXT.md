# Domain Model & Context: Naija Penalty Shootout (start.ng)

## Ubiquitous Language & Glossary
- **Match**: A single penalty shootout contest between two teams (Player's chosen team vs Random Opponent team).
- **Team**: A football club featuring its logo, kit colors, and club identity. Curated list of popular clubs in Nigeria (European giants + NPFL icons).
- **Rounds & Scoreboard**: 5 penalty kicks per team taken alternately. Indicated on a 5-light scoreboard (Green check for Goal, Red cross for Miss/Save).
- **Sudden Death**: If tied after 5 kicks, sudden-death single-kick rounds until a winner emerges.
- **Striker (Kicker)**: Character taking the penalty. Controlled via drag/flick or tap toward the goal. Both striker and keeper animate simultaneously.
- **Goalkeeper (Keeper)**: Defending the net. Controlled via drag/swipe to dive towards the shot.
- **Dual start.ng Characters**: 
  - The human player's custom start.ng character (`user.style` or `guest.style`) is the hero of their squad.
  - The opposing team's striker and keeper are fully drawn using start.ng's character style specification (body, skinColor, hair, hat, accessories) in their rival club kit, giving a lively two-character duel on every kick!
- **Control Input**: Direct drag/swipe or tap gesture from the ball/goal line. Triggers simultaneous run-up and dive with realistic physics.
- **Club Selection & Matchup Rule**: 
  - The player may select ANY club (European giant or Nigerian club).
  - The opponent is ALWAYS a Nigerian Premier League club (e.g., Enyimba FC, Kano Pillars, Shooting Stars 3SC, Remo Stars, Enugu Rangers). If the player chooses a Nigerian club, they face a fellow Nigerian club (Naija Derby).
- **100% Authentic Nigerian Matchday Hype**:
  - Stadium visuals: Lagos/Aba stadium atmosphere with Green-White-Green tricolor banners and crowd.
  - Authentic audio: Web Audio referee whistles, crowd chants, energetic vuvuzela buzzes, ball strike thuds, and crossbar hits.
  - Street & Pidgin Commentary Banners: *"Goal na goal!"*, *"Omo see wicked shot!"*, *"Which kind keeper be this?!"*, *"E choke!"*, *"Clean save bros!"*, *"Up your team!"*, *"Ref don blow final whistle!"*.
  - Goal Celebrations: Animated Nigerian street dance steps (Legwork / Afrobeat vibes) for the scoring character!
## Architectural Decision Record (ADR 001)
- **Status**: Accepted
- **Decision**: Build "Naija Penalty Shootout" as an authentic Nigerian browser football game for start.ng.
- **Key Tenets**:
  1. **Dual Character start.ng Integration**: Use start.ng character styles (`user.style` / `guest.style`) for the player's avatar and generate authentic opponent characters matching the start.ng spec. Display live profile card and support guests with sign-in prompts.
  2. **Club & Matchup Rules**: Player chooses from popular European and Nigerian clubs; opponent is randomly drawn exclusively from Nigerian clubs (Enyimba, Kano Pillars, Shooting Stars, Remo Stars, Enugu Rangers).
  3. **Simultaneous Motion & Controls**: Drag/swipe or tap mechanics triggering simultaneous striker kick and goalkeeper dive animations with responsive physics.
  4. **100% Naija Matchday Atmosphere**: Web Audio referee whistles, vuvuzela buzzes, crowd stadium roar, Nigerian pidgin commentary callouts, and victory dance celebrations.
  5. **Leaderboard**: `startng.json` tracking `wins` (primary), `goals`, and `saves`.
  6. **Zero Dependencies**: Pure HTML5 Canvas, CSS, and Vanilla JS with relative paths for instant loading and 100% compatibility with start.ng constraints.


