"use strict";

var _ustyler = require("ustyler");

var _utils = require("./utils.js");

customElements.whenDefined('uce-lib').then(() => {
  const {
    define
  } = customElements.get('uce-lib');
  let loadHLJS = null;
  define('uce-highlight', {
    extends: 'code',
    observedAttributes: ['lang', 'theme'],

    attributeChanged(name) {
      if (name === 'theme') (0, _utils.loadTheme)(this.props.theme);
      if ((0, _utils.hasCompanion)(this)) (0, _utils.raf)(() => this.render());
    },

    init() {
      if (!loadHLJS) {
        loadHLJS = (0, _utils.resolveHLJS)(this.props.theme);
        (0, _ustyler.default)('*:not(pre)>code[is="uce-highlight"]{display:inline;}' + 'pre>code.uce-highlight{position:absolute;transform:translateY(-100%);}' + 'code.uce-highlight{transition:opacity .3s;font-size:inherit;}');
      }

      (0, _utils.raf)(() => {
        this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
        this.contentEditable = this.multiLine;
        this.render();
      });
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
          (0, _utils.update)(this);
          style.opacity = 1;
        });
      }
    },

    onkeydown(event) {
      if (event.keyCode == 83 && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('controlSave'));
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
      loadHLJS.then(() => (0, _utils.update)(this));
    }

  });
});