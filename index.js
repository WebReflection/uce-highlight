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

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  function _templateObject3() {
    var data = _taggedTemplateLiteral(["<code onmouseover=", " onmouseout=", "></code>"]);

    _templateObject3 = function _templateObject3() {
      return data;
    };

    return data;
  }

  function _templateObject2() {
    var data = _taggedTemplateLiteral(["<option value=", ">", "</option>"]);

    _templateObject2 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _templateObject() {
    var data = _taggedTemplateLiteral(["<select class=\"hljs uce-highlight\" onchange=", ">", "</select>"]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  var CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

  var scrollSync = function scrollSync(a, b) {
    a.scrollTop = b.scrollTop;
    a.scrollLeft = b.scrollLeft;
  };

  var pointerout = function pointerout(_ref) {
    var style = _ref.currentTarget.style;
    if (style.opacity != 1) style.opacity = 1;
  };

  var hasCompanion = function hasCompanion(_ref2) {
    var nextElementSibling = _ref2.nextElementSibling;
    return !!nextElementSibling && nextElementSibling.classList.contains('uce-highlight');
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
    var style = currentTarget.style;

    if (style.opacity != 0) {
      scrollSync(currentTarget.previousSibling, currentTarget);
      currentTarget.addEventListener('transitionend', transitionend);
      style.opacity = 0;
    }
  };
  var raf = function raf(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  };
  var resolveHLJS = function resolveHLJS(theme) {
    return new Promise(function ($) {
      var t = theme || 'default';
      if (window.hljs) [].some.call(document.querySelectorAll('link'), function (link) {
        var rel = link.rel,
            href = link.href;

        if (/stylesheet/i.test(rel) && /\/highlight\.js\//.test(href)) {
          themeCache.set(t, link);
          return true;
        }
      });else {
        loadTheme(t);
        var script = document.createElement('script');
        script.src = CDN + '/highlight.min.js';
        script.onload = $;
        document.head.appendChild(script);
      }
    });
  };
  var transitionend = function transitionend(_ref4) {
    var style = _ref4.currentTarget.style,
        propertyName = _ref4.propertyName;

    if (propertyName === 'opacity' && style.opacity == 0) {
      style.display = 'none';
    }
  };
  var update = function update(self, _ref5) {
    var node = _ref5.node;
    var classList = self.classList,
        multiLine = self.multiLine;
    classList.add('hljs');

    if (multiLine) {
      var code = self.nextElementSibling;

      if (!hasCompanion(self)) {
        var langs = hljs.listLanguages();
        var select = node(_templateObject(), function (_ref6) {
          var currentTarget = _ref6.currentTarget;
          self.setAttribute('lang', currentTarget.value);
        }, langs.map(function (lang) {
          return node(_templateObject2(), lang, lang);
        }));
        var index = langs.indexOf(self.props.lang);
        select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;
        self.parentNode.insertBefore(select, self.nextSibling);
        code = node(_templateObject3(), pointerover, pointerout);
        var _code = code,
            style = _code.style;
        if (self.editing) style.display = 'none';else {
          style.opacity = 0;
          raf(function () {
            return style.opacity = 1;
          });
        }
        self.parentNode.insertBefore(code, select);
      }

      code.className = "".concat(self.props.lang || 'plaintext', " uce-highlight");
      code.innerHTML = self.innerHTML.replace(/<(?:div|p)>/g, '\n').replace(/<[^>]+?>/g, '');
      window.hljs.highlightBlock(code); // this is likely not needed
      //code.style.width = self.offsetWidth + 'px';
      //code.style.height = self.offsetHeight + 'px';

      scrollSync(code, self);
    }
  };

  customElements.whenDefined('uce-lib').then(function () {
    var _customElements$get = customElements.get('uce-lib'),
        define = _customElements$get.define,
        html = _customElements$get.html;

    var loadHLJS = null;
    define('uce-highlight', {
      "extends": 'code',
      observedAttributes: ['lang', 'theme'],
      attributeChanged: function attributeChanged(name, _, val) {
        var _this = this;

        if (name === 'theme') loadTheme(val);
        if (hasCompanion(this)) raf(function () {
          return _this.render();
        });
      },
      init: function init() {
        if (!loadHLJS) {
          loadHLJS = resolveHLJS(this.props.theme);
          var ucehl = 'uce-highlight';
          ustyler("*:not(pre)>code[is=\"".concat(ucehl, "\"]{display:inline}") + "pre.".concat(ucehl, "{position:relative}") + "pre.".concat(ucehl, ">.").concat(ucehl, "{position:absolute}") + "pre.".concat(ucehl, ">code.").concat(ucehl, "{top:0;left:0;width:100%}") + "pre.".concat(ucehl, ">select.").concat(ucehl, "{top:1px;right:1px;border:0}") + "code.".concat(ucehl, "{transition:opacity .3s}"));
        }

        this.multiLine = /^pre$/i.test(this.parentNode.nodeName);
        this.contentEditable = this.multiLine;
        if (this.multiLine) this.parentNode.classList.add('uce-highlight');
        this.render();
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
        var _this2 = this;

        this.editing = false;

        if (hasCompanion(this)) {
          var nextElementSibling = this.nextElementSibling;
          var style = nextElementSibling.style;
          nextElementSibling.removeEventListener('transitionend', transitionend);
          style.opacity = 0;
          style.display = null;
          raf(function () {
            update(_this2, html);
            style.opacity = 1;
          });
        }
      },
      onkeydown: function onkeydown(event) {
        var ctrlKey = event.metaKey || event.ctrlKey;

        if (ctrlKey && event.keyCode == 83) {
          event.preventDefault();
          this.dispatchEvent(new CustomEvent('controlSave', {
            bubbles: true
          }));
        }
      },
      onmouseout: function onmouseout() {
        this.onpointerout();
      },
      onpointerout: function onpointerout() {
        if (!this.editing) this.onblur();
      },
      onpaste: function onpaste(event) {
        event.preventDefault();
        var paste = (event.clipboardData || clipboardData).getData('text');
        if (paste.length) document.execCommand('insertText', null, paste);
      },
      render: function render() {
        var _this3 = this;

        loadHLJS.then(function () {
          update(_this3, html);
        });
      }
    });
  });

}());
