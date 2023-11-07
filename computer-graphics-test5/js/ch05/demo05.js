var point;
var ambient;
var mesh;
var OBJLoader;
var MTLLoader;
//基础控制
var width = 1200;
var height = window.innerHeight;
var k = width / height; 
var renderer;
var x = 0;
var spin = 0;
var zoom = 1.0;
var mesh_k;
var lightx = 0;
var lighty = 150;
var lightz = 0;
var shininess = 80;
function getBasic() {
	
	OBJLoader = new THREE.OBJLoader();
	MTLLoader = new THREE.MTLLoader();
	console.log(getLightColor());
	point = new THREE.PointLight(getLightColor());
	point.position.set(lightx,lighty,lightz);//点光源位置
	scene.add(point);
	ambient = new THREE.AmbientLight(0x444444);
	scene.add(ambient);
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setSize(width,height);
	renderer.setClearColor(0xb9d3ff,1);
	$("#main").append(renderer.domElement);
	function animate() {
		requestAnimationFrame( animate );
		if(camera.visible) renderer.render( scene, camera );
		else renderer.render( scene, camera2 );
	};
	animate();
	var controls1 = new THREE.OrbitControls(camera,renderer.domElement);
	var controls2 = new THREE.OrbitControls(camera2,renderer.domElement);
}
//显示obj模型
function showObj() {
	scene.remove(mesh);
	var files = $('#fileInput').prop('files');
	var reader = new FileReader();
	reader.readAsText(files[0]);
	//文件读取完成
	reader.onload = function (event) {
	    var meshdata = reader.result;
		// console.log(meshdata);
		loadOBJ(meshdata);
	}
}

function loadOBJ(meshdata) {
	spin = 0;
	$("#spin").text("旋转：" + spin +' ');
	document.getElementById("spinVal").value = spin;
	mesh = OBJLoader.parse(meshdata);
	setobjcolor()
	var box = new THREE.Box3().setFromObject( mesh );
	var x = box.max.clone().sub(box.min).divideScalar(2);
	mesh_k = 20.0 / x.x;
	var zoom_k = mesh_k * zoom;
	mesh.scale.set(zoom_k,zoom_k,zoom_k);
	scene.add(mesh);
}

function opCamera() {
	camera.visible = false;
	camera2.visible = true;
}

function ppCamera() {
	camera.visible = true;
	camera2.visible = false;
}

function getobjcolor() {
	var color = $("#objcolor").val();
	return (new THREE.Color(color));
}

function setobjcolor() {
	if(mesh == null) return ;
	var x = $("input[name=drawtype]:checked").val();
	var f = (x == 2);
	var color = getobjcolor();
	var material = new THREE.MeshPhongMaterial( {
		color: color,
		specular:0x4488ee,
		shininess: shininess,
		wireframe: f
	});
	mesh.position.x = x;
	mesh.traverse (function (child) {
		if (child instanceof THREE.Mesh) { 
		   child.material = material;
		} 
	}); 
}
			
function movex() {
	x = parseInt($("#xVal").val());
	$("#move_x").text("平移：" + x +' '); 
	if(mesh!=null) mesh.position.x = x;
}
function moveSpin() {	
	var spin1 = parseInt($("#spinVal").val());
	var temp = spin - spin1;
	spin = spin1;
	$("#spin").text("旋转：" + spin +' ');
	if(mesh!=null) mesh.rotateY(Math.PI/20 * temp);
}
function moveZoom() {
	zoom = parseFloat($("#zoomVal").val());
	$("#zoom").text("缩放：" + zoom +' ');
	var zoom_k = mesh_k * zoom;
	if(mesh!=null) mesh.scale.set(zoom_k,zoom_k,zoom_k);
}

function moveLight() {
	lightx = parseFloat($("#lightxVal").val());
	lighty = parseFloat($("#lightyVal").val());
	lightz = parseFloat($("#lightzVal").val());
	$("#lightx").text("X: " + lightx+' ');
	$("#lighty").text("Y: " + lighty+' ');
	$("#lightz").text("Z: " + lightz+' ');
	point.position.set(lightx,lighty,lightz);
}

function getLightColor() {
	var color = $("#lightcolor").val();
	return (new THREE.Color(color));
}

function setLightColor() {
	point.color.set(getLightColor());
}

function setShininess() {
	var a = parseFloat($("#1val").val());
	var b = parseFloat($("#2val").val());
	var c = parseFloat($("#3val").val());
	shininess = parseInt($("#shininessval").val());
	$("#1").text("环境光反射系数: " + a+' ');
	$("#2").text("漫反射系数: " + b+' ');
	$("#3").text("高光反射系数: " + c+' ');
	$("#shiness").text("高光亮度系数: " + shininess+' ');
	setobjcolor();
}