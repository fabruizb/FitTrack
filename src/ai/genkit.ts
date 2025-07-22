import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import dotenv from 'dotenv';

dotenv.config();

export const ai = genkit({
  plugins: [
    googleAI({
 apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyBmepRGcvv9a65WKGjvUVNvNcbRX2Lne-A",
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
