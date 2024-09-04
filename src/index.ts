import {factorToProbability, historyValueToEncoding, learnedFactor, weightedRandom, weightedRandomRange} from "./math";

// const playAudio = document.querySelector(".playAudio") as HTMLButtonElement;
const success = document.querySelector(".success") as HTMLButtonElement;
const failure = document.querySelector(".failure") as HTMLButtonElement;
const learned = document.querySelector(".learned") as HTMLButtonElement;
const recordEnglishWord = document.querySelector(".recordEnglishWord") as HTMLButtonElement;
const learnedFraction = document.getElementById("learnedFraction") as HTMLInputElement;

import dataJson1 from "./subtitle_data/netflix_version1_index0-99.json"
import dataJson2 from "./subtitle_data/netflix_version1_index100-199.json"
import dataJson3 from "./subtitle_data/netflix_version1_index200-299.json"
import dataJson4 from "./subtitle_data/netflix_version1_index300-399.json"
import dataJson5 from "./subtitle_data/netflix_version1_index400-499.json"
import dataJson6 from "./subtitle_data/netflix_version1_index500-599.json"
import dataJson7 from "./subtitle_data/netflix_version1_index600-699.json"
import dataJson8 from "./subtitle_data/netflix_version1_index700-799.json"
import dataJson9 from "./subtitle_data/netflix_version1_index800-899.json"
import dataJson10 from "./subtitle_data/netflix_version1_index900-999.json"
import dataJson11 from "./subtitle_data/netflix_version1_index1000-1099.json"
import dataJson12 from "./subtitle_data/netflix_version1_index1100-1162.json"
import {MAX_HISTORY} from "./const";

const dataJson = dataJson1
    .concat(dataJson2)
    .concat(dataJson3)
    .concat(dataJson4)
    .concat(dataJson5)
    .concat(dataJson6)
    .concat(dataJson7)
    .concat(dataJson8)
    .concat(dataJson9)
    .concat(dataJson10)
    .concat(dataJson11)
    .concat(dataJson12)
const probabilityArray: number[] = [];
[...Array(dataJson.length).keys()].forEach(i => {
  const history = getHistory(i)
  probabilityArray.push(factorToProbability(learnedFactor(history)))
})
console.log(probabilityArray)
// const temp = {}
// for (let i = 0; i < localStorage.length; i++){
//   console.log(localStorage.key(i))
//   console.log(localStorage.getItem(localStorage.key(i)))
//   temp[localStorage.key(i)] = localStorage.getItem(localStorage.key(i))
// }
// console.log(JSON.stringify(temp))

// console.log(getHistory())

// code for *PURGING* unneeded data
//
// const allIndices = [...Array(841).keys()]
// const indicesToRemove = allIndices.slice(633)
// for (const i of indicesToRemove) {
//   console.log(i)
//   console.log(dataJson[i].learningPhrase)
//   purgeEnglishWord(i)
//   purgeHistory(i)
// }
// console.log(JSON.stringify(localStorage))

let audio: HTMLAudioElement | undefined = undefined
let currentI = getI()
const lastIs: number[] = JSON.parse(localStorage.getItem("lastIs") || '[]')
const DO_NOT_REPEAT_FOR_IS = 50
let isFailed = false

let lastTime = +new Date()
function timed(decription: string) {
  const newTime = +new Date()
  console.log(`${decription} took ${(newTime - lastTime) / 1000} seconds`)
  lastTime = newTime
}

function play(subtitle) {
  if (audio !== undefined) audio.pause()
  audio = new Audio(subtitle.audioData.dataURL)
  audio.play().then()
}

