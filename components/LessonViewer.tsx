import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Lesson, Flashcard, QuizQuestion } from '../types';
import { speak } from '../services/speechService';
import FlashcardComponent from './Flashcard';
import { BookIcon, SparklesIcon, MicIcon, QuestionMarkIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface LessonViewerProps {
  lesson: Lesson;
}

const ReadingStep: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const [activeWord, setActiveWord] = useState<Flashcard | null>(null);

  const parsedText = useMemo(() => {
    if (!lesson.flashcards.length) {
      return [lesson.readingText];
    }

    const vocabWords = lesson.flashcards.map((f) => f.word);
    const regex = new RegExp(`\\b(${vocabWords.join('|')})\\b`, 'gi');

    return lesson.readingText.split(regex).map((part, index) => {
      const matchingCard = lesson.flashcards.find((card) => card.word.toLowerCase() === part.toLowerCase());
      if (matchingCard) {
        return (
          <span
            key={index}
            className="bg-sky-100 text-sky-700 font-bold rounded px-1 py-0.5 cursor-pointer hover:bg-sky-200 transition"
            onClick={() => {
              setActiveWord(matchingCard);
              speak(matchingCard.word);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }, [lesson]);

  return (
    <div className="relative">
      <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">{parsedText}</p>
      {activeWord && (
        <div className="mt-6 p-4 bg-sky-50 border-l-4 border-sky-500 rounded-r-lg shadow">
          <h4 className="text-xl font-bold text-sky-800">{activeWord.word}</h4>
          <p className="text-slate-600 italic">({activeWord.partOfSpeech})</p>
          <p className="text-lg text-slate-800 mt-2">{activeWord.vietnameseMeaning}</p>
          <p className="text-slate-500 mt-2">"{activeWord.exampleSentence}"</p>
        </div>
      )}
    </div>
  );
};

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson }) => {
  const [step, setStep] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(lesson.quizQuestions ?? null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isConvertedJson, setIsConvertedJson] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  const convertedQuiz = useMemo(() => {
    if (!quizQuestions) {
      return { quiz: [] as Array<Record<string, unknown>> };
    }

    const converted = quizQuestions.map((question) => {
      const questionLines = [question.question, ...question.hints].filter(Boolean);
      const options = question.options.reduce<Record<string, string>>((acc, option) => {
        acc[option.label] = option.text;
        return acc;
      }, {});

      return {
        question: questionLines.join('\n'),
        options,
        answer: question.correctOption,
      };
    });

    return { quiz: converted };
  }, [quizQuestions]);

  const originalJsonString = useMemo(() => {
    if (!quizQuestions) {
      return '[]';
    }
    return JSON.stringify(quizQuestions, null, 2);
  }, [quizQuestions]);

  const convertedJsonString = useMemo(() => JSON.stringify(convertedQuiz, null, 2), [convertedQuiz]);

  const currentJsonString = isConvertedJson ? convertedJsonString : originalJsonString;

  const hasQuizFlag = lesson.hasQuiz ?? false;
  const hasLoadedQuiz = (quizQuestions?.length ?? 0) > 0;
  const hasQuiz = hasQuizFlag || hasLoadedQuiz;

  const steps = hasQuiz
    ? [
        { name: 'Reading', icon: <BookIcon /> },
        { name: 'Flashcards', icon: <SparklesIcon /> },
        { name: 'Quiz', icon: <QuestionMarkIcon /> },
        { name: 'Review', icon: <MicIcon /> },
      ]
    : [
        { name: 'Reading', icon: <BookIcon /> },
        { name: 'Flashcards', icon: <SparklesIcon /> },
        { name: 'Review', icon: <MicIcon /> },
      ];

  const resetCheckState = (questionId: string) => {
    setCheckedQuestions((prev) => {
      if (!prev[questionId]) {
        return prev;
      }
      const { [questionId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSelectAnswer = (questionId: string, optionLabel: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
    resetCheckState(questionId);
  };

  const handleCheckAnswer = (questionId: string) => {
    setCheckedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleCopyJson = async () => {
    if (!currentJsonString) {
      return;
    }
    try {
      await navigator.clipboard.writeText(currentJsonString);
      setCopyMessage('Đã sao chép JSON vào clipboard.');
    } catch (error) {
      console.error('Failed to copy JSON', error);
      setCopyMessage('Trình duyệt không hỗ trợ sao chép tự động. Hãy chọn và sao chép thủ công.');
    }
  };

  const getOptionClasses = (questionId: string, optionLabel: string, correctOption: string) => {
    const isChecked = !!checkedQuestions[questionId];
    const selected = selectedAnswers[questionId];
    const isSelected = selected === optionLabel;
    const isCorrectOption = optionLabel === correctOption;

    if (isChecked) {
      if (isCorrectOption) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700';
      }
      if (isSelected) {
        return 'border-red-500 bg-red-50 text-red-600';
      }
    }

    if (isSelected) {
      return 'border-sky-500 bg-sky-50 text-sky-700';
    }

    return 'border-slate-200 bg-white hover:border-sky-400';
  };

  useEffect(() => {
    setStep(1);
    setCurrentCardIndex(0);
    setSelectedAnswers({});
    setCheckedQuestions({});
    setIsConvertedJson(false);
    setCopyMessage(null);
    setQuizQuestions(lesson.quizQuestions ?? null);
    setQuizError(null);
    setQuizLoading(false);
  }, [lesson.id, lesson.quizQuestions]);

  const fetchQuizQuestions = useCallback(async () => {
    if (!hasQuiz || quizQuestions !== null || quizLoading) {
      return;
    }
    setQuizLoading(true);
    setQuizError(null);
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lesson.id)}/quiz`);
      if (response.status === 404) {
        setQuizQuestions([]);
        return;
      }
      if (!response.ok) {
        throw new Error('Không thể tải câu hỏi trắc nghiệm.');
      }
      const payload = await response.json();
      const quizData = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.quizQuestions)
          ? payload.quizQuestions
          : [];
      setQuizQuestions(quizData);
    } catch (error) {
      console.error('Failed to load quiz questions', error);
      setQuizError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải câu hỏi trắc nghiệm.');
    } finally {
      setQuizLoading(false);
    }
  }, [hasQuiz, quizQuestions, quizLoading, lesson.id]);

  useEffect(() => {
    if (!hasQuiz) {
      return;
    }
    const quizStepIndex = 3;
    if (step === quizStepIndex) {
      void fetchQuizQuestions();
    }
  }, [step, hasQuiz, fetchQuizQuestions]);

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % Math.max(lesson.flashcards.length, 1));
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + Math.max(lesson.flashcards.length, 1)) % Math.max(lesson.flashcards.length, 1));
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <>
          <h3 className="text-2xl font-bold mb-4 text-slate-800">Reading Passage</h3>
          <audio controls src={`/data/audio/${lesson.readingAudio}`} className="w-full mb-4"></audio>
          <ReadingStep lesson={lesson} />
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <h3 className="text-2xl font-bold mb-4 text-center text-slate-800">Vocabulary Flashcards</h3>
          {lesson.flashcards.length === 0 ? (
            <p className="text-slate-500">Chưa có flashcard cho bài học này.</p>
          ) : (
            <div className="flex flex-col items-center">
              <FlashcardComponent flashcard={lesson.flashcards[currentCardIndex]} />
              <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-sm">
                <button onClick={handlePrevCard} className="p-3 bg-white rounded-full shadow-md hover:bg-slate-100 transition"><ChevronLeftIcon /></button>
                <p className="text-slate-600 font-medium">{currentCardIndex + 1} / {lesson.flashcards.length}</p>
                <button onClick={handleNextCard} className="p-3 bg-white rounded-full shadow-md hover:bg-slate-100 transition"><ChevronRightIcon /></button>
              </div>
            </div>
          )}
        </>
      );
    }

    if (hasQuiz && step === 3) {
      const showConversionButton = quizQuestions !== null && !quizLoading;
      return (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-2xl font-bold text-slate-800">Trắc nghiệm ôn tập</h3>
            <button
              onClick={() => {
                if (!showConversionButton) {
                  return;
                }
                setIsConvertedJson((prev) => !prev);
                setCopyMessage(null);
              }}
              className="self-start md:self-auto px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 transition disabled:opacity-50"
              disabled={!showConversionButton}
            >
              {isConvertedJson ? 'Xem JSON gốc' : 'Chuyển đổi JSON'}
            </button>
          </div>

          <p className="text-slate-600 mb-4">Chọn đáp án đúng cho mỗi câu hỏi, sau đó ấn "Kiểm tra" để xem kết quả.</p>

          {quizLoading && <p className="text-slate-500">Đang tải câu hỏi trắc nghiệm...</p>}
          {quizError && <p className="text-red-500 text-sm mb-4">{quizError}</p>}

          {!quizLoading && !quizError && (quizQuestions?.length ?? 0) === 0 && (
            <p className="text-slate-500">Chưa có câu hỏi trắc nghiệm cho bài học này.</p>
          )}

          <div className="space-y-6">
            {quizQuestions?.map((question) => {
              const questionId = `${lesson.id}-${question.vocabularyWord}`;
              const selected = selectedAnswers[questionId];
              const isChecked = !!checkedQuestions[questionId];
              const isCorrect = isChecked && selected === question.correctOption;

              return (
                <div key={questionId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-lg font-semibold text-slate-800 mb-3">{question.question}</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                    {question.hints.map((hint, index) => (
                      <li key={`${questionId}-hint-${index}`}>{hint}</li>
                    ))}
                  </ul>
                  <div className="space-y-3 mb-4">
                    {question.options.map((option) => (
                      <label
                        key={`${questionId}-${option.label}`}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${getOptionClasses(questionId, option.label, question.correctOption)}`}
                      >
                        <input
                          type="radio"
                          name={questionId}
                          value={option.label}
                          className="sr-only"
                          checked={selected === option.label}
                          onChange={() => handleSelectAnswer(questionId, option.label)}
                        />
                        <span className="font-semibold">{option.label}.</span>
                        <span className="text-slate-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCheckAnswer(questionId)}
                    disabled={!selected}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kiểm tra
                  </button>
                  {isChecked && (
                    <p className={`mt-3 font-medium ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isCorrect ? 'Chính xác! Bạn đã chọn đúng.' : `Chưa đúng. Đáp án chính xác là ${question.correctOption}.`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {quizQuestions && quizQuestions.length > 0 && (
            <div className="mt-6 bg-slate-100 border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-slate-700">{isConvertedJson ? 'JSON chuyển đổi' : 'JSON gốc'}</h4>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
                >
                  Sao chép
                </button>
              </div>
              <textarea
                readOnly
                value={currentJsonString}
                className="w-full h-60 font-mono text-sm text-slate-700 bg-white border border-slate-300 rounded-md p-3"
              />
              {copyMessage && <p className="text-xs text-slate-500 mt-2">{copyMessage}</p>}
            </div>
          )}
        </>
      );
    }

    if ((hasQuiz && step === 4) || (!hasQuiz && step === 3)) {
      return (
        <>
          <h3 className="text-2xl font-bold mb-4 text-slate-800">Review Passage</h3>
          <audio controls src={`/data/audio/${lesson.reviewAudio}`} className="w-full mb-4"></audio>
          <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">{lesson.reviewText}</p>
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-4 text-sky-800">{lesson.title}</h2>
      <p className="text-slate-500 text-center md:text-left mb-6">Tự động lưu và ôn tập từ vựng với EngageLearn.</p>

      <div className="flex justify-center border-b border-slate-200 mb-6">
        {steps.map((s, index) => (
          <button
            key={s.name}
            onClick={() => setStep(index + 1)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors duration-200 border-b-2 ${step === index + 1 ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-sky-500'}`}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default LessonViewer;
