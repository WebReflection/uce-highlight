(function () {
  'use strict';

  /**
   * Create, append, and return, a style node with the passed CSS content.
   * @param {string|string[]} template the CSS text or a template literal array.
   * @param {...any} values the template literal interpolations.
   * @return {HTMLStyleElement} the node appended as head last child.
   */
  function ustyler(template) {
    var text = typeof template == 'string' ? [template] : [template[0]];

    for (var i = 1, length = arguments.length; i < length; i++) {
      text.push(arguments[i], template[i]);
    }

    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(text.join('')));
    return document.head.appendChild(style);
  }

  var CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

  var scrollSync = function scrollSync(a, b) {
    a.scrollTop = b.scrollTop;
    a.scrollLeft = b.scrollLeft;
  };

  var pointerout = function pointerout(_ref) {
    var currentTarget = _ref.currentTarget;
    currentTarget.style.opacity = 1;
  };

  var hasCompanion = function hasCompanion(_ref2) {
    var nextElementSibling = _ref2.nextElementSibling;
    return nextElementSibling && nextElementSibling.classList.contains('uce-highlight');
  }; // list of themes in the CSS section
  // https://cdnjs.com/libraries/highlight.js
  // just pass the theme name: /style/{{name}}.min.css
  // i.e. loadTheme('tomorrow-night')

  var themeCache = new Map();
  var loadTheme = function loadTheme(theme) {
    var link = themeCache.get(theme);

    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CDN + '/styles/' + theme + '.min.css';
      themeCache.set(theme, link);
    }

    themeCache.forEach(function (live) {
      if (live !== link && live.parentNode) live.parentNode.removeChild(live);
    });
    document.head.appendChild(link);
  };
  var pointerover = function pointerover(_ref3) {
    var currentTarget = _ref3.currentTarget;
    scrollSync(currentTarget.previousSibling, currentTarget);
    currentTarget.addEventListener('transitionend', transitionend);
    currentTarget.style.opacity = 0;
  };
  var raf = function raf(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  };
  var resolveHLJS = function resolveHLJS(theme) {
    return Promise.resolve(window.hljs || new Promise(function ($) {
      var script = document.createElement('script');
      script.src = CDN + '/highlight.min.js';
      script.onload = $;
      document.head.appendChild(script);
      loadTheme(theme || 'default');
    }));
  };
  var transitionend = function transitionend(_ref4) {
    var style = _ref4.currentTarget.style,
        propertyName = _ref4.propertyName;

    if (propertyName === 'opacity' && style.opacity == 0) {
      style.display = 'none';
    }
  };
  var update = function update(self) {
    var multiLine = self.multiLine,
        nextElementSibling = self.nextElementSibling,
        props = self.props,
        innerHTML = self.innerHTML,
        textContent = self.textContent;
    self.classList.add('hljs');

    if (multiLine) {
      var code = nextElementSibling;

      if (!hasCompanion(self)) {
        code = document.createElement('code');
        code.textContent = textContent;
        code.addEventListener('pointerover', pointerover);
        code.addEventListener('pointerout', pointerout);
        self.parentNode.insertBefore(code, self.nextSibling);
      } else code.innerHTML = innerHTML.replace(/<div>/g, '\n').replace(/<[>]+>/g, '\n');

      code.className = "".concat(props.lang, " uce-highlight");
      window.hljs.highlightBlock(code);
      code.style.width = self.offsetWidth + 'px';
      code.style.height = self.offsetHeight + 'px';
      scrollSync(code, self);
    }
  };

  customElements.whenDefined('uce-lib').then(function () {
    var _customElements$get = customElements.get('uce-lib'),
        define = _customElements$get.define;

    var loadHLJS = null;
    define('uce-highlight', {
      "extends": 'code',
      observedAttributes: ['lang', 'theme'],
      attributeChanged: function attributeChanged(name) {
        var _this = this;

        if (name === 'theme') loadTheme(this.props.theme);
        if (hasCompanion(this)) raf(function () {
          return _this.render();
        });
      },
      init: function init() {
        var _this2 = this;

        if (!loadHLJS) {
          loadHLJS = resolveHLJS(this.props.theme);
          ustyler('*:not(pre)>code[is="uce-highlight"]{display:inline;}' + 'pre>code.uce-highlight{position:absolute;transform:translateY(-100%);}' + 'code.uce-highlight{transition:opacity .3s;font-size:inherit;}');
        }

        raf(function () {
          _this2.multiLine = /^pre$/i.test(_this2.parentNode.nodeName);
          _this2.contentEditable = _this2.multiLine;

          _this2.render();
        });
      },
      onfocus: function onfocus() {
        this.editing = true;

        if (hasCompanion(this)) {
          var currentTarget = this.nextElementSibling;
          if (currentTarget.style.display != 'none') pointerover({
            currentTarget: currentTarget
          });
        }
      },
      onblur: function onblur() {
        var _this3 = this;

        this.editing = false;

        if (hasCompanion(this)) {
          this.nextElementSibling.removeEventListener('transitionend', transitionend);
          var style = this.nextElementSibling.style;
          style.opacity = 0;
          style.display = null;
          raf(function () {
            update(_this3);
            style.opacity = 1;
          });
        }
      },
      onkeydown: function onkeydown(event) {
        if (event.keyCode == 83 && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          this.dispatchEvent(new CustomEvent('controlSave'));
        }
      },
      onpointerout: function onpointerout() {
        if (!this.editing) this.onblur();
      },
      onpaste: function onpaste(event) {
        event.preventDefault();
        var paste = (event.clipboardData || clipboardData).getData('text');
        if (paste.length) document.execCommand('insertText', null, paste);
        /*
        const selection = getSelection();
        if (selection.rangeCount) {
          const paste = (event.clipboardData || clipboardData).getData('text');
          selection.deleteFromDocument();
          selection.getRangeAt(0).insertNode(
            document.createTextNode(paste.replace(/\r\n/g, '\n'))
          );
          selection.collapseToEnd();
        }
        */
      },
      render: function render() {
        var _this4 = this;

        loadHLJS.then(function () {
          return update(_this4);
        });
      }
    });
  });

}());
