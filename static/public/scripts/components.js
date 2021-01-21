function createHtmlTemplate(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template;
}
function cloneTemplateIntoParent(template, parent, sibling) {
    if (sibling) parent.insertBefore(template.content.cloneNode(true), sibling);
    else parent.append(template.content.cloneNode(true));
    return template;
}
function zip(nestedArray) {
    return nestedArray[0].map((_, i)=>nestedArray.map((innerArray)=>innerArray[i]
        )
    );
}
function replaceCharAt(str, index, replace) {
    return str.substring(0, index) + replace + str.substring(index + 1);
}
function convertDashToCamel(str) {
    return str.replace(/-([a-z0-9])/g, (g)=>g[1].toUpperCase()
    );
}
function convertCamelToDash(str) {
    return str.replace(/([a-zA-Z0-9])(?=[A-Z])/g, "$1-").toLowerCase();
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new ShadowBaseError(msg);
    }
}
class ShadowBaseError extends Error {
    constructor(message){
        super(message);
        this.message = message;
        this.name = this.constructor.name;
    }
}
function isNull(input) {
    return input === null;
}
function isString(input) {
    return typeof input === "string";
}
function isNumber(input) {
    return typeof input === "number";
}
function isPresent(t) {
    return t !== undefined && t !== null;
}
const legacyCustomElement = (tagName, clazz)=>{
    tagName = tagName ? tagName : convertCamelToDash(clazz.name.replace(/\d+$/, ""));
    Object.defineProperty(clazz, "is", {
        get: function() {
            return tagName;
        }
    });
    window.customElements.define(tagName, clazz);
    return clazz;
};
const customElement = (tagName = "")=>(classOrDescriptor)=>{
        return typeof classOrDescriptor === "function" && legacyCustomElement(tagName, classOrDescriptor);
    }
