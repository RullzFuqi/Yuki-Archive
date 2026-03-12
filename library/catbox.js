import FormData from "form-data";
import axios from 'axios';

export default async function uploadCatbox(buffer) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, {
    filename: "image.png",
  });
  try {
    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });
    return res.data.trim();
  } catch (err) {
    throw new Error("Upload Catbox gagal: " + err.message);
  }
}
