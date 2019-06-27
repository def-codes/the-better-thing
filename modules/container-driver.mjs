// two-level container semantics.  A Container is contained by the host, which
// is a singleton.  Everything else can be contained in one of those.

(function() {
  const contains = rdf.namedNode("contains");
  const CONTAINER_DRIVER = {
    claims: q("Container isa Class", "contains domain Container"),
    rules: [
      {
        when: q(
          "?container contains ?something",
          "?parent implements ?container",
          "?parent as Container",
          "?source implements ?something",
          "?source as Subscribable"
        ),
        then({ source, parent }, system) {
          const element = system.find(parent);
          console.log(`source, parent`, source, parent);

          // assert that the items belonging to the collection are also
          // contained by the container.
          system.find(source).transform(
            tx.sideEffect(things => {
              system.store.into(
                tx.map(target => [source, contains, target], things)
              );
            })
          );
        }
      }

      // {
      //   when: q("?something isa Container"),
      //   then({ something }, system) {
      //     system.register(something, "Container", () => {
      //       //console.log(`REGISTERING CONTAINER FOR`, something);
      //       const frag = document.createElement("div");
      //       system.dom_root.appendChild(frag);
      //       return frag;
      //     });
      //   }
      // }
      // {
      //   when_all: q(
      //     "?container contains ?item",
      //     "?parent implements ?container",
      //     "?parent as Container"
      //   ),
      //   then({ container, parent, content, source }, system) {
      //     system.register(content, "Containee", () => {
      //       // how to drive this from userland?
      //       // and how to get any other types on here, i.e. space or document?`
      //       // problem with doing hdom is that
      //       const child = root.appendChild(document.createElement("div"));
      //       child.setAttribute("data-containee", item.value);
      //       return child;
      //     });
      //   }
      // },
    ]
  };

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

  if (meld) meld.register_driver(CONTAINER_DRIVER);
  else console.warn("No meld system found!");
})();
