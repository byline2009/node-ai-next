import { ChatOpenAI } from "@langchain/openai";
import { env } from "./config";
import {embedDocs}  from "./vector-store"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getPineconeClient } from "./pinecone-client";

// https://js.langchain.com/v0.2/docs/integrations/chat/openai/
// https://js.langchain.com/v0.2/docs/integrations/chat/azure/
export async function generateAnswer(query, retrievedChunks) {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    // Include any other parameters required, e.g., temperature, max_tokens, etc.
  });

  // Join retrieved chunks into a single context string
  const context = retrievedChunks.join(" ");

  // Construct the prompt with specific instructions
  const systemMessage = `You are an AI that answers questions strictly based on the provided context. 
  If the context doesn't contain enough information, respond with "I do not have enough info to answer this question."`;

  const humanMessage = `Context: ${context}\n\nQuestion: ${query}`;

  // Invoke the LLM with the system and human messages
  const aiMsg = await llm.invoke([
    ["system", systemMessage],
    ["human", humanMessage],
  ]);

  // Extract the answer from the model's response
  const answer = aiMsg.content.trim();

  return answer;
}

export async function retrieveRelevantChunks(query, namespace = env.PINECONE_NAME_SPACE) {
  const embeddingDataArr = await embedTexts([query]);
  const pc = await getPineconeClient();
  const index = pc.index(env.PINECONE_INDEX_NAME);
  const results = await index.namespace(namespace).query({
    vector: embeddingDataArr[0].embedding,
    topK: 5, // Number of relevant chunks to retrieve
    includeValues: true,
    includeMetadata: true,
  });
  console.log("results",results);
  return results.matches.map((match) => match.metadata.chunk);
}
async function embedTexts(textChunks) {
  const embedder = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    batchSize: 512, // Default value if omitted is 512. Max is 2048
    model: "text-embedding-3-large",
  });
  const embeddingsDataArr = []; //[{embedding: [], chunk: '}]

  for (const chunk of textChunks) {
    // console.log("Embedding chunk", chunk);
    const embedding = await embedder.embedQuery(chunk);
    embeddingsDataArr.push({
      embedding,
      chunk,
    });
    // console.log('Embedding value', embedding)
  }

  return embeddingsDataArr;
}
