const { transducers: tx, rstream: rs } = thi.ng;

const FACES = Array.from(
  "aaaaaaaabbbccccdddddeeeeeeeeeeeeffffgggghhhhiiiiiiiijjkklllllllllmmmmmnnnnnnooooooooooppppprrrrrrrsssssssssstttttttuuuuuuuvvwwwxyyyyz"
).concat(["qu", "th", "in", "he"]);

const BOARD_SIZE = { rows: 10, cols: 7 };
const MIN_WORD_LENGTH = 8;
const MAX_WORD_LENGTH = 100;

function* combinations(as, bs) {
  for (let a of as) for (let b of bs) yield [a, b];
}

function make_trie() {
  const trie = {};

  return {
    data: trie, // for debug
    add(word) {
      let target = trie;
      for (let letter of word) {
        if (!(letter in target)) target[letter] = { count: 0 };
        target = target[letter];
      }
      target.count++;
    },
    get(word) {
      let target = trie;
      for (let letter of word)
        if (letter in target) target = target[letter];
        else return false;
      return target.count;
    }
  };
}

const NEIGHBOR_DELTAS = [...combinations([-1, 0, 1], [-1, 0, 1])].filter(
  ([a, b]) => !(a === 0 && b === 0)
);

const between = (x, min, max) => x >= min && x <= max;

const row_of = (size, index) => Math.floor(index / size.cols);
const col_of = (size, index) => index % size.cols;
const index_of = (size, row, col) => row * size.cols + col;

const neighbors_of = (size, row, col) =>
  NEIGHBOR_DELTAS.map(([dr, dc]) => [row + dr, col + dc]).filter(
    ([row, col]) =>
      between(row, 0, size.rows - 1) && between(col, 0, size.cols - 1)
  );
const neighbors_of_index = (size, index) =>
  neighbors_of(size, row_of(size, index), col_of(size, index)).map(
    ([row, col]) => index_of(size, row, col)
  );

/** A depth-first search for boggle paths */
function* iterate_paths(graph) {
  const entry = i => graph.nodes[i];
  // queue initial entry for each initial position
  const queue = graph.nodes.map((_, n) => [n]);
  while (queue.length > 0) {
    const path = queue.pop();
    const word = path.map(entry).join("");
    const prune = yield [path, word];
    if (!prune) {
      const index = path[path.length - 1];
      for (const neighbor of graph.edges[index])
        if (!path.includes(neighbor)) queue.push([...path, neighbor]);
    }
  }
}

function* iterate_solutions(board, dict, { min_word_length, max_word_length }) {
  const gen = iterate_paths(board);
  let { value, done } = gen.next();
  while (!done) {
    const [path, word] = value;
    const { length } = word;
    const entry = dict.get(word);
    if (between(length, min_word_length, max_word_length) && entry > 0)
      yield value;
    let prune = length >= max_word_length || entry === false;
    const next = gen.next(prune);
    value = next.value;
    done = next.done;
  }
}

/* display */
/*
function text_display(board) {
  const cubes = board.cubes.slice();
  const parts = [];
  while (cubes.length) parts.push(cubes.splice(0, board.size.cols).join(" "));
  return parts.join("\n");
}
*/

/* board generator */

const repeatedly = function*(fn) {
  while (true) yield fn();
};

const take = n =>
  function*(seq) {
    for (const item of seq) {
      if (!n--) break;
      yield item;
    }
  };

const random_integer_less_than = n => Math.floor(Math.random() * n);
const random_item_from = array => array[random_integer_less_than(array.length)];

const random_face = () => random_item_from(FACES);
const random_board = size => ({
  nodes: [...take(size.rows * size.cols)(repeatedly(random_face))],
  edges: [
    ...tx.map(n => neighbors_of_index(size, n), tx.range(size.rows * size.cols))
  ]
});

async function do_it() {
  const words = await fetch("./words.json");
  const WORD_LIST = await words.json();
  const dict = make_trie();
  for (let word of WORD_LIST) dict.add(word);

  const board = random_board(BOARD_SIZE);
  const uniques = new Set();
  const solutions = [];
  const all_solutions = Array.from(
    iterate_solutions(board, dict, {
      min_word_length: MIN_WORD_LENGTH,
      max_word_length: MAX_WORD_LENGTH
    })
  );
  for (let solution of all_solutions) {
    const [path, word] = solution;
    if (!uniques.has(word)) {
      uniques.add(word);
      solutions.push(solution);
    }
  }

  return { board, solutions };
}

//=================

async function force(container, paths_container) {
  const { board, solutions } = await do_it();
  console.log(`solutions`, solutions);

  const sim = d3.forceSimulation().stop();

  const nodes = board.nodes.map((face, id) => ({ id, face }));

  const links = [
    ...tx.mapcat(
      ({ id: source }) =>
        tx.map(target => ({ source, target }), board.edges[source]),
      nodes
    )
  ];

  sim.nodes(nodes);
  sim.force("center", d3.forceCenter());
  sim.force("charge", d3.forceManyBody().strength(-100));
  // sim.force("x", d3.forceX());
  // sim.force("y", d3.forceY());
  sim.force("grid", d3.forceLink(links).strength(1));

  const elements = new Map();
  const paths = new Map();
  for (const node of nodes) {
    const ele = document.createElement("div");
    ele.innerHTML = node.face;
    ele.classList.add("node");
    container.appendChild(ele);
    elements.set(node, ele);
  }
  const SVGNS = "http://www.w3.org/2000/svg";

  for (const solution of solutions) {
    const path = document.createElementNS(SVGNS, "path");
    paths.set(solution, path);
    paths_container.appendChild(path);
  }

  function next() {
    sim.tick();
    for (const [{ x, y }, ele] of elements.entries())
      ele.style.transform = `translate(${x}px,${y}px)`;

    for (const [[indices], path] of paths.entries()) {
      const d = indices
        .map((n, i) => `${i > 0 ? "L" : "M"} ${nodes[n].x},${nodes[n].y}`)
        .join(" ");
      path.setAttribute("d", d);
    }
  }
  rs.fromRAF().subscribe({ next });
}

force(
  document.getElementById("boggle"),
  document.getElementById("boggle-paths")
);
