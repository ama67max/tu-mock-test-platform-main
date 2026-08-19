import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="bg-background text-on-surface min-h-screen hero-shell">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      <main className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-14 md:py-24 flex flex-col items-center text-center gap-8">
          <div className="space-y-5 max-w-3xl animate-fade-in-up">
            <span className="inline-block bg-surface-container-highest px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-secondary border border-surface-variant transition-all duration-300 hover:border-primary/60 hover:shadow-md">
              Your TU entrance prep, made simpler
            </span>
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-primary tracking-tight">
              Prepare smarter. Score with confidence.
            </h1>
            <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
              Practice 1,000+ syllabus-aligned questions for IOE, B.Sc. CSIT, CMAT, BCA, and BIT. Find your weak areas, sharpen your skills, and keep your preparation moving—even offline.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <Link
              to="/exams"
              className="btn-browse-mock flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>Explore mock tests</span>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
            </Link>
            <Link
              to="/login"
              className="border border-outline-variant text-primary bg-surface-container-lowest px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-container transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start practicing
            </Link>
          </div>

          {/* Trust Microcopy */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-secondary animate-fade-in-up" style={{ animationDelay: '140ms' }}>
            <span className="flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-container-lowest px-3 py-1.5 transition-all duration-300 hover:border-primary/60 hover:text-primary">
              <span className="material-symbols-outlined text-base" aria-hidden="true">check_circle</span>
              Start for free
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-container-lowest px-3 py-1.5 transition-all duration-300 hover:border-primary/60 hover:text-primary">
              <span className="material-symbols-outlined text-base" aria-hidden="true">download_for_offline</span>
              Practice offline
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-container-lowest px-3 py-1.5 transition-all duration-300 hover:border-primary/60 hover:text-primary">
              <span className="material-symbols-outlined text-base" aria-hidden="true">menu_book</span>
              Syllabus-aligned
            </span>
          </div>
        </section>

        {/* Exam Tracks Bento Grid */}
        <section className="py-10">
          <div className="flex items-end justify-between mb-8 border-b border-surface-variant pb-4 gap-4">
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary">Choose your exam track</h2>
              <p className="font-sans text-sm text-secondary mt-1">
                Focus on the subjects and question patterns that match your target TU entrance exam.
              </p>
            </div>
            <Link to="/exams" className="font-semibold text-primary flex items-center gap-1 hover:underline text-sm whitespace-nowrap transition-all duration-200 hover:gap-1.5">
              <span>View all exams</span>
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Engineering Track (IOE) */}
            <div className="feature-card md:col-span-8 rounded-xl p-8 flex flex-col justify-between relative group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                    <span className="material-symbols-outlined" aria-hidden="true">engineering</span>
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                    IOE Entrance
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary">IOE Engineering Entrance</h3>
                <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
                  Build exam confidence with full-length Physics, Chemistry, Mathematics, and English mocks designed around the IOE format.
                </p>
                <Link
                  to="/exams"
                  className="mt-2 inline-flex bg-primary text-on-primary px-5 py-2.5 rounded-lg font-semibold text-sm items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>Start practicing</span>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* CSIT Track */}
            <div className="feature-card md:col-span-4 rounded-xl p-6 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">code</span>
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                    B.Sc. CSIT
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary">Computer Science &amp; IT</h3>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  Strengthen your core concepts with focused practice, full-length mocks, and instant explanations after every attempt.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant mt-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">download_for_offline</span>
                <span className="font-semibold text-xs text-secondary">Practice anywhere, anytime</span>
              </div>
            </div>

            {/* Management Track (CMAT / BCA / BIT) */}
            <div className="feature-card md:col-span-4 rounded-xl p-6 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">quiz</span>
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                    CMAT / BCA / BIT
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary">CMAT, BCA &amp; BIT entrance</h3>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  Build speed and accuracy across verbal, quantitative, logical reasoning, and general awareness with realistic mock tests.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant mt-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">update</span>
                <span className="font-semibold text-xs text-secondary">Aligned with the latest exam pattern</span>
              </div>
            </div>

            {/* Analytics & Simulator Card */}
            <div className="feature-card md:col-span-8 rounded-xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined" aria-hidden="true">monitoring</span>
                </span>
                <h3 className="font-headline text-2xl font-bold text-primary">A smarter exam experience</h3>
                <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
                  Practice like it’s the real exam with timed sections, quick review tools, and saved answers that sync when you reconnect.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">timer</span>
                    <span>Live countdown timer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">leaderboard</span>
                    <span>Rank &amp; score insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Statistics Grid */}
        <section className="py-12 border-y border-surface-variant my-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-tile rounded-2xl p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">assignment_turned_in</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">50,000+</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Mocks completed</div>
            </div>
            <div className="stat-tile rounded-2xl p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">target</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">99.4%</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Pattern match</div>
            </div>
            <div className="stat-tile rounded-2xl p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">cloud_off</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">100%</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Offline ready</div>
            </div>
            <div className="stat-tile rounded-2xl p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">school</span>
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">5</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">TU programs</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-panel py-12 mb-16 rounded-xl text-on-primary p-8 md:p-14 text-center shadow-lg">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="font-headline text-3xl md:text-4xl font-black">Ready to raise your score?</h2>
            <p className="font-sans text-sm text-surface-variant leading-relaxed">
              Join TU aspirants who are preparing with realistic mock tests, instant insights, and the flexibility to practice whenever—and wherever—they study.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="bg-surface text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-variant active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5 shadow flex items-center gap-2"
              >
                <span>Create your free account</span>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
              <Link
                to="/exams"
                className="btn-browse-mock transition-all duration-300 hover:-translate-y-0.5"
              >
                Explore mock tests
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
