#!/usr/bin/env node

import Greeting from "./Greeting.mjs";

console.log(Greeting.build().greeting("Howdy!").toString());
