import path from 'path';
import fs from 'fs/promises';
import { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const lessonsApiPlugin = (): Plugin => {
  const dataDir = path.resolve(__dirname, 'data');
  const lessonsFile = path.join(dataDir, 'lessons.json');
  const audioDir = path.join(dataDir, 'audio');
  const quizzesDir = path.join(dataDir, 'quizzes');

  const readBody = async (req: IncomingMessage) => {
    return await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  };

  const loadLessons = async () => {
    try {
      const content = await fs.readFile(lessonsFile, 'utf8');
      const trimmed = content.trim();
      return trimmed ? JSON.parse(trimmed) : [];
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  };

  const writeLessons = async (lessons: unknown[]) => {
    await fs.mkdir(dataDir, { recursive: true });
    const sanitized = Array.isArray(lessons)
      ? lessons.map((lesson) => {
          if (lesson && typeof lesson === 'object') {
            const { quizQuestions, hasQuiz, ...rest } = lesson as Record<string, unknown>;
            return rest;
          }
          return lesson;
        })
      : lessons;
    await fs.writeFile(lessonsFile, JSON.stringify(sanitized, null, 2));
  };

  const writeAudioFile = async (filename: string, base64: string) => {
    if (!filename || !base64) {
      return;
    }
    const safeName = path.basename(filename);
    const buffer = Buffer.from(base64, 'base64');
    await fs.mkdir(audioDir, { recursive: true });
    await fs.writeFile(path.join(audioDir, safeName), buffer);
  };

  const quizFilePath = (lessonId: string) => path.join(quizzesDir, `${lessonId}.json`);

  const writeQuizFile = async (lessonId: string, quizQuestions: unknown[]) => {
    if (!lessonId) {
      return;
    }
    await fs.mkdir(quizzesDir, { recursive: true });
    await fs.writeFile(quizFilePath(lessonId), JSON.stringify(quizQuestions ?? [], null, 2));
  };

  const readQuizFile = async (lessonId: string) => {
    const filePath = quizFilePath(lessonId);
    const content = await fs.readFile(filePath, 'utf8');
    const trimmed = content.trim();
    return trimmed ? JSON.parse(trimmed) : [];
  };

  const fileExists = async (filePath: string) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || !req.url.startsWith('/api/lessons')) {
      return next();
    }

    const quizMatch = req.url.match(/^\/api\/lessons\/([^/]+)\/quiz$/);

    if (quizMatch && req.method === 'GET') {
      const lessonId = decodeURIComponent(quizMatch[1]);
      try {
        const quizQuestions = await readQuizFile(lessonId);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ quizQuestions }));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ quizQuestions: [] }));
          return;
        }
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Failed to load quiz questions', error: (error as Error).message }));
      }
      return;
    }

    if (req.method === 'GET') {
      try {
        const lessons = await loadLessons();
        const withFlags = await Promise.all(
          (Array.isArray(lessons) ? lessons : []).map(async (lesson) => {
            if (lesson && typeof lesson === 'object') {
              const typedLesson = lesson as Record<string, unknown>;
              const lessonId = typeof typedLesson.id === 'string' ? typedLesson.id : '';
              const hasQuiz = lessonId ? await fileExists(quizFilePath(lessonId)) : false;
              return { ...typedLesson, hasQuiz };
            }
            return lesson;
          })
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ lessons: withFlags }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Failed to load lessons', error: (error as Error).message }));
      }
      return;
    }

    if (req.method === 'POST') {
      try {
        const rawBody = await readBody(req);
        if (!rawBody) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Request body is empty' }));
          return;
        }

        const payload = JSON.parse(rawBody);
        const { lesson, readingAudio, reviewAudio, quizQuestions } = payload ?? {};

        if (!lesson || !lesson.id) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Lesson payload is invalid' }));
          return;
        }

        const lessonForStorage = { ...lesson };
        delete (lessonForStorage as Record<string, unknown>).quizQuestions;
        delete (lessonForStorage as Record<string, unknown>).hasQuiz;
        
        if (readingAudio?.data) {
          await writeAudioFile(readingAudio.filename, readingAudio.data);
        }

        if (reviewAudio?.data) {
          await writeAudioFile(reviewAudio.filename, reviewAudio.data);
        }

        const lessons = await loadLessons();
        const index = Array.isArray(lessons) ? lessons.findIndex((item) => item.id === lesson.id) : -1;
        if (Array.isArray(lessons)) {
          if (index >= 0) {
            lessons[index] = lessonForStorage;
          } else {
            lessons.push(lessonForStorage);
          }
        }

        await writeLessons(Array.isArray(lessons) ? lessons : [lessonForStorage]);

        if (Array.isArray(quizQuestions)) {
          await writeQuizFile(lesson.id, quizQuestions);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const hasQuiz = Array.isArray(quizQuestions) && quizQuestions.length > 0;
        res.end(JSON.stringify({ lesson: { ...lessonForStorage, hasQuiz } }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Failed to save lesson', error: (error as Error).message }));
      }
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
  };

  return {
    name: 'lessons-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handler(req, res, next).catch(next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handler(req, res, next).catch(next);
      });
    },
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), lessonsApiPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
