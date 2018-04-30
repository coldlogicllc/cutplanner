/*
 * Description: Example of how to manipulate the J. Dorn JSON editor to create jos de jong's JSON editor.
 * Note: There was a naming conflict with his editor and jeremy dorn's editor, so jos de jong's was
 * renamed from "JSONEditor" to "JSONEditorExt" to fix.
 */

JSONEditor.defaults.editors.weirdobject = JSONEditor.defaults.editors.object.extend({
  
  textAreaContainer : document.createElement('textarea'),
  textAreaContainer2 : document.createElement('textarea'),
    
  preBuild: function(){
      this._super();
      this.textAreaContainer2.value = JSON.stringify(this.schema, null, 2);
  },
  
  build: function(){
    this._super();
    
    let options = { };

    let editor = new JSONEditorExt(this.container, options, this.schema);
    
    //editor.set(json);
    //editor.get();
  },
  
  postBuild: function(){
      this._super();
      this.textAreaContainer.value = JSON.stringify(this.getValue(), null, 2);
  }
});