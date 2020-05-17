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
      this.render();
    },

    init() {
      if (!loadHLJS) {
        loadHLJS = (0, _utils.resolveHLJS)(this.props.theme);
        (0, _ustyler.default)('*:not(pre)>code[is="uce-highlight"]{display:inline;}' + 'pre>code.uce-highlight{position:absolute;transform:translateY(-100%);}' + 'code.uce-highlight{transition:opacity .3s;}');
      }

      this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
      this.contentEditable = this.multiLine;
      this.render();
    },

    onfocus() {
      this.editing = true;

      if ((0, _utils.hasCompanion)(this)) {
        const currentTarget = this.nextElementSibling;
        if (currentTarget.style.display != 'none') (0, _utils.mouseover)({
          currentTarget
        });
      }
    },

    onblur() {
      this.editing = false;

      if ((0, _utils.hasCompanion)(this)) {
        this.nextElementSibling.removeEventListener('transitionend', _utils.transitionend);
        const {
          style
        } = this.nextElementSibling;
        style.opacity = 0;
        style.display = null;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          (0, _utils.update)(this);
          style.opacity = 1;
        }));
      }
    },

    onmouseout() {
      if (!this.editing) this.onblur();
    },

    onpaste(event) {
      event.preventDefault();
      const selection = getSelection();

      if (selection.rangeCount) {
        const paste = (event.clipboardData || clipboardData).getData('text');
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(paste.replace(/\r\n/g, '\n')));
        selection.collapseToEnd();
      }
    },

    render() {
      loadHLJS.then(() => (0, _utils.update)(this));
    }

  });
});