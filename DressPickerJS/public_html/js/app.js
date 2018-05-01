function GridPicker ( ) {
    this.Width = 5;
    this.Height = 5;
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


GridPicker.prototype.FindElement = function ( context, url ) {
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {
        if ( context.ConsumedUrls[i].url === url) {
            return i;
        }
    }
    
    return -1;
};

GridPicker.prototype.CreateControl = function ( obj ) {
    let like, dislike, buy, iframe, control;
    let self = this; 
    
    control = Html.CreateDiv ( 'cell' );
    //control.object = obj;
    
    if ( obj !== null ) {
        like = Html.CreateButton ( '', 'btn btn-primary' );
        like.title = 'Like dress.';
        like.onclick = function(){
            //control.like++;
            self.ConsumedUrls[self.FindElement( self, obj.url )].like++;
            console.log ( 'Would call random algorithm here.' );
        };

        dislike = Html.CreateButton ( '', 'btn btn-danger' );
        dislike.title = 'Dislike dress.';
        dislike.onclick = function( ) {
            //control.object.like--;
            self.ConsumedUrls[self.FindElement( self, obj.url )].like--;
            let object = self.GetNextSimilarElement ( self );
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
    
    let sum = 0;
    
    for ( let i= 0; i < e1.value.length; i++ ) {
        sum += Math.pow(e1.value[i] - e2.value[i], 2);
    }
    
    return Math.sqrt ( sum );
};

GridPicker.prototype.GetNextSimilarElement = function ( context ) {
    
    let mostLiked = null, mostSimilar = null, index = 0;
    
    if ( context.ErrorCheckNextElement ( context ) ) {
        return;
    }
    
    // Step 1. Find the most liked element.
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {
        // First record or liked more than current
        if (mostLiked === null || context.ConsumedUrls[i].like > mostLiked.like) {
            mostLiked = context.ConsumedUrls[i];
        }
    }
    
    // Step 2. Sift through remaining elements and calculate their distance from most liked.
    for ( let j = 0; j < context.Json.urls.length; j++ ) {
        
        if ( mostSimilar === null) {
            mostSimilar = context.Json.urls[j];
            index = j;
            continue;
        }
        
        let currentDistance = context.EuclideanDistanceAlgorithm ( context.Json.urls[j], mostLiked );
        let bestDistance = context.EuclideanDistanceAlgorithm ( mostSimilar, mostLiked );
        
        // If distance is closer to most liked
        if ( currentDistance <  bestDistance) {
            mostSimilar = context.Json.urls[j];
            index = j;
        }
    }
    
    context.ConsumedUrls.push ( mostSimilar );
    context.Json.urls.splice ( index, 1 );
    
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
    
    return this.LoadTestData();
    /*
    return {
            urls: [
                { url: 'dresses/1.jpg', value: [18, 74, 148], like: 0 },
                { url: 'dresses/2.jpg', value: [91, 179, 199], like: 0 },
                { url: 'dresses/3.jpg', value: [139, 219, 208], like: 0 },
                { url: 'dresses/4.jpg', value: [234, 229, 129], like: 0 },
                { url: 'dresses/5.jpg', value: [2, 2, 2], like: 0 },
                { url: 'dresses/6.jpg', value: [105, 106, 111], like: 0 },
                { url: 'dresses/7.jpg', value: [239, 243, 218], like: 0 },
                { url: 'dresses/8.jpg', value: [22, 25, 34], like: 0 },
                { url: 'dresses/9.jpg', value: [25, 26, 28], like: 0 },
                { url: 'dresses/10.jpg', value: [193, 206, 225], like: 0 },
                { url: 'dresses/11.jpg', value: [244, 193, 212], like: 0 },
                { url: 'dresses/12.jpg', value: [135, 108, 175], like: 0 },
                { url: 'dresses/13.jpg', value: [45, 36, 37], like: 0 },
                { url: 'dresses/14.jpg', value: [201, 6, 12], like: 0 },
                { url: 'dresses/15.jpg', value: [237, 49, 1], like: 0 },
                { url: 'dresses/16.jpg', value: [236, 225, 195], like: 0 },
                { url: 'dresses/17.jpg', value: [238, 184, 50], like: 0 },
                { url: 'dresses/18.jpg', value: [25, 20, 16], like: 0 },
                { url: 'dresses/19.jpg', value: [224, 1, 32], like: 0 },
                { url: 'dresses/20.jpg', value: [254, 246, 165], like: 0 },
                { url: 'dresses/21.jpg', value: [248, 230, 226], like: 0 },
                { url: 'dresses/22.jpg', value: [50, 42, 39], like: 0 },
                { url: 'dresses/23.jpg', value: [219, 218, 224], like: 0 },
                { url: 'dresses/24.jpg', value: [71, 59, 45], like: 0 },
                { url: 'dresses/25.jpg', value: [67, 11, 10], like: 0 },
                { url: 'dresses/26.jpg', value: [242, 27, 32], like: 0 },
                { url: 'dresses/27.jpg', value: [223, 197, 136], like: 0 },
                { url: 'dresses/28.jpg', value: [33, 32, 38], like: 0 }
            ]
        };*/
};

GridPicker.prototype.LoadTestData = function() {
    
    let data = {};
    data.urls = [];
    
    for ( let i = 0; i < 1000; i++ ) {
        let r = Math.floor(Math.random() * 255),
            g = Math.floor(Math.random() * 255),
            b = Math.floor(Math.random() * 255);
    
        data.urls.push(
                { 
                    url: 'dresses/test.html?r=' + r + '&g=' + g + '&b=' + b,
                    value: [r, g, b],
                    like: 0
                });
    }
    
    return data;
};




