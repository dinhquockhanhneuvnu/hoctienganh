import React, { useState, useEffect } from 'react';
import type { Lesson } from './types';
import { View } from './types';
import Header from './components/Header';
import LessonCreator from './components/LessonCreator';
import LessonSelector from './components/LessonSelector';
import LessonViewer from './components/LessonViewer';
import { useLessons } from './hooks/useLessons';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.SELECTOR);
  const { lessons: initialLessons, isLoading } = useLessons();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setLessons(initialLessons);
    }
  }, [initialLessons, isLoading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const handleLessonCreated = async (newLesson: Lesson, files: { reading: File, review: File }) => {
    try {
      const [readingAudio, reviewAudio] = await Promise.all([
        fileToBase64(files.reading),
        fileToBase64(files.review),
      ]);

      const { quizQuestions, ...lessonWithoutQuiz } = newLesson;

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson: lessonWithoutQuiz,
          readingAudio: { filename: newLesson.readingAudio, data: readingAudio },
          reviewAudio: { filename: newLesson.reviewAudio, data: reviewAudio },
          quizQuestions,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload?.message ?? 'Failed to save lesson. Please try again.';
        throw new Error(message);
      }

      const savedLesson = payload?.lesson ?? lessonWithoutQuiz;
      const enrichedLesson = { ...savedLesson, hasQuiz: payload?.lesson?.hasQuiz ?? (quizQuestions?.length ?? 0) > 0 } as Lesson;
      setLessons(prev => {
        const filtered = prev.filter(lesson => lesson.id !== enrichedLesson.id);
        return [...filtered, enrichedLesson];
      });
      setView(View.SELECTOR);
    } catch (error) {
      console.error('Failed to save lesson', error);
      alert(error instanceof Error ? error.message : 'Failed to save lesson.');
      throw error;
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setView(View.VIEWER);
  };

  const navigateTo = (newView: View) => {
    setSelectedLesson(null);
    setView(newView);
  };


  const renderContent = () => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner/> Loading lessons...</div>
    }

    switch (view) {
      case View.CREATOR:
        return <LessonCreator onLessonCreated={handleLessonCreated} />;
      case View.VIEWER:
        return selectedLesson ? <LessonViewer lesson={selectedLesson} /> : <LessonSelector lessons={lessons} onSelectLesson={handleSelectLesson} />;
      case View.SELECTOR:
      default:
        return <LessonSelector lessons={lessons} onSelectLesson={handleSelectLesson} />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <Header 
        currentView={view} 
        setView={navigateTo}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
