/*
 * Example of how to manipulate the JSON editor to create radio buttons.
 */

// Extend default themes
JSONEditor.AbstractTheme.prototype.getRadiobutton = function(options){
    var el = document.createElement('div');
    el.style.display = 'inline-block';
    el.style.width = 'auto';

    return this.setRadioOptions(el, options); 
};

JSONEditor.AbstractTheme.prototype.setRadioOptions = function(element, options){
    for(var i=0; i<options.length; i++) {
      var option = this.getFormInputField('radio');
        option.setAttribute('value',options[i]);
        option.textContent = options[i];
      var label = document.createElement('label');
        label.innerHTML = options[i];
        
      element.appendChild(label);
      element.appendChild(option);
    }

    return element;
};


// Add resolver type
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === 'weirdboolean') {    
    // If explicitly set to 'checkbox', use that
    if(schema.format === "radio" || (schema.options && schema.options.checkbox)) {
      return "radio";
    }
    
    if(schema.format === "checkbox" || (schema.options && schema.options.checkbox)) {
      return "checkbox";
    }
    // Otherwise, default to select menu
    return (JSONEditor.plugins.selectize.enable) ? 'selectize' : 'select';
  }
});

// Editor class
JSONEditor.defaults.editors.weirdboolean = JSONEditor.AbstractEditor.extend({
  setValue: function(value,initial) {
    for(let i = 0; i < this.input.children.length; i++){
        if(this.input.children[i].value === value && this.input.children[i].getAttribute('type') === 'radio'){
            return this.input.children[i].checked = true;
        }
    } 
    this.onChange();
  },
  getValue: function(){
    for(let i = 0; i < this.input.children.length; i++){
        if(this.input.children[i].checked && this.input.children[i].getAttribute('type') === 'radio'){
            return this.input.children[i].value;
        }
    } 
  },
  register: function() {
    this._super();
    if(!this.input) return;
    for(let i = 0; i < this.input.children.length; i++){
        if(this.input.children[i].getAttribute('type') === 'radio')
            this.input.children[i].setAttribute('name', this.formname);
    }
  },
  unregister: function() {
    this._super();
    if(!this.input) return;
    for(let i = 0; i < this.input.children.length; i++){
        if(this.input.children[i].getAttribute('type') === 'radio')
          this.input.children[i].removeAttribute('name');
    }
  },
  getNumColumns: function() {
    return Math.min(12,Math.max(this.getTitle().length/7,2));
  },
  build: function() {  
    let self = this;
    
    if(!this.options.compact) {
      this.label = this.header = this.theme.getCheckboxLabel(this.getTitle());
    }
    
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if(this.options.compact) this.container.className += ' compact';

    if(this.schema.format === 'radio'){
        this.input = this.theme.getRadiobutton(this.schema.enum);
    } else {
        this.input = this.theme.getCheckbox();
    }
    this.control = this.theme.getFormControl(this.label, this.input, this.description);

    if(this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      this.input.disabled = true;
    }

    this.input.addEventListener('change',function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.value = this.checked;
      self.onChange(true);
    });

    this.container.appendChild(this.control);
  },
  enable: function() {
    if(!this.always_disabled) {
        for(let i = 0; i < this.input.children.length; i++){
            if(this.input.children[i].getAttribute('type') === 'radio'){
                this.input.children[i].disabled = false;
            }
        }
    }
    this._super();
  },
  disable: function() {
    for(let i = 0; i < this.input.children.length; i++){
        if(this.input.children[i].getAttribute('type') === 'radio'){
            this.input.children[i].disabled = true;
        }
    }
    this._super();
  },
  destroy: function() {
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    this._super();
  }
});