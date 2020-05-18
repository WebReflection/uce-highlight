"use strict";

var _ustyler = require("ustyler");

var _utils = require("./utils.js");

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
      if ((0, _utils.hasCompanion)(this)) (0, _utils.raf)(() => this.render());
    },

    init() {
      if (!loadHLJS) {
        loadHLJS = (0, _utils.resolveHLJS)(this.props.theme);
        const ucehl = 'uce-highlight';
        (0, _ustyler.default)(`*:not(pre)>code[is="${ucehl}"]{display:inline}` + `pre.${ucehl}{position:relative}` + `pre.${ucehl}>.${ucehl}{position:absolute}` + `pre.${ucehl}>code.${ucehl}{top:0;left:0;width:100%}` + `pre.${ucehl}>select.${ucehl}{top:1px;right:1px;border:0}` + `code.${ucehl}{transition:opacity .3s}`);
      }

      this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
      this.contentEditable = this.multiLine;
      if (this.multiLine) this.parentNode.classList.add('uce-highlight');
      this.render();
    },

    onfocus() {
      this.editing = true;

      if ((0, _utils.hasCompanion)(this)) {
        const currentTarget = this.nextElementSibling;
        if (currentTarget.style.display != 'none') (0, _utils.pointerover)({
          currentTarget
        });
      }
    },

    onblur() {
      this.editing = false;

      if ((0, _utils.hasCompanion)(this)) {
        const {
          nextElementSibling
        } = this;
        const {
          style
        } = nextElementSibling;
        nextElementSibling.removeEventListener('transitionend', _utils.transitionend);
        style.opacity = 0;
        style.display = null;
        (0, _utils.raf)(() => {
          (0, _utils.update)(this, html);
          style.opacity = 1;
        });
      }
    },

    onkeydown(event) {
      const ctrlKey = event.metaKey || event.ctrlKey;

      if (ctrlKey && event.keyCode == 83) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('controlSave', {
          bubbles: true
        }));
      }
    },

    onmouseout() {
      this.onpointerout();
    },

    onpointerout() {
      if (!this.editing) this.onblur();
    },

    onpaste(event) {
      event.preventDefault();
      const paste = (event.clipboardData || clipboardData).getData('text');
      if (paste.length) document.execCommand('insertText', null, paste);
    },

    render() {
      loadHLJS.then(() => {
        (0, _utils.update)(this, html);
      });
    }

  });
});