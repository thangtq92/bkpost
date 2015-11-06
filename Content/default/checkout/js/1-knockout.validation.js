﻿/*
===============================================================================
    Author:     Eric M. Barnard - @ericmbarnard                                
    License:    MIT (http://opensource.org/licenses/mit-license.php)           
                                                                               
    Description: Validation Library for KnockoutJS                             
===============================================================================
*/
(function (a) { typeof require == "function" && typeof exports == "object" && typeof module == "object" ? a(require("knockout"), exports) : typeof define == "function" && define.amd ? define(["knockout", "exports"], a) : a(ko, ko.validation = {}) })(function (a, b) { function i(a, c, d) { return c.validator(a(), d.params === undefined ? !0 : d.params) ? !0 : (a.error = b.formatMessage(d.message || c.message, d.params), a.__valid__(!1), !1) } function j(a, c, d) { a.isValidating(!0); var e = function (e) { var f = !1, g = ""; if (!a.__valid__()) { a.isValidating(!1); return } e.message ? (f = e.isValid, g = e.message) : f = e, f || (a.error = b.formatMessage(g || d.message || c.message, d.params), a.__valid__(f)), a.isValidating(!1) }; c.validator(a(), d.params || !0, e) } if (typeof a === undefined) throw "Knockout is required, please ensure it is loaded before loading this validation plug-in"; typeof define == "function" && define.amd && (b = a.validation = {}); var c = { registerExtenders: !0, messagesOnModified: !0, errorsAsTitleOnModified: !1, messageTemplate: null, insertMessages: !0, parseInputAttributes: !1, writeInputAttributes: !1, decorateElement: !1, errorClass: null, errorElementClass: "validationElement", errorMessageClass: "validationMessage", grouping: { deep: !1, observable: !0 } }, d = a.utils.extend({}, c), e = ["required", "pattern", "min", "max", "step"], f = function (a) { window.setImmediate ? window.setImmediate(a) : window.setTimeout(a, 0) }, g = function () { var a = (new Date).getTime(), b = {}, c = "__ko_validation__"; return { isArray: function (a) { return a.isArray || Object.prototype.toString.call(a) === "[object Array]" }, isObject: function (a) { return a !== null && typeof a == "object" }, values: function (a) { var b = []; for (var c in a) a.hasOwnProperty(c) && b.push(a[c]); return b }, getValue: function (a) { return typeof a == "function" ? a() : a }, hasAttribute: function (a, b) { return a.getAttribute(b) !== null }, isValidatable: function (a) { return a && a.rules && a.isValid && a.isModified }, insertAfter: function (a, b) { a.parentNode.insertBefore(b, a.nextSibling) }, newId: function () { return a += 1 }, getConfigOptions: function (a) { var b = g.contextFor(a); return b || d }, setDomData: function (a, d) { var e = a[c]; e || (a[c] = e = g.newId()), b[e] = d }, getDomData: function (a) { var d = a[c]; return d ? b[d] : undefined }, contextFor: function (a) { switch (a.nodeType) { case 1: case 8: var b = g.getDomData(a); if (b) return b; if (a.parentNode) return g.contextFor(a.parentNode) } return undefined }, isEmptyVal: function (a) { if (a === undefined) return !0; if (a === null) return !0; if (a === "") return !0 } } }(), h = function () { var f = 0; return { utils: g, init: function (c, e) { if (f > 0 && !e) return; c = c || {}, c.errorElementClass = c.errorElementClass || c.errorClass || d.errorElementClass, c.errorMessageClass = c.errorMessageClass || c.errorClass || d.errorMessageClass, a.utils.extend(d, c), d.registerExtenders && b.registerExtenders(), f = 1 }, configure: function (a) { b.init(a) }, reset: function () { d = $.extend(d, c) }, group: function h(b, c) { var c = a.utils.extend(d.grouping, c), e = a.observableArray([]), f = null, h = function i(b, d) { var f = [], h = a.utils.unwrapObservable(b); d = d !== undefined ? d : c.deep ? 1 : -1, a.isObservable(b) && (b.isValid || b.extend({ validatable: !0 }), e.push(b)), h && (g.isArray(h) ? f = h : g.isObject(h) && (f = g.values(h))), d !== 0 && a.utils.arrayForEach(f, function (a) { a && !a.nodeType && i(a, d + 1) }) }; return c.observable ? (h(b), f = a.computed(function () { var b = []; return a.utils.arrayForEach(e(), function (a) { a.isValid() || b.push(a.error) }), b })) : f = function () { var c = []; return e([]), h(b), a.utils.arrayForEach(e(), function (a) { a.isValid() || c.push(a.error) }), c }, f.showAllMessages = function (b) { b == undefined && (b = !0), f(), a.utils.arrayForEach(e(), function (a) { a.isModified(b) }) }, b.errors = f, b.isValid = function () { return b.errors().length === 0 }, b.isAnyMessageShown = function () { var b = !1; return f(), a.utils.arrayForEach(e(), function (a) { !a.isValid() && a.isModified() && (b = !0) }), b }, f }, formatMessage: function (a, b) { return typeof a == "function" ? a(b) : a.replace(/\{0\}/gi, b) }, addRule: function (a, b) { return a.extend({ validatable: !0 }), a.rules.push(b), a }, addAnonymousRule: function (a, c) { var d = g.newId(); c.message === undefined && (c.message = "Error"), b.rules[d] = c, b.addRule(a, { rule: d, params: c.params }) }, addExtender: function (c) { a.extenders[c] = function (a, d) { return d.message || d.onlyIf ? b.addRule(a, { rule: c, message: d.message, params: g.isEmptyVal(d.params) ? !0 : d.params, condition: d.onlyIf }) : b.addRule(a, { rule: c, params: d }) } }, registerExtenders: function () { if (d.registerExtenders) for (var c in b.rules) b.rules.hasOwnProperty(c) && (a.extenders[c] || b.addExtender(c)) }, insertValidationMessage: function (a) { var b = document.createElement("SPAN"); return b.className = g.getConfigOptions(a).errorMessageClass, g.insertAfter(a, b), b }, parseInputValidationAttributes: function (c, d) { a.utils.arrayForEach(e, function (a) { g.hasAttribute(c, a) && b.addRule(d(), { rule: a, params: c.getAttribute(a) || !0 }) }) }, writeInputValidationAttributes: function (b, c) { var d = c(); if (!d || !d.rules) return; var f = d.rules(); a.utils.arrayForEach(e, function (c) { var d, e = a.utils.arrayFirst(f, function (a) { return a.rule.toLowerCase() === c.toLowerCase() }); if (!e) return; d = e.params, e.rule == "pattern" && e.params instanceof RegExp && (d = e.params.source), b.setAttribute(c, d) }), f = null } } }(); h.rules = {}, h.rules.required = { validator: function (a, b) { var c = /^\s+|\s+$/g, d; return a === undefined || a === null ? !b : (d = a, typeof a == "string" && (d = a.replace(c, "")), b ? (d + "").length > 0 : !0) }, message: "This field is required." }, h.rules.min = { validator: function (a, b) { return g.isEmptyVal(a) || a >= b }, message: "Please enter a value greater than or equal to {0}." }, h.rules.max = { validator: function (a, b) { return g.isEmptyVal(a) || a <= b }, message: "Please enter a value less than or equal to {0}." }, h.rules.minLength = { validator: function (a, b) { return g.isEmptyVal(a) || a.length >= b }, message: "Please enter at least {0} characters." }, h.rules.maxLength = { validator: function (a, b) { return g.isEmptyVal(a) || a.length <= b }, message: "Please enter no more than {0} characters." }, h.rules.pattern = { validator: function (a, b) { return g.isEmptyVal(a) || a.match(b) != null }, message: "Please check this value." }, h.rules.step = { validator: function (a, b) { return g.isEmptyVal(a) || a * 100 % (b * 100) === 0 }, message: "The value must increment by {0}" }, h.rules.email = { validator: function (a, b) { return b ? g.isEmptyVal(a) || b && /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(a) : !0 }, message: "Please enter a proper email address" }, h.rules.date = { validator: function (a, b) { return b ? g.isEmptyVal(a) || b && !/Invalid|NaN/.test(new Date(a)) : !0 }, message: "Please enter a proper date" }, h.rules.dateISO = { validator: function (a, b) { return b ? g.isEmptyVal(a) || b && /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(a) : !0 }, message: "Please enter a proper date" }, h.rules.number = { validator: function (a, b) { return b ? g.isEmptyVal(a) || b && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(a) : !0 }, message: "Please enter a number" }, h.rules.digit = { validator: function (a, b) { return b ? g.isEmptyVal(a) || b && /^\d+$/.test(a) : !0 }, message: "Please enter a digit" }, h.rules.phoneUS = { validator: function (a, b) { return b ? typeof a != "string" ? !1 : g.isEmptyVal(a) ? !0 : (a = a.replace(/\s+/g, ""), b && a.length > 9 && a.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/)) : !0 }, message: "Please specify a valid phone number" }, h.rules.equal = { validator: function (a, b) { var c = b; return a === g.getValue(c) }, message: "Values must equal" }, h.rules.notEqual = { validator: function (a, b) { var c = b; return a !== g.getValue(c) }, message: "Please choose another value." }, h.rules.unique = { validator: function (b, c) { var d = g.getValue(c.collection), e = g.getValue(c.externalValue), f = 0; return !b || !d ? !0 : (a.utils.arrayFilter(a.utils.unwrapObservable(d), function (a) { b === (c.valueAccessor ? c.valueAccessor(a) : a) && f++ }), f < (e !== undefined && b !== e ? 1 : 2)) }, message: "Please make sure the value is unique." }, function () { h.registerExtenders() }(), a.bindingHandlers.validationCore = function () { return { init: function (c, d, e, h, i) { var j = g.getConfigOptions(c); j.parseInputAttributes && f(function () { b.parseInputValidationAttributes(c, d) }); if (j.insertMessages && g.isValidatable(d())) { var k = b.insertValidationMessage(c); j.messageTemplate ? a.renderTemplate(j.messageTemplate, { field: d() }, null, k, "replaceNode") : a.applyBindingsToNode(k, { validationMessage: d() }) } j.writeInputAttributes && g.isValidatable(d()) && b.writeInputValidationAttributes(c, d), j.decorateElement && g.isValidatable(d()) && a.applyBindingsToNode(c, { validationElement: d() }) }, update: function (a, b, c, d, e) { } } }(), function () { var b = a.bindingHandlers.value.init; a.bindingHandlers.value.init = function (c, d, e, f, g) { return b(c, d, e), a.bindingHandlers.validationCore.init(c, d, e, f, g) } }(), a.bindingHandlers.validationMessage = { update: function (b, c) { var d = c(), e = g.getConfigOptions(b), f = a.utils.unwrapObservable(d), h = null, i = !1, j = !1; d.extend({ validatable: !0 }), i = d.isModified(), j = d.isValid(); var k = function () { return !e.messagesOnModified || i ? j ? null : d.error : null }, l = function () { return i ? !j : !1 }; a.bindingHandlers.text.update(b, k), a.bindingHandlers.visible.update(b, l) } }, a.bindingHandlers.validationElement = { update: function (b, c) { var d = c(), e = g.getConfigOptions(b), f = a.utils.unwrapObservable(d), h = null, i = !1, j = !1; d.extend({ validatable: !0 }), i = d.isModified(), j = d.isValid(); var k = function () { var a = {}, b = i ? !j : !1; return e.decorateElement || (b = !1), a[e.errorElementClass] = b, a }; a.bindingHandlers.css.update(b, k); var l = b.getAttribute("data-orig-title"), m = b.title, n = b.getAttribute("data-orig-title") == "true", o = function () { if (!e.errorsAsTitleOnModified || i) return j ? { title: l || m, "data-orig-title": null } : { title: d.error, "data-orig-title": l || m } }; a.bindingHandlers.attr.update(b, o) } }, a.bindingHandlers.validationOptions = function () { return { init: function (b, c, e, f, h) { var i = a.utils.unwrapObservable(c()); if (i) { var j = a.utils.extend({}, d); a.utils.extend(j, i), g.setDomData(b, j) } } } }(), a.extenders.validation = function (c, d) { return a.utils.arrayForEach(g.isArray(d) ? d : [d], function (a) { b.addAnonymousRule(c, a) }), c }, a.extenders.validatable = function (c, d) { if (d && !g.isValidatable(c)) { c.error = null, c.rules = a.observableArray(), c.isValidating = a.observable(!1), c.__valid__ = a.observable(!0), c.isModified = a.observable(!1); var e = a.computed(function () { var a = c(), d = c.rules(); return b.validateObservable(c), !0 }); c.isValid = a.computed(function () { return c.__valid__() }); var f = c.subscribe(function () { c.isModified(!0) }); c._disposeValidation = function () { c.isValid.dispose(), c.rules.removeAll(), c.isModified._subscriptions.change = [], c.isValidating._subscriptions.change = [], c.__valid__._subscriptions.change = [], f.dispose(), e.dispose(), delete c.rules, delete c.error, delete c.isValid, delete c.isValidating, delete c.__valid__, delete c.isModified } } else d === !1 && g.isValidatable(c) && c._disposeValidation && c._disposeValidation(); return c }, h.validateObservable = function (a) { var c = 0, d, e, f = a.rules(), g = f.length; for (; c < g; c++) { e = f[c]; if (e.condition && !e.condition()) continue; d = b.rules[e.rule]; if (d.async || e.async) j(a, d, e); else if (!i(a, d, e)) return !1 } return a.error = null, a.__valid__(!0), !0 }, a.validatedObservable = function (c) { if (!b.utils.isObject(c)) return a.observable(c).extend({ validatable: !0 }); var d = a.observable(c); return d.errors = b.group(c), d.isValid = a.computed(function () { return d.errors().length === 0 }), d }, h.localize = function (a) { var c, d; for (d in a) b.rules.hasOwnProperty(d) && (b.rules[d].message = a[d]) }, a.applyBindingsWithValidation = function (c, d, e) { var f = arguments.length, g, h; f > 2 ? (g = d, h = e) : f < 2 ? g = document.body : arguments[1].nodeType ? g = d : h = arguments[1], b.init(), h && b.utils.setDomData(g, h), a.applyBindings(c, d) }; var k = a.applyBindings; a.applyBindings = function (a, c) { b.init(), k(a, c) }, a.utils.extend(b, h) });