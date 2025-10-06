
import React from 'react';
import type { Lesson } from '../types';
import { BookIcon, ArrowRightIcon } from './icons';

interface LessonSelectorProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

const LessonSelector: React.FC<LessonSelectorProps> = ({ lessons, onSelectLesson }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 text-center">
        <h2 className="text-3xl font-bold text-sky-800">My Lessons</h2>
        <p className="text-slate-500 mt-2">Select a lesson to begin your study session.</p>
      </div>
      
      {lessons.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-slate-700">No lessons yet!</h3>
          <p className="text-slate-500 mt-2">Click on "Create Lesson" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => onSelectLesson(lesson)}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex-shrink-0 bg-sky-100 text-sky-600 p-2 rounded-full">
                    <BookIcon />
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 truncate">{lesson.title}</h3>
                </div>
                <p className="text-sm text-slate-500 line-clamp-3">
                  {lesson.readingText}
                </p>
              </div>
              <div className="flex items-center justify-end text-sm font-semibold text-sky-600 mt-4">
                Start Learning <ArrowRightIcon />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonSelector;
