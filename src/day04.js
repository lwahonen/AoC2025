import {countChars, fetchInputData} from "./libraries.js";

const year = 2025
const day = 4;

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

let input=file.trim().split("\n").map(b=>b.trim().split(""))

function getAt(input, x, y) {
    if(y<0 || y>=input.length)
        return ".";
    if(x<0 || x>=input[y].length)
        return ".";
    return input[y][x]
}

for (let x = 0; x < input.length; x++) {
    for (let y = 0; y < input[x].length; y++) {
        let current = getAt(input, x, y)
        let adjacent = ""
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if(dx==0 && dy==0)
                    continue;
                adjacent+=getAt(input, x+dx, y+dy)
            }
        }
        let count = countChars(adjacent, '@');
        if (count <4 && current=='@') {
            part1++
        }
    }
}

console.log(part1)

while(true) {
    let thisround = 0
    for (let x = 0; x < input.length; x++) {
        for (let y = 0; y < input[x].length; y++) {
            let current = getAt(input, x, y)
            let adjacent = ""
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx == 0 && dy == 0)
                        continue;
                    adjacent += getAt(input, x + dx, y + dy)
                }
            }

            let count = countChars(adjacent, '@');
            if (count < 4 && current == '@') {
                thisround++
                part2++
                input[y][x] = '.'
            }
        }
    }
    if (thisround == 0)
        break;
}

console.log(part2)
