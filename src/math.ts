import {MAX_HISTORY} from "./const";

import Big from "big.js";

// lower factor -> less weight on history, more weight on last observation
const DECAY_FACTOR = 0.3
// const DECAY_FACTOR = 0.1
const maxFactor = (Math.pow(DECAY_FACTOR, MAX_HISTORY) - 1)/(DECAY_FACTOR - 1)
// const FREQUENCY_UNLEARNED_TO_LEARNED = 25
export const FREQUENCY_UNLEARNED_TO_LEARNED = 200
const INCLUDE_LEARNED_WORDS = false
const HISTORY_WEIGHT_ENCODING = 'abcdefghijklmnopqrstuvwx-ABCDEFGHIJKLMNOPQRSTUVWX'
const HISTORY_WEIGHT_VALUES = new Map()
const WEIGHTS: number[] = []
const STEP_WEIGHT = new Big('2').div(new Big(HISTORY_WEIGHT_ENCODING.length + 1))

let weight = new Big(-1)
for (const i of [...Array(HISTORY_WEIGHT_ENCODING.length).keys()]) {
    weight = weight.add(STEP_WEIGHT)
    HISTORY_WEIGHT_VALUES.set(HISTORY_WEIGHT_ENCODING[i], weight.toNumber())
    WEIGHTS.push(weight.toNumber())
    // console.log(`${HISTORY_WEIGHT_ENCODING[i]}: ${weight.toNumber()}`)
}


function resultAt(result, i){
    if (i >= result.length) return undefined
    if (i >= 0) return result.charAt(i)
    if (-i > result.length) return undefined
    return result.charAt(result.length + i)
}

export function historyValueToEncoding(value: number) {
    const halfStep = STEP_WEIGHT.div(new Big(2)).toNumber()
    if (value < WEIGHTS[0] - halfStep) return '0'
    if (value > WEIGHTS[WEIGHTS.length-1] + halfStep) return '1'
    for (const i of [...Array(WEIGHTS.length-1).keys()]) {
        if (value < WEIGHTS[i+1]) return value - WEIGHTS[i] < WEIGHTS[i+1] - value ? HISTORY_WEIGHT_ENCODING[i] : HISTORY_WEIGHT_ENCODING[i+1]
    }
    return HISTORY_WEIGHT_ENCODING[WEIGHTS.length-1]
}

export function learnedFactor(result) {
    // assume you don't know the newly-added word
    const resultToUse = result.length == 0 ? '0' : result;
    let total = 0;
    let factor = 1;
    [...Array(MAX_HISTORY).keys()].forEach(i => {
        const r = resultAt(resultToUse, -(i+1))
        let value: number
        if (r === undefined) {
            value = 0
        } else if (r === '1') {
            value = 1
        } else if (r === '0') {
            value = -1
        } else {
            value = HISTORY_WEIGHT_VALUES.get(r)
        }
        total += factor * value
        factor *= DECAY_FACTOR
    })
    return total / maxFactor
}

export function factorToProbability(factor) {
    const temp = INCLUDE_LEARNED_WORDS ? 1 : 0
    return (FREQUENCY_UNLEARNED_TO_LEARNED - temp) * (-factor+1)/2 + temp
}

export function weightedRandom(items, weights) {
    var i;

    const cumWeights: number[] = [weights[0]]

    for (i = 1; i < weights.length; i++) cumWeights.push(weights[i] + cumWeights[i - 1]);

    var random = Math.random() * cumWeights[cumWeights.length - 1];

    for (i = 0; i < cumWeights.length; i++)
        if (cumWeights[i] > random)
            break;

    return items[i];
}

// same as above, but returns the index from 0 to weights.length-1
export function weightedRandomRange(weights: number[]) {
    var i;
    
    const cumWeights: number[] = [weights[0]]

    for (i = 1; i < weights.length; i++) cumWeights.push(weights[i] + cumWeights[i - 1]);

    const random = Math.random() * cumWeights[cumWeights.length - 1];

    for (i = 0; i < cumWeights.length; i++)
        if (cumWeights[i] > random) {
            // console.log(`${cumWeights[i - 1]} to ${cumWeights[i]} / ${cumWeights[cumWeights.length - 1]} = ${(cumWeights[i] - cumWeights[i - 1]) / cumWeights[cumWeights.length - 1]}`);
            return i
        }
    throw new Error()
}
