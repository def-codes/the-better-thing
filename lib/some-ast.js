// https://prettier.io/playground/#N4Igxg9gdgLgprEAuEcAeAHCAnGACSKAZ3wGUIBbOAFQAsBLKAczyT3KoHEE5t6xqATwxwAPAB0oAeil4AErzh56RPAEMClKrDwB3WorwBJAOQU8MNQBsA1oxZqARhACu+GAYvCla7ExfaMKqOcPZ4LkRwACZ4BthwkhxwRrC8AGZqYEoAZOyUcADyHrwp8NgZWXi5AJpwMACCUBDF2KXpmTnsMPRWVgVQcACyOMmp5R2SAHx4ALzqfqoz08AAvgDcIAA0IBAY3dBEyKC+2BC6AAq+CIcoagBuEPRRWyCO2Jk2daQYmfbIMNgXHBtrQYBQrAB1BjwIg-LKka70bp3JGCZDgIiHbaMSK4c7vJgUNTIDJWSLbABWRDQACF3mBPjBSGoqAAZRhwEnWckgKloUj2KxwACKLmanKQpJ5P2wuPRMG8RDAfD2LwwfFgEKeHmQAA4AAzbdUQSIQ94YdHquC4u6c7YARzF8HxuxuIDURAAtANotEXvFHfR4vi1ITiZLucCQJEKPR-oCo0RBSKnRKpVHLI4tVEdUgAEzbAFqHr2ADCWnDICaAxeERoThu6e2dyBKSiCCZyvoe0aUVICqFXLJcBWKyAA
exports.some_ast = {
  type: "Program",
  body: [
    {
      type: "ExportNamedDeclaration",
      declaration: {
        type: "VariableDeclaration",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: "SomeThing",
              range: [13, 204],
              loc: {
                start: { line: 1, column: 13 },
                end: { line: 4, column: 1 },
              },
              typeAnnotation: {
                type: "TSTypeAnnotation",
                loc: {
                  start: { line: 1, column: 23 },
                  end: { line: 4, column: 1 },
                },
                range: [23, 204],
                typeAnnotation: {
                  type: "TSTypeReference",
                  typeName: {
                    type: "Identifier",
                    name: "SomeGenericType",
                    range: [25, 40],
                    loc: {
                      start: { line: 1, column: 25 },
                      end: { line: 1, column: 40 },
                    },
                  },
                  typeParameters: {
                    type: "TSTypeParameterInstantiation",
                    range: [40, 204],
                    loc: {
                      start: { line: 1, column: 40 },
                      end: { line: 4, column: 1 },
                    },
                    params: [
                      {
                        type: "TSIntersectionType",
                        types: [
                          {
                            type: "TSTypeReference",
                            typeName: {
                              type: "Identifier",
                              name: "SomeInterface",
                              range: [122, 135],
                              loc: {
                                start: { line: 3, column: 0 },
                                end: { line: 3, column: 13 },
                              },
                            },
                            range: [122, 135],
                            loc: {
                              start: { line: 3, column: 0 },
                              end: { line: 3, column: 13 },
                            },
                          },
                          {
                            type: "TSTypeReference",
                            typeName: {
                              type: "Identifier",
                              name: "SomeOtherInterface",
                              range: [138, 156],
                              loc: {
                                start: { line: 3, column: 16 },
                                end: { line: 3, column: 34 },
                              },
                            },
                            range: [138, 156],
                            loc: {
                              start: { line: 3, column: 16 },
                              end: { line: 3, column: 34 },
                            },
                          },
                          {
                            type: "TSTypeReference",
                            typeName: {
                              type: "Identifier",
                              name: "YetAnotherInterface",
                              range: [159, 178],
                              loc: {
                                start: { line: 3, column: 37 },
                                end: { line: 3, column: 56 },
                              },
                            },
                            range: [159, 178],
                            loc: {
                              start: { line: 3, column: 37 },
                              end: { line: 3, column: 56 },
                            },
                          },
                          {
                            type: "TSTypeReference",
                            typeName: {
                              type: "Identifier",
                              name: "StillOneMoreInterface",
                              range: [181, 202],
                              loc: {
                                start: { line: 3, column: 59 },
                                end: { line: 3, column: 80 },
                              },
                            },
                            range: [181, 202],
                            loc: {
                              start: { line: 3, column: 59 },
                              end: { line: 3, column: 80 },
                            },
                          },
                        ],
                        range: [122, 202],
                        loc: {
                          start: { line: 3, column: 0 },
                          end: { line: 3, column: 80 },
                        },
                      },
                    ],
                  },
                  range: [25, 204],
                  loc: {
                    start: { line: 1, column: 25 },
                    end: { line: 4, column: 1 },
                  },
                },
              },
            },
            init: {
              type: "ArrowFunctionExpression",
              generator: false,
              id: null,
              params: [
                {
                  type: "Identifier",
                  name: "args",
                  range: [207, 211],
                  loc: {
                    start: { line: 4, column: 4 },
                    end: { line: 4, column: 8 },
                  },
                },
              ],
              body: {
                type: "BlockStatement",
                body: [],
                range: [215, 217],
                loc: {
                  start: { line: 4, column: 12 },
                  end: { line: 4, column: 14 },
                },
              },
              async: false,
              expression: false,
              range: [207, 217],
              loc: {
                start: { line: 4, column: 4 },
                end: { line: 4, column: 14 },
              },
            },
            range: [13, 217],
            loc: {
              start: { line: 1, column: 13 },
              end: { line: 4, column: 14 },
            },
          },
        ],
        kind: "const",
        range: [7, 218],
        loc: {
          start: { line: 1, column: 7 },
          end: { line: 4, column: 15 },
        },
      },
      specifiers: [],
      source: null,
      range: [0, 218],
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 4, column: 15 },
      },
    },
  ],
  sourceType: "module",
  range: [0, 218],
  loc: {
    start: { line: 1, column: 0 },
    end: { line: 4, column: 15 },
  },
  comments: [
    {
      type: "Line",
      value:
        " Here is a comment where I'm talking about the type arguments being used here",
      range: [42, 121],
      loc: {
        start: { line: 2, column: 0 },
        end: { line: 2, column: 79 },
      },
    },
  ],
};
