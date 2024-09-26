export const uploadFile = async (filePath, apiKey) => {
  const formData = new FormData();
  const file = await fetch(filePath).then((res) => res.blob());
  formData.append("file", file, "file.pdf");
  const response = await fetch(
    "https://api.cloud.llamaindex.ai/api/parsing/upload",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );
  return response.json();
};
