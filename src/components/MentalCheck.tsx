import { useState } from "react";
import { Brain, RotateCcw, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const QUESTIONS = [
  "Akhir-akhir ini aku merasa cemas atau gelisah tanpa sebab jelas.",
  "Aku kesulitan tidur atau tidur terlalu banyak.",
  "Aku kehilangan minat pada hal-hal yang biasanya menyenangkan.",
  "Aku merasa sendirian meski sedang ramai dengan orang lain.",
  "Aku takut atau enggan datang ke sekolah.",
];

const OPTS = [
  { l: "Tidak pernah", v: 0 },
  { l: "Kadang", v: 1 },
  { l: "Sering", v: 2 },
  { l: "Hampir selalu", v: 3 },
];

function interpret(score: number) {
  if (score <= 3) return { label: "Hijau — Kondisi baik", desc: "Pertahankan rutinitas positif & hubungan sehat dengan teman.", color: "from-emerald-500 to-teal-600" };
  if (score <= 7) return { label: "Kuning — Perlu diperhatikan", desc: "Coba teknik napas 4-7-8 dan cerita ke orang yang kamu percaya.", color: "from-amber-500 to-orange-500" };
  if (score <= 11) return { label: "Oranye — Cari dukungan", desc: "Hubungi guru BK untuk konsultasi ringan minggu ini.", color: "from-orange-500 to-rose-500" };
  return { label: "Merah — Segera bicara", desc: "Hubungi hotline BK atau orang dewasa terpercaya hari ini juga.", color: "from-rose-500 to-red-600" };
}

export function MentalCheck() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const done = step >= QUESTIONS.length;
  const total = scores.reduce((a, b) => a + b, 0);
  const result = done ? interpret(total) : null;

  const answer = (v: number) => {
    setScores((s) => [...s, v]);
    setStep((s) => s + 1);
  };

  const reset = () => { setStep(0); setScores([]); };

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">
            <Brain className="h-3.5 w-3.5" /> Self-check
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Cek Mental 1 Menit</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Bukan diagnosis — hanya cerminan kondisi hatimu minggu ini.
          </p>
        </div>

        <Card className="mt-8 p-6 shadow-soft sm:p-8">
          {!done ? (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Pertanyaan {step + 1} / {QUESTIONS.length}</span>
                <span>{Math.round(((step) / QUESTIONS.length) * 100)}%</span>
              </div>
              <Progress value={(step / QUESTIONS.length) * 100} className="mt-2 h-2" />
              <p className="mt-6 font-display text-lg font-semibold sm:text-xl">{QUESTIONS[step]}</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {OPTS.map((o) => (
                  <Button
                    key={o.v}
                    variant="outline"
                    onClick={() => answer(o.v)}
                    className="h-auto justify-between py-3 text-left"
                  >
                    <span>{o.l}</span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="animate-fade-in text-center">
              <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${result!.color} text-white shadow-glow`}>
                <span className="font-display text-2xl font-bold">{total}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{result!.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{result!.desc}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" /> Ulangi
                </Button>
                <a href="tel:08111100200">
                  <Button className="gradient-brand text-white">Hubungi BK</Button>
                </a>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
