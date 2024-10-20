import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { embedDocs, storeEmbeddings } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";
import { env } from "@/lib/config";

// This operation might fail because indexes likely need
// more time to init, so give some 5 mins after index
// creation and try again.

(async () => {
  try {
    const pineconeClient = await getPineconeClient();
    const index = pineconeClient.index(env.PINECONE_INDEX_NAME);
    console.log("Preparing chunks from PDF file");
    const docs = await getChunkedDocsFromPDF();
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    const embedData = await embedDocs(pineconeClient, docs);
    console.log("Data embedded and stored in pine-cone index");
    await storeEmbeddings(pineconeClient, embedData);
  } catch (error) {
    console.error("Init client script failed ", error);
  }
})();
