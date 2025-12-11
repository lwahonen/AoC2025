import {fetchInputData, keyCount} from "./libraries.js";

const year = 2025
const day = 11;

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

let sources = {}

file.trim().split("\n").map(b => {
    let split = b.trim().split(":");
    let f = split[1].trim().split(" ").map(x => x.trim()).filter(x => x.length > 0)
    let from = split[0].trim();
    sources[from] = f
    return {from: from, targets: f}
})

function countPaths(pathMap, from, to, blacklist = [], cache = {}) {
    const cacheKey = from;
    if (cache.hasOwnProperty(cacheKey)) {
        return cache[cacheKey];
    }
    const blacklistSet = new Set(blacklist);
    let count = 0;
    if (!pathMap.hasOwnProperty(from)) {
        return 0;
    }
    for (const target of pathMap[from]) {
        if (blacklistSet.has(target)) {
            continue;
        }
        if (target === to) {
            count++;
        } else {
            count += countPaths(pathMap, target, to, blacklist, cache);
        }
    }
    cache[cacheKey] = count;
    return count;
}

let result = countPaths(sources, "you", "out");
console.log("Part 1 " + result);

let part2 = 0
// First way: Via dac, then fft, then out.
// We know that no path that goes to DAC can visit FFT and vice versa
let dacToFft = countPaths(sources, "dac", "fft");
if (dacToFft > 0) {
    console.log("Paths from dac to fft " + dacToFft);
    let svrToDac = countPaths(sources, "svr", "dac", ["fft"]);
    console.log("Paths from svr to dac " + svrToDac);
    let fftToOut = countPaths(sources, "fft", "out", ["dac"]);
    console.log("Paths from fft to out " + fftToOut);
    part2 += dacToFft * svrToDac * fftToOut;
} else {
    console.log("No paths from DAC to FFT");
}

// Second way: Via fft, then dac, then out. If you ended up in DAC it's a dead end
let fftToDacCount = countPaths(sources,  "fft", "dac");
if (fftToDacCount > 0) {
    console.log("Paths from fft to dac " + fftToDacCount);
    let svrToFft = countPaths(sources, "svr", "fft", ["dac"]);
    console.log("Paths from svr to fft " + svrToFft);
    let dacToOut = countPaths(sources, "dac", "out", ["fft"]);
    console.log("Paths from dac to out " + dacToOut);
    part2 += svrToFft * fftToDacCount * dacToOut;
} else {
    console.log("No paths from FFT to DAC");
}


console.log("Part 2 " + part2);
