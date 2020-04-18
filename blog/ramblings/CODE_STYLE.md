Code style

namespaces          `PascalCase`
classes             `PascalCase`
data structures     `PascalCase`
Macros              `SCREAMING_CASE`
global variables    `SCREAMING_CASE`
methods             `camelCase`
pure functions      `snake_case`
local variables     `snake_case`
private variables   `_prefixed_snake_case`
constants           no visual distinction
directories         `kebab-case`
vectors (glsl)      single capital letters

MOST IMPORTANT:
* It is important to use snake_case on a function if and only if that function is pure.
  If any function violates this, it's a bug. 
  We absolutely need the ability to quickly identify functional purity. 
  We need to know what we can trust.
* Contants have no particular convention, their case is determined by other properties. 
  Globals on the other hand require SCREAMING_CASE. 
  Constants are good, globals are evil. 
