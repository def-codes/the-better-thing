

// This is what the “actual” JS object would look like.
a = {
  label: "foo",
  // just a subscription w/no transform
  messages: port(),
  state: ticker(1000)
}
