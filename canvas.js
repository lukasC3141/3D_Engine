// canvas setup
const canvas = document.getElementById("IDcanvas")
const ctx = canvas.getContext("2d")
canvas.height = window.innerHeight
canvas.width = window.innerWidth

// create a vertices (points) of the triangles or cube
const Vertices = (x, y) => {
    ctx.fillStyle = "red";
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    return (
        ctx.fill()
    )
}

// create line of triangle
const Line = (x1, y1, x2, y2) => {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 ,y2);
    ctx.stroke()
}

// create lines of the triangles 
const Triangle = (x0, y0, x1, y1, x2, y2) => {

    ctx.beginPath()
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 ,y1);
    ctx.stroke()
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 ,y2);
    ctx.stroke()

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x0 ,y0);
    ctx.stroke()

}

// create vertices in real 3D space
class OrigVertices {
    constructor(){
        this.ver = [
            //south
            [[0,0,0], [0,1,0], [1,1,0]],
            [[0,0,0], [1,1,0], [1,0,0]],
            //east
            [[1,0,0], [1,1,0], [1,1,1]],
            [[1,0,0], [1,1,1], [1,0,1]],
            //north
            [[1,0,1], [1,1,1], [0,1,1]],
            [[1,0,1], [0,1,1], [0,0,1]],
            //west
            [[0,0,1], [0,1,1], [0,1,0]],
            [[0,0,1], [0,1,0], [0,0,0]],
            //top
            [[0,1,0], [0,1,1], [1,1,1]],
            [[0,1,0], [1,1,1], [1,1,0]],
            //bottom
            [[0,0,1], [1,0,0], [1,0,1]],
            [[0,0,1], [0,0,0], [1,0,0]]
        ]
    }
}
const originalVertices = new OrigVertices().ver

// constants
const aspectRatio = window.innerHeight/window.innerWidth
const FOV = Math.PI / 2
const fFovRad = 1 / Math.tan(FOV / 2)
const ZNear = 0.1
const ZFar = 1000
const d = new Date()


// matrix projection
// matrix class and mat method with array in it
class Matrix {
    constructor(){
        this.mat = [[0, 0, 0, 0],[0, 0, 0, 0], [0, 0, 0, 0],[0, 0, 0, 0]]
    }
}
let matrixProj = new Matrix().mat
matrixProj[0][0] = aspectRatio * fFovRad
matrixProj[1][1] = fFovRad
matrixProj[2][2] = ZFar / (ZFar - ZNear)
matrixProj[3][2] = (-ZFar * ZNear) / (ZFar - ZNear)
matrixProj[2][3] = 1.0
matrixProj[3][3] = 0




// function for matrix projection, orv = original vertices; mp = matrix projection
// defines position of vertices; input - oficial vertices from real 3d world,
// output - position of veritces in 2d canvas in object with x, y, z
const Matrix4 = (orv, mp) => {
    let vec3 = {x: 0, y: 0, z: 0};
    vec3.x = orv[0] * mp[0][0] + orv[1] * mp[1][0] + orv[2] * mp[2][0] + mp[3][0];
    vec3.y = orv[0] * mp[0][1] + orv[1] * mp[1][1] + orv[2] * mp[2][1] + mp[3][1];
    vec3.z = orv[0] * mp[0][2] + orv[1] * mp[1][2] + orv[2] * mp[2][2] + mp[3][2];
    let w = orv[0] * mp[0][3] + orv[1] * mp[1][3] + orv[2] * mp[2][3] + mp[3][3];

    if (w != 0) {
        vec3.x /= w;
        vec3.y /= w; 
        vec3.z /= w; 
    }

    return vec3 
}
// type with object input x, y, z
const Matrix4Object = (orv, mp) => {
    let vec3 = {x: 0, y: 0, z: 0};
    vec3.x = orv.x * mp[0][0] + orv.y * mp[1][0] + orv.z * mp[2][0] + mp[3][0];
    vec3.y = orv.x * mp[0][1] + orv.y * mp[1][1] + orv.z * mp[2][1] + mp[3][1];
    vec3.z = orv.x * mp[0][2] + orv.y * mp[1][2] + orv.z * mp[2][2] + mp[3][2];
    let w = orv.x * mp[0][3] + orv.y * mp[1][3] + orv.z * mp[2][3] + mp[3][3];

    if (w != 0) {
        vec3.x /= w;
        vec3.y /= w; 
        vec3.z /= w; 
    }

    return vec3 
}

