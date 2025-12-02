import {fetchInputData} from "./libraries.js";

import sync_fetch from "sync-fetch";

const year = 2025
const day = 1;

let file = "";

const isBrowser = () => typeof window !== `undefined`
const isNode = !isBrowser()

if (isNode) {
    file = fetchInputData(year, day);
} else {
    file = sync_fetch(`data/day_${day}.txt`).text();
}

///////////////////////////////////////////////////
// START HERE
///////////////////////////////////////////////////

let f = file.trim().split("\n").map(r => {
    return {dir: r[0], amount: parseInt(r.slice(1))}
})

let pos = 50
let score = 0

for (const turn of f) {
    let steps = 0
    if (turn.dir == "L") {
        pos -= turn.amount
    } else if (turn.dir == "R") {
        pos += turn.amount
    }
    pos = ((pos % 100) + 100) % 100
    if (pos == 0) {
        score++
    }
}
console.log("Part 1 final position: " + pos + " Score: " + score)

pos = 50
score = 0

for (const turn of f) {
    let steps = 0
    if (turn.dir == "L") {
        steps = -1
    } else if (turn.dir == "R") {
        steps = 1
    }
    for (let j = 0; j < turn.amount; j++) {
        pos = pos + steps
        pos = ((pos % 100) + 100) % 100
        if (pos == 0) {
            score++
        }
    }
}
console.log("Part 2 final position: " + pos + " Score: " + score)