;
function property({ reflect =true , wait =false , assert: assert1 = false  } = {
}) {
    return (protoOrDescriptor, name)=>{
        if (!name) {
            throw new ShadowBaseError("the property name must be a non-empty string");
        }
        if (reflect === true) {
            const observedAttributesArray = protoOrDescriptor.constructor.observedAttributes || [];
            observedAttributesArray.push(convertCamelToDash(name));
            Object.defineProperty(protoOrDescriptor.constructor, "observedAttributes", {
                enumerable: true,
                configurable: true,
                get () {
                    return observedAttributesArray;
                }
            });
        }
        if (!protoOrDescriptor.argsFromPropertyDecorator) {
            Object.defineProperty(protoOrDescriptor, "argsFromPropertyDecorator", {
                enumerable: false,
                configurable: true,
                writable: false,
                value: []
            });
        }
        protoOrDescriptor.argsFromPropertyDecorator.push({
            property: name,
            reflect,
            wait,
            assert: assert1
        });
    };
}
function isHTMLElement(element) {
    return element instanceof HTMLElement;
}
const globalEventsSet = new Set([
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
]);
function isGlobalEvent(events) {
    return Object.entries(events).every(([_, eventsArray])=>{
        return eventsArray.every((e)=>globalEventsSet.has(e[0])
        );
    });
}
const idRegexp = /@id\s?=\s?[",',`](.*?)[",',`]/g;
const classRegexp = /@class\s?=\s?[",',`](.*?)[",',`]/g;
const eventRegexp = /on([a-z]*)\s?=\s?/g;
const wholeEventStringsRegexp = /(@id\s?=\s?|\s?@class=\s?).*?( on[a-z]*?\s?=\s?.*?)[",',`]/g;
const extraSyntaxRegexpId = /@id/g;
const extraSyntaxRegexpClass = /@class/g;
function assertString(input) {
    return isString(input) ? input : isNumber(input) ? input.toString() : "";
}
function removeAttributesIfExpressionIsNull(firstPart, secondPart) {
    const maybeAttribute = firstPart.substring(firstPart.lastIndexOf(" ") + 1);
    return [
        firstPart.replace(" " + maybeAttribute, ""),
        replaceCharAt(secondPart, 0, ""), 
    ];
}
function separateEventListenersFromTheRest(strings, expressions) {
    return zip([
        strings,
        expressions
    ]).reduce((acc, el, i, array)=>{
        if (isNull(el[1]) && isString(el[0]) && [
            '="',
            "='"
        ].includes(el[0].substring(el[0].length - 2))) {
            const [firstPart, secondPart] = removeAttributesIfExpressionIsNull(el[0], array[i + 1][0]);
            acc[0][0] += firstPart;
            array[i + 1][0] = secondPart;
            return acc;
        } else {
            acc[0][0] += el[0];
            if (typeof el[1] === "function") acc[1].push(el[1]);
            else {
                acc[0][0] += Array.isArray(el[1]) ? el[1].join("") : assertString(el[1]);
            }
            return acc;
        }
    }, [
        [
            ""
        ],
        []
    ]);
}
function sortSelectorsAndEventsObjects(acc, ele) {
    isString(ele) ? acc[0].push(ele) : acc[1] = {
        ...acc[1],
        ...ele
    };
    return acc;
}
function cleanString(str) {
    return [
        ...str.matchAll(wholeEventStringsRegexp)
    ].map((e)=>e[2]
    ).filter(isPresent).reduce((acc, s)=>acc.replace(s, "")
    , str).replace(extraSyntaxRegexpId, "id").replace(extraSyntaxRegexpClass, "class");
}
function parseTemplateLiteral(strings, expressions) {
    let counter = 0;
    const parse = (strings1, expressions1)=>{
        function parseCustomString(regExp) {
            function separateSelectorsAndEventObjects(input) {
                return input[1].split(/ (.+)/).filter((s)=>s !== ""
                ).map((el, i, array)=>{
                    return i === 0 ? el : {
                        [array[0]]: [
                            ...el.matchAll(eventRegexp)
                        ].map((input1)=>[
                                input1[1],
                                eventListeners[counter++]
                            ]
                        )
                    };
                });
            }
            return [
                ...str.matchAll(regExp)
            ].map(separateSelectorsAndEventObjects).flat(1).reduce(sortSelectorsAndEventsObjects, [
                [],
                {
                }
            ]);
        }
        const [[str], eventListeners] = separateEventListenersFromTheRest(strings1, expressions1);
        const [idSelectors, eventsWithId] = parseCustomString(idRegexp);
        const [classSelectors, eventsWithClass] = parseCustomString(classRegexp);
        const htmlString = cleanString(str);
        return {
            htmlString,
            idSelectors,
            classSelectors,
            events: {
                ...eventsWithId,
                ...eventsWithClass
            }
        };
    };
    return parse(strings, expressions);
}
class ShadowBase extends HTMLElement {
    waitingList = new Set();
    accessorsStore = new Map();
    cssTemplates = [];
    eventListeners = [];
    isRenderingCss = true;
    renderEvent = this.createEvent("rendered");
    root = this.attachShadow({
        mode: "open"
    });
    dom = {
        id: {
        },
        class: {
        }
    };
    connected = false;
    connectedCallback() {
        if (this.argsFromPropertyDecorator) {
            this.reflect(this.argsFromPropertyDecorator);
        }
        if (this.waitingList.size === 0) {
            this.connected = true;
            this.render();
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === oldValue) return;
        else {
            return this.connected ? this.update(name, newValue, true) : this.update(name, newValue, false);
        }
    }
    updateAttribute(attributeName, value) {
        if (value === null) return this.removeAttribute(attributeName);
        else {
            return isString(value) ? this.setAttribute(attributeName, value) : this.setAttribute(attributeName, JSON.stringify(value));
        }
    }
    reflect(properties) {
        return properties.forEach(({ property: property1 , reflect , wait , assert: assert1  })=>{
            if (wait) {
                this.waitingList.add(property1);
            } else if (assert1) {
                assert(this[property1], `The property ${property1} must have a truthy value.`);
            }
            this.accessorsStore.set(property1, this[property1]);
            if (reflect && isNull(this.getAttribute(property1))) {
                this.updateAttribute(convertCamelToDash(property1), this[property1]);
            }
            Object.defineProperty(this, property1, {
                get: ()=>this.accessorsStore.get(property1)
                ,
                set: (value)=>{
                    const attributeName = convertCamelToDash(property1);
                    const attributeValue = this.getAttribute(attributeName);
                    this.accessorsStore.set(property1, value);
                    if (wait) {
                        this.waitingList.delete(property1);
                        if (assert1) {
                            assert(this[property1], `The property ${property1} must have a truthy value.`);
                        }
                        if (this.waitingList.size === 0) {
                            this.connected = true;
                        }
                    }
                    if (this.connected && !reflect) {
                        this.render();
                    } else if (reflect && attributeValue !== value && attributeValue !== JSON.stringify(value)) {
                        this.updateAttribute(attributeName, value);
                    }
                    return value;
                }
            });
        });
    }
    update(name, newValue, isRendering = true) {
        const property1 = convertDashToCamel(name);
        if (!(property1 in this)) {
            throw new ShadowBaseError(`The property '${property1}' does not exist.`);
        }
        if (this[property1] !== newValue && JSON.stringify(this[property1]) !== newValue) {
            try {
                this[property1] = isNull(newValue) ? newValue : JSON.parse(newValue);
            } catch  {
                this[property1] = newValue;
            }
        }
        if (isRendering) {
            if (!this.connected) {
                throw new ShadowBaseError("The render function is called too early.");
            }
            this.render();
        }
    }
    css(strings, ...expressions) {
        if (this.isRenderingCss) {
            const cssString = zip([
                strings,
                expressions
            ]).map((element)=>element.map((el)=>{
                    if (el instanceof HTMLTemplateElement) this.cssTemplates.push(el);
                    return assertString(el);
                })
            ).flat().join("");
            this.isRenderingCss = false;
            this.cssTemplates.push(createHtmlTemplate(`<style>${cssString}</style>`));
        }
    }
    html(strings, ...expressions) {
        const { htmlString , idSelectors , classSelectors , events ,  } = parseTemplateLiteral(strings, expressions);
        this.root.innerHTML = htmlString;
        this.cssTemplates.forEach((template)=>cloneTemplateIntoParent(template, this.root)
        );
        if (isGlobalEvent(events)) {
            this.addEventListeners(events, [
                this.processIdSelectors(idSelectors),
                this.processClassSelectors(classSelectors), 
            ]);
        } else {
            throw new ShadowBaseError("An invalid event is used.");
        }
        this.dispatchEvent(this.renderEvent);
    }
    processIdSelectors(idSelectors) {
        return idSelectors.map((selector)=>{
            const element = this.root.getElementById(selector);
            if (isHTMLElement(element)) {
                return {
                    [selector]: this.dom.id[selector] = element
                };
            } else {
                throw new ShadowBaseError(`No HTMLElement with id selector '${selector}'.`);
            }
        });
    }
    processClassSelectors(classSelectors) {
        return classSelectors.map((selector)=>{
            const nodeList = this.root.querySelectorAll("." + selector);
            const collection = [
                ...nodeList, 
            ].filter(isHTMLElement);
            if (collection.length === 0 || nodeList.length !== collection.length) {
                throw new ShadowBaseError(`No HTMLElement with class selector '${selector}'.`);
            }
            return {
                [selector]: this.dom.class[selector] = collection
            };
        });
    }
    addEventListeners(events, [elementsById, elementsByClass, ]) {
        Object.entries(events).map(([selector, eventsCollection])=>{
            const elementOrArrayObj = elementsById.find((el)=>el[selector]
            ) || elementsByClass.find((el)=>Array.isArray(el[selector])
            );
            if (elementOrArrayObj) {
                const elementOrArray = elementOrArrayObj[selector];
                if (Array.isArray(elementOrArray)) {
                    elementOrArray.forEach((el)=>eventsCollection.forEach((ev)=>el.addEventListener(ev[0], ev[1].bind(this))
                        )
                    );
                } else {
                    eventsCollection.forEach((ev)=>elementOrArray.addEventListener(ev[0], ev[1].bind(this))
                    );
                }
            }
            return elementOrArrayObj;
        });
    }
    createEvent(eventName, { bubbles =true , composed =true , detail =null  } = {
    }) {
        return new CustomEvent(eventName, {
            bubbles,
            composed,
            detail: detail === null ? this.constructor.is : detail
        });
    }
    changeCssProperty(cssProperty, cssValue) {
        return this.style[cssProperty] === cssValue ? cssValue : this.style[cssProperty] = cssValue;
    }
    changeCssVariable(cssVariable, cssValue) {
        if (this.style.getPropertyValue(cssVariable) !== cssValue) {
            this.style.setProperty(cssVariable, cssValue);
        }
        return cssVariable;
    }
    addCss(str) {
        function addCssRules(styleElement, ruleSet) {
            return styleElement.sheet ? styleElement.sheet.insertRule(ruleSet, styleElement.sheet.cssRules.length) : null;
        }
        const styleElements = this.root.querySelectorAll("style");
        return addCssRules(styleElements.item(styleElements.length - 1), str);
    }
    getSlotElements() {
        return [
            ...this.children
        ];
    }
    render() {
        throw new ShadowBaseError("The render method must be defined.");
    }
    static get is() {
        return undefined;
    }
}
function _applyDecoratedDescriptor(target, property1, decorators, descriptor, context) {
    var desc = {
    };
    Object.keys(descriptor).forEach(function(key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;
    if ("value" in desc || desc.initializer) {
        desc.writable = true;
    }
    desc = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator(target, property1, desc) || desc;
    }, desc);
    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }
    if (desc.initializer === void 0) {
        Object.defineProperty(target, property1, desc);
        desc = null;
    }
    return desc;
}
function _initializerDefineProperty(target, property1, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property1, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}
var _class, _descriptor, _descriptor1, _descriptor2, _descriptor3, _descriptor4;
var _dec = property(), _dec1 = property(), _dec2 = property(), _dec3 = property(), _dec4 = property(), _dec5 = customElement("");
let MyGreeter = _class = _dec5(((_class = class MyGreeter extends ShadowBase {
    render() {
        this.css`\n :host {\n        display: block;\n        text-align: center;\n      }\n      .colorful {\n        color: var(--greeterThemeColor, pink);\n      }\n      .decorated {\n        text-decoration: var(--greeterThemeColor, pink) wavy underline 2px;\n      }\n    `;
        return this.html`\n<h1>\n      ${this.beforeText}<span class="decorated">${this.topic}</span>${this.betweenText}<span class="colorful">${this.mood}</span>${this.afterText}\n    </h1>\n    `;
    }
    constructor(...args){
        super(...args);
        _initializerDefineProperty(this, "beforeText", _descriptor, this);
        _initializerDefineProperty(this, "betweenText", _descriptor1, this);
        _initializerDefineProperty(this, "afterText", _descriptor2, this);
        _initializerDefineProperty(this, "topic", _descriptor3, this);
        _initializerDefineProperty(this, "mood", _descriptor4, this);
    }
}) || _class, _descriptor = _applyDecoratedDescriptor(_class.prototype, "beforeText", [
    _dec
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return "";
    }
}), _descriptor1 = _applyDecoratedDescriptor(_class.prototype, "betweenText", [
    _dec1
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return "";
    }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "afterText", [
    _dec2
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return "";
    }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "topic", [
    _dec3
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return "";
    }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "mood", [
    _dec4
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return "";
    }
}), _class)) || _class;
function _applyDecoratedDescriptor1(target, property1, decorators, descriptor, context) {
    var desc = {
    };
    Object.keys(descriptor).forEach(function(key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;
    if ("value" in desc || desc.initializer) {
        desc.writable = true;
    }
    desc = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator(target, property1, desc) || desc;
    }, desc);
    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }
    if (desc.initializer === void 0) {
        Object.defineProperty(target, property1, desc);
        desc = null;
    }
    return desc;
}
function _initializerDefineProperty1(target, property1, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property1, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}
var _class1, _descriptor5;
var _dec6 = property(), _dec7 = customElement("");
function createHtmlTemplate1(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template;
}
const wcCssReset = createHtmlTemplate1(`<style>\n  :host {\n    display: block;\n    box-sizing: border-box;\n    cursor: default;\n    word-break: break-word;\n  }\n  *,\n  *::before,\n  *::after {\n    box-sizing: inherit;\n    color: inherit;\n  }\n  p,\n  ol,\n  ul,\n  li,\n  dl,\n  dt,\n  dd,\n  blockquote,\n  figure,\n  fieldset,\n  legend,\n  textarea,\n  pre,\n  iframe,\n  hr,\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    margin: 0;\n    padding: 0;\n  }\n\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    font-size: 100%;\n    font-weight: normal;\n  }\n\n  p {\n    line-height: 1.647;\n  }\n\n  ul {\n    list-style: none;\n  }\n\n  button,\n  input,\n  select {\n    margin: 0;\n  }\n\n  img,\n  video {\n    height: auto;\n    max-width: 100%;\n  }\n\n  iframe {\n    border: 0;\n  }\n\n  table {\n    border-collapse: collapse;\n    border-spacing: 0;\n  }\n\n  td,\n  th {\n    padding: 0;\n  }\n\n  td:not([align]),\n  th:not([align]) {\n    text-align: left;\n  }\n  </style>`);
let ModalWindow = _class1 = _dec7(((_class1 = class ModalWindow extends ShadowBase {
    promiseForModalClose = Promise.resolve();
    connectedCallback() {
        super.connectedCallback();
        this.dom.id.slot = this.querySelector('*[slot="modal-content"]');
        this.dom.id.modal = this.root.querySelector(".modal");
        this.dom.id.modalClose = this.root.querySelector(".modal-close");
        this.dom.id.slot = this.querySelector('*[slot="modal-content"]');
        if (this.isVisible !== null) {
            this.promiseForModalClose = this.showModalAndWaitForClose();
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === oldValue) return;
        if (this.connected) {
            switch(name){
                case "is-visible":
                    if (newValue === null) {
                        if (this.dom.id.modal.classList.contains("show-modal")) {
                            this.dispatchEvent(new CustomEvent("modalClose"));
                        }
                    } else {
                        this.promiseForModalClose = this.showModalAndWaitForClose();
                    }
                    break;
                default:
                    return this.update(name, newValue);
            }
        }
        this.update(name, newValue, false);
    }
    showModalAndWaitForClose() {
        return new Promise((resolve)=>{
            const toggleModal = ()=>{
                if (!this.dom.id.modal.classList.contains("show-modal")) {
                    this.dom.id.modal.classList.add("show-modal");
                    this.root.querySelector(".modal-body").focus();
                    return;
                } else {
                    this.dom.id.modal.classList.remove("show-modal");
                    this.removeAttribute("is-visible");
                    this.dom.id.modalClose.removeEventListener("click", toggleModal);
                    this.removeEventListener("keydown", toggleModal);
                    this.removeEventListener("modalClose", toggleModal);
                    this.dom.id.modal.removeEventListener("click", handleClickOnModalWindow);
                    resolve(void 0);
                }
            };
            const handleClickOnModalWindow = (event)=>{
                if (event.target === this.dom.id.modal) {
                    toggleModal();
                }
            };
            this.dom.id.modalClose.addEventListener("click", toggleModal);
            this.addEventListener("keydown", (event)=>{
                if (event.key === "Escape") {
                    toggleModal();
                }
            });
            this.addEventListener("modalClose", toggleModal);
            this.dom.id.modal.addEventListener("click", handleClickOnModalWindow);
            toggleModal();
        });
    }
    render() {
        this.css`\n      ${wcCssReset}\n      :host {\n        display: block;\n      }\n      .modal {\n        position: fixed;\n        z-index: 10000;\n        left: 0;\n        top: 0;\n        bottom: 0;\n        right: 0;\n        width: 100%;\n        height: 100%;\n        background-color: rgba(0, 0, 0, 0.5);\n        opacity: 0;\n        visibility: hidden;\n        pointer-events: none;\n        transform: scale(1.2);\n        transition: visibility 0s linear 0.25s, opacity 0.25s 0s,\n          transform 0.25s;\n      }\n      .show-modal {\n        opacity: 1;\n        visibility: visible;\n        pointer-events: auto;\n        transform: scale(1);\n        transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;\n      }\n      .modal-body {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        padding: 32px;\n        background: var(--modalWindowBg, white);\n        max-height: 90%;\n        max-width: 95%;\n        border-radius: 0.5rem;\n        overflow: auto;\n        outline: unset;\n      }\n      .modal-close {\n        position: absolute;\n        top: 0.3em;\n        right: 0.3em;\n        padding: 0.3em;\n        cursor: pointer;\n        font-size: 38px;\n        height: 0.8em;\n        width: 0.8em;\n        text-indent: 20em;\n        overflow: hidden;\n        border: 0;\n        background-color: inherit;\n        transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);\n        transition-property: opacity;\n      }\n      .modal-close::after {\n        position: absolute;\n        line-height: 0.5;\n        top: 0.14em;\n        left: 0.12em;\n        text-indent: 0;\n        content: "\\00D7";\n        color: var(--modalWindowCloseButtonColor);\n      }\n      .modal-close:hover {\n        opacity: var(--buttonHoverOpacity, 0.6);\n      }\n      ::slotted(*) {\n        color: var(--modalWindowColor);\n      }\n      @media (min-width: 420px) {\n        .modal-body {\n          padding: var(--modalWindowPaddingSmall, 32px);\n        }\n      .modal-close {\n        font-size: 45px;\n      }        \n      }\n      @media (min-width: 670px) {\n        .modal-body {\n          padding: var(--modalWindowPaddingMid, 3em);\n        }\n      }\n    `;
        return this.html`\n      <div class="modal">\n  <div tabindex="0" class="modal-body">\n    <button class="modal-close">close</button>\n    <slot name="modal-content"></slot>\n  </div>\n</div>\n    `;
    }
    constructor(...args1){
        super(...args1);
        _initializerDefineProperty1(this, "isVisible", _descriptor5, this);
    }
}) || _class1, _descriptor5 = _applyDecoratedDescriptor1(_class1.prototype, "isVisible", [
    _dec6
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return null;
    }
}), _class1)) || _class1;
function _applyDecoratedDescriptor2(target, property1, decorators, descriptor, context) {
    var desc = {
    };
    Object.keys(descriptor).forEach(function(key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;
    if ("value" in desc || desc.initializer) {
        desc.writable = true;
    }
    desc = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator(target, property1, desc) || desc;
    }, desc);
    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }
    if (desc.initializer === void 0) {
        Object.defineProperty(target, property1, desc);
        desc = null;
    }
    return desc;
}
function _initializerDefineProperty2(target, property1, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property1, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}
var _class2, _descriptor6, _descriptor7;
var _dec8 = property({
    wait: true,
    reflect: false
}), _dec9 = property({
    reflect: false
}), _dec10 = customElement("nice-form");
let NiceForm = _class2 = _dec10(((_class2 = class NiceForm extends ShadowBase {
    render() {
        this.css`\n      :host {\n        display: inline-block;\n        box-sizing: border-box;\n        cursor: default;\n        line-height: 1.5;\n        overflow-wrap: anywhere;\n      }\n      *,\n      *::before,\n      *::after {\n        box-sizing: inherit;\n      }\n    \n    label,\n      #submit-container {\n        display: flex;\n        flex-direction: row;\n        max-width: 100%;\n        line-height: 25px;\n      }\n    label{\n        justify-content: var(--niceFormLabelJustifyContent, var(--niceFormJustifyContent, flex-end));\n      align-items: center;\n      font-size:var(--niceFormLabelFontSize);\n        margin-bottom: var(--niceFormLabelMarginBottom, 10px);\n      white-space:nowrap;\n    }\n    #submit-container{\n        justify-content: var(--niceFormSubmitJustifyContent, var(--niceFormJustifyContent, flex-end));\n    }\n      input {\n        height: 28px;\n        border:none;\n        border-radius:6px;\n        flex: 0 0 220px;\n        margin-left: 10px;\n        max-width: var(--niceFormInputWidth);\n        outline: unset;\n        text-align: center;\n  font: var(--niceFormInputFont);\n\n      }\n    input:focus:not(#submit-container input) {\n       box-shadow: 0 0 0 1.4pt var(--secondaryTeal);\n    }\n      #submit-container input {\n        font:inherit;\n        font-size:17px;\n        font-weight: 500;\n        height: 30px;\n        background:var(--niceFormSubmitBg);\n        color:var(--niceFormSubmitColor);\n        border: var(--niceFormSubmitBorder, 1.7px solid var(--primaryDark));\n        border-radius: 5px;\n        margin: var(--niceFormSubmitMargin, 1em 1.5em 0 0);\n        cursor: pointer;\n        transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);\n        transition-property: background-color, opacity;\n        max-width: var(--niceFormSubmitMaxWidth);\n      }\n      #submit-container input:hover {\n        background:var(--niceFormSubmitBgOnHover);\n        color:var(--niceFormSubmitColorOnHover);\n      }\n    `;
        this.html`\n      <form @id="formId" \n        ${this.form.map(([attribute, val])=>`${attribute}="${val}"`
        ).join(" ")}>\n\n        ${this.input.map(({ label , type , id , attributes  })=>type !== "submit" ? `\n                  <label for="${label}"\n                    >${label}<input\n                      type="${type}"\n                      name="${label}"\n                      id="${id}"\n                      ${attributes.map(([attribute, val])=>`${attribute}="${val}"`
            ).join(" ")}\n                  /></label>\n                ` : `\n        <div id="submit-container">\n          <input\n            name="${id}"\n            type="submit"\n            value="${label}"\n                      ${attributes.map(([attr, val])=>`${attr}="${val}"`
            ).join(" ")}\n            id="${id}"\n          />\n        </div>`
        )}\n        </form>\n    `;
        this.root.querySelector("#submit-container input").addEventListener("click", (err)=>this.handleButtonClick(err)
        );
    }
    handleButtonClick(event) {
        event.preventDefault();
        if (this.dom.id.formId.reportValidity()) {
            const entries = this.input.map(({ id  })=>[
                    id,
                    this.root.querySelector(`#${id}`)?.value, 
                ]
            );
            this.dispatchEvent(new CustomEvent("niceFormSubmit", {
                detail: Object.fromEntries(entries),
                bubbles: true,
                composed: true
            }));
            setTimeout(()=>this.dom.id["formId"].reset()
            , 500);
        }
    }
    constructor(...args2){
        super(...args2);
        _initializerDefineProperty2(this, "input", _descriptor6, this);
        _initializerDefineProperty2(this, "form", _descriptor7, this);
    }
}) || _class2, _descriptor6 = _applyDecoratedDescriptor2(_class2.prototype, "input", [
    _dec8
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return [];
    }
}), _descriptor7 = _applyDecoratedDescriptor2(_class2.prototype, "form", [
    _dec9
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return [];
    }
}), _class2)) || _class2;
function _applyDecoratedDescriptor3(target, property1, decorators, descriptor, context) {
    var desc = {
    };
    Object.keys(descriptor).forEach(function(key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;
    if ("value" in desc || desc.initializer) {
        desc.writable = true;
    }
    desc = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator(target, property1, desc) || desc;
    }, desc);
    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }
    if (desc.initializer === void 0) {
        Object.defineProperty(target, property1, desc);
        desc = null;
    }
    return desc;
}
function _initializerDefineProperty3(target, property1, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property1, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}
var _class3, _descriptor8, _descriptor9;
var _dec11 = property(), _dec12 = property(), _dec13 = customElement("stylish-anchor");
let StylishAnchor = _class3 = _dec13(((_class3 = class StylishAnchor extends ShadowBase {
    connectedCallback() {
        super.connectedCallback();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === oldValue) return;
        switch(name){
            case "inner-content":
                if (this.connected) this.dom.id["aId"].innerHTML = newValue || "";
                break;
            case "anchor-href":
                if (this.connected) {
                    this.dom.id["aId"].setAttribute("href", newValue || "");
                }
                break;
            default:
                this.update(name, newValue);
        }
        this.update(name, newValue, false);
    }
    render() {
        this.css`\n      :host {\n        display: inline-block;\n        font-weight: 500;\n        border-radius: 16.5px;\n      padding: 4px 11.5px 4px 15.5px;\n        align-items: center;\n        cursor:pointer;\n    white-space: nowrap;\n        transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);\n        transition-property: background-color, opacity;\n        background:var(--stylishAnchorBg);\n        color:var(--stylishAnchorColor);\n      }\n      :host(:hover){\n        background:var(--stylishAnchorBgOnHover);\n        opacity: var(--stylishAnchorOpacityOnHover, 1);\n      }\n      :host(:hover) a{\ncolor:var(--stylishAnchorColorOnHover);\n      }        \n\n\n.rootLink {\n    display: block;\n    font-family: inherit;\n    margin: 0;\n    padding: 0;\n    border: none;\n    outline: none;\n    text-decoration: none;\n    transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);\n    transition-property: background-color, opacity;\n    white-space: inherit;\n    user-select: none;\n    font-size: var(--stylishAnchorFontSize, 15px);\n    line-height: 25px;\n    font-weight: inherit;\n    color: inherit;\n  }\n\n a.rootLink    {\nletter-spacing:-0.5px;\nfont-weight:600;\n    }\n\n      .HoverArrow {\n        --arrowHoverTransition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);\n        --arrowHoverOffset: translateX(3px);\n        position: relative;\n        top: 1px;\n        margin-left: 8px;\n        stroke-width: 2;\n        fill: none;\n        stroke: currentColor;\n      }\n      .HoverArrow__linePath {\n        opacity: 0;\n        transition: opacity var(--hoverTransition, var(--arrowHoverTransition));\n      }\n      .HoverArrow__tipPath {\n        transition: transform\n          var(--hoverTransition, var(--arrowHoverTransition));\n      }\n      :host(:hover) .HoverArrow__linePath {\n        opacity: 1;\n      }\n      :host(:hover) .HoverArrow__tipPath {\n        transform: var(--arrowHoverOffset);\n      }\n    `;
        return this.html`<a \n        @id="aId"\n        class="rootLink"\n        href="${this.anchorHref}"\n        >${this.innerContent}<svg\n          class="HoverArrow"\n          width="10"\n          height="10"\n          viewBox="0 0 10 10"\n          aria-hidden="true"\n        >\n          <g fill-rule="evenodd">\n            <path class="HoverArrow__linePath" d="M0 5h7"></path>\n            <path class="HoverArrow__tipPath" d="M1 1l4 4-4 4"></path>\n          </g>\n        </svg>\n      </a>`;
    }
    constructor(...args3){
        super(...args3);
        _initializerDefineProperty3(this, "anchorHref", _descriptor8, this);
        _initializerDefineProperty3(this, "innerContent", _descriptor9, this);
    }
}) || _class3, _descriptor8 = _applyDecoratedDescriptor3(_class3.prototype, "anchorHref", [
    _dec11
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return null;
    }
}), _descriptor9 = _applyDecoratedDescriptor3(_class3.prototype, "innerContent", [
    _dec12
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return this.innerHTML;
    }
}), _class3)) || _class3;
const StylishAnchor1 = StylishAnchor;
const StylishAnchor2 = StylishAnchor;
export { StylishAnchor1 as StylishAnchor };
const NiceForm1 = NiceForm;
const NiceForm2 = NiceForm;
export { NiceForm1 as NiceForm };
const ModalWindow1 = ModalWindow;
const ModalWindow2 = ModalWindow;
export { ModalWindow1 as ModalWindow };
const MyGreeter1 = MyGreeter;
const MyGreeter2 = MyGreeter;
export { MyGreeter1 as MyGreeter };
