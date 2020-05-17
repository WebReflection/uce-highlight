import ustyler from 'ustyler';

import {
  hasCompanion, loadTheme, raf, resolveHLJS, update,
  pointerover, transitionend
} from './utils.js';

customElements.whenDefined('uce-lib').then(() => {
  const {define} = customElements.get('uce-lib');
  let loadHLJS = null;
  define('uce-highlight', {
    extends: 'code',
    observedAttributes: ['lang', 'theme'],
    attributeChanged(name) {
      if (name === 'theme')
        loadTheme(this.props.theme);
      if (hasCompanion(this))
        raf(() => this.render());
    },
    init() {
      if (!loadHLJS) {
        loadHLJS = resolveHLJS(this.props.theme);
        ustyler(
          '*:not(pre)>code[is="uce-highlight"]{display:inline;}' +
          'pre>code.uce-highlight{position:absolute;transform:translateY(-100%);}' +
          'code.uce-highlight{transition:opacity .3s;font-size:inherit;}'
        );
      }
      raf(() => {
        this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
        this.contentEditable = this.multiLine;
        this.render();
      });
    },
    onfocus() {
      this.editing = true;
      if (hasCompanion(this)) {
        const currentTarget = this.nextElementSibling;
        if (currentTarget.style.display != 'none')
          pointerover({currentTarget});
      }
    },
    onblur() {
      this.editing = false;
      if (hasCompanion(this)) {
        const {nextElementSibling} = this;
        const {style} = nextElementSibling;
        nextElementSibling.removeEventListener('transitionend', transitionend);
        style.opacity = 0;
        style.display = null;
        raf(() => {
          update(this);
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
      if (!this.editing)
        this.onblur();
    },
    onpaste(event) {
      event.preventDefault();
      const paste = (event.clipboardData || clipboardData).getData('text');
      if (paste.length)
        document.execCommand('insertText', null, paste);
    },
    render() {
      loadHLJS.then(() => update(this));
    }
  });
});
