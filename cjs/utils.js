"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveHLJS = exports.raf = exports.loadTheme = void 0;

var _assign = require("@ungap/assign");

const CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

const append = what => {
  document.head.appendChild(what);
};

const create = (what, attrs) => (0, _assign.default)(document.createElement(what), attrs); // list of themes in the CSS section
// https://cdnjs.com/libraries/highlight.js
// just pass the theme name: /style/{{name}}.min.css
// i.e. loadTheme('tomorrow-night')


const themeCache = new Map();

const loadTheme = theme => {
  let link = themeCache.get(theme);
  if (!link) themeCache.set(theme, link = create('link', {
    href: `${CDN}/styles/${theme}.min.css`,
    rel: 'stylesheet'
  }));
  themeCache.forEach(live => {
    if (live !== link && live.parentNode) live.parentNode.removeChild(live);
  });
  append(link);
};

exports.loadTheme = loadTheme;

const raf = fn => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

exports.raf = raf;

const resolveHLJS = theme => new Promise(onload => {
  const t = theme || 'default';

  if (window.hljs) {
    [].some.call(document.querySelectorAll('link'), link => {
      const {
        rel,
        href
      } = link;

      if (/stylesheet/i.test(rel) && /\/highlight\.js\//.test(href)) {
        themeCache.set(t, link);
        return true;
      }
    });
    onload();
  } else {
    loadTheme(t);
    append(create('script', {
      src: `${CDN}/highlight.min.js`,
      onload
    }));
  }
});

exports.resolveHLJS = resolveHLJS;