// Generates short tactical-sounding callsigns for anonymous players.
const PREFIXES = [
  'Ankit', 'Aditya', 'Anirudh', 'Progyan', 'Ansh', 'Sunny', 'Ayush', 'Amit',
  'Sahil', 'Harshit', 'Navnit', 'Himanshu', 'Arpit', 'Ajit', 'Som', 'Varun',
  'Sidhart', 'Rahul', 'Ashish', 'Virat'
];

const SUFFIXES = [
  'Kohli', 'Kumar', 'Singh', 'Patel', 'Jain', 'Kumar', 'Chopra', 'Nair',
  'Arya', 'Agarwal', 'Gupta', 'Verma', 'Sharma', 'Roy', 'Patel', 'Rana',
  'Gupta', 'Kohli', 'Chopra', 'Reddy'
];

function generateUsername() {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const number = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${prefix}${suffix}${number}`;
}

module.exports = { generateUsername };
