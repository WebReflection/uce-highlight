"use strict";

var _ustyler = require("ustyler");

var _utils = require("./utils.js");

const privates = new WeakMap();

const sanitize = (_, nl, spaces, code) => `${nl ? '<br>' : ''}${spaces}<span>${code}</span>`;

customElements.whenDefined('uce-lib').then(() => {
  const {
    define,
    html
  } = customElements.get('uce-lib');
  let loadHLJS = null;
  define('uce-highlight', {
    extends: 'code',
    observedAttributes: ['lang', 'theme'],

    attributeChanged(name, _, val) {
      if (name === 'theme') (0, _utils.loadTheme)(val);
      if (privates.get(this).code) this.render();
    },

    init() {
      privates.set(this, {
        editing: false,
        code: null
      });

      if (!loadHLJS) {
        loadHLJS = (0, _utils.resolveHLJS)(this.props.theme);
        const ucehl = 'uce-highlight';
        const pre = `pre.${ucehl}`;
        const code = `code.${ucehl}`;
        const select = `select.${ucehl}`;
        const oh = 'overflow:hidden;';
        (0, _ustyler.default)(`*:not(pre)>code[is="${ucehl}"]{display:inline}` + `${pre}{${oh}padding:0;position:relative}` + `${pre}>*{box-sizing:border-box}` + `${pre}>code[is="${ucehl}"]{min-height:40px}` + `${pre}>.${ucehl}{position:absolute}` + `${pre}>${code}{${oh}top:0;left:0;width:100%;pointer-events:none}` + `${pre}>${code}>span{white-space:nowrap}` + `${select}{top:1px;right:1px;border:0}` + `${select}:not(:focus):not(:hover){opacity:.5}` + `[dir="rtl"] ${select}{left:1px;right:auto}` + `${code},${select}{transition:opacity .3s}`);
      }

      const {
        parentNode
      } = this;
      if (this.contentEditable = /^pre$/i.test(parentNode.nodeName)) parentNode.classList.add('uce-highlight');
      this.classList.add('hljs');
      this.render();
    },

    onfocus() {
      const _ = privates.get(this);

      _.editing = true;
      if (_.code) _.code.style.opacity = 0;
    },

    onblur() {
      const _ = privates.get(this);

      _.editing = false;
      if (_.code) this.render();
    },

    onkeydown(event) {
      const {
        metaKey,
        ctrlKey,
        key
      } = event;

      switch (key.toLowerCase()) {
        case 'enter':
          event.preventDefault();
          addText.call(this, '\n');
          break;

        case 's':
          if (metaKey || ctrlKey) event.preventDefault();
          break;
      }
    },

    onpaste(event) {
      event.preventDefault();
      const paste = (event.clipboardData || clipboardData).getData('text');
      if (paste.length) addText.call(this, paste.replace(/\r\n/g, '\n'));
    },

    onchange({
      currentTarget
    }) {
      this.setAttribute('lang', currentTarget.value);
    },

    onmousewheel() {
      scrollSync.call(this);
    },

    onscroll() {
      scrollSync.call(this);
    },

    render() {
      if (this.contentEditable == 'true') loadHLJS.then(() => {
        const _ = privates.get(this);

        const {
          hljs
        } = window;
        const {
          lang
        } = this.props;

        if (!_.code) {
          const {
            node
          } = html;
          const langs = hljs.listLanguages();
          const select = node`<select class="hljs uce-highlight" onchange=${this}>${langs.map(lang => node`<option value=${lang}>${lang}</option>`)}</select>`;
          const index = langs.indexOf(lang);
          select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;
          _.code = node`<code></code>`;
          _.code.style.opacity = 0;
          const {
            parentNode
          } = this;
          parentNode.insertBefore(select, this.nextSibling);
          parentNode.insertBefore(_.code, select);
        }

        const {
          textContent
        } = this;
        _.code.className = `${lang || 'plaintext'} uce-highlight`;
        _.code.textContent = this.textContent = textContent;
        hljs.highlightBlock(_.code);
        _.code.innerHTML = _.code.innerHTML.replace(/(\r\n|\n)?(\s*)(.+)$/mg, sanitize);
        scrollSync.call(this);
        if (!_.editing) (0, _utils.raf)(() => _.code.style.opacity = 1);
      });
    }

  });
});

function addText(text) {
  const {
    ownerDocument
  } = this;
  const selection = ownerDocument.getSelection();
  const range = selection.getRangeAt(0);
  const nl = ownerDocument.createTextNode(text);
  range.deleteContents();
  range.insertNode(nl);
  range.selectNode(nl);
  selection.removeAllRanges();
  selection.addRange(range);
  selection.collapseToEnd();
}

function scrollSync() {
  const {
    code
  } = privates.get(this);

  if (code) {
    code.scrollTop = this.scrollTop;
    code.scrollLeft = this.scrollLeft;
  }
}