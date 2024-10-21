import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { embedDocs, storeEmbeddings } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";
import { env } from "@/lib/config";
import { ChatOpenAI, HumanChatMessage } from "@langchain/openai";

// This operation might fail because indexes likely need
// more time to init, so give some 5 mins after index
// creation and try again.

(async () => {
  try {
    // const pineconeClient = await getPineconeClient();
    // const index = pineconeClient.index(env.PINECONE_INDEX_NAME);
    // console.log("Preparing chunks from PDF file");
    // const docs = await getChunkedDocsFromPDF();
    // console.log(`Loading ${docs.length} chunks into pinecone...`);
    // const embedData = await embedDocs(pineconeClient, docs);
    // console.log("Data embedded and stored in pine-cone index");
    // await storeEmbeddings(pineconeClient, embedData);

    const chat = new ChatOpenAI(
      { temperature: 0, openAIApiKey: env.OPENAI_API_KEY },
      { basePath: "http://10.39.152.30:3128" }
    );
    const systemMessage = `You are an AI that answers questions strictly based on the provided context. 
  If the context doesn't contain enough information, respond with "I do not have enough info to answer this question."`;
    const humanMessage = "";
    try {
      const response = await llm.invoke([
        ["system", systemMessage],
        ["human", humanMessage],
      ]);
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  } catch (error) {
    console.error("Init client script failed ", error);
  }
})();
