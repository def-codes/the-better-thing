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
function* iterate_paths(board) {
  const entry = i => board.cubes[i];
  // queue initial entry for each initial position
  const queue = board.cubes.map((_, n) => [n]);
  while (queue.length > 0) {
    const path = queue.pop();
    const word = path.map(entry).join("");
    const prune = yield [path, word];
    if (!prune) {
      const index = path[path.length - 1];
      for (let neighbor of neighbors_of_index(board.size, index))
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

function text_display(board) {
  const cubes = board.cubes.slice();
  const parts = [];
  while (cubes.length) parts.push(cubes.splice(0, board.size.cols).join(" "));
  return parts.join("\n");
}

/* board generator */

const repeatedly = function*(fn) {
  while (true) yield fn();
};

const take = n =>
  function*(seq) {
    for (const item of seq) {
      yield item;
      if (!n--) break;
    }
  };

const random_integer_less_than = n => Math.floor(Math.random() * n);
const random_item_from = array => array[random_integer_less_than(array.length)];

const random_face = () => random_item_from(FACES);
const random_board = size => ({
  size,
  cubes: [...take(size.rows * size.cols)(repeatedly(random_face))]
});

/* do it */

(async function() {
  const words = await fetch("./words.json");
  const WORD_LIST = await words.json();
  //return;
  const dict = make_trie();
  for (let word of WORD_LIST) dict.add(word);
  // digraph_content();
  //console.log(JSON.stringify(dict.data, "  "));

  //const board = state.board || (state.board = random_board(BOARD_SIZE));
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
  //console.log("/*");
  console.log(solutions);
  console.log(text_display(board));
  //console.log("*/");
  //process.stdout.(digraph_from(board, solutions));
})();

//=================
const container = document.getElementById("boggle");
const blog = s =>
  (container.appendChild(document.createElement("p")).innerHTML = s);
blog("henry kissinger");
