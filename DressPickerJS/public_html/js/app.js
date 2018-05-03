function GridPicker ( ) {
    this.Width = 5;
    this.Height = 3;
    this.Json = {}; /* The data */
    this.ConsumedUrls = []; /* For tracking url's already displayed. */
    this.MinimumRadius = 100;
};

GridPicker.prototype.LoadHtml = function ( containerId ) {

    let self = this;
    let container = document.getElementById( containerId );

    self.Json = self.LoadJson ( );

    let grid = self.Draw ( );

    container.appendChild( grid );
};

GridPicker.prototype.Draw = function ( ) {
    
    let self = this;
    
    /* Check for dependencies */
    if ( Html === undefined ) {
        alert ( 'Html JavaScript library is missing.' );
        return;
    }
    
    let html = Html.CreateDiv( 'container' );
    let buttonRefresh = document.getElementById('Refresh-All');
    buttonRefresh.onclick = function ( ) {
        self.RefreshAll( self );
    };

    // Rows
    for ( let i = 0; i < this.Height; i++ ) {
        let row = Html.CreateDiv( 'row' );

        // Columns
        for ( let j = 0; j < this.Width; j++ ) {
            let column = Html.CreateDiv( 'col' );
            let element = this.GetNextRandomElement ( this );
            element.container = column;
            column.appendChild( this.CreateControl ( element ) );
            row.appendChild ( column );
        }

        html.appendChild ( row );
    }
    
    //console.log ( this.ConsumedUrls );

    return html;
};

GridPicker.prototype.RefreshAll = function ( context ) {
    
    let total = context.ConsumedUrls.length;
    for ( let i = 0; i < total; i++ ) {
        
        let item = context.ConsumedUrls[i];     
        if ( item.like === 0 ) {
            
            item.like--;
            
            let element = context.GetNextSimilarElement( context );
            if ( element !== null ) {
                element.container = item.container;
                element.container.removeChild(element.container.firstChild);
                element.container.appendChild( context.CreateControl ( element ) );
            }
            
            item.container = null;
        }
    }
};

GridPicker.prototype.FindElement = function ( context, url ) {
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {
        if ( context.ConsumedUrls[i].url === url) {
            return i;
        }
    }
    
    return -1;
};

GridPicker.prototype.PrintInfo = function ( element, obj ) {
  element.innerHTML = 'Score: ' + obj.like  ;
};

