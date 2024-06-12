/**
 * Description placeholder
 * @date 12/24/2023 - 4:28:45 AM
 *
 * @class Greeting
 * @typedef {Greeting}
 */
class Greeting {
  #message;

  static build(message) {
    const obj = new Greeting(message);
    return obj;
  }

  constructor(message) {
    if (message !== undefined && message !== null) {
      this.#message = message;
    } else {
      this.#message = "Hello World!";
    }
  }

  greeting(value) {
    this.#message = value;
    return this;
  }

  toString() {
    return this.#message;
  }
}

export default Greeting;