function randomIntFromInterval(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getI() {
  return +(localStorage.getItem("i") || 0)
}

function setI(i: number) {
  lastIs.push(i)
  while (lastIs.length > DO_NOT_REPEAT_FOR_IS) lastIs.shift()
  // console.log(lastIs)
  currentI = i
  localStorage.setItem("i", i.toString());
  localStorage.setItem("lastIs", JSON.stringify(lastIs));
}

function getHistory(i: number | undefined = undefined) {
  if (i === undefined) i = currentI
  return localStorage.getItem('history' + i) || ''
}

function setHistory(newHistory: string, i: number | undefined = undefined) {
  if (i === undefined) i = currentI
  while (newHistory.length > MAX_HISTORY) newHistory = newHistory.substring(1)
  localStorage.setItem('history' + i, newHistory);
  probabilityArray[i] = factorToProbability(learnedFactor(newHistory))
}

function purgeHistory(i: number) {
  localStorage.removeItem('history' + i);
}

function getEnglishWord(i: number | undefined = undefined) {
  if (i === undefined) i = currentI
  return localStorage.getItem('englishWord' + i);
}

function setEnglishWord(englishWord: string, i: number | undefined = undefined) {
  if (i === undefined) i = currentI
  localStorage.setItem('englishWord' + i, englishWord);
}

function purgeEnglishWord(i: number) {
  localStorage.removeItem('englishWord' + i);
}

function recordSuccess() {
  console.log('Recording Success')
  setHistory(getHistory() + '1')
}

function recordFailure() {
  console.log('Recording Failure')
  setHistory(getHistory() + '0')
}

function recordFraction(value) {
  console.log(`Recording Fraction ${value}`)
  setHistory(getHistory() + historyValueToEncoding(value))
}

function isValidI(i: number) {
  if (dataJson.length <= DO_NOT_REPEAT_FOR_IS) return true
  return lastIs.indexOf(i) === -1

}

function nextCard() {
  console.log(`New history: ${getHistory()}`)
  isFailed = false
  var newI: number
  while (true) {
    newI = weightedRandomRange(probabilityArray);
    console.log(`choosing ${newI} with history ${getHistory(newI)}`);
    if (isValidI(newI)) break;
    console.log(`Already seen ${newI}`)
  }
  while (!isValidI(newI)) newI = weightedRandomRange(probabilityArray)
  setI(newI)
  // setI(randomIntFromInterval(0, dataJson.length-1));
}

function currentSubtitle() {
  // console.log(3);
  // console.log(dataJson);
  // console.log(currentI);
  const i = currentI
  // timed('currentI')
  return dataJson[i];
}


// function currentSubtitle2() {
//   console.log(2);
//   console.log(currentI);
//   console.log(dataJson);
//   console.log(dataJson[currentI]);
//   return dataJson[currentI];
// }

function refresh() {
  // console.log(1)
  const subtitle = currentSubtitle();
  // const subtitle = currentSubtitle2();
  // console.log(subtitle);
  (document.getElementById('englishPhrase') as HTMLImageElement).innerHTML = '';
  (document.getElementById('englishWord') as HTMLImageElement).innerHTML = '';
  (document.getElementById('thumbnail') as HTMLImageElement).src = subtitle.thumbnail.dataURL;
  const imgEl = (document.getElementById('thumbnail') as HTMLImageElement).parentElement!.innerHTML;
  (document.getElementById('thumbnail') as HTMLImageElement).parentElement!.innerHTML = `<a href='https://www.multitran.com/m.exe?ll1=3&ll2=2&s=${subtitle.learningWord}&l2=2' target="_blank">${imgEl}</a>`;
  // (document.getElementById('thumbnail') as HTMLImageElement).title = subtitle.nativePhrase;
  // (document.getElementById('germanWord') as HTMLImageElement).innerHTML = subtitle.learningWord;
  (document.getElementById('germanWord') as HTMLImageElement).innerHTML = `<a href='https://translate.google.com/?sl=de&tl=en&text=${subtitle.learningWord}&op=translate' target="_blank">${subtitle.learningWord}</a>`;
  (document.getElementById('germanPhrase') as HTMLImageElement).innerHTML = subtitle.learningPhrase;
  (document.getElementById('germanPhrase') as HTMLImageElement).onclick = function() {
    play(subtitle);
  };
  learnedFraction.value = 0;
  // console.log(subtitle.learningPhrase)
  play(subtitle)
  // const audio = new Audio(subtitle.audioData.dataURL)
  // audio.play().then()
}
refresh()


// function download(content, fileName, contentType) {
//   var a = document.createElement("a");
//   var file = new Blob([content], {type: contentType});
//   a.href = URL.createObjectURL(file);
//   a.download = fileName;
//   a.click();
// }
// // download({"bla": 1}, 'json.txt', 'text/plain');
// import { readFileSync, writeFile } from 'fs';
//
// // const file = readFileSync('./filename.txt', 'utf-8');
// writeFile('myjsonfile.json', JSON.stringify({'bla': 1}), ()=>{});


// Store
// localStorage.setItem("lastname", "Smith");

// Retrieve
// console.log(localStorage.getItem("lastname"));

// playAudio.addEventListener("click", () => {
//   play(currentSubtitle())
// });

success.addEventListener("click", () => {
  recordSuccess()
  nextCard()
  refresh()
});

function displayCue() {
  // timed('user unfailed choice')
  isFailed = true
  const subtitle = currentSubtitle();
  // timed('getting subtitile');
  (document.getElementById('englishPhrase') as HTMLImageElement).innerHTML = subtitle.nativePhrase;
  const englishWord = getEnglishWord() || '';
  (document.getElementById('englishWord') as HTMLImageElement).innerHTML = englishWord;
  (document.getElementById('englishWord') as HTMLImageElement).innerHTML = `<a href='https://translate.google.com/?sl=en&tl=de&text=${englishWord}&op=translate' target="_blank">${englishWord}</a>`;
  // timed('displayCue')
}

failure.addEventListener("click", () => {
  if (isFailed) {
    recordFailure()
    nextCard()
    refresh()
  } else {
    displayCue()
    learnedFraction.value = 100;
  }
});

learnedFraction.addEventListener("click", () => {
  // timed('user fraction choice')
  const transformedValue = (-learnedFraction.value) / 100
  // timed('transformedValue')
  // console.log(learnedFraction.value)
  // console.log(transformedValue)
  // console.log(historyValueToEncoding(transformedValue))
  // console.log(learnedFactor(historyValueToEncoding(transformedValue)))
  if (isFailed) {
    // timed('user failed choice')
    recordFraction(transformedValue)
    // timed('recordFraction')
    nextCard()
    // timed('nextCard')
    refresh()
    // timed('refresh')
  } else {
    displayCue()
  }
});

learned.addEventListener("click", () => {
  setHistory('1'.repeat(MAX_HISTORY))
  nextCard()
  refresh()
});

recordEnglishWord.addEventListener("click", () => {
  const englishWord = document.getElementById('userEnglishWord')!.value;
  setEnglishWord(englishWord)
  document.getElementById('userEnglishWord')!.value = '';
  if (isFailed) {
    (document.getElementById('englishWord') as HTMLImageElement).innerHTML = englishWord;
    (document.getElementById('englishWord') as HTMLImageElement).innerHTML = `<a href='https://translate.google.com/?sl=en&tl=de&text=${englishWord}&op=translate' target="_blank">${englishWord}</a>`;
  }
});
