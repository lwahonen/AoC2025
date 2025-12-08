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

// file=`162,817,812
// 57,618,57
// 906,360,560
// 592,479,940
// 352,342,300
// 466,668,158
// 542,29,236
// 431,825,988
// 739,650,466
// 52,470,668
// 216,146,977
// 819,987,18
// 117,168,530
// 805,96,715
// 346,949,466
// 970,615,88
// 941,993,340
// 862,61,35
// 984,92,344
// 425,690,689`

let input=file.trim().split("\n").map(b=>b.trim().split(",").map(Number));
let closests={}
let allDists=[]

for (let i = 0; i < input.length-1; i++) {
    let first = input[i]
    closests[JSON.stringify(first)] = {}
    for (let j = i + 1; j < input.length; j++) {
        let second = input[j]
        let totalDist = Math.sqrt(Math.pow(first[0] - second[0], 2) + Math.pow(first[1] - second[1], 2) + Math.pow(first[2] - second[2], 2))
        closests[JSON.stringify(first)][JSON.stringify(second)] = {from: first, to: second, dist: totalDist}
        if (!closests.hasOwnProperty(JSON.stringify(second)))
            closests[JSON.stringify(second)] = {}
        closests[JSON.stringify(second)][JSON.stringify(first)] = {from: second, to: first, dist: totalDist}
        allDists.push({from: second, to: first, dist: totalDist})
    }
}

let distList=allDists.toSorted(function(a, b){ return a.dist-b.dist})
let circuits= []

function arraysEqual(node, from) {
    for (let i = 0; i < node.length; i++) {
        if (node[i] !== from[i])
            return false;
    }
    return true
}


function mergeCircuits() {
    while (true) {
        let combined = false
        for (let i = 0; i < circuits.length - 1; i++) {
            let circuitA = circuits[i]
            for (let j = i + 1; j < circuits.length; j++) {
                if (j == i)
                    continue;
                let circuitB = circuits[j]
                for (const nodeA of Object.keys(circuitA)) {
                    for (const nodeB of Object.keys(circuitB)) {
                        if (nodeA === nodeB) {
                            // Combine
                            // console.log("Combining circuits " + JSON.stringify(Object.keys(circuitA)) + " and " + JSON.stringify(Object.keys(circuitB)))
                            for (const node of Object.values(circuitB)) {
                                circuitA[JSON.stringify(node)] = node
                            }
                            circuits[j] = {};
                            combined = true
                            break;
                        }
                    }
                }
                if (combined)
                    break;
            }
            if (combined)
                break;
        }
        if (!combined)
            break;
    }
    circuits = circuits.filter(c => keyCount(c) > 0)
}


function connectNext() {
    let nextPair = distList.shift()
    let r=nextPair
    // console.log("\nNext closest pair " + JSON.stringify(nextPair))
    for (let j = 0; j < circuits.length; j++) {
        if (nextPair == null)
            break
        let circuit = circuits[j]
        for (const node of Object.values(circuit)) {
            if (arraysEqual(node, nextPair.from)) {
                circuit[JSON.stringify(nextPair.to)] = nextPair.to
                // console.log("Put it into circuit " + JSON.stringify(Object.keys(circuit)))
                mergeCircuits()
                nextPair = null
                break;
            }
            if (arraysEqual(node, nextPair.to)) {
                circuit[JSON.stringify(nextPair.from)] = nextPair.from
                // console.log("Put it into circuit " + JSON.stringify(Object.keys(circuit)))
                mergeCircuits()
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
    let part = keyCount(ans[i]);
    part1 *= part
}
console.log("Part 1 " + part1)

let p2=null
while (Object.keys(circuits[0]).length < input.length) {
    p2=connectNext();
}
console.log("Part 2 longest distance " + p2.from[0] * p2.to[0])