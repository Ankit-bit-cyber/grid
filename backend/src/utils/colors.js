// A curated palette of visually distinct, high-contrast colors for player territories.
// Colors are assigned round-robin + random offset so neighboring new players rarely collide.
const PALETTE = [
  '#FF4D6D', // signal red
  '#3DDC97', // mint green
  '#4D96FF', // electric blue
  '#FFB020', // amber
  '#C77DFF', // violet
  '#00E5FF', // cyan
  '#FF8C42', // orange
  '#7BE0AD', // sea green
  '#F15BB5', // pink
  '#9B5DE5', // purple
  '#00BBF9', // sky blue
  '#FEE440', // yellow
  '#FF6B6B', // coral
  '#4ECDC4', // teal
  '#B5838D', // mauve
  '#06D6A0', // jade
];

let cursor = 0;

function generateColor() {
  const color = PALETTE[cursor % PALETTE.length];
  cursor += 1;
  return color;
}

module.exports = { generateColor, PALETTE };
