const BreakTimeGame = require('../models/BreakTimeGame');

const defaultGames = [
  {
    name: 'Tic Tac Toe',
    slug: 'tic-tac-toe',
    icon: 'grid-3x3',
    description: 'A quick three-in-a-row round against Aura.',
    timerSeconds: 60
  },
  {
    name: 'Memory Card Game',
    slug: 'memory-card',
    icon: 'brain',
    description: 'Flip cards and match the pairs with fewer moves.',
    timerSeconds: 120
  },
  {
    name: 'Bubble Pop',
    slug: 'bubble-pop',
    icon: 'circle-dot',
    description: 'Pop colorful bubbles and build a fast combo score.',
    timerSeconds: 30
  },
  {
    name: 'Tap Speed Challenge',
    slug: 'tap-speed',
    icon: 'mouse-pointer-click',
    description: 'Tap fast, loosen up, and beat your own count.',
    timerSeconds: 15
  },
  {
    name: 'Puzzle Game',
    slug: 'puzzle-game',
    icon: 'puzzle',
    description: 'Slide the tiles back into order with calm focus.',
    timerSeconds: 180
  }
];

const ensureDefaultGames = async () => {
  await Promise.all(defaultGames.map((game) => (
    BreakTimeGame.updateOne(
      { slug: game.slug },
      { $setOnInsert: { ...game, status: 'active', isActive: true } },
      { upsert: true }
    )
  )));
};

module.exports = {
  defaultGames,
  ensureDefaultGames
};
