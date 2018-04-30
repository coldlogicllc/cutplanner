/*
 * Description: The canvas is where 3D graphics are drawn. It also contains the main
 * programming loops for interactiving with 3D objects.
 */

JSONEditor.defaults.editors.canvasobject = JSONEditor.defaults.editors.object.extend({
    
  preBuild: function(){
      this._super();
  },
  
  build: function(){
    this._super();
    
    let self = this;
    
    // Handle canvas object
    this.container.appendChild( renderer.domElement );

    // Update logic
    var update = function( ) 
    {
        for(let i = 0; i < THREEDObjects.length; i++) {
            if ( THREEDObjects[i] !== null ) {
                
                // Rotation
                if( self.schema.rotate !== undefined ) 
                {
                    THREEDObjects[i].rotation.x += parseFloat(self.schema.rotate.x);
                    THREEDObjects[i].rotation.y += parseFloat(self.schema.rotate.y);
                    THREEDObjects[i].rotation.z += parseFloat(self.schema.rotate.z);
                }
            }
        }
    };

    // Draw scene
    var render = function( ) 
    {
        renderer.render( scene, camera );
    };

    // Run game loop (update, render, repeat)
    var animateLoop = function( )
    {
        requestAnimationFrame( animateLoop );
        update( );
        render( );
    };
    
    animateLoop();
  },
  
  postBuild: function(){
      this._super();
  }
});
