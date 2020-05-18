const CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

const scrollSync = (a, b) => {
  a.scrollTop = b.scrollTop;
  a.scrollLeft = b.scrollLeft;
};

const pointerout = ({currentTarget: {style}}) => {
  if (style.opacity != 1)
    style.opacity = 1;
};

export const hasCompanion = ({nextElementSibling}) =>
                        !!nextElementSibling &&
                        nextElementSibling.classList.contains('uce-highlight');

// list of themes in the CSS section
// https://cdnjs.com/libraries/highlight.js
// just pass the theme name: /style/{{name}}.min.css
// i.e. loadTheme('tomorrow-night')
const themeCache = new Map;
export const loadTheme = theme => {
  let link = themeCache.get(theme);
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CDN + '/styles/' + theme + '.min.css';
    themeCache.set(theme, link);
  }
  themeCache.forEach(live => {
    if (live !== link && live.parentNode)
      live.parentNode.removeChild(live);
  });
  document.head.appendChild(link);
};

export const pointerover = ({currentTarget}) => {
  const {style} = currentTarget;
  if (style.opacity != 0) {
    scrollSync(currentTarget.previousSibling, currentTarget);
    currentTarget.addEventListener('transitionend', transitionend);
    style.opacity = 0;
  }
};

export const raf = fn => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

export const resolveHLJS = theme => new Promise($ => {
  const t = theme || 'default';
  if (window.hljs)
    [].some.call(
      document.querySelectorAll('link'),
      link => {
        const {rel, href} = link;
        if (
          /stylesheet/i.test(rel) &&
          /\/highlight\.js\//.test(href)
        ) {
          themeCache.set(t, link);
          return true;
        }
      }
    );
  else {
    loadTheme(t);
    const script = document.createElement('script');
    script.src = CDN + '/highlight.min.js';
    script.onload = $;
    document.head.appendChild(script);
  }
});

export const transitionend = ({currentTarget: {style}, propertyName}) => {
  if (propertyName === 'opacity' && style.opacity == 0) {
    style.display = 'none';
  }
};

export const update = (self, {node}) => {
  const {classList, multiLine} = self;
  classList.add('hljs');
  if (multiLine) {
    let code = self.nextElementSibling;
    if (!hasCompanion(self)) {
      const langs = hljs.listLanguages();
      const select = node`<select class="hljs uce-highlight" onchange=${
        ({currentTarget}) => {
          self.setAttribute('lang', currentTarget.value);
        }
      }>${langs.map(
        lang => node`<option value=${lang}>${lang}</option>`
      )}</select>`;
      const index = langs.indexOf(self.props.lang);
      select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;
      self.parentNode.insertBefore(select, self.nextSibling);
      code = node`<code onmouseover=${pointerover} onmouseout=${pointerout}></code>`;
      const {style} = code
      if (self.editing)
        style.display = 'none';
      else {
        style.opacity = 0;
        raf(() => style.opacity = 1);
      }
      self.parentNode.insertBefore(code, select);
    }
    code.className = `${self.props.lang} uce-highlight`;
    code.innerHTML = self.innerHTML
                          .replace(/<(?:div|p)>/g, '\n')
                          .replace(/<[^>]+?>/g, '');
    window.hljs.highlightBlock(code);
    code.style.width = self.offsetWidth + 'px';
    code.style.height = self.offsetHeight + 'px';
    scrollSync(code, self);
  }
};
