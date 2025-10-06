
import { GoogleGenAI, Type } from "@google/genai";
import type { Flashcard, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const flashcardSchema = {
  type: Type.OBJECT,
  properties: {
    word: {
      type: Type.STRING,
      description: 'The English word.',
    },
    vietnameseMeaning: {
      type: Type.STRING,
      description: 'The Vietnamese translation of the word.',
    },
    partOfSpeech: {
      type: Type.STRING,
      description: 'The grammatical part of speech (e.g., noun, verb, adjective).',
    },
    exampleSentence: {
      type: Type.STRING,
      description: 'An example sentence using the word in English.',
    },
  },
  required: ['word', 'vietnameseMeaning', 'partOfSpeech', 'exampleSentence'],
};

const quizOptionSchema = {
  type: Type.OBJECT,
  properties: {
    label: {
      type: Type.STRING,
      description: 'Single uppercase letter representing the option label, e.g., A.',
    },
    text: {
      type: Type.STRING,
      description: 'Vietnamese meaning shown to the learner.',
    },
  },
  required: ['label', 'text'],
};

const quizQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    vocabularyWord: {
      type: Type.STRING,
      description: 'The English vocabulary word the question tests.',
    },
    question: {
      type: Type.STRING,
      description: 'The main question sentence in Vietnamese asking for the meaning of the word.',
    },
    hints: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: 'Hints written as short Vietnamese sentences beginning with the vocabulary word.',
      },
    },
    options: {
      type: Type.ARRAY,
      items: quizOptionSchema,
    },
    correctOption: {
      type: Type.STRING,
      description: 'The label of the correct option, e.g., A.',
    },
  },
  required: ['vocabularyWord', 'question', 'hints', 'options', 'correctOption'],
};

export const generateFlashcards = async (vocabulary: string): Promise<Flashcard[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create flashcards for the following comma-separated English words: ${vocabulary}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: flashcardSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    const flashcards = JSON.parse(jsonText);

    // Ensure the output is an array
    if (!Array.isArray(flashcards)) {
        throw new Error("API did not return a valid array of flashcards.");
    }
    
    return flashcards;

  } catch (error) {
    console.error("Error generating flashcards with Gemini:", error);
    throw new Error("Failed to generate flashcards. Please check your vocabulary list and try again.");
  }
};

export const generateQuizQuestions = async (vocabulary: string): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Bạn là giáo viên tiếng Anh tạo câu hỏi trắc nghiệm để ôn tập từ vựng. Với danh sách từ sau (phân cách bằng dấu phẩy): ${vocabulary}. Với mỗi từ, tạo 1 câu hỏi theo mẫu:
- Câu hỏi tiếng Việt: "Theo bạn từ [word] có nghĩa là gì? Tôi gợi ý nhé:".
- Viết đúng 3 câu gợi ý tiếng Việt, mỗi câu bắt đầu bằng từ vựng, mô tả đặc điểm đặc trưng của vật / khái niệm đó.
- Tạo 3 đáp án lựa chọn, được gắn nhãn A, B, C. Chỉ một đáp án đúng, là nghĩa tiếng Việt chính xác của từ. Các đáp án còn lại là nhiễu nhưng cùng chủ đề.
- Trả về JSON đúng với schema đã cho, không thêm văn bản thừa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: quizQuestionSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    const quizQuestions = JSON.parse(jsonText);

    if (!Array.isArray(quizQuestions)) {
      throw new Error("API did not return a valid array of quiz questions.");
    }

    return quizQuestions;

  } catch (error) {
    console.error("Error generating quiz questions with Gemini:", error);
    throw new Error("Failed to generate quiz questions. Please check your vocabulary list and try again.");
  }
};
