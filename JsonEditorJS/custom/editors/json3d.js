/*
 * Description: This editor object handles rendering 3D objects using Three JS JSON format.
 * Examples are contained within the models folder.
 */
JSONEditor.defaults.editors.json3d = JSONEditor.AbstractEditor.extend({
    
    inputUrl: null,
    objElement: null,
    
    setValue: function( value, initial ) {
        this.inputUrl.value = !value ? initial : value;  
    },
    
    getValue: function(){
        return this.inputUrl.value;
    },  
    
    load: function(url, context){
        
        if(context.objElement !== null)
        {
            scene.remove( context.objElement );
            console.log('Removing existing object: ' + context.objElement);
        }
        
        let loader = new THREE.ObjectLoader();
        loader.load(url, function(object){
           
            // Scale
            if ( context.schema.scale !== undefined ) {
                object.scale.set (context.schema.scale.x, context.schema.scale.y, context.schema.scale.z);
            }

            // Position
            if ( context.schema.position !== undefined ) {
                object.position = new THREE.Vector3(context.schema.position.x, context.schema.position.y, context.schema.position.z);
            }
            
            scene.add(object);
            THREEDObjects.push(object);
            context.objElement = object;
        });
    },
    
    build: function(){
        this._super();
        
        let self = this;
        
        this.loaded = false;
        this.Title = document.createElement('h3');
        this.Title.innerHTML = this.getTitle();
        this.label = this.theme.getFormInputLabel('Url')
        this.inputUrl = this.theme.getFormInputField('text');
        this.control = this.theme.getFormControl(this.label, this.inputUrl, '');
        
        this.inputUrl.addEventListener('change', function(e){
            e.preventDefault();
            e.stopPropagation();
            self.load(this.value, self);
            //self.onChange(true);
        });
        
        this.container.appendChild(this.Title);
        this.container.appendChild(this.inputUrl);
    },
    
    postBuild: function(){
        this.load(this.schema.default, this);
    }
});
