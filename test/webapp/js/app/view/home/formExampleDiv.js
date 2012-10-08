define([
    'jquery',
    'cajetaHtml4',
    'text!js/app/view/home/formExampleDiv.html'
], function($, Cajeta, formExampleDiv) {

    // Create an alias for namespace brevity.
    var Html4 = Cajeta.View.Html4;

    var div = new Html4.Div({ componentId: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', formExampleDiv);

    var form = new Html4.Form({ componentId: 'testForm',
        onHtmlSubmit: function() {
            // Make an AJAX (they need to rename this.  Who uses XML anymore for Javascript?) call to
            // the server, use headers as opposed to query args.  Query arguments are usually
            // stored in server logs, and are not a good place for protected data (such as form posts).
            var myData = Cajeta.theApplication.model.get('testForm');

            var ajax = new Cajeta.Ajax({
                'Accept' : "application/json; charset=UTF-8",
                'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8" },
                'application/json'
            );
            ajax.exec('GET', 'http://localhost:8080/application/createUser', myData, function(event) {
                if (this.readyState == 4) {
                    if (this.readyState == 4)
                        console.log("received: '" + this.responseText + "', readyState: " + this.readyState);
                }
            });
            return false;
        }
    });

    form.addChild(new Html4.Label({ componentId: 'firstLabel',
        modelPath: 'testForm.firstLabelField', defaultValue: 'Label Text' }));
    form.addChild(new Html4.TextInput({ componentId: 'firstTextField',
        modelPath: 'testForm.firstTextField', defaultValue: 'First Example Text' }));
    form.addChild(new Html4.TextInput({ componentId: 'secondTextField',
        modelPath: 'testForm.secondTextField', defaultValue: 'Second Example Text' }));

    // Add Checkboxes
    form.addChild(new Html4.CheckboxInput({ componentId: 'greenColor',
        modelPath: 'testForm.greenColor', defaultValue: true }));
    form.addChild(new Html4.CheckboxInput({ componentId: 'blueColor',
        modelPath: 'testForm.blueColor', defaultValue: false }));
    form.addChild(new Html4.CheckboxInput({ componentId: 'redColor',
        modelPath: 'testForm.redColor', defaultValue: true }));

    // Add RadioGroup
    var radioGroup = new Cajeta.View.ComponentGroup({ componentId: 'dietGroup',
        modelPath: 'testForm.diet', defaultValue: 'omnivore' });
    radioGroup.addChild(new Html4.RadioInput({ componentId: 'vegetarian' }));
    radioGroup.addChild(new Html4.RadioInput({ componentId: 'pescatarian' }));
    radioGroup.addChild(new Html4.RadioInput({ componentId: 'omnivore' }));

    // TextArea
    form.addChild(new Html4.TextArea({ componentId: 'textArea',
        modelPath: 'testForm.description', defaultValue: 'Enter a description here.',
        attrCols: 50, attrRows: 5 }));

    form.addChild(new Html4.Select({ componentId: 'selectStatic',
        modelPath: 'testForm.selectStatic' }));

    form.addChild(new Html4.Select({ componentId: 'selectProgrammatic',
        modelPath: 'testForm.selectProgrammatic', options: [
            { elementType: 'option', label: 'First Option', value: 'firstOption' },
            { elementType: 'option', label: 'Second Option', value: 'secondOption'},
            { elementType: 'option', label: 'Third Option', value: 'thirdOption' }
        ],
        onHtmlChange: function(event) {
            alert('Programmatic is programmed.');
        }
    }));

    form.addChild(new Html4.Select({ componentId: 'selectProgrammaticOption',
        modelPath: 'testForm.selectProgrammaticOption', options: [
            { elementType: 'optgroup', label: 'First Option', options: [
                { elementType: 'option', label: 'First Child Option', value: 'firstChildOption'},
                { elementType: 'option', label: 'Second Child Option', value: 'secondChildOption' }] },
            { elementType: 'option', label: 'Second Option', value: 'secondOption'},
            { elementType: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html4.Select({ componentId: 'selectMultiProgrammatic',
        modelPath: 'testForm.selectMultiProgrammatic',
        options: [
            { elementType: 'option', label: 'First Multi Option', value: 'firstMultiOption' },
            { elementType: 'option', label: 'Second Multi Option', value: 'secondMultiOption' },
            { elementType: 'option', label: 'Third Multi Option', value: 'thirdMultiOption' }
        ]
    }));

    form.addChild(radioGroup);
    div.addChild(form);
    return div;
});
