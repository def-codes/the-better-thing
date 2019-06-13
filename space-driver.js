// should these be here or in layers?
const thing_position_css = space_id => ({ id, x, y }) =>
  `#${space_id} [data-thing="${id}"]{top:${y}px;left:${x}px}`;

const things_position_css = (space_id, things) =>
  [...tx.map(thing_position_css(space_id), things)].join("\n");

function position_things(style_ele, space_id, things) {
  style_ele.innerHTML = things_position_css(space_id, things);
}

const angle_of = (x, y) =>
  x === 0 ? (y < 0 ? 0 : Math.PI) : Math.atan(y / x) + (x < 0 ? Math.PI : 0);

const angle_between = (x1, y1, x2, y2) => angle_of(x2 - x1, y2 - y1);
const hypotenuse = (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

const property_placement_css = ({ triple, source, target, layer_id }) => {
  const [s, p, o] = triple;
  const selector = `#${layer_id} [data-subject="${s.value}"][data-object="${
    o.value
  }"]`;
  const { x: x1, y: y1 } = source;
  const { x: x2, y: y2 } = target;
  const top = y1.toFixed(2);
  const left = x1.toFixed(2);
  const width = (hypotenuse(x2 - x1, y2 - y1) || 1).toFixed(2);
  const angle = angle_between(x1, y1, x2, y2).toFixed(2);

  // The second translate is useful if you have a property in each
  // direction between two nodes.  More than that would be hard.
  return `${selector}{width:${width}px;transform: translate(${left}px,${top}px) rotate(${angle}rad) translateY(-50%);}`;
};

const SPACE_DRIVER = {
  claims: q(
    "Space isa Class"
    // properties of space??
  ),
  rules: []
};

if (meld) meld.register_driver(SPACE_DRIVER);
else console.warn("No meld system found!");
