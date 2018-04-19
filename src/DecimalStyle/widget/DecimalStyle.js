define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "dojo/text!DecimalStyle/widget/template/DecimalStyle.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    return declare("DecimalStyle.widget.DecimalStyle", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,

        widgetBase: null,

        // html/template nodes
        beforeNode: null,
        decimalNode: null,
        afterNode: null,

        // modeler properties
        field: null,
        beforeClassname: null,
        afterClassname: null,
        onClick: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            // Set the classname of our nodes
            dojoClass.add(this.beforeNode, this.beforeClassname);
            dojoClass.add(this.afterNode, this.afterClassname);

        },

        update: function(obj, callback) {
            // console.log(obj);
            // two responsibilities
            // 1. set the context object
            logger.debug(this.id + ".update");
            this._contextObj = obj;

            // 2. Call the callback 
            this._setupEvents();
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        _setupEvents: function() {
            this.connect(this.domNode, "onclick", lang.hitch(this, function() {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.onClick,
                        guids: [this._contextObj.getGuid()]
                    },
                    origin: this.mxform,
                    callback: lang.hitch(this, function(res) {
                        console.log("The microflow was run")
                    }),
                    error: lang.hitch(this, function(err) {
                        console.error("oops");
                    })
                })
            }));
        },

        /**
         * Reset Subscription
         */
        _resetSubscriptions: function() {
            this.unsubscribeAll();
            // set subscriptions
            this.subscribe({
                guid: this._contextObj.getGuid(),
                attr: this.field,
                callback: lang.hitch(this, function(guid, attr, attrValue) {
                    this._updateRendering();
                }),
                // or
                // callback: function(guid, attr, attrValue) {
                //     this._updateRendering();
                // }
            });
            this.subscribe({
                guid: this._contextObj.getGuid(),
                callback: function(guid) {
                    this._updateRendering();
                }
            })
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");
            // Get the value from the field
            var value = this._contextObj.get(this.field) * 1; // 19.99
            // Split into left and right parts
            // Math solution:
            var beforeValue = Math.floor(value); // 19
            var afterValue = Math.floor((value - beforeValue) * 100); // (19.99 - 19) * 100 = 99
            // String solution:
            var valueString = "" + value;
            var beforeValueString = valueString.split(".")[0];
            var afterValueString = valueString.split(".")[1];
            // Set the innerHTML of the before and after nodes
            dojoHtml.set(this.beforeNode, beforeValueString);
            dojoHtml.set(this.afterNode, afterValueString);
            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["DecimalStyle/widget/DecimalStyle"]);