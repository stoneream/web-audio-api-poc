const buttonStart = document.getElementById('button_start');
const buttonStop = document.getElementById('button_stop');

/**
 * @type {MediaRecorder?}
 */
let mediaRecorder = null;

/**
 * @type {Array<Blob>}
 */
let chunks = [];

buttonStart.onclick = function () {
    // マイク権限のリクエスト
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((mediaStream) => {
            mediaRecorder = new MediaRecorder(mediaStream);
            // データが来たら配列に突っ込んでいく
            mediaRecorder.ondataavailable = function (ev) {
                chunks.push(ev.data);
            };
            // 録音を停止したら再生する
            mediaRecorder.onstop = function (ev) {
                const blob = new Blob(chunks);
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audio.play();
            };
            // 録音開始
            mediaRecorder.start();
        });
}

buttonStop.onclick = function () {
    if (mediaRecorder != null) {
        mediaRecorder.stop();
    }
}
