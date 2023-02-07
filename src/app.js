'use strict';
const sharp = require('sharp');

let captureTool, isCapturing = true;

window.onload = () => {
    startCaptuer();
}

const toggleCaptureBtn = document.querySelector("#toggleCaptureBtn");

const toggleCapture = () => {
    if (!isCapturing) {
        startCaptuer();
    } else {
        stopCapture();
    }
}

toggleCaptureBtn.addEventListener('click', toggleCapture);

const startCaptuer = () => {
    toggleCaptureBtn.innerHTML = "Stop";
    isCapturing = true;
    captureTool = setInterval(() => captureScreen(), 2000);
}

const stopCapture = () => {
    toggleCaptureBtn.innerHTML = "Start";
    isCapturing = false
    clearInterval(captureTool);
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

            // Resize the file
            sharp(buffer)
                .resize(800, 600)
                .toFile(`assets/${Date.now()}.jpeg`, (err, info) => {
                    console.log(info);
                });

        })
        .catch(error => {
            alert(JSON.stringify(error, null, 2));
        });
}
