import axios from "axios";

export async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file, "uploaded_file.docx");
    formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary upload preset

    // Upload the file to Cloudinary
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dipx5fuza/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw Error();
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
