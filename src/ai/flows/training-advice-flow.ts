'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingAdviceInputSchema = z.object({
  trainingGoal: z.string().describe('The primary training goal of the user (e.g., "Ganar Músculo", "Perder Peso").'),
  currentRoutineDetails: z.string().optional().describe('Optional details provided by the user about their current workout routine, challenges, or specific questions.'),
});
export type TrainingAdviceInput = z.infer<typeof TrainingAdviceInputSchema>;

const TrainingAdviceOutputSchema = z.object({
  advice: z.string().describe('Actionable, structured advice for training progression tailored to the user\'s goal and provided details.'),
});
export type TrainingAdviceOutput = z.infer<typeof TrainingAdviceOutputSchema>;

export async function getTrainingAdvice(input: TrainingAdviceInput): Promise<TrainingAdviceOutput> {
  return trainingAdviceFlow(input);
}

const trainingAdvicePrompt = ai.definePrompt({
  name: 'trainingAdvicePrompt',
  input: {schema: TrainingAdviceInputSchema},
  output: {schema: TrainingAdviceOutputSchema},
  prompt: `Eres un asesor de fitness experto y motivador. Tu objetivo es ayudar al usuario a progresar en sus entrenamientos.

Objetivo principal de entrenamiento del usuario: {{{trainingGoal}}}

{{#if currentRoutineDetails}}
Detalles adicionales o preguntas del usuario sobre su rutina actual:
"{{{currentRoutineDetails}}}"
{{/if}}

Por favor, proporciona consejos claros, accionables y estructurados sobre cómo el usuario puede lograr una progresión efectiva en sus ejercicios, enfocándote en su objetivo principal. 
Cubre principios clave como:
- Sobrecarga progresiva (cómo implementarla específicamente para su objetivo).
- Variación de ejercicios (cuándo y cómo introducirla).
- Importancia del descanso y la recuperación.
- Consideraciones básicas de nutrición que apoyan la progresión (mantén esto breve y general).
- Cómo mantenerse motivado y superar estancamientos.
- Consejos prácticos para ajustar la rutina según el progreso y las necesidades del usuario.
- Si el usuario ha proporcionado detalles adicionales, intenta abordarlos directamente en tus consejos.
- Si el usuario no ha proporcionado detalles, ofrece consejos generales que sean aplicables a su objetivo.
- tiempo estimado para ver resultados significativos (por ejemplo, "Puedes esperar ver mejoras en 4-6 semanas si sigues estos consejos").
-tiempo estimado optimo para descansar entre series y ejercicios (por ejemplo, "Descansa entre 60-90 segundos entre series para maximizar la recuperación y el rendimiento").
- tiempo estimado para realizar un entrenamiento efectivo (por ejemplo, "Un entrenamiento efectivo puede durar entre 45 minutos y 1 hora, dependiendo de la intensidad y el número de ejercicios").
- tiempo estimado para realizar un calentamiento adecuado (por ejemplo, "Dedica al menos 10-15 minutos a un calentamiento dinámico antes de comenzar tu rutina de entrenamiento").


Adapta tus consejos al objetivo "{{{trainingGoal}}}". Si el usuario hizo preguntas específicas en "Detalles adicionales", intenta abordarlas.
Ofrece el consejo en un formato fácil de leer. Puedes usar listas o párrafos cortos.
El tono debe ser alentador y práctico.
Limita la respuesta a unos 3-5 párrafos concisos o una lista de 5-7 puntos clave.
`,
});

const trainingAdviceFlow = ai.defineFlow(
  {
    name: 'trainingAdviceFlow',
    inputSchema: TrainingAdviceInputSchema,
    outputSchema: TrainingAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await trainingAdvicePrompt(input);
    if (!output) {
      throw new Error("La IA no pudo generar un consejo en este momento. Inténtalo de nuevo.");
    }
    return output;
  }
);
