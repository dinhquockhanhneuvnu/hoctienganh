
import { useState, useEffect } from 'react';
import type { Lesson } from '../types';

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/lessons');
        if (!response.ok) {
          setLessons([]);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setLessons(data);
        } else if (Array.isArray(data?.lessons)) {
          setLessons(data.lessons);
        } else {
          setLessons([]);
        }
      } catch (error) {
        console.error("Failed to load lessons from file, starting fresh.", error);
        setLessons([]); // Start with an empty list if there's an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return { lessons, isLoading };
};
