
import { GoogleGenAI, LiveServerMessage, Modality, Type, GenerateContentResponse } from "@google/genai";

// Image Editing Service
export const editWallpaper = async (imageBase64: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: `You are an expert wallpaper editor. Modify this image based on the prompt: "${prompt}". Return only the modified image.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from Gemini");
};

// Video Generation Service (Veo)
export const animateWallpaper = async (imageBase64: string, prompt: string, onStatusUpdate: (msg: string) => void): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  onStatusUpdate("Initiating Veo generation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this wallpaper with subtle cinematic movements',
    image: {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  const statuses = [
    "Painting the scene...",
    "Capturing the motion...",
    "Rendering high resolution details...",
    "Applying cinematic lighting...",
    "Almost there, finalizing video file..."
  ];

  let statusIdx = 0;
  while (!operation.done) {
    onStatusUpdate(statuses[statusIdx % statuses.length]);
    statusIdx++;
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Helper for Audio Encoding/Decoding
export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
