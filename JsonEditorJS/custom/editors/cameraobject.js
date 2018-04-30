/*
 * Description: The camera object handles the point of view within the canvas. This
 * class comes with some basic properies such as x, y and z coordinates.
 */

JSONEditor.defaults.editors.camera = JSONEditor.AbstractEditor.extend({
  
    inputX : null,
    inputY : null,
    inputZ : null,
    
    setValue: function( value, initial ) {
        this.inputX.value = camera.position.x = value.x;
        this.inputY.value = camera.position.y = value.y;
        this.inputZ.value = camera.position.z = value.z
        camera.updateProjectionMatrix( );
        controls.update();
        this.onChange();
    },
    
    getValue: function(){
        
        return { x: this.inputX.value, y : this.inputY.value, z : this.inputZ.value };
    },
    
    register: function() {
        this._super();
        this.inputX.setAttribute('name', this.formname);
        this.inputY.setAttribute('name', this.formname);
        this.inputZ.setAttribute('name', this.formname);
     },
     
    unregister: function() {
        this._super();
        this.inputX.removeAttribute('name');
        this.inputY.removeAttribute('name');
        this.inputZ.removeAttribute('name');
     },
    
    build: function() {   
      
        this._super();
        let self = this;

        this.Title = document.createElement('h3');
        this.Title.innerHTML = this.getTitle();

        this.inputXLabel = this.theme.getFormInputLabel('X');
        this.inputYLabel = this.theme.getFormInputLabel('Y');
        this.inputZLabel = this.theme.getFormInputLabel('Z');
        this.inputX = this.theme.getFormInputField('text');
        this.inputY = this.theme.getFormInputField('text');
        this.inputZ = this.theme.getFormInputField('text');


        this.controlX = this.theme.getFormControl(this.inputXLabel, this.inputX, this.description);
        this.controlY = this.theme.getFormControl(this.inputYLabel, this.inputY, this.description);
        this.controlZ = this.theme.getFormControl(this.inputZLabel, this.inputZ, this.description);

        if(this.schema.readOnly || this.schema.readonly) {
          this.always_disabled = true;
          this.inputX.disabled = true;
          this.inputY.disabled = true;
          this.inputZ.disabled = true;
        }

        this.inputX.addEventListener('change',function(e) {
          e.preventDefault();
          e.stopPropagation();
          camera.position.x = this.value;
          camera.updateProjectionMatrix();
          controls.update();
          self.onChange(true);
        });

        this.inputY.addEventListener('change',function(e) {
          e.preventDefault();
          e.stopPropagation();
          camera.position.y = this.value;
          camera.updateProjectionMatrix();
          controls.update();
          self.onChange(true);
        });

        this.inputZ.addEventListener('change',function(e) {
          e.preventDefault();
          e.stopPropagation();
          camera.position.z = this.value;
          camera.updateProjectionMatrix();
          controls.update();
          self.onChange(true);
        });
        
        renderer.domElement.addEventListener('mouseup', function(){
            self.setValue({ x: camera.position.x, y : camera.position.y, z : camera.position.z });
            self.onChange(true);
         });

        this.container.appendChild(this.Title);
        this.container.appendChild(this.controlX);
        this.container.appendChild(this.controlY);
        this.container.appendChild(this.controlZ);
        
        camera.updateProjectionMatrix( );
        controls.update();
    },

    enable: function() {
      if(!this.always_disabled) {
          this.inputX.disabled = false;
          this.inputY.disabled = false;
          this.inputZ.disabled = false;
      }
      this._super();
    },

    disable: function() {
      this.inputX.disabled = true;
      this.inputY.disabled = true;
      this.inputZ.disabled = true;
      this._super();
    }
});

