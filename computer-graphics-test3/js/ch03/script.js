var canvas = document.getElementById('myCanvas');
var gl = canvas.getContext('webgl');

if (!gl) {
    console.log('WebGL不可用');
}

var vsSource = `
    attribute vec2 position;
    uniform vec2 translation;
    uniform float rotation; // 添加旋转uniform变量
    void main() {
        // 先进行平移，再进行旋转
        vec2 rotatedPosition = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation)) * (position + translation);
        gl_Position = vec4(rotatedPosition, 0.0, 1.0);
    }
`;

var fsSource = `
    precision mediump float;
    uniform vec4 color;
    void main() {
        gl_FragColor = color;
    }
`;

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource);
gl.compileShader(fs);

var program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

var vertices = new Float32Array([
    // 火柴人的头
    0.0, 0.2,
    0.0, 0.1,
    -0.05, 0.15,
    0.05, 0.15,
    -0.05, 0.05,
    0.05, 0.05,

    // 火柴人的身体
    0.0, 0.1,
    0.0, -0.1,

    // 火柴人的左手
    -0.1, 0.0,
    -0.2, -0.1,

    // 火柴人的右手
    0.1, 0.0,
    0.2, -0.1,

    // 火柴人的左腿
    0.0, -0.1,
    -0.05, -0.2,

    // 火柴人的右腿
    0.0, -0.1,
    0.05, -0.2,
]);

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

var positionLocation = gl.getAttribLocation(program, 'position');
var colorLocation = gl.getUniformLocation(program, 'color');
var translationLocation = gl.getUniformLocation(program, 'translation');
var rotationLocation = gl.getUniformLocation(program, 'rotation'); // 添加旋转uniform变量

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

var currentColor = [1.0, 0.0, 0.0, 1.0];
var translation = [0.0, 0.0];
var translationSpeed = 0.01;
var rotation = 0.0; // 初始旋转角度
var rotationSpeed = 0.02; // 旋转速度

canvas.addEventListener('click', function(event) {
    currentColor = [Math.random(), Math.random(), Math.random(), 1.0];
});

document.getElementById('moveButton').addEventListener('click', function() {
    // 按钮点击时触发平移
    translation[0] += translationSpeed;
    
    if (translation[0] > 1.0) {
        translation[0] = -1.0;
    }
    
    gl.uniform2fv(translationLocation, translation);
});

document.getElementById('rotateButton').addEventListener('click', function() {
    // 按钮点击时触发旋转
    rotation += rotationSpeed;
    
    // 防止角度过大
    if (rotation > Math.PI * 2) {
        rotation -= Math.PI * 2;
    }
    
    gl.uniform1f(rotationLocation, rotation);
});

// ...

var moveInterval = null; // 用于存储平移操作的间隔句柄
var rotateInterval = null; // 用于存储旋转操作的间隔句柄

document.getElementById('moveButton').addEventListener('click', function() {
    // 点击按钮时触发平移
    translation[0] += translationSpeed;
    
    if (translation[0] > 1.0) {
        translation[0] = -1.0;
    }
    
    gl.uniform2fv(translationLocation, translation);
});

document.getElementById('rotateButton').addEventListener('click', function() {
    // 点击按钮时触发旋转
    rotation += rotationSpeed;
    
    if (rotation > Math.PI * 2) {
        rotation -= Math.PI * 2;
    }
    
    gl.uniform1f(rotationLocation, rotation);
});

document.getElementById('fastMoveButton').addEventListener('mousedown', function() {
    // 长按按钮时触发快速平移
    moveInterval = setInterval(function() {
        translation[0] += translationSpeed * 5; // 快速平移
        if (translation[0] > 1.0) {
            translation[0] = -1.0;
        }
        gl.uniform2fv(translationLocation, translation);
    }, 50); // 间隔50毫秒执行一次平移
});

document.getElementById('fastMoveButton').addEventListener('mouseup', function() {
    // 松开按钮时停止快速平移
    clearInterval(moveInterval);
});

document.getElementById('fastRotateButton').addEventListener('mousedown', function() {
    // 长按按钮时触发快速旋转
    rotateInterval = setInterval(function() {
        rotation += rotationSpeed * 5; // 快速旋转
        if (rotation > Math.PI * 2) {
            rotation -= Math.PI * 2;
        }
        gl.uniform1f(rotationLocation, rotation);
    }, 50); // 间隔50毫秒执行一次旋转
});

document.getElementById('fastRotateButton').addEventListener('mouseup', function() {
    // 松开按钮时停止快速旋转
    clearInterval(rotateInterval);
});

// ...



function draw() {
    gl.clearColor(0.8, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform4fv(colorLocation, currentColor);

    gl.drawArrays(gl.LINES, 0, vertices.length / 2);

    requestAnimationFrame(draw);
}

draw();