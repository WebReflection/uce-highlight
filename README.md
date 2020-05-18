# uce-highlight

A component that helps editing and highlighting code on a page, mainly suitable for admin/editing areas.

**[Live demo](https://webreflection.github.io/uce-highlight/test/)**

Please note, if [highlight.js](https://highlightjs.org/) is not provided (both JS and style) it will be downloaded automatically once one component is found on the page.

```html
<pre><code
  is="uce-highlight"
  lang="javascript"
  theme="tomorrow-night"
  spellcheck="false"
>
  // lang is any highlight.js compatible language
  // theme is any highlight.js theme name
  // https://cdnjs.com/libraries/highlight.js
  console.log('uce-highlight');
</code></pre>
```
