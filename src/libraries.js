import * as fs from "fs";
import sync_fetch from "sync-fetch";
import Logic from "logic-solver";
// import os module
import os from "os";
export const levenshtein = (a, b) => {
    const matrix = Array.from({ length: a.length })
        .map(() => Array.from({ length: b.length })
        .map(() => 0));
    for (let i = 0; i < a.length; i++)
        matrix[i][0] = i;
    for (let i = 0; i < b.length; i++)
        matrix[0][i] = i;
    for (let j = 0; j < b.length; j++)
        for (let i = 0; i < a.length; i++)
            matrix[i][j] = Math.min((i == 0 ? 0 : matrix[i - 1][j]) + 1, (j == 0 ? 0 : matrix[i][j - 1]) + 1, (i == 0 || j == 0 ? 0 : matrix[i - 1][j - 1]) + (a[i] == b[j] ? 0 : 1));
    return matrix[a.length - 1][b.length - 1];
};
export function fetchInputData(year, day) {
    Array.prototype.sortNormal = function(){return this.sort(function(a,b){return a - b})}
    let path1 = os.homedir() + `/Dropbox/advent/${year}/data/day_${year}_${day}.txt`;
    if (fs.existsSync(path1)) {
        const file = fs.readFileSync(path1, 'utf-8');
        return file;
    }
    const cookie = fs.readFileSync(os.homedir() + `/.aoc_cookie`, 'utf-8').trim();
    let cookie1 = `session=${cookie}`;
    let data = sync_fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
        headers: {
            Cookie: cookie1
        }
    }).text();
    fs.writeFileSync(path1, data);
    return data;
}
export function solveManyMapping(potentialValues) {
    let allvalues = new Set();
    for (let [key, value] of Object.entries(potentialValues)) {
        for (let op of value) {
            allvalues.add(value);
        }
    }
    let terms = [];
    for (let [key, value] of Object.entries(potentialValues)) {
        let biglog = `Logic.or(`;
        let bigstack = [];
        for (let op of value) {
            let bool = `${op}=${key}`;
            let log = `Logic.and("${bool}", `;
            let stack = [];
            for (let forbid of Object.keys(potentialValues)) {
                if (forbid != key) {
                    stack.push(`Logic.not("${op}=${forbid}")`);
                }
            }
            log += stack.join(",") + ")";
            bigstack.push(log);
        }
        biglog += bigstack.join(",\n") + ")";
        terms.push(biglog);
    }
    var solver = new Logic.Solver();
    for (let term of terms) {
        let str = "solver.require(" + term + ")";
        eval(str);
    }
    var sol1 = solver.solve();
    let pairs = sol1.getTrueVars();
    let ret = {}
    for (const pair of pairs) {
        let s = pair.split("=")
        ret[s[1]] = s[0]
    }
    return ret
}
export function keyCount(myobj) {
    var count = 0;
    for (let k in myobj)
        if (myobj.hasOwnProperty(k))
            ++count;
    return count;
}

export function countChars(haystack, needle) {
    let count = 0
    for (const c of haystack) {
        if (c == needle) {
            count++
        }
    }
    return count;
}

export function columns(matrix)
{
    let cols=[]
    for (let i = 0; i < matrix[0].length; i++) {
        cols[i]=matrix.map(g=>g[i])
    }
    return cols
}

export function commaSepararatedNumbers(c) {
    return c => c.split(",").map(v => parseInt(v));
}

export function rotate(matrix) {
    let cols = columns(matrix)
    return cols.reverse()
}

export function flip(matrix)
{
    return matrix.reverse()
}

export function permutations(matrix) {
    let now = matrix
    let ret = [now]
    for (let i = 0; i < 4; i++) {
        now = rotate(now)
        ret.push(now)
    }
    now = flip(matrix)
    for (let i = 0; i < 4; i++) {
        now = rotate(now)
        ret.push(now)
    }
    return ret
}

export function filterObject(obj, callback) {
    return Object.fromEntries(Object.entries(obj).
    filter(([key, val]) => callback(val, key)));
}

export function overlappedMatches(original, reg) {
    var inbraces = [], found;
    let s = original
    while (found = reg.exec(s)) {
        inbraces.push(found)
        s = s.substring(found.index + 1)
    }
    return inbraces;
}


export function findInGrid(haystack, needle) {
    for (let row = 0; row < haystack.length; row++) {
        for (let col = 0; col < haystack[row].length; col++) {
            if (haystack[row][col] == needle) {
                return {row: row, col: col};
            }
        }
    }
    return null;
}