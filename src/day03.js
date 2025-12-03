import {fetchInputData, overlappedMatches} from "./libraries.js";
import {regex} from 'regex';

const year = 2025
const day = 3;

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

function findBiggest(into, tail) {
    for (let i = 10 - 1; i >= 0; i--) {
        for (let j = 0; j < into.length - tail; j++) {
            if (into[j] == i)
                return j;
        }
    }
    return -1;
}

function countString(into, count)
{
    let score=0
    for (let i = count-1; i >= 0; i--) {
        let index=findBiggest(into, i)
        if (index==-1)
            break;
        score=score*10+parseInt(into[index])
        into=into.substring(index+1)
    }
    return score
}

let input=file.trim().split("\n").map(b=>b.trim())

let part1 = 0;
let part2 = 0;

for (const inputElement of input) {
    part1 += countString(inputElement,2)
    part2 += countString(inputElement,12)
}

console.log("Part 1 " + part1)
console.log("Part 2 " + part2)
