// const vector1 = {x: 3, y: 5, z: 1}
// const vector2 = {x: 2, y: 2, z: 8}
// const angle = 100

// normalX = vector1.y * vector2.z - vector1.z * vector2.y
// normalY = vector1.z * vector2.x - vector1.x * vector2.z
// normalZ = vector1.x * vector2.y - vector1.y * vector2.x
// normal = {x: normalX, y: normalY, z: normalZ}

// let num1 = 30
// let num2 = 0
// let num3 = 20

// const result = Math.max(num1, num2, num3)
// console.log(result)

let num1min = 0
let num1max = 4
let num2min = 0
let num2max = 5

for (let i = num2min; i < num2max; i ++) {
    for (let j = num1min; j < num1max; j ++) {
        console.log({num1min: j, num1max: num1max, num2min: i, num2max: num2max})
    }
}