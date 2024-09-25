import axios from "axios";
import { delay } from "./utils";

// Recursive function to call the API until it succeeds
export async function getJob(jobId, maxRetries = 10, delayMs = 3000) {
  try {
    const result = await axios.get(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/json`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`,
        },
      }
    );
    return result.data;
  } catch (error) {
    if (maxRetries <= 0) {
      console.error("Max retries reached, failing...");
      throw error;
    } else {
      console.warn(`Retrying... Remaining attempts: ${maxRetries}`);
      await delay(delayMs); // Wait before retrying
      return getResult(jobId, maxRetries - 1, delayMs); // Recursively retry
    }
  }
}
