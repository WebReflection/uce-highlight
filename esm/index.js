import ustyler from 'ustyler';

import {hasCompanion, loadTheme, raf, resolveHLJS, scrollSync, update} from './utils.js';

customElements.whenDefined('uce-lib').then(() => {
  const {define, html} = customElements.get('uce-lib');
  let loadHLJS = null;
  define('uce-highlight', {
    extends: 'code',
    observedAttributes: ['lang', 'theme'],
    attributeChanged(name, _, val) {
      if (name === 'theme')
        loadTheme(val);
      if (hasCompanion(this))
        raf(() => this.render());
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
          `code.${ucehl}{transition:opacity .3s}`
        );
      }
      this.classList.add('hljs');
      this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
      this.contentEditable = this.multiLine;
      if (this.multiLine)
        this.parentNode.classList.add('uce-highlight');
      this.render();
    },
    onfocus() {
      this.editing = true;
      if (hasCompanion(this))
        this.nextElementSibling.style.opacity = 0;
    },
    onblur() {
      this.editing = false;
      if (hasCompanion(this)) {
        raf(() => {
          update(this, html);
          this.nextElementSibling.style.opacity = 1;
        });
      }
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
    onscroll() {
      this.onmousewheel();
    },
    onmousewheel() {
      if (hasCompanion(this))
        scrollSync(this.nextElementSibling, this);
    },
    render() {
      loadHLJS.then(() => {
        update(this, html);
      });
    }
  });
});
