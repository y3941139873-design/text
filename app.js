const SIZE = 4;
const boardElement = document.querySelector('#board');
const scoreElement = document.querySelector('#score');
const bestElement = document.querySelector('#best');
const statusElement = document.querySelector('#status');
let grid;
let score = 0;
let best = Number(localStorage.getItem('2048-best') || 0);

function emptyGrid() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }
function addRandomTile() {
  const empty = [];
  grid.forEach((row, r) => row.forEach((value, c) => { if (!value) empty.push([r, c]); }));
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}
function startGame() { grid = emptyGrid(); score = 0; addRandomTile(); addRandomTile(); hideStatus(); render(); }
function render() {
  boardElement.innerHTML = '';
  grid.flat().forEach(value => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (value) { cell.dataset.value = value; cell.textContent = value; }
    boardElement.appendChild(cell);
  });
  scoreElement.textContent = score;
  best = Math.max(best, score);
  bestElement.textContent = best;
  localStorage.setItem('2048-best', best);
}
function slide(line) {
  const values = line.filter(Boolean);
  const merged = [];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) { const value = values[i] * 2; merged.push(value); score += value; i += 1; }
    else merged.push(values[i]);
  }
  while (merged.length < SIZE) merged.push(0);
  return merged;
}
function move(direction) {
  const before = JSON.stringify(grid);
  if (direction === 'left' || direction === 'right') {
    grid = grid.map(row => slide(direction === 'left' ? row : [...row].reverse()).slice().map((v, i, a) => direction === 'left' ? v : a[SIZE - 1 - i]));
  } else {
    for (let c = 0; c < SIZE; c += 1) {
      const column = grid.map(row => row[c]);
      const result = slide(direction === 'up' ? column : [...column].reverse());
      const ordered = direction === 'up' ? result : result.reverse();
      ordered.forEach((value, r) => { grid[r][c] = value; });
    }
  }
  if (before === JSON.stringify(grid)) return;
  addRandomTile(); render();
  if (hasWon()) showStatus('🎉 合成了 2048！');
  else if (!canMove()) showStatus('游戏结束');
}
function canMove() {
  if (grid.some(row => row.includes(0))) return true;
  for (let r = 0; r < SIZE; r += 1) for (let c = 0; c < SIZE; c += 1)
    if ((r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) || (c < SIZE - 1 && grid[r][c] === grid[r][c + 1])) return true;
  return false;
}
function hasWon() { return grid.some(row => row.includes(2048)); }
function showStatus(message) { statusElement.dataset.message = message; statusElement.classList.add('visible'); }
function hideStatus() { statusElement.classList.remove('visible'); }

document.addEventListener('keydown', event => {
  const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  const direction = keys[event.key];
  if (direction) { event.preventDefault(); move(direction); }
  if (event.key === 'Enter' && statusElement.classList.contains('visible')) startGame();
});
document.querySelector('#new-game').addEventListener('click', startGame);
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => move(button.dataset.direction)));
statusElement.addEventListener('click', startGame);
let touchStart = null;
boardElement.addEventListener('touchstart', event => { touchStart = event.changedTouches[0]; }, { passive: true });
boardElement.addEventListener('touchend', event => {
  if (!touchStart) return;
  const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.clientX; const dy = touch.clientY - touchStart.clientY;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
}, { passive: true });
startGame();
