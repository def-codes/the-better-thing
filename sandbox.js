// let's look at the diffs in a file as it changes
// but also interpret it as expressions

a = watch("some/file.js");

changes = a.filter(_ => _.type === "change");

filename = changes.map(_ => _.path);
// you could make this implicit, at least for map
// filename = (_ => _.path)(changes);

contents = filename.map(readfile, "utf8"); // <- I think we can make utf8 default
// contents = readfile(filename);

pairs = contents.partition(2, -1);
diffs = pairs.map(([a, b]) => diff_text(a, b));

expressions = contents.map(read_expressions);
// expressions = read_expressions(contents);

a.entails.http_server({ port });
a.entails.socket_server({ port });
