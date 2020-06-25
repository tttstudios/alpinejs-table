/**
 * Modified version from:
 *
 * @bevacqua/rome - Customizable date (and time) picker. Opt-in UI, no jQuery!
 * @version v3.0.3
 * @link https://github.com/bevacqua/rome
 * @license MIT
 */
(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }
        g.rome = f();
    }
})(function () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw ((f.code = "MODULE_NOT_FOUND"), f);
                }
                var l = (n[o] = { exports: {} });
                t[o][0].call(
                    l.exports,
                    function (e) {
                        var n = t[o][1][e];
                        return s(n ? n : e);
                    },
                    l,
                    l.exports,
                    e,
                    t,
                    n,
                    r
                );
            }
            return n[o].exports;
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
    })(
        {
            1: [
                function (require, module, exports) {
                    module.exports = function atoa(a, n) {
                        return Array.prototype.slice.call(a, n);
                    };
                },
                {},
            ],
            2: [
                function (require, module, exports) {
                    "use strict";

                    var crossvent = require("crossvent");
                    var throttle = require("./throttle");
                    var tailormade = require("./tailormade");

                    function bullseye(el, target, options) {
                        var o = options;
                        var domTarget = target && target.tagName;

                        if (!domTarget && arguments.length === 2) {
                            o = target;
                        }
                        if (!domTarget) {
                            target = el;
                        }
                        if (!o) {
                            o = {};
                        }

                        var destroyed = false;
                        var throttledWrite = throttle(write, 30);
                        var tailorOptions = {
                            update: o.autoupdateToCaret !== false && update,
                        };
                        var tailor =
                            o.caret && tailormade(target, tailorOptions);

                        write();

                        if (o.tracking !== false) {
                            crossvent.add(window, "resize", throttledWrite);
                        }

                        return {
                            read: readNull,
                            refresh: write,
                            destroy: destroy,
                            sleep: sleep,
                        };

                        function sleep() {
                            tailorOptions.sleeping = true;
                        }

                        function readNull() {
                            return read();
                        }

                        function read(readings) {
                            var bounds = target.getBoundingClientRect();
                            var scrollTop =
                                document.body.scrollTop ||
                                document.documentElement.scrollTop;
                            if (tailor) {
                                readings = tailor.read();
                                return {
                                    x:
                                        (readings.absolute ? 0 : bounds.left) +
                                        readings.x,
                                    y:
                                        (readings.absolute ? 0 : bounds.top) +
                                        scrollTop +
                                        readings.y +
                                        20,
                                };
                            }
                            return {
                                x: bounds.left,
                                y: bounds.top + scrollTop,
                            };
                        }

                        function update(readings) {
                            write(readings);
                        }

                        function write(readings) {
                            if (destroyed) {
                                throw new Error(
                                    "Bullseye can't refresh after being destroyed. Create another instance instead."
                                );
                            }
                            if (tailor && !readings) {
                                tailorOptions.sleeping = false;
                                tailor.refresh();
                                return;
                            }
                            var p = read(readings);
                            if (!tailor && target !== el) {
                                p.y += target.offsetHeight;
                            }
                            el.style.left = p.x + "px";
                            el.style.top = p.y + "px";
                        }

                        function destroy() {
                            if (tailor) {
                                tailor.destroy();
                            }
                            crossvent.remove(window, "resize", throttledWrite);
                            destroyed = true;
                        }
                    }

                    module.exports = bullseye;
                },
                { "./tailormade": 6, "./throttle": 7, crossvent: 3 },
            ],
            3: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var customEvent = require("custom-event");
                        var eventmap = require("./eventmap");
                        var doc = global.document;
                        var addEvent = addEventEasy;
                        var removeEvent = removeEventEasy;
                        var hardCache = [];

                        if (!global.addEventListener) {
                            addEvent = addEventHard;
                            removeEvent = removeEventHard;
                        }

                        module.exports = {
                            add: addEvent,
                            remove: removeEvent,
                            fabricate: fabricateEvent,
                        };

                        function addEventEasy(el, type, fn, capturing) {
                            return el.addEventListener(type, fn, capturing);
                        }

                        function addEventHard(el, type, fn) {
                            return el.attachEvent(
                                "on" + type,
                                wrap(el, type, fn)
                            );
                        }

                        function removeEventEasy(el, type, fn, capturing) {
                            return el.removeEventListener(type, fn, capturing);
                        }

                        function removeEventHard(el, type, fn) {
                            var listener = unwrap(el, type, fn);
                            if (listener) {
                                return el.detachEvent("on" + type, listener);
                            }
                        }

                        function fabricateEvent(el, type, model) {
                            var e =
                                eventmap.indexOf(type) === -1
                                    ? makeCustomEvent()
                                    : makeClassicEvent();
                            if (el.dispatchEvent) {
                                el.dispatchEvent(e);
                            } else {
                                el.fireEvent("on" + type, e);
                            }

                            function makeClassicEvent() {
                                var e;
                                if (doc.createEvent) {
                                    e = doc.createEvent("Event");
                                    e.initEvent(type, true, true);
                                } else if (doc.createEventObject) {
                                    e = doc.createEventObject();
                                }
                                return e;
                            }

                            function makeCustomEvent() {
                                return new customEvent(type, { detail: model });
                            }
                        }

                        function wrapperFactory(el, type, fn) {
                            return function wrapper(originalEvent) {
                                var e = originalEvent || global.event;
                                e.target = e.target || e.srcElement;
                                e.preventDefault =
                                    e.preventDefault ||
                                    function preventDefault() {
                                        e.returnValue = false;
                                    };
                                e.stopPropagation =
                                    e.stopPropagation ||
                                    function stopPropagation() {
                                        e.cancelBubble = true;
                                    };
                                e.which = e.which || e.keyCode;
                                fn.call(el, e);
                            };
                        }

                        function wrap(el, type, fn) {
                            var wrapper =
                                unwrap(el, type, fn) ||
                                wrapperFactory(el, type, fn);
                            hardCache.push({
                                wrapper: wrapper,
                                element: el,
                                type: type,
                                fn: fn,
                            });
                            return wrapper;
                        }

                        function unwrap(el, type, fn) {
                            var i = find(el, type, fn);
                            if (i) {
                                var wrapper = hardCache[i].wrapper;
                                hardCache.splice(i, 1); // free up a tad of memory
                                return wrapper;
                            }
                        }

                        function find(el, type, fn) {
                            var i, item;
                            for (i = 0; i < hardCache.length; i++) {
                                item = hardCache[i];
                                if (
                                    item.element === el &&
                                    item.type === type &&
                                    item.fn === fn
                                ) {
                                    return i;
                                }
                            }
                        }
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                { "./eventmap": 4, "custom-event": 5 },
            ],
            4: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var eventmap = [];
                        var eventname = "";
                        var ron = /^on/;

                        for (eventname in global) {
                            if (ron.test(eventname)) {
                                eventmap.push(eventname.slice(2));
                            }
                        }

                        module.exports = eventmap;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {},
            ],
            5: [
                function (require, module, exports) {
                    (function (global) {
                        var NativeCustomEvent = global.CustomEvent;

                        function useNative() {
                            try {
                                var p = new NativeCustomEvent("cat", {
                                    detail: { foo: "bar" },
                                });
                                return (
                                    "cat" === p.type && "bar" === p.detail.foo
                                );
                            } catch (e) {}
                            return false;
                        }

                        /**
                         * Cross-browser `CustomEvent` constructor.
                         *
                         * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
                         *
                         * @public
                         */

                        module.exports = useNative()
                            ? NativeCustomEvent
                            : // IE >= 9
                            "undefined" !== typeof document &&
                              "function" === typeof document.createEvent
                            ? function CustomEvent(type, params) {
                                  var e = document.createEvent("CustomEvent");
                                  if (params) {
                                      e.initCustomEvent(
                                          type,
                                          params.bubbles,
                                          params.cancelable,
                                          params.detail
                                      );
                                  } else {
                                      e.initCustomEvent(
                                          type,
                                          false,
                                          false,
                                          void 0
                                      );
                                  }
                                  return e;
                              }
                            : // IE <= 8
                              function CustomEvent(type, params) {
                                  var e = document.createEventObject();
                                  e.type = type;
                                  if (params) {
                                      e.bubbles = Boolean(params.bubbles);
                                      e.cancelable = Boolean(params.cancelable);
                                      e.detail = params.detail;
                                  } else {
                                      e.bubbles = false;
                                      e.cancelable = false;
                                      e.detail = void 0;
                                  }
                                  return e;
                              };
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {},
            ],
            6: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var sell = require("sell");
                        var crossvent = require("crossvent");
                        var seleccion = require("seleccion");
                        var throttle = require("./throttle");
                        var getSelection = seleccion.get;
                        var props = [
                            "direction",
                            "boxSizing",
                            "width",
                            "height",
                            "overflowX",
                            "overflowY",
                            "borderTopWidth",
                            "borderRightWidth",
                            "borderBottomWidth",
                            "borderLeftWidth",
                            "paddingTop",
                            "paddingRight",
                            "paddingBottom",
                            "paddingLeft",
                            "fontStyle",
                            "fontVariant",
                            "fontWeight",
                            "fontStretch",
                            "fontSize",
                            "fontSizeAdjust",
                            "lineHeight",
                            "fontFamily",
                            "textAlign",
                            "textTransform",
                            "textIndent",
                            "textDecoration",
                            "letterSpacing",
                            "wordSpacing",
                        ];
                        var win = global;
                        var doc = document;
                        var ff =
                            win.mozInnerScreenX !== null &&
                            win.mozInnerScreenX !== void 0;

                        function tailormade(el, options) {
                            var textInput =
                                el.tagName === "INPUT" ||
                                el.tagName === "TEXTAREA";
                            var throttledRefresh = throttle(refresh, 30);
                            var o = options || {};

                            bind();

                            return {
                                read: readPosition,
                                refresh: throttledRefresh,
                                destroy: destroy,
                            };

                            function noop() {}

                            function readPosition() {
                                return (textInput ? coordsText : coordsHTML)();
                            }

                            function refresh() {
                                if (o.sleeping) {
                                    return;
                                }
                                return (o.update || noop)(readPosition());
                            }

                            function coordsText() {
                                var p = sell(el);
                                var context = prepare();
                                var readings = readTextCoords(context, p.start);
                                doc.body.removeChild(context.mirror);
                                return readings;
                            }

                            function coordsHTML() {
                                var sel = getSelection();
                                if (sel.rangeCount) {
                                    var range = sel.getRangeAt(0);
                                    var needsToWorkAroundNewlineBug =
                                        range.startContainer.nodeName === "P" &&
                                        range.startOffset === 0;
                                    if (needsToWorkAroundNewlineBug) {
                                        return {
                                            x: range.startContainer.offsetLeft,
                                            y: range.startContainer.offsetTop,
                                            absolute: true,
                                        };
                                    }
                                    if (range.getClientRects) {
                                        var rects = range.getClientRects();
                                        if (rects.length > 0) {
                                            return {
                                                x: rects[0].left,
                                                y: rects[0].top,
                                                absolute: true,
                                            };
                                        }
                                    }
                                }
                                return { x: 0, y: 0 };
                            }

                            function readTextCoords(context, p) {
                                var rest = doc.createElement("span");
                                var mirror = context.mirror;
                                var computed = context.computed;

                                write(mirror, read(el).substring(0, p));

                                if (el.tagName === "INPUT") {
                                    mirror.textContent = mirror.textContent.replace(
                                        /\s/g,
                                        "\u00a0"
                                    );
                                }

                                write(rest, read(el).substring(p) || ".");

                                mirror.appendChild(rest);

                                return {
                                    x:
                                        rest.offsetLeft +
                                        parseInt(computed["borderLeftWidth"]),
                                    y:
                                        rest.offsetTop +
                                        parseInt(computed["borderTopWidth"]),
                                };
                            }

                            function read(el) {
                                return textInput ? el.value : el.innerHTML;
                            }

                            function prepare() {
                                var computed = win.getComputedStyle
                                    ? getComputedStyle(el)
                                    : el.currentStyle;
                                var mirror = doc.createElement("div");
                                var style = mirror.style;

                                doc.body.appendChild(mirror);

                                if (el.tagName !== "INPUT") {
                                    style.wordWrap = "break-word";
                                }
                                style.whiteSpace = "pre-wrap";
                                style.position = "absolute";
                                style.visibility = "hidden";
                                props.forEach(copy);

                                if (ff) {
                                    style.width =
                                        parseInt(computed.width) - 2 + "px";
                                    if (
                                        el.scrollHeight >
                                        parseInt(computed.height)
                                    ) {
                                        style.overflowY = "scroll";
                                    }
                                } else {
                                    style.overflow = "hidden";
                                }
                                return { mirror: mirror, computed: computed };

                                function copy(prop) {
                                    style[prop] = computed[prop];
                                }
                            }

                            function write(el, value) {
                                if (textInput) {
                                    el.textContent = value;
                                } else {
                                    el.innerHTML = value;
                                }
                            }

                            function bind(remove) {
                                var op = remove ? "remove" : "add";
                                crossvent[op](el, "keydown", throttledRefresh);
                                crossvent[op](el, "keyup", throttledRefresh);
                                crossvent[op](el, "input", throttledRefresh);
                                crossvent[op](el, "paste", throttledRefresh);
                                crossvent[op](el, "change", throttledRefresh);
                            }

                            function destroy() {
                                bind(true);
                            }
                        }

                        module.exports = tailormade;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                { "./throttle": 7, crossvent: 3, seleccion: 20, sell: 22 },
            ],
            7: [
                function (require, module, exports) {
                    "use strict";

                    function throttle(fn, boundary) {
                        var last = -Infinity;
                        var timer;
                        return function bounced() {
                            if (timer) {
                                return;
                            }
                            unbound();

                            function unbound() {
                                clearTimeout(timer);
                                timer = null;
                                var next = last + boundary;
                                var now = Date.now();
                                if (now > next) {
                                    last = now;
                                    fn();
                                } else {
                                    timer = setTimeout(unbound, next - now);
                                }
                            }
                        };
                    }

                    module.exports = throttle;
                },
                {},
            ],
            8: [
                function (require, module, exports) {
                    "use strict";

                    var ticky = require("ticky");

                    module.exports = function debounce(fn, args, ctx) {
                        if (!fn) {
                            return;
                        }
                        ticky(function run() {
                            fn.apply(ctx || null, args || []);
                        });
                    };
                },
                { ticky: 23 },
            ],
            9: [
                function (require, module, exports) {
                    "use strict";

                    var atoa = require("atoa");
                    var debounce = require("./debounce");

                    module.exports = function emitter(thing, options) {
                        var opts = options || {};
                        var evt = {};
                        if (thing === undefined) {
                            thing = {};
                        }
                        thing.on = function (type, fn) {
                            if (!evt[type]) {
                                evt[type] = [fn];
                            } else {
                                evt[type].push(fn);
                            }
                            return thing;
                        };
                        thing.once = function (type, fn) {
                            fn._once = true; // thing.off(fn) still works!
                            thing.on(type, fn);
                            return thing;
                        };
                        thing.off = function (type, fn) {
                            var c = arguments.length;
                            if (c === 1) {
                                delete evt[type];
                            } else if (c === 0) {
                                evt = {};
                            } else {
                                var et = evt[type];
                                if (!et) {
                                    return thing;
                                }
                                et.splice(et.indexOf(fn), 1);
                            }
                            return thing;
                        };
                        thing.emit = function () {
                            var args = atoa(arguments);
                            return thing
                                .emitterSnapshot(args.shift())
                                .apply(this, args);
                        };
                        thing.emitterSnapshot = function (type) {
                            var et = (evt[type] || []).slice(0);
                            return function () {
                                var args = atoa(arguments);
                                var ctx = this || thing;
                                if (
                                    type === "error" &&
                                    opts.throws !== false &&
                                    !et.length
                                ) {
                                    throw args.length === 1 ? args[0] : args;
                                }
                                et.forEach(function emitter(listen) {
                                    if (opts.async) {
                                        debounce(listen, args, ctx);
                                    } else {
                                        listen.apply(ctx, args);
                                    }
                                    if (listen._once) {
                                        thing.off(type, listen);
                                    }
                                });
                                return thing;
                            };
                        };
                        return thing;
                    };
                },
                { "./debounce": 8, atoa: 1 },
            ],
            10: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var customEvent = require("custom-event");
                        var eventmap = require("./eventmap");
                        var doc = document;
                        var addEvent = addEventEasy;
                        var removeEvent = removeEventEasy;
                        var hardCache = [];

                        if (!global.addEventListener) {
                            addEvent = addEventHard;
                            removeEvent = removeEventHard;
                        }

                        function addEventEasy(el, type, fn, capturing) {
                            return el.addEventListener(type, fn, capturing);
                        }

                        function addEventHard(el, type, fn) {
                            return el.attachEvent(
                                "on" + type,
                                wrap(el, type, fn)
                            );
                        }

                        function removeEventEasy(el, type, fn, capturing) {
                            return el.removeEventListener(type, fn, capturing);
                        }

                        function removeEventHard(el, type, fn) {
                            return el.detachEvent(
                                "on" + type,
                                unwrap(el, type, fn)
                            );
                        }

                        function fabricateEvent(el, type, model) {
                            var e =
                                eventmap.indexOf(type) === -1
                                    ? makeCustomEvent()
                                    : makeClassicEvent();
                            if (el.dispatchEvent) {
                                el.dispatchEvent(e);
                            } else {
                                el.fireEvent("on" + type, e);
                            }

                            function makeClassicEvent() {
                                var e;
                                if (doc.createEvent) {
                                    e = doc.createEvent("Event");
                                    e.initEvent(type, true, true);
                                } else if (doc.createEventObject) {
                                    e = doc.createEventObject();
                                }
                                return e;
                            }

                            function makeCustomEvent() {
                                return new customEvent(type, { detail: model });
                            }
                        }

                        function wrapperFactory(el, type, fn) {
                            return function wrapper(originalEvent) {
                                var e = originalEvent || global.event;
                                e.target = e.target || e.srcElement;
                                e.preventDefault =
                                    e.preventDefault ||
                                    function preventDefault() {
                                        e.returnValue = false;
                                    };
                                e.stopPropagation =
                                    e.stopPropagation ||
                                    function stopPropagation() {
                                        e.cancelBubble = true;
                                    };
                                e.which = e.which || e.keyCode;
                                fn.call(el, e);
                            };
                        }

                        function wrap(el, type, fn) {
                            var wrapper =
                                unwrap(el, type, fn) ||
                                wrapperFactory(el, type, fn);
                            hardCache.push({
                                wrapper: wrapper,
                                element: el,
                                type: type,
                                fn: fn,
                            });
                            return wrapper;
                        }

                        function unwrap(el, type, fn) {
                            var i = find(el, type, fn);
                            if (i) {
                                var wrapper = hardCache[i].wrapper;
                                hardCache.splice(i, 1); // free up a tad of memory
                                return wrapper;
                            }
                        }

                        function find(el, type, fn) {
                            var i, item;
                            for (i = 0; i < hardCache.length; i++) {
                                item = hardCache[i];
                                if (
                                    item.element === el &&
                                    item.type === type &&
                                    item.fn === fn
                                ) {
                                    return i;
                                }
                            }
                        }

                        module.exports = {
                            add: addEvent,
                            remove: removeEvent,
                            fabricate: fabricateEvent,
                        };
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                { "./eventmap": 11, "custom-event": 12 },
            ],
            11: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var eventmap = [];
                        var eventname = "";
                        var ron = /^on/;

                        for (eventname in global) {
                            if (ron.test(eventname)) {
                                eventmap.push(eventname.slice(2));
                            }
                        }

                        module.exports = eventmap;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {},
            ],
            12: [
                function (require, module, exports) {
                    (function (global) {
                        var NativeCustomEvent = global.CustomEvent;

                        function useNative() {
                            try {
                                var p = new NativeCustomEvent("cat", {
                                    detail: { foo: "bar" },
                                });
                                return (
                                    "cat" === p.type && "bar" === p.detail.foo
                                );
                            } catch (e) {}
                            return false;
                        }

                        /**
                         * Cross-browser `CustomEvent` constructor.
                         *
                         * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
                         *
                         * @public
                         */

                        module.exports = useNative()
                            ? NativeCustomEvent
                            : // IE >= 9
                            "function" === typeof document.createEvent
                            ? function CustomEvent(type, params) {
                                  var e = document.createEvent("CustomEvent");
                                  if (params) {
                                      e.initCustomEvent(
                                          type,
                                          params.bubbles,
                                          params.cancelable,
                                          params.detail
                                      );
                                  } else {
                                      e.initCustomEvent(
                                          type,
                                          false,
                                          false,
                                          void 0
                                      );
                                  }
                                  return e;
                              }
                            : // IE <= 8
                              function CustomEvent(type, params) {
                                  var e = document.createEventObject();
                                  e.type = type;
                                  if (params) {
                                      e.bubbles = Boolean(params.bubbles);
                                      e.cancelable = Boolean(params.cancelable);
                                      e.detail = params.detail;
                                  } else {
                                      e.bubbles = false;
                                      e.cancelable = false;
                                      e.detail = void 0;
                                  }
                                  return e;
                              };
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {},
            ],
            13: [
                function (require, module, exports) {
                    //! moment.js

                    (function (global, factory) {
                        typeof exports === "object" &&
                        typeof module !== "undefined"
                            ? (module.exports = factory())
                            : typeof define === "function" && define.amd
                            ? define(factory)
                            : (global.moment = factory());
                    })(this, function () {
                        "use strict";

                        var hookCallback;

                        function hooks() {
                            return hookCallback.apply(null, arguments);
                        }

                        // This is done to register the method called with moment()
                        // without creating circular dependencies.
                        function setHookCallback(callback) {
                            hookCallback = callback;
                        }

                        function isArray(input) {
                            return (
                                input instanceof Array ||
                                Object.prototype.toString.call(input) ===
                                    "[object Array]"
                            );
                        }

                        function isObject(input) {
                            // IE8 will treat undefined and null as object if it wasn't for
                            // input != null
                            return (
                                input != null &&
                                Object.prototype.toString.call(input) ===
                                    "[object Object]"
                            );
                        }

                        function isObjectEmpty(obj) {
                            if (Object.getOwnPropertyNames) {
                                return (
                                    Object.getOwnPropertyNames(obj).length === 0
                                );
                            } else {
                                var k;
                                for (k in obj) {
                                    if (obj.hasOwnProperty(k)) {
                                        return false;
                                    }
                                }
                                return true;
                            }
                        }

                        function isUndefined(input) {
                            return input === void 0;
                        }

                        function isNumber(input) {
                            return (
                                typeof input === "number" ||
                                Object.prototype.toString.call(input) ===
                                    "[object Number]"
                            );
                        }

                        function isDate(input) {
                            return (
                                input instanceof Date ||
                                Object.prototype.toString.call(input) ===
                                    "[object Date]"
                            );
                        }

                        function map(arr, fn) {
                            var res = [],
                                i;
                            for (i = 0; i < arr.length; ++i) {
                                res.push(fn(arr[i], i));
                            }
                            return res;
                        }

                        function hasOwnProp(a, b) {
                            return Object.prototype.hasOwnProperty.call(a, b);
                        }

                        function extend(a, b) {
                            for (var i in b) {
                                if (hasOwnProp(b, i)) {
                                    a[i] = b[i];
                                }
                            }

                            if (hasOwnProp(b, "toString")) {
                                a.toString = b.toString;
                            }

                            if (hasOwnProp(b, "valueOf")) {
                                a.valueOf = b.valueOf;
                            }

                            return a;
                        }

                        function createUTC(input, format, locale, strict) {
                            return createLocalOrUTC(
                                input,
                                format,
                                locale,
                                strict,
                                true
                            ).utc();
                        }

                        function defaultParsingFlags() {
                            // We need to deep clone this object.
                            return {
                                empty: false,
                                unusedTokens: [],
                                unusedInput: [],
                                overflow: -2,
                                charsLeftOver: 0,
                                nullInput: false,
                                invalidMonth: null,
                                invalidFormat: false,
                                userInvalidated: false,
                                iso: false,
                                parsedDateParts: [],
                                meridiem: null,
                                rfc2822: false,
                                weekdayMismatch: false,
                            };
                        }

                        function getParsingFlags(m) {
                            if (m._pf == null) {
                                m._pf = defaultParsingFlags();
                            }
                            return m._pf;
                        }

                        var some;
                        if (Array.prototype.some) {
                            some = Array.prototype.some;
                        } else {
                            some = function (fun) {
                                var t = Object(this);
                                var len = t.length >>> 0;

                                for (var i = 0; i < len; i++) {
                                    if (i in t && fun.call(this, t[i], i, t)) {
                                        return true;
                                    }
                                }

                                return false;
                            };
                        }

                        function isValid(m) {
                            if (m._isValid == null) {
                                var flags = getParsingFlags(m);
                                var parsedParts = some.call(
                                    flags.parsedDateParts,
                                    function (i) {
                                        return i != null;
                                    }
                                );
                                var isNowValid =
                                    !isNaN(m._d.getTime()) &&
                                    flags.overflow < 0 &&
                                    !flags.empty &&
                                    !flags.invalidMonth &&
                                    !flags.invalidWeekday &&
                                    !flags.weekdayMismatch &&
                                    !flags.nullInput &&
                                    !flags.invalidFormat &&
                                    !flags.userInvalidated &&
                                    (!flags.meridiem ||
                                        (flags.meridiem && parsedParts));

                                if (m._strict) {
                                    isNowValid =
                                        isNowValid &&
                                        flags.charsLeftOver === 0 &&
                                        flags.unusedTokens.length === 0 &&
                                        flags.bigHour === undefined;
                                }

                                if (
                                    Object.isFrozen == null ||
                                    !Object.isFrozen(m)
                                ) {
                                    m._isValid = isNowValid;
                                } else {
                                    return isNowValid;
                                }
                            }
                            return m._isValid;
                        }

                        function createInvalid(flags) {
                            var m = createUTC(NaN);
                            if (flags != null) {
                                extend(getParsingFlags(m), flags);
                            } else {
                                getParsingFlags(m).userInvalidated = true;
                            }

                            return m;
                        }

                        // Plugins that add properties should also add the key here (null value),
                        // so we can properly clone ourselves.
                        var momentProperties = (hooks.momentProperties = []);

                        function copyConfig(to, from) {
                            var i, prop, val;

                            if (!isUndefined(from._isAMomentObject)) {
                                to._isAMomentObject = from._isAMomentObject;
                            }
                            if (!isUndefined(from._i)) {
                                to._i = from._i;
                            }
                            if (!isUndefined(from._f)) {
                                to._f = from._f;
                            }
                            if (!isUndefined(from._l)) {
                                to._l = from._l;
                            }
                            if (!isUndefined(from._strict)) {
                                to._strict = from._strict;
                            }
                            if (!isUndefined(from._tzm)) {
                                to._tzm = from._tzm;
                            }
                            if (!isUndefined(from._isUTC)) {
                                to._isUTC = from._isUTC;
                            }
                            if (!isUndefined(from._offset)) {
                                to._offset = from._offset;
                            }
                            if (!isUndefined(from._pf)) {
                                to._pf = getParsingFlags(from);
                            }
                            if (!isUndefined(from._locale)) {
                                to._locale = from._locale;
                            }

                            if (momentProperties.length > 0) {
                                for (i = 0; i < momentProperties.length; i++) {
                                    prop = momentProperties[i];
                                    val = from[prop];
                                    if (!isUndefined(val)) {
                                        to[prop] = val;
                                    }
                                }
                            }

                            return to;
                        }

                        var updateInProgress = false;

                        // Moment prototype object
                        function Moment(config) {
                            copyConfig(this, config);
                            this._d = new Date(
                                config._d != null ? config._d.getTime() : NaN
                            );
                            if (!this.isValid()) {
                                this._d = new Date(NaN);
                            }
                            // Prevent infinite loop in case updateOffset creates new moment
                            // objects.
                            if (updateInProgress === false) {
                                updateInProgress = true;
                                hooks.updateOffset(this);
                                updateInProgress = false;
                            }
                        }

                        function isMoment(obj) {
                            return (
                                obj instanceof Moment ||
                                (obj != null && obj._isAMomentObject != null)
                            );
                        }

                        function absFloor(number) {
                            if (number < 0) {
                                // -0 -> 0
                                return Math.ceil(number) || 0;
                            } else {
                                return Math.floor(number);
                            }
                        }

                        function toInt(argumentForCoercion) {
                            var coercedNumber = +argumentForCoercion,
                                value = 0;

                            if (
                                coercedNumber !== 0 &&
                                isFinite(coercedNumber)
                            ) {
                                value = absFloor(coercedNumber);
                            }

                            return value;
                        }

                        // compare two arrays, return the number of differences
                        function compareArrays(array1, array2, dontConvert) {
                            var len = Math.min(array1.length, array2.length),
                                lengthDiff = Math.abs(
                                    array1.length - array2.length
                                ),
                                diffs = 0,
                                i;
                            for (i = 0; i < len; i++) {
                                if (
                                    (dontConvert && array1[i] !== array2[i]) ||
                                    (!dontConvert &&
                                        toInt(array1[i]) !== toInt(array2[i]))
                                ) {
                                    diffs++;
                                }
                            }
                            return diffs + lengthDiff;
                        }

                        function warn(msg) {
                            if (
                                hooks.suppressDeprecationWarnings === false &&
                                typeof console !== "undefined" &&
                                console.warn
                            ) {
                                console.warn("Deprecation warning: " + msg);
                            }
                        }

                        function deprecate(msg, fn) {
                            var firstTime = true;

                            return extend(function () {
                                if (hooks.deprecationHandler != null) {
                                    hooks.deprecationHandler(null, msg);
                                }
                                if (firstTime) {
                                    var args = [];
                                    var arg;
                                    for (var i = 0; i < arguments.length; i++) {
                                        arg = "";
                                        if (typeof arguments[i] === "object") {
                                            arg += "\n[" + i + "] ";
                                            for (var key in arguments[0]) {
                                                arg +=
                                                    key +
                                                    ": " +
                                                    arguments[0][key] +
                                                    ", ";
                                            }
                                            arg = arg.slice(0, -2); // Remove trailing comma and space
                                        } else {
                                            arg = arguments[i];
                                        }
                                        args.push(arg);
                                    }
                                    warn(
                                        msg +
                                            "\nArguments: " +
                                            Array.prototype.slice
                                                .call(args)
                                                .join("") +
                                            "\n" +
                                            new Error().stack
                                    );
                                    firstTime = false;
                                }
                                return fn.apply(this, arguments);
                            }, fn);
                        }

                        var deprecations = {};

                        function deprecateSimple(name, msg) {
                            if (hooks.deprecationHandler != null) {
                                hooks.deprecationHandler(name, msg);
                            }
                            if (!deprecations[name]) {
                                warn(msg);
                                deprecations[name] = true;
                            }
                        }

                        hooks.suppressDeprecationWarnings = false;
                        hooks.deprecationHandler = null;

                        function isFunction(input) {
                            return (
                                input instanceof Function ||
                                Object.prototype.toString.call(input) ===
                                    "[object Function]"
                            );
                        }

                        function set(config) {
                            var prop, i;
                            for (i in config) {
                                prop = config[i];
                                if (isFunction(prop)) {
                                    this[i] = prop;
                                } else {
                                    this["_" + i] = prop;
                                }
                            }
                            this._config = config;
                            // Lenient ordinal parsing accepts just a number in addition to
                            // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
                            // TODO: Remove "ordinalParse" fallback in next major release.
                            this._dayOfMonthOrdinalParseLenient = new RegExp(
                                (this._dayOfMonthOrdinalParse.source ||
                                    this._ordinalParse.source) +
                                    "|" +
                                    /\d{1,2}/.source
                            );
                        }

                        function mergeConfigs(parentConfig, childConfig) {
                            var res = extend({}, parentConfig),
                                prop;
                            for (prop in childConfig) {
                                if (hasOwnProp(childConfig, prop)) {
                                    if (
                                        isObject(parentConfig[prop]) &&
                                        isObject(childConfig[prop])
                                    ) {
                                        res[prop] = {};
                                        extend(res[prop], parentConfig[prop]);
                                        extend(res[prop], childConfig[prop]);
                                    } else if (childConfig[prop] != null) {
                                        res[prop] = childConfig[prop];
                                    } else {
                                        delete res[prop];
                                    }
                                }
                            }
                            for (prop in parentConfig) {
                                if (
                                    hasOwnProp(parentConfig, prop) &&
                                    !hasOwnProp(childConfig, prop) &&
                                    isObject(parentConfig[prop])
                                ) {
                                    // make sure changes to properties don't modify parent config
                                    res[prop] = extend({}, res[prop]);
                                }
                            }
                            return res;
                        }

                        function Locale(config) {
                            if (config != null) {
                                this.set(config);
                            }
                        }

                        var keys;

                        if (Object.keys) {
                            keys = Object.keys;
                        } else {
                            keys = function (obj) {
                                var i,
                                    res = [];
                                for (i in obj) {
                                    if (hasOwnProp(obj, i)) {
                                        res.push(i);
                                    }
                                }
                                return res;
                            };
                        }

                        var defaultCalendar = {
                            sameDay: "[Today at] LT",
                            nextDay: "[Tomorrow at] LT",
                            nextWeek: "dddd [at] LT",
                            lastDay: "[Yesterday at] LT",
                            lastWeek: "[Last] dddd [at] LT",
                            sameElse: "L",
                        };

                        function calendar(key, mom, now) {
                            var output =
                                this._calendar[key] ||
                                this._calendar["sameElse"];
                            return isFunction(output)
                                ? output.call(mom, now)
                                : output;
                        }

                        var defaultLongDateFormat = {
                            LTS: "h:mm:ss A",
                            LT: "h:mm A",
                            L: "MM/DD/YYYY",
                            LL: "MMMM D, YYYY",
                            LLL: "MMMM D, YYYY h:mm A",
                            LLLL: "dddd, MMMM D, YYYY h:mm A",
                        };

                        function longDateFormat(key) {
                            var format = this._longDateFormat[key],
                                formatUpper = this._longDateFormat[
                                    key.toUpperCase()
                                ];

                            if (format || !formatUpper) {
                                return format;
                            }

                            this._longDateFormat[key] = formatUpper.replace(
                                /MMMM|MM|DD|dddd/g,
                                function (val) {
                                    return val.slice(1);
                                }
                            );

                            return this._longDateFormat[key];
                        }

                        var defaultInvalidDate = "Invalid date";

                        function invalidDate() {
                            return this._invalidDate;
                        }

                        var defaultOrdinal = "%d";
                        var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

                        function ordinal(number) {
                            return this._ordinal.replace("%d", number);
                        }

                        var defaultRelativeTime = {
                            future: "in %s",
                            past: "%s ago",
                            s: "a few seconds",
                            ss: "%d seconds",
                            m: "a minute",
                            mm: "%d minutes",
                            h: "an hour",
                            hh: "%d hours",
                            d: "a day",
                            dd: "%d days",
                            M: "a month",
                            MM: "%d months",
                            y: "a year",
                            yy: "%d years",
                        };

                        function relativeTime(
                            number,
                            withoutSuffix,
                            string,
                            isFuture
                        ) {
                            var output = this._relativeTime[string];
                            return isFunction(output)
                                ? output(
                                      number,
                                      withoutSuffix,
                                      string,
                                      isFuture
                                  )
                                : output.replace(/%d/i, number);
                        }

                        function pastFuture(diff, output) {
                            var format = this._relativeTime[
                                diff > 0 ? "future" : "past"
                            ];
                            return isFunction(format)
                                ? format(output)
                                : format.replace(/%s/i, output);
                        }

                        var aliases = {};

                        function addUnitAlias(unit, shorthand) {
                            var lowerCase = unit.toLowerCase();
                            aliases[lowerCase] = aliases[
                                lowerCase + "s"
                            ] = aliases[shorthand] = unit;
                        }

                        function normalizeUnits(units) {
                            return typeof units === "string"
                                ? aliases[units] || aliases[units.toLowerCase()]
                                : undefined;
                        }

                        function normalizeObjectUnits(inputObject) {
                            var normalizedInput = {},
                                normalizedProp,
                                prop;

                            for (prop in inputObject) {
                                if (hasOwnProp(inputObject, prop)) {
                                    normalizedProp = normalizeUnits(prop);
                                    if (normalizedProp) {
                                        normalizedInput[normalizedProp] =
                                            inputObject[prop];
                                    }
                                }
                            }

                            return normalizedInput;
                        }

                        var priorities = {};

                        function addUnitPriority(unit, priority) {
                            priorities[unit] = priority;
                        }

                        function getPrioritizedUnits(unitsObj) {
                            var units = [];
                            for (var u in unitsObj) {
                                units.push({
                                    unit: u,
                                    priority: priorities[u],
                                });
                            }
                            units.sort(function (a, b) {
                                return a.priority - b.priority;
                            });
                            return units;
                        }

                        function zeroFill(number, targetLength, forceSign) {
                            var absNumber = "" + Math.abs(number),
                                zerosToFill = targetLength - absNumber.length,
                                sign = number >= 0;
                            return (
                                (sign ? (forceSign ? "+" : "") : "-") +
                                Math.pow(10, Math.max(0, zerosToFill))
                                    .toString()
                                    .substr(1) +
                                absNumber
                            );
                        }

                        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

                        var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

                        var formatFunctions = {};

                        var formatTokenFunctions = {};

                        // token:    'M'
                        // padded:   ['MM', 2]
                        // ordinal:  'Mo'
                        // callback: function () { this.month() + 1 }
                        function addFormatToken(
                            token,
                            padded,
                            ordinal,
                            callback
                        ) {
                            var func = callback;
                            if (typeof callback === "string") {
                                func = function () {
                                    return this[callback]();
                                };
                            }
                            if (token) {
                                formatTokenFunctions[token] = func;
                            }
                            if (padded) {
                                formatTokenFunctions[padded[0]] = function () {
                                    return zeroFill(
                                        func.apply(this, arguments),
                                        padded[1],
                                        padded[2]
                                    );
                                };
                            }
                            if (ordinal) {
                                formatTokenFunctions[ordinal] = function () {
                                    return this.localeData().ordinal(
                                        func.apply(this, arguments),
                                        token
                                    );
                                };
                            }
                        }

                        function removeFormattingTokens(input) {
                            if (input.match(/\[[\s\S]/)) {
                                return input.replace(/^\[|\]$/g, "");
                            }
                            return input.replace(/\\/g, "");
                        }

                        function makeFormatFunction(format) {
                            var array = format.match(formattingTokens),
                                i,
                                length;

                            for (
                                i = 0, length = array.length;
                                i < length;
                                i++
                            ) {
                                if (formatTokenFunctions[array[i]]) {
                                    array[i] = formatTokenFunctions[array[i]];
                                } else {
                                    array[i] = removeFormattingTokens(array[i]);
                                }
                            }

                            return function (mom) {
                                var output = "",
                                    i;
                                for (i = 0; i < length; i++) {
                                    output += isFunction(array[i])
                                        ? array[i].call(mom, format)
                                        : array[i];
                                }
                                return output;
                            };
                        }

                        // format date using native date object
                        function formatMoment(m, format) {
                            if (!m.isValid()) {
                                return m.localeData().invalidDate();
                            }

                            format = expandFormat(format, m.localeData());
                            formatFunctions[format] =
                                formatFunctions[format] ||
                                makeFormatFunction(format);

                            return formatFunctions[format](m);
                        }

                        function expandFormat(format, locale) {
                            var i = 5;

                            function replaceLongDateFormatTokens(input) {
                                return locale.longDateFormat(input) || input;
                            }

                            localFormattingTokens.lastIndex = 0;
                            while (
                                i >= 0 &&
                                localFormattingTokens.test(format)
                            ) {
                                format = format.replace(
                                    localFormattingTokens,
                                    replaceLongDateFormatTokens
                                );
                                localFormattingTokens.lastIndex = 0;
                                i -= 1;
                            }

                            return format;
                        }

                        var match1 = /\d/; //       0 - 9
                        var match2 = /\d\d/; //      00 - 99
                        var match3 = /\d{3}/; //     000 - 999
                        var match4 = /\d{4}/; //    0000 - 9999
                        var match6 = /[+-]?\d{6}/; // -999999 - 999999
                        var match1to2 = /\d\d?/; //       0 - 99
                        var match3to4 = /\d\d\d\d?/; //     999 - 9999
                        var match5to6 = /\d\d\d\d\d\d?/; //   99999 - 999999
                        var match1to3 = /\d{1,3}/; //       0 - 999
                        var match1to4 = /\d{1,4}/; //       0 - 9999
                        var match1to6 = /[+-]?\d{1,6}/; // -999999 - 999999

                        var matchUnsigned = /\d+/; //       0 - inf
                        var matchSigned = /[+-]?\d+/; //    -inf - inf

                        var matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
                        var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

                        var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

                        // any word (or two) characters or numbers including two/three word month in arabic.
                        // includes scottish gaelic two word and hyphenated months
                        var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

                        var regexes = {};

                        function addRegexToken(token, regex, strictRegex) {
                            regexes[token] = isFunction(regex)
                                ? regex
                                : function (isStrict, localeData) {
                                      return isStrict && strictRegex
                                          ? strictRegex
                                          : regex;
                                  };
                        }

                        function getParseRegexForToken(token, config) {
                            if (!hasOwnProp(regexes, token)) {
                                return new RegExp(unescapeFormat(token));
                            }

                            return regexes[token](
                                config._strict,
                                config._locale
                            );
                        }

                        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
                        function unescapeFormat(s) {
                            return regexEscape(
                                s
                                    .replace("\\", "")
                                    .replace(
                                        /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
                                        function (matched, p1, p2, p3, p4) {
                                            return p1 || p2 || p3 || p4;
                                        }
                                    )
                            );
                        }

                        function regexEscape(s) {
                            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                        }

                        var tokens = {};

                        function addParseToken(token, callback) {
                            var i,
                                func = callback;
                            if (typeof token === "string") {
                                token = [token];
                            }
                            if (isNumber(callback)) {
                                func = function (input, array) {
                                    array[callback] = toInt(input);
                                };
                            }
                            for (i = 0; i < token.length; i++) {
                                tokens[token[i]] = func;
                            }
                        }

                        function addWeekParseToken(token, callback) {
                            addParseToken(token, function (
                                input,
                                array,
                                config,
                                token
                            ) {
                                config._w = config._w || {};
                                callback(input, config._w, config, token);
                            });
                        }

                        function addTimeToArrayFromToken(token, input, config) {
                            if (input != null && hasOwnProp(tokens, token)) {
                                tokens[token](input, config._a, config, token);
                            }
                        }

                        var YEAR = 0;
                        var MONTH = 1;
                        var DATE = 2;
                        var HOUR = 3;
                        var MINUTE = 4;
                        var SECOND = 5;
                        var MILLISECOND = 6;
                        var WEEK = 7;
                        var WEEKDAY = 8;

                        // FORMATTING

                        addFormatToken("Y", 0, 0, function () {
                            var y = this.year();
                            return y <= 9999 ? "" + y : "+" + y;
                        });

                        addFormatToken(0, ["YY", 2], 0, function () {
                            return this.year() % 100;
                        });

                        addFormatToken(0, ["YYYY", 4], 0, "year");
                        addFormatToken(0, ["YYYYY", 5], 0, "year");
                        addFormatToken(0, ["YYYYYY", 6, true], 0, "year");

                        // ALIASES

                        addUnitAlias("year", "y");

                        // PRIORITIES

                        addUnitPriority("year", 1);

                        // PARSING

                        addRegexToken("Y", matchSigned);
                        addRegexToken("YY", match1to2, match2);
                        addRegexToken("YYYY", match1to4, match4);
                        addRegexToken("YYYYY", match1to6, match6);
                        addRegexToken("YYYYYY", match1to6, match6);

                        addParseToken(["YYYYY", "YYYYYY"], YEAR);
                        addParseToken("YYYY", function (input, array) {
                            array[YEAR] =
                                input.length === 2
                                    ? hooks.parseTwoDigitYear(input)
                                    : toInt(input);
                        });
                        addParseToken("YY", function (input, array) {
                            array[YEAR] = hooks.parseTwoDigitYear(input);
                        });
                        addParseToken("Y", function (input, array) {
                            array[YEAR] = parseInt(input, 10);
                        });

                        // HELPERS

                        function daysInYear(year) {
                            return isLeapYear(year) ? 366 : 365;
                        }

                        function isLeapYear(year) {
                            return (
                                (year % 4 === 0 && year % 100 !== 0) ||
                                year % 400 === 0
                            );
                        }

                        // HOOKS

                        hooks.parseTwoDigitYear = function (input) {
                            return (
                                toInt(input) + (toInt(input) > 68 ? 1900 : 2000)
                            );
                        };

                        // MOMENTS

                        var getSetYear = makeGetSet("FullYear", true);

                        function getIsLeapYear() {
                            return isLeapYear(this.year());
                        }

                        function makeGetSet(unit, keepTime) {
                            return function (value) {
                                if (value != null) {
                                    set$1(this, unit, value);
                                    hooks.updateOffset(this, keepTime);
                                    return this;
                                } else {
                                    return get(this, unit);
                                }
                            };
                        }

                        function get(mom, unit) {
                            return mom.isValid()
                                ? mom._d[
                                      "get" + (mom._isUTC ? "UTC" : "") + unit
                                  ]()
                                : NaN;
                        }

                        function set$1(mom, unit, value) {
                            if (mom.isValid() && !isNaN(value)) {
                                if (
                                    unit === "FullYear" &&
                                    isLeapYear(mom.year()) &&
                                    mom.month() === 1 &&
                                    mom.date() === 29
                                ) {
                                    mom._d[
                                        "set" + (mom._isUTC ? "UTC" : "") + unit
                                    ](
                                        value,
                                        mom.month(),
                                        daysInMonth(value, mom.month())
                                    );
                                } else {
                                    mom._d[
                                        "set" + (mom._isUTC ? "UTC" : "") + unit
                                    ](value);
                                }
                            }
                        }

                        // MOMENTS

                        function stringGet(units) {
                            units = normalizeUnits(units);
                            if (isFunction(this[units])) {
                                return this[units]();
                            }
                            return this;
                        }

                        function stringSet(units, value) {
                            if (typeof units === "object") {
                                units = normalizeObjectUnits(units);
                                var prioritized = getPrioritizedUnits(units);
                                for (var i = 0; i < prioritized.length; i++) {
                                    this[prioritized[i].unit](
                                        units[prioritized[i].unit]
                                    );
                                }
                            } else {
                                units = normalizeUnits(units);
                                if (isFunction(this[units])) {
                                    return this[units](value);
                                }
                            }
                            return this;
                        }

                        function mod(n, x) {
                            return ((n % x) + x) % x;
                        }

                        var indexOf;

                        if (Array.prototype.indexOf) {
                            indexOf = Array.prototype.indexOf;
                        } else {
                            indexOf = function (o) {
                                // I know
                                var i;
                                for (i = 0; i < this.length; ++i) {
                                    if (this[i] === o) {
                                        return i;
                                    }
                                }
                                return -1;
                            };
                        }

                        function daysInMonth(year, month) {
                            if (isNaN(year) || isNaN(month)) {
                                return NaN;
                            }
                            var modMonth = mod(month, 12);
                            year += (month - modMonth) / 12;
                            return modMonth === 1
                                ? isLeapYear(year)
                                    ? 29
                                    : 28
                                : 31 - ((modMonth % 7) % 2);
                        }

                        // FORMATTING

                        addFormatToken("M", ["MM", 2], "Mo", function () {
                            return this.month() + 1;
                        });

                        addFormatToken("MMM", 0, 0, function (format) {
                            return this.localeData().monthsShort(this, format);
                        });

                        addFormatToken("MMMM", 0, 0, function (format) {
                            return this.localeData().months(this, format);
                        });

                        // ALIASES

                        addUnitAlias("month", "M");

                        // PRIORITY

                        addUnitPriority("month", 8);

                        // PARSING

                        addRegexToken("M", match1to2);
                        addRegexToken("MM", match1to2, match2);
                        addRegexToken("MMM", function (isStrict, locale) {
                            return locale.monthsShortRegex(isStrict);
                        });
                        addRegexToken("MMMM", function (isStrict, locale) {
                            return locale.monthsRegex(isStrict);
                        });

                        addParseToken(["M", "MM"], function (input, array) {
                            array[MONTH] = toInt(input) - 1;
                        });

                        addParseToken(["MMM", "MMMM"], function (
                            input,
                            array,
                            config,
                            token
                        ) {
                            var month = config._locale.monthsParse(
                                input,
                                token,
                                config._strict
                            );
                            // if we didn't find a month name, mark the date as invalid.
                            if (month != null) {
                                array[MONTH] = month;
                            } else {
                                getParsingFlags(config).invalidMonth = input;
                            }
                        });

                        // LOCALES

                        var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
                        var defaultLocaleMonths = "January_February_March_April_May_June_July_August_September_October_November_December".split(
                            "_"
                        );

                        function localeMonths(m, format) {
                            if (!m) {
                                return isArray(this._months)
                                    ? this._months
                                    : this._months["standalone"];
                            }
                            return isArray(this._months)
                                ? this._months[m.month()]
                                : this._months[
                                      (
                                          this._months.isFormat ||
                                          MONTHS_IN_FORMAT
                                      ).test(format)
                                          ? "format"
                                          : "standalone"
                                  ][m.month()];
                        }

                        var defaultLocaleMonthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split(
                            "_"
                        );

                        function localeMonthsShort(m, format) {
                            if (!m) {
                                return isArray(this._monthsShort)
                                    ? this._monthsShort
                                    : this._monthsShort["standalone"];
                            }
                            return isArray(this._monthsShort)
                                ? this._monthsShort[m.month()]
                                : this._monthsShort[
                                      MONTHS_IN_FORMAT.test(format)
                                          ? "format"
                                          : "standalone"
                                  ][m.month()];
                        }

                        function handleStrictParse(monthName, format, strict) {
                            var i,
                                ii,
                                mom,
                                llc = monthName.toLocaleLowerCase();
                            if (!this._monthsParse) {
                                // this is not used
                                this._monthsParse = [];
                                this._longMonthsParse = [];
                                this._shortMonthsParse = [];
                                for (i = 0; i < 12; ++i) {
                                    mom = createUTC([2000, i]);
                                    this._shortMonthsParse[
                                        i
                                    ] = this.monthsShort(
                                        mom,
                                        ""
                                    ).toLocaleLowerCase();
                                    this._longMonthsParse[i] = this.months(
                                        mom,
                                        ""
                                    ).toLocaleLowerCase();
                                }
                            }

                            if (strict) {
                                if (format === "MMM") {
                                    ii = indexOf.call(
                                        this._shortMonthsParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                } else {
                                    ii = indexOf.call(
                                        this._longMonthsParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                }
                            } else {
                                if (format === "MMM") {
                                    ii = indexOf.call(
                                        this._shortMonthsParse,
                                        llc
                                    );
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(
                                        this._longMonthsParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                } else {
                                    ii = indexOf.call(
                                        this._longMonthsParse,
                                        llc
                                    );
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(
                                        this._shortMonthsParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                }
                            }
                        }

                        function localeMonthsParse(monthName, format, strict) {
                            var i, mom, regex;

                            if (this._monthsParseExact) {
                                return handleStrictParse.call(
                                    this,
                                    monthName,
                                    format,
                                    strict
                                );
                            }

                            if (!this._monthsParse) {
                                this._monthsParse = [];
                                this._longMonthsParse = [];
                                this._shortMonthsParse = [];
                            }

                            // TODO: add sorting
                            // Sorting makes sure if one month (or abbr) is a prefix of another
                            // see sorting in computeMonthsParse
                            for (i = 0; i < 12; i++) {
                                // make the regex if we don't have it already
                                mom = createUTC([2000, i]);
                                if (strict && !this._longMonthsParse[i]) {
                                    this._longMonthsParse[i] = new RegExp(
                                        "^" +
                                            this.months(mom, "").replace(
                                                ".",
                                                ""
                                            ) +
                                            "$",
                                        "i"
                                    );
                                    this._shortMonthsParse[i] = new RegExp(
                                        "^" +
                                            this.monthsShort(mom, "").replace(
                                                ".",
                                                ""
                                            ) +
                                            "$",
                                        "i"
                                    );
                                }
                                if (!strict && !this._monthsParse[i]) {
                                    regex =
                                        "^" +
                                        this.months(mom, "") +
                                        "|^" +
                                        this.monthsShort(mom, "");
                                    this._monthsParse[i] = new RegExp(
                                        regex.replace(".", ""),
                                        "i"
                                    );
                                }
                                // test the regex
                                if (
                                    strict &&
                                    format === "MMMM" &&
                                    this._longMonthsParse[i].test(monthName)
                                ) {
                                    return i;
                                } else if (
                                    strict &&
                                    format === "MMM" &&
                                    this._shortMonthsParse[i].test(monthName)
                                ) {
                                    return i;
                                } else if (
                                    !strict &&
                                    this._monthsParse[i].test(monthName)
                                ) {
                                    return i;
                                }
                            }
                        }

                        // MOMENTS

                        function setMonth(mom, value) {
                            var dayOfMonth;

                            if (!mom.isValid()) {
                                // No op
                                return mom;
                            }

                            if (typeof value === "string") {
                                if (/^\d+$/.test(value)) {
                                    value = toInt(value);
                                } else {
                                    value = mom.localeData().monthsParse(value);
                                    // TODO: Another silent failure?
                                    if (!isNumber(value)) {
                                        return mom;
                                    }
                                }
                            }

                            dayOfMonth = Math.min(
                                mom.date(),
                                daysInMonth(mom.year(), value)
                            );
                            mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](
                                value,
                                dayOfMonth
                            );
                            return mom;
                        }

                        function getSetMonth(value) {
                            if (value != null) {
                                setMonth(this, value);
                                hooks.updateOffset(this, true);
                                return this;
                            } else {
                                return get(this, "Month");
                            }
                        }

                        function getDaysInMonth() {
                            return daysInMonth(this.year(), this.month());
                        }

                        var defaultMonthsShortRegex = matchWord;

                        function monthsShortRegex(isStrict) {
                            if (this._monthsParseExact) {
                                if (!hasOwnProp(this, "_monthsRegex")) {
                                    computeMonthsParse.call(this);
                                }
                                if (isStrict) {
                                    return this._monthsShortStrictRegex;
                                } else {
                                    return this._monthsShortRegex;
                                }
                            } else {
                                if (!hasOwnProp(this, "_monthsShortRegex")) {
                                    this._monthsShortRegex = defaultMonthsShortRegex;
                                }
                                return this._monthsShortStrictRegex && isStrict
                                    ? this._monthsShortStrictRegex
                                    : this._monthsShortRegex;
                            }
                        }

                        var defaultMonthsRegex = matchWord;

                        function monthsRegex(isStrict) {
                            if (this._monthsParseExact) {
                                if (!hasOwnProp(this, "_monthsRegex")) {
                                    computeMonthsParse.call(this);
                                }
                                if (isStrict) {
                                    return this._monthsStrictRegex;
                                } else {
                                    return this._monthsRegex;
                                }
                            } else {
                                if (!hasOwnProp(this, "_monthsRegex")) {
                                    this._monthsRegex = defaultMonthsRegex;
                                }
                                return this._monthsStrictRegex && isStrict
                                    ? this._monthsStrictRegex
                                    : this._monthsRegex;
                            }
                        }

                        function computeMonthsParse() {
                            function cmpLenRev(a, b) {
                                return b.length - a.length;
                            }

                            var shortPieces = [],
                                longPieces = [],
                                mixedPieces = [],
                                i,
                                mom;
                            for (i = 0; i < 12; i++) {
                                // make the regex if we don't have it already
                                mom = createUTC([2000, i]);
                                shortPieces.push(this.monthsShort(mom, ""));
                                longPieces.push(this.months(mom, ""));
                                mixedPieces.push(this.months(mom, ""));
                                mixedPieces.push(this.monthsShort(mom, ""));
                            }
                            // Sorting makes sure if one month (or abbr) is a prefix of another it
                            // will match the longer piece.
                            shortPieces.sort(cmpLenRev);
                            longPieces.sort(cmpLenRev);
                            mixedPieces.sort(cmpLenRev);
                            for (i = 0; i < 12; i++) {
                                shortPieces[i] = regexEscape(shortPieces[i]);
                                longPieces[i] = regexEscape(longPieces[i]);
                            }
                            for (i = 0; i < 24; i++) {
                                mixedPieces[i] = regexEscape(mixedPieces[i]);
                            }

                            this._monthsRegex = new RegExp(
                                "^(" + mixedPieces.join("|") + ")",
                                "i"
                            );
                            this._monthsShortRegex = this._monthsRegex;
                            this._monthsStrictRegex = new RegExp(
                                "^(" + longPieces.join("|") + ")",
                                "i"
                            );
                            this._monthsShortStrictRegex = new RegExp(
                                "^(" + shortPieces.join("|") + ")",
                                "i"
                            );
                        }

                        function createDate(y, m, d, h, M, s, ms) {
                            // can't just apply() to create a date:
                            // https://stackoverflow.com/q/181348
                            var date;
                            // the date constructor remaps years 0-99 to 1900-1999
                            if (y < 100 && y >= 0) {
                                // preserve leap years using a full 400 year cycle, then reset
                                date = new Date(y + 400, m, d, h, M, s, ms);
                                if (isFinite(date.getFullYear())) {
                                    date.setFullYear(y);
                                }
                            } else {
                                date = new Date(y, m, d, h, M, s, ms);
                            }

                            return date;
                        }

                        function createUTCDate(y) {
                            var date;
                            // the Date.UTC function remaps years 0-99 to 1900-1999
                            if (y < 100 && y >= 0) {
                                var args = Array.prototype.slice.call(
                                    arguments
                                );
                                // preserve leap years using a full 400 year cycle, then reset
                                args[0] = y + 400;
                                date = new Date(Date.UTC.apply(null, args));
                                if (isFinite(date.getUTCFullYear())) {
                                    date.setUTCFullYear(y);
                                }
                            } else {
                                date = new Date(
                                    Date.UTC.apply(null, arguments)
                                );
                            }

                            return date;
                        }

                        // start-of-first-week - start-of-year
                        function firstWeekOffset(year, dow, doy) {
                            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
                                fwd = 7 + dow - doy,
                                // first-week day local weekday -- which local weekday is fwd
                                fwdlw =
                                    (7 +
                                        createUTCDate(
                                            year,
                                            0,
                                            fwd
                                        ).getUTCDay() -
                                        dow) %
                                    7;

                            return -fwdlw + fwd - 1;
                        }

                        // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
                        function dayOfYearFromWeeks(
                            year,
                            week,
                            weekday,
                            dow,
                            doy
                        ) {
                            var localWeekday = (7 + weekday - dow) % 7,
                                weekOffset = firstWeekOffset(year, dow, doy),
                                dayOfYear =
                                    1 +
                                    7 * (week - 1) +
                                    localWeekday +
                                    weekOffset,
                                resYear,
                                resDayOfYear;

                            if (dayOfYear <= 0) {
                                resYear = year - 1;
                                resDayOfYear = daysInYear(resYear) + dayOfYear;
                            } else if (dayOfYear > daysInYear(year)) {
                                resYear = year + 1;
                                resDayOfYear = dayOfYear - daysInYear(year);
                            } else {
                                resYear = year;
                                resDayOfYear = dayOfYear;
                            }

                            return {
                                year: resYear,
                                dayOfYear: resDayOfYear,
                            };
                        }

                        function weekOfYear(mom, dow, doy) {
                            var weekOffset = firstWeekOffset(
                                    mom.year(),
                                    dow,
                                    doy
                                ),
                                week =
                                    Math.floor(
                                        (mom.dayOfYear() - weekOffset - 1) / 7
                                    ) + 1,
                                resWeek,
                                resYear;

                            if (week < 1) {
                                resYear = mom.year() - 1;
                                resWeek = week + weeksInYear(resYear, dow, doy);
                            } else if (
                                week > weeksInYear(mom.year(), dow, doy)
                            ) {
                                resWeek =
                                    week - weeksInYear(mom.year(), dow, doy);
                                resYear = mom.year() + 1;
                            } else {
                                resYear = mom.year();
                                resWeek = week;
                            }

                            return {
                                week: resWeek,
                                year: resYear,
                            };
                        }

                        function weeksInYear(year, dow, doy) {
                            var weekOffset = firstWeekOffset(year, dow, doy),
                                weekOffsetNext = firstWeekOffset(
                                    year + 1,
                                    dow,
                                    doy
                                );
                            return (
                                (daysInYear(year) -
                                    weekOffset +
                                    weekOffsetNext) /
                                7
                            );
                        }

                        // FORMATTING

                        addFormatToken("w", ["ww", 2], "wo", "week");
                        addFormatToken("W", ["WW", 2], "Wo", "isoWeek");

                        // ALIASES

                        addUnitAlias("week", "w");
                        addUnitAlias("isoWeek", "W");

                        // PRIORITIES

                        addUnitPriority("week", 5);
                        addUnitPriority("isoWeek", 5);

                        // PARSING

                        addRegexToken("w", match1to2);
                        addRegexToken("ww", match1to2, match2);
                        addRegexToken("W", match1to2);
                        addRegexToken("WW", match1to2, match2);

                        addWeekParseToken(["w", "ww", "W", "WW"], function (
                            input,
                            week,
                            config,
                            token
                        ) {
                            week[token.substr(0, 1)] = toInt(input);
                        });

                        // HELPERS

                        // LOCALES

                        function localeWeek(mom) {
                            return weekOfYear(
                                mom,
                                this._week.dow,
                                this._week.doy
                            ).week;
                        }

                        var defaultLocaleWeek = {
                            dow: 0, // Sunday is the first day of the week.
                            doy: 6, // The week that contains Jan 6th is the first week of the year.
                        };

                        function localeFirstDayOfWeek() {
                            return this._week.dow;
                        }

                        function localeFirstDayOfYear() {
                            return this._week.doy;
                        }

                        // MOMENTS

                        function getSetWeek(input) {
                            var week = this.localeData().week(this);
                            return input == null
                                ? week
                                : this.add((input - week) * 7, "d");
                        }

                        function getSetISOWeek(input) {
                            var week = weekOfYear(this, 1, 4).week;
                            return input == null
                                ? week
                                : this.add((input - week) * 7, "d");
                        }

                        // FORMATTING

                        addFormatToken("d", 0, "do", "day");

                        addFormatToken("dd", 0, 0, function (format) {
                            return this.localeData().weekdaysMin(this, format);
                        });

                        addFormatToken("ddd", 0, 0, function (format) {
                            return this.localeData().weekdaysShort(
                                this,
                                format
                            );
                        });

                        addFormatToken("dddd", 0, 0, function (format) {
                            return this.localeData().weekdays(this, format);
                        });

                        addFormatToken("e", 0, 0, "weekday");
                        addFormatToken("E", 0, 0, "isoWeekday");

                        // ALIASES

                        addUnitAlias("day", "d");
                        addUnitAlias("weekday", "e");
                        addUnitAlias("isoWeekday", "E");

                        // PRIORITY
                        addUnitPriority("day", 11);
                        addUnitPriority("weekday", 11);
                        addUnitPriority("isoWeekday", 11);

                        // PARSING

                        addRegexToken("d", match1to2);
                        addRegexToken("e", match1to2);
                        addRegexToken("E", match1to2);
                        addRegexToken("dd", function (isStrict, locale) {
                            return locale.weekdaysMinRegex(isStrict);
                        });
                        addRegexToken("ddd", function (isStrict, locale) {
                            return locale.weekdaysShortRegex(isStrict);
                        });
                        addRegexToken("dddd", function (isStrict, locale) {
                            return locale.weekdaysRegex(isStrict);
                        });

                        addWeekParseToken(["dd", "ddd", "dddd"], function (
                            input,
                            week,
                            config,
                            token
                        ) {
                            var weekday = config._locale.weekdaysParse(
                                input,
                                token,
                                config._strict
                            );
                            // if we didn't get a weekday name, mark the date as invalid
                            if (weekday != null) {
                                week.d = weekday;
                            } else {
                                getParsingFlags(config).invalidWeekday = input;
                            }
                        });

                        addWeekParseToken(["d", "e", "E"], function (
                            input,
                            week,
                            config,
                            token
                        ) {
                            week[token] = toInt(input);
                        });

                        // HELPERS

                        function parseWeekday(input, locale) {
                            if (typeof input !== "string") {
                                return input;
                            }

                            if (!isNaN(input)) {
                                return parseInt(input, 10);
                            }

                            input = locale.weekdaysParse(input);
                            if (typeof input === "number") {
                                return input;
                            }

                            return null;
                        }

                        function parseIsoWeekday(input, locale) {
                            if (typeof input === "string") {
                                return locale.weekdaysParse(input) % 7 || 7;
                            }
                            return isNaN(input) ? null : input;
                        }

                        // LOCALES
                        function shiftWeekdays(ws, n) {
                            return ws.slice(n, 7).concat(ws.slice(0, n));
                        }

                        var defaultLocaleWeekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split(
                            "_"
                        );

                        function localeWeekdays(m, format) {
                            var weekdays = isArray(this._weekdays)
                                ? this._weekdays
                                : this._weekdays[
                                      m &&
                                      m !== true &&
                                      this._weekdays.isFormat.test(format)
                                          ? "format"
                                          : "standalone"
                                  ];
                            return m === true
                                ? shiftWeekdays(weekdays, this._week.dow)
                                : m
                                ? weekdays[m.day()]
                                : weekdays;
                        }

                        var defaultLocaleWeekdaysShort = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split(
                            "_"
                        );

                        function localeWeekdaysShort(m) {
                            return m === true
                                ? shiftWeekdays(
                                      this._weekdaysShort,
                                      this._week.dow
                                  )
                                : m
                                ? this._weekdaysShort[m.day()]
                                : this._weekdaysShort;
                        }

                        var defaultLocaleWeekdaysMin = "Su_Mo_Tu_We_Th_Fr_Sa".split(
                            "_"
                        );

                        function localeWeekdaysMin(m) {
                            return m === true
                                ? shiftWeekdays(
                                      this._weekdaysMin,
                                      this._week.dow
                                  )
                                : m
                                ? this._weekdaysMin[m.day()]
                                : this._weekdaysMin;
                        }

                        function handleStrictParse$1(
                            weekdayName,
                            format,
                            strict
                        ) {
                            var i,
                                ii,
                                mom,
                                llc = weekdayName.toLocaleLowerCase();
                            if (!this._weekdaysParse) {
                                this._weekdaysParse = [];
                                this._shortWeekdaysParse = [];
                                this._minWeekdaysParse = [];

                                for (i = 0; i < 7; ++i) {
                                    mom = createUTC([2000, 1]).day(i);
                                    this._minWeekdaysParse[
                                        i
                                    ] = this.weekdaysMin(
                                        mom,
                                        ""
                                    ).toLocaleLowerCase();
                                    this._shortWeekdaysParse[
                                        i
                                    ] = this.weekdaysShort(
                                        mom,
                                        ""
                                    ).toLocaleLowerCase();
                                    this._weekdaysParse[i] = this.weekdays(
                                        mom,
                                        ""
                                    ).toLocaleLowerCase();
                                }
                            }

                            if (strict) {
                                if (format === "dddd") {
                                    ii = indexOf.call(this._weekdaysParse, llc);
                                    return ii !== -1 ? ii : null;
                                } else if (format === "ddd") {
                                    ii = indexOf.call(
                                        this._shortWeekdaysParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                } else {
                                    ii = indexOf.call(
                                        this._minWeekdaysParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                }
                            } else {
                                if (format === "dddd") {
                                    ii = indexOf.call(this._weekdaysParse, llc);
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(
                                        this._shortWeekdaysParse,
                                        llc
                                    );
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(
                                        this._minWeekdaysParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                } else if (format === "ddd") {
                                    ii = indexOf.call(
                                        this._shortWeekdaysParse,
                                        llc
                                    );
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(this._weekdaysParse, llc);
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(
                                        this._minWeekdaysParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                } else {
                                    ii = indexOf.call(
                                        this._minWeekdaysParse,
                                        llc
                                    );
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(this._weekdaysParse, llc);
                                    if (ii !== -1) {
                                        return ii;
                                    }
                                    ii = indexOf.call(
                                        this._shortWeekdaysParse,
                                        llc
                                    );
                                    return ii !== -1 ? ii : null;
                                }
                            }
                        }

                        function localeWeekdaysParse(
                            weekdayName,
                            format,
                            strict
                        ) {
                            var i, mom, regex;

                            if (this._weekdaysParseExact) {
                                return handleStrictParse$1.call(
                                    this,
                                    weekdayName,
                                    format,
                                    strict
                                );
                            }

                            if (!this._weekdaysParse) {
                                this._weekdaysParse = [];
                                this._minWeekdaysParse = [];
                                this._shortWeekdaysParse = [];
                                this._fullWeekdaysParse = [];
                            }

                            for (i = 0; i < 7; i++) {
                                // make the regex if we don't have it already

                                mom = createUTC([2000, 1]).day(i);
                                if (strict && !this._fullWeekdaysParse[i]) {
                                    this._fullWeekdaysParse[i] = new RegExp(
                                        "^" +
                                            this.weekdays(mom, "").replace(
                                                ".",
                                                "\\.?"
                                            ) +
                                            "$",
                                        "i"
                                    );
                                    this._shortWeekdaysParse[i] = new RegExp(
                                        "^" +
                                            this.weekdaysShort(mom, "").replace(
                                                ".",
                                                "\\.?"
                                            ) +
                                            "$",
                                        "i"
                                    );
                                    this._minWeekdaysParse[i] = new RegExp(
                                        "^" +
                                            this.weekdaysMin(mom, "").replace(
                                                ".",
                                                "\\.?"
                                            ) +
                                            "$",
                                        "i"
                                    );
                                }
                                if (!this._weekdaysParse[i]) {
                                    regex =
                                        "^" +
                                        this.weekdays(mom, "") +
                                        "|^" +
                                        this.weekdaysShort(mom, "") +
                                        "|^" +
                                        this.weekdaysMin(mom, "");
                                    this._weekdaysParse[i] = new RegExp(
                                        regex.replace(".", ""),
                                        "i"
                                    );
                                }
                                // test the regex
                                if (
                                    strict &&
                                    format === "dddd" &&
                                    this._fullWeekdaysParse[i].test(weekdayName)
                                ) {
                                    return i;
                                } else if (
                                    strict &&
                                    format === "ddd" &&
                                    this._shortWeekdaysParse[i].test(
                                        weekdayName
                                    )
                                ) {
                                    return i;
                                } else if (
                                    strict &&
                                    format === "dd" &&
                                    this._minWeekdaysParse[i].test(weekdayName)
                                ) {
                                    return i;
                                } else if (
                                    !strict &&
                                    this._weekdaysParse[i].test(weekdayName)
                                ) {
                                    return i;
                                }
                            }
                        }

                        // MOMENTS

                        function getSetDayOfWeek(input) {
                            if (!this.isValid()) {
                                return input != null ? this : NaN;
                            }
                            var day = this._isUTC
                                ? this._d.getUTCDay()
                                : this._d.getDay();
                            if (input != null) {
                                input = parseWeekday(input, this.localeData());
                                return this.add(input - day, "d");
                            } else {
                                return day;
                            }
                        }

                        function getSetLocaleDayOfWeek(input) {
                            if (!this.isValid()) {
                                return input != null ? this : NaN;
                            }
                            var weekday =
                                (this.day() + 7 - this.localeData()._week.dow) %
                                7;
                            return input == null
                                ? weekday
                                : this.add(input - weekday, "d");
                        }

                        function getSetISODayOfWeek(input) {
                            if (!this.isValid()) {
                                return input != null ? this : NaN;
                            }

                            // behaves the same as moment#day except
                            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
                            // as a setter, sunday should belong to the previous week.

                            if (input != null) {
                                var weekday = parseIsoWeekday(
                                    input,
                                    this.localeData()
                                );
                                return this.day(
                                    this.day() % 7 ? weekday : weekday - 7
                                );
                            } else {
                                return this.day() || 7;
                            }
                        }

                        var defaultWeekdaysRegex = matchWord;

                        function weekdaysRegex(isStrict) {
                            if (this._weekdaysParseExact) {
                                if (!hasOwnProp(this, "_weekdaysRegex")) {
                                    computeWeekdaysParse.call(this);
                                }
                                if (isStrict) {
                                    return this._weekdaysStrictRegex;
                                } else {
                                    return this._weekdaysRegex;
                                }
                            } else {
                                if (!hasOwnProp(this, "_weekdaysRegex")) {
                                    this._weekdaysRegex = defaultWeekdaysRegex;
                                }
                                return this._weekdaysStrictRegex && isStrict
                                    ? this._weekdaysStrictRegex
                                    : this._weekdaysRegex;
                            }
                        }

                        var defaultWeekdaysShortRegex = matchWord;

                        function weekdaysShortRegex(isStrict) {
                            if (this._weekdaysParseExact) {
                                if (!hasOwnProp(this, "_weekdaysRegex")) {
                                    computeWeekdaysParse.call(this);
                                }
                                if (isStrict) {
                                    return this._weekdaysShortStrictRegex;
                                } else {
                                    return this._weekdaysShortRegex;
                                }
                            } else {
                                if (!hasOwnProp(this, "_weekdaysShortRegex")) {
                                    this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                                }
                                return this._weekdaysShortStrictRegex &&
                                    isStrict
                                    ? this._weekdaysShortStrictRegex
                                    : this._weekdaysShortRegex;
                            }
                        }

                        var defaultWeekdaysMinRegex = matchWord;

                        function weekdaysMinRegex(isStrict) {
                            if (this._weekdaysParseExact) {
                                if (!hasOwnProp(this, "_weekdaysRegex")) {
                                    computeWeekdaysParse.call(this);
                                }
                                if (isStrict) {
                                    return this._weekdaysMinStrictRegex;
                                } else {
                                    return this._weekdaysMinRegex;
                                }
                            } else {
                                if (!hasOwnProp(this, "_weekdaysMinRegex")) {
                                    this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                                }
                                return this._weekdaysMinStrictRegex && isStrict
                                    ? this._weekdaysMinStrictRegex
                                    : this._weekdaysMinRegex;
                            }
                        }

                        function computeWeekdaysParse() {
                            function cmpLenRev(a, b) {
                                return b.length - a.length;
                            }

                            var minPieces = [],
                                shortPieces = [],
                                longPieces = [],
                                mixedPieces = [],
                                i,
                                mom,
                                minp,
                                shortp,
                                longp;
                            for (i = 0; i < 7; i++) {
                                // make the regex if we don't have it already
                                mom = createUTC([2000, 1]).day(i);
                                minp = this.weekdaysMin(mom, "");
                                shortp = this.weekdaysShort(mom, "");
                                longp = this.weekdays(mom, "");
                                minPieces.push(minp);
                                shortPieces.push(shortp);
                                longPieces.push(longp);
                                mixedPieces.push(minp);
                                mixedPieces.push(shortp);
                                mixedPieces.push(longp);
                            }
                            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
                            // will match the longer piece.
                            minPieces.sort(cmpLenRev);
                            shortPieces.sort(cmpLenRev);
                            longPieces.sort(cmpLenRev);
                            mixedPieces.sort(cmpLenRev);
                            for (i = 0; i < 7; i++) {
                                shortPieces[i] = regexEscape(shortPieces[i]);
                                longPieces[i] = regexEscape(longPieces[i]);
                                mixedPieces[i] = regexEscape(mixedPieces[i]);
                            }

                            this._weekdaysRegex = new RegExp(
                                "^(" + mixedPieces.join("|") + ")",
                                "i"
                            );
                            this._weekdaysShortRegex = this._weekdaysRegex;
                            this._weekdaysMinRegex = this._weekdaysRegex;

                            this._weekdaysStrictRegex = new RegExp(
                                "^(" + longPieces.join("|") + ")",
                                "i"
                            );
                            this._weekdaysShortStrictRegex = new RegExp(
                                "^(" + shortPieces.join("|") + ")",
                                "i"
                            );
                            this._weekdaysMinStrictRegex = new RegExp(
                                "^(" + minPieces.join("|") + ")",
                                "i"
                            );
                        }

                        // FORMATTING

                        function hFormat() {
                            return this.hours() % 12 || 12;
                        }

                        function kFormat() {
                            return this.hours() || 24;
                        }

                        addFormatToken("H", ["HH", 2], 0, "hour");
                        addFormatToken("h", ["hh", 2], 0, hFormat);
                        addFormatToken("k", ["kk", 2], 0, kFormat);

                        addFormatToken("hmm", 0, 0, function () {
                            return (
                                "" +
                                hFormat.apply(this) +
                                zeroFill(this.minutes(), 2)
                            );
                        });

                        addFormatToken("hmmss", 0, 0, function () {
                            return (
                                "" +
                                hFormat.apply(this) +
                                zeroFill(this.minutes(), 2) +
                                zeroFill(this.seconds(), 2)
                            );
                        });

                        addFormatToken("Hmm", 0, 0, function () {
                            return (
                                "" + this.hours() + zeroFill(this.minutes(), 2)
                            );
                        });

                        addFormatToken("Hmmss", 0, 0, function () {
                            return (
                                "" +
                                this.hours() +
                                zeroFill(this.minutes(), 2) +
                                zeroFill(this.seconds(), 2)
                            );
                        });

                        function meridiem(token, lowercase) {
                            addFormatToken(token, 0, 0, function () {
                                return this.localeData().meridiem(
                                    this.hours(),
                                    this.minutes(),
                                    lowercase
                                );
                            });
                        }

                        meridiem("a", true);
                        meridiem("A", false);

                        // ALIASES

                        addUnitAlias("hour", "h");

                        // PRIORITY
                        addUnitPriority("hour", 13);

                        // PARSING

                        function matchMeridiem(isStrict, locale) {
                            return locale._meridiemParse;
                        }

                        addRegexToken("a", matchMeridiem);
                        addRegexToken("A", matchMeridiem);
                        addRegexToken("H", match1to2);
                        addRegexToken("h", match1to2);
                        addRegexToken("k", match1to2);
                        addRegexToken("HH", match1to2, match2);
                        addRegexToken("hh", match1to2, match2);
                        addRegexToken("kk", match1to2, match2);

                        addRegexToken("hmm", match3to4);
                        addRegexToken("hmmss", match5to6);
                        addRegexToken("Hmm", match3to4);
                        addRegexToken("Hmmss", match5to6);

                        addParseToken(["H", "HH"], HOUR);
                        addParseToken(["k", "kk"], function (
                            input,
                            array,
                            config
                        ) {
                            var kInput = toInt(input);
                            array[HOUR] = kInput === 24 ? 0 : kInput;
                        });
                        addParseToken(["a", "A"], function (
                            input,
                            array,
                            config
                        ) {
                            config._isPm = config._locale.isPM(input);
                            config._meridiem = input;
                        });
                        addParseToken(["h", "hh"], function (
                            input,
                            array,
                            config
                        ) {
                            array[HOUR] = toInt(input);
                            getParsingFlags(config).bigHour = true;
                        });
                        addParseToken("hmm", function (input, array, config) {
                            var pos = input.length - 2;
                            array[HOUR] = toInt(input.substr(0, pos));
                            array[MINUTE] = toInt(input.substr(pos));
                            getParsingFlags(config).bigHour = true;
                        });
                        addParseToken("hmmss", function (input, array, config) {
                            var pos1 = input.length - 4;
                            var pos2 = input.length - 2;
                            array[HOUR] = toInt(input.substr(0, pos1));
                            array[MINUTE] = toInt(input.substr(pos1, 2));
                            array[SECOND] = toInt(input.substr(pos2));
                            getParsingFlags(config).bigHour = true;
                        });
                        addParseToken("Hmm", function (input, array, config) {
                            var pos = input.length - 2;
                            array[HOUR] = toInt(input.substr(0, pos));
                            array[MINUTE] = toInt(input.substr(pos));
                        });
                        addParseToken("Hmmss", function (input, array, config) {
                            var pos1 = input.length - 4;
                            var pos2 = input.length - 2;
                            array[HOUR] = toInt(input.substr(0, pos1));
                            array[MINUTE] = toInt(input.substr(pos1, 2));
                            array[SECOND] = toInt(input.substr(pos2));
                        });

                        // LOCALES

                        function localeIsPM(input) {
                            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
                            // Using charAt should be more compatible.
                            return (input + "").toLowerCase().charAt(0) === "p";
                        }

                        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;

                        function localeMeridiem(hours, minutes, isLower) {
                            if (hours > 11) {
                                return isLower ? "pm" : "PM";
                            } else {
                                return isLower ? "am" : "AM";
                            }
                        }

                        // MOMENTS

                        // Setting the hour should keep the time, because the user explicitly
                        // specified which hour they want. So trying to maintain the same hour (in
                        // a new timezone) makes sense. Adding/subtracting hours does not follow
                        // this rule.
                        var getSetHour = makeGetSet("Hours", true);

                        var baseConfig = {
                            calendar: defaultCalendar,
                            longDateFormat: defaultLongDateFormat,
                            invalidDate: defaultInvalidDate,
                            ordinal: defaultOrdinal,
                            dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
                            relativeTime: defaultRelativeTime,

                            months: defaultLocaleMonths,
                            monthsShort: defaultLocaleMonthsShort,

                            week: defaultLocaleWeek,

                            weekdays: defaultLocaleWeekdays,
                            weekdaysMin: defaultLocaleWeekdaysMin,
                            weekdaysShort: defaultLocaleWeekdaysShort,

                            meridiemParse: defaultLocaleMeridiemParse,
                        };

                        // internal storage for locale config files
                        var locales = {};
                        var localeFamilies = {};
                        var globalLocale;

                        function normalizeLocale(key) {
                            return key
                                ? key.toLowerCase().replace("_", "-")
                                : key;
                        }

                        // pick the locale from the array
                        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
                        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
                        function chooseLocale(names) {
                            var i = 0,
                                j,
                                next,
                                locale,
                                split;

                            while (i < names.length) {
                                split = normalizeLocale(names[i]).split("-");
                                j = split.length;
                                next = normalizeLocale(names[i + 1]);
                                next = next ? next.split("-") : null;
                                while (j > 0) {
                                    locale = loadLocale(
                                        split.slice(0, j).join("-")
                                    );
                                    if (locale) {
                                        return locale;
                                    }
                                    if (
                                        next &&
                                        next.length >= j &&
                                        compareArrays(split, next, true) >=
                                            j - 1
                                    ) {
                                        //the next array item is better than a shallower substring of this one
                                        break;
                                    }
                                    j--;
                                }
                                i++;
                            }
                            return globalLocale;
                        }

                        function loadLocale(name) {
                            var oldLocale = null;
                            // TODO: Find a better way to register and load all the locales in Node
                            if (
                                !locales[name] &&
                                typeof module !== "undefined" &&
                                module &&
                                module.exports
                            ) {
                                try {
                                    oldLocale = globalLocale._abbr;
                                    var aliasedRequire = require;
                                    aliasedRequire("./locale/" + name);
                                    getSetGlobalLocale(oldLocale);
                                } catch (e) {}
                            }
                            return locales[name];
                        }

                        // This function will load locale and then set the global locale.  If
                        // no arguments are passed in, it will simply return the current global
                        // locale key.
                        function getSetGlobalLocale(key, values) {
                            var data;
                            if (key) {
                                if (isUndefined(values)) {
                                    data = getLocale(key);
                                } else {
                                    data = defineLocale(key, values);
                                }

                                if (data) {
                                    // moment.duration._locale = moment._locale = data;
                                    globalLocale = data;
                                } else {
                                    if (
                                        typeof console !== "undefined" &&
                                        console.warn
                                    ) {
                                        //warn user if arguments are passed but the locale could not be set
                                        console.warn(
                                            "Locale " +
                                                key +
                                                " not found. Did you forget to load it?"
                                        );
                                    }
                                }
                            }

                            return globalLocale._abbr;
                        }

                        function defineLocale(name, config) {
                            if (config !== null) {
                                var locale,
                                    parentConfig = baseConfig;
                                config.abbr = name;
                                if (locales[name] != null) {
                                    deprecateSimple(
                                        "defineLocaleOverride",
                                        "use moment.updateLocale(localeName, config) to change " +
                                            "an existing locale. moment.defineLocale(localeName, " +
                                            "config) should only be used for creating a new locale " +
                                            "See http://momentjs.com/guides/#/warnings/define-locale/ for more info."
                                    );
                                    parentConfig = locales[name]._config;
                                } else if (config.parentLocale != null) {
                                    if (locales[config.parentLocale] != null) {
                                        parentConfig =
                                            locales[config.parentLocale]
                                                ._config;
                                    } else {
                                        locale = loadLocale(
                                            config.parentLocale
                                        );
                                        if (locale != null) {
                                            parentConfig = locale._config;
                                        } else {
                                            if (
                                                !localeFamilies[
                                                    config.parentLocale
                                                ]
                                            ) {
                                                localeFamilies[
                                                    config.parentLocale
                                                ] = [];
                                            }
                                            localeFamilies[
                                                config.parentLocale
                                            ].push({
                                                name: name,
                                                config: config,
                                            });
                                            return null;
                                        }
                                    }
                                }
                                locales[name] = new Locale(
                                    mergeConfigs(parentConfig, config)
                                );

                                if (localeFamilies[name]) {
                                    localeFamilies[name].forEach(function (x) {
                                        defineLocale(x.name, x.config);
                                    });
                                }

                                // backwards compat for now: also set the locale
                                // make sure we set the locale AFTER all child locales have been
                                // created, so we won't end up with the child locale set.
                                getSetGlobalLocale(name);

                                return locales[name];
                            } else {
                                // useful for testing
                                delete locales[name];
                                return null;
                            }
                        }

                        function updateLocale(name, config) {
                            if (config != null) {
                                var locale,
                                    tmpLocale,
                                    parentConfig = baseConfig;
                                // MERGE
                                tmpLocale = loadLocale(name);
                                if (tmpLocale != null) {
                                    parentConfig = tmpLocale._config;
                                }
                                config = mergeConfigs(parentConfig, config);
                                locale = new Locale(config);
                                locale.parentLocale = locales[name];
                                locales[name] = locale;

                                // backwards compat for now: also set the locale
                                getSetGlobalLocale(name);
                            } else {
                                // pass null for config to unupdate, useful for tests
                                if (locales[name] != null) {
                                    if (locales[name].parentLocale != null) {
                                        locales[name] =
                                            locales[name].parentLocale;
                                    } else if (locales[name] != null) {
                                        delete locales[name];
                                    }
                                }
                            }
                            return locales[name];
                        }

                        // returns locale data
                        function getLocale(key) {
                            var locale;

                            if (key && key._locale && key._locale._abbr) {
                                key = key._locale._abbr;
                            }

                            if (!key) {
                                return globalLocale;
                            }

                            if (!isArray(key)) {
                                //short-circuit everything else
                                locale = loadLocale(key);
                                if (locale) {
                                    return locale;
                                }
                                key = [key];
                            }

                            return chooseLocale(key);
                        }

                        function listLocales() {
                            return keys(locales);
                        }

                        function checkOverflow(m) {
                            var overflow;
                            var a = m._a;

                            if (a && getParsingFlags(m).overflow === -2) {
                                overflow =
                                    a[MONTH] < 0 || a[MONTH] > 11
                                        ? MONTH
                                        : a[DATE] < 1 ||
                                          a[DATE] >
                                              daysInMonth(a[YEAR], a[MONTH])
                                        ? DATE
                                        : a[HOUR] < 0 ||
                                          a[HOUR] > 24 ||
                                          (a[HOUR] === 24 &&
                                              (a[MINUTE] !== 0 ||
                                                  a[SECOND] !== 0 ||
                                                  a[MILLISECOND] !== 0))
                                        ? HOUR
                                        : a[MINUTE] < 0 || a[MINUTE] > 59
                                        ? MINUTE
                                        : a[SECOND] < 0 || a[SECOND] > 59
                                        ? SECOND
                                        : a[MILLISECOND] < 0 ||
                                          a[MILLISECOND] > 999
                                        ? MILLISECOND
                                        : -1;

                                if (
                                    getParsingFlags(m)._overflowDayOfYear &&
                                    (overflow < YEAR || overflow > DATE)
                                ) {
                                    overflow = DATE;
                                }
                                if (
                                    getParsingFlags(m)._overflowWeeks &&
                                    overflow === -1
                                ) {
                                    overflow = WEEK;
                                }
                                if (
                                    getParsingFlags(m)._overflowWeekday &&
                                    overflow === -1
                                ) {
                                    overflow = WEEKDAY;
                                }

                                getParsingFlags(m).overflow = overflow;
                            }

                            return m;
                        }

                        // Pick the first defined of two or three arguments.
                        function defaults(a, b, c) {
                            if (a != null) {
                                return a;
                            }
                            if (b != null) {
                                return b;
                            }
                            return c;
                        }

                        function currentDateArray(config) {
                            // hooks is actually the exported moment object
                            var nowValue = new Date(hooks.now());
                            if (config._useUTC) {
                                return [
                                    nowValue.getUTCFullYear(),
                                    nowValue.getUTCMonth(),
                                    nowValue.getUTCDate(),
                                ];
                            }
                            return [
                                nowValue.getFullYear(),
                                nowValue.getMonth(),
                                nowValue.getDate(),
                            ];
                        }

                        // convert an array to a date.
                        // the array should mirror the parameters below
                        // note: all values past the year are optional and will default to the lowest possible value.
                        // [year, month, day , hour, minute, second, millisecond]
                        function configFromArray(config) {
                            var i,
                                date,
                                input = [],
                                currentDate,
                                expectedWeekday,
                                yearToUse;

                            if (config._d) {
                                return;
                            }

                            currentDate = currentDateArray(config);

                            //compute day of the year from weeks and weekdays
                            if (
                                config._w &&
                                config._a[DATE] == null &&
                                config._a[MONTH] == null
                            ) {
                                dayOfYearFromWeekInfo(config);
                            }

                            //if the day of the year is set, figure out what it is
                            if (config._dayOfYear != null) {
                                yearToUse = defaults(
                                    config._a[YEAR],
                                    currentDate[YEAR]
                                );

                                if (
                                    config._dayOfYear > daysInYear(yearToUse) ||
                                    config._dayOfYear === 0
                                ) {
                                    getParsingFlags(
                                        config
                                    )._overflowDayOfYear = true;
                                }

                                date = createUTCDate(
                                    yearToUse,
                                    0,
                                    config._dayOfYear
                                );
                                config._a[MONTH] = date.getUTCMonth();
                                config._a[DATE] = date.getUTCDate();
                            }

                            // Default to current date.
                            // * if no year, month, day of month are given, default to today
                            // * if day of month is given, default month and year
                            // * if month is given, default only year
                            // * if year is given, don't default anything
                            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                                config._a[i] = input[i] = currentDate[i];
                            }

                            // Zero out whatever was not defaulted, including time
                            for (; i < 7; i++) {
                                config._a[i] = input[i] =
                                    config._a[i] == null
                                        ? i === 2
                                            ? 1
                                            : 0
                                        : config._a[i];
                            }

                            // Check for 24:00:00.000
                            if (
                                config._a[HOUR] === 24 &&
                                config._a[MINUTE] === 0 &&
                                config._a[SECOND] === 0 &&
                                config._a[MILLISECOND] === 0
                            ) {
                                config._nextDay = true;
                                config._a[HOUR] = 0;
                            }

                            config._d = (config._useUTC
                                ? createUTCDate
                                : createDate
                            ).apply(null, input);
                            expectedWeekday = config._useUTC
                                ? config._d.getUTCDay()
                                : config._d.getDay();

                            // Apply timezone offset from input. The actual utcOffset can be changed
                            // with parseZone.
                            if (config._tzm != null) {
                                config._d.setUTCMinutes(
                                    config._d.getUTCMinutes() - config._tzm
                                );
                            }

                            if (config._nextDay) {
                                config._a[HOUR] = 24;
                            }

                            // check for mismatching day of week
                            if (
                                config._w &&
                                typeof config._w.d !== "undefined" &&
                                config._w.d !== expectedWeekday
                            ) {
                                getParsingFlags(config).weekdayMismatch = true;
                            }
                        }

                        function dayOfYearFromWeekInfo(config) {
                            var w,
                                weekYear,
                                week,
                                weekday,
                                dow,
                                doy,
                                temp,
                                weekdayOverflow;

                            w = config._w;
                            if (w.GG != null || w.W != null || w.E != null) {
                                dow = 1;
                                doy = 4;

                                // TODO: We need to take the current isoWeekYear, but that depends on
                                // how we interpret now (local, utc, fixed offset). So create
                                // a now version of current config (take local/utc/offset flags, and
                                // create now).
                                weekYear = defaults(
                                    w.GG,
                                    config._a[YEAR],
                                    weekOfYear(createLocal(), 1, 4).year
                                );
                                week = defaults(w.W, 1);
                                weekday = defaults(w.E, 1);
                                if (weekday < 1 || weekday > 7) {
                                    weekdayOverflow = true;
                                }
                            } else {
                                dow = config._locale._week.dow;
                                doy = config._locale._week.doy;

                                var curWeek = weekOfYear(
                                    createLocal(),
                                    dow,
                                    doy
                                );

                                weekYear = defaults(
                                    w.gg,
                                    config._a[YEAR],
                                    curWeek.year
                                );

                                // Default to current week.
                                week = defaults(w.w, curWeek.week);

                                if (w.d != null) {
                                    // weekday -- low day numbers are considered next week
                                    weekday = w.d;
                                    if (weekday < 0 || weekday > 6) {
                                        weekdayOverflow = true;
                                    }
                                } else if (w.e != null) {
                                    // local weekday -- counting starts from beginning of week
                                    weekday = w.e + dow;
                                    if (w.e < 0 || w.e > 6) {
                                        weekdayOverflow = true;
                                    }
                                } else {
                                    // default to beginning of week
                                    weekday = dow;
                                }
                            }
                            if (
                                week < 1 ||
                                week > weeksInYear(weekYear, dow, doy)
                            ) {
                                getParsingFlags(config)._overflowWeeks = true;
                            } else if (weekdayOverflow != null) {
                                getParsingFlags(config)._overflowWeekday = true;
                            } else {
                                temp = dayOfYearFromWeeks(
                                    weekYear,
                                    week,
                                    weekday,
                                    dow,
                                    doy
                                );
                                config._a[YEAR] = temp.year;
                                config._dayOfYear = temp.dayOfYear;
                            }
                        }

                        // iso 8601 regex
                        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
                        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
                        var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

                        var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

                        var isoDates = [
                            ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
                            ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
                            ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
                            ["GGGG-[W]WW", /\d{4}-W\d\d/, false],
                            ["YYYY-DDD", /\d{4}-\d{3}/],
                            ["YYYY-MM", /\d{4}-\d\d/, false],
                            ["YYYYYYMMDD", /[+-]\d{10}/],
                            ["YYYYMMDD", /\d{8}/],
                            // YYYYMM is NOT allowed by the standard
                            ["GGGG[W]WWE", /\d{4}W\d{3}/],
                            ["GGGG[W]WW", /\d{4}W\d{2}/, false],
                            ["YYYYDDD", /\d{7}/],
                        ];

                        // iso time formats and regexes
                        var isoTimes = [
                            ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
                            ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
                            ["HH:mm:ss", /\d\d:\d\d:\d\d/],
                            ["HH:mm", /\d\d:\d\d/],
                            ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
                            ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
                            ["HHmmss", /\d\d\d\d\d\d/],
                            ["HHmm", /\d\d\d\d/],
                            ["HH", /\d\d/],
                        ];

                        var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

                        // date from iso format
                        function configFromISO(config) {
                            var i,
                                l,
                                string = config._i,
                                match =
                                    extendedIsoRegex.exec(string) ||
                                    basicIsoRegex.exec(string),
                                allowTime,
                                dateFormat,
                                timeFormat,
                                tzFormat;

                            if (match) {
                                getParsingFlags(config).iso = true;

                                for (i = 0, l = isoDates.length; i < l; i++) {
                                    if (isoDates[i][1].exec(match[1])) {
                                        dateFormat = isoDates[i][0];
                                        allowTime = isoDates[i][2] !== false;
                                        break;
                                    }
                                }
                                if (dateFormat == null) {
                                    config._isValid = false;
                                    return;
                                }
                                if (match[3]) {
                                    for (
                                        i = 0, l = isoTimes.length;
                                        i < l;
                                        i++
                                    ) {
                                        if (isoTimes[i][1].exec(match[3])) {
                                            // match[2] should be 'T' or space
                                            timeFormat =
                                                (match[2] || " ") +
                                                isoTimes[i][0];
                                            break;
                                        }
                                    }
                                    if (timeFormat == null) {
                                        config._isValid = false;
                                        return;
                                    }
                                }
                                if (!allowTime && timeFormat != null) {
                                    config._isValid = false;
                                    return;
                                }
                                if (match[4]) {
                                    if (tzRegex.exec(match[4])) {
                                        tzFormat = "Z";
                                    } else {
                                        config._isValid = false;
                                        return;
                                    }
                                }
                                config._f =
                                    dateFormat +
                                    (timeFormat || "") +
                                    (tzFormat || "");
                                configFromStringAndFormat(config);
                            } else {
                                config._isValid = false;
                            }
                        }

                        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
                        var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

                        function extractFromRFC2822Strings(
                            yearStr,
                            monthStr,
                            dayStr,
                            hourStr,
                            minuteStr,
                            secondStr
                        ) {
                            var result = [
                                untruncateYear(yearStr),
                                defaultLocaleMonthsShort.indexOf(monthStr),
                                parseInt(dayStr, 10),
                                parseInt(hourStr, 10),
                                parseInt(minuteStr, 10),
                            ];

                            if (secondStr) {
                                result.push(parseInt(secondStr, 10));
                            }

                            return result;
                        }

                        function untruncateYear(yearStr) {
                            var year = parseInt(yearStr, 10);
                            if (year <= 49) {
                                return 2000 + year;
                            } else if (year <= 999) {
                                return 1900 + year;
                            }
                            return year;
                        }

                        function preprocessRFC2822(s) {
                            // Remove comments and folding whitespace and replace multiple-spaces with a single space
                            return s
                                .replace(/\([^)]*\)|[\n\t]/g, " ")
                                .replace(/(\s\s+)/g, " ")
                                .replace(/^\s\s*/, "")
                                .replace(/\s\s*$/, "");
                        }

                        function checkWeekday(weekdayStr, parsedInput, config) {
                            if (weekdayStr) {
                                // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
                                var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(
                                        weekdayStr
                                    ),
                                    weekdayActual = new Date(
                                        parsedInput[0],
                                        parsedInput[1],
                                        parsedInput[2]
                                    ).getDay();
                                if (weekdayProvided !== weekdayActual) {
                                    getParsingFlags(
                                        config
                                    ).weekdayMismatch = true;
                                    config._isValid = false;
                                    return false;
                                }
                            }
                            return true;
                        }

                        var obsOffsets = {
                            UT: 0,
                            GMT: 0,
                            EDT: -4 * 60,
                            EST: -5 * 60,
                            CDT: -5 * 60,
                            CST: -6 * 60,
                            MDT: -6 * 60,
                            MST: -7 * 60,
                            PDT: -7 * 60,
                            PST: -8 * 60,
                        };

                        function calculateOffset(
                            obsOffset,
                            militaryOffset,
                            numOffset
                        ) {
                            if (obsOffset) {
                                return obsOffsets[obsOffset];
                            } else if (militaryOffset) {
                                // the only allowed military tz is Z
                                return 0;
                            } else {
                                var hm = parseInt(numOffset, 10);
                                var m = hm % 100,
                                    h = (hm - m) / 100;
                                return h * 60 + m;
                            }
                        }

                        // date and time from ref 2822 format
                        function configFromRFC2822(config) {
                            var match = rfc2822.exec(
                                preprocessRFC2822(config._i)
                            );
                            if (match) {
                                var parsedArray = extractFromRFC2822Strings(
                                    match[4],
                                    match[3],
                                    match[2],
                                    match[5],
                                    match[6],
                                    match[7]
                                );
                                if (
                                    !checkWeekday(match[1], parsedArray, config)
                                ) {
                                    return;
                                }

                                config._a = parsedArray;
                                config._tzm = calculateOffset(
                                    match[8],
                                    match[9],
                                    match[10]
                                );

                                config._d = createUTCDate.apply(
                                    null,
                                    config._a
                                );
                                config._d.setUTCMinutes(
                                    config._d.getUTCMinutes() - config._tzm
                                );

                                getParsingFlags(config).rfc2822 = true;
                            } else {
                                config._isValid = false;
                            }
                        }

                        // date from iso format or fallback
                        function configFromString(config) {
                            var matched = aspNetJsonRegex.exec(config._i);

                            if (matched !== null) {
                                config._d = new Date(+matched[1]);
                                return;
                            }

                            configFromISO(config);
                            if (config._isValid === false) {
                                delete config._isValid;
                            } else {
                                return;
                            }

                            configFromRFC2822(config);
                            if (config._isValid === false) {
                                delete config._isValid;
                            } else {
                                return;
                            }

                            // Final attempt, use Input Fallback
                            hooks.createFromInputFallback(config);
                        }

                        hooks.createFromInputFallback = deprecate(
                            "value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), " +
                                "which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are " +
                                "discouraged and will be removed in an upcoming major release. Please refer to " +
                                "http://momentjs.com/guides/#/warnings/js-date/ for more info.",
                            function (config) {
                                config._d = new Date(
                                    config._i + (config._useUTC ? " UTC" : "")
                                );
                            }
                        );

                        // constant that refers to the ISO standard
                        hooks.ISO_8601 = function () {};

                        // constant that refers to the RFC 2822 form
                        hooks.RFC_2822 = function () {};

                        // date from string and format string
                        function configFromStringAndFormat(config) {
                            // TODO: Move this to another part of the creation flow to prevent circular deps
                            if (config._f === hooks.ISO_8601) {
                                configFromISO(config);
                                return;
                            }
                            if (config._f === hooks.RFC_2822) {
                                configFromRFC2822(config);
                                return;
                            }
                            config._a = [];
                            getParsingFlags(config).empty = true;

                            // This array is used to make a Date, either with `new Date` or `Date.UTC`
                            var string = "" + config._i,
                                i,
                                parsedInput,
                                tokens,
                                token,
                                skipped,
                                stringLength = string.length,
                                totalParsedInputLength = 0;

                            tokens =
                                expandFormat(config._f, config._locale).match(
                                    formattingTokens
                                ) || [];

                            for (i = 0; i < tokens.length; i++) {
                                token = tokens[i];
                                parsedInput = (string.match(
                                    getParseRegexForToken(token, config)
                                ) || [])[0];
                                // console.log('token', token, 'parsedInput', parsedInput,
                                //         'regex', getParseRegexForToken(token, config));
                                if (parsedInput) {
                                    skipped = string.substr(
                                        0,
                                        string.indexOf(parsedInput)
                                    );
                                    if (skipped.length > 0) {
                                        getParsingFlags(
                                            config
                                        ).unusedInput.push(skipped);
                                    }
                                    string = string.slice(
                                        string.indexOf(parsedInput) +
                                            parsedInput.length
                                    );
                                    totalParsedInputLength +=
                                        parsedInput.length;
                                }
                                // don't parse if it's not a known token
                                if (formatTokenFunctions[token]) {
                                    if (parsedInput) {
                                        getParsingFlags(config).empty = false;
                                    } else {
                                        getParsingFlags(
                                            config
                                        ).unusedTokens.push(token);
                                    }
                                    addTimeToArrayFromToken(
                                        token,
                                        parsedInput,
                                        config
                                    );
                                } else if (config._strict && !parsedInput) {
                                    getParsingFlags(config).unusedTokens.push(
                                        token
                                    );
                                }
                            }

                            // add remaining unparsed input length to the string
                            getParsingFlags(config).charsLeftOver =
                                stringLength - totalParsedInputLength;
                            if (string.length > 0) {
                                getParsingFlags(config).unusedInput.push(
                                    string
                                );
                            }

                            // clear _12h flag if hour is <= 12
                            if (
                                config._a[HOUR] <= 12 &&
                                getParsingFlags(config).bigHour === true &&
                                config._a[HOUR] > 0
                            ) {
                                getParsingFlags(config).bigHour = undefined;
                            }

                            getParsingFlags(
                                config
                            ).parsedDateParts = config._a.slice(0);
                            getParsingFlags(config).meridiem = config._meridiem;
                            // handle meridiem
                            config._a[HOUR] = meridiemFixWrap(
                                config._locale,
                                config._a[HOUR],
                                config._meridiem
                            );

                            configFromArray(config);
                            checkOverflow(config);
                        }

                        function meridiemFixWrap(locale, hour, meridiem) {
                            var isPm;

                            if (meridiem == null) {
                                // nothing to do
                                return hour;
                            }
                            if (locale.meridiemHour != null) {
                                return locale.meridiemHour(hour, meridiem);
                            } else if (locale.isPM != null) {
                                // Fallback
                                isPm = locale.isPM(meridiem);
                                if (isPm && hour < 12) {
                                    hour += 12;
                                }
                                if (!isPm && hour === 12) {
                                    hour = 0;
                                }
                                return hour;
                            } else {
                                // this is not supposed to happen
                                return hour;
                            }
                        }

                        // date from string and array of format strings
                        function configFromStringAndArray(config) {
                            var tempConfig,
                                bestMoment,
                                scoreToBeat,
                                i,
                                currentScore;

                            if (config._f.length === 0) {
                                getParsingFlags(config).invalidFormat = true;
                                config._d = new Date(NaN);
                                return;
                            }

                            for (i = 0; i < config._f.length; i++) {
                                currentScore = 0;
                                tempConfig = copyConfig({}, config);
                                if (config._useUTC != null) {
                                    tempConfig._useUTC = config._useUTC;
                                }
                                tempConfig._f = config._f[i];
                                configFromStringAndFormat(tempConfig);

                                if (!isValid(tempConfig)) {
                                    continue;
                                }

                                // if there is any input that was not parsed add a penalty for that format
                                currentScore += getParsingFlags(tempConfig)
                                    .charsLeftOver;

                                //or tokens
                                currentScore +=
                                    getParsingFlags(tempConfig).unusedTokens
                                        .length * 10;

                                getParsingFlags(
                                    tempConfig
                                ).score = currentScore;

                                if (
                                    scoreToBeat == null ||
                                    currentScore < scoreToBeat
                                ) {
                                    scoreToBeat = currentScore;
                                    bestMoment = tempConfig;
                                }
                            }

                            extend(config, bestMoment || tempConfig);
                        }

                        function configFromObject(config) {
                            if (config._d) {
                                return;
                            }

                            var i = normalizeObjectUnits(config._i);
                            config._a = map(
                                [
                                    i.year,
                                    i.month,
                                    i.day || i.date,
                                    i.hour,
                                    i.minute,
                                    i.second,
                                    i.millisecond,
                                ],
                                function (obj) {
                                    return obj && parseInt(obj, 10);
                                }
                            );

                            configFromArray(config);
                        }

                        function createFromConfig(config) {
                            var res = new Moment(
                                checkOverflow(prepareConfig(config))
                            );
                            if (res._nextDay) {
                                // Adding is smart enough around DST
                                res.add(1, "d");
                                res._nextDay = undefined;
                            }

                            return res;
                        }

                        function prepareConfig(config) {
                            var input = config._i,
                                format = config._f;

                            config._locale =
                                config._locale || getLocale(config._l);

                            if (
                                input === null ||
                                (format === undefined && input === "")
                            ) {
                                return createInvalid({ nullInput: true });
                            }

                            if (typeof input === "string") {
                                config._i = input = config._locale.preparse(
                                    input
                                );
                            }

                            if (isMoment(input)) {
                                return new Moment(checkOverflow(input));
                            } else if (isDate(input)) {
                                config._d = input;
                            } else if (isArray(format)) {
                                configFromStringAndArray(config);
                            } else if (format) {
                                configFromStringAndFormat(config);
                            } else {
                                configFromInput(config);
                            }

                            if (!isValid(config)) {
                                config._d = null;
                            }

                            return config;
                        }

                        function configFromInput(config) {
                            var input = config._i;
                            if (isUndefined(input)) {
                                config._d = new Date(hooks.now());
                            } else if (isDate(input)) {
                                config._d = new Date(input.valueOf());
                            } else if (typeof input === "string") {
                                configFromString(config);
                            } else if (isArray(input)) {
                                config._a = map(input.slice(0), function (obj) {
                                    return parseInt(obj, 10);
                                });
                                configFromArray(config);
                            } else if (isObject(input)) {
                                configFromObject(config);
                            } else if (isNumber(input)) {
                                // from milliseconds
                                config._d = new Date(input);
                            } else {
                                hooks.createFromInputFallback(config);
                            }
                        }

                        function createLocalOrUTC(
                            input,
                            format,
                            locale,
                            strict,
                            isUTC
                        ) {
                            var c = {};

                            if (locale === true || locale === false) {
                                strict = locale;
                                locale = undefined;
                            }

                            if (
                                (isObject(input) && isObjectEmpty(input)) ||
                                (isArray(input) && input.length === 0)
                            ) {
                                input = undefined;
                            }
                            // object construction must be done this way.
                            // https://github.com/moment/moment/issues/1423
                            c._isAMomentObject = true;
                            c._useUTC = c._isUTC = isUTC;
                            c._l = locale;
                            c._i = input;
                            c._f = format;
                            c._strict = strict;

                            return createFromConfig(c);
                        }

                        function createLocal(input, format, locale, strict) {
                            return createLocalOrUTC(
                                input,
                                format,
                                locale,
                                strict,
                                false
                            );
                        }

                        var prototypeMin = deprecate(
                            "moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",
                            function () {
                                var other = createLocal.apply(null, arguments);
                                if (this.isValid() && other.isValid()) {
                                    return other < this ? this : other;
                                } else {
                                    return createInvalid();
                                }
                            }
                        );

                        var prototypeMax = deprecate(
                            "moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",
                            function () {
                                var other = createLocal.apply(null, arguments);
                                if (this.isValid() && other.isValid()) {
                                    return other > this ? this : other;
                                } else {
                                    return createInvalid();
                                }
                            }
                        );

                        // Pick a moment m from moments so that m[fn](other) is true for all
                        // other. This relies on the function fn to be transitive.
                        //
                        // moments should either be an array of moment objects or an array, whose
                        // first element is an array of moment objects.
                        function pickBy(fn, moments) {
                            var res, i;
                            if (moments.length === 1 && isArray(moments[0])) {
                                moments = moments[0];
                            }
                            if (!moments.length) {
                                return createLocal();
                            }
                            res = moments[0];
                            for (i = 1; i < moments.length; ++i) {
                                if (
                                    !moments[i].isValid() ||
                                    moments[i][fn](res)
                                ) {
                                    res = moments[i];
                                }
                            }
                            return res;
                        }

                        // TODO: Use [].sort instead?
                        function min() {
                            var args = [].slice.call(arguments, 0);

                            return pickBy("isBefore", args);
                        }

                        function max() {
                            var args = [].slice.call(arguments, 0);

                            return pickBy("isAfter", args);
                        }

                        var now = function () {
                            return Date.now ? Date.now() : +new Date();
                        };

                        var ordering = [
                            "year",
                            "quarter",
                            "month",
                            "week",
                            "day",
                            "hour",
                            "minute",
                            "second",
                            "millisecond",
                        ];

                        function isDurationValid(m) {
                            for (var key in m) {
                                if (
                                    !(
                                        indexOf.call(ordering, key) !== -1 &&
                                        (m[key] == null || !isNaN(m[key]))
                                    )
                                ) {
                                    return false;
                                }
                            }

                            var unitHasDecimal = false;
                            for (var i = 0; i < ordering.length; ++i) {
                                if (m[ordering[i]]) {
                                    if (unitHasDecimal) {
                                        return false; // only allow non-integers for smallest unit
                                    }
                                    if (
                                        parseFloat(m[ordering[i]]) !==
                                        toInt(m[ordering[i]])
                                    ) {
                                        unitHasDecimal = true;
                                    }
                                }
                            }

                            return true;
                        }

                        function isValid$1() {
                            return this._isValid;
                        }

                        function createInvalid$1() {
                            return createDuration(NaN);
                        }

                        function Duration(duration) {
                            var normalizedInput = normalizeObjectUnits(
                                    duration
                                ),
                                years = normalizedInput.year || 0,
                                quarters = normalizedInput.quarter || 0,
                                months = normalizedInput.month || 0,
                                weeks =
                                    normalizedInput.week ||
                                    normalizedInput.isoWeek ||
                                    0,
                                days = normalizedInput.day || 0,
                                hours = normalizedInput.hour || 0,
                                minutes = normalizedInput.minute || 0,
                                seconds = normalizedInput.second || 0,
                                milliseconds = normalizedInput.millisecond || 0;

                            this._isValid = isDurationValid(normalizedInput);

                            // representation for dateAddRemove
                            this._milliseconds =
                                +milliseconds +
                                seconds * 1e3 + // 1000
                                minutes * 6e4 + // 1000 * 60
                                hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
                            // Because of dateAddRemove treats 24 hours as different from a
                            // day when working around DST, we need to store them separately
                            this._days = +days + weeks * 7;
                            // It is impossible to translate months into days without knowing
                            // which months you are are talking about, so we have to store
                            // it separately.
                            this._months = +months + quarters * 3 + years * 12;

                            this._data = {};

                            this._locale = getLocale();

                            this._bubble();
                        }

                        function isDuration(obj) {
                            return obj instanceof Duration;
                        }

                        function absRound(number) {
                            if (number < 0) {
                                return Math.round(-1 * number) * -1;
                            } else {
                                return Math.round(number);
                            }
                        }

                        // FORMATTING

                        function offset(token, separator) {
                            addFormatToken(token, 0, 0, function () {
                                var offset = this.utcOffset();
                                var sign = "+";
                                if (offset < 0) {
                                    offset = -offset;
                                    sign = "-";
                                }
                                return (
                                    sign +
                                    zeroFill(~~(offset / 60), 2) +
                                    separator +
                                    zeroFill(~~offset % 60, 2)
                                );
                            });
                        }

                        offset("Z", ":");
                        offset("ZZ", "");

                        // PARSING

                        addRegexToken("Z", matchShortOffset);
                        addRegexToken("ZZ", matchShortOffset);
                        addParseToken(["Z", "ZZ"], function (
                            input,
                            array,
                            config
                        ) {
                            config._useUTC = true;
                            config._tzm = offsetFromString(
                                matchShortOffset,
                                input
                            );
                        });

                        // HELPERS

                        // timezone chunker
                        // '+10:00' > ['10',  '00']
                        // '-1530'  > ['-15', '30']
                        var chunkOffset = /([\+\-]|\d\d)/gi;

                        function offsetFromString(matcher, string) {
                            var matches = (string || "").match(matcher);

                            if (matches === null) {
                                return null;
                            }

                            var chunk = matches[matches.length - 1] || [];
                            var parts = (chunk + "").match(chunkOffset) || [
                                "-",
                                0,
                                0,
                            ];
                            var minutes = +(parts[1] * 60) + toInt(parts[2]);

                            return minutes === 0
                                ? 0
                                : parts[0] === "+"
                                ? minutes
                                : -minutes;
                        }

                        // Return a moment from input, that is local/utc/zone equivalent to model.
                        function cloneWithOffset(input, model) {
                            var res, diff;
                            if (model._isUTC) {
                                res = model.clone();
                                diff =
                                    (isMoment(input) || isDate(input)
                                        ? input.valueOf()
                                        : createLocal(input).valueOf()) -
                                    res.valueOf();
                                // Use low-level api, because this fn is low-level api.
                                res._d.setTime(res._d.valueOf() + diff);
                                hooks.updateOffset(res, false);
                                return res;
                            } else {
                                return createLocal(input).local();
                            }
                        }

                        function getDateOffset(m) {
                            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
                            // https://github.com/moment/moment/pull/1871
                            return (
                                -Math.round(m._d.getTimezoneOffset() / 15) * 15
                            );
                        }

                        // HOOKS

                        // This function will be called whenever a moment is mutated.
                        // It is intended to keep the offset in sync with the timezone.
                        hooks.updateOffset = function () {};

                        // MOMENTS

                        // keepLocalTime = true means only change the timezone, without
                        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
                        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
                        // +0200, so we adjust the time as needed, to be valid.
                        //
                        // Keeping the time actually adds/subtracts (one hour)
                        // from the actual represented time. That is why we call updateOffset
                        // a second time. In case it wants us to change the offset again
                        // _changeInProgress == true case, then we have to adjust, because
                        // there is no such time in the given timezone.
                        function getSetOffset(
                            input,
                            keepLocalTime,
                            keepMinutes
                        ) {
                            var offset = this._offset || 0,
                                localAdjust;
                            if (!this.isValid()) {
                                return input != null ? this : NaN;
                            }
                            if (input != null) {
                                if (typeof input === "string") {
                                    input = offsetFromString(
                                        matchShortOffset,
                                        input
                                    );
                                    if (input === null) {
                                        return this;
                                    }
                                } else if (
                                    Math.abs(input) < 16 &&
                                    !keepMinutes
                                ) {
                                    input = input * 60;
                                }
                                if (!this._isUTC && keepLocalTime) {
                                    localAdjust = getDateOffset(this);
                                }
                                this._offset = input;
                                this._isUTC = true;
                                if (localAdjust != null) {
                                    this.add(localAdjust, "m");
                                }
                                if (offset !== input) {
                                    if (
                                        !keepLocalTime ||
                                        this._changeInProgress
                                    ) {
                                        addSubtract(
                                            this,
                                            createDuration(input - offset, "m"),
                                            1,
                                            false
                                        );
                                    } else if (!this._changeInProgress) {
                                        this._changeInProgress = true;
                                        hooks.updateOffset(this, true);
                                        this._changeInProgress = null;
                                    }
                                }
                                return this;
                            } else {
                                return this._isUTC
                                    ? offset
                                    : getDateOffset(this);
                            }
                        }

                        function getSetZone(input, keepLocalTime) {
                            if (input != null) {
                                if (typeof input !== "string") {
                                    input = -input;
                                }

                                this.utcOffset(input, keepLocalTime);

                                return this;
                            } else {
                                return -this.utcOffset();
                            }
                        }

                        function setOffsetToUTC(keepLocalTime) {
                            return this.utcOffset(0, keepLocalTime);
                        }

                        function setOffsetToLocal(keepLocalTime) {
                            if (this._isUTC) {
                                this.utcOffset(0, keepLocalTime);
                                this._isUTC = false;

                                if (keepLocalTime) {
                                    this.subtract(getDateOffset(this), "m");
                                }
                            }
                            return this;
                        }

                        function setOffsetToParsedOffset() {
                            if (this._tzm != null) {
                                this.utcOffset(this._tzm, false, true);
                            } else if (typeof this._i === "string") {
                                var tZone = offsetFromString(
                                    matchOffset,
                                    this._i
                                );
                                if (tZone != null) {
                                    this.utcOffset(tZone);
                                } else {
                                    this.utcOffset(0, true);
                                }
                            }
                            return this;
                        }

                        function hasAlignedHourOffset(input) {
                            if (!this.isValid()) {
                                return false;
                            }
                            input = input ? createLocal(input).utcOffset() : 0;

                            return (this.utcOffset() - input) % 60 === 0;
                        }

                        function isDaylightSavingTime() {
                            return (
                                this.utcOffset() >
                                    this.clone().month(0).utcOffset() ||
                                this.utcOffset() >
                                    this.clone().month(5).utcOffset()
                            );
                        }

                        function isDaylightSavingTimeShifted() {
                            if (!isUndefined(this._isDSTShifted)) {
                                return this._isDSTShifted;
                            }

                            var c = {};

                            copyConfig(c, this);
                            c = prepareConfig(c);

                            if (c._a) {
                                var other = c._isUTC
                                    ? createUTC(c._a)
                                    : createLocal(c._a);
                                this._isDSTShifted =
                                    this.isValid() &&
                                    compareArrays(c._a, other.toArray()) > 0;
                            } else {
                                this._isDSTShifted = false;
                            }

                            return this._isDSTShifted;
                        }

                        function isLocal() {
                            return this.isValid() ? !this._isUTC : false;
                        }

                        function isUtcOffset() {
                            return this.isValid() ? this._isUTC : false;
                        }

                        function isUtc() {
                            return this.isValid()
                                ? this._isUTC && this._offset === 0
                                : false;
                        }

                        // ASP.NET json date format regex
                        var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

                        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
                        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
                        // and further modified to allow for strings containing both week and day
                        var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

                        function createDuration(input, key) {
                            var duration = input,
                                // matching against regexp is expensive, do it on demand
                                match = null,
                                sign,
                                ret,
                                diffRes;

                            if (isDuration(input)) {
                                duration = {
                                    ms: input._milliseconds,
                                    d: input._days,
                                    M: input._months,
                                };
                            } else if (isNumber(input)) {
                                duration = {};
                                if (key) {
                                    duration[key] = input;
                                } else {
                                    duration.milliseconds = input;
                                }
                            } else if (!!(match = aspNetRegex.exec(input))) {
                                sign = match[1] === "-" ? -1 : 1;
                                duration = {
                                    y: 0,
                                    d: toInt(match[DATE]) * sign,
                                    h: toInt(match[HOUR]) * sign,
                                    m: toInt(match[MINUTE]) * sign,
                                    s: toInt(match[SECOND]) * sign,
                                    ms:
                                        toInt(
                                            absRound(match[MILLISECOND] * 1000)
                                        ) * sign, // the millisecond decimal point is included in the match
                                };
                            } else if (!!(match = isoRegex.exec(input))) {
                                sign = match[1] === "-" ? -1 : 1;
                                duration = {
                                    y: parseIso(match[2], sign),
                                    M: parseIso(match[3], sign),
                                    w: parseIso(match[4], sign),
                                    d: parseIso(match[5], sign),
                                    h: parseIso(match[6], sign),
                                    m: parseIso(match[7], sign),
                                    s: parseIso(match[8], sign),
                                };
                            } else if (duration == null) {
                                // checks for null or undefined
                                duration = {};
                            } else if (
                                typeof duration === "object" &&
                                ("from" in duration || "to" in duration)
                            ) {
                                diffRes = momentsDifference(
                                    createLocal(duration.from),
                                    createLocal(duration.to)
                                );

                                duration = {};
                                duration.ms = diffRes.milliseconds;
                                duration.M = diffRes.months;
                            }

                            ret = new Duration(duration);

                            if (
                                isDuration(input) &&
                                hasOwnProp(input, "_locale")
                            ) {
                                ret._locale = input._locale;
                            }

                            return ret;
                        }

                        createDuration.fn = Duration.prototype;
                        createDuration.invalid = createInvalid$1;

                        function parseIso(inp, sign) {
                            // We'd normally use ~~inp for this, but unfortunately it also
                            // converts floats to ints.
                            // inp may be undefined, so careful calling replace on it.
                            var res = inp && parseFloat(inp.replace(",", "."));
                            // apply sign while we're at it
                            return (isNaN(res) ? 0 : res) * sign;
                        }

                        function positiveMomentsDifference(base, other) {
                            var res = {};

                            res.months =
                                other.month() -
                                base.month() +
                                (other.year() - base.year()) * 12;
                            if (
                                base.clone().add(res.months, "M").isAfter(other)
                            ) {
                                --res.months;
                            }

                            res.milliseconds =
                                +other - +base.clone().add(res.months, "M");

                            return res;
                        }

                        function momentsDifference(base, other) {
                            var res;
                            if (!(base.isValid() && other.isValid())) {
                                return { milliseconds: 0, months: 0 };
                            }

                            other = cloneWithOffset(other, base);
                            if (base.isBefore(other)) {
                                res = positiveMomentsDifference(base, other);
                            } else {
                                res = positiveMomentsDifference(other, base);
                                res.milliseconds = -res.milliseconds;
                                res.months = -res.months;
                            }

                            return res;
                        }

                        // TODO: remove 'name' arg after deprecation is removed
                        function createAdder(direction, name) {
                            return function (val, period) {
                                var dur, tmp;
                                //invert the arguments, but complain about it
                                if (period !== null && !isNaN(+period)) {
                                    deprecateSimple(
                                        name,
                                        "moment()." +
                                            name +
                                            "(period, number) is deprecated. Please use moment()." +
                                            name +
                                            "(number, period). " +
                                            "See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."
                                    );
                                    tmp = val;
                                    val = period;
                                    period = tmp;
                                }

                                val = typeof val === "string" ? +val : val;
                                dur = createDuration(val, period);
                                addSubtract(this, dur, direction);
                                return this;
                            };
                        }

                        function addSubtract(
                            mom,
                            duration,
                            isAdding,
                            updateOffset
                        ) {
                            var milliseconds = duration._milliseconds,
                                days = absRound(duration._days),
                                months = absRound(duration._months);

                            if (!mom.isValid()) {
                                // No op
                                return;
                            }

                            updateOffset =
                                updateOffset == null ? true : updateOffset;

                            if (months) {
                                setMonth(
                                    mom,
                                    get(mom, "Month") + months * isAdding
                                );
                            }
                            if (days) {
                                set$1(
                                    mom,
                                    "Date",
                                    get(mom, "Date") + days * isAdding
                                );
                            }
                            if (milliseconds) {
                                mom._d.setTime(
                                    mom._d.valueOf() + milliseconds * isAdding
                                );
                            }
                            if (updateOffset) {
                                hooks.updateOffset(mom, days || months);
                            }
                        }

                        var add = createAdder(1, "add");
                        var subtract = createAdder(-1, "subtract");

                        function getCalendarFormat(myMoment, now) {
                            var diff = myMoment.diff(now, "days", true);
                            return diff < -6
                                ? "sameElse"
                                : diff < -1
                                ? "lastWeek"
                                : diff < 0
                                ? "lastDay"
                                : diff < 1
                                ? "sameDay"
                                : diff < 2
                                ? "nextDay"
                                : diff < 7
                                ? "nextWeek"
                                : "sameElse";
                        }

                        function calendar$1(time, formats) {
                            // We want to compare the start of today, vs this.
                            // Getting start-of-today depends on whether we're local/utc/offset or not.
                            var now = time || createLocal(),
                                sod = cloneWithOffset(now, this).startOf("day"),
                                format =
                                    hooks.calendarFormat(this, sod) ||
                                    "sameElse";

                            var output =
                                formats &&
                                (isFunction(formats[format])
                                    ? formats[format].call(this, now)
                                    : formats[format]);

                            return this.format(
                                output ||
                                    this.localeData().calendar(
                                        format,
                                        this,
                                        createLocal(now)
                                    )
                            );
                        }

                        function clone() {
                            return new Moment(this);
                        }

                        function isAfter(input, units) {
                            var localInput = isMoment(input)
                                ? input
                                : createLocal(input);
                            if (!(this.isValid() && localInput.isValid())) {
                                return false;
                            }
                            units = normalizeUnits(units) || "millisecond";
                            if (units === "millisecond") {
                                return this.valueOf() > localInput.valueOf();
                            } else {
                                return (
                                    localInput.valueOf() <
                                    this.clone().startOf(units).valueOf()
                                );
                            }
                        }

                        function isBefore(input, units) {
                            var localInput = isMoment(input)
                                ? input
                                : createLocal(input);
                            if (!(this.isValid() && localInput.isValid())) {
                                return false;
                            }
                            units = normalizeUnits(units) || "millisecond";
                            if (units === "millisecond") {
                                return this.valueOf() < localInput.valueOf();
                            } else {
                                return (
                                    this.clone().endOf(units).valueOf() <
                                    localInput.valueOf()
                                );
                            }
                        }

                        function isBetween(from, to, units, inclusivity) {
                            var localFrom = isMoment(from)
                                    ? from
                                    : createLocal(from),
                                localTo = isMoment(to) ? to : createLocal(to);
                            if (
                                !(
                                    this.isValid() &&
                                    localFrom.isValid() &&
                                    localTo.isValid()
                                )
                            ) {
                                return false;
                            }
                            inclusivity = inclusivity || "()";
                            return (
                                (inclusivity[0] === "("
                                    ? this.isAfter(localFrom, units)
                                    : !this.isBefore(localFrom, units)) &&
                                (inclusivity[1] === ")"
                                    ? this.isBefore(localTo, units)
                                    : !this.isAfter(localTo, units))
                            );
                        }

                        function isSame(input, units) {
                            var localInput = isMoment(input)
                                    ? input
                                    : createLocal(input),
                                inputMs;
                            if (!(this.isValid() && localInput.isValid())) {
                                return false;
                            }
                            units = normalizeUnits(units) || "millisecond";
                            if (units === "millisecond") {
                                return this.valueOf() === localInput.valueOf();
                            } else {
                                inputMs = localInput.valueOf();
                                return (
                                    this.clone().startOf(units).valueOf() <=
                                        inputMs &&
                                    inputMs <=
                                        this.clone().endOf(units).valueOf()
                                );
                            }
                        }

                        function isSameOrAfter(input, units) {
                            return (
                                this.isSame(input, units) ||
                                this.isAfter(input, units)
                            );
                        }

                        function isSameOrBefore(input, units) {
                            return (
                                this.isSame(input, units) ||
                                this.isBefore(input, units)
                            );
                        }

                        function diff(input, units, asFloat) {
                            var that, zoneDelta, output;

                            if (!this.isValid()) {
                                return NaN;
                            }

                            that = cloneWithOffset(input, this);

                            if (!that.isValid()) {
                                return NaN;
                            }

                            zoneDelta =
                                (that.utcOffset() - this.utcOffset()) * 6e4;

                            units = normalizeUnits(units);

                            switch (units) {
                                case "year":
                                    output = monthDiff(this, that) / 12;
                                    break;
                                case "month":
                                    output = monthDiff(this, that);
                                    break;
                                case "quarter":
                                    output = monthDiff(this, that) / 3;
                                    break;
                                case "second":
                                    output = (this - that) / 1e3;
                                    break; // 1000
                                case "minute":
                                    output = (this - that) / 6e4;
                                    break; // 1000 * 60
                                case "hour":
                                    output = (this - that) / 36e5;
                                    break; // 1000 * 60 * 60
                                case "day":
                                    output = (this - that - zoneDelta) / 864e5;
                                    break; // 1000 * 60 * 60 * 24, negate dst
                                case "week":
                                    output = (this - that - zoneDelta) / 6048e5;
                                    break; // 1000 * 60 * 60 * 24 * 7, negate dst
                                default:
                                    output = this - that;
                            }

                            return asFloat ? output : absFloor(output);
                        }

                        function monthDiff(a, b) {
                            // difference in months
                            var wholeMonthDiff =
                                    (b.year() - a.year()) * 12 +
                                    (b.month() - a.month()),
                                // b is in (anchor - 1 month, anchor + 1 month)
                                anchor = a
                                    .clone()
                                    .add(wholeMonthDiff, "months"),
                                anchor2,
                                adjust;

                            if (b - anchor < 0) {
                                anchor2 = a
                                    .clone()
                                    .add(wholeMonthDiff - 1, "months");
                                // linear across the month
                                adjust = (b - anchor) / (anchor - anchor2);
                            } else {
                                anchor2 = a
                                    .clone()
                                    .add(wholeMonthDiff + 1, "months");
                                // linear across the month
                                adjust = (b - anchor) / (anchor2 - anchor);
                            }

                            //check for negative zero, return zero if negative zero
                            return -(wholeMonthDiff + adjust) || 0;
                        }

                        hooks.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
                        hooks.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";

                        function toString() {
                            return this.clone()
                                .locale("en")
                                .format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
                        }

                        function toISOString(keepOffset) {
                            if (!this.isValid()) {
                                return null;
                            }
                            var utc = keepOffset !== true;
                            var m = utc ? this.clone().utc() : this;
                            if (m.year() < 0 || m.year() > 9999) {
                                return formatMoment(
                                    m,
                                    utc
                                        ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]"
                                        : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"
                                );
                            }
                            if (isFunction(Date.prototype.toISOString)) {
                                // native implementation is ~50x faster, use it when we can
                                if (utc) {
                                    return this.toDate().toISOString();
                                } else {
                                    return new Date(
                                        this.valueOf() +
                                            this.utcOffset() * 60 * 1000
                                    )
                                        .toISOString()
                                        .replace("Z", formatMoment(m, "Z"));
                                }
                            }
                            return formatMoment(
                                m,
                                utc
                                    ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"
                                    : "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
                            );
                        }

                        /**
                         * Return a human readable representation of a moment that can
                         * also be evaluated to get a new moment which is the same
                         *
                         * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
                         */
                        function inspect() {
                            if (!this.isValid()) {
                                return "moment.invalid(/* " + this._i + " */)";
                            }
                            var func = "moment";
                            var zone = "";
                            if (!this.isLocal()) {
                                func =
                                    this.utcOffset() === 0
                                        ? "moment.utc"
                                        : "moment.parseZone";
                                zone = "Z";
                            }
                            var prefix = "[" + func + '("]';
                            var year =
                                0 <= this.year() && this.year() <= 9999
                                    ? "YYYY"
                                    : "YYYYYY";
                            var datetime = "-MM-DD[T]HH:mm:ss.SSS";
                            var suffix = zone + '[")]';

                            return this.format(
                                prefix + year + datetime + suffix
                            );
                        }

                        function format(inputString) {
                            if (!inputString) {
                                inputString = this.isUtc()
                                    ? hooks.defaultFormatUtc
                                    : hooks.defaultFormat;
                            }
                            var output = formatMoment(this, inputString);
                            return this.localeData().postformat(output);
                        }

                        function from(time, withoutSuffix) {
                            if (
                                this.isValid() &&
                                ((isMoment(time) && time.isValid()) ||
                                    createLocal(time).isValid())
                            ) {
                                return createDuration({ to: this, from: time })
                                    .locale(this.locale())
                                    .humanize(!withoutSuffix);
                            } else {
                                return this.localeData().invalidDate();
                            }
                        }

                        function fromNow(withoutSuffix) {
                            return this.from(createLocal(), withoutSuffix);
                        }

                        function to(time, withoutSuffix) {
                            if (
                                this.isValid() &&
                                ((isMoment(time) && time.isValid()) ||
                                    createLocal(time).isValid())
                            ) {
                                return createDuration({ from: this, to: time })
                                    .locale(this.locale())
                                    .humanize(!withoutSuffix);
                            } else {
                                return this.localeData().invalidDate();
                            }
                        }

                        function toNow(withoutSuffix) {
                            return this.to(createLocal(), withoutSuffix);
                        }

                        // If passed a locale key, it will set the locale for this
                        // instance.  Otherwise, it will return the locale configuration
                        // variables for this instance.
                        function locale(key) {
                            var newLocaleData;

                            if (key === undefined) {
                                return this._locale._abbr;
                            } else {
                                newLocaleData = getLocale(key);
                                if (newLocaleData != null) {
                                    this._locale = newLocaleData;
                                }
                                return this;
                            }
                        }

                        var lang = deprecate(
                            "moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",
                            function (key) {
                                if (key === undefined) {
                                    return this.localeData();
                                } else {
                                    return this.locale(key);
                                }
                            }
                        );

                        function localeData() {
                            return this._locale;
                        }

                        var MS_PER_SECOND = 1000;
                        var MS_PER_MINUTE = 60 * MS_PER_SECOND;
                        var MS_PER_HOUR = 60 * MS_PER_MINUTE;
                        var MS_PER_400_YEARS =
                            (365 * 400 + 97) * 24 * MS_PER_HOUR;

                        // actual modulo - handles negative numbers (for dates before 1970):
                        function mod$1(dividend, divisor) {
                            return ((dividend % divisor) + divisor) % divisor;
                        }

                        function localStartOfDate(y, m, d) {
                            // the date constructor remaps years 0-99 to 1900-1999
                            if (y < 100 && y >= 0) {
                                // preserve leap years using a full 400 year cycle, then reset
                                return (
                                    new Date(y + 400, m, d) - MS_PER_400_YEARS
                                );
                            } else {
                                return new Date(y, m, d).valueOf();
                            }
                        }

                        function utcStartOfDate(y, m, d) {
                            // Date.UTC remaps years 0-99 to 1900-1999
                            if (y < 100 && y >= 0) {
                                // preserve leap years using a full 400 year cycle, then reset
                                return (
                                    Date.UTC(y + 400, m, d) - MS_PER_400_YEARS
                                );
                            } else {
                                return Date.UTC(y, m, d);
                            }
                        }

                        function startOf(units) {
                            var time;
                            units = normalizeUnits(units);
                            if (
                                units === undefined ||
                                units === "millisecond" ||
                                !this.isValid()
                            ) {
                                return this;
                            }

                            var startOfDate = this._isUTC
                                ? utcStartOfDate
                                : localStartOfDate;

                            switch (units) {
                                case "year":
                                    time = startOfDate(this.year(), 0, 1);
                                    break;
                                case "quarter":
                                    time = startOfDate(
                                        this.year(),
                                        this.month() - (this.month() % 3),
                                        1
                                    );
                                    break;
                                case "month":
                                    time = startOfDate(
                                        this.year(),
                                        this.month(),
                                        1
                                    );
                                    break;
                                case "week":
                                    time = startOfDate(
                                        this.year(),
                                        this.month(),
                                        this.date() - this.weekday()
                                    );
                                    break;
                                case "isoWeek":
                                    time = startOfDate(
                                        this.year(),
                                        this.month(),
                                        this.date() - (this.isoWeekday() - 1)
                                    );
                                    break;
                                case "day":
                                case "date":
                                    time = startOfDate(
                                        this.year(),
                                        this.month(),
                                        this.date()
                                    );
                                    break;
                                case "hour":
                                    time = this._d.valueOf();
                                    time -= mod$1(
                                        time +
                                            (this._isUTC
                                                ? 0
                                                : this.utcOffset() *
                                                  MS_PER_MINUTE),
                                        MS_PER_HOUR
                                    );
                                    break;
                                case "minute":
                                    time = this._d.valueOf();
                                    time -= mod$1(time, MS_PER_MINUTE);
                                    break;
                                case "second":
                                    time = this._d.valueOf();
                                    time -= mod$1(time, MS_PER_SECOND);
                                    break;
                            }

                            this._d.setTime(time);
                            hooks.updateOffset(this, true);
                            return this;
                        }

                        function endOf(units) {
                            var time;
                            units = normalizeUnits(units);
                            if (
                                units === undefined ||
                                units === "millisecond" ||
                                !this.isValid()
                            ) {
                                return this;
                            }

                            var startOfDate = this._isUTC
                                ? utcStartOfDate
                                : localStartOfDate;

                            switch (units) {
                                case "year":
                                    time =
                                        startOfDate(this.year() + 1, 0, 1) - 1;
                                    break;
                                case "quarter":
                                    time =
                                        startOfDate(
                                            this.year(),
                                            this.month() -
                                                (this.month() % 3) +
                                                3,
                                            1
                                        ) - 1;
                                    break;
                                case "month":
                                    time =
                                        startOfDate(
                                            this.year(),
                                            this.month() + 1,
                                            1
                                        ) - 1;
                                    break;
                                case "week":
                                    time =
                                        startOfDate(
                                            this.year(),
                                            this.month(),
                                            this.date() - this.weekday() + 7
                                        ) - 1;
                                    break;
                                case "isoWeek":
                                    time =
                                        startOfDate(
                                            this.year(),
                                            this.month(),
                                            this.date() -
                                                (this.isoWeekday() - 1) +
                                                7
                                        ) - 1;
                                    break;
                                case "day":
                                case "date":
                                    time =
                                        startOfDate(
                                            this.year(),
                                            this.month(),
                                            this.date() + 1
                                        ) - 1;
                                    break;
                                case "hour":
                                    time = this._d.valueOf();
                                    time +=
                                        MS_PER_HOUR -
                                        mod$1(
                                            time +
                                                (this._isUTC
                                                    ? 0
                                                    : this.utcOffset() *
                                                      MS_PER_MINUTE),
                                            MS_PER_HOUR
                                        ) -
                                        1;
                                    break;
                                case "minute":
                                    time = this._d.valueOf();
                                    time +=
                                        MS_PER_MINUTE -
                                        mod$1(time, MS_PER_MINUTE) -
                                        1;
                                    break;
                                case "second":
                                    time = this._d.valueOf();
                                    time +=
                                        MS_PER_SECOND -
                                        mod$1(time, MS_PER_SECOND) -
                                        1;
                                    break;
                            }

                            this._d.setTime(time);
                            hooks.updateOffset(this, true);
                            return this;
                        }

                        function valueOf() {
                            return (
                                this._d.valueOf() - (this._offset || 0) * 60000
                            );
                        }

                        function unix() {
                            return Math.floor(this.valueOf() / 1000);
                        }

                        function toDate() {
                            return new Date(this.valueOf());
                        }

                        function toArray() {
                            var m = this;
                            return [
                                m.year(),
                                m.month(),
                                m.date(),
                                m.hour(),
                                m.minute(),
                                m.second(),
                                m.millisecond(),
                            ];
                        }

                        function toObject() {
                            var m = this;
                            return {
                                years: m.year(),
                                months: m.month(),
                                date: m.date(),
                                hours: m.hours(),
                                minutes: m.minutes(),
                                seconds: m.seconds(),
                                milliseconds: m.milliseconds(),
                            };
                        }

                        function toJSON() {
                            // new Date(NaN).toJSON() === null
                            return this.isValid() ? this.toISOString() : null;
                        }

                        function isValid$2() {
                            return isValid(this);
                        }

                        function parsingFlags() {
                            return extend({}, getParsingFlags(this));
                        }

                        function invalidAt() {
                            return getParsingFlags(this).overflow;
                        }

                        function creationData() {
                            return {
                                input: this._i,
                                format: this._f,
                                locale: this._locale,
                                isUTC: this._isUTC,
                                strict: this._strict,
                            };
                        }

                        // FORMATTING

                        addFormatToken(0, ["gg", 2], 0, function () {
                            return this.weekYear() % 100;
                        });

                        addFormatToken(0, ["GG", 2], 0, function () {
                            return this.isoWeekYear() % 100;
                        });

                        function addWeekYearFormatToken(token, getter) {
                            addFormatToken(0, [token, token.length], 0, getter);
                        }

                        addWeekYearFormatToken("gggg", "weekYear");
                        addWeekYearFormatToken("ggggg", "weekYear");
                        addWeekYearFormatToken("GGGG", "isoWeekYear");
                        addWeekYearFormatToken("GGGGG", "isoWeekYear");

                        // ALIASES

                        addUnitAlias("weekYear", "gg");
                        addUnitAlias("isoWeekYear", "GG");

                        // PRIORITY

                        addUnitPriority("weekYear", 1);
                        addUnitPriority("isoWeekYear", 1);

                        // PARSING

                        addRegexToken("G", matchSigned);
                        addRegexToken("g", matchSigned);
                        addRegexToken("GG", match1to2, match2);
                        addRegexToken("gg", match1to2, match2);
                        addRegexToken("GGGG", match1to4, match4);
                        addRegexToken("gggg", match1to4, match4);
                        addRegexToken("GGGGG", match1to6, match6);
                        addRegexToken("ggggg", match1to6, match6);

                        addWeekParseToken(
                            ["gggg", "ggggg", "GGGG", "GGGGG"],
                            function (input, week, config, token) {
                                week[token.substr(0, 2)] = toInt(input);
                            }
                        );

                        addWeekParseToken(["gg", "GG"], function (
                            input,
                            week,
                            config,
                            token
                        ) {
                            week[token] = hooks.parseTwoDigitYear(input);
                        });

                        // MOMENTS

                        function getSetWeekYear(input) {
                            return getSetWeekYearHelper.call(
                                this,
                                input,
                                this.week(),
                                this.weekday(),
                                this.localeData()._week.dow,
                                this.localeData()._week.doy
                            );
                        }

                        function getSetISOWeekYear(input) {
                            return getSetWeekYearHelper.call(
                                this,
                                input,
                                this.isoWeek(),
                                this.isoWeekday(),
                                1,
                                4
                            );
                        }

                        function getISOWeeksInYear() {
                            return weeksInYear(this.year(), 1, 4);
                        }

                        function getWeeksInYear() {
                            var weekInfo = this.localeData()._week;
                            return weeksInYear(
                                this.year(),
                                weekInfo.dow,
                                weekInfo.doy
                            );
                        }

                        function getSetWeekYearHelper(
                            input,
                            week,
                            weekday,
                            dow,
                            doy
                        ) {
                            var weeksTarget;
                            if (input == null) {
                                return weekOfYear(this, dow, doy).year;
                            } else {
                                weeksTarget = weeksInYear(input, dow, doy);
                                if (week > weeksTarget) {
                                    week = weeksTarget;
                                }
                                return setWeekAll.call(
                                    this,
                                    input,
                                    week,
                                    weekday,
                                    dow,
                                    doy
                                );
                            }
                        }

                        function setWeekAll(weekYear, week, weekday, dow, doy) {
                            var dayOfYearData = dayOfYearFromWeeks(
                                    weekYear,
                                    week,
                                    weekday,
                                    dow,
                                    doy
                                ),
                                date = createUTCDate(
                                    dayOfYearData.year,
                                    0,
                                    dayOfYearData.dayOfYear
                                );

                            this.year(date.getUTCFullYear());
                            this.month(date.getUTCMonth());
                            this.date(date.getUTCDate());
                            return this;
                        }

                        // FORMATTING

                        addFormatToken("Q", 0, "Qo", "quarter");

                        // ALIASES

                        addUnitAlias("quarter", "Q");

                        // PRIORITY

                        addUnitPriority("quarter", 7);

                        // PARSING

                        addRegexToken("Q", match1);
                        addParseToken("Q", function (input, array) {
                            array[MONTH] = (toInt(input) - 1) * 3;
                        });

                        // MOMENTS

                        function getSetQuarter(input) {
                            return input == null
                                ? Math.ceil((this.month() + 1) / 3)
                                : this.month(
                                      (input - 1) * 3 + (this.month() % 3)
                                  );
                        }

                        // FORMATTING

                        addFormatToken("D", ["DD", 2], "Do", "date");

                        // ALIASES

                        addUnitAlias("date", "D");

                        // PRIORITY
                        addUnitPriority("date", 9);

                        // PARSING

                        addRegexToken("D", match1to2);
                        addRegexToken("DD", match1to2, match2);
                        addRegexToken("Do", function (isStrict, locale) {
                            // TODO: Remove "ordinalParse" fallback in next major release.
                            return isStrict
                                ? locale._dayOfMonthOrdinalParse ||
                                      locale._ordinalParse
                                : locale._dayOfMonthOrdinalParseLenient;
                        });

                        addParseToken(["D", "DD"], DATE);
                        addParseToken("Do", function (input, array) {
                            array[DATE] = toInt(input.match(match1to2)[0]);
                        });

                        // MOMENTS

                        var getSetDayOfMonth = makeGetSet("Date", true);

                        // FORMATTING

                        addFormatToken("DDD", ["DDDD", 3], "DDDo", "dayOfYear");

                        // ALIASES

                        addUnitAlias("dayOfYear", "DDD");

                        // PRIORITY
                        addUnitPriority("dayOfYear", 4);

                        // PARSING

                        addRegexToken("DDD", match1to3);
                        addRegexToken("DDDD", match3);
                        addParseToken(["DDD", "DDDD"], function (
                            input,
                            array,
                            config
                        ) {
                            config._dayOfYear = toInt(input);
                        });

                        // HELPERS

                        // MOMENTS

                        function getSetDayOfYear(input) {
                            var dayOfYear =
                                Math.round(
                                    (this.clone().startOf("day") -
                                        this.clone().startOf("year")) /
                                        864e5
                                ) + 1;
                            return input == null
                                ? dayOfYear
                                : this.add(input - dayOfYear, "d");
                        }

                        // FORMATTING

                        addFormatToken("m", ["mm", 2], 0, "minute");

                        // ALIASES

                        addUnitAlias("minute", "m");

                        // PRIORITY

                        addUnitPriority("minute", 14);

                        // PARSING

                        addRegexToken("m", match1to2);
                        addRegexToken("mm", match1to2, match2);
                        addParseToken(["m", "mm"], MINUTE);

                        // MOMENTS

                        var getSetMinute = makeGetSet("Minutes", false);

                        // FORMATTING

                        addFormatToken("s", ["ss", 2], 0, "second");

                        // ALIASES

                        addUnitAlias("second", "s");

                        // PRIORITY

                        addUnitPriority("second", 15);

                        // PARSING

                        addRegexToken("s", match1to2);
                        addRegexToken("ss", match1to2, match2);
                        addParseToken(["s", "ss"], SECOND);

                        // MOMENTS

                        var getSetSecond = makeGetSet("Seconds", false);

                        // FORMATTING

                        addFormatToken("S", 0, 0, function () {
                            return ~~(this.millisecond() / 100);
                        });

                        addFormatToken(0, ["SS", 2], 0, function () {
                            return ~~(this.millisecond() / 10);
                        });

                        addFormatToken(0, ["SSS", 3], 0, "millisecond");
                        addFormatToken(0, ["SSSS", 4], 0, function () {
                            return this.millisecond() * 10;
                        });
                        addFormatToken(0, ["SSSSS", 5], 0, function () {
                            return this.millisecond() * 100;
                        });
                        addFormatToken(0, ["SSSSSS", 6], 0, function () {
                            return this.millisecond() * 1000;
                        });
                        addFormatToken(0, ["SSSSSSS", 7], 0, function () {
                            return this.millisecond() * 10000;
                        });
                        addFormatToken(0, ["SSSSSSSS", 8], 0, function () {
                            return this.millisecond() * 100000;
                        });
                        addFormatToken(0, ["SSSSSSSSS", 9], 0, function () {
                            return this.millisecond() * 1000000;
                        });

                        // ALIASES

                        addUnitAlias("millisecond", "ms");

                        // PRIORITY

                        addUnitPriority("millisecond", 16);

                        // PARSING

                        addRegexToken("S", match1to3, match1);
                        addRegexToken("SS", match1to3, match2);
                        addRegexToken("SSS", match1to3, match3);

                        var token;
                        for (token = "SSSS"; token.length <= 9; token += "S") {
                            addRegexToken(token, matchUnsigned);
                        }

                        function parseMs(input, array) {
                            array[MILLISECOND] = toInt(("0." + input) * 1000);
                        }

                        for (token = "S"; token.length <= 9; token += "S") {
                            addParseToken(token, parseMs);
                        }
                        // MOMENTS

                        var getSetMillisecond = makeGetSet(
                            "Milliseconds",
                            false
                        );

                        // FORMATTING

                        addFormatToken("z", 0, 0, "zoneAbbr");
                        addFormatToken("zz", 0, 0, "zoneName");

                        // MOMENTS

                        function getZoneAbbr() {
                            return this._isUTC ? "UTC" : "";
                        }

                        function getZoneName() {
                            return this._isUTC
                                ? "Coordinated Universal Time"
                                : "";
                        }

                        var proto = Moment.prototype;

                        proto.add = add;
                        proto.calendar = calendar$1;
                        proto.clone = clone;
                        proto.diff = diff;
                        proto.endOf = endOf;
                        proto.format = format;
                        proto.from = from;
                        proto.fromNow = fromNow;
                        proto.to = to;
                        proto.toNow = toNow;
                        proto.get = stringGet;
                        proto.invalidAt = invalidAt;
                        proto.isAfter = isAfter;
                        proto.isBefore = isBefore;
                        proto.isBetween = isBetween;
                        proto.isSame = isSame;
                        proto.isSameOrAfter = isSameOrAfter;
                        proto.isSameOrBefore = isSameOrBefore;
                        proto.isValid = isValid$2;
                        proto.lang = lang;
                        proto.locale = locale;
                        proto.localeData = localeData;
                        proto.max = prototypeMax;
                        proto.min = prototypeMin;
                        proto.parsingFlags = parsingFlags;
                        proto.set = stringSet;
                        proto.startOf = startOf;
                        proto.subtract = subtract;
                        proto.toArray = toArray;
                        proto.toObject = toObject;
                        proto.toDate = toDate;
                        proto.toISOString = toISOString;
                        proto.inspect = inspect;
                        proto.toJSON = toJSON;
                        proto.toString = toString;
                        proto.unix = unix;
                        proto.valueOf = valueOf;
                        proto.creationData = creationData;
                        proto.year = getSetYear;
                        proto.isLeapYear = getIsLeapYear;
                        proto.weekYear = getSetWeekYear;
                        proto.isoWeekYear = getSetISOWeekYear;
                        proto.quarter = proto.quarters = getSetQuarter;
                        proto.month = getSetMonth;
                        proto.daysInMonth = getDaysInMonth;
                        proto.week = proto.weeks = getSetWeek;
                        proto.isoWeek = proto.isoWeeks = getSetISOWeek;
                        proto.weeksInYear = getWeeksInYear;
                        proto.isoWeeksInYear = getISOWeeksInYear;
                        proto.date = getSetDayOfMonth;
                        proto.day = proto.days = getSetDayOfWeek;
                        proto.weekday = getSetLocaleDayOfWeek;
                        proto.isoWeekday = getSetISODayOfWeek;
                        proto.dayOfYear = getSetDayOfYear;
                        proto.hour = proto.hours = getSetHour;
                        proto.minute = proto.minutes = getSetMinute;
                        proto.second = proto.seconds = getSetSecond;
                        proto.millisecond = proto.milliseconds = getSetMillisecond;
                        proto.utcOffset = getSetOffset;
                        proto.utc = setOffsetToUTC;
                        proto.local = setOffsetToLocal;
                        proto.parseZone = setOffsetToParsedOffset;
                        proto.hasAlignedHourOffset = hasAlignedHourOffset;
                        proto.isDST = isDaylightSavingTime;
                        proto.isLocal = isLocal;
                        proto.isUtcOffset = isUtcOffset;
                        proto.isUtc = isUtc;
                        proto.isUTC = isUtc;
                        proto.zoneAbbr = getZoneAbbr;
                        proto.zoneName = getZoneName;
                        proto.dates = deprecate(
                            "dates accessor is deprecated. Use date instead.",
                            getSetDayOfMonth
                        );
                        proto.months = deprecate(
                            "months accessor is deprecated. Use month instead",
                            getSetMonth
                        );
                        proto.years = deprecate(
                            "years accessor is deprecated. Use year instead",
                            getSetYear
                        );
                        proto.zone = deprecate(
                            "moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",
                            getSetZone
                        );
                        proto.isDSTShifted = deprecate(
                            "isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",
                            isDaylightSavingTimeShifted
                        );

                        function createUnix(input) {
                            return createLocal(input * 1000);
                        }

                        function createInZone() {
                            return createLocal
                                .apply(null, arguments)
                                .parseZone();
                        }

                        function preParsePostFormat(string) {
                            return string;
                        }

                        var proto$1 = Locale.prototype;

                        proto$1.calendar = calendar;
                        proto$1.longDateFormat = longDateFormat;
                        proto$1.invalidDate = invalidDate;
                        proto$1.ordinal = ordinal;
                        proto$1.preparse = preParsePostFormat;
                        proto$1.postformat = preParsePostFormat;
                        proto$1.relativeTime = relativeTime;
                        proto$1.pastFuture = pastFuture;
                        proto$1.set = set;

                        proto$1.months = localeMonths;
                        proto$1.monthsShort = localeMonthsShort;
                        proto$1.monthsParse = localeMonthsParse;
                        proto$1.monthsRegex = monthsRegex;
                        proto$1.monthsShortRegex = monthsShortRegex;
                        proto$1.week = localeWeek;
                        proto$1.firstDayOfYear = localeFirstDayOfYear;
                        proto$1.firstDayOfWeek = localeFirstDayOfWeek;

                        proto$1.weekdays = localeWeekdays;
                        proto$1.weekdaysMin = localeWeekdaysMin;
                        proto$1.weekdaysShort = localeWeekdaysShort;
                        proto$1.weekdaysParse = localeWeekdaysParse;

                        proto$1.weekdaysRegex = weekdaysRegex;
                        proto$1.weekdaysShortRegex = weekdaysShortRegex;
                        proto$1.weekdaysMinRegex = weekdaysMinRegex;

                        proto$1.isPM = localeIsPM;
                        proto$1.meridiem = localeMeridiem;

                        function get$1(format, index, field, setter) {
                            var locale = getLocale();
                            var utc = createUTC().set(setter, index);
                            return locale[field](utc, format);
                        }

                        function listMonthsImpl(format, index, field) {
                            if (isNumber(format)) {
                                index = format;
                                format = undefined;
                            }

                            format = format || "";

                            if (index != null) {
                                return get$1(format, index, field, "month");
                            }

                            var i;
                            var out = [];
                            for (i = 0; i < 12; i++) {
                                out[i] = get$1(format, i, field, "month");
                            }
                            return out;
                        }

                        // ()
                        // (5)
                        // (fmt, 5)
                        // (fmt)
                        // (true)
                        // (true, 5)
                        // (true, fmt, 5)
                        // (true, fmt)
                        function listWeekdaysImpl(
                            localeSorted,
                            format,
                            index,
                            field
                        ) {
                            if (typeof localeSorted === "boolean") {
                                if (isNumber(format)) {
                                    index = format;
                                    format = undefined;
                                }

                                format = format || "";
                            } else {
                                format = localeSorted;
                                index = format;
                                localeSorted = false;

                                if (isNumber(format)) {
                                    index = format;
                                    format = undefined;
                                }

                                format = format || "";
                            }

                            var locale = getLocale(),
                                shift = localeSorted ? locale._week.dow : 0;

                            if (index != null) {
                                return get$1(
                                    format,
                                    (index + shift) % 7,
                                    field,
                                    "day"
                                );
                            }

                            var i;
                            var out = [];
                            for (i = 0; i < 7; i++) {
                                out[i] = get$1(
                                    format,
                                    (i + shift) % 7,
                                    field,
                                    "day"
                                );
                            }
                            return out;
                        }

                        function listMonths(format, index) {
                            return listMonthsImpl(format, index, "months");
                        }

                        function listMonthsShort(format, index) {
                            return listMonthsImpl(format, index, "monthsShort");
                        }

                        function listWeekdays(localeSorted, format, index) {
                            return listWeekdaysImpl(
                                localeSorted,
                                format,
                                index,
                                "weekdays"
                            );
                        }

                        function listWeekdaysShort(
                            localeSorted,
                            format,
                            index
                        ) {
                            return listWeekdaysImpl(
                                localeSorted,
                                format,
                                index,
                                "weekdaysShort"
                            );
                        }

                        function listWeekdaysMin(localeSorted, format, index) {
                            return listWeekdaysImpl(
                                localeSorted,
                                format,
                                index,
                                "weekdaysMin"
                            );
                        }

                        getSetGlobalLocale("en", {
                            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
                            ordinal: function (number) {
                                var b = number % 10,
                                    output =
                                        toInt((number % 100) / 10) === 1
                                            ? "th"
                                            : b === 1
                                            ? "st"
                                            : b === 2
                                            ? "nd"
                                            : b === 3
                                            ? "rd"
                                            : "th";
                                return number + output;
                            },
                        });

                        // Side effect imports

                        hooks.lang = deprecate(
                            "moment.lang is deprecated. Use moment.locale instead.",
                            getSetGlobalLocale
                        );
                        hooks.langData = deprecate(
                            "moment.langData is deprecated. Use moment.localeData instead.",
                            getLocale
                        );

                        var mathAbs = Math.abs;

                        function abs() {
                            var data = this._data;

                            this._milliseconds = mathAbs(this._milliseconds);
                            this._days = mathAbs(this._days);
                            this._months = mathAbs(this._months);

                            data.milliseconds = mathAbs(data.milliseconds);
                            data.seconds = mathAbs(data.seconds);
                            data.minutes = mathAbs(data.minutes);
                            data.hours = mathAbs(data.hours);
                            data.months = mathAbs(data.months);
                            data.years = mathAbs(data.years);

                            return this;
                        }

                        function addSubtract$1(
                            duration,
                            input,
                            value,
                            direction
                        ) {
                            var other = createDuration(input, value);

                            duration._milliseconds +=
                                direction * other._milliseconds;
                            duration._days += direction * other._days;
                            duration._months += direction * other._months;

                            return duration._bubble();
                        }

                        // supports only 2.0-style add(1, 's') or add(duration)
                        function add$1(input, value) {
                            return addSubtract$1(this, input, value, 1);
                        }

                        // supports only 2.0-style subtract(1, 's') or subtract(duration)
                        function subtract$1(input, value) {
                            return addSubtract$1(this, input, value, -1);
                        }

                        function absCeil(number) {
                            if (number < 0) {
                                return Math.floor(number);
                            } else {
                                return Math.ceil(number);
                            }
                        }

                        function bubble() {
                            var milliseconds = this._milliseconds;
                            var days = this._days;
                            var months = this._months;
                            var data = this._data;
                            var seconds, minutes, hours, years, monthsFromDays;

                            // if we have a mix of positive and negative values, bubble down first
                            // check: https://github.com/moment/moment/issues/2166
                            if (
                                !(
                                    (milliseconds >= 0 &&
                                        days >= 0 &&
                                        months >= 0) ||
                                    (milliseconds <= 0 &&
                                        days <= 0 &&
                                        months <= 0)
                                )
                            ) {
                                milliseconds +=
                                    absCeil(monthsToDays(months) + days) *
                                    864e5;
                                days = 0;
                                months = 0;
                            }

                            // The following code bubbles up values, see the tests for
                            // examples of what that means.
                            data.milliseconds = milliseconds % 1000;

                            seconds = absFloor(milliseconds / 1000);
                            data.seconds = seconds % 60;

                            minutes = absFloor(seconds / 60);
                            data.minutes = minutes % 60;

                            hours = absFloor(minutes / 60);
                            data.hours = hours % 24;

                            days += absFloor(hours / 24);

                            // convert days to months
                            monthsFromDays = absFloor(daysToMonths(days));
                            months += monthsFromDays;
                            days -= absCeil(monthsToDays(monthsFromDays));

                            // 12 months -> 1 year
                            years = absFloor(months / 12);
                            months %= 12;

                            data.days = days;
                            data.months = months;
                            data.years = years;

                            return this;
                        }

                        function daysToMonths(days) {
                            // 400 years have 146097 days (taking into account leap year rules)
                            // 400 years have 12 months === 4800
                            return (days * 4800) / 146097;
                        }

                        function monthsToDays(months) {
                            // the reverse of daysToMonths
                            return (months * 146097) / 4800;
                        }

                        function as(units) {
                            if (!this.isValid()) {
                                return NaN;
                            }
                            var days;
                            var months;
                            var milliseconds = this._milliseconds;

                            units = normalizeUnits(units);

                            if (
                                units === "month" ||
                                units === "quarter" ||
                                units === "year"
                            ) {
                                days = this._days + milliseconds / 864e5;
                                months = this._months + daysToMonths(days);
                                switch (units) {
                                    case "month":
                                        return months;
                                    case "quarter":
                                        return months / 3;
                                    case "year":
                                        return months / 12;
                                }
                            } else {
                                // handle milliseconds separately because of floating point math errors (issue #1867)
                                days =
                                    this._days +
                                    Math.round(monthsToDays(this._months));
                                switch (units) {
                                    case "week":
                                        return days / 7 + milliseconds / 6048e5;
                                    case "day":
                                        return days + milliseconds / 864e5;
                                    case "hour":
                                        return days * 24 + milliseconds / 36e5;
                                    case "minute":
                                        return days * 1440 + milliseconds / 6e4;
                                    case "second":
                                        return (
                                            days * 86400 + milliseconds / 1000
                                        );
                                    // Math.floor prevents floating point math errors here
                                    case "millisecond":
                                        return (
                                            Math.floor(days * 864e5) +
                                            milliseconds
                                        );
                                    default:
                                        throw new Error(
                                            "Unknown unit " + units
                                        );
                                }
                            }
                        }

                        // TODO: Use this.as('ms')?
                        function valueOf$1() {
                            if (!this.isValid()) {
                                return NaN;
                            }
                            return (
                                this._milliseconds +
                                this._days * 864e5 +
                                (this._months % 12) * 2592e6 +
                                toInt(this._months / 12) * 31536e6
                            );
                        }

                        function makeAs(alias) {
                            return function () {
                                return this.as(alias);
                            };
                        }

                        var asMilliseconds = makeAs("ms");
                        var asSeconds = makeAs("s");
                        var asMinutes = makeAs("m");
                        var asHours = makeAs("h");
                        var asDays = makeAs("d");
                        var asWeeks = makeAs("w");
                        var asMonths = makeAs("M");
                        var asQuarters = makeAs("Q");
                        var asYears = makeAs("y");

                        function clone$1() {
                            return createDuration(this);
                        }

                        function get$2(units) {
                            units = normalizeUnits(units);
                            return this.isValid() ? this[units + "s"]() : NaN;
                        }

                        function makeGetter(name) {
                            return function () {
                                return this.isValid() ? this._data[name] : NaN;
                            };
                        }

                        var milliseconds = makeGetter("milliseconds");
                        var seconds = makeGetter("seconds");
                        var minutes = makeGetter("minutes");
                        var hours = makeGetter("hours");
                        var days = makeGetter("days");
                        var months = makeGetter("months");
                        var years = makeGetter("years");

                        function weeks() {
                            return absFloor(this.days() / 7);
                        }

                        var round = Math.round;
                        var thresholds = {
                            ss: 44, // a few seconds to seconds
                            s: 45, // seconds to minute
                            m: 45, // minutes to hour
                            h: 22, // hours to day
                            d: 26, // days to month
                            M: 11, // months to year
                        };

                        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
                        function substituteTimeAgo(
                            string,
                            number,
                            withoutSuffix,
                            isFuture,
                            locale
                        ) {
                            return locale.relativeTime(
                                number || 1,
                                !!withoutSuffix,
                                string,
                                isFuture
                            );
                        }

                        function relativeTime$1(
                            posNegDuration,
                            withoutSuffix,
                            locale
                        ) {
                            var duration = createDuration(posNegDuration).abs();
                            var seconds = round(duration.as("s"));
                            var minutes = round(duration.as("m"));
                            var hours = round(duration.as("h"));
                            var days = round(duration.as("d"));
                            var months = round(duration.as("M"));
                            var years = round(duration.as("y"));

                            var a = (seconds <= thresholds.ss && [
                                "s",
                                seconds,
                            ]) ||
                                (seconds < thresholds.s && ["ss", seconds]) ||
                                (minutes <= 1 && ["m"]) ||
                                (minutes < thresholds.m && ["mm", minutes]) ||
                                (hours <= 1 && ["h"]) ||
                                (hours < thresholds.h && ["hh", hours]) ||
                                (days <= 1 && ["d"]) ||
                                (days < thresholds.d && ["dd", days]) ||
                                (months <= 1 && ["M"]) ||
                                (months < thresholds.M && ["MM", months]) ||
                                (years <= 1 && ["y"]) || ["yy", years];

                            a[2] = withoutSuffix;
                            a[3] = +posNegDuration > 0;
                            a[4] = locale;
                            return substituteTimeAgo.apply(null, a);
                        }

                        // This function allows you to set the rounding function for relative time strings
                        function getSetRelativeTimeRounding(roundingFunction) {
                            if (roundingFunction === undefined) {
                                return round;
                            }
                            if (typeof roundingFunction === "function") {
                                round = roundingFunction;
                                return true;
                            }
                            return false;
                        }

                        // This function allows you to set a threshold for relative time strings
                        function getSetRelativeTimeThreshold(threshold, limit) {
                            if (thresholds[threshold] === undefined) {
                                return false;
                            }
                            if (limit === undefined) {
                                return thresholds[threshold];
                            }
                            thresholds[threshold] = limit;
                            if (threshold === "s") {
                                thresholds.ss = limit - 1;
                            }
                            return true;
                        }

                        function humanize(withSuffix) {
                            if (!this.isValid()) {
                                return this.localeData().invalidDate();
                            }

                            var locale = this.localeData();
                            var output = relativeTime$1(
                                this,
                                !withSuffix,
                                locale
                            );

                            if (withSuffix) {
                                output = locale.pastFuture(+this, output);
                            }

                            return locale.postformat(output);
                        }

                        var abs$1 = Math.abs;

                        function sign(x) {
                            return (x > 0) - (x < 0) || +x;
                        }

                        function toISOString$1() {
                            // for ISO strings we do not use the normal bubbling rules:
                            //  * milliseconds bubble up until they become hours
                            //  * days do not bubble at all
                            //  * months bubble up until they become years
                            // This is because there is no context-free conversion between hours and days
                            // (think of clock changes)
                            // and also not between days and months (28-31 days per month)
                            if (!this.isValid()) {
                                return this.localeData().invalidDate();
                            }

                            var seconds = abs$1(this._milliseconds) / 1000;
                            var days = abs$1(this._days);
                            var months = abs$1(this._months);
                            var minutes, hours, years;

                            // 3600 seconds -> 60 minutes -> 1 hour
                            minutes = absFloor(seconds / 60);
                            hours = absFloor(minutes / 60);
                            seconds %= 60;
                            minutes %= 60;

                            // 12 months -> 1 year
                            years = absFloor(months / 12);
                            months %= 12;

                            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
                            var Y = years;
                            var M = months;
                            var D = days;
                            var h = hours;
                            var m = minutes;
                            var s = seconds
                                ? seconds.toFixed(3).replace(/\.?0+$/, "")
                                : "";
                            var total = this.asSeconds();

                            if (!total) {
                                // this is the same as C#'s (Noda) and python (isodate)...
                                // but not other JS (goog.date)
                                return "P0D";
                            }

                            var totalSign = total < 0 ? "-" : "";
                            var ymSign =
                                sign(this._months) !== sign(total) ? "-" : "";
                            var daysSign =
                                sign(this._days) !== sign(total) ? "-" : "";
                            var hmsSign =
                                sign(this._milliseconds) !== sign(total)
                                    ? "-"
                                    : "";

                            return (
                                totalSign +
                                "P" +
                                (Y ? ymSign + Y + "Y" : "") +
                                (M ? ymSign + M + "M" : "") +
                                (D ? daysSign + D + "D" : "") +
                                (h || m || s ? "T" : "") +
                                (h ? hmsSign + h + "H" : "") +
                                (m ? hmsSign + m + "M" : "") +
                                (s ? hmsSign + s + "S" : "")
                            );
                        }

                        var proto$2 = Duration.prototype;

                        proto$2.isValid = isValid$1;
                        proto$2.abs = abs;
                        proto$2.add = add$1;
                        proto$2.subtract = subtract$1;
                        proto$2.as = as;
                        proto$2.asMilliseconds = asMilliseconds;
                        proto$2.asSeconds = asSeconds;
                        proto$2.asMinutes = asMinutes;
                        proto$2.asHours = asHours;
                        proto$2.asDays = asDays;
                        proto$2.asWeeks = asWeeks;
                        proto$2.asMonths = asMonths;
                        proto$2.asQuarters = asQuarters;
                        proto$2.asYears = asYears;
                        proto$2.valueOf = valueOf$1;
                        proto$2._bubble = bubble;
                        proto$2.clone = clone$1;
                        proto$2.get = get$2;
                        proto$2.milliseconds = milliseconds;
                        proto$2.seconds = seconds;
                        proto$2.minutes = minutes;
                        proto$2.hours = hours;
                        proto$2.days = days;
                        proto$2.weeks = weeks;
                        proto$2.months = months;
                        proto$2.years = years;
                        proto$2.humanize = humanize;
                        proto$2.toISOString = toISOString$1;
                        proto$2.toString = toISOString$1;
                        proto$2.toJSON = toISOString$1;
                        proto$2.locale = locale;
                        proto$2.localeData = localeData;

                        proto$2.toIsoString = deprecate(
                            "toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",
                            toISOString$1
                        );
                        proto$2.lang = lang;

                        // Side effect imports

                        // FORMATTING

                        addFormatToken("X", 0, 0, "unix");
                        addFormatToken("x", 0, 0, "valueOf");

                        // PARSING

                        addRegexToken("x", matchSigned);
                        addRegexToken("X", matchTimestamp);
                        addParseToken("X", function (input, array, config) {
                            config._d = new Date(parseFloat(input, 10) * 1000);
                        });
                        addParseToken("x", function (input, array, config) {
                            config._d = new Date(toInt(input));
                        });

                        // Side effect imports

                        hooks.version = "2.24.0";

                        setHookCallback(createLocal);

                        hooks.fn = proto;
                        hooks.min = min;
                        hooks.max = max;
                        hooks.now = now;
                        hooks.utc = createUTC;
                        hooks.unix = createUnix;
                        hooks.months = listMonths;
                        hooks.isDate = isDate;
                        hooks.locale = getSetGlobalLocale;
                        hooks.invalid = createInvalid;
                        hooks.duration = createDuration;
                        hooks.isMoment = isMoment;
                        hooks.weekdays = listWeekdays;
                        hooks.parseZone = createInZone;
                        hooks.localeData = getLocale;
                        hooks.isDuration = isDuration;
                        hooks.monthsShort = listMonthsShort;
                        hooks.weekdaysMin = listWeekdaysMin;
                        hooks.defineLocale = defineLocale;
                        hooks.updateLocale = updateLocale;
                        hooks.locales = listLocales;
                        hooks.weekdaysShort = listWeekdaysShort;
                        hooks.normalizeUnits = normalizeUnits;
                        hooks.relativeTimeRounding = getSetRelativeTimeRounding;
                        hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
                        hooks.calendarFormat = getCalendarFormat;
                        hooks.prototype = proto;

                        // currently HTML5 input type only supports 24-hour formats
                        hooks.HTML5_FMT = {
                            DATETIME_LOCAL: "YYYY-MM-DDTHH:mm", // <input type="datetime-local" />
                            DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss", // <input type="datetime-local" step="1" />
                            DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS", // <input type="datetime-local" step="0.001" />
                            DATE: "YYYY-MM-DD", // <input type="date" />
                            TIME: "HH:mm", // <input type="time" />
                            TIME_SECONDS: "HH:mm:ss", // <input type="time" step="1" />
                            TIME_MS: "HH:mm:ss.SSS", // <input type="time" step="0.001" />
                            WEEK: "GGGG-[W]WW", // <input type="week" />
                            MONTH: "YYYY-MM", // <input type="month" />
                        };

                        return hooks;
                    });
                },
                {},
            ],
            14: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var getSelection;
                        var doc = global.document;
                        var getSelectionRaw = require("./getSelectionRaw");
                        var getSelectionNullOp = require("./getSelectionNullOp");
                        var getSelectionSynthetic = require("./getSelectionSynthetic");
                        var isHost = require("./isHost");
                        if (isHost.method(global, "getSelection")) {
                            getSelection = getSelectionRaw;
                        } else if (
                            typeof doc.selection === "object" &&
                            doc.selection
                        ) {
                            getSelection = getSelectionSynthetic;
                        } else {
                            getSelection = getSelectionNullOp;
                        }

                        module.exports = getSelection;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {
                    "./getSelectionNullOp": 15,
                    "./getSelectionRaw": 16,
                    "./getSelectionSynthetic": 17,
                    "./isHost": 18,
                },
            ],
            15: [
                function (require, module, exports) {
                    "use strict";

                    function noop() {}

                    function getSelectionNullOp() {
                        return {
                            removeAllRanges: noop,
                            addRange: noop,
                        };
                    }

                    module.exports = getSelectionNullOp;
                },
                {},
            ],
            16: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        function getSelectionRaw() {
                            return global.getSelection();
                        }

                        module.exports = getSelectionRaw;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {},
            ],
            17: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var rangeToTextRange = require("./rangeToTextRange");
                        var doc = global.document;
                        var body = doc.body;
                        var GetSelectionProto = GetSelection.prototype;

                        function GetSelection(selection) {
                            var self = this;
                            var range = selection.createRange();

                            this._selection = selection;
                            this._ranges = [];

                            if (selection.type === "Control") {
                                updateControlSelection(self);
                            } else if (isTextRange(range)) {
                                updateFromTextRange(self, range);
                            } else {
                                updateEmptySelection(self);
                            }
                        }

                        GetSelectionProto.removeAllRanges = function () {
                            var textRange;
                            try {
                                this._selection.empty();
                                if (this._selection.type !== "None") {
                                    textRange = body.createTextRange();
                                    textRange.select();
                                    this._selection.empty();
                                }
                            } catch (e) {}
                            updateEmptySelection(this);
                        };

                        GetSelectionProto.addRange = function (range) {
                            if (this._selection.type === "Control") {
                                addRangeToControlSelection(this, range);
                            } else {
                                rangeToTextRange(range).select();
                                this._ranges[0] = range;
                                this.rangeCount = 1;
                                this.isCollapsed = this._ranges[0].collapsed;
                                updateAnchorAndFocusFromRange(
                                    this,
                                    range,
                                    false
                                );
                            }
                        };

                        GetSelectionProto.setRanges = function (ranges) {
                            this.removeAllRanges();
                            var rangeCount = ranges.length;
                            if (rangeCount > 1) {
                                createControlSelection(this, ranges);
                            } else if (rangeCount) {
                                this.addRange(ranges[0]);
                            }
                        };

                        GetSelectionProto.getRangeAt = function (index) {
                            if (index < 0 || index >= this.rangeCount) {
                                throw new Error(
                                    "getRangeAt(): index out of bounds"
                                );
                            } else {
                                return this._ranges[index].cloneRange();
                            }
                        };

                        GetSelectionProto.removeRange = function (range) {
                            if (this._selection.type !== "Control") {
                                removeRangeManually(this, range);
                                return;
                            }
                            var controlRange = this._selection.createRange();
                            var rangeElement = getSingleElementFromRange(range);
                            var newControlRange = body.createControlRange();
                            var el;
                            var removed = false;
                            for (
                                var i = 0, len = controlRange.length;
                                i < len;
                                ++i
                            ) {
                                el = controlRange.item(i);
                                if (el !== rangeElement || removed) {
                                    newControlRange.add(controlRange.item(i));
                                } else {
                                    removed = true;
                                }
                            }
                            newControlRange.select();
                            updateControlSelection(this);
                        };

                        GetSelectionProto.eachRange = function (
                            fn,
                            returnValue
                        ) {
                            var i = 0;
                            var len = this._ranges.length;
                            for (i = 0; i < len; ++i) {
                                if (fn(this.getRangeAt(i))) {
                                    return returnValue;
                                }
                            }
                        };

                        GetSelectionProto.getAllRanges = function () {
                            var ranges = [];
                            this.eachRange(function (range) {
                                ranges.push(range);
                            });
                            return ranges;
                        };

                        GetSelectionProto.setSingleRange = function (range) {
                            this.removeAllRanges();
                            this.addRange(range);
                        };

                        function createControlSelection(sel, ranges) {
                            var controlRange = body.createControlRange();
                            for (
                                var i = 0, el, len = ranges.length;
                                i < len;
                                ++i
                            ) {
                                el = getSingleElementFromRange(ranges[i]);
                                try {
                                    controlRange.add(el);
                                } catch (e) {
                                    throw new Error(
                                        "setRanges(): Element could not be added to control selection"
                                    );
                                }
                            }
                            controlRange.select();
                            updateControlSelection(sel);
                        }

                        function removeRangeManually(sel, range) {
                            var ranges = sel.getAllRanges();
                            sel.removeAllRanges();
                            for (var i = 0, len = ranges.length; i < len; ++i) {
                                if (!isSameRange(range, ranges[i])) {
                                    sel.addRange(ranges[i]);
                                }
                            }
                            if (!sel.rangeCount) {
                                updateEmptySelection(sel);
                            }
                        }

                        function updateAnchorAndFocusFromRange(sel, range) {
                            var anchorPrefix = "start";
                            var focusPrefix = "end";
                            sel.anchorNode = range[anchorPrefix + "Container"];
                            sel.anchorOffset = range[anchorPrefix + "Offset"];
                            sel.focusNode = range[focusPrefix + "Container"];
                            sel.focusOffset = range[focusPrefix + "Offset"];
                        }

                        function updateEmptySelection(sel) {
                            sel.anchorNode = sel.focusNode = null;
                            sel.anchorOffset = sel.focusOffset = 0;
                            sel.rangeCount = 0;
                            sel.isCollapsed = true;
                            sel._ranges.length = 0;
                        }

                        function rangeContainsSingleElement(rangeNodes) {
                            if (
                                !rangeNodes.length ||
                                rangeNodes[0].nodeType !== 1
                            ) {
                                return false;
                            }
                            for (
                                var i = 1, len = rangeNodes.length;
                                i < len;
                                ++i
                            ) {
                                if (
                                    !isAncestorOf(rangeNodes[0], rangeNodes[i])
                                ) {
                                    return false;
                                }
                            }
                            return true;
                        }

                        function getSingleElementFromRange(range) {
                            var nodes = range.getNodes();
                            if (!rangeContainsSingleElement(nodes)) {
                                throw new Error(
                                    "getSingleElementFromRange(): range did not consist of a single element"
                                );
                            }
                            return nodes[0];
                        }

                        function isTextRange(range) {
                            return range && range.text !== void 0;
                        }

                        function updateFromTextRange(sel, range) {
                            sel._ranges = [range];
                            updateAnchorAndFocusFromRange(sel, range, false);
                            sel.rangeCount = 1;
                            sel.isCollapsed = range.collapsed;
                        }

                        function updateControlSelection(sel) {
                            sel._ranges.length = 0;
                            if (sel._selection.type === "None") {
                                updateEmptySelection(sel);
                            } else {
                                var controlRange = sel._selection.createRange();
                                if (isTextRange(controlRange)) {
                                    updateFromTextRange(sel, controlRange);
                                } else {
                                    sel.rangeCount = controlRange.length;
                                    var range;
                                    for (var i = 0; i < sel.rangeCount; ++i) {
                                        range = doc.createRange();
                                        range.selectNode(controlRange.item(i));
                                        sel._ranges.push(range);
                                    }
                                    sel.isCollapsed =
                                        sel.rangeCount === 1 &&
                                        sel._ranges[0].collapsed;
                                    updateAnchorAndFocusFromRange(
                                        sel,
                                        sel._ranges[sel.rangeCount - 1],
                                        false
                                    );
                                }
                            }
                        }

                        function addRangeToControlSelection(sel, range) {
                            var controlRange = sel._selection.createRange();
                            var rangeElement = getSingleElementFromRange(range);
                            var newControlRange = body.createControlRange();
                            for (
                                var i = 0, len = controlRange.length;
                                i < len;
                                ++i
                            ) {
                                newControlRange.add(controlRange.item(i));
                            }
                            try {
                                newControlRange.add(rangeElement);
                            } catch (e) {
                                throw new Error(
                                    "addRange(): Element could not be added to control selection"
                                );
                            }
                            newControlRange.select();
                            updateControlSelection(sel);
                        }

                        function isSameRange(left, right) {
                            return (
                                left.startContainer === right.startContainer &&
                                left.startOffset === right.startOffset &&
                                left.endContainer === right.endContainer &&
                                left.endOffset === right.endOffset
                            );
                        }

                        function isAncestorOf(ancestor, descendant) {
                            var node = descendant;
                            while (node.parentNode) {
                                if (node.parentNode === ancestor) {
                                    return true;
                                }
                                node = node.parentNode;
                            }
                            return false;
                        }

                        function getSelection() {
                            return new GetSelection(global.document.selection);
                        }

                        module.exports = getSelection;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                { "./rangeToTextRange": 19 },
            ],
            18: [
                function (require, module, exports) {
                    "use strict";

                    function isHostMethod(host, prop) {
                        var type = typeof host[prop];
                        return (
                            type === "function" ||
                            !!(type === "object" && host[prop]) ||
                            type === "unknown"
                        );
                    }

                    function isHostProperty(host, prop) {
                        return typeof host[prop] !== "undefined";
                    }

                    function many(fn) {
                        return function areHosted(host, props) {
                            var i = props.length;
                            while (i--) {
                                if (!fn(host, props[i])) {
                                    return false;
                                }
                            }
                            return true;
                        };
                    }

                    module.exports = {
                        method: isHostMethod,
                        methods: many(isHostMethod),
                        property: isHostProperty,
                        properties: many(isHostProperty),
                    };
                },
                {},
            ],
            19: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var doc = global.document;
                        var body = doc.body;

                        function rangeToTextRange(p) {
                            if (p.collapsed) {
                                return createBoundaryTextRange(
                                    {
                                        node: p.startContainer,
                                        offset: p.startOffset,
                                    },
                                    true
                                );
                            }
                            var startRange = createBoundaryTextRange(
                                {
                                    node: p.startContainer,
                                    offset: p.startOffset,
                                },
                                true
                            );
                            var endRange = createBoundaryTextRange(
                                { node: p.endContainer, offset: p.endOffset },
                                false
                            );
                            var textRange = body.createTextRange();
                            textRange.setEndPoint("StartToStart", startRange);
                            textRange.setEndPoint("EndToEnd", endRange);
                            return textRange;
                        }

                        function isCharacterDataNode(node) {
                            var t = node.nodeType;
                            return t === 3 || t === 4 || t === 8;
                        }

                        function createBoundaryTextRange(p, starting) {
                            var bound;
                            var parent;
                            var offset = p.offset;
                            var workingNode;
                            var childNodes;
                            var range = body.createTextRange();
                            var data = isCharacterDataNode(p.node);

                            if (data) {
                                bound = p.node;
                                parent = bound.parentNode;
                            } else {
                                childNodes = p.node.childNodes;
                                bound =
                                    offset < childNodes.length
                                        ? childNodes[offset]
                                        : null;
                                parent = p.node;
                            }

                            workingNode = doc.createElement("span");
                            workingNode.innerHTML = "&#feff;";

                            if (bound) {
                                parent.insertBefore(workingNode, bound);
                            } else {
                                parent.appendChild(workingNode);
                            }

                            range.moveToElementText(workingNode);
                            range.collapse(!starting);
                            parent.removeChild(workingNode);

                            if (data) {
                                range[starting ? "moveStart" : "moveEnd"](
                                    "character",
                                    offset
                                );
                            }
                            return range;
                        }

                        module.exports = rangeToTextRange;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                {},
            ],
            20: [
                function (require, module, exports) {
                    "use strict";

                    var getSelection = require("./getSelection");
                    var setSelection = require("./setSelection");

                    module.exports = {
                        get: getSelection,
                        set: setSelection,
                    };
                },
                { "./getSelection": 14, "./setSelection": 21 },
            ],
            21: [
                function (require, module, exports) {
                    (function (global) {
                        "use strict";

                        var getSelection = require("./getSelection");
                        var rangeToTextRange = require("./rangeToTextRange");
                        var doc = global.document;

                        function setSelection(p) {
                            if (doc.createRange) {
                                modernSelection();
                            } else {
                                oldSelection();
                            }

                            function modernSelection() {
                                var sel = getSelection();
                                var range = doc.createRange();
                                if (!p.startContainer) {
                                    return;
                                }
                                if (p.endContainer) {
                                    range.setEnd(p.endContainer, p.endOffset);
                                } else {
                                    range.setEnd(
                                        p.startContainer,
                                        p.startOffset
                                    );
                                }
                                range.setStart(p.startContainer, p.startOffset);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }

                            function oldSelection() {
                                rangeToTextRange(p).select();
                            }
                        }

                        module.exports = setSelection;
                    }.call(
                        this,
                        typeof global !== "undefined"
                            ? global
                            : typeof self !== "undefined"
                            ? self
                            : typeof window !== "undefined"
                            ? window
                            : {}
                    ));
                },
                { "./getSelection": 14, "./rangeToTextRange": 19 },
            ],
            22: [
                function (require, module, exports) {
                    "use strict";

                    var get = easyGet;
                    var set = easySet;

                    if (document.selection && document.selection.createRange) {
                        get = hardGet;
                        set = hardSet;
                    }

                    function easyGet(el) {
                        return {
                            start: el.selectionStart,
                            end: el.selectionEnd,
                        };
                    }

                    function hardGet(el) {
                        var active = document.activeElement;
                        if (active !== el) {
                            el.focus();
                        }

                        var range = document.selection.createRange();
                        var bookmark = range.getBookmark();
                        var original = el.value;
                        var marker = getUniqueMarker(original);
                        var parent = range.parentElement();
                        if (parent === null || !inputs(parent)) {
                            return result(0, 0);
                        }
                        range.text = marker + range.text + marker;

                        var contents = el.value;

                        el.value = original;
                        range.moveToBookmark(bookmark);
                        range.select();

                        return result(
                            contents.indexOf(marker),
                            contents.lastIndexOf(marker) - marker.length
                        );

                        function result(start, end) {
                            if (active !== el) {
                                // don't disrupt pre-existing state
                                if (active) {
                                    active.focus();
                                } else {
                                    el.blur();
                                }
                            }
                            return { start: start, end: end };
                        }
                    }

                    function getUniqueMarker(contents) {
                        var marker;
                        do {
                            marker = "@@marker." + Math.random() * new Date();
                        } while (contents.indexOf(marker) !== -1);
                        return marker;
                    }

                    function inputs(el) {
                        return (
                            (el.tagName === "INPUT" && el.type === "text") ||
                            el.tagName === "TEXTAREA"
                        );
                    }

                    function easySet(el, p) {
                        el.selectionStart = parse(el, p.start);
                        el.selectionEnd = parse(el, p.end);
                    }

                    function hardSet(el, p) {
                        var range = el.createTextRange();

                        if (p.start === "end" && p.end === "end") {
                            range.collapse(false);
                            range.select();
                        } else {
                            range.collapse(true);
                            range.moveEnd("character", parse(el, p.end));
                            range.moveStart("character", parse(el, p.start));
                            range.select();
                        }
                    }

                    function parse(el, value) {
                        return value === "end" ? el.value.length : value || 0;
                    }

                    function sell(el, p) {
                        if (arguments.length === 2) {
                            set(el, p);
                        }
                        return get(el);
                    }

                    module.exports = sell;
                },
                {},
            ],
            23: [
                function (require, module, exports) {
                    var si = typeof setImmediate === "function",
                        tick;
                    if (si) {
                        tick = function (fn) {
                            setImmediate(fn);
                        };
                    } else {
                        tick = function (fn) {
                            setTimeout(fn, 0);
                        };
                    }

                    module.exports = tick;
                },
                {},
            ],
            24: [
                function (require, module, exports) {
                    "use strict";

                    var isInput = require("./isInput");
                    var bindings = {};

                    function has(source, target) {
                        var binding = bindings[source.id];
                        return binding && binding[target.id];
                    }

                    function insert(source, target) {
                        var binding = bindings[source.id];
                        if (!binding) {
                            binding = bindings[source.id] = {};
                        }
                        var invalidate = invalidator(target);
                        binding[target.id] = invalidate;
                        source.on("data", invalidate);
                        source.on(
                            "destroyed",
                            remove.bind(null, source, target)
                        );
                    }

                    function remove(source, target) {
                        var binding = bindings[source.id];
                        if (!binding) {
                            return;
                        }
                        var invalidate = binding[target.id];
                        source.off("data", invalidate);
                        delete binding[target.id];
                    }

                    function invalidator(target) {
                        return function invalidate() {
                            target.refresh();
                        };
                    }

                    function add(source, target) {
                        if (isInput(target.associated) || has(source, target)) {
                            return;
                        }
                        insert(source, target);
                    }

                    module.exports = {
                        add: add,
                        remove: remove,
                    };
                },
                { "./isInput": 34 },
            ],
            25: [
                function (require, module, exports) {
                    "use strict";

                    var crossvent = require("crossvent");
                    var emitter = require("contra/emitter");
                    var dom = require("./dom");
                    var text = require("./text");
                    var parse = require("./parse");
                    var clone = require("./clone");
                    var defaults = require("./defaults");
                    var momentum = require("./momentum");
                    var classes = require("./classes");
                    var noop = require("./noop");
                    var no;

                    function calendar(calendarOptions) {
                        var o;
                        var ref;
                        var refCal;
                        var container;
                        var rendered = false;

                        // date variables
                        var monthOffsetAttribute = "data-rome-offset";
                        var weekdays;
                        var weekdayCount;
                        var calendarMonths = [];
                        var lastYear;
                        var lastMonth;
                        var lastDay;
                        var lastDayElement;
                        var datewrapper;
                        var back;
                        var next;

                        // time variables
                        var secondsInDay = 60 * 60 * 24;
                        var time;
                        var timelist;

                        var api = emitter({
                            associated: calendarOptions.associated,
                        });

                        init();
                        setTimeout(ready, 0);

                        return api;

                        function napi() {
                            return api;
                        }

                        function init(initOptions) {
                            o = defaults(initOptions || calendarOptions, api);
                            if (!container) {
                                container = dom({
                                    className: o.styles.container,
                                });
                            }
                            weekdays = o.weekdayFormat;
                            weekdayCount = weekdays.length;
                            lastMonth = no;
                            lastYear = no;
                            lastDay = no;
                            lastDayElement = no;
                            o.appendTo.appendChild(container);

                            removeChildren(container);
                            rendered = false;
                            ref = o.initialValue
                                ? o.initialValue
                                : momentum.moment();
                            refCal = ref.clone();

                            api.back = subtractMonth;
                            api.container = container;
                            api.destroyed = false;
                            api.destroy = destroy.bind(api, false);
                            api.emitValues = emitValues;
                            api.getDate = getDate;
                            api.getDateString = getDateString;
                            api.getMoment = getMoment;
                            api.hide = hide;
                            api.next = addMonth;
                            api.options = changeOptions;
                            api.options.reset = resetOptions;
                            api.refresh = refresh;
                            api.restore = napi;
                            api.setValue = setValue;
                            api.show = show;

                            eventListening();
                            ready();

                            return api;
                        }

                        function ready() {
                            api.emit("ready", clone(o));
                        }

                        function destroy(silent) {
                            if (container && container.parentNode) {
                                container.parentNode.removeChild(container);
                            }

                            if (o) {
                                eventListening(true);
                            }

                            var destroyed = api.emitterSnapshot("destroyed");
                            api.back = noop;
                            api.destroyed = true;
                            api.destroy = napi;
                            api.emitValues = napi;
                            api.getDate = noop;
                            api.getDateString = noop;
                            api.getMoment = noop;
                            api.hide = napi;
                            api.next = noop;
                            api.options = napi;
                            api.options.reset = napi;
                            api.refresh = napi;
                            api.restore = init;
                            api.setValue = napi;
                            api.show = napi;
                            api.off();

                            if (silent !== true) {
                                destroyed();
                            }

                            return api;
                        }

                        function eventListening(remove) {
                            var op = remove ? "remove" : "add";
                            if (o.autoHideOnBlur) {
                                crossvent[op](
                                    document.documentElement,
                                    "focus",
                                    hideOnBlur,
                                    true
                                );
                            }
                            if (o.autoHideOnClick) {
                                crossvent[op](document, "click", hideOnClick);
                            }
                        }

                        function changeOptions(options) {
                            if (arguments.length === 0) {
                                return clone(o);
                            }
                            destroy();
                            init(options);
                            return api;
                        }

                        function resetOptions() {
                            return changeOptions({ appendTo: o.appendTo });
                        }

                        function render() {
                            if (rendered) {
                                return;
                            }
                            rendered = true;
                            renderDates();
                            renderTime();
                            api.emit("render");
                        }

                        function renderDates() {
                            if (!o.date) {
                                return;
                            }
                            var i;
                            calendarMonths = [];

                            datewrapper = dom({
                                className: o.styles.date,
                                parent: container,
                            });

                            for (i = 0; i < o.monthsInCalendar; i++) {
                                renderMonth(i);
                            }

                            crossvent.add(back, "click", subtractMonth);
                            crossvent.add(next, "click", addMonth);
                            crossvent.add(datewrapper, "click", pickDay);

                            function renderMonth(i) {
                                var month = dom({
                                    className: o.styles.month,
                                    parent: datewrapper,
                                });
                                if (i === 0) {
                                    back = dom({
                                        type: "button",
                                        className: o.styles.back,
                                        attributes: { type: "button" },
                                        parent: month,
                                    });
                                }
                                if (i === o.monthsInCalendar - 1) {
                                    next = dom({
                                        type: "button",
                                        className: o.styles.next,
                                        attributes: { type: "button" },
                                        parent: month,
                                    });
                                }
                                var label = dom({
                                    className: o.styles.monthLabel,
                                    parent: month,
                                });
                                var date = dom({
                                    type: "table",
                                    className: o.styles.dayTable,
                                    parent: month,
                                });
                                var datehead = dom({
                                    type: "thead",
                                    className: o.styles.dayHead,
                                    parent: date,
                                });
                                var dateheadrow = dom({
                                    type: "tr",
                                    className: o.styles.dayRow,
                                    parent: datehead,
                                });
                                var datebody = dom({
                                    type: "tbody",
                                    className: o.styles.dayBody,
                                    parent: date,
                                });
                                var j;

                                for (j = 0; j < weekdayCount; j++) {
                                    dom({
                                        type: "th",
                                        className: o.styles.dayHeadElem,
                                        parent: dateheadrow,
                                        text: weekdays[weekday(j)],
                                    });
                                }

                                datebody.setAttribute(monthOffsetAttribute, i);
                                calendarMonths.push({
                                    label: label,
                                    body: datebody,
                                });
                            }
                        }

                        function renderTime() {
                            if (!o.time || !o.timeInterval) {
                                return;
                            }
                            var timewrapper = dom({
                                className: o.styles.time,
                                parent: container,
                            });
                            time = dom({
                                className: o.styles.selectedTime,
                                parent: timewrapper,
                                text: ref.format(o.timeFormat),
                            });
                            crossvent.add(time, "click", toggleTimeList);
                            timelist = dom({
                                className: o.styles.timeList,
                                parent: timewrapper,
                            });
                            crossvent.add(timelist, "click", pickTime);
                            var next = momentum.moment("00:00:00", "HH:mm:ss");
                            var latest = next.clone().add(1, "days");
                            while (next.isBefore(latest)) {
                                dom({
                                    className: o.styles.timeOption,
                                    parent: timelist,
                                    text: next.format(o.timeFormat),
                                });
                                next.add(o.timeInterval, "seconds");
                            }
                        }

                        function weekday(index, backwards) {
                            var factor = backwards ? -1 : 1;
                            var offset = index + o.weekStart * factor;
                            if (offset >= weekdayCount || offset < 0) {
                                offset += weekdayCount * -factor;
                            }
                            return offset;
                        }

                        function displayValidTimesOnly() {
                            if (!o.time || !rendered) {
                                return;
                            }
                            var times = timelist.children;
                            var length = times.length;
                            var date;
                            var time;
                            var item;
                            var i;
                            for (i = 0; i < length; i++) {
                                item = times[i];
                                time = momentum.moment(
                                    text(item),
                                    o.timeFormat
                                );
                                date = setTime(ref.clone(), time);
                                item.style.display = isInRange(
                                    date,
                                    false,
                                    o.timeValidator
                                )
                                    ? "block"
                                    : "none";
                            }
                        }

                        function toggleTimeList(show) {
                            var display =
                                typeof show === "boolean"
                                    ? show
                                    : timelist.style.display === "none";
                            if (display) {
                                showTimeList();
                            } else {
                                hideTimeList();
                            }
                        }

                        function showTimeList() {
                            if (timelist) {
                                timelist.style.display = "block";
                            }
                        }

                        function hideTimeList() {
                            if (timelist) {
                                timelist.style.display = "none";
                            }
                        }

                        function showCalendar() {
                            container.style.display = "inline-block";
                            api.emit("show");
                        }

                        function hideCalendar() {
                            if (container.style.display !== "none") {
                                container.style.display = "none";
                                api.emit("hide");
                            }
                        }

                        function show() {
                            render();
                            refresh();
                            toggleTimeList(!o.date);
                            showCalendar();
                            return api;
                        }

                        function hide() {
                            hideTimeList();
                            setTimeout(hideCalendar, 0);
                            return api;
                        }

                        function hideConditionally() {
                            hideTimeList();

                            var pos = classes.contains(
                                container,
                                o.styles.positioned
                            );
                            if (pos) {
                                setTimeout(hideCalendar, 0);
                            }
                            return api;
                        }

                        function calendarEventTarget(e) {
                            var target = e.target;
                            if (target === api.associated) {
                                return true;
                            }
                            while (target) {
                                if (target === container) {
                                    return true;
                                }
                                target = target.parentNode;
                            }
                        }

                        function hideOnBlur(e) {
                            if (calendarEventTarget(e)) {
                                return;
                            }
                            hideConditionally();
                        }

                        function hideOnClick(e) {
                            if (calendarEventTarget(e)) {
                                return;
                            }
                            hideConditionally();
                        }

                        function subtractMonth() {
                            changeMonth("subtract");
                        }

                        function addMonth() {
                            changeMonth("add");
                        }

                        function changeMonth(op) {
                            var bound;
                            var direction = op === "add" ? -1 : 1;
                            var offset =
                                o.monthsInCalendar +
                                direction * getMonthOffset(lastDayElement);
                            refCal[op](offset, "months");
                            bound = inRange(refCal.clone());
                            ref = bound || ref;
                            if (bound) {
                                refCal = bound.clone();
                            }
                            update(true);
                            api.emit(
                                op === "add" ? "next" : "back",
                                ref.month()
                            );
                        }

                        function update(silent) {
                            updateCalendar();
                            updateTime();
                            if (silent !== true) {
                                emitValues();
                            }
                            displayValidTimesOnly();
                        }

                        function updateCalendar() {
                            if (!o.date || !rendered) {
                                return;
                            }
                            var y = refCal.year();
                            var m = refCal.month();
                            var d = refCal.date();

                            if (
                                d === lastDay &&
                                m === lastMonth &&
                                y === lastYear
                            ) {
                                return;
                            }
                            var canStay = isDisplayed();
                            lastDay = refCal.date();
                            lastMonth = refCal.month();
                            lastYear = refCal.year();
                            if (canStay) {
                                updateCalendarSelection();
                                return;
                            }
                            calendarMonths.forEach(updateMonth);
                            renderAllDays();

                            function updateMonth(month, i) {
                                var offsetCal = refCal.clone().add(i, "months");
                                text(
                                    month.label,
                                    offsetCal.format(o.monthFormat)
                                );
                                removeChildren(month.body);
                            }
                        }

                        function updateCalendarSelection() {
                            var day = refCal.date() - 1;
                            selectDayElement(false);
                            calendarMonths.forEach(function (cal) {
                                var days;
                                if (sameCalendarMonth(cal.date, refCal)) {
                                    days = cast(cal.body.children).map(
                                        aggregate
                                    );
                                    days = Array.prototype.concat
                                        .apply([], days)
                                        .filter(inside);
                                    selectDayElement(days[day]);
                                }
                            });

                            function cast(like) {
                                var dest = [];
                                var i;
                                for (i = 0; i < like.length; i++) {
                                    dest.push(like[i]);
                                }
                                return dest;
                            }

                            function aggregate(child) {
                                return cast(child.children);
                            }

                            function inside(child) {
                                return (
                                    !classes.contains(
                                        child,
                                        o.styles.dayPrevMonth
                                    ) &&
                                    !classes.contains(
                                        child,
                                        o.styles.dayNextMonth
                                    )
                                );
                            }
                        }

                        function isDisplayed() {
                            return calendarMonths.some(matches);

                            function matches(cal) {
                                if (!lastYear) {
                                    return false;
                                }
                                return sameCalendarMonth(cal.date, refCal);
                            }
                        }

                        function sameCalendarMonth(left, right) {
                            return (
                                left &&
                                right &&
                                left.year() === right.year() &&
                                left.month() === right.month()
                            );
                        }

                        function updateTime() {
                            if (!o.time || !rendered) {
                                return;
                            }
                            text(time, ref.format(o.timeFormat));
                        }

                        function emitValues() {
                            api.emit("data", getDateString());
                            api.emit("year", ref.year());
                            api.emit("month", ref.month());
                            api.emit("day", ref.day());
                            api.emit("time", ref.format(o.timeFormat));
                            return api;
                        }

                        function refresh() {
                            lastYear = false;
                            lastMonth = false;
                            lastDay = false;
                            update(true);
                            return api;
                        }

                        function setValue(value) {
                            var date = parse(value, o.inputFormat);
                            if (date === null) {
                                return;
                            }
                            ref = inRange(date) || ref;
                            refCal = ref.clone();
                            update(true);

                            return api;
                        }

                        function removeChildren(elem, self) {
                            while (elem && elem.firstChild) {
                                elem.removeChild(elem.firstChild);
                            }
                            if (self === true) {
                                elem.parentNode.removeChild(elem);
                            }
                        }

                        function renderAllDays() {
                            var i;
                            for (i = 0; i < o.monthsInCalendar; i++) {
                                renderDays(i);
                            }
                        }

                        function renderDays(offset) {
                            var month = calendarMonths[offset];
                            var offsetCal = refCal
                                .clone()
                                .add(offset, "months");
                            var total = offsetCal.daysInMonth();
                            var current =
                                offsetCal.month() !== ref.month()
                                    ? -1
                                    : ref.date(); // -1 : 1..31
                            var first = offsetCal.clone().date(1);
                            var firstDay = weekday(first.day(), true); // 0..6
                            var tr = dom({
                                type: "tr",
                                className: o.styles.dayRow,
                                parent: month.body,
                            });
                            var prevMonth = hiddenWhen(offset !== 0, [
                                o.styles.dayBodyElem,
                                o.styles.dayPrevMonth,
                            ]);
                            var nextMonth = hiddenWhen(
                                offset !== o.monthsInCalendar - 1,
                                [o.styles.dayBodyElem, o.styles.dayNextMonth]
                            );
                            var disabled = o.styles.dayDisabled;
                            var lastDay;

                            part({
                                base: first.clone().subtract(firstDay, "days"),
                                length: firstDay,
                                cell: prevMonth,
                            });

                            part({
                                base: first.clone(),
                                length: total,
                                cell: [o.styles.dayBodyElem],
                                selectable: true,
                            });

                            lastDay = first.clone().add(total, "days");

                            part({
                                base: lastDay,
                                length: weekdayCount - tr.children.length,
                                cell: nextMonth,
                            });

                            back.disabled = !isInRangeLeft(first, true);
                            next.disabled = !isInRangeRight(lastDay, true);
                            month.date = offsetCal.clone();

                            function part(data) {
                                var i, day, node;
                                for (i = 0; i < data.length; i++) {
                                    if (tr.children.length === weekdayCount) {
                                        tr = dom({
                                            type: "tr",
                                            className: o.styles.dayRow,
                                            parent: month.body,
                                        });
                                    }
                                    day = data.base.clone().add(i, "days");
                                    node = dom({
                                        type: "td",
                                        parent: tr,
                                        html:
                                            "<span class='alpinejs-table-rome-day-body-span'>" +
                                            day.format(o.dayFormat) +
                                            "</span>",
                                        className: validationTest(
                                            day,
                                            data.cell.join(" ").split(" ")
                                        ).join(" "),
                                    });

                                    //
                                    if (
                                        data.selectable &&
                                        day.date() === current &&
                                        api.associated.value.trim() ==
                                            day.format("MMM D, YYYY")
                                    ) {
                                        selectDayElement(node);
                                    }
                                }
                            }

                            function validationTest(day, cell) {
                                if (!isInRange(day, true, o.dateValidator)) {
                                    cell.push(disabled);
                                }
                                return cell;
                            }

                            function hiddenWhen(value, cell) {
                                if (value) {
                                    cell.push(o.styles.dayConcealed);
                                }
                                return cell;
                            }
                        }

                        function isInRange(date, allday, validator) {
                            if (!isInRangeLeft(date, allday)) {
                                return false;
                            }
                            if (!isInRangeRight(date, allday)) {
                                return false;
                            }
                            var valid = (validator || Function.prototype).call(
                                api,
                                date.toDate()
                            );
                            return valid !== false;
                        }

                        function isInRangeLeft(date, allday) {
                            var min = !o.min
                                ? false
                                : allday
                                ? o.min.clone().startOf("day")
                                : o.min;
                            return !min || !date.isBefore(min);
                        }

                        function isInRangeRight(date, allday) {
                            var max = !o.max
                                ? false
                                : allday
                                ? o.max.clone().endOf("day")
                                : o.max;
                            return !max || !date.isAfter(max);
                        }

                        function inRange(date) {
                            if (o.min && date.isBefore(o.min)) {
                                return inRange(o.min.clone());
                            } else if (o.max && date.isAfter(o.max)) {
                                return inRange(o.max.clone());
                            }
                            var value = date.clone().subtract(1, "days");
                            if (validateTowards(value, date, "add")) {
                                return inTimeRange(value);
                            }
                            value = date.clone();
                            if (validateTowards(value, date, "subtract")) {
                                return inTimeRange(value);
                            }
                        }

                        function inTimeRange(value) {
                            var copy = value
                                .clone()
                                .subtract(o.timeInterval, "seconds");
                            var times = Math.ceil(
                                secondsInDay / o.timeInterval
                            );
                            var i;
                            for (i = 0; i < times; i++) {
                                copy.add(o.timeInterval, "seconds");
                                if (copy.date() > value.date()) {
                                    copy.subtract(1, "days");
                                }
                                if (
                                    o.timeValidator.call(api, copy.toDate()) !==
                                    false
                                ) {
                                    return copy;
                                }
                            }
                        }

                        function validateTowards(value, date, op) {
                            var valid = false;
                            while (valid === false) {
                                value[op](1, "days");
                                if (value.month() !== date.month()) {
                                    break;
                                }
                                valid = o.dateValidator.call(
                                    api,
                                    value.toDate()
                                );
                            }
                            return valid !== false;
                        }

                        function pickDay(e) {
                            var target = e.target;

                            if (
                                classes.contains(
                                    target.parentElement,
                                    o.styles.dayDisabled
                                ) ||
                                !classes.contains(
                                    target.parentElement,
                                    o.styles.dayBodyElem
                                )
                            ) {
                                return;
                            }
                            var day = parseInt(text(target), 10);
                            var prev = classes.contains(
                                target.parentElement,
                                o.styles.dayPrevMonth
                            );
                            var next = classes.contains(
                                target.parentElement,
                                o.styles.dayNextMonth
                            );
                            var offset =
                                getMonthOffset(target.parentElement) -
                                getMonthOffset(lastDayElement);
                            ref.add(offset, "months");
                            if (prev || next) {
                                ref.add(prev ? -1 : 1, "months");
                            }
                            selectDayElement(target.parentElement);
                            ref.date(day); // must run after setting the month
                            setTime(ref, inRange(ref) || ref);
                            refCal = ref.clone();
                            if (o.autoClose === true) {
                                hideConditionally();
                            }
                            update();
                        }

                        function selectDayElement(node) {
                            if (lastDayElement) {
                                classes.remove(
                                    lastDayElement,
                                    o.styles.selectedDay
                                );
                            }
                            if (node) {
                                classes.add(node, o.styles.selectedDay);
                            }
                            lastDayElement = node;
                        }

                        function getMonthOffset(elem) {
                            var offset;
                            while (elem && elem.getAttribute) {
                                offset = elem.getAttribute(
                                    monthOffsetAttribute
                                );
                                if (typeof offset === "string") {
                                    return parseInt(offset, 10);
                                }
                                elem = elem.parentNode;
                            }
                            return 0;
                        }

                        function setTime(to, from) {
                            to.hour(from.hour())
                                .minute(from.minute())
                                .second(from.second());
                            return to;
                        }

                        function pickTime(e) {
                            var target = e.target;
                            if (
                                !classes.contains(target, o.styles.timeOption)
                            ) {
                                return;
                            }
                            var value = momentum.moment(
                                text(target),
                                o.timeFormat
                            );
                            setTime(ref, value);
                            refCal = ref.clone();
                            emitValues();
                            updateTime();
                            if (
                                (!o.date && o.autoClose === true) ||
                                o.autoClose === "time"
                            ) {
                                hideConditionally();
                            } else {
                                hideTimeList();
                            }
                        }

                        function getDate() {
                            return ref.toDate();
                        }

                        function getDateString(format) {
                            return ref.format(format || o.inputFormat);
                        }

                        function getMoment() {
                            return ref.clone();
                        }
                    }

                    module.exports = calendar;
                },
                {
                    "./classes": 26,
                    "./clone": 27,
                    "./defaults": 29,
                    "./dom": 30,
                    "./momentum": 35,
                    "./noop": 36,
                    "./parse": 37,
                    "./text": 49,
                    "contra/emitter": 9,
                    crossvent: 10,
                },
            ],
            26: [
                function (require, module, exports) {
                    "use strict";

                    var trim = /^\s+|\s+$/g;
                    var whitespace = /\s+/;

                    function classes(node) {
                        return node.className
                            .replace(trim, "")
                            .split(whitespace);
                    }

                    function set(node, value) {
                        node.className = value.join(" ");
                    }

                    function add(node, value) {
                        var values = remove(node, value);
                        values.push(value);
                        set(node, values);
                    }

                    function remove(node, value) {
                        var values = classes(node);
                        var i = values.indexOf(value);
                        if (i !== -1) {
                            values.splice(i, 1);
                            set(node, values);
                        }
                        return values;
                    }

                    function contains(node, value) {
                        return classes(node).indexOf(value) !== -1;
                    }

                    module.exports = {
                        add: add,
                        remove: remove,
                        contains: contains,
                    };
                },
                {},
            ],
            27: [
                function (require, module, exports) {
                    "use strict";

                    var momentum = require("./momentum");

                    // naïve implementation, specifically meant to clone `options` objects
                    function clone(thing) {
                        var copy = {};
                        var value;

                        for (var key in thing) {
                            value = thing[key];

                            if (!value) {
                                copy[key] = value;
                            } else if (momentum.isMoment(value)) {
                                copy[key] = value.clone();
                            } else if (value._isStylesConfiguration) {
                                copy[key] = clone(value);
                            } else {
                                copy[key] = value;
                            }
                        }

                        return copy;
                    }

                    module.exports = clone;
                },
                { "./momentum": 35 },
            ],
            28: [
                function (require, module, exports) {
                    "use strict";

                    var index = require("./index");
                    var input = require("./input");
                    var inline = require("./inline");
                    var isInput = require("./isInput");

                    function core(elem, options) {
                        var cal;
                        var existing = index.find(elem);
                        if (existing) {
                            return existing;
                        }

                        if (isInput(elem)) {
                            cal = input(elem, options);
                        } else {
                            cal = inline(elem, options);
                        }
                        index.assign(elem, cal);

                        return cal;
                    }

                    module.exports = core;
                },
                {
                    "./index": 31,
                    "./inline": 32,
                    "./input": 33,
                    "./isInput": 34,
                },
            ],
            29: [
                function (require, module, exports) {
                    "use strict";

                    var parse = require("./parse");
                    var isInput = require("./isInput");
                    var momentum = require("./momentum");

                    function defaults(options, cal) {
                        var temp;
                        var no;
                        var o = options || {};
                        if (o.autoHideOnClick === no) {
                            o.autoHideOnClick = true;
                        }
                        if (o.autoHideOnBlur === no) {
                            o.autoHideOnBlur = true;
                        }
                        if (o.autoClose === no) {
                            o.autoClose = true;
                        }
                        if (o.appendTo === no) {
                            o.appendTo = document.body;
                        }
                        if (o.appendTo === "parent") {
                            if (isInput(cal.associated)) {
                                o.appendTo = cal.associated.parentNode;
                            } else {
                                throw new Error(
                                    "Inline calendars must be appended to a parent node explicitly."
                                );
                            }
                        }
                        if (o.invalidate === no) {
                            o.invalidate = true;
                        }
                        if (o.required === no) {
                            o.required = false;
                        }
                        if (o.date === no) {
                            o.date = true;
                        }
                        if (o.time === no) {
                            o.time = true;
                        }
                        if (o.date === false && o.time === false) {
                            throw new Error(
                                "At least one of `date` or `time` must be `true`."
                            );
                        }
                        if (o.inputFormat === no) {
                            if (o.date && o.time) {
                                o.inputFormat = "YYYY-MM-DD HH:mm";
                            } else if (o.date) {
                                o.inputFormat = "YYYY-MM-DD";
                            } else {
                                o.inputFormat = "HH:mm";
                            }
                        }
                        if (o.initialValue === no) {
                            o.initialValue = null;
                        } else {
                            o.initialValue = parse(
                                o.initialValue,
                                o.inputFormat
                            );
                        }
                        if (o.min === no) {
                            o.min = null;
                        } else {
                            o.min = parse(o.min, o.inputFormat);
                        }
                        if (o.max === no) {
                            o.max = null;
                        } else {
                            o.max = parse(o.max, o.inputFormat);
                        }
                        if (o.timeInterval === no) {
                            o.timeInterval = 60 * 30;
                        } // 30 minutes by default
                        if (o.min && o.max) {
                            if (o.max.isBefore(o.min)) {
                                temp = o.max;
                                o.max = o.min;
                                o.min = temp;
                            }
                            if (o.date === true) {
                                if (
                                    o.max
                                        .clone()
                                        .subtract(1, "days")
                                        .isBefore(o.min)
                                ) {
                                    throw new Error(
                                        "`max` must be at least one day after `min`"
                                    );
                                }
                            } else if (
                                o.timeInterval * 1000 -
                                    (o.min % (o.timeInterval * 1000)) >
                                o.max - o.min
                            ) {
                                throw new Error(
                                    "`min` to `max` range must allow for at least one time option that matches `timeInterval`"
                                );
                            }
                        }
                        if (o.dateValidator === no) {
                            o.dateValidator = Function.prototype;
                        }
                        if (o.timeValidator === no) {
                            o.timeValidator = Function.prototype;
                        }
                        if (o.timeFormat === no) {
                            o.timeFormat = "HH:mm";
                        }
                        if (o.weekStart === no) {
                            o.weekStart = momentum.moment().weekday(0).day();
                        }
                        if (o.weekdayFormat === no) {
                            o.weekdayFormat = "min";
                        }
                        if (o.weekdayFormat === "long") {
                            o.weekdayFormat = momentum.moment.weekdays();
                        } else if (o.weekdayFormat === "short") {
                            o.weekdayFormat = momentum.moment.weekdaysShort();
                        } else if (o.weekdayFormat === "min") {
                            o.weekdayFormat = momentum.moment.weekdaysMin();
                        } else if (
                            !Array.isArray(o.weekdayFormat) ||
                            o.weekdayFormat.length < 7
                        ) {
                            throw new Error(
                                "`weekdays` must be `min`, `short`, or `long`"
                            );
                        }
                        if (o.monthsInCalendar === no) {
                            o.monthsInCalendar = 1;
                        }
                        if (o.monthFormat === no) {
                            o.monthFormat = "MMMM YYYY";
                        }
                        if (o.dayFormat === no) {
                            o.dayFormat = "DD";
                        }
                        if (o.styles === no) {
                            o.styles = {};
                        }

                        o.styles._isStylesConfiguration = true;

                        var styl = o.styles;
                        if (styl.back === no) {
                            styl.back = "alpinejs-table-rome-back";
                        }
                        if (styl.container === no) {
                            styl.container = "alpinejs-table-rome-container";
                        }
                        if (styl.positioned === no) {
                            styl.positioned = "alpinejs-table-rome-container-attachment";
                        }
                        if (styl.date === no) {
                            styl.date = "alpinejs-table-rome-date";
                        }
                        if (styl.dayBody === no) {
                            styl.dayBody = "alpinejs-table-rome-days-body";
                        }
                        if (styl.dayBodyElem === no) {
                            styl.dayBodyElem = "alpinejs-table-rome-day-body";
                        }
                        if (styl.dayBodyElemSpan === no) {
                            styl.dayBodyElemSpan = "alpinejs-table-rome-day-body-span";
                        }
                        if (styl.dayPrevMonth === no) {
                            styl.dayPrevMonth = "alpinejs-table-rome-day-prev-month";
                        }
                        if (styl.dayNextMonth === no) {
                            styl.dayNextMonth = "alpinejs-table-rome-day-next-month";
                        }
                        if (styl.dayDisabled === no) {
                            styl.dayDisabled = "alpinejs-table-rome-day-disabled";
                        }
                        if (styl.dayConcealed === no) {
                            styl.dayConcealed = "alpinejs-table-rome-day-concealed";
                        }
                        if (styl.dayHead === no) {
                            styl.dayHead = "alpinejs-table-rome-days-head";
                        }
                        if (styl.dayHeadElem === no) {
                            styl.dayHeadElem = "alpinejs-table-rome-day-head";
                        }
                        if (styl.dayRow === no) {
                            styl.dayRow = "alpinejs-table-rome-days-row";
                        }
                        if (styl.dayTable === no) {
                            styl.dayTable = "alpinejs-table-rome-days";
                        }
                        if (styl.month === no) {
                            styl.month = "alpinejs-table-rome-month";
                        }
                        if (styl.monthLabel === no) {
                            styl.monthLabel = "alpinejs-table-rome-month-label";
                        }
                        if (styl.next === no) {
                            styl.next = "alpinejs-table-rome-next";
                        }
                        if (styl.selectedDay === no) {
                            styl.selectedDay = "alpinejs-table-rome-day-selected";
                        }
                        if (styl.selectedTime === no) {
                            styl.selectedTime = "alpinejs-table-rome-time-selected";
                        }
                        if (styl.time === no) {
                            styl.time = "alpinejs-table-rome-time";
                        }
                        if (styl.timeList === no) {
                            styl.timeList = "alpinejs-table-rome-time-list";
                        }
                        if (styl.timeOption === no) {
                            styl.timeOption = "alpinejs-table-rome-time-option";
                        }

                        return o;
                    }

                    module.exports = defaults;
                },
                { "./isInput": 34, "./momentum": 35, "./parse": 37 },
            ],
            30: [
                function (require, module, exports) {
                    "use strict";

                    function dom(options) {
                        var o = options || {};
                        if (!o.type) {
                            o.type = "div";
                        }
                        var elem = document.createElement(o.type);
                        if (o.className) {
                            elem.className = o.className;
                        }
                        if (o.text) {
                            elem.innerText = elem.textContent = o.text;
                        }
                        if (o.html) {
                            elem.innerHTML = o.html;
                        }
                        if (o.attributes) {
                            Object.keys(o.attributes).forEach(function (key) {
                                elem.setAttribute(key, o.attributes[key]);
                            });
                        }
                        if (o.parent) {
                            o.parent.appendChild(elem);
                        }
                        return elem;
                    }

                    module.exports = dom;
                },
                {},
            ],
            31: [
                function (require, module, exports) {
                    "use strict";
                    var no;
                    var ikey = "data-rome-id";
                    var index = [];

                    function find(thing) {
                        // can be a DOM element or a number
                        if (
                            typeof thing !== "number" &&
                            thing &&
                            thing.getAttribute
                        ) {
                            return find(thing.getAttribute(ikey));
                        }
                        var existing = index[thing];
                        if (existing !== no) {
                            return existing;
                        }
                        return null;
                    }

                    function assign(elem, instance) {
                        elem.setAttribute(
                            ikey,
                            (instance.id = index.push(instance) - 1)
                        );
                    }

                    module.exports = {
                        find: find,
                        assign: assign,
                    };
                },
                {},
            ],
            32: [
                function (require, module, exports) {
                    "use strict";

                    var calendar = require("./calendar");

                    function inline(elem, calendarOptions) {
                        var o = calendarOptions || {};

                        o.appendTo = elem;
                        o.associated = elem;

                        var cal = calendar(o);
                        cal.show();
                        return cal;
                    }

                    module.exports = inline;
                },
                { "./calendar": 25 },
            ],
            33: [
                function (require, module, exports) {
                    "use strict";

                    var crossvent = require("crossvent");
                    var bullseye = require("bullseye");
                    var throttle = require("./throttle");
                    var clone = require("./clone");
                    var defaults = require("./defaults");
                    var calendar = require("./calendar");
                    var momentum = require("./momentum");
                    var classes = require("./classes");

                    function inputCalendar(input, calendarOptions) {
                        var o = calendarOptions || {};

                        o.associated = input;

                        var api = calendar(o);
                        var throttledTakeInput = throttle(takeInput, 30);
                        var ignoreInvalidation;
                        var ignoreShow;
                        var eye;

                        init(o);

                        return api;

                        function init(initOptions) {
                            o = defaults(initOptions || o, api);

                            classes.add(api.container, o.styles.positioned);
                            crossvent.add(
                                api.container,
                                "mousedown",
                                containerMouseDown
                            );
                            crossvent.add(
                                api.container,
                                "click",
                                containerClick
                            );

                            api.getDate = unrequire(api.getDate);
                            api.getDateString = unrequire(api.getDateString);
                            api.getMoment = unrequire(api.getMoment);

                            if (o.initialValue) {
                                input.value = o.initialValue.format(
                                    o.inputFormat
                                );
                            }

                            eye = bullseye(api.container, input);
                            api.on("data", updateInput);
                            api.on("show", eye.refresh);

                            eventListening();
                            throttledTakeInput();
                        }

                        function destroy() {
                            eventListening(true);
                            eye.destroy();
                            eye = null;
                        }

                        function eventListening(remove) {
                            var op = remove ? "remove" : "add";
                            crossvent[op](input, "click", show);
                            crossvent[op](input, "touchend", show);
                            crossvent[op](input, "focusin", show);
                            crossvent[op](input, "change", throttledTakeInput);
                            crossvent[op](
                                input,
                                "keypress",
                                throttledTakeInput
                            );
                            crossvent[op](input, "keydown", throttledTakeInput);
                            crossvent[op](input, "input", throttledTakeInput);
                            if (o.invalidate) {
                                crossvent[op](input, "blur", invalidateInput);
                            }

                            if (remove) {
                                api.once("ready", init);
                                api.off("destroyed", destroy);
                            } else {
                                api.off("ready", init);
                                api.once("destroyed", destroy);
                            }
                        }

                        function containerClick() {
                            ignoreShow = true;
                            input.focus();
                            ignoreShow = false;
                        }

                        function containerMouseDown() {
                            ignoreInvalidation = true;
                            setTimeout(unignore, 0);

                            function unignore() {
                                ignoreInvalidation = false;
                            }
                        }

                        function invalidateInput() {
                            if (!ignoreInvalidation && !isEmpty()) {
                                api.emitValues();
                            }
                        }

                        function show() {
                            if (ignoreShow) {
                                return;
                            }
                            api.show();
                        }

                        function takeInput() {
                            var value = input.value.trim();
                            if (isEmpty()) {
                                return;
                            }
                            var date = momentum.moment(
                                value,
                                o.inputFormat,
                                o.strictParse
                            );
                            api.setValue(date);
                        }

                        function updateInput(data) {
                            input.value = data;
                        }

                        function isEmpty() {
                            return (
                                o.required === false &&
                                input.value.trim() === ""
                            );
                        }

                        function unrequire(fn) {
                            return function maybe() {
                                return isEmpty()
                                    ? null
                                    : fn.apply(this, arguments);
                            };
                        }
                    }

                    module.exports = inputCalendar;
                },
                {
                    "./calendar": 25,
                    "./classes": 26,
                    "./clone": 27,
                    "./defaults": 29,
                    "./momentum": 35,
                    "./throttle": 50,
                    bullseye: 2,
                    crossvent: 10,
                },
            ],
            34: [
                function (require, module, exports) {
                    "use strict";

                    function isInput(elem) {
                        return (
                            elem &&
                            elem.nodeName &&
                            elem.nodeName.toLowerCase() === "input"
                        );
                    }

                    module.exports = isInput;
                },
                {},
            ],
            35: [
                function (require, module, exports) {
                    "use strict";

                    function isMoment(value) {
                        return (
                            value &&
                            Object.prototype.hasOwnProperty.call(
                                value,
                                "_isAMomentObject"
                            )
                        );
                    }

                    var api = {
                        moment: null,
                        isMoment: isMoment,
                    };

                    module.exports = api;
                },
                {},
            ],
            36: [
                function (require, module, exports) {
                    "use strict";

                    function noop() {}

                    module.exports = noop;
                },
                {},
            ],
            37: [
                function (require, module, exports) {
                    "use strict";

                    var momentum = require("./momentum");

                    function raw(date, format) {
                        if (typeof date === "string") {
                            return momentum.moment(date, format);
                        }
                        if (
                            Object.prototype.toString.call(date) ===
                            "[object Date]"
                        ) {
                            return momentum.moment(date);
                        }
                        if (momentum.isMoment(date)) {
                            return date.clone();
                        }
                    }

                    function parse(date, format) {
                        var m = raw(
                            date,
                            typeof format === "string" ? format : null
                        );
                        return m && m.isValid() ? m : null;
                    }

                    module.exports = parse;
                },
                { "./momentum": 35 },
            ],
            38: [
                function (require, module, exports) {
                    "use strict";

                    if (!Array.prototype.filter) {
                        Array.prototype.filter = function (fn, ctx) {
                            var f = [];
                            this.forEach(function (v, i, t) {
                                if (fn.call(ctx, v, i, t)) {
                                    f.push(v);
                                }
                            }, ctx);
                            return f;
                        };
                    }
                },
                {},
            ],
            39: [
                function (require, module, exports) {
                    "use strict";

                    if (!Array.prototype.forEach) {
                        Array.prototype.forEach = function (fn, ctx) {
                            if (
                                this === void 0 ||
                                this === null ||
                                typeof fn !== "function"
                            ) {
                                throw new TypeError();
                            }
                            var t = this;
                            var len = t.length;
                            for (var i = 0; i < len; i++) {
                                if (i in t) {
                                    fn.call(ctx, t[i], i, t);
                                }
                            }
                        };
                    }
                },
                {},
            ],
            40: [
                function (require, module, exports) {
                    "use strict";

                    if (!Array.prototype.indexOf) {
                        Array.prototype.indexOf = function (what, start) {
                            if (this === undefined || this === null) {
                                throw new TypeError();
                            }
                            var length = this.length;
                            start = +start || 0;
                            if (Math.abs(start) === Infinity) {
                                start = 0;
                            } else if (start < 0) {
                                start += length;
                                if (start < 0) {
                                    start = 0;
                                }
                            }
                            for (; start < length; start++) {
                                if (this[start] === what) {
                                    return start;
                                }
                            }
                            return -1;
                        };
                    }
                },
                {},
            ],
            41: [
                function (require, module, exports) {
                    "use strict";

                    Array.isArray ||
                        (Array.isArray = function (a) {
                            return (
                                "" + a !== a &&
                                Object.prototype.toString.call(a) ===
                                    "[object Array]"
                            );
                        });
                },
                {},
            ],
            42: [
                function (require, module, exports) {
                    "use strict";

                    if (!Array.prototype.map) {
                        Array.prototype.map = function (fn, ctx) {
                            var context, result, i;

                            if (this == null) {
                                throw new TypeError(
                                    "this is null or not defined"
                                );
                            }

                            var source = Object(this);
                            var len = source.length >>> 0;

                            if (typeof fn !== "function") {
                                throw new TypeError(fn + " is not a function");
                            }

                            if (arguments.length > 1) {
                                context = ctx;
                            }

                            result = new Array(len);
                            i = 0;

                            while (i < len) {
                                if (i in source) {
                                    result[i] = fn.call(
                                        context,
                                        source[i],
                                        i,
                                        source
                                    );
                                }
                                i++;
                            }
                            return result;
                        };
                    }
                },
                {},
            ],
            43: [
                function (require, module, exports) {
                    "use strict";

                    if (!Array.prototype.some) {
                        Array.prototype.some = function (fn, ctx) {
                            var context, i;

                            if (this == null) {
                                throw new TypeError(
                                    "this is null or not defined"
                                );
                            }

                            var source = Object(this);
                            var len = source.length >>> 0;

                            if (typeof fn !== "function") {
                                throw new TypeError(fn + " is not a function");
                            }

                            if (arguments.length > 1) {
                                context = ctx;
                            }

                            i = 0;

                            while (i < len) {
                                if (i in source) {
                                    var test = fn.call(
                                        context,
                                        source[i],
                                        i,
                                        source
                                    );
                                    if (test) {
                                        return true;
                                    }
                                }
                                i++;
                            }
                            return false;
                        };
                    }
                },
                {},
            ],
            44: [
                function (require, module, exports) {
                    "use strict";

                    if (!Function.prototype.bind) {
                        Function.prototype.bind = function (context) {
                            if (typeof this !== "function") {
                                throw new TypeError(
                                    "Function.prototype.bind - what is trying to be bound is not callable"
                                );
                            }
                            var curried = Array.prototype.slice.call(
                                arguments,
                                1
                            );
                            var original = this;
                            var NoOp = function () {};
                            var bound = function () {
                                var ctx =
                                    this instanceof NoOp && context
                                        ? this
                                        : context;
                                var args = curried.concat(
                                    Array.prototype.slice.call(arguments)
                                );
                                return original.apply(ctx, args);
                            };
                            NoOp.prototype = this.prototype;
                            bound.prototype = new NoOp();
                            return bound;
                        };
                    }
                },
                {},
            ],
            45: [
                function (require, module, exports) {
                    "use strict";

                    var hasOwn = Object.prototype.hasOwnProperty;
                    var hasDontEnumBug = !{
                        toString: null,
                    }.propertyIsEnumerable("toString");
                    var dontEnums = [
                        "toString",
                        "toLocaleString",
                        "valueOf",
                        "hasOwnProperty",
                        "isPrototypeOf",
                        "propertyIsEnumerable",
                        "constructor",
                    ];
                    var dontEnumsLength = dontEnums.length;

                    if (!Object.keys) {
                        Object.keys = function (obj) {
                            if (
                                typeof obj !== "object" &&
                                (typeof obj !== "function" || obj === null)
                            ) {
                                throw new TypeError(
                                    "Object.keys called on non-object"
                                );
                            }

                            var result = [],
                                prop,
                                i;

                            for (prop in obj) {
                                if (hasOwn.call(obj, prop)) {
                                    result.push(prop);
                                }
                            }

                            if (hasDontEnumBug) {
                                for (i = 0; i < dontEnumsLength; i++) {
                                    if (hasOwn.call(obj, dontEnums[i])) {
                                        result.push(dontEnums[i]);
                                    }
                                }
                            }
                            return result;
                        };
                    }
                },
                {},
            ],
            46: [
                function (require, module, exports) {
                    "use strict";

                    if (!String.prototype.trim) {
                        String.prototype.trim = function () {
                            return this.replace(/^\s+|\s+$/g, "");
                        };
                    }
                },
                {},
            ],
            47: [
                function (require, module, exports) {
                    "use strict";

                    // these are only required for IE < 9
                    // maybe move to IE-specific distro?
                    require("./polyfills/function.bind");
                    require("./polyfills/array.foreach");
                    require("./polyfills/array.map");
                    require("./polyfills/array.filter");
                    require("./polyfills/array.isarray");
                    require("./polyfills/array.indexof");
                    require("./polyfills/array.some");
                    require("./polyfills/string.trim");
                    require("./polyfills/object.keys");

                    var core = require("./core");
                    var index = require("./index");
                    var use = require("./use");

                    core.use = use.bind(core);
                    core.find = index.find;
                    core.val = require("./validators");

                    module.exports = core;
                },
                {
                    "./core": 28,
                    "./index": 31,
                    "./polyfills/array.filter": 38,
                    "./polyfills/array.foreach": 39,
                    "./polyfills/array.indexof": 40,
                    "./polyfills/array.isarray": 41,
                    "./polyfills/array.map": 42,
                    "./polyfills/array.some": 43,
                    "./polyfills/function.bind": 44,
                    "./polyfills/object.keys": 45,
                    "./polyfills/string.trim": 46,
                    "./use": 51,
                    "./validators": 52,
                },
            ],
            48: [
                function (require, module, exports) {
                    "use strict";

                    var moment = require("moment");
                    var rome = require("./rome");

                    rome.use(moment);

                    module.exports = rome;
                },
                { "./rome": 47, moment: 13 },
            ],
            49: [
                function (require, module, exports) {
                    "use strict";

                    function text(elem, value) {
                        if (arguments.length === 2) {
                            elem.innerText = elem.textContent = value;
                        }
                        return elem.innerText || elem.textContent;
                    }

                    module.exports = text;
                },
                {},
            ],
            50: [
                function (require, module, exports) {
                    "use strict";

                    module.exports = function throttle(fn, boundary) {
                        var last = -Infinity;
                        var timer;
                        return function bounced() {
                            if (timer) {
                                return;
                            }
                            unbound();

                            function unbound() {
                                clearTimeout(timer);
                                timer = null;
                                var next = last + boundary;
                                var now = +new Date();
                                if (now > next) {
                                    last = now;
                                    fn.apply(this, arguments);
                                } else {
                                    timer = setTimeout(unbound, next - now);
                                }
                            }
                        };
                    };
                },
                {},
            ],
            51: [
                function (require, module, exports) {
                    "use strict";

                    var momentum = require("./momentum");

                    function use(moment) {
                        this.moment = momentum.moment = moment;
                    }

                    module.exports = use;
                },
                { "./momentum": 35 },
            ],
            52: [
                function (require, module, exports) {
                    "use strict";

                    var index = require("./index");
                    var parse = require("./parse");
                    var association = require("./association");

                    function compareBuilder(compare) {
                        return function factory(value) {
                            var fixed = parse(value);

                            return function validate(date) {
                                var cal = index.find(value);
                                var left = parse(date);
                                var right = fixed || (cal && cal.getMoment());
                                if (!right) {
                                    return true;
                                }
                                if (cal) {
                                    association.add(this, cal);
                                }
                                return compare(left, right);
                            };
                        };
                    }

                    function rangeBuilder(how, compare) {
                        return function factory(start, end) {
                            var dates;
                            var len = arguments.length;

                            if (Array.isArray(start)) {
                                dates = start;
                            } else {
                                if (len === 1) {
                                    dates = [start];
                                } else if (len === 2) {
                                    dates = [[start, end]];
                                }
                            }

                            return function validate(date) {
                                return dates
                                    .map(expand.bind(this))
                                    [how](compare.bind(this, date));
                            };

                            function expand(value) {
                                var start, end;
                                var cal = index.find(value);
                                if (cal) {
                                    start = end = cal.getMoment();
                                } else if (Array.isArray(value)) {
                                    start = value[0];
                                    end = value[1];
                                } else {
                                    start = end = value;
                                }
                                if (cal) {
                                    association.add(cal, this);
                                }
                                return {
                                    start: parse(start).startOf("day").toDate(),
                                    end: parse(end).endOf("day").toDate(),
                                };
                            }
                        };
                    }

                    var afterEq = compareBuilder(function (left, right) {
                        return left >= right;
                    });
                    var after = compareBuilder(function (left, right) {
                        return left > right;
                    });
                    var beforeEq = compareBuilder(function (left, right) {
                        return left <= right;
                    });
                    var before = compareBuilder(function (left, right) {
                        return left < right;
                    });

                    var except = rangeBuilder("every", function (left, right) {
                        return right.start > left || right.end < left;
                    });
                    var only = rangeBuilder("some", function (left, right) {
                        return right.start <= left && right.end >= left;
                    });

                    module.exports = {
                        afterEq: afterEq,
                        after: after,
                        beforeEq: beforeEq,
                        before: before,
                        except: except,
                        only: only,
                    };
                },
                { "./association": 24, "./index": 31, "./parse": 37 },
            ],
        },
        {},
        [48]
    )(48);
});
