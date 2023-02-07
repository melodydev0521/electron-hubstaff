'use strict';
const sharp = require('sharp');

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
