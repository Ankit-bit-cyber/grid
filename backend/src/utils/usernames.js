// Generates short tactical-sounding callsigns for anonymous players.
const PREFIXES = [
  'Swift', 'Iron', 'Shadow', 'Crimson', 'Golden', 'Silent', 'Rapid', 'Cosmic',
  'Storm', 'Night', 'Steel', 'Blaze', 'Frost', 'Ghost', 'Thunder', 'Viper',
  'Quantum', 'Rogue', 'Echo', 'Titan'
];

const SUFFIXES = [
  'Hawk', 'Wolf', 'Falcon', 'Dragon', 'Phoenix', 'Raven', 'Panther', 'Tiger',
  'Cobra', 'Lynx', 'Eagle', 'Bear', 'Fox', 'Shark', 'Lion', 'Hornet',
  'Comet', 'Blade', 'Scout', 'Ranger'
];

function generateUsername() {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const number = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${prefix}${suffix}${number}`;
}

module.exports = { generateUsername };
