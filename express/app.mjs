import express from "express";
import process from "node:process";
import Conversation from "../openai/conversation.mjs";

class App {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#simulating_private_constructors
  static #isConstructorCall = true;

  #app;

  #conversation;

  #port;

  #server;

  static build() {
    App.#isConstructorCall = false;
    const app = new App();
    return app;
  }

  constructor() {
    if (App.#isConstructorCall) {
      throw new TypeError("Use App.build() instead");
    }
    App.#isConstructorCall = true;
    this.#app = express();
    const systemMsg = "You are a sassy AI.  Your task is to provide very short, single sentence responses.";
    this.#conversation = Conversation.build(systemMsg);
    this.#port = 8080;
  }

  destroy() {
    const onDestroy = () => {
      console.log(`stopped listening on port ${this.#port}`);
    };
    this.#server.close(onDestroy);
    return this;
  }

  init() {
    this.#app.use(express.static("static"));
    this.#app.use(express.json());

    const doInit = async (req, res) => {
      this.#conversation.init();
      res.send({ status: "ok" });
    };
    this.#app.post("/init", doInit);

    const doConversation = async (req, res) => {
      const userMessage = req.body.text;
      const assistantmessage = await this.#conversation.converse(userMessage);
      res.json({ text: assistantmessage });
    };
    this.#app.post("/converse", doConversation);

    const doDestroy = async (req, res) => {
      res.send({ status: "ok" });
    };
    this.#app.post("/destroy", doDestroy);

    const onInit = () => {
      console.log(`listening on port ${this.#port}`);
    };
    this.#server = this.#app.listen(this.#port, onInit);

    process.on("SIGINT", this.destroy.bind(this));
    return this;
  }
}

export default App;