function Update() {
    ctx.clearRect(0,0,canvas.width, canvas.height)

    let dt = new Date()
    tim = dt.getTime() / 1800
    let ftheta = 0
    ftheta += tim
    console.log(tim)
    
    // rotation Z
    let matrixRotZ = new Matrix().mat
    matrixRotZ[0][0] = Math.cos(ftheta)
    matrixRotZ[0][1] = Math.sin(ftheta)
    matrixRotZ[1][0] = -Math.sin(ftheta)
    matrixRotZ[1][1] = Math.cos(ftheta)
    matrixRotZ[2][2] = 1
    matrixRotZ[3][3] = 1
    
    // rotation X
    let matrixRotX = new Matrix().mat
    matrixRotX[0][0] = 1
    matrixRotX[1][1] = Math.cos(ftheta * 0.5)
    matrixRotX[1][2] = Math.sin(ftheta  * 0.5)
    matrixRotX[2][1] = -Math.sin(ftheta  * 0.5)
    matrixRotX[2][2] = Math.cos(ftheta  * 0.5)
    matrixRotX[3][3] = 1
    // for loop for all vertices of triangles in origVertices
    // tri is list of three position lists of each vertice
    for (tri of originalVertices) {
        
        triRotatedZ0 = Matrix4(tri[0], matrixRotZ)
        triRotatedZ1 = Matrix4(tri[1], matrixRotZ)
        triRotatedZ2 = Matrix4(tri[2], matrixRotZ)
    
        triRotatedZX0 = Matrix4Object(triRotatedZ0, matrixRotX)
        triRotatedZX1 = Matrix4Object(triRotatedZ1, matrixRotX)
        triRotatedZX2 = Matrix4Object(triRotatedZ2, matrixRotX)
    
        // translation (posun) of vertices in new variable triTranslated
        let triTranslated = [triRotatedZX0, triRotatedZX1, triRotatedZX2]
        triTranslated[0].z = triRotatedZX0.z + 3
        triTranslated[1].z = triRotatedZX1.z + 3
        triTranslated[2].z = triRotatedZX2.z + 3
        
        // triTranslated[0][1] = tri[0][1] - 1.2
        // triTranslated[1][1] = tri[1][1] - 1.2
        // triTranslated[2][1] = tri[2][1] - 1.2
    
        // triTranslated[0][0] = tri[0][0] + 1
        // triTranslated[1][0] = tri[1][0] + 1
        // triTranslated[2][0] = tri[2][0] + 1
    
        let triangleVertices = Matrix4Object(triTranslated[0], matrixProj)
        let triangleVertices2 = Matrix4Object(triTranslated[1], matrixProj)
        let triangleVertices3 = Matrix4Object(triTranslated[2], matrixProj)
    
        // scale into view
        // make position of verices between 0 and 2
        triangleVertices.x += 1;
        triangleVertices.y += 1;
        triangleVertices2.x += 1;
        triangleVertices2.y += 1;
        triangleVertices3.x += 1;
        triangleVertices3.y += 1;
    
        // make that position of vertices in the center of screen
        triangleVertices.x *= 0.5 * window.innerWidth;
        triangleVertices.y *= 0.5 * window.innerHeight;
        triangleVertices2.x *= 0.5 * window.innerWidth;
        triangleVertices2.y *= 0.5 * window.innerHeight;
        triangleVertices3.x *= 0.5 * window.innerWidth;
        triangleVertices3.y *= 0.5 * window.innerHeight;
    
        // draw just point onto screen of vertices
        Vertices(triangleVertices.x, triangleVertices.y)
        Vertices(triangleVertices2.x, triangleVertices2.y)
        Vertices(triangleVertices3.x, triangleVertices3.y)
    
        Triangle(triangleVertices.x, triangleVertices.y, triangleVertices2.x, triangleVertices2.y, triangleVertices3.x, triangleVertices3.y)
    
        // console.log whole triangle vertices in javascript list
        let triangle = [triangleVertices, triangleVertices2, triangleVertices3]
    }
}



setInterval(Update, 1)
