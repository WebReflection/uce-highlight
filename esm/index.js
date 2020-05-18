import ustyler from 'ustyler';

import {loadTheme, raf, resolveHLJS} from './utils.js';

customElements.whenDefined('uce-lib').then(() => {
  const {define, html} = customElements.get('uce-lib');
  let loadHLJS = null;
  define('uce-highlight', {
    extends: 'code',
    observedAttributes: ['lang', 'theme'],
    attributeChanged(name, _, val) {
      if (name === 'theme')
        loadTheme(val);
      if (this._code)
        this.render();
    },
    init() {
      if (!loadHLJS) {
        loadHLJS = resolveHLJS(this.props.theme);
        const ucehl = 'uce-highlight';
        ustyler(
          `*:not(pre)>code[is="${ucehl}"]{display:inline}` +
          `pre.${ucehl}{position:relative}` +
          `pre.${ucehl}>.${ucehl}{position:absolute}` +
          `pre.${ucehl}>code.${ucehl}{top:0;left:0;width:100%;pointer-events:none}` +
          `pre.${ucehl}>select.${ucehl}{top:1px;right:1px;border:0}` +
          `[dir="rtl"] select.${ucehl}{left:1px;right:auto !important}` +
          `code.${ucehl}{transition:opacity .3s}`
        );
      }
      const {parentNode} = this;
      this.multiLine = /^pre$/i.test(parentNode.nodeName);
      this.contentEditable = this.multiLine;
      this._code = null;
      if (this.multiLine)
        parentNode.classList.add('uce-highlight');
      this.classList.add('hljs');
      this.render();
    },
    onfocus() {
      this.editing = true;
      if (this._code)
        this._code.style.opacity = 0;
    },
    onblur() {
      this.editing = false;
      if (this._code)
        this.render();
    },
    onkeydown(event) {
      const ctrlKey = event.metaKey || event.ctrlKey;
      if (ctrlKey && event.keyCode == 83) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('controlSave', {bubbles: true}));
      }
    },
    onpaste(event) {
      event.preventDefault();
      const paste = (event.clipboardData || clipboardData).getData('text');
      if (paste.length)
        document.execCommand('insertText', null, paste);
    },
    onchange({currentTarget}) {
      this.setAttribute('lang', currentTarget.value);
    },
    onscroll() {
      this.scrollSync();
    },
    onmousewheel() {
      this.scrollSync();
    },
    scrollSync() {
      if (this._code) {
        this._code.scrollTop = this.scrollTop;
        this._code.scrollLeft = this.scrollLeft;
      }
    },
    render() {
      if (this.multiLine)
        loadHLJS.then(() => {
          const {hljs} = window;
          let {_code, props} = this;
          if (!_code) {
            const langs = hljs.listLanguages();
            const select = html.node`<select class="hljs uce-highlight" onchange=${this}>${
              langs.map(
                lang => html.node`<option value=${lang}>${lang}</option>`
              )
            }</select>`;
            const index = langs.indexOf(props.lang);
            select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;
            this.parentNode.insertBefore(select, this.nextSibling);
            this._code = _code = html.node`<code></code>`;
            _code.style.opacity = 0;
            this.parentNode.insertBefore(_code, select);
          }
          _code.className = `${props.lang || 'plaintext'} uce-highlight`;
          _code.innerHTML = this.innerHTML
                                .replace(/<(?:div|p)>/g, '\n')
                                .replace(/<[^>]+?>/g, '');
          hljs.highlightBlock(_code);
          this.scrollSync();
          if (!this.editing)
            raf(() => _code.style.opacity = 1);
        });
    }
  });
});
