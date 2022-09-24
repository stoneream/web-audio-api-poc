window.onload = (event) => {

    const buttonStart = document.getElementById('button_start');
    const buttonStop = document.getElementById('button_stop');

    let recorder = new Tone.Recorder();
    let mic = null;

    buttonStart.onclick = function () {
        Tone.context.resume();

        // マイク権限のリクエスト
        mic = new Tone.UserMedia();

        // 録音データの流し先
        mic.connect(recorder);

        // 録音開始
        mic.open().then(() => {
            recorder.start().then(() => {
                console.log("recording....");
            });
        });
    }

    buttonStop.onclick = function () {
        Tone.context.resume();

        if (mic != null) {
            mic.close();


            // 録音を止めて音声の再生を開始する
            recorder.stop().then((blob) => {
                console.log("record stopped!!");
                const blobUrl = URL.createObjectURL(blob);
                const player = new Tone.Player(blobUrl);
                const rate = 3.0;
                player.playbackRate = 3.0;

                const upGainNode = new Tone.Gain({ gain: 128 * 8, convert: true });
                const pitchDownNode = new Tone.PitchShift({ pitch: -12 * rate, wet: 1.0 });
                const reverbNode = new Tone.Reverb();

                player.connect(upGainNode);
                upGainNode.connect(pitchDownNode);
                pitchDownNode.connect(reverbNode);
                reverbNode.toDestination();

                player.autostart = true;
            });

        }
    }
}
