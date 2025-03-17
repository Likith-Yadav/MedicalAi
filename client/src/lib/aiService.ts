import { GoogleGenerativeAI } from '@google/generative-ai';

// Verify API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API key is not set in environment variables');
  throw new Error('Gemini API key is required');
}

console.log('API Key loaded:', apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const medicalChatService = {
  async sendMessage(message: string): Promise<Message> {
    try {
      console.log('Starting chat with message:', message);

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      }, { apiVersion: "v1" });

      const prompt = `You are an AI medical assistant. Your role is to:
1. Ask relevant questions about symptoms
2. Provide preliminary analysis
3. Recommend appropriate medications and treatments
4. Give recovery procedures and lifestyle advice
5. Always remind users to seek professional medical help for serious conditions

User message: ${message}

Please respond in a professional, caring manner.`;

      console.log('Sending message to Gemini...');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini:', result);
      
      const response = await result.response;
      const text = response.text();
      console.log('Response text:', text);

      if (!text) {
        throw new Error('Empty response from AI');
      }

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: text.trim(),
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('Detailed chat error:', {
        error: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }
};

export const medicalAnalysisService = {
  async analyzeImage(file: File): Promise<string> {
    try {
      console.log('Starting image analysis for:', file.name);
      
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const imageData = {
        inlineData: {
          data: data.split(',')[1],
          mimeType: file.type,
        },
      };

      const prompt = `You are a medical professional analyzing this medical image. Please provide:
1. A detailed analysis of what you observe
2. Any potential abnormalities or concerns
3. Recommendations for follow-up
4. Important notes for the patient

Please be thorough but explain in terms a patient can understand.`;

      const visionModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      }, { apiVersion: "v1" });
      
      console.log('Sending image to Gemini for analysis...');
      const result = await visionModel.generateContent([prompt, imageData]);
      console.log('Received analysis from Gemini:', result);
      
      const response = await result.response;
      const text = response.text();
      console.log('Analysis text:', text);

      if (!text) {
        throw new Error('Empty response from AI');
      }

      return text;
    } catch (error: any) {
      console.error('Image analysis error:', {
        error: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to analyze medical image: ${error.message}`);
    }
  }
};

export const voiceService = {
  recognition: typeof window !== 'undefined' ? new (window as any).webkitSpeechRecognition() : null,
  synthesis: typeof window !== 'undefined' ? window.speechSynthesis : null,

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject('Speech recognition not supported');
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };

      this.recognition.start();
    });
  },

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject('Speech synthesis not supported');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        console.log('Speech finished');
        resolve();
      };
      utterance.onerror = (error) => {
        console.error('Speech error:', error);
        reject(error);
      };
      // Fallback timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('Speech timeout fallback');
        resolve(); // Resolve even if speech fails
      }, 10000); // 10-second timeout
      utterance.onend = () => {
        clearTimeout(timeout);
        console.log('Speech finished');
        resolve();
      };
      this.synthesis.speak(utterance);
    });
  }
};