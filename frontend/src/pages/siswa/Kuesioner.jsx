import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card, Button, Chart } from "../../components/UI";
import { getSiswaProfileByUserId } from "../../services/supabaseAuth";
import { getActiveQuestions, submitKuesioner, getResultBySiswaId } from "../../services/supabaseData";
import { ClipboardList, ArrowLeft, ArrowRight, CheckCircle, Send, Target, Home } from "lucide-react";

export default function Kuesioner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getSiswaProfileByUserId(user.id);
      if (!p) { navigate("/siswa/dashboard"); return; }
      setProfile(p);

      const existing = await getResultBySiswaId(p.id);
      if (existing) { setResult(existing); setLoading(false); return; }
      if (p.status_kuesioner === "selesai") {
        setAlreadySubmitted(true);
        setLoading(false);
        return;
      }
      const qs = await getActiveQuestions();
      setQuestions(qs);
      setLoading(false);
    })();
  }, [user.id]);

  if (loading) return null;
  if (!profile) return null;

  if (alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="p-4 bg-warning-light text-warning rounded-2xl text-center">
            <ClipboardList size={32} className="mx-auto mb-2" />
            <p className="font-semibold">Anda telah mengisi kuesioner. Formulir telah terkunci.</p>
          </div>
          <Button onClick={() => navigate("/siswa/dashboard")} className="w-full mt-4" icon={Home}>Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-success-light flex items-center justify-center">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-primary-dark">Hasil Kuesioner</h2>
              <p className="text-sm text-gray-500">Status: <span className="text-success font-semibold">Selesai</span></p>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="text-h3 font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-primary-medium" />
            Persentase Kecocokan
          </h3>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <Chart scores={result.scores} />
          </div>
        </Card>
        <Card>
          <h3 className="text-h3 font-semibold mb-2">Rekomendasi Jurusan</h3>
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-lg font-bold">
            {result.rekomendasi_final}
          </div>
        </Card>
        <Button onClick={() => navigate("/siswa/dashboard")} className="w-full" icon={Home}>Kembali ke Beranda</Button>
      </div>
    );
  }

  const questionsPerStep = 5;
  const totalSteps = Math.ceil(questions.length / questionsPerStep);
  const startIdx = currentStep * questionsPerStep;
  const currentQuestions = questions.slice(startIdx, startIdx + questionsPerStep);
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleAnswer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: parseInt(value) }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!allAnswered) { setError("Mohon lengkapi semua pertanyaan."); return; }
    setSubmitting(true);
    const responses = Object.entries(answers).map(([idSoal, nilaiJawaban]) => ({
      id_soal: parseInt(idSoal),
      nilai_jawaban: nilaiJawaban,
    }));
    const res = await submitKuesioner(profile.id, responses);
    if (!res.success) { setError("Gagal mengirim kuesioner."); setSubmitting(false); return; }
    setResult(res.data);
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={20} className="text-primary-medium" />
          <h2 className="text-h3 font-semibold text-primary-dark">Instrumen Kuesioner Minat</h2>
        </div>
        <p className="text-sm text-gray-500">
          Langkah {currentStep + 1} dari {totalSteps}
        </p>
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition ${
                i === currentStep ? "bg-primary-dark" : i < currentStep ? "bg-success" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          {currentQuestions.map((q) => (
            <div key={q.id}>
              <p className="font-body text-base mb-3">{q.teks_pertanyaan}</p>
              <div className="flex gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleAnswer(q.id, v)}
                    className={`flex-1 py-3 sm:py-2.5 px-1 text-center rounded-xl text-sm font-medium transition border min-h-[44px] ${
                      answers[q.id] === v
                        ? "bg-primary-dark text-white border-primary-dark shadow-sm"
                        : "bg-white text-gray-800 border-gray-200 hover:border-primary-light hover:shadow-sm"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Sangat Tidak Setuju</span>
                <span>Sangat Setuju</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" disabled={currentStep === 0} onClick={() => setCurrentStep((s) => s - 1)} className="flex-1" icon={ArrowLeft}>
          Sebelumnya
        </Button>
        {currentStep < totalSteps - 1 ? (
          <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!currentQuestions.every((q) => answers[q.id] !== undefined)} className="flex-1" icon={ArrowRight}>
            Selanjutnya
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="flex-1" icon={Send}>
            {submitting ? "Memproses..." : "Kirim Hasil Tes (Submit)"}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-error text-center">{error}</p>}
    </div>
  );
}
