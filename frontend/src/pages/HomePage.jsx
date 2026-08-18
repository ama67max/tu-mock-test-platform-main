import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-14 md:py-24 flex flex-col items-center text-center gap-8">
          <div className="space-y-5 max-w-3xl">
            <span className="inline-block bg-surface-container-highest px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-secondary border border-surface-variant">
              Tribhuvan University Entrance Preparation
            </span>
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-primary tracking-tight">
              BUILT TO GET YOU IN
            </h1>
            <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
              Practice with 1,000+ syllabus-aligned questions for IOE, B.Sc. CSIT, CMAT, BCA, and BIT — fully offline, with weak-spot tracking that shows you exactly what to study next.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/exams"
              className="btn-browse-mock flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>Browse Mock Tests</span>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
            </Link>
            <Link
              to="/login"
              className="border border-outline-variant text-primary bg-surface-container-lowest px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-container transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start Practicing
            </Link>
          </div>

          {/* Trust Microcopy */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base" aria-hidden="true">check_circle</span>
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base" aria-hidden="true">download_for_offline</span>
              Works offline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base" aria-hidden="true">menu_book</span>
              Updated to the latest syllabus
            </span>
          </div>
        </section>

        {/* Exam Tracks Bento Grid */}
        <section className="py-10">
          <div className="flex items-end justify-between mb-8 border-b border-surface-variant pb-4 gap-4">
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary">Choose Your Exam Track</h2>
              <p className="font-sans text-sm text-secondary mt-1">
                Every track mirrors the official format, marking scheme, and time limit.
              </p>
            </div>
            <Link to="/exams" className="font-semibold text-primary flex items-center gap-1 hover:underline text-sm whitespace-nowrap">
              <span>View all exams</span>
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Engineering Track (IOE) */}
            <div className="md:col-span-8 bg-surface-container-low border border-surface-variant rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" aria-hidden="true">engineering</span>
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                    IOE Entrance
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary">IOE Engineering Entrance</h3>
                <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
                  Full-length mock tests in Physics, Chemistry, Mathematics, and English — patterned on the real IOE exam for Pulchowk and affiliated colleges.
                </p>
                <Link
                  to="/exams"
                  className="mt-2 inline-flex bg-primary text-on-primary px-5 py-2.5 rounded-lg font-semibold text-sm items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <span>Start Practice</span>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* CSIT Track */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">code</span>
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                    B.Sc. CSIT
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary">Computer Science &amp; IT</h3>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  A focused question bank with full 100-mark mock exams — and an instant explanation for every answer.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant mt-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">download_for_offline</span>
                <span className="font-semibold text-xs text-secondary">Works fully offline</span>
              </div>
            </div>

            {/* Management Track (CMAT / BCA / BIT) */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">quiz</span>
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                    CMAT / BCA / BIT
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary">CMAT, BCA &amp; BIT Entrance</h3>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  Drill all four sections — Verbal, Quantitative, Logical Reasoning, and General Awareness — with exam-style simulators.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant mt-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">update</span>
                <span className="font-semibold text-xs text-secondary">Updated to the latest exam pattern</span>
              </div>
            </div>

            {/* Analytics & Simulator Card */}
            <div className="md:col-span-8 bg-surface-container-high border border-surface-variant rounded-xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" aria-hidden="true">monitoring</span>
                </span>
                <h3 className="font-headline text-2xl font-bold text-primary">Adaptive Exam Engine</h3>
                <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
                  Sit the exam before the exam — an official-style countdown, mark-for-review navigation, and answers that queue offline and sync the moment you're back online.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">timer</span>
                    <span>Live Countdown Timer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">leaderboard</span>
                    <span>Rank &amp; Score Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Statistics Grid */}
        <section className="py-12 border-y border-surface-variant my-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">assignment_turned_in</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">50,000+</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Mock Tests Completed</div>
            </div>
            <div className="text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">target</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">99.4%</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Official Pattern Match</div>
            </div>
            <div className="text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">cloud_off</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">100%</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Usable Offline</div>
            </div>
            <div className="text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">school</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">5</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">TU Entrance Programs</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 mb-16 rounded-xl bg-primary text-on-primary p-8 md:p-14 text-center shadow-lg">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-headline text-3xl md:text-4xl font-black">Ready to hit your target score?</h2>
            <p className="font-sans text-sm text-surface-variant leading-relaxed">
              Join thousands of TU aspirants practicing smarter on Nepal's dedicated mock test platform — free to start, and always available offline.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="bg-surface text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-variant active:scale-[0.98] transition-all shadow flex items-center gap-2"
              >
                <span>Create Free Account</span>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
              <Link
                to="/exams"
                className="btn-browse-mock transition-all"
              >
                Browse Mock Tests
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}