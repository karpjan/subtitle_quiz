import {MAX_HISTORY} from "./const";

const DECAY_FACTOR = 0.3
// const DECAY_FACTOR = 0.1
const maxFactor = (Math.pow(DECAY_FACTOR, MAX_HISTORY) - 1)/(DECAY_FACTOR - 1)
// const FREQUENCY_UNLEARNED_TO_LEARNED = 25
const FREQUENCY_UNLEARNED_TO_LEARNED = 200
const INCLUDE_LEARNED_WORDS = false

function resultAt(result, i){
    if (i >= result.length) return undefined
    if (i >= 0) return result.charAt(i)
    if (-i > result.length) return undefined
    return result.charAt(result.length + i)
}

export function learnedFactor(result) {
    let total = 0;
    let factor = 1;
    [...Array(MAX_HISTORY).keys()].forEach(i => {
        const r = resultAt(result, -(i+1))
        let value: number
        if (r === undefined) {
            value = 0
        } else if (r === '1') {
            value = 1
        } else if (r === '0') {
            value = -1
        } else {
            throw new Error(`Unknown value ${r} in result: ${result}`)
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
            console.log(`${cumWeights[i - 1]} to ${cumWeights[i]} / ${cumWeights[cumWeights.length - 1]} = ${(cumWeights[i] - cumWeights[i - 1]) / cumWeights[cumWeights.length - 1]}`);
            return i
        }
    throw new Error()
}
