import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-templates";
import { retrieveRelevantChunks, generateAnswer } from "./generate-answer";
import { sources } from "next/dist/compiled/webpack/webpack";

type callChainArgs = {
  question: string
};

export async function callChain({ question }: callChainArgs) {
  try {
    // Question using chat-history
    // Reference https://js.langchain.com/docs/modules/chains/popular/chat_vector_db#externally-managed-memory
    // return streamingTextResponse;
    const relevantChunks = await retrieveRelevantChunks(question);
    const answers = await generateAnswer(question, relevantChunks);

    return answers;
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
