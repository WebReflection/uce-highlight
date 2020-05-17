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

  var mouseout = function mouseout(_ref) {
    var currentTarget = _ref.currentTarget;
    currentTarget.style.opacity = 1;
  };

  var hasCompanion = function hasCompanion(_ref2) {
    var nextElementSibling = _ref2.nextElementSibling;
    return nextElementSibling && nextElementSibling.classList.contains('uce-highlight');
  };
  var mouseover = function mouseover(_ref3) {
    var currentTarget = _ref3.currentTarget;
    currentTarget.addEventListener('transitionend', transitionend);
    currentTarget.style.opacity = 0;
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
  var transitionend = function transitionend(_ref4) {
    var style = _ref4.currentTarget.style,
        propertyName = _ref4.propertyName;

    if (propertyName === 'opacity' && style.opacity == 0) {
      style.display = 'none';
    }
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
        code.addEventListener('mouseover', mouseover);
        code.addEventListener('mouseout', mouseout);
        self.parentNode.insertBefore(code, self.nextSibling);
      } else code.innerHTML = innerHTML.replace(/<div>/g, '\n').replace(/<[>]+>/g, '\n');

      code.className = "".concat(props.lang, " uce-highlight");
      window.hljs.highlightBlock(code);
      code.style.width = self.offsetWidth + 'px';
      code.style.height = self.offsetHeight + 'px';
      code.scrollTop = self.scrollTop;
      code.scrollLeft = self.scrollLeft;
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
        if (name === 'theme') loadTheme(this.props.theme);
        this.render();
      },
      init: function init() {
        if (!loadHLJS) {
          loadHLJS = resolveHLJS(this.props.theme);
          ustyler('*:not(pre)>code[is="uce-highlight"]{display:inline;}' + 'pre>code.uce-highlight{position:absolute;transform:translateY(-100%);}' + 'code.uce-highlight{transition:opacity .3s;font-size:inherit;}');
        }

        this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
        this.contentEditable = this.multiLine;
        this.render();
      },
      onfocus: function onfocus() {
        this.editing = true;

        if (hasCompanion(this)) {
          var currentTarget = this.nextElementSibling;
          if (currentTarget.style.display != 'none') mouseover({
            currentTarget: currentTarget
          });
        }
      },
      onblur: function onblur() {
        var _this = this;

        this.editing = false;

        if (hasCompanion(this)) {
          this.nextElementSibling.removeEventListener('transitionend', transitionend);
          var style = this.nextElementSibling.style;
          style.opacity = 0;
          style.display = null;
          requestAnimationFrame(function () {
            return requestAnimationFrame(function () {
              update(_this);
              style.opacity = 1;
            });
          });
        }
      },
      onmouseout: function onmouseout() {
        if (!this.editing) this.onblur();
      },
      onpaste: function onpaste(event) {
        event.preventDefault();
        var selection = getSelection();

        if (selection.rangeCount) {
          var paste = (event.clipboardData || clipboardData).getData('text');
          selection.deleteFromDocument();
          selection.getRangeAt(0).insertNode(document.createTextNode(paste.replace(/\r\n/g, '\n')));
          selection.collapseToEnd();
        }
      },
      render: function render() {
        var _this2 = this;

        loadHLJS.then(function () {
          return update(_this2);
        });
      }
    });
  });

}());
