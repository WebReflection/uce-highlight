"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = exports.resolveHLJS = exports.transitionend = exports.loadTheme = exports.mouseover = exports.hasCompanion = void 0;
const CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

const mouseout = ({
  currentTarget
}) => {
  currentTarget.style.opacity = 1;
};

const hasCompanion = ({
  nextElementSibling
}) => nextElementSibling && nextElementSibling.classList.contains('uce-highlight');

exports.hasCompanion = hasCompanion;

const mouseover = ({
  currentTarget
}) => {
  currentTarget.addEventListener('transitionend', transitionend);
  currentTarget.style.opacity = 0;
}; // list of themes in the CSS section
// https://cdnjs.com/libraries/highlight.js
// just pass the theme name: /style/{{name}}.min.css
// i.e. loadTheme('tomorrow-night')


exports.mouseover = mouseover;
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

const resolveHLJS = theme => Promise.resolve(window.hljs || new Promise($ => {
  const script = document.createElement('script');
  script.src = CDN + '/highlight.min.js';
  script.onload = $;
  document.head.appendChild(script);
  loadTheme(theme || 'default');
}));

exports.resolveHLJS = resolveHLJS;

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
      code.addEventListener('mouseover', mouseover);
      code.addEventListener('mouseout', mouseout);
      self.parentNode.insertBefore(code, self.nextSibling);
    } else code.innerHTML = innerHTML.replace(/<div>/g, '\n').replace(/<[>]+>/g, '\n');

    code.className = `${props.lang} uce-highlight`;
    window.hljs.highlightBlock(code);
    code.style.width = self.offsetWidth + 'px';
    code.style.height = self.offsetHeight + 'px';
    code.scrollTop = self.scrollTop;
    code.scrollLeft = self.scrollLeft;
  }
};

exports.update = update;