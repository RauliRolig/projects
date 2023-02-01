const URL = 'https://teachablemachine.withgoogle.com/models/PYpr85_22/';
let model, webcam, ctx, maxPredictions;
let nopeus = 28; //keskimääräinen nopeus tehdä yksi toisto
let counter = 0;
let totalCounter = 0;
const nimet = [
  'pystypunnerrus',
  'vipunosto',
  'vipunosto_oikea',
  'vipunosto_vasen',
];

async function init() {
  const modelURL = URL + 'model.json';
  const metadataURL = URL + 'metadata.json';

  //ladataan malli ja metadata
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // asetetaan kamera ja kuva
  const size = 500; //Kuvan koko
  const flip = true; // käännetäänkö kamera
  webcam = new tmPose.Webcam(size, size, flip); // kuvan koko ja onko käännetty
  await webcam.setup(); // pyytää pääsyä webbikameraan
  await webcam.play(); //kamera toimintaan
  window.requestAnimationFrame(loop); //"animaatiota" loop funktiolla

  // elementtejä DOMiin
  const canvas = document.getElementById('canvas');
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext('2d'); //käyttää canvasin 2d piirrosta
}

//loop funktio jonka avulla pyöritetään kuvaa ja ennustusta
async function loop(timestamp) {
  webcam.update(); // päivittää kuvaa
  await predict(); //odottaa että voi ennustaa
  window.requestAnimationFrame(loop);
}

/************************* Reset nappi ***********************/

const resetButton = document.getElementById('reset-button');

resetButton.addEventListener('click', function () {
  totalCounter = 0;
  document.getElementById('totalCounter').innerHTML = totalCounter;
}); // Napin painallus nollaa totalCounterin

/*********************** Nopeus input ************************/

const incrementInput = document.getElementById('nopeus');

incrementInput.addEventListener('change', function () {
  nopeus = this.value; //nopeus on sen minkä inputtiin laittaa
});

/**************************** Ennustus ja laskimien toiminta ***************************/

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    if (
      nimet.includes(prediction[i].className) &&
      prediction[i].probability > 0.999 //pitää kuulua nimet taulukkoon ja sen ennuste yli 0.999
    ) {
      counter++; //lisätään counteriin sen aikaa kun on ennuste yli 0.999
      document.getElementById('counter').innerHTML = counter;
      if (counter % nopeus === 0) {
        // kun counterin jaosta nopeudella ei ole yhtään yli niin lisätään totalCounteriin.
        //aina kun counter kasvaa nopeuden verran, niin se lisää yhden toiston
        totalCounter++;
        document.getElementById('totalCounter').innerHTML = totalCounter;
      }
    }
  }
  //piirtää asentoa
  drawPose(pose);
}

/************funktio joka piirtää asentoja ihmisen mukaan *****************/

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // piirtää pisteet ja viivat
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
