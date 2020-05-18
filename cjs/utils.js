"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = exports.scrollSync = exports.resolveHLJS = exports.raf = exports.loadTheme = exports.hasCompanion = void 0;
const CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

const hasCompanion = ({
  nextElementSibling
}) => !!nextElementSibling && nextElementSibling.classList.contains('uce-highlight'); // list of themes in the CSS section
// https://cdnjs.com/libraries/highlight.js
// just pass the theme name: /style/{{name}}.min.css
// i.e. loadTheme('tomorrow-night')


exports.hasCompanion = hasCompanion;
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

const scrollSync = (a, b) => {
  a.scrollTop = b.scrollTop;
  a.scrollLeft = b.scrollLeft;
};

exports.scrollSync = scrollSync;

const update = (self, {
  node
}) => {
  if (self.multiLine) {
    let code = self.nextElementSibling;

    if (!hasCompanion(self)) {
      const langs = hljs.listLanguages();
      const select = node`<select class="hljs uce-highlight" onchange=${({
        currentTarget
      }) => {
        self.setAttribute('lang', currentTarget.value);
      }}>${langs.map(lang => node`<option value=${lang}>${lang}</option>`)}</select>`;
      const index = langs.indexOf(self.props.lang);
      select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;
      self.parentNode.insertBefore(select, self.nextSibling);
      code = node`<code></code>`;
      const {
        style
      } = code;
      style.opacity = 0;
      if (!self.editing) raf(() => style.opacity = 1);
      self.parentNode.insertBefore(code, select);
    }

    code.className = `${self.props.lang || 'plaintext'} uce-highlight`;
    code.innerHTML = self.innerHTML.replace(/<(?:div|p)>/g, '\n').replace(/<[^>]+?>/g, '');
    window.hljs.highlightBlock(code);
    scrollSync(code, self);
  }
};

exports.update = update;