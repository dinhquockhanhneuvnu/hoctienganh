export interface Flashcard {
  word: string;
  vietnameseMeaning: string;
  partOfSpeech: string;
  exampleSentence: string;
}

export interface QuizOption {
  label: string;
  text: string;
}

export interface QuizQuestion {
  vocabularyWord: string;
  question: string;
  hints: string[];
  options: QuizOption[];
  correctOption: string;
}

export interface Lesson {
  id: string;
  title: string;
  readingText: string;
  readingAudio: string; // filename, e.g., 'lesson-1-reading.mp3'
  flashcards: Flashcard[];
  reviewText: string;
  reviewAudio: string; // filename, e.g., 'lesson-1-review.mp3'
  quizQuestions?: QuizQuestion[];
  hasQuiz?: boolean;
}

export enum View {
  CREATOR = 'creator',
  SELECTOR = 'selector',
  VIEWER = 'viewer',
}
