// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
System.register("https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/parseTemplateLiteral", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function parseTemplateLiteral(strings, expressions) {
        let counter = 0;
        const parse = (strings, expressions) => {
            function zip(nestedArray) {
                return nestedArray[0].map((_, i) => nestedArray.map(innerArray => innerArray[i]));
            }
            function assertString(str) {
                return typeof str === "string" ? str : "";
            }
            function separateEventListenersFromTheRest(strings, expressions) {
                return zip([strings, expressions]).reduce((acc, el, i) => {
                    acc[0][0] += el[0];
                    if (typeof el[1] === "function")
                        acc[1].push(el[1]);
                    else
                        acc[0][0] += Array.isArray(el[1])
                            ? el[1].join("")
                            : assertString(el[1]);
                    return acc;
                }, [[""], []]);
            }
            function parseCustomString(regExp) {
                function separateSelectorsAndEventObjects(input) {
                    return input[1]
                        .split(/ (.+)/)
                        .filter(s => s !== "")
                        .map((el, i, array) => {
                        return i === 0
                            ? el
                            : {
                                [array[0]]: [...el.matchAll(eventRegexp)].map(input => [input[1], eventListeners[counter++]]),
                            };
                    });
                }
                function sortSelectorsAndEventsObjects(acc, ele) {
                    typeof ele === "string"
                        ? acc[0].push(ele)
                        : (acc[1] = { ...acc[1], ...ele });
                    return acc;
                }
                return [...str.matchAll(regExp)]
                    .map(separateSelectorsAndEventObjects)
                    .flat(1)
                    .reduce(sortSelectorsAndEventsObjects, [[], {}]);
            }
            function cleanString(str) {
                function isPresent(t) {
                    return t !== undefined && t !== null;
                }
                return [...str.matchAll(wholeEventStringsRegexp)]
                    .map(e => e[2])
                    .filter(isPresent)
                    .reduce((acc, s) => acc.replace(s, ""), str)
                    .replace(extraSyntaxRegexp, "");
            }
            const idRegexp = /@id\s?=\s?[",',`](.*?)[",',`]/g;
            const classRegexp = /@class\s?=\s?[",',`](.*?)[",',`]/g;
            const eventRegexp = /on([a-z]*)\s?=\s?/g;
            const wholeEventStringsRegexp = /(@id\s?=\s?|\s?@class=\s?).*?( on[a-z]*?\s?=\s?.*?)[",',`]/g;
            const extraSyntaxRegexp = /@/g;
            const [[str], eventListeners] = separateEventListenersFromTheRest(strings, expressions);
            const [idSelectors, eventsWithId] = parseCustomString(idRegexp);
            const [classSelectors, eventsWithClass] = parseCustomString(classRegexp);
            const htmlString = cleanString(str);
            if (!htmlString)
                console.error("No htmlString: Check the syntax inside your render function");
            return {
                htmlString,
                idSelectors,
                classSelectors,
                events: { ...eventsWithId, ...eventsWithClass },
            };
        };
        return parse(strings, expressions);
    }
    exports_1("parseTemplateLiteral", parseTemplateLiteral);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/globalEventsSet", [], function (exports_2, context_2) {
    "use strict";
    var globalEventsSet;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            exports_2("globalEventsSet", globalEventsSet = new Set([
                "abort",
                "animationcancel",
                "animationend",
                "animationiteration",
                "animationstart",
                "auxclick",
                "blur",
                "cancel",
                "canplay",
                "canplaythrough",
                "change",
                "click",
                "close",
                "contextmenu",
                "cuechange",
                "dblclick",
                "drag",
                "dragend",
                "dragenter",
                "dragexit",
                "dragleave",
                "dragover",
                "dragstart",
                "drop",
                "durationchange",
                "emptied",
                "ended",
                "error",
                "focus",
                "focusin",
                "focusout",
                "gotpointercapture",
                "input",
                "invalid",
                "keydown",
                "keypress",
                "keyup",
                "load",
                "loadeddata",
                "loadedmetadata",
                "loadstart",
                "lostpointercapture",
                "mousedown",
                "mouseenter",
                "mouseleave",
                "mousemove",
                "mouseout",
                "mouseover",
                "mouseup",
                "pause",
                "play",
                "playing",
                "pointercancel",
                "pointerdown",
                "pointerenter",
                "pointerleave",
                "pointermove",
                "pointerout",
                "pointerover",
                "pointerup",
                "progress",
                "ratechange",
                "reset",
                "resize",
                "scroll",
                "securitypolicyviolation",
                "seeked",
                "seeking",
                "select",
                "selectionchange",
                "selectstart",
                "stalled",
                "submit",
                "suspend",
                "timeupdate",
                "toggle",
                "touchcancel",
                "touchend",
                "touchmove",
                "touchstart",
                "transitioncancel",
                "transitionend",
                "transitionrun",
                "transitionstart",
                "volumechange",
                "waiting",
                "wheel",
            ]));
        }
    };
});
System.register("https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/utils/createHtmlTemplate", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    function createHtmlTemplate(html) {
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        return template;
    }
    exports_3("createHtmlTemplate", createHtmlTemplate);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/decorators", [], function (exports_4, context_4) {
    "use strict";
    var legacyCustomElement, standardCustomElement, customElement;
    var __moduleName = context_4 && context_4.id;
    //////////////////////////////
    function property({ reflect = true, rerender = true, isDisablingAttributes = false, } = {}) {
        return (protoOrDescriptor, name) => {
            if (isDisablingAttributes === false) {
                const observedAttributesArray = protoOrDescriptor.constructor.observedAttributes || [];
                observedAttributesArray.push(protoOrDescriptor.convertCamelToDash(name));
                Object.defineProperty(protoOrDescriptor.constructor, "observedAttributes", {
                    enumerable: true,
                    configurable: true,
                    get() {
                        return observedAttributesArray;
                    },
                });
            }
            if (!protoOrDescriptor.argsFromPropertyDecorator)
                Object.defineProperty(protoOrDescriptor, "argsFromPropertyDecorator", {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: [],
                });
            if (!name)
                throw new Error("the property option must be a non-empty string");
            const propertyOptions = {
                property: name,
                reflect: isDisablingAttributes ? false : reflect,
                rerender: rerender,
            };
            protoOrDescriptor.argsFromPropertyDecorator.push(propertyOptions);
        };
    }
    exports_4("property", property);
    return {
        setters: [],
        execute: function () {
            legacyCustomElement = (tagName, clazz) => {
                Object.defineProperty(clazz, "is", {
                    get: function () {
                        return tagName;
                    },
                });
                window.customElements.define(tagName, clazz);
                return clazz;
            };
            standardCustomElement = (tagName, descriptor) => {
                const { kind, elements } = descriptor;
                return {
                    kind,
                    elements,
                    // This callback is called once the class is otherwise fully defined
                    finisher(clazz) {
                        Object.defineProperty(clazz, "is", {
                            get: function () {
                                return tagName;
                            },
                        });
                        window.customElements.define(tagName, clazz);
                    },
                };
            };
            exports_4("customElement", customElement = (tagName) => (classOrDescriptor) => typeof classOrDescriptor === "function"
                ? legacyCustomElement(tagName, classOrDescriptor)
                : standardCustomElement(tagName, classOrDescriptor));
        }
    };
});
System.register("https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/shadowBase", ["https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/parseTemplateLiteral", "https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/globalEventsSet", "https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/utils/createHtmlTemplate", "https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/decorators"], function (exports_5, context_5) {
    "use strict";
    var parseTemplateLiteral_ts_1, globalEventsSet_ts_1, createHtmlTemplate_ts_1, ShadowBaseError, ShadowBase;
    var __moduleName = context_5 && context_5.id;
    var exportedNames_1 = {
        "ShadowBaseError": true,
        "ShadowBase": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_5(exports);
    }
    return {
        setters: [
            function (parseTemplateLiteral_ts_1_1) {
                parseTemplateLiteral_ts_1 = parseTemplateLiteral_ts_1_1;
            },
            function (globalEventsSet_ts_1_1) {
                globalEventsSet_ts_1 = globalEventsSet_ts_1_1;
            },
            function (createHtmlTemplate_ts_1_1) {
                createHtmlTemplate_ts_1 = createHtmlTemplate_ts_1_1;
            },
            function (decorators_ts_1_1) {
                exportStar_1(decorators_ts_1_1);
            }
        ],
        execute: function () {
            ShadowBaseError = class ShadowBaseError extends Error {
                constructor(message) {
                    super(message);
                    this.message = message;
                    this.name = this.constructor.name;
                }
            };
            exports_5("ShadowBaseError", ShadowBaseError);
            ShadowBase = class ShadowBase extends HTMLElement {
                constructor() {
                    super();
                    this.accessorsStore = {};
                    this.eventListeners = [];
                    this.root = this.attachShadow({ mode: "open" });
                    this.dom = {};
                    this.cssTemplates = [];
                    this.renderingCount = 0;
                    this.connected = false;
                    this.isRerenderingCss = false;
                    this.parseTemplateLiteral = parseTemplateLiteral_ts_1.parseTemplateLiteral;
                    this.createHtmlTemplate = createHtmlTemplate_ts_1.createHtmlTemplate;
                }
                connectedCallback() {
                    if (this.argsFromPropertyDecorator)
                        this.makeSetters(this.argsFromPropertyDecorator);
                    this.render();
                    this.connected = true;
                }
                attributeChangedCallback(name, oldValue, newValue) {
                    if (newValue === oldValue)
                        return;
                    else if (this.connected) {
                        return this.update({ name, newValue, isRendering: true });
                    }
                    else {
                        return this.update({ name, newValue, isRendering: false });
                    }
                }
                convertAttributeToJs(attributeValue) {
                    try {
                        return attributeValue === null
                            ? attributeValue
                            : JSON.parse(attributeValue);
                    }
                    catch (err) {
                        return attributeValue;
                    }
                }
                updateAttribute(attributeName, value) {
                    return value === null
                        ? this.removeAttribute(attributeName)
                        : typeof value === "string"
                            ? this.setAttribute(attributeName, value)
                            : this.setAttribute(attributeName, JSON.stringify(value));
                }
                makeSetters(properties) {
                    const coupleSettersAndGettersToAttributes = ({ property, reflect, rerender, }) => {
                        const setter = (value) => {
                            const attributeName = this.convertCamelToDash(property);
                            const attributeValue = this.getAttribute(attributeName);
                            this.accessorsStore[property] = value;
                            if (this.connected && reflect === false && rerender === true) {
                                this.render();
                            }
                            else if (reflect === true &&
                                attributeValue !== value &&
                                attributeValue !== JSON.stringify(value)) {
                                this.updateAttribute(attributeName, value);
                            }
                            return value;
                        };
                        const getter = () => this.accessorsStore[property];
                        Object.defineProperty(this, property, {
                            get: getter,
                            set: setter,
                        });
                        return property;
                    };
                    return properties.map(element => {
                        const property = typeof element === "string" ? element : element.property;
                        const reflect = typeof element === "object" && element.reflect === false ? false : true;
                        const rerender = typeof element === "object" && element.rerender === false ? false : true;
                        this.accessorsStore[property] = this[property];
                        if (reflect && this.getAttribute(property) === null)
                            this.updateAttribute(property, this[property]);
                        return coupleSettersAndGettersToAttributes({
                            property,
                            reflect,
                            rerender,
                        });
                    });
                }
                update({ name, newValue, isRendering = true, }) {
                    const property = this.convertDashToCamel(name);
                    if (property in this &&
                        this[property] !== newValue &&
                        JSON.stringify(this[property]) !== newValue) {
                        ;
                        this[property] = this.convertAttributeToJs(newValue);
                    }
                    if (this.connected && isRendering) {
                        this.render();
                    }
                }
                css(strings, ...expressions) {
                    function zip(nestedArray) {
                        return nestedArray[0].map((_, i) => nestedArray.map(innerArray => innerArray[i]));
                    }
                    function assertString(str) {
                        return typeof str === "string" ? str : "";
                    }
                    if (this.connected && !this.isRerenderingCss)
                        return null;
                    if (this.isRerenderingCss)
                        this.cssTemplates.pop();
                    const cssString = zip([strings, expressions])
                        .map(element => element.map(el => {
                        if (el instanceof HTMLTemplateElement)
                            this.cssTemplates.unshift(el);
                        return assertString(el);
                    }))
                        .flat()
                        .join("");
                    return this.cssTemplates.push(this.createHtmlTemplate(`<style>${cssString}</style>`));
                }
                html(strings, ...expressions) {
                    function isGlobalEvent(events) {
                        return Object.entries(events).every(([_, eventsArray]) => {
                            return eventsArray.every(e => globalEventsSet_ts_1.globalEventsSet.has(e[0]));
                        });
                    }
                    const { htmlString, idSelectors, classSelectors, events, } = this.parseTemplateLiteral(strings, expressions);
                    this.root.innerHTML = htmlString;
                    this.renderingCount++;
                    console.log("INNERHTML CHANGED!", this.renderingCount, this.constructor.is);
                    this.cssTemplates.forEach(template => this.cloneTemplateIntoParent(template, this.root));
                    if (isGlobalEvent(events)) {
                        this.addEventListeners(events, this.queryDomSelectionAndAddClassesAndIds(idSelectors, classSelectors));
                    }
                    else {
                        throw new ShadowBaseError("Invalid event");
                    }
                    if (!this.connected) {
                        this.dispatchEvent(this.createEvent("rendered"));
                    }
                    else {
                        this.dispatchEvent(this.createEvent("updated"));
                    }
                    return this.root.innerHTML;
                }
                queryDomSelectionAndAddClassesAndIds(idSelectors, classSelectors) {
                    function isHTMLElement(element) {
                        return element instanceof HTMLElement;
                    }
                    const processIdSelectors = (idSelectors) => {
                        return idSelectors.map(selector => {
                            const element = this.root.getElementById(selector);
                            if (isHTMLElement(element))
                                return { [selector]: this.dom[selector] = element };
                            else
                                throw new ShadowBaseError(`Cannot find an HTMLElement with id selector '${selector}'`);
                        });
                    };
                    const processClassSelectors = (classSelectors) => {
                        return classSelectors.map(selector => {
                            const collection = [
                                ...this.root.querySelectorAll("." + selector),
                            ].filter(isHTMLElement);
                            if (collection.length === 0)
                                throw new ShadowBaseError(`Cannot find an HTMLElement with class selector '${selector}'`);
                            return { [selector]: collection };
                        });
                    };
                    return [
                        processIdSelectors(idSelectors),
                        processClassSelectors(classSelectors),
                    ];
                }
                addEventListeners(events, [elementsById, elementsByClass]) {
                    Object.entries(events).map(([selector, eventsCollection]) => {
                        const elementOrArrayObj = elementsById.find(el => el[selector] instanceof HTMLElement) ||
                            elementsByClass.find(el => Array.isArray(el[selector]));
                        if (elementOrArrayObj) {
                            const elementOrArray = elementOrArrayObj[selector];
                            if (Array.isArray(elementOrArray)) {
                                elementOrArray.forEach((el) => eventsCollection.forEach(ev => el.addEventListener(ev[0], ev[1])));
                            }
                            else {
                                eventsCollection.forEach((ev) => {
                                    return elementOrArray.addEventListener(ev[0], ev[1]);
                                });
                            }
                        }
                        return elementOrArrayObj;
                    });
                }
                changeCssProperty(cssProperty, cssValue) {
                    return this.style[cssProperty] === cssValue
                        ? cssValue
                        : (this.style[cssProperty] = cssValue);
                }
                changeCssVariable(cssVariable, cssValue) {
                    if (this.style.getPropertyValue(cssVariable) !== cssValue)
                        this.style.setProperty(cssVariable, cssValue);
                    return cssVariable;
                }
                convertDashToCamel(str) {
                    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                }
                convertCamelToDash(str) {
                    return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
                }
                cloneTemplateIntoParent(template, parentElement) {
                    parentElement.append(template.content.cloneNode(true));
                    return template;
                }
                findElementInEventPath(event, selector) {
                    function predicate(eventTarget, selector) {
                        if (eventTarget instanceof HTMLElement)
                            return eventTarget.matches(selector);
                        else
                            return false;
                    }
                    const foundElement = event
                        .composedPath()
                        .find((eventTarget) => predicate(eventTarget, selector));
                    return foundElement ? foundElement : null;
                }
                waitForEventOnce(eventTarget, eventName) {
                    return new Promise(resolve => {
                        function listener(event) {
                            resolve(event);
                            eventTarget.removeEventListener(eventName, listener);
                        }
                        eventTarget.addEventListener(eventName, listener);
                    });
                }
                createEvent(eventName, { bubbles, composed, detail, } = {}) {
                    return new CustomEvent(eventName, {
                        bubbles: bubbles === undefined ? true : bubbles,
                        composed: composed === undefined ? true : composed,
                        detail: detail === undefined ? this.constructor.is : detail,
                    });
                }
                addCss(str) {
                    function addCssRules(styleElement, ruleSet) {
                        return styleElement.sheet
                            ? styleElement.sheet.insertRule(ruleSet, styleElement.sheet.cssRules.length)
                            : null;
                    }
                    const styleElement = this.root.querySelectorAll("style");
                    return addCssRules(styleElement.item(styleElement.length - 1), str);
                }
                getSlotElements() {
                    return [...this.children];
                }
                observeScroll(callback, options = {}, isDisconnecting = true) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (callback(entry) === false)
                                return;
                            // Stop watching the element
                            if (isDisconnecting)
                                observer.disconnect();
                        });
                    }, {
                        root: options.root === undefined ? null : options.root,
                        rootMargin: options.rootMargin === undefined ? "0px" : options.rootMargin,
                        threshold: options.threshold === undefined ? [1] : options.threshold,
                    });
                    // Start watching the element
                    observer.observe(this);
                }
                nextFrame() {
                    return new Promise(resolve => requestAnimationFrame(() => resolve()));
                }
                delay(value, duration = 100) {
                    return new Promise(function makePromiseInsideDelay(resolve, reject) {
                        setTimeout(function () {
                            try {
                                const result = typeof value === "function" ? value() : value;
                                resolve(result);
                            }
                            catch (err) {
                                reject(err);
                            }
                        }, duration);
                    });
                }
                render() {
                    throw new ShadowBaseError("The render method must be defined");
                }
            };
            exports_5("ShadowBase", ShadowBase);
        }
    };
});
System.register("https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/utils/wcCssReset", ["https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/utils/createHtmlTemplate"], function (exports_6, context_6) {
    "use strict";
    var createHtmlTemplate_ts_2, wcCssReset;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (createHtmlTemplate_ts_2_1) {
                createHtmlTemplate_ts_2 = createHtmlTemplate_ts_2_1;
            }
        ],
        execute: function () {
            exports_6("wcCssReset", wcCssReset = createHtmlTemplate_ts_2.createHtmlTemplate(`<style>
  :host {
    display: block;
    box-sizing: border-box;
    cursor: default;
    word-break: break-word;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
    color: inherit;
  }
  p,
  ol,
  ul,
  li,
  dl,
  dt,
  dd,
  blockquote,
  figure,
  fieldset,
  legend,
  textarea,
  pre,
  iframe,
  hr,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    padding: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: 100%;
    font-weight: normal;
  }

  p {
    line-height: 1.647;
  }

  ul {
    list-style: none;
  }

  button,
  input,
  select {
    margin: 0;
  }

  img,
  video {
    height: auto;
    max-width: 100%;
  }

  iframe {
    border: 0;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    padding: 0;
  }

  td:not([align]),
  th:not([align]) {
    text-align: left;
  }
  </style>`));
        }
    };
});
System.register("file:///home/ubustreet/Workspace/javascript/myWebComponents/anchorButton/anchorButton", ["https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/shadowBase", "https://cdn.jsdelivr.net/gh/timonson/shadowBase@latest/utils/wcCssReset"], function (exports_7, context_7) {
    "use strict";
    var shadowBase_ts_1, wcCssReset_ts_1, AnchorButton;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (shadowBase_ts_1_1) {
                shadowBase_ts_1 = shadowBase_ts_1_1;
            },
            function (wcCssReset_ts_1_1) {
                wcCssReset_ts_1 = wcCssReset_ts_1_1;
            }
        ],
        execute: function () {
            AnchorButton = /** @class */ (() => {
                let AnchorButton = class AnchorButton extends shadowBase_ts_1.ShadowBase {
                    constructor() {
                        super(...arguments);
                        this.anchorHref = "#";
                        this.innerContent = this.innerHTML;
                    }
                    connectedCallback() {
                        super.connectedCallback();
                    }
                    attributeChangedCallback(name, oldValue, newValue) {
                        if (newValue === oldValue)
                            return;
                        switch (name) {
                            case "inner-content":
                                if (this.connected)
                                    this.dom["aId"].innerHTML = newValue || "";
                                break;
                            case "anchor-href":
                                if (this.connected)
                                    this.dom["aId"].setAttribute("href", newValue || "");
                            default:
                                this.update({ name, newValue, isRendering: true });
                        }
                        this.update({ name, newValue, isRendering: false });
                    }
                    render() {
                        this.css `
    ${wcCssReset_ts_1.wcCssReset}
      :host {
        display: inline-block;
        box-sizing: border-box;
        height: 40px;
        background-color: var(--anchor-bg-color, var(--secondary-color, #3ecf8e));
        color:var(--anchor-color, var(--primary-light, inherit));
        font-size: 15px;
        font-weight: 600;
        padding: 0 14px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11),
          0 1px 3px rgba(0, 0, 0, 0.08);
      }
      :host(:hover) {
        transform: translateY(-1px);
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1),
          0 3px 6px rgba(0, 0, 0, 0.08);
      }
      :host(:focus) {
        transform: translateY(-1px);
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1),
          0 3px 6px rgba(0, 0, 0, 0.08);
      }
      :host(:active) {
        transform: translateY(1px);
        box-shadow: 0 6px 12px -2px rgba(50, 50, 93, 0.25),
          0 3px 7px -3px rgba(0, 0, 0, 0.3);
      }
      *,
      *::before,
      *::after {
        box-sizing: inherit;
        font: inherit;
        color: inherit;
        cursor: inherit;
      }

      a {
        height: 100%;
        width: 100%;
        white-space: nowrap;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        letter-spacing: 0.025em;
        text-decoration: none;
        outline: none;
        text-shadow: 0 1px 3px rgba(36, 180, 126, 0.4);
      }
    `;
                        return this.html `
      <a @id="aId" anchor-href="${this.anchorHref}">
        ${this.innerContent}
      </a>
    `;
                    }
                };
                __decorate([
                    shadowBase_ts_1.property()
                ], AnchorButton.prototype, "anchorHref", void 0);
                __decorate([
                    shadowBase_ts_1.property()
                ], AnchorButton.prototype, "innerContent", void 0);
                AnchorButton = __decorate([
                    shadowBase_ts_1.customElement("anchor-button")
                ], AnchorButton);
                return AnchorButton;
            })();
            exports_7("AnchorButton", AnchorButton);
        }
    };
});

const __exp = __instantiate("file:///home/ubustreet/Workspace/javascript/myWebComponents/anchorButton/anchorButton", false);
export const AnchorButton = __exp["AnchorButton"];
