/*
 * Example of how to manipulate the JSON editor to create images.
 */

// Extend default theme
JSONEditor.AbstractTheme.prototype.getGraphic = function(){
    var el = document.createElement('img');
    el.style.display = 'inline-block';
    el.style.width = '200px';
    el.style.cursor = 'pointer';
    
    return el;
};

// Create editor class - name should match type
JSONEditor.defaults.editors.weirdgraphic = JSONEditor.AbstractEditor.extend({
  setValue: function(value,initial) {
    this.input.src = value ? value : initial;
    this.onChange();
  },
  getValue: function(){
    return this.input.src;
  },
  register: function() {
    this._super();
    if(!this.input) return;
    this.input.setAttribute('name', this.formname);
  },
  unregister: function() {
    this._super();
    if(!this.input) return;
    this.input.removeAttribute('name');
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

    this.input = this.theme.getGraphic();
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
        this.input.disabled = false;
    }
    this._super();
  },
  disable: function() {
    this.input.disabled = true;
    this._super();
  },
  destroy: function() {
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    this._super();
  }
});


