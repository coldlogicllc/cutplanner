function GridPicker ( ) {
    this.Width = 4;
    this.Height = 4;
    this.Json = {}; /* The data */
    this.ConsumedUrls = []; /* For tracking url's already displayed. */
};

GridPicker.prototype.LoadHtml = function ( containerId ) {

    let self = this;
    let container = document.getElementById( containerId );

    self.Json = self.LoadJson ( );

    let grid = self.Draw ( );

    container.appendChild( grid );
};

GridPicker.prototype.Draw = function ( ) {
    
    /* Check for dependencies */
    if ( Html === undefined ) {
        alert ( 'Html JavaScript library is missing.' );
        return;
    }
    
    let html = Html.CreateDiv( 'container' );

    // Rows
    for ( let i = 0; i < this.Height; i++ ) {
        let row = Html.CreateDiv( 'row' );

        // Columns
        for ( let j = 0; j < this.Width; j++ ) {
            let column = Html.CreateDiv( 'col' );
            column.appendChild( this.CreateControl ( this.GetNextRandomElement ( this ) ) );
            row.appendChild ( column );
        }

        html.appendChild ( row );
    }

    return html;
};

GridPicker.prototype.CreateControl = function ( obj ) {
    let like, dislike, buy, iframe, control;
    let self = this; 
    
    control = Html.CreateDiv ( 'cell' );
    control.object = obj;
    
    if ( obj !== null ) {
        like = Html.CreateButton ( '', 'btn btn-primary' );
        like.title = 'Like dress.';
        like.onclick = function(){
            control.like++;
            console.log ( 'Would call random algorithm here.' );
        };

        dislike = Html.CreateButton ( '', 'btn btn-danger' );
        dislike.title = 'Dislike dress.';
        dislike.onclick = function( ) {
            control.object.like--;
            let object = self.GetNextRandomElement ( self );
            if ( object !== null ) {
                iframe.src = object.url;
                control.object = object;
            }
            
            console.log ( 'Would call random algorithm here.' );
        };
        
        buy = Html.CreateButton ( ' Buy', 'btn btn-success' );
        buy.title = 'Buy dress.';
        buy.onclick = function ( ) {
            console.log ( 'Would call purchase here.' );
        };

        iframe = document.createElement ( 'iframe' );
        iframe.src = obj.url;
        
        /* Add glyph icons here */
        like.innerHTML = Html.CreateElement ( 'span', 'glyphicon glyphicon-thumbs-up' ).outerHTML + like.innerHTML;
        dislike.innerHTML = Html.CreateElement ( 'span', 'glyphicon glyphicon-thumbs-down' ).outerHTML + dislike.innerHTML;
        buy.innerHTML = Html.CreateElement ( 'span', 'glyphicon glyphicon-shopping-cart' ).outerHTML + buy.innerHTML;

        control.appendChild(like);
        control.appendChild(dislike);
        control.appendChild(buy);
        control.appendChild(iframe);
    }
    else {
        control.innerHTML = 'Error unable to retrieve element.';
    }
    
    return control;
};

GridPicker.prototype.ErrorCheckNextElement = function ( context ) {
    let error = '';
    
    if ( context.Json === undefined  
            || context.Json.urls === undefined 
            || context.Json.urls.length === 0 ) {
        error += 'No more data available.\r\n';
    }
    
    if ( error ) {
        alert ( error );
        return true;
    }
    
    return false;
};

GridPicker.prototype.EuclideanDistanceAlgorithm = function ( e1, e2 ) {
    return Math.sqrt((e2.m-e1.m)^2 + (e2.n-e1.n)^2 + (e2.o-e1.o)^2);
}

GridPicker.prototype.GetNextSimiliarElement = function ( context ) {
    
    let mostLiked, mostSimilar = null;
    
    if ( context.ErrorCheckNextElement ( context ) ) {
        return;
    }
    
    // Step 1. Find the most liked element.
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {
        // First record or liked more than current
        if (mostLiked === null || context.ConsumedUrls[i].liked > mostLiked.liked) {
            mostLiked = context.ConsumedUrls[i];
        }
    }
    
    // Step 2. Sift through remaining elements and calculate their distance from most liked.
    for ( let j = 0; j < context.Json.urls.length; j++ ) {
        
        if ( mostSimilar === null) {
            mostSimilar = context.Json.urls[j];
            continue;
        }
        
        let currentDistance = context.EuclideanDistanceAlgorithm ( context.Json.urls[j], mostLiked );
        let bestDistance = context.EuclideanDistanceAlgorithm ( mostSimilar, mostLiked );
        
        // If distance is closer to most liked
        if ( currentDistance <  bestDistance) {
            mostSimilar = context.Json.urls[j];
        }
    }
    
    // Step 3. Return most similar.
    return mostSimilar;
};

GridPicker.prototype.GetNextRandomElement = function ( context ) {
    
    if ( context.ErrorCheckNextElement ( context ) ) {
        return;
    }
    
    let random = Math.floor( Math.random ( ) * context.Json.urls.length );
    let element = context.Json.urls[ random ];
    
    context.ConsumedUrls.push ( element );
    context.Json.urls.splice ( random, 1 );
    
    return element;
};

GridPicker.prototype.LoadJson = function ( ) {
    return {
            urls: [
                { url: 'dresses/1.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/2.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/3.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/4.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/5.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/6.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/7.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/8.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/9.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/10.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/11.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/12.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/13.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/14.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/15.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/16.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/17.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/18.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/19.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/20.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/21.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/22.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/23.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/24.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/25.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/26.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/27.jpg', value: ['n','m','o','p'], like: 0 },
                { url: 'dresses/28.jpg', value: ['n','m','o','p'], like: 0 }
            ]
        };
};


