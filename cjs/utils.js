"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = exports.transitionend = exports.resolveHLJS = exports.raf = exports.pointerover = exports.loadTheme = exports.hasCompanion = void 0;
const CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

const scrollSync = (a, b) => {
  a.scrollTop = b.scrollTop;
  a.scrollLeft = b.scrollLeft;
};

const pointerout = ({
  currentTarget
}) => {
  currentTarget.style.opacity = 1;
};

const hasCompanion = ({
  nextElementSibling
}) => nextElementSibling && nextElementSibling.classList.contains('uce-highlight'); // list of themes in the CSS section
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

const pointerover = ({
  currentTarget
}) => {
  scrollSync(currentTarget.previousSibling, currentTarget);
  currentTarget.addEventListener('transitionend', transitionend);
  currentTarget.style.opacity = 0;
};

exports.pointerover = pointerover;

const raf = fn => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

exports.raf = raf;

const resolveHLJS = theme => Promise.resolve(window.hljs || new Promise($ => {
  const script = document.createElement('script');
  script.src = CDN + '/highlight.min.js';
  script.onload = $;
  document.head.appendChild(script);
  loadTheme(theme || 'default');
}));

exports.resolveHLJS = resolveHLJS;

const transitionend = ({
  currentTarget: {
    style
  },
  propertyName
}) => {
  if (propertyName === 'opacity' && style.opacity == 0) {
    style.display = 'none';
  }
};

exports.transitionend = transitionend;

const update = self => {
  const {
    multiLine,
    nextElementSibling,
    props,
    innerHTML,
    textContent
  } = self;
  self.classList.add('hljs');

  if (multiLine) {
    let code = nextElementSibling;

    if (!hasCompanion(self)) {
      code = document.createElement('code');
      code.textContent = textContent;
      code.addEventListener('pointerover', pointerover);
      code.addEventListener('pointerout', pointerout);
      self.parentNode.insertBefore(code, self.nextSibling);
    } else code.innerHTML = innerHTML.replace(/<div>/g, '\n').replace(/<[>]+>/g, '\n');

    code.className = `${props.lang} uce-highlight`;
    window.hljs.highlightBlock(code);
    code.style.width = self.offsetWidth + 'px';
    code.style.height = self.offsetHeight + 'px';
    scrollSync(code, self);
  }
};

exports.update = update;