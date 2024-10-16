import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";
import { Dispatcher, ProxyAgent } from "undici";

let pineconeClientInstance: Pinecone | null = null;

const client = new ProxyAgent({
  uri: "http://10.39.152.30",
  requestTls: {
    port: 3128,
  },
});
const customFetch = (input: string | URL | Request, init: any) => {
  return fetch(input, {
    ...init,
    dispatcher: client as any,
    keepalive: true,
  });
};
// Create pineconeIndex if it doesn't exist
async function createIndex(client: Pinecone, indexName: string) {
  try {
    await client.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        pod: {
          environment: "gcp-starter",
          pods: 1,
          podType: "p2.x1",
          metadataConfig: {},
        },
      },
      // This option tells the client not to throw if the index already exists.
      suppressConflicts: true,
      // This option tells the client not to resolve the promise until the
      // index is ready.
      waitUntilReady: true,
    });

    // await client.createIndex({
    //   createRequest: {
    //     name: indexName,
    //     dimension: 1536,
    //     metric: "cosine",
    //   },
    // });
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
  const indexName = "index-start";
  try {
    const pc = new Pinecone({
      apiKey: "409e625d-dec0-4241-88bc-30efca393b76",
    });
    const index = pc.index("index-start");

    if (!index) {
      createIndex(pc, indexName);
    } else {
      console.log("Your index already exists. nice !!");
    }

    return pc;
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
