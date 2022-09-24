window.onload = (event) => {

    const buttonStart = document.getElementById('button_start');
    const buttonStop = document.getElementById('button_stop');
    const beforeWaceform = WaveSurfer.create({
        container: '#waveform_before',
        waveColor: 'violet',
        progressColor: 'purple'
    });
    const afterWaveform = WaveSurfer.create({
        container: '#waveform_after',
        waveColor: 'violet',
        progressColor: 'purple'
    });

    // 音声ファイルは5秒で統一
    const audioLengthSeconds = 5;

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
            recorder.start().then(() => { });
        });
    }

    buttonStop.onclick = function () {
        Tone.context.resume();

        if (mic != null) {
            mic.close();
            // 録音を止めて音声の再生を開始する
            recorder.stop().then((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                beforeWaceform.load(blobUrl);

                const player = new Tone.Player(blobUrl, () => {
                    // 処理時間の都合上、どこかで録音を止めてしまったほうが良いかもしれない
                    // 任意の秒数に変換できるように再生時間から何倍速にするか逆算
                    const playbackRate = player.buffer.duration / audioLengthSeconds;
                    player.playbackRate = playbackRate;

                    // フェードアウトして余韻を感じる
                    player.fadeOut = new Tone.Time("5s");

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

                    player.start();
                    explotionRecorder.start();
                });
                player.onstop = function () {
                    // 再生が終わってもリバーブがあるので追加で1秒くらい待つ
                    setTimeout(() => {
                        explotionRecorder.stop().then((blob) => {
                            const blobUrl = URL.createObjectURL(blob);
                            const anchor = document.createElement("a");

                            afterWaveform.load(blobUrl);
                            afterWaveform.on('ready', function () {
                                // 波形画像の出力
                                console.log(afterWaveform.exportImage());
                            });
                            anchor.download = "recording.webm";
                            anchor.href = blobUrl;
                            anchor.click();
                        });
                    }, 2000);
                }
            });

        }
    }
}
