'use strict';

const fs = require('fs');
const homeDir = require('os').homedir();
const productName = require('../package.json').productName;

const toggleCaptureBtn = document.querySelector("#toggleCaptureBtn");
const digitalClock = document.querySelector("#digitalClock");
const nameLabel = document.querySelector("#name-label");

let captureTool,
    digitalClockInterval ,
    isCapturing = true,
    trackSeconds = 0;

window.onload = () => {
    console.log(localStorage);
    nameLabel.innerHTML = localStorage.getItem("name");
    renderDigitalClock(trackSeconds);
    startCaptuer();
}


const toggleCapture = () => {
    if (!isCapturing) {
        startCaptuer();
    } else {
        stopCapture();
    }
}

toggleCaptureBtn.addEventListener('click', toggleCapture);

const startCaptuer = () => {
    toggleCaptureBtn.classList.add('active');
    digitalClock.classList.add("active");
    isCapturing = true;
    digitalClockInterval = setInterval(() => {
        renderDigitalClock(trackSeconds);
        trackSeconds ++;
    }, 1000);
    captureTool = setInterval(captureScreen, 2000);
}

const stopCapture = () => {
    toggleCaptureBtn.classList.remove('active');
    digitalClock.classList.remove("active");
    isCapturing = false
    clearInterval(captureTool);
    clearInterval(digitalClockInterval);
}

const captureScreen = () => {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'screen'
            }
        }
    })
        .then(async stream => {

            const track = stream.getVideoTracks()[0];

            // init Image Capture and not Video stream
            const imageCapture = new ImageCapture(track);

            // take first frame only
            const bitmap = await imageCapture.grabFrame();

            // destory video track to prevent more recording / mem leak
            track.stop();

            const canvas = document.getElementById('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d');
            context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
            const image = canvas.toDataURL('image/jpeg', 0.5);

            var regex = /^data:.+\/(.+);base64,(.*)$/;
            var matches = image.match(regex);
            var data = matches[2];
            var buffer = Buffer.from(data, 'base64');

            if (!fs.existsSync(`${homeDir}/Documents/${productName}`)) {
                fs.mkdir(`${homeDir}/Documents/${productName}`, err => {
                    if (err) {
                        console.log(err);
                    }
                });
            }

            fs.writeFile(`${homeDir}/Documents/${productName}/${Date.now()}.jpeg`, buffer, (err) => {
                console.log(info)
            });

        })
        .catch(error => {
            alert(JSON.stringify(error, null, 2));
        });
}

const renderDigitalClock = seconds => {
    var hh, mm, ss;
    hh = parseInt(seconds / 3600);
    mm = parseInt(seconds % 3600 / 60);
    ss = parseInt(seconds % 60);

    hh = hh < 10 ? `0${hh}` : hh;
    mm = mm < 10 ? `0${mm}` : mm;
    ss = ss < 10 ? `0${ss}` : ss;

    digitalClock.innerHTML = `${hh} : ${mm} : ${ss}`;
}
