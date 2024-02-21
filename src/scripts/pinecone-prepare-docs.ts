import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { embedAndStoreDocs } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";
import { env } from "@/lib/config";

// This operation might fail because indexes likely need
// more time to init, so give some 5 mins after index
// creation and try again.

(async () => {
  try {
    const pineconeClient = await getPineconeClient();
    const index = pineconeClient.Index(env.PINECONE_INDEX_NAME);
    await index.delete1({
      deleteAll: true,
      namespace: env.PINECONE_NAME_SPACE,
    });
    console.log("delete all");
    console.log("Preparing chunks from PDF file");
    const docs = await getChunkedDocsFromPDF();
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    await embedAndStoreDocs(pineconeClient, docs);
    console.log("Data embedded and stored in pine-cone index");
  } catch (error) {
    console.error("Init client script failed ", error);
  }
})();
