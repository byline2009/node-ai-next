import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "./config";
import fs from 'fs'
import PdfParse from "pdf-parse/lib/pdf-parse";



export async function getChunkedDocsFromPDF() {
  try {  
    const dataBuffer =  fs.readFileSync(env.PDF_PATH)
    const pdfData = await PdfParse(dataBuffer);
    const docs = pdfData.text;
    // const loader = new PDFLoader(env.PDF_PATH);
    // const docs = await loader.load();
    console.log("check docs", docs.length)
    const chunkSize=1000;
    const overlapSize=200;

    // // From the docs https://www.pinecone.io/learn/chunking-strategies/
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 500,
    //   chunkOverlap: 100,
    // });

    // const chunkedDocs = await textSplitter.splitDocuments(docs);

  const chunks = [];
  let start = 0;

  while (start < docs.length) {
    const end = start + chunkSize;
    const chunk = docs.slice(start, end);
    // console.log('Chunk---------------->', chunk);
    chunks.push(chunk);
    start += chunkSize - overlapSize; // Move forward by chunkSize minus overlap
  }

  return chunks;

  } catch (e) {
    console.error(e);
    throw new Error("PDF docs chunking failed !");
  }
}