GridPicker.prototype.CreateControl = function ( obj ) {
    let like, dislike, buy, iframe, info, control;
    let self = this; 
    
    control = Html.CreateDiv ( 'cell' );
    //control.object = obj;
    
    if ( obj !== null ) {
        like = Html.CreateButton ( '', 'btn btn-primary' );
        like.title = 'Like dress.';
        like.onclick = function(){
            let item = self.ConsumedUrls[self.FindElement( self, obj.url )];
            item.like++;
            self.PrintInfo(info, item);
        };

        dislike = Html.CreateButton ( '', 'btn btn-danger' );
        dislike.title = 'Dislike dress.';
        dislike.onclick = function( ) {
            let item = self.ConsumedUrls[self.FindElement( self, obj.url )];
            item.like--;
            let object = self.GetNextSimilarElement ( self );
            if ( object !== null ) {
                iframe.src = object.url;
                object.container = item.container;
                obj = object;
            }
            item.container = null;
            self.PrintInfo(info, object);
        };
        
        buy = Html.CreateButton ( ' Buy', 'btn btn-success' );
        buy.title = 'Buy dress.';
        buy.onclick = function ( ) {
            console.log ( 'Would call purchase here.' );
        };

        iframe = document.createElement ( 'iframe' );
        iframe.src = obj.url;
        
        info = Html.CreateDiv( 'cell-info');
        this.PrintInfo( info, obj );
        
        /* Add glyph icons here */
        like.innerHTML = Html.CreateElement ( 'span', 'glyphicon glyphicon-thumbs-up' ).outerHTML + like.innerHTML;
        dislike.innerHTML = Html.CreateElement ( 'span', 'glyphicon glyphicon-thumbs-down' ).outerHTML + dislike.innerHTML;
        buy.innerHTML = Html.CreateElement ( 'span', 'glyphicon glyphicon-shopping-cart' ).outerHTML + buy.innerHTML;

        control.appendChild(like);
        control.appendChild(dislike);
        control.appendChild(buy);
        control.appendChild(iframe);
        control.appendChild(info);
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

GridPicker.prototype.RandomRange = function ( max ) {
    return Math.floor ( Math.random() * max );
};

GridPicker.prototype.RandomPoint = function ( context, centerPoint ) {
    
    let random = {};
    random.value = [];    
    
    for (let i = 0; i < centerPoint.value.length; i++ ) {
        random.value[i] = context.RandomRange( 255 );
    }
    
    return random;
};

GridPicker.prototype.PointIsInsideCircle = function ( context, point, radius, center ) {
    let distance = context.EuclideanDistanceAlgorithm ( point, center );
    
    //console.log ('Distance is ' + distance + ' from center and radius is ' + radius);
    
    return distance < radius;
};

GridPicker.prototype.CalculateRadius = function ( context, center ) {
    let avgRadius = context.MinimumRadius, 
        cntRadius = 1;
    
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {
        if (context.ConsumedUrls[i].like > 0) {
            avgRadius += context.EuclideanDistanceAlgorithm ( center, context.ConsumedUrls[i] ) * context.ConsumedUrls[i].like;
            cntRadius += context.ConsumedUrls[i].like;
        }
    }
    
    let radius = avgRadius / cntRadius;
    
    return radius < context.MinimumRadius ? context.MinimumRadius : radius;
};

GridPicker.prototype.GetRandomFromCenterPoint = function ( context, centerPoint ) {
    
    // Calculate radius (average distance from center).
    let radius = context.CalculateRadius ( context, centerPoint );
    let random;
    let count = 0;
    let maxAttempts = 100;
    
    console.log ( 'Search radius is ' + radius );
    
    do {
        // Pick a random point.
        random = context.RandomPoint( context, centerPoint );
        count++;
        
    } while ( context.PointIsInsideCircle ( context, random, radius, centerPoint ) === false && count < maxAttempts); // Random point is inside circle (distance of point and random is less than radius.
    
    // return random point in circle.
    return random;
};

GridPicker.prototype.GetAverageLiked = function ( context, mostLiked ) {
    let average = {},
        counter = 0,
        voted = false,
        features = 0;

    average.value = [];
    features = mostLiked.value.length;
    
    for (let j = 0; j < features; j++) {
        average.value[j] = 0;
    }
    
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {

        if ( context.ConsumedUrls[i].like > 0 ) {
            
            voted = true;
            
            for (let j = 0; j < features; j++) {
                
                let value = context.ConsumedUrls[i].value[j];
                let likeness = context.ConsumedUrls[i].like;
                        
                average.value[j] += value * likeness;
            }
            
            counter+= context.ConsumedUrls[i].like;
        }
    }
    
    for (let j = 0; j < features; j++) {
        average.value[j] = average.value[j] / counter;
    }
    
    if ( !voted ) {
        return mostLiked;
    }
    
    return average;
};

GridPicker.prototype.GetMostLiked = function ( context ) {
    
    // Select a random
    let mostLiked = context.ConsumedUrls[context.RandomRange(context.ConsumedUrls.length)];
    
    // Search for liked
    for ( let i = 0; i < context.ConsumedUrls.length; i++ ) {
        
        if (context.ConsumedUrls[i].like > mostLiked.like) {
            mostLiked = context.ConsumedUrls[i];
        }
    }
    
    return mostLiked;
};

GridPicker.prototype.GetNextSimilarElement = function ( context ) {
    
    let mostLiked = null, mostSimilar = null, index = 0;
    
    if ( context.ErrorCheckNextElement ( context ) ) {
        return;
    }
    
    // Step 1. Find the most liked element.
    mostLiked = context.GetMostLiked( context );
    // Step 1.1 Find the center most liked element.
    mostLiked = context.GetAverageLiked ( context, mostLiked );
    // Step 1.2 Find a random point inside of circle around center most point.
    mostLiked = context.GetRandomFromCenterPoint ( context, mostLiked );
    
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
    
    let random = context.RandomRange( context.Json.urls.length );
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
        let r = this.RandomRange( 255 ),
            g = this.RandomRange( 255 ),
            b = this.RandomRange( 255 );
    
        data.urls.push(
                { 
                    url: 'dresses/test.html?r=' + r + '&g=' + g + '&b=' + b,
                    value: [r, g, b],
                    like: 0
                });
    }
    
    return data;
};




