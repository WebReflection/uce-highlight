(function () {
  'use strict';

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

  /*! (c) Andrea Giammarchi - ISC */
  var assign = Object.assign || function (target) {
    for (var o, i = 1; i < arguments.length; i++) {
      o = arguments[i] || {};

      for (var k in o) {
        if (o.hasOwnProperty(k)) target[k] = o[k];
      }
    }

    return target;
  };

  var CDN = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3';

  var append = function append(what) {
    document.head.appendChild(what);
  };

  var create = function create(what, attrs) {
    return assign(document.createElement(what), attrs);
  }; // list of themes in the CSS section
  // https://cdnjs.com/libraries/highlight.js
  // just pass the theme name: /style/{{name}}.min.css
  // i.e. loadTheme('tomorrow-night')


  var themeCache = new Map();
  var loadTheme = function loadTheme(theme) {
    var link = themeCache.get(theme);
    if (!link) themeCache.set(theme, link = create('link', {
      href: "".concat(CDN, "/styles/").concat(theme, ".min.css"),
      rel: 'stylesheet'
    }));
    themeCache.forEach(function (live) {
      if (live !== link && live.parentNode) live.parentNode.removeChild(live);
    });
    append(link);
  };
  var raf = function raf(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  };
  var resolveHLJS = function resolveHLJS(theme) {
    return new Promise(function (onload) {
      var t = theme || 'default';

      if (window.hljs) {
        [].some.call(document.querySelectorAll('link'), function (link) {
          var rel = link.rel,
              href = link.href;

          if (/stylesheet/i.test(rel) && /\/highlight\.js\//.test(href)) {
            themeCache.set(t, link);
            return true;
          }
        });
        onload();
      } else {
        loadTheme(t);
        append(create('script', {
          src: "".concat(CDN, "/highlight.min.js"),
          onload: onload
        }));
      }
    });
  };

  function _templateObject3() {
    var data = _taggedTemplateLiteral(["<code></code>"]);

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
  customElements.whenDefined('uce-lib').then(function () {
    var _customElements$get = customElements.get('uce-lib'),
        define = _customElements$get.define,
        html = _customElements$get.html;

    var loadHLJS = null;
    define('uce-highlight', {
      "extends": 'code',
      observedAttributes: ['lang', 'theme'],
      attributeChanged: function attributeChanged(name, _, val) {
        if (name === 'theme') loadTheme(val);
        if (this._code) this.render();
      },
      init: function init() {
        if (!loadHLJS) {
          loadHLJS = resolveHLJS(this.props.theme);
          var ucehl = 'uce-highlight';
          var oh = 'overflow:hidden;';
          ustyler("*:not(pre)>code[is=\"".concat(ucehl, "\"]{display:inline}") + "pre.".concat(ucehl, "{").concat(oh, "padding:0;position:relative}") + "pre.".concat(ucehl, ">*{box-sizing:border-box}") + "pre.".concat(ucehl, ">.").concat(ucehl, "{position:absolute}") + "pre.".concat(ucehl, ">code.").concat(ucehl, "{").concat(oh, "top:0;left:0;width:100%;pointer-events:none}") + "select.".concat(ucehl, "{top:1px;right:1px;border:0}") + "select.".concat(ucehl, ":not(:focus):not(:hover){opacity:.5}") + "[dir=\"rtl\"] select.".concat(ucehl, "{left:1px;right:auto}") + "code.".concat(ucehl, ",select.").concat(ucehl, "{transition:opacity .3s}"));
        }

        var parentNode = this.parentNode;
        this.multiLine = /^pre$/i.test(parentNode.nodeName);
        this.contentEditable = this.multiLine;
        this._code = null;
        if (this.multiLine) parentNode.classList.add('uce-highlight');
        this.classList.add('hljs');
        this.render();
      },
      onfocus: function onfocus() {
        this.editing = true;
        if (this._code) this._code.style.opacity = 0;
      },
      onblur: function onblur() {
        this.editing = false;
        if (this._code) this.render();
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
      onpaste: function onpaste(event) {
        event.preventDefault();
        var paste = (event.clipboardData || clipboardData).getData('text');
        if (paste.length) document.execCommand('insertText', null, paste);
      },
      onchange: function onchange(_ref) {
        var currentTarget = _ref.currentTarget;
        this.setAttribute('lang', currentTarget.value);
      },
      onscroll: function onscroll() {
        this.scrollSync();
      },
      onmousewheel: function onmousewheel() {
        this.scrollSync();
      },
      scrollSync: function scrollSync() {
        if (this._code) {
          this._code.scrollTop = this.scrollTop;
          this._code.scrollLeft = this.scrollLeft;
        }
      },
      render: function render() {
        var _this = this;

        if (this.multiLine) loadHLJS.then(function () {
          var _window = window,
              hljs = _window.hljs;
          var _code = _this._code,
              props = _this.props;

          if (!_code) {
            var langs = hljs.listLanguages();
            var select = html.node(_templateObject(), _this, langs.map(function (lang) {
              return html.node(_templateObject2(), lang, lang);
            }));
            var index = langs.indexOf(props.lang);
            select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;

            _this.parentNode.insertBefore(select, _this.nextSibling);

            _this._code = _code = html.node(_templateObject3());
            _code.style.opacity = 0;

            _this.parentNode.insertBefore(_code, select);
          }

          _code.className = "".concat(props.lang || 'plaintext', " uce-highlight");
          _code.innerHTML = _this.innerHTML.replace(/<(?:div|p)>/g, '\n').replace(/<[^>]+?>/g, '');
          hljs.highlightBlock(_code);

          _this.scrollSync();

          if (!_this.editing) raf(function () {
            return _code.style.opacity = 1;
          });
        });
      }
    });
  });

}());
