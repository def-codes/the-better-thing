// Support representations that act as coordinate spaces with positioned content.

// Suspiciously similar to that of d3 nodes
type Bodies = readonly { id: string; x: number; y: number }[];

const style = (scope: string, bodies: Bodies) =>
  bodies
    .map(_ => `${scope} [resource="${_.id}"] { --x: ${_.x}; --y: ${_.y};  }`)
    .join("\n");

const bodies_to_position_style = (scope: string) => (bodies: Bodies) => ({
  element: "style",
  children: [style(scope, bodies)],
});

export default {
  name: "spaceDriver",
  init: ({ q, rdf: { namedNode: n, literal: l } }) => {
    return {
      claims: q(),
      rules: [
        {
          name: "PositionSpaceContent",
          when: q("?space isa Space"),
          then: ({ space }) => {
            const styles = n(`${space.value}$styles`);
            const stylexform = n(`${space.value}$stylesxform`);

            return {
              assert: [
                [styles, n("emitsTemplatesFor"), space],
                [styles, n("transformsWith"), stylexform],
                [
                  stylexform,
                  n("mapsWith"),
                  l(bodies_to_position_style(`[resource=${space.value}]`)),
                ],
              ],
            };
          },
        },
      ],
    };
  },
};
