var canvas = document.getElementById('myCanvas');
var gl = canvas.getContext('webgl');

if (!gl) {
    console.log('WebGL不可用');
}

var vsSource = `
    // 顶点着色器代码
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

var fsSource = `
    // 片元着色器代码
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// 编译着色器
function compileShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('编译着色器时出错：', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// 创建着色器程序
function createProgram(gl, vsSource, fsSource) {
    var vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('创建着色器程序时出错：', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// 初始化缓冲区
function initBuffers(gl, positions) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

// 清空画布
function clearCanvas(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// 绘制对象
class DrawableObject {
    constructor(gl, program, color) {
        this.gl = gl;
        this.program = program;
        this.color = color;
        this.positionBuffer = null;
    }

    setColor(color) {
        this.color = color;
    }

    draw() {
        gl.useProgram(this.program);

        var positionLocation = gl.getAttribLocation(this.program, 'a_position');
        var colorLocation = gl.getUniformLocation(this.program, 'u_color');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform4fv(colorLocation, this.color);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.positions.length / 2);
    }
}

// 正方形对象
class Square extends DrawableObject {
    constructor(gl, program, color) {
        super(gl, program, color);
        this.positions = [
            -0.1, -0.1,
            0.1, -0.1,
            0.1, 0.1,
            -0.1, 0.1
        ];
        this.positionBuffer = initBuffers(gl, this.positions);
    }
}

// 正三角形对象
class Triangle extends DrawableObject {
    constructor(gl, program, color) {
        super(gl, program, color);
        this.positions = [
            0.0, 0.15,
            -0.15, -0.15,
            0.15, -0.15
        ];
        this.positionBuffer = initBuffers(gl, this.positions);
        this.scale = 1.0;
        this.scaleDirection = 1;
    }

    draw() {
        super.draw();
        this.scale += this.scaleDirection * 0.005;
        if (this.scale > 2.0 || this.scale < 0.5) {
            this.scaleDirection *= -1;
        }
    }
}

// 圆对象
class Circle extends DrawableObject {
    constructor(gl, program, color, sides) {
        super(gl, program, color);
        this.positions = [];
        this.sides = sides;
        for (var i = 0; i < this.sides; i++) {
            var angle = (i / this.sides) * 2 * Math.PI;
            var x = Math.cos(angle) * 0.1;
            var y = Math.sin(angle) * 0.1;
            this.positions.push(x, y);
        }
        this.positionBuffer = initBuffers(gl, this.positions);
        this.translationX = 0;
        this.translationY = 0;
        this.translationSpeedX = Math.random() * 0.005;
        this.translationSpeedY = Math.random() * 0.005;
    }

    draw() {
        super.draw();
        this.translationX += this.translationSpeedX;
        this.translationY += this.translationSpeedY;
        if (Math.abs(this.translationX) > 1.0 || Math.abs(this.translationY) > 1.0) {
            this.translationX = 0;
            this.translationY = 0;
        }
    }
}

// 立方体对象
class Cube extends DrawableObject {
    constructor(gl, program, color) {
        super(gl, program, color);
        this.positions = [
            // 正面
            -0.1, -0.1,
            0.1, -0.1,
            0.1, 0.1,
            -0.1,0.1
            // 背面
            -0.1, -0.1,
            -0.1, 0.1,
            -0.1, 0.1,
            -0.1, -0.1,
                    
            // 左侧面
            -0.1, -0.1,
            -0.1, -0.1,
            -0.1, 0.1,
            -0.1, 0.1,
                    
            // 右侧面
            0.1, -0.1,
            0.1, -0.1,
            0.1, 0.1,
            0.1, 0.1
];
this.positionBuffer = initBuffers(gl, this.positions);
this.rotationAngle = 0;
this.rotationSpeed = 0.02;
}

draw() {
super.draw();
this.rotationAngle += this.rotationSpeed;
if (this.rotationAngle > Math.PI * 2) {
this.rotationAngle -= Math.PI * 2;
}
}
}

// 初始化WebGL
var program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

// 设置清空颜色
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// 初始化场景中的对象
var objects = [];

// 当前选中的绘制对象
var currentObject = null;

// 当前选中的颜色
var currentColor = [1.0, 0.0, 0.0, 1.0];

// 用于控制圆的边数
var circleSides = 10;

// 清空场景
function clearScene() {
objects = [];
clearCanvas(gl);
}

// 点击正方形按钮时
document.getElementById('squareButton').addEventListener('click', function() {
currentObject = new Square(gl, program, currentColor);
objects.push(currentObject);
});

// 点击正三角形按钮时
document.getElementById('triangleButton').addEventListener('click', function() {
currentObject = new Triangle(gl, program, currentColor);
objects.push(currentObject);
});

// 点击圆按钮时
document.getElementById('circleButton').addEventListener('click', function() {
currentObject = new Circle(gl, program, currentColor, circleSides);
objects.push(currentObject);
});

// 点击立方体按钮时
document.getElementById('cubeButton').addEventListener('click', function() {
currentObject = new Cube(gl, program, currentColor);
objects.push(currentObject);
});

// 清空场景按钮
document.getElementById('clearButton').addEventListener('click', function() {
clearScene();
});

// 颜色选择器
document.getElementById('colorPicker').addEventListener('input', function() {
currentColor = hexToRgb(this.value);
if (currentObject) {
currentObject.setColor(currentColor);
}
});

// 圆边数滑动条
document.getElementById('circleSidesSlider').addEventListener('input', function() {
circleSides = parseInt(this.value);
if (currentObject && currentObject instanceof Circle) {
currentObject.setSides(circleSides);
}
});

// 启动绘制循环
function draw() {
clearCanvas(gl);
objects.forEach(function(object) {
object.draw();
});
requestAnimationFrame(draw);
}
draw();