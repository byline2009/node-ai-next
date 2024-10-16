import { PineconeClient } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";

let pineconeClientInstance: PineconeClient | null = null;

// Create pineconeIndex if it doesn't exist
async function createIndex(client: PineconeClient, indexName: string) {
  try {
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536,
        metric: "cosine",
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
  try {
    console.log("check env", process.env.PINECONE_ENVIRONMENT);
    const pineconeClient = new PineconeClient();
    console.log("check init");
    pineconeClient.projectName = "Starter";
    console.log("pineconeClient", pineconeClient.projectName);
    await pineconeClient.init({
      apiKey: "409e625d-dec0-4241-88bc-30efca393b76",
      environment: "gcp-starter",
    });
    const indexName = "index-start";

    const existingIndexes = await pineconeClient.listIndexes();

    if (!existingIndexes.includes(indexName)) {
      createIndex(pineconeClient, indexName);
    } else {
      console.log("Your index already exists. nice !!");
    }

    return pineconeClient;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

export async function getPineconeClient() {
  if (!pineconeClientInstance) {
    pineconeClientInstance = await initPineconeClient();
  }

  return pineconeClientInstance;
}
