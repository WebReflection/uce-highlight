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
  var privates = new WeakMap();

  var sanitize = function sanitize(_, nl, spaces, code) {
    return "".concat(nl ? '<br>' : '').concat(spaces, "<span>").concat(code, "</span>");
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
        if (name === 'theme') loadTheme(val);
        if (privates.get(this).code) this.render();
      },
      init: function init() {
        privates.set(this, {
          editing: false,
          code: null
        });

        if (!loadHLJS) {
          loadHLJS = resolveHLJS(this.props.theme);
          var ucehl = 'uce-highlight';
          var pre = "pre.".concat(ucehl);
          var code = "code.".concat(ucehl);
          var select = "select.".concat(ucehl);
          var oh = 'overflow:hidden;';
          ustyler("*:not(pre)>code[is=\"".concat(ucehl, "\"]{display:inline}") + "".concat(pre, "{").concat(oh, "padding:0;position:relative}") + "".concat(pre, ">*{box-sizing:border-box}") + "".concat(pre, ">code[is=\"").concat(ucehl, "\"]{min-height:40px}") + "".concat(pre, ">.").concat(ucehl, "{position:absolute}") + "".concat(pre, ">").concat(code, "{").concat(oh, "top:0;left:0;width:100%;pointer-events:none}") + "".concat(pre, ">").concat(code, ">span{white-space:nowrap}") + "".concat(select, "{top:1px;right:1px;border:0}") + "".concat(select, ":not(:focus):not(:hover){opacity:.5}") + "[dir=\"rtl\"] ".concat(select, "{left:1px;right:auto}") + "".concat(code, ",").concat(select, "{transition:opacity .3s}"));
        }

        var parentNode = this.parentNode;
        if (this.contentEditable = /^pre$/i.test(parentNode.nodeName)) parentNode.classList.add('uce-highlight');
        this.classList.add('hljs');
        this.render();
      },
      onfocus: function onfocus() {
        var _ = privates.get(this);

        _.editing = true;
        if (_.code) _.code.style.opacity = 0;
      },
      onblur: function onblur() {
        var _ = privates.get(this);

        _.editing = false;
        if (_.code) this.render();
      },
      onkeydown: function onkeydown(event) {
        var metaKey = event.metaKey,
            ctrlKey = event.ctrlKey,
            key = event.key;

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
      onpaste: function onpaste(event) {
        event.preventDefault();
        var paste = (event.clipboardData || clipboardData).getData('text');
        if (paste.length) addText.call(this, paste.replace(/\r\n/g, '\n'));
      },
      onchange: function onchange(_ref) {
        var currentTarget = _ref.currentTarget;
        this.setAttribute('lang', currentTarget.value);
      },
      onmousewheel: function onmousewheel() {
        scrollSync.call(this);
      },
      onscroll: function onscroll() {
        scrollSync.call(this);
      },
      render: function render() {
        var _this = this;

        if (this.contentEditable == 'true') loadHLJS.then(function () {
          var _ = privates.get(_this);

          var _window = window,
              hljs = _window.hljs;
          var lang = _this.props.lang;

          if (!_.code) {
            var node = html.node;
            var langs = hljs.listLanguages();
            var select = node(_templateObject(), _this, langs.map(function (lang) {
              return node(_templateObject2(), lang, lang);
            }));
            var index = langs.indexOf(lang);
            select.selectedIndex = index < 0 ? langs.indexOf('plaintext') : index;
            _.code = node(_templateObject3());
            _.code.style.opacity = 0;
            var parentNode = _this.parentNode;
            parentNode.insertBefore(select, _this.nextSibling);
            parentNode.insertBefore(_.code, select);
          }

          var textContent = _this.textContent;
          _.code.className = "".concat(lang || 'plaintext', " uce-highlight");
          _.code.textContent = _this.textContent = textContent;
          hljs.highlightBlock(_.code);
          _.code.innerHTML = _.code.innerHTML.replace(/(\r\n|\n)?(\s*)(.+)$/mg, sanitize);
          scrollSync.call(_this);
          if (!_.editing) raf(function () {
            return _.code.style.opacity = 1;
          });
        });
      }
    });
  });

  function addText(text) {
    var ownerDocument = this.ownerDocument;
    var selection = ownerDocument.getSelection();
    var range = selection.getRangeAt(0);
    var nl = ownerDocument.createTextNode(text);
    range.deleteContents();
    range.insertNode(nl);
    range.selectNode(nl);
    selection.removeAllRanges();
    selection.addRange(range);
    selection.collapseToEnd();
  }

  function scrollSync() {
    var _privates$get = privates.get(this),
        code = _privates$get.code;

    if (code) {
      code.scrollTop = this.scrollTop;
      code.scrollLeft = this.scrollLeft;
    }
  }

}());
