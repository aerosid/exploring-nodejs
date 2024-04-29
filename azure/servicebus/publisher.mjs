import { ServiceBusClient } from "@azure/service-bus";
import "dotenv/config";

class Publisher {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#simulating_private_constructors
  static #isConstructorCall = true;

  #connectionString;

  #queue;

  #sender;

  #svcBus;

  static build() {
    Publisher.#isConstructorCall = false;
    const pub = new Publisher();
    return pub;
  }

  constructor() {
    if (Publisher.#isConstructorCall) {
      throw new TypeError("Use Publisher.build() instead");
    }
    Publisher.#isConstructorCall = true;
    this.#connectionString = process.env.SVC_BUS_CONNECTION_STRING;
    this.#queue = process.env.SVC_BUS_QUEUE_NAME;
  }

  async destroy() {
    await this.#sender.close();
    await this.#svcBus.close();
    return this;
  }

  init() {
    this.#svcBus = new ServiceBusClient(process.env.SVC_BUS_CONNECTION_STRING);
    this.#sender = this.#svcBus.createSender(process.env.SVC_BUS_QUEUE_NAME);
    return this;
  }

  async post(payload) {
    const message = {
      contentType: "application/json",
      subject: "New Message",
      body: payload,
    };
    await this.#sender.sendMessages(message);
    return this;
  }
}

export default Publisher;
