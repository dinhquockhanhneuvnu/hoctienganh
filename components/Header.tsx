
import React from 'react';
import { View } from '../types';
import { BookOpenIcon, PlusCircleIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const navItemClasses = "flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200";
  const activeClasses = "bg-sky-600 text-white shadow";
  const inactiveClasses = "text-slate-600 hover:bg-sky-100";

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
            <img src="https://picsum.photos/40/40" alt="logo" className="rounded-full" />
            <h1 className="text-2xl font-bold text-sky-700">DivoVoca</h1>
        </div>
        <nav className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setView(View.SELECTOR)}
            className={`${navItemClasses} ${currentView !== View.CREATOR ? activeClasses : inactiveClasses}`}
          >
            <BookOpenIcon />
            <span className="hidden md:inline">My Lessons</span>
          </button>
          <button
            onClick={() => setView(View.CREATOR)}
            className={`${navItemClasses} ${currentView === View.CREATOR ? activeClasses : inactiveClasses}`}
          >
            <PlusCircleIcon />
            <span className="hidden md:inline">Create Lesson</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
