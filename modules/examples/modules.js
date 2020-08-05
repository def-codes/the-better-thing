define([], () => {
  return {
    "@graph": [
      {
        "@id": "<localhost>/module-A",
        "https://def.codes/depends_on": [
          "<localhost>/module-B",
          "<localhost>/module-D",
        ],
      },
      {
        "@id": "<localhost>/module-B",
        "https://def.codes/depends_on": [
          "<localhost>/module-C",
          "<localhost>/module-D",
        ],
      },
      {
        "@id": "<localhost>/module-C",
        "https://def.codes/depends_on": ["<localhost>/module-D"],
      },
      {
        "@id": "<localhost>/module-D",
      },
    ],
  };
});
