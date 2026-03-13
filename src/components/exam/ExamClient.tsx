'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  RotateCcw,
  Award,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamQuestion {
  id: string;
  question: string;
  order: number;
  options: { id: string; text: string; order: number }[];
}

interface ExamPageProps {
  examId: string;
  title: string;
  questions: ExamQuestion[];
  timeLimit: number | null;
  passingScore: number;
  contentId: string;
}

export function ExamClient({ examId, title, questions, timeLimit, passingScore, contentId }: ExamPageProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : 0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [examState, setExamState] = useState<'intro' | 'active' | 'submitting' | 'result'>('intro');
  const [result, setResult] = useState<any>(null);
  const [mustRestart, setMustRestart] = useState(false);

  // Tab Switch Detection
  useEffect(() => {
    if (examState !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          setMustRestart(true);
          setShowWarning(true);
          return newCount;
        });
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        setMustRestart(true);
        setShowWarning(true);
        return newCount;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examState]);

  // Timer
  useEffect(() => {
    if (examState !== 'active' || !timeLimit) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, timeLimit]);

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setExamState('submitting');
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, answers, tabSwitchCount }),
      });

      const data = await res.json();

      if (data.restart) {
        setMustRestart(true);
        setShowWarning(true);
        setExamState('active');
        return;
      }

      if (!res.ok) {
        toast.error(data.error);
        setExamState('active');
        return;
      }

      setResult(data);
      setExamState('result');
    } catch {
      toast.error('Sınav gönderilirken hata oluştu');
      setExamState('active');
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setTabSwitchCount(0);
    setMustRestart(false);
    setShowWarning(false);
    setTimeLeft(timeLimit ? timeLimit * 60 : 0);
    setExamState('intro');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  // Tab Switch Warning Modal
  if (showWarning && mustRestart) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sınav İptal Edildi!</h2>
          <p className="text-surface-400 mb-6">
            Sınav sırasında başka bir sayfaya geçtiniz. Sınav güvenliği nedeniyle sınavınız iptal edildi ve baştan başlamanız gerekmektedir.
          </p>
          <p className="text-red-400 text-sm mb-6">Sayfa değiştirme sayısı: {tabSwitchCount}</p>
          <button onClick={handleRestart} className="btn-primary w-full flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Sınavı Baştan Başlat
          </button>
        </motion.div>
      </div>
    );
  }

  // Intro Screen
  if (examState === 'intro') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-lg w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-500/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">{title}</h1>
          <div className="space-y-3 my-6">
            <div className="flex items-center gap-3 text-surface-300 text-sm bg-surface-800/50 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>{questions.length} soru</span>
            </div>
            {timeLimit && (
              <div className="flex items-center gap-3 text-surface-300 text-sm bg-surface-800/50 p-3 rounded-xl">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{timeLimit} dakika süre</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-surface-300 text-sm bg-surface-800/50 p-3 rounded-xl">
              <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Geçme notu: %{passingScore}</span>
            </div>
            <div className="flex items-center gap-3 text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Sınav sırasında sayfa değiştirirseniz sınav baştan başlar!</span>
            </div>
          </div>
          <button
            onClick={() => setExamState('active')}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Sınava Başla <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Submitting  
  if (examState === 'submitting') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-surface-300">Sınav değerlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Result Screen
  if (examState === 'result' && result) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            result.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {result.passed ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {result.passed ? 'Tebrikler!' : 'Başarısız'}
          </h2>

          <div className={`text-5xl font-black my-6 ${
            result.passed ? 'text-emerald-400' : 'text-red-400'
          }`}>
            %{result.score}
          </div>

          <p className="text-surface-400 mb-2">
            {result.correctAnswers} / {result.totalQuestions} doğru cevap
          </p>

          {result.passed && result.certificate && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Award className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 text-sm font-medium">Sertifika Oluşturuldu!</p>
              <p className="text-emerald-400/70 text-xs mt-1">
                Kod: {result.certificate.certificateCode}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {!result.passed && (
              <button onClick={handleRestart} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Tekrar Dene
              </button>
            )}
            <button
              onClick={() => router.push(`/content/${contentId}`)}
              className="btn-primary flex-1"
            >
              İçeriğe Dön
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Exam
  return (
    <div className="min-h-screen bg-surface-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold">{title}</h2>
              <p className="text-surface-400 text-sm">
                Soru {currentQuestion + 1} / {questions.length}
              </p>
            </div>
            {timeLimit && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-surface-800 text-surface-300'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-surface-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-card p-6 md:p-8 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    answers[question.id] === option.id
                      ? 'bg-brand-500/20 border-2 border-brand-500 text-white'
                      : 'bg-surface-800/50 border-2 border-surface-700 text-surface-300 hover:bg-surface-700/50 hover:border-surface-600'
                  }`}
                >
                  <span className="font-medium">{option.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Önceki
          </button>

          {/* Question dots */}
          <div className="hidden md:flex gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentQuestion
                    ? 'bg-brand-500 scale-125'
                    : answers[questions[i].id]
                    ? 'bg-brand-500/50'
                    : 'bg-surface-700'
                }`}
              />
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Sınavı Bitir <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="btn-primary flex items-center gap-2"
            >
              Sonraki <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
