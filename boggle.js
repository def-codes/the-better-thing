const { transducers: tx, rstream: rs, hdom } = thi.ng;
const { updateDOM } = thi.ng.transducersHdom;
console.log(`thi.ng`, thi.ng);

const FACES = Array.from(
  "aaaaaaaabbbccccdddddeeeeeeeeeeeeffffgggghhhhiiiiiiiijjkklllllllllmmmmmnnnnnnooooooooooppppprrrrrrrsssssssssstttttttuuuuuuuvvwwwxyyyyz"
).concat(["qu", "th", "in", "he"]);

const BOARD_SIZE = { rows: 10, cols: 10 };
const MIN_WORD_LENGTH = 8;
const MAX_WORD_LENGTH = 100;

function* combinations(as, bs) {
  for (let a of as) for (let b of bs) yield [a, b];
}

// this is basically a state machine where each node is a state.
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

function path_search_step(state) {}

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
    graph.nodes.map((_, n) => [n]),
    should_stop,
    path => graph.edges[path[path.length - 1]].filter(id => !path.includes(id))
  );

  for (const path of gen) if (is_solution(path)) yield path;
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
  const trie = make_trie();
  for (let word of WORD_LIST) trie.add(word);

  const graph = random_board(BOARD_SIZE);
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

  return { trie, graph, solutions };
}

//=================

const SVGNS = "http://www.w3.org/2000/svg";

const dom_svg_space = () => [
  "div.space",
  ["div.html"],
  // is preserveAspectRatio needed?
  ["svg", { preserveAspectRatio: "none" }]
];

function force(container, paths_container, graph, solutions) {
  const sim = d3.forceSimulation().stop();

  const nodes = graph.nodes.map((face, id) => ({ id, face }));

  const path_data = indices =>
    indices
      .map((n, i) => `${i > 0 ? "L" : "M"} ${nodes[n].x},${nodes[n].y}`)
      .join(" ");

  const links = [
    ...tx.mapcat(
      ({ id: source }) =>
        tx.map(target => ({ source, target }), graph.edges[source]),
      nodes
    )
  ];

  sim.nodes(nodes);
  sim.force("center", d3.forceCenter());
  sim.force(
    "charge",
    d3.forceManyBody().strength(node => (node.dragging ? -500 : -100))
    //.distanceMax(250)
    //.theta(0.98)
  );
  // sim.force("x", d3.forceX());
  // sim.force("y", d3.forceY());
  sim.force(
    "grid",
    d3
      .forceLink(links)
      .strength(1)
      // .distance(5)
      .iterations(2)
  );

  const res = hdom.renderOnce(
    () => [
      "div.html",
      tx.map(node => ["div.node", { "data-node": node.id }, node.face], nodes)
    ],
    { root: container }
  );

  const elements = new Map(
    Array.from(nodes, node => [
      node,
      container.querySelector(`[data-node="${node.id}"]`)
    ])
  );

  const paths = new Map();

  let search_path = [];
  // const hic2 = ["path.search", {}];
  const search_path_ele = paths_container.appendChild(
    document.createElementNS(SVGNS, "path")
  );
  search_path_ele.classList.add("search");

  for (const solution of solutions) {
    // const hic = ["path.solution", { d: "" }];
    const path = document.createElementNS(SVGNS, "path");
    path.classList.add("solution");
    paths.set(solution, path);
    paths_container.appendChild(path);
  }

  function update_positions() {
    for (const [{ x, y }, ele] of elements.entries()) {
      ele.style.top = `${y}px`;
      ele.style.left = `${x}px`;
    }

    for (const [[indices], path] of paths.entries())
      path.setAttribute("d", path_data(indices));

    search_path_ele.setAttribute("d", path_data(search_path));
  }

  const tick_driver = rs.fromRAF();
  //const tick_driver = rs.fromInterval(100);
  const ticks = tick_driver.subscribe({ next: () => sim.tick() });
  ticks.subscribe({ next: update_positions });
  // ticks.subscribe(rs.trace("tick"));

  const queue_length_ele = document.getElementById("queue-length");

  const search_queue = graph.nodes.map((_, n) => [n]);
  const paths_sub = rs.fromIterable(
    iterate_paths(
      graph,
      search_queue,
      path => path.length > 3,
      // () => false,
      path =>
        graph.edges[path[path.length - 1]].filter(id => !path.includes(id))
    ),
    1
  );

  let dragging = null;
  rs.fromEvent(container, "mousedown").transform(
    tx.sideEffect(event => {
      event.preventDefault();
      dragging = null;
      const { target } = event;
      const id = target.getAttribute("data-node");
      if (!id) return;
      const node = nodes[id];
      if (!node) return;
      node.dragging = true;
      dragging = {
        node,
        box: event.currentTarget.getBoundingClientRect()
      };
    })
  );
  rs.fromEvent(container, "mousemove").transform(
    tx.sideEffect(event => {
      event.preventDefault();
      if (!dragging) return;
      dragging.node.x = event.x - dragging.box.x;
      dragging.node.y = event.y - dragging.box.y;
      sim.restart();
      tick_driver.next();
    })
  );
  rs.fromEvent(container, "mouseup").transform(
    tx.sideEffect(event => {
      if (dragging) delete dragging.node.dragging;
      dragging = null;
      event.preventDefault();
    })
  );
  rs.fromEvent(container, "mouseleave").transform(
    tx.sideEffect(event => {
      if (dragging) delete dragging.node.dragging;
      dragging = null;
    })
  );

  paths_sub.transform(
    tx.sideEffect(path => {
      search_path = path;
      update_positions();
    }),
    tx.map(() => ["b", {}, search_queue.length.toString()]),
    updateDOM({ root: "queue-length" })
  );
}

const display_trie = (container, paths_container, trie) => {
  // a lot of the same as above
  console.log(`container, paths_container`, container, paths_container);

  const foo = [...trie.scan("exemplified")];
  console.log(`foo`, foo);

  const graph = {
    nodes: [],
    edges: {}
  };

  const nodes = graph.nodes.map((face, id) => ({ id, face }));

  const links = [
    ...tx.mapcat(
      ({ id: source }) =>
        tx.map(target => ({ source, target }), graph.edges[source]),
      nodes
    )
  ];

  const res = hdom.renderOnce(
    () => [
      "div.nodes",
      tx.map(node => ["div.node", { "data-node": node.id }, node.face], nodes)
    ],
    { root: container }
  );

  const elements = new Map(
    Array.from(nodes, node => [
      node,
      container.querySelector(`[data-node="${node.id}"]`)
    ])
  );

  function update_positions() {
    for (const [{ x, y }, ele] of elements.entries()) {
      ele.style.top = `${y}px`;
      ele.style.left = `${x}px`;
    }

    for (const [[indices], path] of paths.entries())
      path.setAttribute("d", path_data(indices));
  }

  const tick_driver = rs.fromRAF();
  //const tick_driver = rs.fromInterval(100);
  const ticks = tick_driver.subscribe({ next: () => sim.tick() });
  ticks.subscribe({ next: update_positions });
  // ticks.subscribe(rs.trace("tick"));
};

(async function() {
  const { trie, graph, solutions } = await do_it();
  console.log(`solutions`, solutions);

  display_trie(
    document.getElementById("trie-nodes"),
    document.getElementById("trie-edges"),
    trie
  );

  force(
    document.getElementById("boggle"),
    document.getElementById("boggle-paths"),
    graph,
    solutions
  );
})();
