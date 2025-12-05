import {fetchInputData, keyCount} from "./libraries.js";

const year = 2025
const day = 5;

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

let part1=0
let part2=0
let input = file.trim().split("\n\n")
let pairs = input[0].trim().split("\n").map(c=> {
    let b=c.split("-")
    return [parseInt(b[0]), parseInt(b[1])]
})
let available=input[1].trim().split("\n").map(c=>parseInt(c))

for (const ingredient of available) {
    for (const pair of pairs) {
        if(ingredient>=pair[0] && ingredient<=pair[1]) {
            part1++
            break;
        }
    }
}


while (true) {
    let added = false
    for (let i = 0; i < pairs.length; i++) {
        for (let j = 0; j < pairs.length; j++) {
            if (i==j)
                continue;
            let first = pairs[i];
            let second = pairs[j];
            // If second range is fully inside first range, throw it away
            if(first[0] <= second[0] && first[1] >= second[1]) {
                pairs.splice(j, 1);
                added = true;
                break
            }
            //If first range reaches into second range from left, trim first range
            if (first[1] >= second[0] && first[0] <= second[0]) {
                first[1] = second[0] - 1
                added = true
                break
            }
        }
    }
    if (!added) {
        break
    }
}
for (const pair of pairs) {
    if(pair[1]<pair[0])
        continue;
    part2 += (pair[1] - pair[0] + 1)
}

console.log("Part 1 " + part1)
console.log("Part 2 " + part2)
