import {fetchInputData, findInGrid, keyCount} from "./libraries.js";

const year = 2025
const day = 7;

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

let map = file.trim().split("\n").map(b => b.trim().split(""))
let start=findInGrid(map, 'S')

let activatedSplitters = {}
let tasks=[]
tasks.push(start)
while (tasks.length > 0) {
    let next = tasks.pop()
    let col = next.col;
    for (let row = next.row + 1; row < map.length; row++) {
        let here = map[row][col]
        if (here == '^') {
            // Optimize a little, if this was already activated once, skip
            if (!activatedSplitters.hasOwnProperty(row + "," + col)) {
                activatedSplitters[row + "," + col] = true
                tasks.push({row: row, col: col - 1})
                tasks.push({row: row, col: col + 1})
            }
            break;
        }
    }
}

console.log("Part 1 " + keyCount(activatedSplitters))

let cache = {}
console.log("Total timelines " + countSplits(start.row, start.col))

function countSplits(row, col) {
    let key = "" + row + "," + col;
    if (cache.hasOwnProperty(key)) {
        // console.log("Found cached answer for " + key + " = " + cache[key])
        return cache[key]
    }
    // console.log("Counting splits at " + row + "," + col)
    for (let r = row + 1; r < map.length; r++) {
        let below = map[r][col]
        if (below === '^') {
            let newVar = countSplits(r, col - 1) + countSplits(r, col + 1);
            cache[key] = newVar
            // console.log("At " + row + "," + col + " found " + newVar + " new timelines")
            return newVar
        }
    }
    // console.log("No new timelines at " + row + "," + col)
    return 1;
}

