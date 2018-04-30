/*
 * Description: Ambient light is one of 4 possible types of light in three.js. This is used to 
 * see the 3D objects being rendered and display color.
 */

JSONEditor.defaults.editors.ambientlight = JSONEditor.AbstractEditor.extend({
  
    ambientLight : null,
    inputIntensity : null,
    inputColor : null, 
    
    setValue: function( value, initial ) {
        this.inputIntensity.value = value.intensity;
        this.inputColor.value = value.color;
        this.onChange();
        this.ambientLight.color = new THREE.Color(parseInt(value.color));
        this.ambientLight.intensity = value.intensity;
    },
    
    getValue: function(){
      return { intensity: this.inputIntensity.value, color : this.inputColor.value };
    },
    
    preBuild: function(){
        this._super();

        this.ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0 );
    },
    
    build: function() {   
        
      this._super();
      
      let self = this;

      scene.add (this.ambientLight);

      this.Title = document.createElement('h3');
      this.Title.innerHTML = this.getTitle();
      this.inputColorLabel = this.theme.getFormInputLabel('Color');
      this.inputIntensityLabel = this.theme.getFormInputLabel('Intensity');
      this.inputIntensity = this.theme.getFormInputField('text');
      this.inputColor = this.theme.getFormInputField('text');
      
      
      this.controlIntensity = this.theme.getFormControl(this.inputIntensityLabel, this.inputIntensity, this.description);
      this.controlColor = this.theme.getFormControl(this.inputColorLabel, this.inputColor, this.description);

      if(this.schema.readOnly || this.schema.readonly) {
        this.always_disabled = true;
        this.inputIntensity.disabled = true;
        this.inputColor.disabled = true;
      }

      this.inputColor.addEventListener('change',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.ambientLight.color = new THREE.Color(parseInt(this.value));
      });

      this.inputIntensity.addEventListener('change',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.ambientLight.intensity = this.value;
      });

      this.container.appendChild(this.Title);
      this.container.appendChild(this.controlIntensity);
      this.container.appendChild(this.controlColor);
    },

    enable: function() {
      if(!this.always_disabled) {
          this.inputIntensity.disabled = false;
          this.inputColor.disabled = false;
      }
      this._super();
    },

    disable: function() {
      this.inputIntensity.disabled = true;
      this.inputColor.disabled = true;
      this._super();
    }
});
