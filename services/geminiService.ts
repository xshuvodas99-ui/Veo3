import { GoogleGenAI } from "@google/genai";
import { VideoConfig } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateVideo = async (config: VideoConfig): Promise<string> => {
  // Ensure we have a fresh instance with the selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use fast-generate-preview for better interactivity in this demo
  const modelName = 'veo-3.1-fast-generate-preview'; 

  let operation;

  try {
    if (config.image) {
      const imageBase64 = await fileToBase64(config.image);
      operation = await ai.models.generateVideos({
        model: modelName,
        prompt: config.prompt,
        image: {
          imageBytes: imageBase64,
          mimeType: config.image.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: config.resolution,
          aspectRatio: config.aspectRatio,
        }
      });
    } else {
      operation = await ai.models.generateVideos({
        model: modelName,
        prompt: config.prompt,
        config: {
          numberOfVideos: 1,
          resolution: config.resolution,
          aspectRatio: config.aspectRatio,
        }
      });
    }

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log('Polling video generation status:', operation.metadata);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
      throw new Error("No video URI returned from API");
    }

    // Fetch the actual video blob
    // IMPORTANT: Append API key to the download link as per documentation
    const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
    
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};