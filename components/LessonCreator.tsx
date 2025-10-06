import React, { useState } from 'react';
import type { Lesson } from '../types';
import { generateFlashcards, generateQuizQuestions } from '../services/geminiService';
import Spinner from './Spinner';
import { BookIcon, MicIcon, SparklesIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';

interface LessonCreatorProps {
  onLessonCreated: (lesson: Lesson, files: { reading: File; review: File }) => Promise<void> | void;
}

const LessonCreator: React.FC<LessonCreatorProps> = ({ onLessonCreated }) => {
  const [step, setStep] = useState(1);
  const [readingText, setReadingText] = useState('');
  const [readingAudio, setReadingAudio] = useState<File | null>(null);
  const [vocabularyText, setVocabularyText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewAudio, setReviewAudio] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
        case 1:
            return readingText.trim() !== '' && readingAudio !== null;
        case 2:
            return vocabularyText.trim() !== '';
        case 3:
            return reviewText.trim() !== '' && reviewAudio !== null;
        default:
            return false;
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(1) || !isStepValid(2) || !isStepValid(3) || !readingAudio || !reviewAudio) {
      setError("Please complete all fields before creating the lesson.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const [flashcards, quizQuestions] = await Promise.all([
        generateFlashcards(vocabularyText),
        generateQuizQuestions(vocabularyText),
      ]);
      
      const lessonId = new Date().toISOString().replace(/[:.]/g, '-');
      const readingAudioFilename = `${lessonId}-reading.${readingAudio.name.split('.').pop()}`;
      const reviewAudioFilename = `${lessonId}-review.${reviewAudio.name.split('.').pop()}`;

      const newLesson: Lesson = {
        id: lessonId,
        title: readingText.substring(0, 30) + '...',
        readingText,
        readingAudio: readingAudioFilename,
        flashcards,
        quizQuestions,
        reviewText,
        reviewAudio: reviewAudioFilename,
      };
      
      await onLessonCreated(newLesson, { reading: readingAudio, review: reviewAudio });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Step 1: Reading Passage</h3>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              rows={8}
              placeholder="Enter the main reading text here..."
              value={readingText}
              onChange={(e) => setReadingText(e.target.value)}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Upload Reading Audio</label>
              <input type="file" accept="audio/*" onChange={(e) => e.target.files && setReadingAudio(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
              {readingAudio && <p className="text-sm text-green-600 mt-2">File selected: {readingAudio.name}</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Step 2: Vocabulary</h3>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              rows={8}
              placeholder="Enter vocabulary words, separated by commas (e.g., apple, book, curious)..."
              value={vocabularyText}
              onChange={(e) => setVocabularyText(e.target.value)}
            />
             <div className="mt-4 text-sm text-slate-500">
                <p>Gemini AI sẽ tạo flashcard và câu hỏi trắc nghiệm dựa trên danh sách từ này.</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Step 3: Review Passage</h3>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              rows={8}
              placeholder="Enter the review text here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Upload Review Audio</label>
              <input type="file" accept="audio/*" onChange={(e) => e.target.files && setReviewAudio(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
              {reviewAudio && <p className="text-sm text-green-600 mt-2">File selected: {reviewAudio.name}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const stepIcons = [<BookIcon />, <SparklesIcon />, <MicIcon />];

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2 text-sky-800">Create a New Lesson</h2>
      <p className="text-center text-slate-500 mb-8">Follow the steps below to build your interactive lesson.</p>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-8 px-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= stepNum ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {step > stepNum ? <CheckCircleIcon /> : stepIcons[stepNum - 1]}
              </div>
              <p className={`mt-2 text-sm font-medium ${step >= stepNum ? 'text-sky-600' : 'text-slate-500'}`}>
                Step {stepNum}
              </p>
            </div>
            {stepNum < totalSteps && <div className={`flex-1 h-1 mx-4 transition-colors duration-300 ${step > stepNum ? 'bg-sky-600' : 'bg-slate-200'}`}></div>}
          </React.Fragment>
        ))}
      </div>
      
      <div className="min-h-[300px]">
        {renderStepContent()}
      </div>

      {error && <p className="text-red-500 text-sm my-4 text-center">{error}</p>}
      
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrev}
          disabled={step === 1 || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ArrowLeftIcon /> Previous
        </button>

        {step < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid(step) || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:bg-sky-300 disabled:cursor-not-allowed transition"
          >
            Next <ArrowRightIcon />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isStepValid(3) || isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:bg-green-300 disabled:cursor-not-allowed transition"
          >
            {isLoading ? <><Spinner /> Creating...</> : <><CheckCircleIcon /> Create Lesson</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonCreator;
