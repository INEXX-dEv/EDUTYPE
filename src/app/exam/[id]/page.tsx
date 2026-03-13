'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ExamClient } from '@/components/exam/ExamClient';
import { Loader2 } from 'lucide-react';

export default function ExamPage() {
  const params = useParams();
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/content/${params.id}`);
      const data = await res.json();
      if (res.ok && data.content?.exam) {
        setExam({
          id: data.content.exam.id,
          title: data.content.exam.title,
          contentTitle: data.content.title,
          passingScore: data.content.exam.passingScore,
          questions: data.content.exam.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options.map((o: any) => ({
              id: o.id,
              text: o.text,
            })),
          })),
        });
      } else {
        setError('Sınav bulunamadı');
      }
    } catch { setError('Hata oluştu'); }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <p className="text-red-400 text-lg">{error || 'Sınav bulunamadı'}</p>
        </main>
      </div>
    );
  }

  return (
    <ExamClient
      examId={exam.id}
      title={exam.title}
      questions={exam.questions}
      timeLimit={exam.timeLimit ?? null}
      passingScore={exam.passingScore}
      contentId={params.id as string}
    />
  );
}
