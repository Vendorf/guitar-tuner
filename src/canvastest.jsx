
// this piece of shit doesn't really run properly lmao bc i think if rerender then shits self
// but i think can just move out to top level and be okay
// really what wanna do is graph both this and the time domain and see what's up
// and then can try to do the autocorrelation myself
// i just don't know why pitchy uses it's own fft when this fft data is available

// i mean lowkey who really cares it's working better w the higher sample rate now and
// maybe if i play with the min/max decibels in the analyzer + the min/maxes in the pitchdetector
// then i can get an even better result, + all the stickiness stuff
// think I should do that first before I write my own autocorrelator

// but ig next should be to draw the two waveforms on the canvas to learn how canvas works
// then i can compute cents and draw the little graph thing on a canvas too
// then can work on the stickiness stuff and deciding that a string is 'tuned'
// then fill in the other things:
  // chart w all notes
  // adjustment for A4/selecting the basis note
  // selector for tuning types
  // svg for tuning chart
  // and then finally can think about rewriting the autocorrelator lol
import scale from './assets/scale.m4a'
import hz1000 from './assets/hz1000.wav'
import sweep from './assets/sweep.wav'

const audioCtx = new AudioContext();

// Create audio source
// Here, we use an audio file, but this could also be e.g. microphone input
const audioEle = new Audio();
// audioEle.src = sweep //hz1000 //scale
audioEle.src = scale
audioEle.autoplay = true; 
audioEle.preload = "auto";  
const audioSourceNode = audioCtx.createMediaElementSource(audioEle);

console.log(audioEle, audioSourceNode)

// Create analyser node
const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 8192;
const bufferLength = analyserNode.frequencyBinCount;
const dataArray = new Float32Array(bufferLength);

// Set up audio node network
audioSourceNode.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

// Create 2D canvas
const canvas = document.createElement("canvas");
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const canvasCtx = canvas.getContext("2d");
canvasCtx.clearRect(0, 0, canvas.width, canvas.height);


function draw() {
  requestAnimationFrame(draw);
  // analyserNode.getByteTimeDomainData(dataArray);
  analyserNode.getFloatTimeDomainData(dataArray); 
  // Fill solid color
  canvasCtx.fillStyle = "rgb(200 200 200)";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  // Begin the path
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "rgb(0 0 0)";
  canvasCtx.beginPath();
  // Draw each point in the waveform
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    // const v = dataArray[i] / 128.0;
    const v = dataArray[i];
    const y = (v + 1) * (canvas.height / 2);

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  // Finish the line
  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

// function draw() {
//   // Schedule next redraw
//   requestAnimationFrame(draw);

//   // Get spectrum data
//   analyserNode.getFloatFrequencyData(dataArray);
//   // analyserNode.getFloatTimeDomainData(dataArray);

//   // Draw black background
//   canvasCtx.fillStyle = "rgb(0 0 0)";
//   canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

//   // Draw spectrum
//   const barWidth = (canvas.width / bufferLength) * 2.5;
//   let posX = 0;
//   for (let i = 0; i < bufferLength; i++) {
//     const barHeight = (dataArray[i] + 140) * 4;
//     canvasCtx.fillStyle = `rgb(${Math.floor(barHeight + 100)} 50 50)`;
//     canvasCtx.fillRect(
//       posX,
//       canvas.height - barHeight / 2,
//       barWidth,
//       barHeight / 2,
//     );
//     posX += barWidth + 1;
//   }
// }

draw();

export default audioEle 

