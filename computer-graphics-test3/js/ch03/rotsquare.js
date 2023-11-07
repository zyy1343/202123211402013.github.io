"use strict";

var canvas;
var gl;

var theta = 0.0;
var speed = 0.01;
var thetaLoc;

function initRotSquare(){
	canvas = document.getElementById( "rot-canvas" );
	gl = WebGLUtils.setupWebGL( canvas, "experimental-webgl" );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	var program = initShaders( gl, "rot-v-shader", "rot-f-shader" );
	gl.useProgram( program );
	var vertices = [
		 0,  1,  0,
		-1,  0,  0,
		 1,  0,  0,
		 0, -1,  0
	];
	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	thetaLoc = gl.getUniformLocation( program, "theta" );
	renderSquare();
}
var eps = 0.0000001;
function quick() {
	if(0.4-speed<= eps) return ;
	speed += 0.01;
	var x = speed / 0.4 * 100;
	x += '%';
	$("#jdt").css("width",x);
}
function slow() {
	if(speed <=  eps) return ;
	speed -= 0.01;
	var x = speed / 0.4 * 100;
	x += '%';
	$("#jdt").css("width",x);
}
function renderSquare(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	theta += speed;
	if( theta > 2 * Math.PI )
		theta -= (2 * Math.PI);
	var f;
	var direction = $("#direction").find("option:selected").text();
	if(direction == "正向") f = 1.0;
	else f = -1.0;
	gl.uniform1f( thetaLoc, theta*f );
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);
	window.requestAnimFrame(renderSquare);
}