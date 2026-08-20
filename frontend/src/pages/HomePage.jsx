import React from 'react';
import { ArrowUpRight, ChevronDown, MoveUpRight, Ruler, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormulaField from '../components/home/FormulaField';

const answerOptions = [
  'Newton’s first law',
  'Newton’s second law',
  'Newton’s third law',
  'Law of conservation',
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-primary">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <section className="relative isolate flex min-h-0 flex-col justify-between py-6 sm:py-8 lg:min-h-[calc(100vh-64px)] lg:py-10">
          <FormulaField />
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-surface-variant pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-secondary sm:pb-4 sm:text-[10px] sm:tracking-[0.22em]">
            <span className="hidden sm:inline">Collection 01 / 2026</span>
            <span className="hidden sm:block">Built for focused practice</span>
            <span>Exam mode</span>
          </div>

          <div className="grid flex-1 items-center gap-10 pt-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:pt-16">
            <div className="page-reveal relative z-10 max-w-xl py-6 sm:py-8">
              <h1 className="max-w-[760px] font-headline text-[clamp(3.25rem,8vw,8.4rem)] font-black leading-[0.86] tracking-[-0.04em] text-primary">
                Practice like
                <span className="block text-secondary">it matters.</span>
              </h1>
              <p className="mt-8 max-w-md text-base leading-7 text-secondary md:text-lg">
                Realistic mock tests, instant score breakdowns, and subject-wise insights for students preparing to perform under pressure.
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/exams"
                  className="group inline-flex min-h-12 items-center justify-between gap-4 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary transition-transform duration-300 hover:-translate-y-1 sm:min-h-0 sm:justify-center"
                >
                  Start mock test
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container sm:min-h-0"
                >
                  Start free
                </Link>
              </div>

              <div className="mt-10 flex max-w-md items-center gap-4 border-t border-surface-variant pt-5 text-xs text-secondary sm:mt-14 sm:gap-5">
                <div className="flex -space-x-2" aria-hidden="true">
                  <span className="h-8 w-8 rounded-full border-2 border-background bg-[#1a1a1a]" />
                  <span className="h-8 w-8 rounded-full border-2 border-background bg-[#7b7b7b]" />
                  <span className="h-8 w-8 rounded-full border-2 border-background bg-[#d9d9d9]" />
                </div>
                <p><strong className="font-bold text-primary">50,000+</strong> focused attempts completed</p>
              </div>
            </div>

            <div className="page-reveal page-reveal-delay-1 relative min-h-[420px] border border-border bg-surface-container-low p-3 sm:min-h-[480px] sm:p-8 lg:min-h-[620px]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(0,0,0,0.035)_100%)] dark:bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_100%)]" />
              <div className="relative flex h-full flex-col border border-border bg-surface-container-lowest">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary sm:px-6">
                  <span>Mock test / Physics</span>
                  <span>Question 18 / 50</span>
                </div>
                <div className="flex flex-1 flex-col justify-between gap-6 p-4 sm:gap-8 sm:p-8">
                  <div>
                    <div className="mb-6 flex items-center justify-between text-xs font-semibold text-secondary">
                      <span>Time remaining</span>
                      <span className="font-headline text-2xl font-black tabular-nums text-primary">42:18</span>
                    </div>
                    <div className="mb-8 h-1 w-full bg-surface-container-highest">
                      <div className="h-full w-[36%] bg-primary" />
                    </div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-secondary">Question 18</p>
                    <h2 className="max-w-lg font-headline text-2xl font-bold leading-tight text-primary sm:text-3xl">
                      Which principle best explains the relationship between force and acceleration?
                    </h2>
                  </div>
                  <div className="grid gap-3">
                    {answerOptions.map((option, index) => (
                      <div
                        key={option}
                        className={`flex items-center gap-3 border p-3 text-sm font-medium ${index === 1 ? 'border-primary bg-primary text-on-primary' : 'border-border text-secondary'}`}
                      >
                        <span className={`flex h-7 w-7 items-center justify-center border text-xs font-bold ${index === 1 ? 'border-white bg-white text-primary' : 'border-border'}`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs font-semibold sm:px-6">
                  <span className="text-secondary">Progress auto-saved</span>
                  <span className="text-primary">Next question <ArrowUpRight className="ml-1 inline" size={14} aria-hidden="true" /></span>
                </div>
              </div>
              <div className="absolute left-0 top-10 hidden -rotate-90 items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary sm:flex">
                <span className="h-px w-12 bg-secondary" />
                Exam simulation
              </div>
              <div className="absolute bottom-0 right-0 hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary sm:flex">
                <span className="h-px w-12 bg-secondary" />
                Focus / feedback
              </div>
              <div className="absolute bottom-12 left-4 hidden w-32 -rotate-6 bg-primary p-3 text-on-primary sm:block">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">Every attempt</p>
                <p className="mt-2 font-headline text-xl font-bold leading-none">shows<br />the next step.</p>
                <MoveUpRight className="mt-5 ml-auto" size={17} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-surface-variant pt-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-secondary sm:mt-8 sm:text-[10px] sm:tracking-[0.2em]">
            <span>Scroll to explore</span>
            <ChevronDown size={16} aria-hidden="true" />
            <span className="hidden sm:block">Quiet tools. Serious progress.</span>
          </div>
        </section>

        <section className="page-reveal page-reveal-delay-2 grid gap-8 border-t border-surface-variant py-20 lg:grid-cols-[0.7fr_1.3fr] lg:py-28">
          <div>
            <h2 className="max-w-sm font-headline text-4xl font-black leading-[0.92] tracking-[-0.03em] text-primary md:text-5xl">
              Built around the way you actually prepare.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="border-t border-primary pt-4">
              <Ruler size={19} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="mt-8 font-headline text-xl font-bold">Precise</h3>
              <p className="mt-3 text-sm leading-6 text-secondary">Practice stays aligned to the subjects and patterns that matter for your target exam.</p>
            </div>
            <div className="border-t border-primary pt-4">
              <ShoppingBag size={19} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="mt-8 font-headline text-xl font-bold">Portable</h3>
              <p className="mt-3 text-sm leading-6 text-secondary">Keep momentum when the connection drops with an experience built to work offline.</p>
            </div>
            <div className="border-t border-primary pt-4">
              <Sparkles size={19} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="mt-8 font-headline text-xl font-bold">Useful</h3>
              <p className="mt-3 text-sm leading-6 text-secondary">Every attempt gives you a clearer next move, not another pile of information.</p>
            </div>
          </div>
        </section>

        <section className="mb-20 flex flex-col justify-between gap-8 bg-primary p-8 text-on-primary sm:p-12 lg:flex-row lg:items-end lg:p-16">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl font-black leading-[0.9] tracking-[-0.03em] text-on-primary md:text-6xl">
              Put your preparation in motion.
            </h2>
          </div>
          <Link
            to="/exams"
            className="group inline-flex shrink-0 items-center gap-4 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-1"
          >
            Find your track
            <ArrowUpRight size={17} className="transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
