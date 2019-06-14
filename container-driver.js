(function() {
  const CONTAINER_DRIVER = {
    claims: q(
      "Container isa Class",
      "contains domain Container",
      // Special name for the thing associated with a dom root.
      "@host isa Container"
    ),
    rules: [
      // how does the container *itself* get created in the first place?
      //
      {
        when: q("?something isa Container"),
        then({ something }, system) {
          system.register(something, "Container", () => {
            // need to get *its* parent?
            const ele = root.appendChild(document.createElement("div"));
            ele.classList.add("Container");
          });
        }
      },
      {
        when: q(
          "?container contains ?content",
          "?parent implements ?container",
          "?parent as Container"
        ),
        then({ container, content, parent }, system) {
          system.register(content, "Containee", () => {
            // Here we also want to assert that the item or items in content
            // have a representation in this container.
            //
            // problem.  if the content is a stream, then we need to get its
            // implementation.... which is what we're defining here.
            //
            const root = system.find(parent);
            // how to drive this from userland?
            // and how to get any other types on here, i.e. space or document?
            // problem with doing hdom is that
            const child = root.appendChild(document.createElement("div"));
            child.setAttribute("data-containee", item.value);
            return child;
          });
        }
      },
      {
        when: q("?layer targetsWHAT ?WHAT", "?thing targetsPart ?selector"),
        then({}, system) {
          // stream transform
          // assumes input is the output from an updatedom
          //
        }
      }
    ]
  };

  if (meld) meld.register_driver(CONTAINER_DRIVER);
  else console.warn("No meld system found!");
})();

// define and service a vocabulary for dom containment

// this is not about models, or resources, or representations.
//
// it just allows you to talk about where things should live
//
// grouping representations.
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
