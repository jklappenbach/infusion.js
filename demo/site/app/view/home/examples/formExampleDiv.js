define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/examples/formExampleDiv.html',
    'model'
], function($, infusion, template, model) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({ cid: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', template);

    var form = new infusion.view.Form({
        cid: 'testForm',
        modelPath: 'testForm',
        onSubmit: function() {
            var myData = model.getByComponent(this);
//            var ds = infusion.Datasource.get('dsApp');
//            ds.post(myData);
            return false;
        }
    });

    form.addChild(new html5.Label({
        cid: 'firstLabel',
        modelValue: 'My Label Text'
    }));

    form.addChild(new html5.TextInput({
        cid: 'firstTextField',
        modelValue: 'First Example Text'
    }));

    form.addChild(new html5.TextInput({
        cid: 'secondTextField',
        modelValue: 'Second Example Text'
    }));

    // Add Checkboxes
    form.addChild(new html5.CheckboxInput({
        cid: 'greenColor',
        modelValue: 'true'
    }));

    form.addChild(new html5.CheckboxInput({ cid: 'blueColor' }));

    form.addChild(new html5.CheckboxInput({
        cid: 'redColor',
        modelValue: 'true'
    }));

    // Add RadioGroup
    var radioGroup = new html5.RadioGroup({
        cid: 'dietGroup',
        modelValue: 'omnivore'
    });

    radioGroup.addChild(new html5.RadioInput({ cid: 'vegetarian', properties: { checked: true } }));
    radioGroup.addChild(new html5.RadioInput({ cid: 'pescatarian' }));
    radioGroup.addChild(new html5.RadioInput({ cid: 'omnivore' }));

    // TextArea, example of how to have a default value that doesn't get committed
    form.addChild(new html5.TextArea({
        cid: 'textArea',
        modelPath: 'testForm.description',
        attributes: { cols: 30, rows: 5 },
        promptValue: 'Enter a description here'
    }));

    form.addChild(new html5.Select({
        cid: 'selectStatic'
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamic',
        transform: new infusion.view.Transform({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamic',
            modelPath: 'ui.selectDynamic'
        }),
        modelValue: 1
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamicGroup',
        transform: new infusion.view.Transform({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamicGroup',
            modelPath: 'ui.selectDynamicGroup'
        }),
        modelValue: 2
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamicMulti',
        transform: new infusion.view.Transform({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamicMulti',
            modelPath: 'ui.selectDynamicMulti'
        })
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamicAlt',
        transform: new infusion.view.Transform({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamicAlt',
            modelPath: 'ui.selectDynamicAlt',
            templates: {
                optgroup: new infusion.view.Component({
                    elementType: 'optgroup',
                    tid: 'optgroup',
                    modelEncoding: 'attr:value'
                }),
                option: new infusion.view.Component({
                    elementType: 'option',
                    tid: 'option',
                    modelEncoding: 'attr:value'
                })
            }
        })
    }));

    form.addChild(radioGroup);

    form.addChild(new html5.Button({
        cid: 'submitButton',
        onHtmlClick: function() {
            form.onSubmit();
        }
    }));
    div.addChild(form);
    return div;
});
