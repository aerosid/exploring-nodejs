import { ServiceBusClient } from "@azure/service-bus";
import "dotenv/config";

class Subscriber {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#simulating_private_constructors
  static #isConstructorCall = true;

  #connectionString;

  #queue;

  #receiver;

  #svcBus;

  static build() {
    Subscriber.#isConstructorCall = false;
    const pub = new Subscriber();
    return pub;
  }

  constructor() {
    if (Subscriber.#isConstructorCall) {
      throw new TypeError("Use Publisher.build() instead");
    }
    Subscriber.#isConstructorCall = true;
    this.#connectionString = process.env.SVC_BUS_CONNECTION_STRING;
    this.#queue = process.env.SVC_BUS_QUEUE_NAME;
  }

  async destroy() {
    await this.#receiver.close();
    await this.#svcBus.close();
    return this;
  }

  init() {
    this.#svcBus = new ServiceBusClient(process.env.SVC_BUS_CONNECTION_STRING);
    this.#receiver = this.#svcBus.createReceiver(process.env.SVC_BUS_QUEUE_NAME);
    return this;
  }

  /**
   * Starts listening to queue for messages.
   * @date 12/25/2023 - 2:17:15 AM
   *
   * @param {function} onMessage async (payload: ServiceBusMessage) => {};
   * @param {function} onError async (error: Error) => {};
   * @returns {this}
   */
  listen(onMessage, onError) {
    if (!onMessage || !onError) {
      throw new TypeError("onMessage, onError callbacks required");
    }
    const args = { processMessage: onMessage, processError: onError };
    this.#receiver.subscribe(args);
    return this;
  }
}

export default Subscriber;
