import {fetchInputData} from "./libraries.js";
import {execSync} from "child_process";

const year = 2025
const day = 10;

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
// file=`[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
// [...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
// [.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

let d = file.trim().split("\n").map(b =>
{
    let leds=b.split("]")[0].replace("[","").trim()
    let rest=b.split("]")[1]
    let buttons=rest.split("{")[0].trim().split(")").map(x=>x.replace("(","").trim()).filter(x=>x.length>0).map(x=>x.split(",").map(Number))
    let costs=rest.split("{")[1].replace("}","").trim().split(",").map(Number)
    return {leds:leds, buttons:buttons, costs:costs}
})

function getStates(stateStr, machine, presses) {
    let states = []
    for (const button of machine.buttons) {
        let newState = ""
        for (let i = 0; i < stateStr.length; i++) {
            if (button.includes(i)) {
                if (stateStr[i] === '#') {
                    newState += '.'
                } else {
                    newState += '#'
                }
            } else {
                newState += stateStr[i]
            }
        }
        states.push(newState)
    }
    return {states: states, presses: presses + 1}
}

function getDots(count) {
    let s = ""
    for (let i = 0; i < count; i++) {
        s += "."
    }
    return s;
}

function getZeros(count) {
    let s = []
    for (let i = 0; i < count; i++) {
        s.push(0)
    }
    return s;
}


let part1 = 0;
for (let mi = 0; mi < d.length; mi++) {
    let machine = d[mi]
    let tasks = [{states: [getDots(machine.leds.length)], presses: 0}]
    let targetState = machine.leds
    let seen = {}
    let done = false
    while (!done && tasks.length > 0) {
        let here = tasks.pop()
        for (const stateStr of here.states) {
            if (!seen.hasOwnProperty(stateStr)) {
                let newStates = getStates(stateStr, machine, here.presses)
                let allStates = newStates.states
                for (let si = 0; si < allStates.length; si++) {
                    let s = allStates[si]
                    if (s === targetState) {
                        // console.log("Part 1 Machine " + (mi + 1) + " in " + newStates.presses + " presses")
                        part1+=newStates.presses;
                        done = true;
                        break;
                    }
                    if (!seen.hasOwnProperty(s)) {
                        // console.log("Machine " + (mi + 1) + " adding state " + s + " after " + newStates.presses + " presses, handled "+stateStr)
                        tasks.push({states: [s], presses: newStates.presses})
                    }
                }
            }
            seen[stateStr] = true
        }
        tasks = tasks.sort((a, b) => b.presses - a.presses)
    }
}

console.log("Part 1 total presses " + part1)

function generateZ3Script(target, buttons) {
    const vecLen = target.length;

    let out = [];
    // Declare button press variables
    for (let i = 0; i < buttons.length; i++) {
        // Non-negative integer variable for each button
        // p{i} represents the number of times button i is pressed
        out.push(`(declare-const p${i} Int)`);
        out.push(`(assert (>= p${i} 0))`);
    }

    // Target constraints
    for (let j = 0; j < vecLen; j++) {
        let sumTerms = buttons
            .map((btn, i) => `(* ${btn[j]} p${i})`)
            .join(" ");

        out.push(`(assert (= (+ ${sumTerms}) ${target[j]}))`);
        // Each LED j must equal target[j] after all button presses
        // Will look like (assert (= (+ (* 1 p0) (* 1 p1) (* 1 p2)) 220))
        // for joltage j, if target is 220 for joltage j
        // and buttons 0,1,2 affect LED j
        // or (assert (= (+ (* 0 p0) (* 1 p1) (* 0 p2)) 13))
        // if only button 1 affects LED j
    }

    out.push("");

    // Minimize total presses
    // Will look like (minimize (+ p0 p1 p2))
    let totalPresses = buttons.map((_, i) => `p${i}`).join(" ");
    out.push(`(minimize (+ ${totalPresses}))`);

    // Solve for me please
    out.push("\n(check-sat)");
    // Get the minimized value as total sum of presses
    // Will look like (minimize (+ p0 p1 p2))
    let buttonString = buttons.map((_, i) => `p${i}`).join(" ")
    // Print the total presses, looks like "(get-value ((+ p0 p1 p2)))"
    out.push("(get-value ((+ " + buttonString + ")))\n");

    return out.join("\n");
}

let part2 = 0;
for (let mi = 0; mi < d.length; mi++) {
    let machine = d[mi]
    let buttons = []
    for (let i = 0; i < machine.buttons.length; i++) {
        let btn = machine.buttons[i]
        let vec = getZeros(machine.leds.length)
        for (const idx of btn) {
            vec[idx] = 1
        }
        buttons.push(vec)
    }
    let script = generateZ3Script(machine.costs, buttons)
    let result = execSync('z3 -in', {input: script, encoding: 'utf-8'})
    console.log("Machine " + (mi + 1) + " Z3 output:" + result)
    let start = ("" + result).lastIndexOf(" ")
    let s = result.substring(start).split(")")[0].trim()
    part2+=parseInt(s)
}
console.log("Part 2 total presses " + part2)