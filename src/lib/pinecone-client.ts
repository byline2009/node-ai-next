import {
  Pinecone,
  type PineconeConfiguration,
} from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";
import { Dispatcher, ProxyAgent } from "undici";

let pineconeClientInstance: Pinecone | null = null;

const client = new ProxyAgent({
  uri: "http://10.39.152.30:3128",
});
const customFetch = (input: string | URL | Request, init: any) => {
  return fetch(input, {
    ...init,
    // dispatcher: client as any,
    keepalive: true,
  });
};

const config: PineconeConfiguration = {
  apiKey: "409e625d-dec0-4241-88bc-30efca393b76",
  fetchApi: customFetch,
};

const pc = new Pinecone(config);

// Create pineconeIndex if it doesn't exist
async function createIndex(client: Pinecone, indexName: string) {
  try {
     await pc.createIndex({
    name: env.PINECONE_INDEX_NAME,

    // should match embedding model name, e.g. 3072 for OpenAI text-embedding-3-large and 1536 for OpenAI text-embedding-ada-002
    dimension: 3072,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });

    console.log(
      `Waiting for 240000 seconds for index initialization to complete...`
    );
    await delay(240000);
    console.log("Index created !!");
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

// Initialize index and ready to be accessed.
async function initPineconeClient() {
  const indexName = env.PINECONE_INDEX_NAME;
  try {
    const isExistedPC = await checkIndexExists(pc);
    if (!isExistedPC) {
      console.log("Index is not existed");
     await createIndex(pc, indexName);
    } else {
      console.log("Your index already exists. nice !!");
    }
    return pc;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

async function checkIndexExists(pc : Pinecone) {
  // List all indexes
  const response = await pc.listIndexes();
  const indexes =  response.indexes;
  console.log('Available indexes:', indexes)

  // Check if the desired index is in the list
  return indexes?.find(item => item.name === env.PINECONE_INDEX_NAME);
}

export async function getPineconeClient() {
  if (!pineconeClientInstance) {
    pineconeClientInstance = await initPineconeClient();
  }

  return pineconeClientInstance;
}
