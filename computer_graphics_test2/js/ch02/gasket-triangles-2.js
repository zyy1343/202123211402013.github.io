"use strict";

const { vec3 } = glMatrix;

var canvas;
var gl;

var points = [];
var t;
var numTimesToSubdivide;

function initTriangles_2(){

	points=[];
	canvas = document.getElementById( "gl-canvas" );
	var n = parseInt(document.getElementById("layer_2").value);
    if (n) {
        numTimesToSubdivide = n;
    }
    else{
        numTimesToSubdivide = 0;
    }
	gl = WebGLUtils.setupWebGL( canvas );

	if( !gl ){
		alert( "WebGL isn't available" );
	}

	var vertices = [
		-1, -1, 0,
		 0,  1, 0,
		 1, -1, 0
	];

	var u = vec3.fromValues( vertices[0], vertices[1], vertices[2] );
	var v = vec3.fromValues( vertices[3], vertices[4], vertices[5] );
	var w = vec3.fromValues( vertices[6], vertices[7], vertices[8] );

	divideTriangle( u, v, w, numTimesToSubdivide );
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	renderTriangles();
};

function triangle( a, b, c ){
	points.push( a[0], a[1], a[2] );
	points.push( b[0], b[1], b[2] );
	points.push( b[0], b[1], b[2] );
	points.push( c[0], c[1], c[2] );
	points.push( a[0], a[1], a[2] );
	points.push( c[0], c[1], c[2] );
}


function divideTriangle( a, b, c, count ){
	if( count == 0 ){
		triangle( a, b, c );
	}else{
		var ab = vec3.create();
		vec3.lerp( ab, a, b, 0.5 );
		var bc = vec3.create();
		vec3.lerp( bc, b, c, 0.5 );
		var ca = vec3.create();
		vec3.lerp( ca, c, a, 0.5 );
		--count;
		divideTriangle( ab, bc, ca, count );
		divideTriangle( a, ab, ca, count );
		divideTriangle( b, bc, ab, count );
		divideTriangle( c, ca, bc, count );
	}
}
// function start() {
// 	t = setInterval(circle,1000);
// }
// function circle() {
// 	document.getElementById("weihe").value = ((parseInt(document.getElementById("weihe").value)+1)%8).toString();
// 	initTriangles();
// }
function submit_2() {
    // clearInterval(t);
	initTriangles_2();
}
function renderTriangles(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( gl.LINES, 0, points.length/2 );
}