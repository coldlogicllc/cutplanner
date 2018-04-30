/*
 * Description: This editor object handles rendering 3D objects using OBJ and MTL (material) file format.
 * Examples are contained within models folder. 
 */
JSONEditor.defaults.editors.obj3d = JSONEditor.AbstractEditor.extend({
    
    inputObj: null,
    inputMtl: null,
    objElement: null,
    
    setValue: function( value, initial ) {
        this.inputObj.value = value.obj;
        this.inputMtl.value = value.mtl;
    },
    
    getValue: function(){
        return { obj: this.inputObj.value, mtl : this.inputMtl.value };
    },  
    
    filePath : function(url) {
      let parts = url.split('/');
      let path = '';
      for(let i = 0; i < parts.length -1; i++) {
          path += parts[i] + '/';
      }
      
      return path;
    },
    
    file : function(url){
      let parts = url.split('/');
      
      return parts[parts.length-1];  
    },
    
    load: function(object, context){
        
        if(context.objElement !== null)
        {
            scene.remove( context.objElement );
            console.log('Removing existing object: ' + context.objElement);
        }
        
        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( context.filePath(object.mtl) );
        mtlLoader.load( context.file(object.mtl), function( materials ) {

                materials.preload();

                let objLoader = new THREE.OBJLoader();
                objLoader.setMaterials( materials );
                objLoader.setPath( context.filePath(object.obj) );
                objLoader.load( context.file(object.obj), function ( object ) {
                        
                        // Scale
                        if ( context.schema.scale !== undefined ) {
                            object.scale.set (context.schema.scale.x, context.schema.scale.y, context.schema.scale.z);
                        }
                        
                        // Position
                        if ( context.schema.position !== undefined ) {
                            object.position = new THREE.Vector3(context.schema.position.x, context.schema.position.y, context.schema.position.z);
                        }
                        
                        scene.add( object );
                        context.objElement = object;
                        THREEDObjects.push(object);
                });

        });
    },
    
    build: function(){
        this._super();
        
        let self = this;
        
        this.loaded = false;
        this.Title = document.createElement('h3');
        this.Title.innerHTML = this.getTitle();
        
        this.label = this.theme.getFormInputLabel('OBJ file')
        this.inputObj = this.theme.getFormInputField('text');
        this.control = this.theme.getFormControl(this.label, this.inputObj, '');
        
        this.label2 = this.theme.getFormInputLabel('MTL file')
        this.inputMtl = this.theme.getFormInputField('text');
        this.control2 = this.theme.getFormControl(this.label2, this.inputMtl, '');
        
        this.inputObj.addEventListener('change', function(e){
            e.preventDefault();
            e.stopPropagation();
            self.load({ obj : self.inputObj.value, mtl: self.inputMtl.value }, self);
            self.onChange(true);
        });
        
        this.inputMtl.addEventListener('change', function(e){
            e.preventDefault();
            e.stopPropagation();
            self.load({ obj : self.inputObj.value, mtl: self.inputMtl.value }, self);
            self.onChange(true);
        });
        
        this.container.appendChild(this.Title);
        this.container.appendChild(this.control);
        this.container.appendChild(this.control2);
    },
    
    postBuild: function(){
        this.load(this.schema.default, this);
    }
});
