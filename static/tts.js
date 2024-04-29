class Tts {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#simulating_private_constructors
  static #isConstructorCall = true;

  #audioConfig; // SpeechSDK.AudioConfig

  #error;

  #speechConfig; // SpeechSDK.SpeechConfig

  #synthesizer; // SpeechSDK.SpeechSynthesizer

  static build() {
    Tts.#isConstructorCall = false;
    const tts = new Tts();
    return tts;
  }

  constructor() {
    if (Tts.#isConstructorCall) {
      throw new TypeError("Use Stt.build() instead");
    }
    Tts.#isConstructorCall = true;
  }

  /**
   * Releases Speech SDK resources initialized in init().
   */
  destroy() {
    const callback = () => {
      if (this.#audioConfig) { this.#audioConfig.close(); }
      if (this.#speechConfig) { this.#speechConfig.close(); }
    };
    if (this.#synthesizer) { this.#synthesizer.close(callback); }
  }

  /**
   * Initializes Speech SDK.
   *
   * @returns {Promise<Tts>}
   */
  init() {
    const exec = (res, rej) => {
      try {
        const key = "ee46e009fcb141dd986a62f318447531";
        const region = "centralindia";

        this.#speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
        this.#speechConfig.speechRecognitionLanguage = "en-US";
        const speaker = new SpeechSDK.SpeakerAudioDestination();
        this.#audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(speaker);
        this.#synthesizer = new SpeechSDK.SpeechSynthesizer(this.#speechConfig, this.#audioConfig);
        res(this);
      } catch (err) {
        this.#error = err;
        rej(err);
      }
    };
    return new Promise(exec);
  }

  /**
   * Get user's permission to use the mic. and speaker.
   *
   * @returns {Promise<Tts>}
   */
  permission() {
    const exec = (res, rej) => {
      navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        .then((stream) => {
          window.localStream = stream;
          res(this);
        })
        .catch((err) => {
          this.#error = err;
          rej(err);
        });
    };
    return new Promise(exec);
  }

  /**
   * Calls these methods in order: permission(), init(), start(), destroy().
   *
   * @returns {Promise<Tts>}
   */
  play(text) {
    const exec = (res, rej) => {
      this.permission()
        .then(() => this.init())
        .then(() => this.start(text))
        .then(() => res(this))
        .catch((err) => rej(err))
        .finally(() => this.destroy());
    };
    return new Promise(exec);
  }

  /**
   * Starts recording until silence is reached.
   *
   * @returns {Promise<Tts>}
   */
  start(text) {
    const exec = (res, rej) => {
      const play = (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          res(this);
        } else {
          this.#error = new Error(result.errorDetails);
          rej(this.#error);
        }
      };
      this.#synthesizer.speakTextAsync(text, play);
    };
    return new Promise(exec);
  }
}
