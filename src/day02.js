import {fetchInputData} from "./libraries.js";

const year = 2025
const day = 2;

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

let part1 = 0
let part2 = 0

let input = file.trim().split(",").map(b => {
    let split = b.split("-");
    return split.map(x => parseInt(x));
})

function isPart1(range1) {
    let st = "" + range1
    let r=/^(.+)\1$/
    return !r.test(st)
}

function isPart2(range1) {
    let st = "" + range1
    let r=/^(.+)\1+$/
    return !r.test(st)
}

for (const range of input) {
    for (let i = range[0]; i <= range[1]; i++) {
        if (!isPart1(i)) {
            // console.log("Not part1: " + i)
            part1 += i
        }
        if (!isPart2(i)) {
            // console.log("Not part2: " + i)
            part2 += i
        }
    }
}

console.log("Part 1 " + part1)
console.log("Part 2 " + part2)