'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import {
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewContentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [contentId, setContentId] = useState('');

  // Step 1: Content Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasExam, setHasExam] = useState(false);

  // Step 2: Videos
  const [videos, setVideos] = useState<{ file: File; title: string; description: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});

  // Step 3: Exam Questions
  const [questions, setQuestions] = useState<{
    question: string;
    options: { text: string; isCorrect: boolean }[];
  }[]>([]);

  // PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Teacher Agreement
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [agreementScrolled, setAgreementScrolled] = useState(false);

  // Video dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newVideos = acceptedFiles
      .filter((f) => f.type.startsWith('video/'))
      .map((f) => ({
        file: f,
        title: f.name.replace(/\.[^/.]+$/, ''),
        description: '',
      }));
    setVideos((prev) => [...prev, ...newVideos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.ogg', '.mov'] },
    maxSize: 500 * 1024 * 1024,
  });

  // Step 1: Create Content
  const handleCreateContent = async () => {
    if (!title || !description) {
      toast.error('Başlık ve açıklama gereklidir');
      return;
    }
    if (!agreementAccepted) {
      setShowAgreement(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, hasExam }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setContentId(data.content.id);

      // Upload PDF if selected
      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append('file', pdfFile);
        const pdfRes = await fetch('/api/upload/pdf', { method: 'POST', body: pdfFormData });
        if (pdfRes.ok) {
          const pdfData = await pdfRes.json();
          await fetch(`/api/content/${data.content.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfUrl: pdfData.url, pdfFilename: pdfData.filename }),
          });
        }
      }

      toast.success('İçerik oluşturuldu');
      setStep(2);
    } catch { toast.error('Hata oluştu'); }
    finally { setIsLoading(false); }
  };

  // Step 2: Upload Videos
  const handleUploadVideos = async () => {
    if (videos.length === 0) {
      toast.error('En az 1 video yükleyin');
      return;
    }
    setIsLoading(true);
    try {
      for (let i = 0; i < videos.length; i++) {
        const formData = new FormData();
        formData.append('file', videos[i].file);
        formData.append('contentId', contentId);
        formData.append('title', videos[i].title);
        formData.append('description', videos[i].description);
        formData.append('order', i.toString());

        const res = await fetch('/api/upload/video', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(`Video ${i + 1} yüklenemedi: ${data.error}`);
          continue;
        }

        setUploadProgress((prev) => ({ ...prev, [i]: 100 }));
      }

      toast.success('Tüm videolar yüklendi');

      if (hasExam) {
        setStep(3);
      } else {
        // Publish content
        await publishContent();
      }
    } catch { toast.error('Yükleme hatası'); }
    finally { setIsLoading(false); }
  };

  // Step 3: Create Exam
  const handleCreateExam = async () => {
    if (questions.length === 0) {
      toast.error('En az 1 soru ekleyin');
      return;
    }

    for (const q of questions) {
      if (q.options.length < 3 || q.options.length > 5) {
        toast.error('Her sorunun 3-5 seçeneği olmalıdır');
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        toast.error('Her sorunun doğru cevabı seçilmelidir');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          title: `${title} Sınavı`,
          questions,
          passingScore: 60,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }
      await publishContent();
    } catch { toast.error('Hata oluştu'); }
    finally { setIsLoading(false); }
  };

  const publishContent = async () => {
    await fetch(`/api/content/${contentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    });
    toast.success('İçerik yayınlandı!');
    router.push('/dashboard');
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }] },
    ]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const addOption = (qi: number) => {
    if (questions[qi].options.length >= 5) return;
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qi].options.push({ text: '', isCorrect: false });
      return updated;
    });
  };

  const removeOption = (qi: number, oi: number) => {
    if (questions[qi].options.length <= 3) return;
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qi].options.splice(oi, 1);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, ...(hasExam ? [3] : [])].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${step === s ? 'bg-brand-500 text-white' : step > s ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-800 text-surface-500'
                  }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span className={`text-sm hidden sm:block ${step === s ? 'text-white' : 'text-surface-500'}`}>
                  {s === 1 ? 'Bilgiler' : s === 2 ? 'Videolar' : 'Sınav'}
                </span>
                {s < (hasExam ? 3 : 2) && <div className="w-12 h-px bg-surface-700" />}
              </div>
            ))}
          </div>

          {/* Step 1: Content Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">İçerik Bilgileri</h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-surface-300 mb-1.5 block">Başlık</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="İçerik başlığı" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1.5 block">Açıklama</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="İçerik hakkında bilgi" rows={4} className="input-field resize-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-surface-800/50 rounded-xl">
                  <input type="checkbox" checked={hasExam} onChange={(e) => setHasExam(e.target.checked)} className="w-5 h-5 rounded accent-brand-500" />
                  <div>
                    <span className="text-white text-sm font-medium">Sınav Ekle</span>
                    <p className="text-surface-400 text-xs">Videoların sonunda test olsun mu?</p>
                  </div>
                </label>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="text-sm text-surface-300 mb-1.5 block">PDF Materyal (Opsiyonel)</label>
                <div className="border-2 border-dashed border-surface-700 rounded-xl p-6 text-center hover:border-surface-600 transition-colors">
                  {pdfFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-white text-sm font-medium">{pdfFile.name}</p>
                          <p className="text-surface-400 text-xs">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => setPdfFile(null)} className="text-red-400 hover:text-red-300 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <FileText className="w-8 h-8 text-surface-500 mx-auto mb-2" />
                      <p className="text-surface-300 text-sm">PDF dosyası seçin</p>
                      <p className="text-surface-500 text-xs mt-1">Max 50MB</p>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              toast.error('PDF dosyası 50MB\'ı aşamaz');
                              return;
                            }
                            setPdfFile(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <button onClick={handleCreateContent} disabled={isLoading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Devam Et <ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.div>
          )}

          {/* Teacher Agreement Modal */}
          <AnimatePresence>
            {showAgreement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-card max-w-2xl w-full max-h-[80vh] flex flex-col"
                >
                  <div className="p-6 border-b border-surface-700/50">
                    <h3 className="text-xl font-bold text-white">Öğretmen İçerik Sözleşmesi</h3>
                    <p className="text-surface-400 text-sm mt-1">Lütfen sözleşmeyi sonuna kadar okuyup kabul edin</p>
                  </div>
                  <div
                    className="flex-1 overflow-y-auto p-6 text-surface-300 text-sm leading-relaxed space-y-4"
                    onScroll={(e) => {
                      const el = e.target as HTMLElement;
                      if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
                        setAgreementScrolled(true);
                      }
                    }}
                  >
                    <p><strong className="text-white">1. İçerik Sorumluluğu:</strong> Platforma yüklediğiniz tüm içeriklerin (video, PDF, metin, görsel) hukuki sorumluluğu tamamen size aittir. Platform (İNEXX INTERACTIVE), içeriklerin doğruluğu veya yasallığı konusunda sorumluluk kabul etmez.</p>
                    <p><strong className="text-white">2. Telif Hakları:</strong> Yüklediğiniz içeriklerin tüm telif hakları size aittir. Platform, içerikleriniz üzerinde yalnızca dağıtım lisansına sahiptir. İçeriklerinizi dilediğiniz zaman platformdan kaldırabilirsiniz.</p>
                    <p><strong className="text-white">3. Dağıtım Sınırlaması:</strong> İçerikleriniz yalnızca oluşturduğunuz gruplara dahil olan öğrencilere sunulacaktır. İzniniz olmadan başka gruplara veya genel erişime açılmayacaktır.</p>
                    <p><strong className="text-white">4. Üçüncü Taraf İçerikleri:</strong> Yüklediğiniz içeriklerin üçüncü kişilerin telif haklarını, ticari markalarını veya fikri mülkiyet haklarını ihlal etmediğini beyan ve taahhüt edersiniz.</p>
                    <p><strong className="text-white">5. Yasallara Uyum:</strong> İçeriklerinizin Türkiye Cumhuriyeti kanunları, AB GDPR, ABD DMCA ve ilgili uluslararası mevzuata uygun olduğunu kabul edersiniz.</p>
                    <p><strong className="text-white">6. İhlal Bildirimi:</strong> Telif hakkı ihlali bildirimlerinde içerikleriniz geçici olarak kaldırılabilir. Karşı bildirim (counter-notice) hakkınız saklıdır.</p>
                    <p><strong className="text-white">7. Tazminat:</strong> Yüklediğiniz içeriklerden kaynaklanan her türlü hukuki talep, dava, zarar ve masraftan Platformu muaf tutarsınız.</p>
                    <p><strong className="text-white">8. Sözleşmenin Feshi:</strong> 30 gün önceden yazılı bildirimde bulunarak sözleşmeyi feshedebilirsiniz. Fesih öncesi sağlanan sertifikalar geçerliliğini korur.</p>
                    <p className="text-surface-500 text-xs pt-4 border-t border-surface-700/50">Tam sözleşme metni için: <Link href="/teacher-terms" target="_blank" className="text-brand-400 underline">Öğretmen İçerik Sözleşmesi</Link></p>
                  </div>
                  <div className="p-6 border-t border-surface-700/50 flex gap-3">
                    <button
                      onClick={() => setShowAgreement(false)}
                      className="btn-secondary flex-1"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => {
                        setAgreementAccepted(true);
                        setShowAgreement(false);
                        toast.success('Sözleşme kabul edildi');
                      }}
                      disabled={!agreementScrolled}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${agreementScrolled
                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                        : 'bg-surface-700 text-surface-500 cursor-not-allowed'
                        }`}
                    >
                      <Check className="w-4 h-4" />
                      {agreementScrolled ? 'Kabul Ediyorum' : 'Sözleşmeyi okuyun ↓'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Upload Videos */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Video Yükle</h2>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-surface-700 hover:border-surface-600'
                    }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-surface-500 mx-auto mb-4" />
                  <p className="text-surface-300 mb-1">Videoları sürükleyip bırakın</p>
                  <p className="text-surface-500 text-sm">MP4, WebM, OGG - Max 500MB</p>
                </div>
              </div>

              {/* Video List */}
              {videos.length > 0 && (
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-white font-bold">Yüklenen Videolar ({videos.length})</h3>
                  {videos.map((video, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-surface-800/50 rounded-xl">
                      <GripVertical className="w-5 h-5 text-surface-600 mt-2 cursor-grab" />
                      <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          value={video.title}
                          onChange={(e) => {
                            const updated = [...videos];
                            updated[i].title = e.target.value;
                            setVideos(updated);
                          }}
                          className="input-field text-sm py-2"
                          placeholder="Video başlığı"
                        />
                        <input
                          value={video.description}
                          onChange={(e) => {
                            const updated = [...videos];
                            updated[i].description = e.target.value;
                            setVideos(updated);
                          }}
                          className="input-field text-sm py-2"
                          placeholder="Açıklama"
                        />
                        {uploadProgress[i] !== undefined && (
                          <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${uploadProgress[i]}%` }} />
                          </div>
                        )}
                      </div>
                      <button onClick={() => setVideos((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Geri
                </button>
                <button onClick={handleUploadVideos} disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{hasExam ? 'Devam Et' : 'Yayınla'} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Exam */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Sınav Soruları</h2>
                  <button onClick={addQuestion} className="btn-secondary text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Soru Ekle
                  </button>
                </div>

                <p className="text-surface-400 text-sm mb-6">Her soruya 3-5 seçenek ekleyin ve doğru cevabı işaretleyin</p>

                {questions.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-surface-700 rounded-2xl">
                    <FileText className="w-10 h-10 text-surface-600 mx-auto mb-3" />
                    <p className="text-surface-400 text-sm">Henüz soru eklenmedi</p>
                    <button onClick={addQuestion} className="btn-primary text-sm mt-4">
                      İlk Soruyu Ekle
                    </button>
                  </div>
                )}

                {questions.map((q, qi) => (
                  <div key={qi} className="mb-6 p-5 bg-surface-800/30 rounded-xl border border-surface-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-brand-400 text-sm font-bold">Soru {qi + 1}</span>
                      <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qi].question = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder="Soru metnini girin"
                      className="input-field mb-3"
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = [...questions];
                              updated[qi].options = updated[qi].options.map((o, j) => ({
                                ...o,
                                isCorrect: j === oi,
                              }));
                              setQuestions(updated);
                            }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-surface-600'
                              }`}
                          >
                            {opt.isCorrect && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <input
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qi].options[oi].text = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder={`Seçenek ${oi + 1}`}
                            className="input-field text-sm py-2 flex-1"
                          />
                          {q.options.length > 3 && (
                            <button onClick={() => removeOption(qi, oi)} className="text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.options.length < 5 && (
                      <button onClick={() => addOption(qi)} className="text-brand-400 text-xs mt-2 hover:text-brand-300">
                        + Seçenek Ekle
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Geri
                </button>
                <button onClick={handleCreateExam} disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Yayınla <Check className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
