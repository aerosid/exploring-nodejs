#!/usr/bin/env node

// import Conversation from "./openai/conversation.mjs";

// const systemMsg = "You are a sassy AI.  Your task is to provide single sentences responses.";
// Conversation.build(systemMsg).start();

import App from "./express/app.mjs";

App.build().init();
