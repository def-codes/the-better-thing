# Persistent runtime environment

“Live programming,” which eschews the familiar compile-and-run cycle, is the
standard practice in some computing environments, such as those based on Lisp,
Erlang, and Smalltalk.  However, despite the demonstrated advantages of working
in a continuous execution context, destroy-the-world workflows remain prevalent
for many programming platforms.  In web browsers especially, the “Reload” button
hangs over every running script like a sword of Damocles.  This condition
undoubtedly constrains the sense of longevity in browser-based programs.  While
“hot reload” mechanisms have become a common feature of so-called development
servers, they are merely a patch on existing systems.  “Reload”-based solutions
underscore rather than address the fundamental design problem that we lack a
first-class way to express intentions about changing definitions in a
long-running process.

To turn this worldview on its head, we must consider a permanent runtime the
default.

