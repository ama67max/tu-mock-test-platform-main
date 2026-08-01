import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center gap-8">
          <div className="space-y-4 max-w-3xl">
            <span className="inline-block bg-surface-container-highest px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-secondary border border-surface-variant">
              Tribhuvan University Entrance Prep Platform
            </span>
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-primary tracking-tight">
              BUILT TO GET YOU IN
            </h1>
            <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
              1,000+ practice questions across IOE, CSIT, CMAT, BCA, and BIT. Study offline, track your weak spots in real time.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/exams"
              className="bg-primary text-on-primary px-8 py-3.5 rounded-lg font-semibold hover:scale-[0.98] transition-transform shadow-md flex items-center gap-2"
            >
              <span>Explore Library</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              to="/login"
              className="border border-outline-variant text-primary bg-surface-container-lowest px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-container transition-all"
            >
              Practice Now
            </Link>
          </div>
        </section>

        {/* Exam Categories Bento Grid */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-8 border-b border-surface-variant pb-4">
            <h2 className="font-headline text-2xl font-bold text-primary">Pick Your Tracks</h2>
            <Link to="/exams" className="font-semibold text-primary flex items-center gap-1 hover:underline text-sm">
              <span>View all tests</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Engineering Track (IOE) */}
            <div className="md:col-span-8 bg-surface-container-low border border-surface-variant rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm">
              <div className="relative z-10 space-y-3">
                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                  IOE Entrance
                </span>
                <h3 className="font-headline text-2xl font-bold text-primary">IOE Engineering Track</h3>
                <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
                  Comprehensive mock test series for Physics, Chemistry, Mathematics, and English tailored for Pulchowk and IOE affiliated college admissions.
                </p>
                <Link
                  to="/exams"
                  className="mt-4 inline-flex bg-primary text-on-primary px-5 py-2.5 rounded-lg font-semibold text-sm items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <span>Start Practice</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* CSIT Track */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                  B.Sc. CSIT
                </span>
                <h3 className="font-headline text-xl font-bold text-primary">Computer Science & IT</h3>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  Targeted question bank featuring 100-mark mock tests with instant answer explanations.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant mt-4">
                <span className="font-semibold text-xs text-secondary">Offline Caching Supported</span>
              </div>
            </div>

            {/* Management Track (CMAT / BCA / BIT) */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary">
                  CMAT / BCA / BIT
                </span>
                <h3 className="font-headline text-xl font-bold text-primary">Management & IT Entry</h3>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  Verbal Ability, Quantitative Ability, Logical Reasoning, and General Awareness simulators.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant mt-4">
                <span className="font-semibold text-xs text-secondary">Updated Pattern Sets</span>
              </div>
            </div>

            {/* Analytics & Simulator Card */}
            <div className="md:col-span-8 bg-surface-container-high border border-surface-variant rounded-xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-3">
                <h3 className="font-headline text-2xl font-bold text-primary">Adaptive Exam Engine</h3>
                <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
                  Simulate official exam conditions with countdown timers, mark-for-review navigation, and background sync queuing.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base">timer</span>
                    <span>40px High-Visibility Timer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base">analytics</span>
                    <span>Detailed Rank Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Statistics Grid */}
        <section className="py-12 border-y border-surface-variant my-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-1">
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">50,000+</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Tests Completed</div>
            </div>
            <div className="text-center space-y-1">
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">99.4%</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Pattern Accuracy</div>
            </div>
            <div className="text-center space-y-1">
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">100%</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">Offline Capability</div>
            </div>
            <div className="text-center space-y-1">
              <div className="font-headline text-3xl md:text-4xl font-black text-primary">5 Core</div>
              <div className="font-sans text-xs font-semibold text-secondary uppercase tracking-wider">TU Programs</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 mb-16 rounded-xl bg-primary text-on-primary p-8 md:p-14 text-center shadow-lg">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-headline text-3xl md:text-4xl font-black">Ready to achieve your target score?</h2>
            <p className="font-sans text-sm text-surface-variant">
              Join thousands of Tribhuvan University entrance aspirants practicing on Nepal's premier mock test platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="bg-surface text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-surface-variant transition-all shadow"
              >
                Create Free Account
              </Link>
              <Link
                to="/exams"
                className="border border-outline-variant text-on-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-all"
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

