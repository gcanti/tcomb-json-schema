$(function () {

  var React = require('react');
  var t = require('tcomb-form');
  var toType = require('../index');

  var Num = t.Num;

  //
  // setup
  //

  // override default fail behaviour of tcomb https://github.com/gcanti/tcomb
  t.options.onFail = function (message) {
    throw new Error(message);
  };

  //
  // load examples
  //

  var scripts = [
    {id: 'required', label: '1. Required fields'},
    {id: 'optional', label: '2. Optional fields'},
    {id: 'enums', label: '3. Enums'},
    {id: 'strings', label: '4. Strings'},
    {id: 'numbers', label: '5. Numbers'},
    {id: 'booleans', label: '6. Booleans'},
    {id: 'list', label: '7. List of strings'},
    {id: 'listOfIntegers', label: '8. List of integers'},
    {id: 'listOfObjects', label: '9. List of objects'},
    {id: 'nested', label: '10. Nested structures'}
  ];

  var examples = {};
  var defaultExample = 'required';
  scripts.forEach(function (script) {
    examples[script.id] = $('#' + script.id).text();
  });

  var examplesHtml = '<select id="examplesGroup" class="form-control">';
  examplesHtml += scripts.map(function (script) {
    return '<option' + (script.id === defaultExample ? ' selected="true"' : '') + ' value="' + script.id + '">' + script.label + '</option>';
  }).join('');
  examplesHtml += '</select>';
  $('#examples').html(examplesHtml);

  var $preview =    $('#preview');
  var $html =       $('#html');
  var $formValues = $('#formValues');
  var $examples =   $('#examples select');
  var POSTFIX =     $('#postfix').html();

  function renderComponent(factory) {
    var component = factory();
    React.renderComponent(component, $preview.get(0));
    $formValues.hide();
  }

  function renderFormValues(value) {
    var html = '<h3>Form values</h3>';
    //html += 'This is an instance of the type. Open up the console to see the details.<br/><br/>';
    html += '<div class="alert alert-success"><pre>' + JSON.stringify(value, null, 2) + '</pre></div>';
    $formValues.show().html(html);
  }

  function renderError(err) {
    var html = '<h3>Error!</h3>';
    html += '<div class="alert alert-danger">' + err.message + '</div>';
    $formValues.show().html(html);
  }

  function getComponent(Form) {
    return React.createClass({
      onClick: function (evt) {
        evt.preventDefault();
        var value = this.refs.form.getValue();
        if (value) {
          //console.log(value); 
          renderFormValues(value);
        }
      },
      render: function () {
        return (
          React.DOM.div(null, 
            Form({ref: 'form'}),
            React.DOM.button({className: 'btn btn-primary', onClick: this.onClick}, 'Click me')
            )
        );
      }
    });
  }

  function run() {
    var getKind = t.util.getKind;
    var json = cm.getValue();
    try {
      var schema = JSON.parse(json);
      var type = toType(schema);
      var kind = getKind(type);
      t.assert(kind === 'struct' || kind === 'list', 'Only object and list schemas are allowed');
      var create = kind === 'struct' ? t.form.createForm : t.form.createList;
      var opts = {
        i17n: {
          format: function (x, type) {
            return type === Num ? String(x || '') : x;
          },
          parse: function (value, type) {
            return type === Num || (getKind(type) === 'subtype' && type.meta.type === Num) ? parseFloat(value) : value;
          }
        }
      };
      if (schema.description) {
        opts.label = React.DOM.h4(null, schema.description);
      }
      var Form = create(type, opts);
      var component = getComponent(Form);
      renderComponent(component);
    } catch (err) {
      debugger;
      renderError(err);
    }
  }

  var cm = CodeMirror.fromTextArea($('#code').get(0), {
    mode: 'javascript',
    lineNumbers: false,
    lineWrapping: true,
    smartIndent: false  // javascript mode does bad things with jsx indents
  });
  cm.setValue(examples[defaultExample]);
  cm.on("change", run);

  $examples.on('change', function () {
    var id = $(this).val();
    cm.setValue(examples[id]);
    run();
  });

  run();

});