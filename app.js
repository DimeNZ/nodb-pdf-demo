import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Nodb from "nodb-js-sdk";
import path from "path";
import { fileURLToPath } from "url";
import { getJob } from "./job";
import { delay } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const form = new FormData();

const nodb = new Nodb({
  baseUrl: "https://nodb-demo.fly.dev",
});

const filePath = path.resolve(__dirname, "my.pdf");
form.append("file", fs.createReadStream(filePath), {
  contentType: "application/pdf",
});
form.append("parsing_instruction", "This is a CV");
form.append("fast_mode", "true");
form.append("invalidate_cache", "true");
form.append("target_pages", "0");

try {
  const response = await axios.post(
    "https://api.cloud.llamaindex.ai/api/parsing/upload",
    form,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`,
        ...form.getHeaders(),
      },
    }
  );
  await delay(5000);
  console.log("Response:", response.data.id);
  const result = await getJob(response.data.id);
  console.log("Result:", result.pages[0].text);
  const appName = process.env.NODB_APP || "demo-22";
  const envName = process.env.NODB_ENV || "dev";
  const token = process.env.NODB_ENV_TOKEN || "cto7a9lqmiib11";
  await nodb.deleteEntities({
    appName,
    envName,
    entityName: "cvs",
    token,
  });
  console.log("Deleted all docs...");
  const ids = await nodb.writeEntities({
    appName,
    envName,
    entityName: "cvs",
    token,
    payload: [{ text: result.pages[0].text }],
  });
  console.log({ ids });
  const { answer } = await nodb.inquire({
    appName,
    envName,
    token,
    inquiry: "What's Marko's email and phone number?",
  });
  console.log({ answer });
} catch (error) {
  console.error("Error:", error.response ? error.response.data : error.message);
}
