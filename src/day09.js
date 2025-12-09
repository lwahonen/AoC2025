import {columns, fetchInputData} from "./libraries.js";

const year = 2025
const day = 9;

let file = "";

const isBrowser = () => typeof window !== `undefined`
const isNode = !isBrowser()

if (isNode) {
    file = fetchInputData(year, day);
} else {
    const sync_fetch = require('sync-fetch')
    file = sync_fetch(`data/day_${day}.txt`).text();
}

///////////////////////////////////////////////////
// START HERE
///////////////////////////////////////////////////

let input = file.trim().split("\n").map(b => b.trim().split(",").map(Number));

let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;

for (const [x, y] of input) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
}

// In finnish we have this thing called "saumavara"
maxX += 3
maxY += 3
minX -= 3
minY -= 3

let part1 = 0;

for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input.length; j++) {
        if (i == j)
            continue;
        let a = input[i]
        let b = input[j]
        let dy = Math.abs(a[1] - b[1]) + 1
        let dx = Math.abs(a[0] - b[0]) + 1
        let area = dy * dx
        if (area > part1) {
            part1 = area

        }
    }
}

console.log("Part 1 " + part1)

// We have looked at the data and know there are two long horizontal lines
// The box has to be either above or below these lines using the corner of the long line as anchor
let longLines = []

for (let i = 0; i < input.length; i++) {
    let node = input[i]
    let next = input[i + 1 == input.length ? 0 : i + 1]
    if (node[1] == next[1]) {
        let lineLen = Math.abs(node[0] - next[0]) + 1;
        if (lineLen > (maxX - minX) / 2) {
            if(node[0] < next[0])
                longLines.push({from: node, to: next, len: lineLen})
            else
            longLines.push({from: next, to: node, len: lineLen})
        }
    }
}
// Sort long lines by their 'to' point Y coordinate so we know which is top and which is bottom
longLines = longLines.toSorted(function (a, b) {
    return a.to[1] - b.to[1]
})

// Go through polygon and make a map of all X coordinates for each Y scanline
let map = []
for (let i = 0; i < input.length; i++) {
    let point = input[i]
    let second
    if (i < input.length - 1)
        second = input[i + 1]
    else
        second = input[0]
    for (let y = Math.min(point[1], second[1]); y <= Math.max(point[1], second[1]); y++) {
        if (map[y] === undefined)
            map[y] = []
        for (let x = Math.min(point[0], second[0]); x <= Math.max(point[0], second[0]); x++) {
            map[y].push(x)
        }
    }
}

// For each Y, find the min and max X that is inside the polygon
// This would be broken if the polygon had "grooves" from top or bottom, but it doesn't
// Both top and bottom edges are simple jagged lines
// We know the polygon is so simple this gets you valid "inside the polygon" oracle
let ySlices = {}
for (let y = minY; y < maxY; y++) {
    // console.log("Finding slice for y " + y)
    if (map[y] == undefined) {
        ySlices[y] = {start: 0, end: 0}
        continue;
    } else {
        if (ySlices.hasOwnProperty(y)) {
            throw "asdf"
        }
        ySlices[y] = {start: Math.min(...map[y]), end: Math.max(...map[y])}
    }
}

let part2 = 0
function checkSquares(b, legal) {
    for (const a of legal) {
        let dy = Math.abs(a[1] - b[1]) + 1
        let dx = Math.abs(a[0] - b[0]) + 1
        let area = dy * dx
        if (area > part2) {
            // Make sure all four corners of the rectangle are valid
            // Corners are (a[0],a[1]), (a[0],b[1]), (b[0],a[1]), (b[0],b[1])
            let corners = [
                [a[0], a[1]],
                [b[0], a[1]],
                [a[0], b[1]],
                [b[0], b[1]]
            ]
            let valid = true
            for (const corner of corners) {
                let x = corner[0]
                let y = corner[1]
                if (ySlices.hasOwnProperty(y)) {
                    let slice = ySlices[y]
                    if (x < slice.start || x > slice.end) {
                        // console.log("Rect "+JSON.stringify(a)+"  and   "+JSON.stringify(b)+" invalid due to corner "+JSON.stringify(corner)+" hitting slice "+JSON.stringify(slice))
                        valid = false
                        break;
                    }
                }
            }
            if (!valid)
                continue;
            console.log("New max area " + area + " from points " + JSON.stringify(a) + " and " + JSON.stringify(b) + " with dx " + dx + " and dy " + dy)
            part2 = area
        }
    }
}

// Is it top? Then the other corner has to be a node that is above the line
let b=longLines[0].to
let legal = input.filter(n=>n[1] < b[1])
checkSquares(b, legal);

// Is it bottom? Then the other corner has to be a node that is below the line
b=longLines[1].to
legal = input.filter(n=>n[1] > b[1])
checkSquares(b, legal);

console.log("Part 2 " + part2)