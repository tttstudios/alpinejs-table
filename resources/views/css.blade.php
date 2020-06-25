/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

/* Document
   ========================================================================== */

/**
 * 1. Correct the line height in all browsers.
 * 2. Prevent adjustments of font size after orientation changes in iOS.
 */

html {
  line-height: 1.15; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
}

/* Sections
   ========================================================================== */

/**
 * Remove the margin in all browsers.
 */

body {
  margin: 0;
}

/**
 * Render the `main` element consistently in IE.
 */

main {
  display: block;
}

/**
 * Correct the font size and margin on `h1` elements within `section` and
 * `article` contexts in Chrome, Firefox, and Safari.
 */

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

/* Grouping content
   ========================================================================== */

/**
 * 1. Add the correct box sizing in Firefox.
 * 2. Show the overflow in Edge and IE.
 */

hr {
  box-sizing: content-box; /* 1 */
  height: 0; /* 1 */
  overflow: visible; /* 2 */
}

/**
 * 1. Correct the inheritance and scaling of font size in all browsers.
 * 2. Correct the odd `em` font sizing in all browsers.
 */

pre {
  font-family: monospace, monospace; /* 1 */
  font-size: 1em; /* 2 */
}

/* Text-level semantics
   ========================================================================== */

/**
 * Remove the gray background on active links in IE 10.
 */

a {
  background-color: transparent;
}

/**
 * 1. Remove the bottom border in Chrome 57-
 * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
 */

abbr[title] {
  border-bottom: none; /* 1 */
  text-decoration: underline; /* 2 */
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted; /* 2 */
}

/**
 * Add the correct font weight in Chrome, Edge, and Safari.
 */

b,
strong {
  font-weight: bolder;
}

/**
 * 1. Correct the inheritance and scaling of font size in all browsers.
 * 2. Correct the odd `em` font sizing in all browsers.
 */

code,
kbd,
samp {
  font-family: monospace, monospace; /* 1 */
  font-size: 1em; /* 2 */
}

/**
 * Add the correct font size in all browsers.
 */

small {
  font-size: 80%;
}

/**
 * Prevent `sub` and `sup` elements from affecting the line height in
 * all browsers.
 */

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/* Embedded content
   ========================================================================== */

/**
 * Remove the border on images inside links in IE 10.
 */

img {
  border-style: none;
}

/* Forms
   ========================================================================== */

/**
 * 1. Change the font styles in all browsers.
 * 2. Remove the margin in Firefox and Safari.
 */

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

/**
 * Show the overflow in IE.
 * 1. Show the overflow in Edge.
 */

button,
input { /* 1 */
  overflow: visible;
}

/**
 * Remove the inheritance of text transform in Edge, Firefox, and IE.
 * 1. Remove the inheritance of text transform in Firefox.
 */

button,
select { /* 1 */
  text-transform: none;
}

/**
 * Correct the inability to style clickable types in iOS and Safari.
 */

button,
[type="button"],
[type="reset"],
[type="submit"] {
  -webkit-appearance: button;
}

/**
 * Remove the inner border and padding in Firefox.
 */

