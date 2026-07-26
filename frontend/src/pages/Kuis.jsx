import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Image as ImageIcon, Trophy, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "../lib/ToastContext.jsx";
import { Card, ProgressBar, Spinner, ErrorState, EmptyState, Button, Badge } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

export default function Kuis() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState({}); // questionId -> result
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIndex(0);
    setSelected(null);
    setResults({});
    const promise = id ? api.getQuiz(id) : api.getLatestQuiz();
    promise
      .then((q) => {
        setQuiz(q);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (loading) return <Spinner label="Memuat kuis..." />;
  if (!quiz) {
    return (
      <EmptyState
        icon={<ImageIcon size={24} />}
        title="Belum ada kuis"
        description="Unggah catatan dulu di halaman Upload Catatan — AI akan otomatis membuatkan kuis untukmu."
        action={
          <Button onClick={() => navigate("/upload")} size="sm">
            Upload Catatan
          </Button>
        }
      />
    );
  }

  const questions = quiz.questions || [];
  const question = questions[index];
  if (!question) {
    return <ErrorState message="Soal tidak ditemukan." />;
  }

  const result = results[question.id];
  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r.is_correct).length;
  const finished = answeredCount === questions.length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const options = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ];

  async function handleSelect(key) {
    if (result || submitting) return; // cegah jawab ulang
    setSelected(key);
    setSubmitting(true);
    try {
      const res = await api.answerQuestion(question.id, key);
      setResults((prev) => ({ ...prev, [question.id]: res }));
      if (res.is_correct) toast.success("Jawaban benar!");
      else toast.warning("Jawaban kurang tepat. Cek penjelasan di samping.");
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    setIndex((i) => Math.min(i + 1, questions.length - 1));
    setSelected(null);
  }
  function goPrev() {
    setIndex((i) => Math.max(i - 1, 0));
    setSelected(null);
  }

  function resetQuiz() {
    setIndex(0);
    setSelected(null);
    setResults({});
  }

  useEffect(() => {
    function onKey(e) {
      if (result || submitting || finished) return;
      const keyMap = { "1": "A", "2": "B", "3": "C", "4": "D", a: "A", b: "B", c: "C", d: "D" };
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        handleSelect(keyMap[key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, submitting, finished, question]);

  const progressPct = Math.round((answeredCount / questions.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Kuis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.title}</p>
        </div>
        {finished && (
          <Badge color={score >= 70 ? "emerald" : score >= 50 ? "amber" : "rose"}>
            Skor {score}% ({correctCount}/{questions.length})
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${colorForSubjectName(quiz.subject_name)}`}>
              {quiz.subject_name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{answeredCount}/{questions.length} terjawab &middot; Soal {index + 1}</span>
          </div>
          <ProgressBar value={progressPct} />
          <p className="text-sm mt-5 mb-5 text-slate-700 dark:text-slate-200 leading-relaxed">
            {question.question_text}
          </p>
          <div className="flex flex-col gap-3 mb-5">
            {options.map((o) => {
              const isSelected = selected === o.key;
              const isCorrectAnswer = result && o.key === result.correct_option;
              const isWrongSelected = result && isSelected && !result.is_correct;
              const isAnswered = !!result;
              return (
                <button
                  key={o.key}
                  onClick={() => handleSelect(o.key)}
                  disabled={submitting || isAnswered}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-left text-sm transition-all ${
                    isCorrectAnswer
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : isWrongSelected
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      : isSelected
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCorrectAnswer
                        ? "bg-emerald-500 text-white"
                        : isWrongSelected
                        ? "bg-rose-500 text-white"
                        : isSelected
                        ? "bg-teal-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {o.key}
                  </span>
                  <span className="flex-1">{o.text}</span>
                  {isCorrectAnswer && <CheckCircle2 size={16} className="text-emerald-500" />}
                  {isWrongSelected && <XCircle size={16} className="text-rose-500" />}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={goPrev}
              disabled={index === 0}
              className="flex-1"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </Button>
            <Button
              onClick={goNext}
              disabled={index === questions.length - 1}
              className="flex-1"
            >
              Selanjutnya <ChevronRight size={16} />
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {finished && (
            <Card className={score >= 70 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-800"}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${score >= 70 ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-amber-100 dark:bg-amber-500/20 text-amber-600"}`}>
                  <Trophy size={18} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${score >= 70 ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                    {score >= 70 ? "Hebat!" : "Tetap semangat!"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{correctCount} dari {questions.length} soal benar</div>
                </div>
              </div>
              <ProgressBar value={score} />
              <Button variant="secondary" className="w-full mt-3" onClick={resetQuiz}>
                <RotateCcw size={14} /> Ulangi Kuis
              </Button>
            </Card>
          )}

          {result && (
            <Card className={result.is_correct ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-800"}>
              <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${result.is_correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {result.is_correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {result.is_correct ? "Jawaban Benar!" : "Jawaban Kurang Tepat"}
              </div>
              <div className={`text-xs ${result.is_correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                Kamu memilih jawaban {selected}
                {!result.is_correct && ` · Jawaban benar: ${result.correct_option}`}
              </div>
            </Card>
          )}
          {result && (
            <Card>
              <div className="text-sm font-semibold mb-2 text-slate-800 dark:text-white">Penjelasan (dari AI)</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{result.explanation || "Tidak ada penjelasan."}</p>
            </Card>
          )}
          {result?.source_reference && (
            <Card>
              <div className="text-sm font-semibold mb-2 text-slate-800 dark:text-white">Referensi dari Catatan</div>
              <div className="rounded-lg h-16 mb-2 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                <ImageIcon size={20} className="text-slate-400" />
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{result.source_reference}</div>
            </Card>
          )}

          {!result && (
            <Card className="text-center py-6">
              <div className="text-xs text-slate-400 dark:text-slate-500">Pilih salah satu jawaban untuk melihat penjelasan.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
