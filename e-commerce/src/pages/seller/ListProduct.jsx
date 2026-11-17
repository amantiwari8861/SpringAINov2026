import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ListProduct = () => {
  const [base64Image, setbase64Image] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setGenerating] = useState(false);
  const generateImage = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/openai/generate-image`,
        {
          message: imagePrompt,
        },
      );
      setbase64Image(res.data);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl">Generate Image</h1>
      {/* <img src={`data:image/png;base64,${base64Image}`} alt="" /> */}
      <img src={`${base64Image}`} alt="" />
      <br />
      <input
        type="text"
        value={imagePrompt}
        className="border rounded"
        onChange={(e) => setImagePrompt(e.target.value)}
      />
      <br />
      <br />
      <button
        disabled={isGenerating}
        className="btn btn-primary"
        onClick={generateImage}
      >
        {isGenerating ? "Generating...." : "Generate"}
      </button>
    </div>
  );
};

export default ListProduct;
