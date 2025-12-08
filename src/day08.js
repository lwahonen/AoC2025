import {fetchInputData, keyCount, solveManyMapping} from "./libraries.js";

const year = 2025
const day = 8;

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

let input=file.trim().split("\n").map(b=>b.trim().split(",").map(Number));
let allDists=[]

for (let i = 0; i < input.length-1; i++) {
    let first = input[i]
    for (let j = i + 1; j < input.length; j++) {
        let second = input[j]
        let totalDist = Math.sqrt(Math.pow(first[0] - second[0], 2) + Math.pow(first[1] - second[1], 2) + Math.pow(first[2] - second[2], 2))
        allDists.push({from: second, to: first, dist: totalDist})
    }
}

let distList=allDists.toSorted(function(a, b){ return a.dist-b.dist})
let circuits= []

function arraysEqual(node, from) {
    if(node.length != from.length)
        return false;
    for (let i = 0; i < node.length; i++) {
        if (node[i] !== from[i])
            return false;
    }
    return true
}


function mergeCircuits(circuitA) {
    while (true) {
        let combined = false
        for (let i = 0; i < circuits.length; i++) {
            let circuitB = circuits[i]
            if (Object.is(circuitA, circuitB))
                continue
            for (const nodeA of Object.keys(circuitA)) {
                if (circuitB.hasOwnProperty(nodeA)) {
                    // Combine
                    // console.log("Combining circuits " + JSON.stringify(Object.keys(circuitA)) + " and " + JSON.stringify(Object.keys(circuitB)))
                    for (const node of Object.values(circuitB)) {
                        circuitA[JSON.stringify(node)] = node
                    }
                    circuits.splice(i, 1)
                    combined = true
                    break;
                }
            }
            if (combined)
                break;
        }
        if (!combined)
            break;
    }
}

function connectNext() {
    let nextPair = distList.shift()
    let r = nextPair
    // console.log("\nNext closest pair " + JSON.stringify(nextPair))
    for (let j = 0; j < circuits.length; j++) {
        if (nextPair == null)
            break
        let circuit = circuits[j]
        for (const node of Object.values(circuit)) {
            if (arraysEqual(node, nextPair.from)) {
                circuit[JSON.stringify(nextPair.to)] = nextPair.to
                // console.log("Put it into circuit " + JSON.stringify(Object.keys(circuit)))
                mergeCircuits(circuit)
                nextPair = null
                break;
            }
            if (arraysEqual(node, nextPair.to)) {
                circuit[JSON.stringify(nextPair.from)] = nextPair.from
                // console.log("Put it into circuit " + JSON.stringify(Object.keys(circuit)))
                mergeCircuits(circuit)
                nextPair = null
                break;
            }

        }
    }
    if (nextPair != null) {
        let newCircuit = {}
        newCircuit[JSON.stringify(nextPair.from)] = nextPair.from
        newCircuit[JSON.stringify(nextPair.to)] = nextPair.to
        // console.log("Made a new circuit " + JSON.stringify(Object.keys(newCircuit)))
        circuits.push(newCircuit)
    }
    return r
}

for (let i = 0; i < 1000; i++) {
    connectNext();
}

let ans=circuits.toSorted(function(a, b){ return keyCount(b) - keyCount(a)})

let part1=1
for (let i = 0; i < 3; i++) {
    let part = keyCount(ans[i])
    part1 *= part
}
console.log("Part 1 " + part1)

let p2=null
while (Object.keys(circuits[0]).length < input.length) {
    p2=connectNext();
}
console.log("Part 2 longest distance " + p2.from[0] * p2.to[0])