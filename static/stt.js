class Stt {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#simulating_private_constructors
  static #isConstructorCall = true;

  #audioConfig; // SpeechSDK.AudioConfig

  #error;

  #recognizer; // SpeechSDK.SpeechRecognizer

  #speechConfig; // SpeechSDK.SpeechConfig

  text; //

  static build() {
    Stt.#isConstructorCall = false;
    const stt = new Stt();
    return stt;
  }

  constructor() {
    if (Stt.#isConstructorCall) {
      throw new TypeError("Use Stt.build() instead");
    }
    Stt.#isConstructorCall = true;
  }

  /**
   * Releases Speech SDK resources initialized in init().
   */
  destroy() {
    const callback = () => {
      if (this.#audioConfig) { this.#audioConfig.close(); }
      if (this.#speechConfig) { this.#speechConfig.close(); }
    };
    if (this.#recognizer) { this.#recognizer.close(callback); }
  }

  /**
   * Initializes Speech SDK.
   *
   * @returns {Promise<Stt>}
   */
  init() {
    const exec = (res, rej) => {
      try {
        const key = "ee46e009fcb141dd986a62f318447531";
        const region = "centralindia";

        this.#speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
        this.#speechConfig.speechRecognitionLanguage = "en-IN";
        this.#audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.#recognizer = new SpeechSDK.SpeechRecognizer(this.#speechConfig, this.#audioConfig);
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
   * @returns {Promise<Stt>}
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
   * @returns {Promise<Stt>}
   */
  record() {
    const exec = (res, rej) => {
      const init = () => this.init();
      const start = () => this.start();
      const destroy = () => this.destroy();
      const resolve = () => res(this);
      const reject = (err) => rej(err);
      this
        .permission()
        .then(init)
        .then(start)
        .then(resolve)
        .catch(reject)
        .finally(destroy);
    };
    return new Promise(exec);
  }

  /**
   * Starts recording until silence is reached.
   *
   * @returns {Promise<Stt>}
   */
  start() {
    const exec = (res, rej) => {
      const recognize = (result) => {
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          this.text = result.text;
          res(this);
        } else {
          this.text = "I cannot think of anything to say.";
          res(this);
        }
      };
      this.#recognizer.recognizeOnceAsync(recognize);
    };
    return new Promise(exec);
  }
}
