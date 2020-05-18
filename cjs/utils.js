"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveHLJS = exports.raf = exports.loadTheme = void 0;
const CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3'; // list of themes in the CSS section
// https://cdnjs.com/libraries/highlight.js
// just pass the theme name: /style/{{name}}.min.css
// i.e. loadTheme('tomorrow-night')

const themeCache = new Map();

const loadTheme = theme => {
  let link = themeCache.get(theme);

  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CDN + '/styles/' + theme + '.min.css';
    themeCache.set(theme, link);
  }

  themeCache.forEach(live => {
    if (live !== link && live.parentNode) live.parentNode.removeChild(live);
  });
  document.head.appendChild(link);
};

exports.loadTheme = loadTheme;

const raf = fn => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

exports.raf = raf;

const resolveHLJS = theme => new Promise($ => {
  const t = theme || 'default';
  if (window.hljs) [].some.call(document.querySelectorAll('link'), link => {
    const {
      rel,
      href
    } = link;

    if (/stylesheet/i.test(rel) && /\/highlight\.js\//.test(href)) {
      themeCache.set(t, link);
      return true;
    }
  });else {
    loadTheme(t);
    const script = document.createElement('script');
    script.src = CDN + '/highlight.min.js';
    script.onload = $;
    document.head.appendChild(script);
  }
});

exports.resolveHLJS = resolveHLJS;