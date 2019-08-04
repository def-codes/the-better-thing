# Portability

This package is about creating dynamic, self-contained HTML files.

(provisional)

Provides several pieces
- a facility for “saving” the document in its current state
  - including revisions to contenteditable
  - including revisions to dom made by scripts
- facilities for “inlining” external resources
  - including stylesheets
  - including scripts --- with a bunch of caveats, see below
  - including SVG images (when I get around to it)
- (provisional) provides pre-save protocol that modules can use to extend save
  behavior

Ideally things would “just work” with the browser's native save feature.  This
can't be, for a few reasons:
- At least Firefox won't include changes to the DOM
- it appears Edge doesn't have a Save feature??  I couldn't find it anyway.

## Motivation

First we need to define “portable” for this purpose.  Maybe “persistent” or
“persistable” is a better word.

The project description motivates the need for a number of humane properties,
including portability.  In general, a web server is overkill for many purposes.
According to the “principle of least power,” a standalone HTML page should be
preferred when possible.

## Notes

### Constraints

Everything in the portability mechanism has to be self-contained.

Assume an AMD loader.


### Scripts
### Stylesheets
### Images

Inine all external scripts and stylesheets

For saving:
- will need to provide a special download facility (link blob, etc)

For styles, you can recover the text (unlike script, from what I see so far),
but the default built-in save won't respect changes of this kind.  That is,
it'll save the page with the links that were there when originally loaded, not
whatever's there now.  Apparently FF “used to” do this.  Edge, funny story,
doesn't seem to have a “Save page” option at all.  (Of course, the styles don't
work, either.)

In hosted mode:
- can fetch scripts and embed them

In standalone mode:
- need to inline and shim an AMD loader *beforehand*

