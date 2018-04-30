/*
 * See threejs.org for more documentation, libraries and examples.
 * Description: Initialization code for Three JS. scene, camera and renderer are
 * used in different editor objects and should not be renamed as that can cause issues.
 * TODO: Figure out how to pass values in between editor objects.
 */

// Required globals
var scene = new THREE.Scene( );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer( );

// Custom globals
var THREEDObjects = []; /* Array of 3D objects contained within a scene */

renderer.setSize( window.innerWidth, window.innerHeight );
controls = new THREE.OrbitControls(camera, renderer.domElement);

// Handles resizing window, otherwise canvase will not adjust - required.
window.addEventListener( 'resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});