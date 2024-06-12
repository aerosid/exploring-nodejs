const pgml = require("pgml");

database_url = "postgres://postgresml:postgresml@127.0.0.1:5432/postgresml";

client = pgml.OpenSourceAI(database_url)

results = client.chat_completions_create(
    {
        "model" : "santiadavani/fingpt-llama2-7b-chat",
        "token" : "TOKEN",
        "load_in_8bit": "true",
        "temperature" : 0.1,
        "repetition_penalty" : 1.5,
    },
    [
        {
            "role" : "system",
            "content" : "What is the sentiment of this news? Please choose an answer from {strong negative/moderately negative/mildly negative/neutral/mildly positive/moderately positive/strong positive}.",
        },
        {
            "role": "user",
            "content": "Starbucks says the workers violated safety policies while workers said they'd never heard of the policy before and are alleging retaliation.",
        },
    ]
)

print(results)