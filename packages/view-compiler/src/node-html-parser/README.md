Original: [node-html-parser](https://www.npmjs.com/package/node-html-parser)

# Patch

This local copy of the above mentioned library includes a small patch to html.ts which modifies the regular expression
used to parse attributes to allow for attributes with special symbols in their names to be parsed correctly which is
required for uix.js views.
