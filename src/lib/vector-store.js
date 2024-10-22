import { env } from "./config";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

export async function embedDocs(docs) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const embedder = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      batchSize: 512, // Default value if omitted is 512. Max is 2048
      modelName: "text-embedding-3-large",
    });

    //embed the PDF documents
    const embeddingsDataArr = []; //[{embedding: [], chunk: '}]
    console.log("docs", docs);

    for (const chunk of docs) {
      const embedding = await embedder.embedQuery(chunk);
      // console.log("Embedding ", embedding);
      embeddingsDataArr.push({
        embedding,
        chunk,
      });
      // console.log('Embedding value', embedding)
    }

    return embeddingsDataArr;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs !");
  }
}

export async function storeEmbeddings(client, embeddings) {
  const index = client.index(env.PINECONE_INDEX_NAME);
  // const namespaceIndex = index.namespace(env.PINECONE_NAME_SPACE);

  // await namespaceIndex.deleteAll();
  // console.log("delele all");
  for (let i = 0; i < embeddings.length; i++) {
    await index.namespace(env.PINECONE_NAME_SPACE).upsert([
      {
        id: `chunk-${i}`,
        values: embeddings[i].embedding,
        metadata: { chunk: embeddings[i].chunk },
      },
    ]);
  }
}

// Returns vector-store handle to be used a retrievers on langchains
export async function getVectorStore(client) {
  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      batchSize: 512, // Default value if omitted is 512. Max is 2048
      modelName: "text-embedding-3-large",
    });
    const index = client.Index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
      namespace: env.PINECONE_NAME_SPACE,
    });

    return vectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}
