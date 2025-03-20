import fs from "fs/promises";
import path from "path";

export async function saveToTempFile(fileName: string, buffer: Buffer) {
  try {
    const tempFilePath = path.join(
      path.resolve(__dirname, ".."),
      "temp",
      fileName
    );
    await fs.writeFile(tempFilePath, buffer);
    return tempFilePath;
  } catch (err) {
    throw new Error(`Error saving buffer to temp file: ${err}`);
  }
}
