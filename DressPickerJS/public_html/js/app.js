function GridPicker ( ) {
    this.Width = 5;
    this.Height = 2;
    this.Json = {}; /* The data */
    this.ConsumedUrls = []; /* For tracking url's already displayed. */
    this.MinimumRadius = 75; /* The minimum length a radius can be. */
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
            if ( element !== null 
                    && item.container !== null 
                    && item.container !== undefined) {
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

/*
 * Checks to make sure data exists.
 */
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

/*
 * Calculates the distance between two points.
 */
GridPicker.prototype.EuclideanDistanceAlgorithm = function ( e1, e2 ) {
    
    let sum = 0;
    
    for ( let i= 0; i < e1.value.length; i++ ) {
        sum += Math.pow(e1.value[i] - e2.value[i], 2);
    }
    
    return Math.sqrt ( sum );
};

/*
 * Selects a random number from zero to max.
 */
GridPicker.prototype.RandomRange = function ( max ) {
    return Math.floor ( Math.random() * max );
};

/*
 * Selects random values from 0 to 255.
 */
GridPicker.prototype.RandomPoint = function ( context, centerPoint ) {
    
    let random = {};
    random.value = [];    
    
    for (let i = 0; i < centerPoint.value.length; i++ ) {
        random.value[i] = context.RandomRange( 255 );
    }
    
    return random;
};

/*
 * Returns true/false whether a point is located inside of a circle.
 */
GridPicker.prototype.PointIsInsideCircle = function ( context, point, radius, center ) {
    let distance = context.EuclideanDistanceAlgorithm ( point, center );
    
    return distance < radius;
};

/*
 * Calculates the radius based on average distance of liked elements from the center of gravity.
 * A minimum is used to reduce the number of random guesses it takes to find a point that falls within
 * the search radius.
 */
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

/*
 * Currently it attempts to pick a random point within a multi-dimensional plane
 * and returns if it lies within it's search sphere or is less than the center distance (radius).
 * TODO: An improvement to this would be to pickout a random point without having
 * to attempt so many times. Not quite sure how to achieve this without making random,
 * but it currently attempts many times if only a single product is liked. The minimum
 * radius length attempts to speed up this function.
 */
GridPicker.prototype.GetRandomFromCenterPoint = function ( context, centerPoint ) {
    
    // Calculate radius (average distance from center).
    let radius = context.CalculateRadius ( context, centerPoint );
    let random;
    let count = 0;
    let maxAttempts = 1000;
    
    /* console.log ( 'Search radius is ' + radius ); */
    
    do {
        // Pick a random point.
        random = context.RandomPoint( context, centerPoint );
        count++;
        
    } while ( context.PointIsInsideCircle ( context, random, radius, centerPoint ) === false && count < maxAttempts); // Random point is inside circle (distance of point and random is less than radius.
    
    console.log (count + ' attempts');
    
    // return random point in circle.
    return random;
};

/*
 * Returns the centermost point (average) based on all likes.
 */
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

/*
 * Returns the most liked element (highest thumbs up score).
 */

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

/*
 * Retrieves an element from JSON urls that matches the search criteria.
 * Search criteria is based on finding the center point of liked elements
 * drawing a circle around center with a radius equal to the average distance of
 * liked elements (A minimum radius constant is used and defined in constructor). 
 * Then a random point within the circle is returned so that it's somewhat random, but
 * not identicial to the center point.
 */
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

/*
 * Removes a random element from the JSON and inserts
 * it into the consumedUrls list before return the element. 
 */
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

/*
 * Converts hex color #XXXXXX to rgb array (rrr, ggg, bbb).
 */
GridPicker.prototype.HexToRGB = function ( hex ) {
    let div = Html.CreateDiv ('');
    div.style.color = hex;
    let color = window.getComputedStyle(div).color.replace('rgb(', '').replace(')', '');
    
    return color.split(',');
};

/*
 * Converts a set of numbers for example {0, 1, 2, 3} to work
 * with 255 (the color length).
 */
GridPicker.prototype.NormalizeValue = function ( value, length ) {
    
    if ( length === 0 ) {
        return 0;
    }
    
    let increment = 255 / length;
    
    return increment * value;
};

GridPicker.prototype.LoadJson = function ( ) {
    
    return this.LoadRawTestData();
    //return this.LoadTestData();
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

GridPicker.prototype.LoadRawTestData = function( ) {
  
    let data = {};
    data.urls = [];
    
    let json = [
      {
          "id": "MMVT", 
          "options": [
              {
                  "name": "color", 
                  "color": ["#292929", "#545454", "#999999", "#ffffff", "#4e2e28", "#960e29", "#c42020", "#cc0c4c", "#d96300", "#edcea1", "#ff6600", "#ffd154", "#095334", "#1aa13e", "#272c4f", "#501a6b", "#002594", "#2fc7c7", "#81a2d1", "#afc5f7"], 
                  "values": ["Bk", "Gs", "Lg", "Wh", "Bc", "Cms", "Rd", "Rb", "Ob", "Kh", "Tor", "Gd", "Hg", "Sg", "Nb", "P", "Bl", "Tq", "Cb", "Sb"]}
              , {
                  "name": "pockets",
                  "color": [null, null, null, null],
                  "values": ["Pn", "Pa", "Pcl", "PaPcl"]}]}
                , {
           "id": "WMET",
           "options": [
               {
                   "name": "color", 
                   "color": ["#292929", "#545454", "#999999", "#ffffff", "#4e2e28", "#960e29", "#c42020", "#cc0c4c", "#d96300", "#edcea1", "#ff6600", "#ffd154", "#095334", "#1aa13e", "#272c4f", "#501a6b", "#002594", "#2fc7c7", "#81a2d1", "#afc5f7"],
                   "values": ["Bk", "Gs", "Lg", "Wh", "Bc", "Cms", "Rd", "Rb", "Ob", "Kh", "Tor", "Gd", "Hg", "Sg", "Nb", "P", "Bl", "Tq", "Cb", "Sb"]}
               , {
                   "name": "trim", 
                   "color": ["#000000", "#545454", "#999999", "#ffffff", "#4e2e28", "#960e29", "#cc0c4c", "#d20000", "#d96300", "#edcea1", "#fdd5e7", "#ffef00", "#ff4a00", "#ffd154", "#ff4db8", "#095334", "#1aa13e", "#00ff00", "#29004a", "#644d77", "#002594", "#7a8aa4", "#2fc7c7", "#81a2d1", "#afc5f7"],
                   "values": ["Tb", "Tgs", "Tlg", "Tw", "Tbc", "Tcms", "Trasp", "Tr", "Tob", "Tkh", "Tlp", "Ty", "To", "Tgd", "Thp", "Thg", "Tsg", "Tng", "Tnb", "Tp", "Trb", "Tlb", "Ttq", "Tcb", "Tsb"]}
               , {
                   "name": "pockets", 
                   "color": [null, null, null, null, null, null, null],
                   "values": ["Pn", "Pr", "Pl", "Pi", "PrPl", "PrPi", "PrPlPi"]
               }
           ]
       }
   ];  
   
   // Loop ID's
   for (let i = 0; i < json.length; i++) {
       for (let a = 0; a < json[i].options[0].color.length; a++) {
           for (let b = 0; b < json[i].options[1].values.length; b++) {
                if (json[i].options.length > 2) {
                    for (let c = 0; c < json[i].options[2].values.length; c++) {
                        /*console.log ( 'http://performancescrubs.com/images.jsp?id=' + json[i].id 
                                + '&color=' + json[i].options[0].values[a] 
                                + '&trim=' + json[i].options[1].values[b]
                                + '&pockets=Pn' + json[i].options[2].values[c]);*/
                        let color = this.HexToRGB (json[i].options[0].color[a]);
                        data.urls.push({
                            url: 'http://performancescrubs.com/images.jsp?id=' + json[i].id 
                                + '&color=' + json[i].options[0].values[a] 
                                + '&trim=' + json[i].options[1].values[b]
                                + '&pockets=Pn' + json[i].options[2].values[c],
                            like: 0,
                            value: [color[0]
                                , color[1]
                                , color[2]
                                , this.NormalizeValue(b, json[i].options[1].values.length)
                                , this.NormalizeValue(c, json[i].options[2].values.length)]
                        });
                    }
                }
                else {
                    /*console.log ( 'http://performancescrubs.com/images.jsp?id=' + json[i].id 
                                + '&color=' + json[i].options[0].values[a] 
                                + '&pockets=' + json[i].options[1].values[b]);*/
                    let color = this.HexToRGB (json[i].options[0].color[a]);
                    data.urls.push({
                        url: 'http://performancescrubs.com/images.jsp?id=' + json[i].id 
                            + '&color=' + json[i].options[0].values[a]
                            + '&pockets=Pn' + json[i].options[1].values[b],
                        like: 0,
                        value: [color[0]
                            , color[1]
                            , color[2]
                            , 127.5
                            , this.NormalizeValue(b, json[i].options[1].values.length)]
                    });
                }
            }
       }
   }
   
    
   
   //console.log ( data.urls );
   //console.log ( this.HexToRGB ( '#ff0000' ));
   
   return data;
};





