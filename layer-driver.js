// layers are for containing/grouping representations.
// layer driver is mainly about giving out containers
// for separating representations

// this is where updatedom would be done

// the things being represented are always resources and properties

// what are the terms related to layers?
// what are the rules related to layers?
// what implements layers? dom nodes I guess
// is a dom node a class? does it matter at all?

// supports document-style
// representations even when there is no space support

// depends on model driver (I think)
// and maybe rules

function special_code_for_layers() {
  // LAYER for representation of a set of resources
  const resources_container = container.appendChild(
    document.createElement("div")
  );

  // maintain representations of a set of resources in a given LAYER
  rs.sync({
    src: { store: model_store, resources },
    id: `${model_id}-store-and-resources`
  }).transform(
    tx.map(({ store, resources }) => [
      render_resource_nodes,
      { store, resources }
    ]),
    updateDOM({ root: resources_container })
  );

  // LAYER for representation of a set of properties obtaining between resources
  const properties_container = container.appendChild(
    document.createElement("div")
  );

  // passive styling of resource representations
  const nodes_style = container.appendChild(document.createElement("style"));

  // passive styling of property representations
  const properties_style = container.appendChild(
    document.createElement("style")
  );

  // maintain representations of the properties between a set of resources in a given LAYER
  properties.transform(
    tx.map(properties_to_show => [render_properties, properties_to_show]),
    updateDOM({ root: properties_container })
  );
}

const LAYERS_DRIVER = {
  claims: q(
    "Layer isa Class"
    // properties of layers??
  ),
  rules: [
    {
      when: q("?layer isa Layer"),
      then({ layer }, system) {
        const layer_instance = system.find(layer);

        // find the existing instance
        // make dom node, subscription
      }
    }
  ]
};

if (meld) meld.register_driver(LAYERS_DRIVER);
else console.warn("No meld system found!");
