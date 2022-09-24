window.onload = (event) => {

    const buttonStart = document.getElementById('button_start');
    const buttonStop = document.getElementById('button_stop');

    // とりあえず音声ファイルの長さは5秒で統一
    const audioLengthSeconds = 5;

    let micRecorder = new Tone.Recorder();
    let explotionRecorder = new Tone.Recorder();
    let mic = null;

    buttonStart.onclick = function () {
        Tone.context.resume();

        // マイク権限のリクエスト
        mic = new Tone.UserMedia();

        // 録音データの流し先
        mic.connect(micRecorder);

        // 録音開始
        mic.open().then(() => {
            micRecorder.start().then(() => {
                console.log("recording....");
            });
        });
    }

    buttonStop.onclick = function () {
        Tone.context.resume();

        if (mic != null) {
            mic.close();

            // 録音を停止して爆音処理をする
            micRecorder.stop().then((blob) => {
                Tone.Offline(() => {
                    const blobUrl = URL.createObjectURL(blob);
                    const player = new Tone.Player(blobUrl);
                    player.connect(explotionRecorder);

                    player.onload = function () {
                        explotionRecorder.start().then(() => {
                            // 音声ファイルが指定の秒数になるように再生速度を調整する
                            // 何倍速 = 音声の長さ / 指定の秒数
                            const playbackRate = player.sampleTime / audioLengthSeconds;

                            // 音量をめちゃくちゃ上げる
                            const upGainNode = new Tone.Gain({ gain: 1024, convert: true });
                            // (倍速速度 + 1) * -12 くらいがちょうどいい
                            const pitchDownNode = new Tone.PitchShift({ pitch: -12 * playbackRate + 1.0, wet: 1.0 });
                            const reverbNode = new Tone.Reverb();
                            // スピーカーが壊れないようにリミッターをかませる
                            const limiterNode = new Tone.Limiter(-10.0);

                            player.connect(upGainNode);
                            upGainNode.connect(pitchDownNode);
                            pitchDownNode.connect(reverbNode);
                            reverbNode.connect(limiterNode);
                            limiterNode.toDestination();

                            player.start();
                        });
                    }
                    // リバーブがあるので+2秒くらい
                }, audioLengthSeconds + 2).then((buffer) => {
                    const player = new Tone.Convolver(buffer, () => {
                        player.toDestination();
                    });
                    player.autostart = true;
                    // const url = URL.createObjectURL(blob);
                    // const anchor = document.createElement("a");
                    // anchor.download = "recording.webm";
                    // anchor.href = url;
                    // anchor.click();

                });
            });
        }
    }
}
