window.onload = (event) => {

    const buttonStart = document.getElementById('button_start');
    const buttonStop = document.getElementById('button_stop');

    let recorder = new Tone.Recorder();
    let explotionRecorder = new Tone.Recorder();
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
                const player = new Tone.Player(blobUrl, () => {
                    explotionRecorder.start();
                });
                // 処理時間の都合上、ある程度で録音を止めてしまったほうが良いかもしれない
                // 任意の秒数に変換できるように再生時間から何倍速にするか逆算したほうが良いかもしれない
                const playbackRate = 3.0; // 何倍速にする？
                player.playbackRate = playbackRate;

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
                limiterNode.connect(explotionRecorder);

                player.autostart = true;
                player.onstop = function () {
                    // 再生が終わってもリバーブの余韻があるので2秒くらい待つ
                    setTimeout(() => {
                        explotionRecorder.stop().then((blob) => {
                            const url = URL.createObjectURL(blob);
                            const anchor = document.createElement("a");
                            anchor.download = "recording.webm";
                            anchor.href = url;
                            anchor.click();
                        });
                    }, 2000);
                }
            });

        }
    }
}