button::-moz-focus-inner,
[type="button"]::-moz-focus-inner,
[type="reset"]::-moz-focus-inner,
[type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

/**
 * Restore the focus styles unset by the previous rule.
 */

button:-moz-focusring,
[type="button"]:-moz-focusring,
[type="reset"]:-moz-focusring,
[type="submit"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}

/**
 * Correct the padding in Firefox.
 */

fieldset {
  padding: 0.35em 0.75em 0.625em;
}

/**
 * 1. Correct the text wrapping in Edge and IE.
 * 2. Correct the color inheritance from `fieldset` elements in IE.
 * 3. Remove the padding so developers are not caught out when they zero out
 *    `fieldset` elements in all browsers.
 */

legend {
  box-sizing: border-box; /* 1 */
  color: inherit; /* 2 */
  display: table; /* 1 */
  max-width: 100%; /* 1 */
  padding: 0; /* 3 */
  white-space: normal; /* 1 */
}

/**
 * Add the correct vertical alignment in Chrome, Firefox, and Opera.
 */

progress {
  vertical-align: baseline;
}

/**
 * Remove the default vertical scrollbar in IE 10+.
 */

textarea {
  overflow: auto;
}

/**
 * 1. Add the correct box sizing in IE 10.
 * 2. Remove the padding in IE 10.
 */

[type="checkbox"],
[type="radio"] {
  box-sizing: border-box; /* 1 */
  padding: 0; /* 2 */
}

/**
 * Correct the cursor style of increment and decrement buttons in Chrome.
 */

[type="number"]::-webkit-inner-spin-button,
[type="number"]::-webkit-outer-spin-button {
  height: auto;
}

/**
 * 1. Correct the odd appearance in Chrome and Safari.
 * 2. Correct the outline style in Safari.
 */

[type="search"] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

/**
 * Remove the inner padding in Chrome and Safari on macOS.
 */

[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

/**
 * 1. Correct the inability to style clickable types in iOS and Safari.
 * 2. Change font properties to `inherit` in Safari.
 */

::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}

/* Interactive
   ========================================================================== */

/*
 * Add the correct display in Edge, IE 10+, and Firefox.
 */

details {
  display: block;
}

/*
 * Add the correct display in all browsers.
 */

summary {
  display: list-item;
}

/* Misc
   ========================================================================== */

/**
 * Add the correct display in IE 10+.
 */

template {
  display: none;
}

/**
 * Add the correct display in IE 10.
 */

[hidden] {
  display: none;
}

/**
 * Manually forked from SUIT CSS Base: https://github.com/suitcss/base
 * A thin layer on top of normalize.css that provides a starting point more
 * suitable for web applications.
 */

/**
 * Removes the default spacing and border for appropriate elements.
 */

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

button {
  background-color: transparent;
  background-image: none;
  padding: 0;
}

/**
 * Work around a Firefox/IE bug where the transparent `button` background
 * results in a loss of the default `button` focus styles.
 */

button:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

fieldset {
  margin: 0;
  padding: 0;
}

ol,
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

/**
 * Tailwind custom reset styles
 */

/**
 * 1. Use the user's configured `sans` font-family (with Tailwind's default
 *    sans-serif font stack as a fallback) as a sane default.
 * 2. Use Tailwind's default "normal" line-height so the user isn't forced
 *    to override it to ensure consistency even when using the default theme.
 */

html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 1 */
  line-height: 1.5; /* 2 */
}

/**
 * 1. Prevent padding and border from affecting element width.
 *
 *    We used to set this in the html element and inherit from
 *    the parent element for everything else. This caused issues
 *    in shadow-dom-enhanced elements like <details> where the content
 *    is wrapped by a div with box-sizing set to `content-box`.
 *
 *    https://github.com/mozdevs/cssremedy/issues/4
 *
 *
 * 2. Allow adding a border to an element by just adding a border-width.
 *
 *    By default, the way the browser specifies that an element should have no
 *    border is by setting it's border-style to `none` in the user-agent
 *    stylesheet.
 *
 *    In order to easily add borders to elements by just setting the `border-width`
 *    property, we change the default border-style for all elements to `solid`, and
 *    use border-width to hide them instead. This way our `border` utilities only
 *    need to set the `border-width` property instead of the entire `border`
 *    shorthand, making our border utilities much more straightforward to compose.
 *
 *    https://github.com/tailwindcss/tailwindcss/pull/116
 */

*,
::before,
::after {
  box-sizing: border-box; /* 1 */
  border-width: 0; /* 2 */
  border-style: solid; /* 2 */
  border-color: #e2e8f0; /* 2 */
}

/*
 * Ensure horizontal rules are visible by default
 */

hr {
  border-top-width: 1px;
}

/**
 * Undo the `border-style: none` reset that Normalize applies to images so that
 * our `border-{width}` utilities have the expected effect.
 *
 * The Normalize reset is unnecessary for us since we default the border-width
 * to 0 on all elements.
 *
 * https://github.com/tailwindcss/tailwindcss/issues/362
 */

img {
  border-style: solid;
}

textarea {
  resize: vertical;
}

input::-moz-placeholder, textarea::-moz-placeholder {
  color: #a0aec0;
}

input:-ms-input-placeholder, textarea:-ms-input-placeholder {
  color: #a0aec0;
}

input::-ms-input-placeholder, textarea::-ms-input-placeholder {
  color: #a0aec0;
}

input::placeholder,
textarea::placeholder {
  color: #a0aec0;
}

button,
[role="button"] {
  cursor: pointer;
}

