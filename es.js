!function(){"use strict";var e=Object.assign;const t="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3",i=e=>{document.head.appendChild(e)},s=(t,i)=>e(document.createElement(t),i),n=new Map,o=e=>{let o=n.get(e);o||n.set(e,o=s("link",{href:`${t}/styles/${e}.min.css`,rel:"stylesheet"})),n.forEach(e=>{e!==o&&e.parentNode&&e.parentNode.removeChild(e)}),i(o)};customElements.whenDefined("uce-lib").then(()=>{const{define:e,html:l}=customElements.get("uce-lib");let c=null;e("uce-highlight",{extends:"code",observedAttributes:["lang","theme"],attributeChanged(e,t,i){"theme"===e&&o(i),this._code&&this.render()},init(){if(!c){e=this.props.theme,c=new Promise(l=>{const c=e||"default";window.hljs?([].some.call(document.querySelectorAll("link"),e=>{const{rel:t,href:i}=e;if(/stylesheet/i.test(t)&&/\/highlight\.js\//.test(i))return n.set(c,e),!0}),l()):(o(c),i(s("script",{src:t+"/highlight.min.js",onload:l})))});const l="uce-highlight";!function(e){const t="string"==typeof e?[e]:[e[0]];for(let i=1,{length:s}=arguments;i<s;i++)t.push(arguments[i],e[i]);const i=document.createElement("style");i.type="text/css",i.appendChild(document.createTextNode(t.join(""))),document.head.appendChild(i)}(`*:not(pre)>code[is="${l}"]{display:inline}pre.${l}{position:relative}pre.${l}>.${l}{position:absolute}pre.${l}>code.${l}{top:0;left:0;width:100%;pointer-events:none}pre.${l}>select.${l}{top:1px;right:1px;border:0}[dir="rtl"] select.${l}{left:1px;right:auto !important}code.${l}{transition:opacity .3s}`)}var e;const{parentNode:l}=this;this.multiLine=/^pre$/i.test(l.nodeName),this.contentEditable=this.multiLine,this._code=null,this.multiLine&&l.classList.add("uce-highlight"),this.classList.add("hljs"),this.render()},onfocus(){this.editing=!0,this._code&&(this._code.style.opacity=0)},onblur(){this.editing=!1,this._code&&this.render()},onkeydown(e){(e.metaKey||e.ctrlKey)&&83==e.keyCode&&(e.preventDefault(),this.dispatchEvent(new CustomEvent("controlSave",{bubbles:!0})))},onpaste(e){e.preventDefault();const t=(e.clipboardData||clipboardData).getData("text");t.length&&document.execCommand("insertText",null,t)},onchange({currentTarget:e}){this.setAttribute("lang",e.value)},onscroll(){this.scrollSync()},onmousewheel(){this.scrollSync()},scrollSync(){this._code&&(this._code.scrollTop=this.scrollTop,this._code.scrollLeft=this.scrollLeft)},render(){this.multiLine&&c.then(()=>{const{hljs:e}=window;let{_code:t,props:i}=this;if(!t){const s=e.listLanguages(),n=l.node`<select class="hljs uce-highlight" onchange=${this}>${s.map(e=>l.node`<option value=${e}>${e}</option>`)}</select>`,o=s.indexOf(i.lang);n.selectedIndex=o<0?s.indexOf("plaintext"):o,this.parentNode.insertBefore(n,this.nextSibling),this._code=t=l.node`<code></code>`,t.style.opacity=0,this.parentNode.insertBefore(t,n)}var s;t.className=(i.lang||"plaintext")+" uce-highlight",t.innerHTML=this.innerHTML.replace(/<(?:div|p)>/g,"\n").replace(/<[^>]+?>/g,""),e.highlightBlock(t),this.scrollSync(),this.editing||(s=()=>t.style.opacity=1,requestAnimationFrame(()=>{requestAnimationFrame(s)}))})}})})}();
