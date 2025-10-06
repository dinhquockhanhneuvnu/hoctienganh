
import React, { useState } from 'react';
import type { Flashcard } from '../types';
import { speak } from '../services/speechService';
import { VolumeIcon, RefreshCwIcon } from './icons';

interface FlashcardProps {
  flashcard: Flashcard;
}

const FlashcardComponent: React.FC<FlashcardProps> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [flashcard]);

  return (
    <div className="w-full max-w-sm h-64 [perspective:1000px]">
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-6 cursor-pointer">
          <h3 className="text-4xl font-bold text-slate-800 text-center">{flashcard.word}</h3>
          <p className="text-slate-500 mt-2">({flashcard.partOfSpeech})</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              speak(flashcard.word);
            }} 
            className="absolute top-4 right-4 text-slate-400 hover:text-sky-600 transition"
            aria-label={`Listen to the word ${flashcard.word}`}
            title="Listen"
          >
            <VolumeIcon />
          </button>
          <div className="absolute bottom-4 text-xs text-slate-400 flex items-center gap-1">
             <RefreshCwIcon className="w-3 h-3"/> Click to flip
          </div>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-sky-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-6 cursor-pointer [transform:rotateY(180deg)]">
          <p className="text-lg font-semibold text-sky-200">{flashcard.word}</p>
          <h4 className="text-3xl font-bold mt-1 text-center">{flashcard.vietnameseMeaning}</h4>
          <p className="text-center text-sm mt-4 text-sky-100 italic">"{flashcard.exampleSentence}"</p>
           <button 
            onClick={(e) => {
              e.stopPropagation();
              speak(flashcard.exampleSentence);
            }} 
            className="absolute top-4 right-4 text-sky-200 hover:text-white transition"
            aria-label="Listen to the example sentence"
            title="Listen to example"
          >
            <VolumeIcon />
          </button>
           <div className="absolute bottom-4 text-xs text-sky-200 flex items-center gap-1">
             <RefreshCwIcon className="w-3 h-3"/> Click to flip
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardComponent;
