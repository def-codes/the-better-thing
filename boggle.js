// =============================================================== (WORD) TRIE

function make_trie() {
  const trie = {};

  return {
    data: trie, // for debug
    add(word) {
      let target = trie;
      for (const letter of word) {
        if (!(letter in target)) target[letter] = { count: 0 };
        target = target[letter];
      }
      target.count++;
    },
    get(word) {
      let target = trie;
      for (const letter of word)
        if (letter in target) target = target[letter];
        else return false;
      return target.count;
    },
    scan: function*(sequence) {
      let target = trie;
      for (const token of sequence) {
        if (target && token in target) target = target[token];
        else target = undefined;
        yield [token, target];
      }
    }
  };
}

const get_word_list = async () => {
  const raw = await fetch("./words.json");
  return raw.json();
};

// memoized async
const get_trie = (function() {
  let trie;
  return async () => {
    if (!trie) {
      trie = make_trie();
      const word_list = await get_word_list();
      for (let word of word_list) trie.add(word);
    }
    return trie;
  };
})();

// ============================================= BOGGLE STUFF

const FACES = Array.from(
  "aaaaaaaabbbccccdddddeeeeeeeeeeeeffffgggghhhhiiiiiiiijjkklllllllllmmmmmnnnnnnooooooooooppppprrrrrrrsssssssssstttttttuuuuuuuvvwwwxyyyyz"
).concat(["qu", "th", "in", "he"]);

const BOARD_SIZE = { rows: 10, cols: 10 };
const MIN_WORD_LENGTH = 7;
const MAX_WORD_LENGTH = 100;

function* combinations(as, bs) {
  for (let a of as) for (let b of bs) yield [a, b];
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

function* iterate_paths(graph, queue, should_stop, get_moves) {
  while (queue.length > 0) {
    const path = queue.pop();
    yield path;
    if (!should_stop(path))
      queue.push(...tx.map(next => [...path, next], get_moves(path)));
  }
}

function* iterate_solutions(graph, is_solution, should_stop) {
  const gen = iterate_paths(
    graph,
    Object.keys(graph.nodes).map(n => [n]),
    should_stop,
    path => graph.edges[path[path.length - 1]].filter(id => !path.includes(id))
  );

  for (const path of gen) if (is_solution(path)) yield path;
}

/* board generator */

const random_integer_less_than = n => Math.floor(Math.random() * n);
const random_item_from = array => array[random_integer_less_than(array.length)];

const random_face = () => random_item_from(FACES);
const random_board = size => ({
  nodes: tx.transduce(
    tx.mapIndexed((idx, val) => [idx, val]),
    tx.assocObj(),
    tx.repeatedly(random_face, size.rows * size.cols)
  ),
  edges: tx.transduce(
    tx.map(n => [n, neighbors_of_index(size, n)]),
    tx.assocObj(),
    tx.range(size.rows * size.cols)
  )
});

function solve(trie, graph) {
  const uniques = new Set();
  const solutions = [];

  const and = (a, b) => !!(a && b);
  const or = (a, b) => !!(a || b);
  const and_all = (...args) => args.reduce(and);

  const lookup = i => graph.nodes[i];
  const make_word = path => path.map(lookup).join("");
  const is_word = path => trie.get(make_word(path)) > 0;
  // But this is *path* length, not *word* length
  const not_too_long = path => path.length <= MAX_WORD_LENGTH;
  const not_too_short = path => path.length >= MIN_WORD_LENGTH;
  const solution_clauses = [is_word, not_too_long, not_too_short];
  const is_solution = path => and_all(...solution_clauses.map(fn => fn(path)));
  // const is_solution = path => clauses.every(fn => fn(path));

  const is_not_prefix = path => trie.get(make_word(path)) === false;
  const is_max_length = path => path.length >= MAX_WORD_LENGTH;
  // Doesn't short circuit... computes both always
  const should_stop = path => or(is_max_length(path), is_not_prefix(path));

  const all_solutions = [...iterate_solutions(graph, is_solution, should_stop)];

  for (let path of all_solutions) {
    const word = make_word(path);
    if (!uniques.has(word)) {
      uniques.add(word);
      solutions.push([path, word]);
    }
  }

  return solutions;
}
