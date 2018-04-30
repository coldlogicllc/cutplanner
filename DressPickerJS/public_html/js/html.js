var Html = {
    CreateDiv : function ( className ) {
        let element = document.createElement( 'div' );
        element.className = className;

        return element;
    },
    
    CreateElement : function ( tagName, className ) {
        let element = document.createElement ( tagName );
        element.className = className;
        
        return element;
    },

    CreateButton : function ( text, className ) {
        let button = document.createElement( 'button' );
        button.innerHTML = text;
        button.className = className;

        return button;
    }
};


