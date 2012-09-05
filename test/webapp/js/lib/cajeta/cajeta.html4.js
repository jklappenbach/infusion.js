/**
 * File: cajeta.html4.js
 *
 * This module contains the definitions for HTML4 based components.
 *
 * Copyright (c) 2012 Julian Bach
 *
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

define(['jquery', 'cajeta'], function($, Cajeta) {

    Cajeta.View.Div = Cajeta.View.Component.extend({
        initialize: function(componentId) {
            var self = (arguments.length > 1) ? arguments[2] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        }
    });

    Cajeta.View.Link = Cajeta.View.Component.extend({
        initialize: function(componentId) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        },
        onHtmlClicked: function(event) {

        }
    });

    Cajeta.View.Span = Cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'span';
        },
        onModelUpdate: function() {
            if (this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        }
    });

    Cajeta.View.Label = Cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'label';
            this.attrFor = '';
        },
        onModelUpdate: function() {
            if (this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        }
    });

    /**
     *
     */
    Cajeta.View.Input = Cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'input';
            this.attrValue = defaultValue;
        },
        setAttrName: function(name) {
            this.attrName = name;
            if (this.isDocked())
                this.html.attr('name', name);
        },
        getAttrName: function() {
            if (!this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('name');
        },
        setAttrType: function(type) {
            this.attrType = type;
            if (this.isDocked())
                this.html.attr('type', type);
        },
        getAttrType: function() {
            if (!this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('type');
        },
        setAttrValue: function(value) {
            this.html.attr('value', value);
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        },
        getAttrValue: function() {
            if (!this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('value');
        }
    });

    /**
     *
     */
    Cajeta.View.TextInput = Cajeta.View.Input.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        },
        onModelUpdate: function() {
            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        },
        onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        }
    });

    /**
     * Manages an HTML4 RadioInput control
     */
    Cajeta.View.RadioInput = Cajeta.View.Input.extend({
        initialize: function(componentId) {
            var self = (arguments.length > 1) ? arguments[1] : this;
            self.super.initialize.call(this, componentId, null, null, self.super);
        }
    });

    /**
     * Manages an HTML4 RadioInput component
     */
    Cajeta.View.CheckboxInput = Cajeta.View.Input.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        },
        onModelUpdate: function() {
            // TODO Need to update this to compare setting versus 'name'
            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        },
        onHtmlChange: function(event) {
            // TODO Need to update this to compare setting versus 'name'
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this, self.super);
            if (this.isDocked()) {
                if (this.html.attr('value') === undefined || this.html.attr('value') == '')
                    this.html.attr('value', this.componentId);
            }
        }
    });

    /**
     *
     */
    Cajeta.View.TextArea = Cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'textarea';
        },
        setAttrName: function(name) {
            this.attrName = name;
            if (this.isDocked())
                this.html.attr('name', name);
        },
        getAttrName: function() {
            if (!this.isDocked())
                return this.attrName;

            return this.html.attr('name');
        },
        setAttrCols: function(cols) {
            this.attrCols = cols;
            if (this.isDocked())
                this.html.attr('cols', cols);
        },
        getAttrCols: function() {
            if (!this.isDocked())
                return this.attrCols;

            return this.html.attr('cols');
        },
        setAttrRows: function(rows) {
            this.attrRows = rows;
            if (this.isDocked())
                this.html.attr('rows', rows);
        },
        getAttrRows: function() {
            if (!this.isDocked())
                return this.attrRows;

            return this.html.attr('rows');
        },
        setAttrReadonly: function(readonly) {
            this.attrReadonly = readonly;
            if (this.isDocked())
                this.html.attr('readonly', readonly);
        },
        getAttrReadonly: function() {
            if (!this.isDocked())
                return this.attrReadonly;

            return this.html.attr('readonly');
        }
    });

    /**
     *
     * @type {*}
     */
    Cajeta.View.Legend = Cajeta.View.Component.extend({
        /**
         *
         * @param componentId
         * @param modelPath
         * @param defaultValue
         */
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'legend';
        }
    });

    /**
     *
     * @type {*}
     */
    Cajeta.View.Select = Cajeta.View.Component.extend({
        /**
         *
         * @param componentId
         * @param modelPath
         * @param defaultValue
         * @param options A list containing Options and OptionGroups
         */
        initialize: function(componentId, modelPath, defaultValue, options) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'select';
        }
    });

    /**
     *
     */
    Cajeta.View.Form = Cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.setElementType('form');
        },
        onHtmlSubmit: function() {
            alert('Got a submit!');
        }
    });

    return Cajeta;
});