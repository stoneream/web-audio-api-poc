const buttonStart = document.getElementById('button_start');
const buttonStop = document.getElementById('button_stop');

let mic = null;

buttonStart.onclick = function () {
    // マイク権限のリクエスト
    mic = new Tone.UserMedia();

    const micFFT = new Tone.FFT();

    mic.connect(micFFT);

    // 録音開始
    mic.open().then(() => {
        console.log("recording....");
    });
}

buttonStop.onclick = function () {
    if (mic != null) {
        mic.close();
    }
}
