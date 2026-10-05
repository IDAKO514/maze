const DIRECTIONS = [
  { dr: -1, dc: 0, wall: 0, opposite: 2 },
  { dr: 0, dc: 1, wall: 1, opposite: 3 },
  { dr: 1, dc: 0, wall: 2, opposite: 0 },
  { dr: 0, dc: -1, wall: 3, opposite: 1 },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createMaze(cols, rows, random) {
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      visited: false,
      walls: [true, true, true, true],
    })),
  );

  const stack = [cells[0][0]];
  cells[0][0].visited = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const candidates = [];

    for (const dir of DIRECTIONS) {
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (cells[nr][nc].visited) continue;
      candidates.push({ dir, cell: cells[nr][nc] });
    }

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const { dir, cell } = candidates[Math.floor(random() * candidates.length)];
    current.walls[dir.wall] = false;
    cell.walls[dir.opposite] = false;
    cell.visited = true;
    stack.push(cell);
  }

  return cells;
}

function solve(cells, cols, rows) {
  const start = cells[0][0];
  const goal = cells[rows - 1][cols - 1];
  const queue = [start];
  const cameFrom = new Map([[`0,0`, null]]);
  const visited = new Set(["0,0"]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === goal) {
      const path = [];
      let key = `${current.row},${current.col}`;
      while (key !== null) {
        const [r, c] = key.split(",").map(Number);
        path.push(cells[r][c]);
        key = cameFrom.get(key);
      }
      return path.reverse();
    }

    for (const dir of DIRECTIONS) {
      if (current.walls[dir.wall]) continue;
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      cameFrom.set(key, `${current.row},${current.col}`);
      queue.push(cells[nr][nc]);
    }
  }

  return [];
}

function render(cells, cols, rows, path, random) {
  const onPath = new Set(path.map((c) => `${c.row},${c.col}`));
  const grid = Array.from({ length: rows * 2 + 1 }, () =>
    Array.from({ length: cols * 2 + 1 }, () => " "),
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const y = r * 2 + 1;
      const x = c * 2 + 1;
      const isStart = r === 0 && c === 0;
      const isGoal = r === rows - 1 && c === cols - 1;
      grid[y][x] = isStart ? "S" : isGoal ? "E" : onPath.has(`${r},${c}`) ? "*" : random() < 0.12 ? "." : " ";
      if (cell.walls[0]) grid[y - 1][x] = "###"[Math.floor(random() * 3)];
      if (cell.walls[1]) grid[y][x + 1] = "###"[Math.floor(random() * 3)];
      if (cell.walls[2]) grid[y + 1][x] = "###"[Math.floor(random() * 3)];
      if (cell.walls[3]) grid[y][x - 1] = "###"[Math.floor(random() * 3)];
    }
  }

  return grid.map((line) => line.join("")).join("\n");
}

function parseArgs(argv) {
  const options = { cols: 21, rows: 11, seed: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--seed") {
      const value = Number(argv[++i]);
      options.seed = Number.isFinite(value) ? value >>> 0 : null;
      continue;
    }
    if (arg.startsWith("--seed=")) {
      const value = Number(arg.slice(7));
      options.seed = Number.isFinite(value) ? value >>> 0 : null;
      continue;
    }
    if (arg.startsWith("--cols=")) {
      options.cols = Number(arg.slice(7));
      continue;
    }
    if (arg.startsWith("--rows=")) {
      options.rows = Number(arg.slice(7));
      continue;
    }
  }
  options.cols = Math.min(Math.max(Math.trunc(options.cols) || 21, 3), 201);
  options.rows = Math.min(Math.max(Math.trunc(options.rows) || 11, 3), 101);
  return options;
}

function main() {
  const { cols, rows, seed } = parseArgs(process.argv.slice(2));
  const resolvedSeed = seed ?? Math.floor(Math.random() * 2 ** 32);
  const random = mulberry32(resolvedSeed);

  const cells = createMaze(cols, rows, random);
  const path = solve(cells, cols, rows);

  console.log(`graine : ${resolvedSeed}`);
  console.log(`${cols}x${rows} cases | ${cols * rows - 1} passages | solution : ${path.length - 1} pas\n`);
  console.log(render(cells, cols, rows, path, random));
}

main();
