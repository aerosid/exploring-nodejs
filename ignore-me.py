from pgml import Collection, Model, Splitter, Pipeline
import wikipediaapi
import asyncio


# Construct our wikipedia api
wiki_wiki = wikipediaapi.Wikipedia("Chatbot Tutorial Project", "en")


# Use the default model for embedding and default splitter for splitting
model = Model() # The default model is Alibaba-NLP/gte-base-en-v1.5
splitter = Splitter() # The default splitter is recursive_character


# Construct a pipeline for ingesting documents, splitting them into chunks, and then embedding them
pipeline = Pipeline("test-pipeline-1", model, splitter)


# Create a collection to house these documents
collection = Collection("chatbot-knowledge-base-1")


async def main():
    # Add the pipeline to the collection
    await collection.add_pipeline(pipeline)


    # Get the document
    page = wiki_wiki.page("Baldur's_Gate_3")


    # Upsert the document. This will split the document and embed it
    await collection.upsert_documents([{"id": "Baldur's_Gate_3", "text": page.text}])


    # Retrieve and print the most relevant section
    most_relevant_section = await (
        collection.query()
        .vector_recall("What is the plot of Baldur's Gate 3", pipeline)
        .limit(1)
        .fetch_all()
    )
    print(most_relevant_section[0][1])


asyncio.run(main())