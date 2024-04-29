import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import OpenAI from "openai";
import "dotenv/config";

class Conversation {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#simulating_private_constructors
  static #isConstructorCall = true;

  /**
   * Array of objects: {role: "system|user|assistant" content="???"}
   * @date 12/26/2023 - 6:42:02 AM
   *
   * @type {Array}
   */
  #messages;

  /**
   * Handle to OpenAI
   * @date 12/26/2023 - 6:37:04 AM
   *
   * @type {OpenAI}
   */
  #openai;

  #rl;

  static build(systemMsg) {
    Conversation.#isConstructorCall = false;
    const cnv = new Conversation();
    if (systemMsg) {
      cnv.#pushSystemMessage(systemMsg);
    } else {
      cnv.#pushSystemMessage("You are a helpful assistant.");
    }
    return cnv;
  }

  constructor() {
    if (Conversation.#isConstructorCall) {
      throw new TypeError("Use Publisher.build() instead");
    }
    Conversation.#isConstructorCall = true;
    this.#messages = [];
    this.#openai = new OpenAI(process.env.OPENAI_API_KEY);
    this.#rl = readline.createInterface({ input, output });
  }

  async converse(userMessage) {
    this.#pushUserMessage(userMessage);
    const completion = await this.#openai.chat.completions.create({
      messages: this.#messages,
      model: "gpt-3.5-turbo",
    });
    const assistantMessage = completion.choices[0].message.content;
    this.#pushAssistantMessage(assistantMessage);
    return assistantMessage;
  }

  async init() {
    const completion = await this.#openai.chat.completions.create({
      messages: this.#messages,
      model: "gpt-3.5-turbo",
    });
    const assistantMessage = completion.choices[0].message.content;
    this.#pushAssistantMessage(assistantMessage);
    const hash = " # ";
    const star = " * ";
    console.log(`${hash}${this.#messages[0].content}`);
    console.log(`${star}${this.#messages[1].content}`);
  }

  #pushAssistantMessage(msg) {
    const message = { role: "assistant", content: msg };
    this.#messages.push(message);
    return this;
  }

  #pushSystemMessage(msg) {
    const message = { role: "system", content: msg };
    this.#messages.push(message);
    return this;
  }

  #pushUserMessage(msg) {
    const message = { role: "user", content: msg };
    this.#messages.push(message);
    return this;
  }

  async start() {
    if (this.#messages.length === 1) {
      await this.init();
    }

    const prompt = "> ";
    const star = " * ";
    let keepConversing = true;
    do {
      const userMessage = await this.#rl.question(`${this.#messages.length}${prompt}`);
      if (userMessage.toLowerCase().includes("bye")) {
        keepConversing = false;
        this.#rl.close();
      } else {
        let assistantMessage = await this.converse(userMessage);
        console.log(`${star}${assistantMessage}`);
      }
    } while (keepConversing);
    return this;
  }
}

export default Conversation;
