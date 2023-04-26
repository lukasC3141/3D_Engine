// canvas setup
const canvas = document.getElementById("IDcanvas")
const ctx = canvas.getContext("2d")
canvas.height = window.innerHeight
canvas.width = window.innerWidth

// fill one pixel in triangle
const FillPoint = (x, y) => {
    ctx.fillStyle = "blue";
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, Math.PI * 2)
    return (
        ctx.fill()
    )
}

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
const Triangle = (x0, y0, x1, y1, x2, y2, dp) => {

    // set value to cyan and lightFactor with input of 0 the darkest and 1 the lightest
    let r = 90
    let g = 229
    let b = 255
    r *= dp
    g *= dp
    b *= dp
    // drawing the triangles
    ctx.fillStyle = `rgb( ${r},${g},${b})`
    ctx.beginPath()
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 ,y1);
    ctx.lineTo(x2, y2)
    ctx.fill()

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

class Vec3 {
    constructor(){
        this.three = {x: 0, y: 0, z: 0}
        this.threeO = [0,0,0]
        this.two = {x: 0, y: 0}
    }
}

// camera
let camera = new Vec3().three

// cross product is normal, line1 and line2 are vectors, in_triangle is for displaying pixels, light_direction is light
let line1 = new Vec3().three
let line2 = new Vec3().three
let line3 = new Vec3().three
let normal = new Vec3().three
let in_triangle = new Vec3().two

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

// matrixes for 
let matrixRotZ = new Matrix().mat
let matrixRotX = new Matrix().mat


// check if pixel is inside triangle
const Edge_cross = (v1, v2, p) => {
    let ab = [v2.x - v1.x, v2.y - v1.y]
    let ap = [p.x - v1.x, p.y - v1.y]
    return ab[0] * ap[1] - ab[1] * ap[0]
}


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
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.clearRect(0,0,canvas.width, canvas.height)

    let dt = new Date()
    tim = dt.getTime() / 1800
    let ftheta = 0
    ftheta += tim
    
    // rotation Z
    matrixRotZ[0][0] = Math.cos(ftheta)
    matrixRotZ[0][1] = Math.sin(ftheta)
    matrixRotZ[1][0] = -Math.sin(ftheta)
    matrixRotZ[1][1] = Math.cos(ftheta)
    matrixRotZ[2][2] = 1
    matrixRotZ[3][3] = 1
    
    // rotation X
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
        
        // 2 vectors for cross product that is named normal
        line1.x = triTranslated[0].x - triTranslated[1].x
        line1.y = triTranslated[0].y - triTranslated[1].y
        line1.z = triTranslated[0].z - triTranslated[1].z

        line2.x = triTranslated[1].x - triTranslated[2].x
        line2.y = triTranslated[1].y - triTranslated[2].y
        line2.z = triTranslated[1].z - triTranslated[2].z

        normal.x = line1.y * line2.z - line2.y * line1.z
        normal.y = line1.z * line2.x - line2.z * line1.x
        normal.z = line1.x * line2.y - line2.x * line1.y

        // normalizing normals
        let l = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
        normal.x /= l; normal.y /= l; normal.z /= l;
    
        //if the side should be displayed, calculated by the dot product
        if ((normal.x * (triTranslated[0].x - camera.x) + 
                normal.y * (triTranslated[0].y - camera.y) + 
                normal.z * (triTranslated[0].z - camera.z)) < 0)
        {   
            //light and normalizing light
            let light_direction = {x: 0, y: 0, z: -1}
            let nmlz = Math.sqrt(light_direction.x * light_direction.x + 
                                light_direction.y * light_direction.y + 
                                light_direction.z * light_direction.z)
            light_direction.x /= nmlz; light_direction.y /= nmlz; light_direction.z /= nmlz;

            // calkulating the dot product of light
            let dp = light_direction.x * normal.x + light_direction.y * normal.y + light_direction.z * normal.z
            
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


            //filling those triangles with blue color, because of low code quality done by ctx
            /*
            // finding max and min of x and y for filling triangles
            let max_x = Math.round(Math.max(triangleVertices.x, triangleVertices2.x, triangleVertices3.x))
            let max_y = Math.round(Math.max(triangleVertices.y, triangleVertices2.y, triangleVertices3.y))
            let min_x = Math.round(Math.min(triangleVertices.x, triangleVertices2.x, triangleVertices3.x))
            let min_y = Math.round(Math.min(triangleVertices.y, triangleVertices2.y, triangleVertices3.y))

            // for loop for finding pixels in the triangle
            for (let j = min_y; j < max_y; j ++) {
                for (let i = min_x; i < max_x; i ++) {
                    in_triangle.x = i
                    in_triangle.y = j

                    //check by cross product if pixel is in triangle
                    let w0 = Edge_cross(triangleVertices, triangleVertices2, in_triangle)
                    let w1 = Edge_cross(triangleVertices2, triangleVertices3, in_triangle)
                    let w2 = Edge_cross(triangleVertices3, triangleVertices, in_triangle)
                    

                    // let w0 =  line1.x * (triangleVertices.y - in_triangle.y)
                    // let w1 =  line1.y * (triangleVertices.x - in_triangle.x)
                    if (w0 <= 0 && w1 <= 0 && w2 <= 0) {
                        FillPoint(in_triangle.x, in_triangle.y)
                    }
                }
            } */

            // draw just point onto screen of vertices
            Vertices(triangleVertices.x, triangleVertices.y)
            Vertices(triangleVertices2.x, triangleVertices2.y)
            Vertices(triangleVertices3.x, triangleVertices3.y)
        
            Triangle(triangleVertices.x, triangleVertices.y, triangleVertices2.x, triangleVertices2.y, triangleVertices3.x, triangleVertices3.y, dp)
        }}
}



setInterval(Update, 1)
