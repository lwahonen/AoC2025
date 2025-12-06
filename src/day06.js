import {columns, fetchInputData} from "./libraries.js";

const year = 2025
const day = 6;

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

let input=file.trim().split("\n").map(b=>b.trim().split(/\s+/g))

// Part 1
let tasks=columns(input)
let part1=0
for (const task of tasks) {
    let op=task[task.length-1]
    let tally=parseInt(task[0])
    if(op == "*") {
        for (let i = 1; i < task.length - 1; i++) {
            tally *= parseInt(task[i])
        }
    }
    if(op == "+") {
        for (let i = 1; i < task.length - 1; i++) {
            tally += parseInt(task[i])
        }
    }
    part1+=tally
}

let matrix = file.split("\n").filter(b=>b.length > 0)
let cols=columns(matrix).map(v=>v.reverse())
let part2=0
let op=""
let tally=0

function parseCep(col) {
    let string = col.slice(1).join("").trim()
    string = [...string].reverse().join("");
    let a = parseInt(string)
    return a;
}

for (const col of cols) {
    let notSpaces = false
    for (const ch of col) {
        if (ch != " ")
            notSpaces = true
    }
    console.log(JSON.stringify(col))
    if (!notSpaces)
        continue;
    // New operation
    if (col[0] != " ") {
        part2 += tally
        op = col[0]
        let num = parseCep(col);
        tally = num
        continue
    }
    if (op == "*") {
        let num = parseCep(col);
        tally *= num
    }
    if (op == "+") {
        let num = parseCep(col);
        tally += num
    }
}
// Last task is left dangling
part2 += tally

console.log(part1)
console.log(part2)