import {factorToProbability, learnedFactor, weightedRandom, weightedRandomRange} from "./math";

// const playAudio = document.querySelector(".playAudio") as HTMLButtonElement;
const success = document.querySelector(".success") as HTMLButtonElement;
const failure = document.querySelector(".failure") as HTMLButtonElement;
const learned = document.querySelector(".learned") as HTMLButtonElement;
const recordEnglishWord = document.querySelector(".recordEnglishWord") as HTMLButtonElement;

import dataJson1 from "./subtitle_data/netflix_version1_index0-99.json"
// import dataJson2 from "./subtitle_data/netflix_version1_index100-199.json"
// import dataJson3 from "./subtitle_data/netflix_version1_index200-299.json"
// import dataJson4 from "./subtitle_data/netflix_version1_index300-399.json"
// import dataJson5 from "./subtitle_data/netflix_version1_index400-443.json"
import {MAX_HISTORY} from "./const";

const dataJson = dataJson1
// const dataJson = dataJson1.concat(dataJson2).concat(dataJson3).concat(dataJson4).concat(dataJson5);
const probabilityArray: number[] = [];
[...Array(dataJson.length).keys()].forEach(i => {
  const history = getHistory(i)
  probabilityArray.push(factorToProbability(learnedFactor(history)))
})
console.log(probabilityArray)
// for (let i = 0; i < localStorage.length; i++){
//   console.log(localStorage.key(i))
//   console.log(localStorage.getItem(localStorage.key(i)))
// }

let audio: HTMLAudioElement | undefined = undefined
const lastIs: number[] = JSON.parse(localStorage.getItem("lastIs") || '[]')
const DO_NOT_REPEAT_FOR_IS = 50
let isFailed = false


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
  localStorage.setItem("i", i.toString());
  localStorage.setItem("lastIs", JSON.stringify(lastIs));
}

function getHistory(i: number | undefined = undefined) {
  if (i === undefined) i = getI()
  return localStorage.getItem('history' + i) || ''
}

function setHistory(newHistory: string, i: number | undefined = undefined) {
  if (i === undefined) i = getI()
  while (newHistory.length > MAX_HISTORY) newHistory = newHistory.substring(1)
  localStorage.setItem('history' + i, newHistory);
  probabilityArray[i] = factorToProbability(learnedFactor(newHistory))
}

function getEnglishWord(i: number | undefined = undefined) {
  if (i === undefined) i = getI()
  return localStorage.getItem('englishWord' + i);
}

function setEnglishWord(englishWord: string, i: number | undefined = undefined) {
  if (i === undefined) i = getI()
  localStorage.setItem('englishWord' + i, englishWord);
}

function recordSuccess() {
  console.log('Recording Success')
  setHistory(getHistory() + '1')
}

function recordFailure() {
  console.log('Recording Failure')
  setHistory(getHistory() + '0')
}

function isValidI(i: number) {
  if (dataJson.length <= DO_NOT_REPEAT_FOR_IS) return true
  return lastIs.indexOf(i) === -1

}

function nextCard() {
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
  // console.log(getI());
  return dataJson[getI()];
}


// function currentSubtitle2() {
//   console.log(2);
//   console.log(getI());
//   console.log(dataJson);
//   console.log(dataJson[getI()]);
//   return dataJson[getI()];
// }

function refresh() {
  // console.log(1)
  const subtitle = currentSubtitle();
  // const subtitle = currentSubtitle2();
  // console.log(subtitle);
  (document.getElementById('englishPhrase') as HTMLImageElement).innerHTML = '';
  (document.getElementById('englishWord') as HTMLImageElement).innerHTML = '';
  (document.getElementById('thumbnail') as HTMLImageElement).src = subtitle.thumbnail.dataURL;
  // (document.getElementById('germanWord') as HTMLImageElement).innerHTML = subtitle.learningWord;
  (document.getElementById('germanWord') as HTMLImageElement).innerHTML = `<a href='https://translate.google.com/?sl=de&tl=en&text=${subtitle.learningWord}&op=translate' target="_blank">${subtitle.learningWord}</a>`;
  (document.getElementById('germanPhrase') as HTMLImageElement).innerHTML = subtitle.learningPhrase;
  (document.getElementById('germanPhrase') as HTMLImageElement).onclick = function() {
    play(subtitle);
  };
  (document.getElementById('thumbnail') as HTMLImageElement).title = subtitle.nativePhrase;
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

failure.addEventListener("click", () => {
  if (isFailed) {
    recordFailure()
    nextCard()
    refresh()
  } else {
    isFailed = true
    const subtitle = currentSubtitle();
    (document.getElementById('englishPhrase') as HTMLImageElement).innerHTML = subtitle.nativePhrase;
    const englishWord = getEnglishWord() || '';
    (document.getElementById('englishWord') as HTMLImageElement).innerHTML = englishWord;
    (document.getElementById('englishWord') as HTMLImageElement).innerHTML = `<a href='https://translate.google.com/?sl=en&tl=de&text=${englishWord}&op=translate' target="_blank">${englishWord}</a>`;
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
