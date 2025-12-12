import {columns, fetchInputData, keyCount, overlappedMatches, permutations} from "./libraries.js";

const year = 2025
const day = 12;

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
//
// file=`0:
// ###
// ##.
// ##.
//
// 1:
// ###
// ##.
// .##
//
// 2:
// .##
// ###
// ##.
//
// 3:
// ##.
// ###
// ##.
//
// 4:
// ###
// #..
// ###
//
// 5:
// ###
// .#.
// ###
//
// 4x4: 0 0 0 0 2 0
// 12x5: 1 0 1 0 2 2
// 12x5: 1 0 1 0 3 2`

let gifts={}
let split = file.trim().split("\n\n");
for (let i = 0; i < split.length - 1; i++) {
    let b = split[i]
    let stuff = b.trim().split("\n")
    let gift = stuff.slice(1).map(x => x.trim().split(""))
    let id = Number(stuff[0].split(":")[0].trim())
    gifts[id] = gift
}

let puzzles = split[split.length - 1].trim().split("\n").map(b => {
    let size = b.split(":")[0].trim()
    let dims = size.split("x").map(Number)
    let positions = b.split(":")[1].trim().split(" ").map(Number)
    return {width: dims[0], height: dims[1], positions: positions}
})

console.log("Total puzzles: " + puzzles.length)
let yolo=[];
for (const puzzle of puzzles) {
    let space = puzzle.width * puzzle.height
    let needed = 0
    for (let i = 0; i < puzzle.positions.length; i++) {
        let gift = gifts[i]
        // needed = gift count of #
        let giftCount = 0
        for (let r = 0; r < gift.length; r++) {
            for (let c = 0; c < gift[0].length; c++) {
                if (gift[r][c] === "#")
                    giftCount++
            }
        }
        needed += giftCount * puzzle.positions[i]
    }
    if (needed <= space) {
        yolo.push(puzzle)
    }
}
console.log("Puzzles that might be solvable based on area: " + yolo.length)

let part1 = 0;
let knownFit={}
let skipCount = 0;
for (const puzzle of yolo) {
    let grid = []
    for (let h = 0; h < puzzle.height; h++) {
        let row = []
        for (let w = 0; w < puzzle.width; w++) {
            row.push(".")
        }
        grid.push(row)
    }
    console.log("Puzzle " + JSON.stringify(puzzle))
    let place = []

    for (let i = 0; i < puzzle.positions.length; i++) {
        for (let j = 0; j < puzzle.positions[i]; j++) {
            place.push({id:i, shape:gifts[i]})
        }
    }

    let universe = {}
    universe[JSON.stringify(grid)] = grid
    let placedAll = true;
    for (let p of place) {
        let newUniverses = []
        for (let u of Object.keys(universe)) {
            if(knownFit.hasOwnProperty(p.id + "|" + u)) {
                //console.log("Skipping known unfit universe for gift " + p.id)
                skipCount++
                continue;
            }
            let placements = placeGift(universe[u], p.shape)
            for (let pl of Object.keys(placements)) {
                newUniverses[pl] = placements[pl]
            }
            if (keyCount(placements) === 0) {
                //console.log("No placements for this universe")
                knownFit[p.id + "|" + u] = false
            }
        }
        universe = newUniverses
        console.log("Placed gift, now have " + keyCount(universe) + " universes")
        if (keyCount(universe) === 0) {
            console.log("Puzzle number " + JSON.stringify(puzzle) + " cannot be solved. Used known skips " + skipCount)
            placedAll = false;
            break;
        }
    }
    if (placedAll) {
        console.log("Puzzle number " + JSON.stringify(puzzle) + " can be solved in " + keyCount(universe) + " ways. Used known skips " + skipCount)
        part1 += 1
    }
}

console.log("Part 1 total solvable puzzles " + part1)

function placeGift(grid, g) {
    let possiblePlaces = {}
    let rotations = permutations(g)
    for (let gift of rotations) {
        for (let r = 0; r <= grid.length - gift.length; r++) {
            for (let c = 0; c <= grid[0].length - gift[0].length; c++) {
                let canPlace = true
                for (let gr = 0; gr < gift.length; gr++) {
                    for (let gc = 0; gc < gift[0].length; gc++) {
                        if (gift[gr][gc] === '#') {
                            if (grid[r + gr][c + gc] === '#') {
                                canPlace = false
                                break;
                            }
                        }
                    }
                    if (!canPlace)
                        break;
                }
                if (canPlace) {
                    let placedWorld = JSON.parse(JSON.stringify(grid))
                    // Place it
                    for (let gr = 0; gr < gift.length; gr++) {
                        for (let gc = 0; gc < gift[0].length; gc++) {
                            if (gift[gr][gc] === '#') {
                                placedWorld[r + gr][c + gc] = '#'
                            }
                        }
                    }
                    possiblePlaces[JSON.stringify(placedWorld)]=placedWorld
                }
            }
        }
    }
    return possiblePlaces;
}