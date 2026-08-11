import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { useTheme } from "../lib/ThemeContext.jsx";
import { Card, ProgressBar, Spinner, ErrorState } from "../components/ui.jsx";
import { colorForSubjectName } from "../lib/subjectColors.js";
import { api } from "../lib/api.js";

export default function Kuis() {
  const { dark } = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // { is_correct, correct_option, explanation, source_reference }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getLatestQuiz()
      .then(setQuiz)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (quiz === null) return <Spinner label="Memuat kuis..." />;
  if (!quiz) {
    return (
      <Card>
        <div className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
          Belum ada kuis. Unggah catatan dulu di halaman <strong>Upload Catatan</strong> —
          AI akan otomatis membuatkan kuis untukmu.
        </div>
      </Card>
    );
  }

  const question = quiz.questions[index];
  const options = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ];

  async function handleSelect(key) {
    if (result) return; // sudah dijawab, tunggu next
    setSelected(key);
    setSubmitting(true);
    try {
      const res = await api.answerQuestion(question.id, key);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    setIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
    setSelected(null);
    setResult(null);
  }
  function goPrev() {
    setIndex((i) => Math.max(i - 1, 0));
    setSelected(null);
    setResult(null);
  }

  const progressPct = Math.round(((index + 1) / quiz.questions.length) * 100);

  return (
    <div>
      <h1 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-slate-800"}`}>Kuis</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${colorForSubjectName(quiz.subject_name)}`}>
              {quiz.subject_name}
            </span>
            <span className="text-xs text-slate-400">{index + 1}/{quiz.questions.length}</span>
          </div>
          <ProgressBar value={progressPct} />
          <p className={`text-sm mt-4 mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}>
            {question.question_text}
          </p>
          <div className="flex flex-col gap-3 mb-4">
            {options.map((o) => {
              const isSelected = selected === o.key;
              const isCorrectAnswer = result && o.key === result.correct_option;
              const isWrongSelected = result && isSelected && !result.is_correct;
              return (
                <button
                  key={o.key}
                  onClick={() => handleSelect(o.key)}
                  disabled={submitting || !!result}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                    isCorrectAnswer
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : isWrongSelected
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : isSelected
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : dark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-700/40"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
                        : dark
                        ? "bg-slate-700 text-slate-300"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {o.key}
                  </span>
                  {o.text}
                  {isCorrectAnswer && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                  {isWrongSelected && <XCircle size={16} className="ml-auto text-rose-500" />}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className={`flex-1 border rounded-lg py-2 text-sm font-medium disabled:opacity-50 ${
                dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
              }`}
            >
              Sebelumnya
            </button>
            <button
              onClick={goNext}
              disabled={index === quiz.questions.length - 1}
              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium"
            >
              Selanjutnya
            </button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {result && (
            <Card className={result.is_correct ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}>
              <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${result.is_correct ? "text-emerald-600" : "text-rose-600"}`}>
                {result.is_correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {result.is_correct ? "Jawaban Benar! 🎉" : "Jawaban Kurang Tepat"}
              </div>
              <div className={`text-xs ${result.is_correct ? "text-emerald-600" : "text-rose-600"}`}>
                Kamu memilih jawaban {selected}
                {!result.is_correct && ` · Jawaban benar: ${result.correct_option}`}
              </div>
            </Card>
          )}
          {result && (
            <Card>
              <div className={`text-sm font-semibold mb-2 ${dark ? "text-white" : "text-slate-800"}`}>Penjelasan (dari AI)</div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{result.explanation}</p>
            </Card>
          )}
          {result?.source_reference && (
            <Card>
              <div className={`text-sm font-semibold mb-2 ${dark ? "text-white" : "text-slate-800"}`}>Referensi dari Catatan</div>
              <div className={`rounded-lg h-16 mb-2 flex items-center justify-center ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                <ImageIcon size={20} className="text-slate-400" />
              </div>
              <div className={`text-xs font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>{result.source_reference}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
