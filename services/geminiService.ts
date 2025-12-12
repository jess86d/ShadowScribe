import { GoogleGenAI, Modality } from "@google/genai";

// Helper to get client - MUST create new instance for API key updates to take effect
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// 1. Generate Lyrics & Song Structure (Text)
export const generateSongConcept = async (genre: string, mood: string, topic: string) => {
  const ai = getAiClient();
  const prompt = `
    Act as a world-class music producer and lyricist.
    Create a song structure and lyrics for a ${mood} ${genre} track about ${topic}.
    
    Format the output as JSON with the following schema:
    {
      "title": "Song Title",
      "bpm": 140,
      "structure": [
        {"section": "Intro", "description": "Atmospheric pads building up"},
        {"section": "Verse 1", "lyrics": "..."}
      ]
    }
    Return ONLY raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Song Concept Error:", error);
    throw error;
  }
};

// 2. Generate Album Art (Image)
export const generateAlbumArt = async (description: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: `A futuristic, high-concept album cover for a song. Style: ${description}. High resolution, 4k, digital art.` }]
        },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K"
            }
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Album Art Error:", error);
    return `https://picsum.photos/500/500?grayscale&blur=2`;
  }
};

// 3. Generate Vocal Preview (TTS)
export const generateVocalPreview = async (text: string, voiceName: string = 'Fenrir') => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// 3.5 Generate Sculpted Vocal (Vocal Forge)
export const generateSculptedVocal = async (
  text: string,
  voiceName: string,
  emotion: string,
  pitchCorrection: number
) => {
  const ai = getAiClient();
  
  let pitchInstruction = "";
  if (pitchCorrection > 85) {
    pitchInstruction = "with a robotic, heavily auto-tuned effect";
  } else if (pitchCorrection > 50) {
    pitchInstruction = "with perfect, polished pitch";
  } else {
    pitchInstruction = "with a natural, raw feel";
  }

  let emotionInstruction = "";
  switch (emotion) {
    case 'aggressive': emotionInstruction = "aggressive, gritty, and intense"; break;
    case 'ethereal': emotionInstruction = "soft, breathy, and ethereal"; break;
    case 'melancholic': emotionInstruction = "sad, emotional, and slow"; break;
    case 'hype': emotionInstruction = "energetic, loud, and hype"; break;
    case 'whisper': emotionInstruction = "whispered and mysterious"; break;
    default: emotionInstruction = "clear and balanced"; break;
  }

  const finalPrompt = `Say the following lyrics ${emotionInstruction}, ${pitchInstruction}: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Vocal Sculpt Error:", error);
    throw error;
  }
};

// 4. Generate Video (Veo)
export const startVideoGeneration = async (prompt: string) => {
  const ai = getAiClient();
  try {
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Music video visualizer, abstract, neon, ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
    return operation;
  } catch (error) {
    console.error("Veo Start Error:", error);
    throw error;
  }
};

export const pollVideoOperation = async (operationName: string) => {
    try {
        return null; 
    } catch(e) { return null; }
}

// 5. Hindsight Chat
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
        systemInstruction: "You are Hindsight360, an advanced holographic AI music production assistant. You are helpful, technical, and use slang appropriate for music producers. You help with songwriting, music theory, and protecting the user's IP."
    }
  });
  
  const result = await chat.sendMessage({ message });
  return result.text;
};