table {
  border-collapse: collapse;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/**
 * Reset links to optimize for opt-in styling instead of
 * opt-out.
 */

a {
  color: inherit;
  text-decoration: inherit;
}

/**
 * Reset form element properties that are easy to forget to
 * style explicitly so you don't inadvertently introduce
 * styles that deviate from your design system. These styles
 * supplement a partial reset that is already applied by
 * normalize.css.
 */

button,
input,
optgroup,
select,
textarea {
  padding: 0;
  line-height: inherit;
  color: inherit;
}

/**
 * Use the configured 'mono' font family for elements that
 * are expected to be rendered with a monospace font, falling
 * back to the system monospace stack if there is no configured
 * 'mono' font family.
 */

pre,
code,
kbd,
samp {
  font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/**
 * Make replaced elements `display: block` by default as that's
 * the behavior you want almost all of the time. Inspired by
 * CSS Remedy, with `svg` added as well.
 *
 * https://github.com/mozdevs/cssremedy/issues/14
 */

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  vertical-align: middle;
}

/**
 * Constrain images and videos to the parent width and preserve
 * their instrinsic aspect ratio.
 *
 * https://github.com/mozdevs/cssremedy/issues/14
 */

img,
video {
  max-width: 100%;
  height: auto;
}

/*tailwind start components */

.container {
  width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

/*tailwind end components */

.bg-white {
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
}

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.inline {
  display: inline;
}

.flex {
  display: flex;
}

.table {
  display: table;
}

.hidden {
  display: none;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.flex-1 {
  flex: 1 1 0%;
}

.font-bold {
  font-weight: 700;
}

.text-xs {
  font-size: 0.75rem;
}

.opacity-0 {
  opacity: 0;
}

.overflow-hidden {
  overflow: hidden;
}

.py-20 {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.py-32 {
  padding-top: 8rem;
  padding-bottom: 8rem;
}

.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.resize {
  resize: both;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.text-center {
  text-align: center;
}

.text-gray-500 {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
}

.text-gray-800 {
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
}

.lowercase {
  text-transform: lowercase;
}

.visible {
  visibility: visible;
}

.w-0 {
  width: 0;
}

.w-full {
  width: 100%;
}
/* table container */

.alpinejs-alpinejs-table-container {
  display: flex;
  flex-direction: column;
  overflow-x: scroll;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.alpinejs-table-layout {
  vertical-align: middle;
  width: auto;
  min-width: 100%;
  display: inline-block;
  border-bottom-width: 1px;
  --border-opacity: 1;
  border-color: #f7fafc;
  border-color: rgba(247, 250, 252, var(--border-opacity));
}

.alpinejs-table-layout > table {
  min-width: 100%;
  border-width: 0;
}

.alpinejs-table-layout > table > thead {
  display: flex;
  flex-direction: column;
}

.alpinejs-table-layout > table > thead > tr {
  --bg-opacity: 1;
  background-color: #2c5282;
  background-color: rgba(44, 82, 130, var(--bg-opacity));
}

.alpinejs-table-layout > table > thead > tr > th {
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.25rem;
  font-size: 1rem;
  line-height: 1.25rem;
}

.alpinejs-table-layout > table > thead > tr > th:not(:last-child) {
  border-right-width: 1px;
  --border-opacity: 1;
  border-color: #fff;
  border-color: rgba(255, 255, 255, var(--border-opacity));
}

.alpinejs-table-layout > table > thead > tr > th > div {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0.5rem;
}

.alpinejs-table-layout > table > thead > tr > th > div > strong {
  margin-right: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  font-size: 1rem;
  --text-opacity: 1;
  color: #fff;
  color: rgba(255, 255, 255, var(--text-opacity));
}

/* table body */

.alpinejs-table-layout > table > tbody {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  min-height: 440px;
  height: calc(100vh - 350px);
}

.alpinejs-table-layout > table > tbody > tr:nth-child(odd) {
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
}

.alpinejs-table-layout > table > tbody > tr:nth-child(even) {
  --bg-opacity: 1;
  background-color: #f7fafc;
  background-color: rgba(247, 250, 252, var(--bg-opacity));
}

.alpinejs-table-layout > table > tbody > tr > td {
  box-sizing: border-box;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
  word-break: break-all;
}

.alpinejs-table-layout > table > tbody > tr > td:not(:last-child) {
  border-right-width: 1px;
  --border-opacity: 1;
  border-color: #f7fafc;
  border-color: rgba(247, 250, 252, var(--border-opacity));
}

.alpinejs-table-layout > table > tbody > tr > td > div {
  display: block;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.alpinejs-table-layout > table > tbody > tr > td > span {
  display: inline-block;
  width: 100%;
  font-size: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.alpinejs-table-layout > table > tbody > tr > td > span > a {
  --text-opacity: 1;
  color: #63b3ed;
  color: rgba(99, 179, 237, var(--text-opacity));
  text-decoration: underline;
}

.alpinejs-table-layout > table > tbody > tr > td > span > a:hover {
  text-decoration: none;
}

/* sort button */

.alpinejs-table-sort-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  --text-opacity: 1;
  color: #fff;
  color: rgba(255, 255, 255, var(--text-opacity));
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.alpinejs-table-sort-button > svg {
  --text-opacity: 1;
  color: #cbd5e0;
  color: rgba(203, 213, 224, var(--text-opacity));
  width: 9px;
  height: 13px;
}

.alpinejs-table-sort-button:hover {
  outline: 0;
}

.alpinejs-table-sort-button:focus {
  outline: 0;
}

.alpinejs-table-sort-button:hover > svg.none,
.alpinejs-table-sort-button > svg.active {
  --text-opacity: 1;
  color: #fff;
  color: rgba(255, 255, 255, var(--text-opacity));
}

/* filter by text */

.alpinejs-table-filter-text {
  position: relative;
  width: 100%;
}

.alpinejs-table-filter-text:focus-within {
  z-index: 10;
}

.alpinejs-table-filter-text > input {
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  display: block;
  width: 100%;
  line-height: 2rem;
  padding-left: 0.5rem;
  padding-right: 2.5rem;
  --text-opacity: 1;
  color: #000;
  color: rgba(0, 0, 0, var(--text-opacity));
  font-size: 0.875rem;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  height: 2rem;
}

.alpinejs-table-filter-text > input::-moz-placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-text > input:-ms-input-placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-text > input::-ms-input-placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-text > input::placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-text > input:hover {
  outline: 0;
}

.alpinejs-table-filter-text > input:focus {
  outline: 0;
}

/* filter by date picker */

.alpinejs-table-filter-date {
  position: relative;
  width: 100%;
  display: inline-block;
  z-index: 10;
}

.alpinejs-table-filter-date > input {
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  display: block;
  width: 100%;
  line-height: 2rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  --text-opacity: 1;
  color: #000;
  color: rgba(0, 0, 0, var(--text-opacity));
  font-size: 0.875rem;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  height: 2rem;
}

.alpinejs-table-filter-date > input:focus {
  outline: 0;
}

.alpinejs-table-filter-date > input::-moz-placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-date > input:-ms-input-placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-date > input::-ms-input-placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-date > input::placeholder {
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  position: relative;
  font-size: 0.75rem;
}

.alpinejs-table-filter-date > svg {
  position: absolute;
  left: 0;
  margin-left: 0.5rem;
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  width: 1.5rem;
  height: 1.5rem;
  top: 3px;
}

/* X button (click to clean keyword) */

.alpinejs-table-filter-text > button,
.alpinejs-table-filter-date > button {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  --text-opacity: 1;
  color: #1a202c;
  color: rgba(26, 32, 44, var(--text-opacity));
}

.alpinejs-table-filter-text > button > svg,
.alpinejs-table-filter-date > button > svg {
  width: 1rem;
  height: 1rem;
}

.alpinejs-table-filter-text > button:hover,
.alpinejs-table-filter-date > button:hover {
  --text-opacity: 1;
  color: #000;
  color: rgba(0, 0, 0, var(--text-opacity));
}

.alpinejs-table-filter-text > button:focus,
.alpinejs-table-filter-date > button:focus {
  outline: 0;
  box-shadow: none;
}

/* filter by dropdown */

.alpinejs-table-filter-dropdown {
  position: relative;
  display: inline-block;
  z-index: 10;
}

.alpinejs-table-filter-dropdown > div {
  width: 100%;
}

.alpinejs-table-filter-dropdown > div > span {
  display: inline-block;
  width: 100%;
}

.alpinejs-table-filter-dropdown > div > span > button {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  align-items: center;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  overflow: hidden;
  height: 2rem;
}

.alpinejs-table-filter-dropdown > div > span > button > span {
  display: inline-flex;
  line-height: 1;
  font-size: 0.75rem;
}

.alpinejs-table-filter-dropdown > div > span > button > svg {
  display: inline-flex;
  margin-right: -0.25rem;
  margin-left: 0.5rem;
  height: 1rem;
  width: 1rem;
}

.alpinejs-table-filter-dropdown > div > span > button:hover {
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
}

.alpinejs-table-filter-dropdown > div > span > button.active {
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
  font-size: 0.875rem;
}

.alpinejs-table-filter-dropdown > div > span > button.active > span {
  font-size: 0.875rem;
}

.alpinejs-table-filter-dropdown > div > span > button:focus {
  outline: 0;
  box-shadow: none;
}

.alpinejs-table-filter-dropdown > div.dropdown-options {
  width: 100%;
  position: absolute;
  z-index: 20;
  left: 0;
  border-width: 1px;
  --border-opacity: 1;
  border-color: #e2e8f0;
  border-color: rgba(226, 232, 240, var(--border-opacity));
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  top: 32px;
}

.alpinejs-table-filter-dropdown > div.dropdown-options > button {
  display: block;
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 0.875rem;
  text-align: left;
  line-height: 1.25rem;
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alpinejs-table-filter-dropdown > div.dropdown-options > button:not(:last-child) {
  margin-bottom: 1px;
}

.alpinejs-table-filter-dropdown > div.dropdown-options > button:hover {
  --bg-opacity: 1;
  background-color: #fefcbf;
  background-color: rgba(254, 252, 191, var(--bg-opacity));
}

.alpinejs-table-filter-dropdown > div.dropdown-options > button.active {
  --bg-opacity: 1;
  background-color: #fefcbf;
  background-color: rgba(254, 252, 191, var(--bg-opacity));
}

/* pagination: */

.alpinejs-table-pagination {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alpinejs-table-pagination .prev-btn,
.alpinejs-table-pagination .next-btn {
  margin-top: -1px;
  display: inline-flex;
  align-items: center;
  align-items: center;
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  font-size: 0.75rem;
}

.alpinejs-table-pagination .prev-btn > svg,
.alpinejs-table-pagination .next-btn > svg {
  border-width: 1px;
  --border-opacity: 1;
  border-color: #2d3748;
  border-color: rgba(45, 55, 72, var(--border-opacity));
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  width: 2rem;
  height: 2rem;
  --bg-opacity: 1;
  background-color: #f7fafc;
  background-color: rgba(247, 250, 252, var(--bg-opacity));
}

.alpinejs-table-pagination .prev-btn:hover:enabled > svg,
.alpinejs-table-pagination .next-btn:hover:enabled > svg {
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
  --text-opacity: 1;
  color: #000;
  color: rgba(0, 0, 0, var(--text-opacity));
}

.alpinejs-table-pagination .prev-btn:focus:enabled,
.alpinejs-table-pagination .next-btn:focus:enabled {
  outline: 0;
  box-shadow: none;
}

.alpinejs-table-pagination .prev-btn:active:enabled,
.alpinejs-table-pagination .next-btn:active:enabled {
  outline: 0;
  box-shadow: none;
}

.alpinejs-table-pagination .prev-btn:disabled,
.alpinejs-table-pagination .next-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.alpinejs-table-pagination .number-btn {
  margin-top: -1px;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  display: inline-flex;
  font-weight: 600;
  align-items: center;
  font-size: 0.875rem;
  --text-opacity: 1;
  color: #2d3748;
  color: rgba(45, 55, 72, var(--text-opacity));
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.alpinejs-table-pagination .number-btn:hover {
  --text-opacity: 1;
  color: #63b3ed;
  color: rgba(99, 179, 237, var(--text-opacity));
  outline: 0;
  box-shadow: none;
}

.alpinejs-table-pagination .number-btn:focus {
  outline: 0;
  box-shadow: none;
}

.alpinejs-table-pagination .number-btn.active,
.alpinejs-table-pagination .number-btn.active:focus {
  outline: 0;
  box-shadow: none;
  --text-opacity: 1;
  color: #63b3ed;
  color: rgba(99, 179, 237, var(--text-opacity));
}

.alpinejs-table-pagination .number-btn:disabled,
.alpinejs-table-pagination .number-btn:active:disabled,
.alpinejs-table-pagination .number-btn:hover:disabled,
.alpinejs-table-pagination .number-btn:focus:disabled {
  outline: 0;
  box-shadow: none;
  --text-opacity: 1;
  color: #a0aec0;
  color: rgba(160, 174, 192, var(--text-opacity));
  cursor: not-allowed;
}

.alpinejs-table-pagination .select-perpage {
  display: inline-block;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  height: 2rem;
  --bg-opacity: 1;
  background-color: #f7fafc;
  background-color: rgba(247, 250, 252, var(--bg-opacity));
  border-width: 1px;
  --border-opacity: 1;
  border-color: #2d3748;
  border-color: rgba(45, 55, 72, var(--border-opacity));
  border-radius: 0.25rem;
}

.alpinejs-table-not-found {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  letter-spacing: 0;
  --text-opacity: 1;
  color: #cbd5e0;
  color: rgba(203, 213, 224, var(--text-opacity));
}

/**
 * @bevacqua/rome - Customizable date (and time) picker. Opt-in UI, no jQuery!
 * @version v3.0.3
 * @link https://github.com/bevacqua/rome
 * @license MIT
 */

.alpinejs-table-rome-container {
  display: none;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  text-align: center;
  width: auto;
  height: auto;
  margin-top: 1px;
}

.alpinejs-table-rome-container-attachment {
  position: absolute;
}

.alpinejs-table-rome-month {
  width: 100%;
  padding: 0;
  display: inline-block;
  margin-right: 0;
}

.alpinejs-table-rome-month:last-child {
  margin-right: 0;
}

.alpinejs-table-rome-month-label {
  margin-right: 0;
  font-weight: 700;
  text-align: center;
  --text-opacity: 1;
  color: #000;
  color: rgba(0, 0, 0, var(--text-opacity));
  font-size: 1rem;
  line-height: 1.5;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.alpinejs-table-rome-back,
.alpinejs-table-rome-next {
  cursor: pointer;
  border-style: none;
  outline: 0;
  background-color: transparent;
  margin: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.alpinejs-table-rome-back[disabled],
.alpinejs-table-rome-next[disabled] {
  cursor: default;
}

.alpinejs-table-rome-back {
  float: left;
}

.alpinejs-table-rome-next {
  float: right;
}

.alpinejs-table-rome-back:before {
  display: block;
  --text-opacity: 1;
  color: #2c5282;
  color: rgba(44, 82, 130, var(--text-opacity));
  content: "\2190";
}

.alpinejs-table-rome-next:before {
  display: block;
  --text-opacity: 1;
  color: #2c5282;
  color: rgba(44, 82, 130, var(--text-opacity));
  content: "\2192";
}

.alpinejs-table-rome-day-head {
  text-align: center;
  --text-opacity: 1;
  color: #718096;
  color: rgba(113, 128, 150, var(--text-opacity));
  font-size: 0.875rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.alpinejs-table-rome-day-body {
  cursor: pointer;
  text-align: center;
  --text-opacity: 1;
  color: #000;
  color: rgba(0, 0, 0, var(--text-opacity));
  margin: 0;
  font-size: 0.875rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.alpinejs-table-rome-day-body > span {
  cursor: pointer;
  display: inline-block;
  border-radius: 9999px;
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
  font-size: 0.875rem;
  width: 2rem;
  height: 2rem;
  line-height: 2rem;
}

.alpinejs-table-rome-day-body > span:hover,
.alpinejs-table-rome-day-selected > span,
.alpinejs-table-rome-time-selected > span,
.alpinejs-table-rome-time-option:hover > span {
  cursor: pointer;
  display: inline-block;
  --bg-opacity: 1;
  background-color: #ecc94b;
  background-color: rgba(236, 201, 75, var(--bg-opacity));
}

.alpinejs-table-rome-day-prev-month,
.alpinejs-table-rome-day-next-month {
  --text-opacity: 1;
  color: #fff;
  color: rgba(255, 255, 255, var(--text-opacity));
}

.alpinejs-table-rome-day-prev-month > span,
.alpinejs-table-rome-day-next-month > span {
  display: none;
}

.alpinejs-table-rome-day-disabled {
  cursor: default;
  --text-opacity: 1;
  color: #f7fafc;
  color: rgba(247, 250, 252, var(--text-opacity));
}

.alpinejs-table-rome-day-concealed {
  visibility: hidden;
}
