/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home as HomeIcon, 
  Moon, 
  Sun, 
  Play, 
  RotateCcw, 
  GraduationCap, 
  Filter, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  LayoutGrid, 
  Eye, 
  Award, 
  CheckCircle2, 
  Lock, 
  Edit3, 
  Sparkles, 
  AlertTriangle 
} from "lucide-react";
import { QUESTIONS_DATA, Question } from "./questions";
import madrasatiLogo from "./assets/images/madrasati_logo_1782777703843.jpg";

const STORAGE_KEY = "madrasati-arabic-substitutions-state-v1";

interface AppState {
  currentScreen: "home" | "practice" | "results";
  currentIndex: number;
  answers: Record<string, string>;
  shownAnswers: Record<string, boolean>;
  ratings: Record<string, number>;
  mastery: Record<string, "high" | "mid" | "low">;
  theme: "light" | "dark";
  filter: "all" | "unanswered" | "unrated" | "needs_review" | "not_mastered" | "mastered";
}

const defaultState: AppState = {
  currentScreen: "home",
  currentIndex: 0,
  answers: {},
  shownAnswers: {},
  ratings: {},
  mastery: {},
  theme: "light",
  filter: "all",
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      } catch (e) {
        console.error("Error reading saved localStorage state:", e);
      }
    }
    return defaultState;
  });

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Handle theme modification
  useEffect(() => {
    const html = document.documentElement;
    if (state.theme === "dark") {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark");
    } else {
      html.setAttribute("data-theme", "light");
      html.classList.remove("dark");
    }
  }, [state.theme]);

  // Academic label generator based on self-evaluation score
  function getAcademicLabel(score: number | undefined): string {
    if (score === undefined) return "يرجى اختيار درجة التقييم";
    if (score === 0) return "بحاجة لتركيز أكبر وتأسيس كامل ❌";
    if (score <= 2) return "تحتاج جهد إضافي ومراجعة دقيقة ⚠️";
    if (score <= 4) return "مقبول — تحتاج سد بعض الثغرات 👍";
    if (score <= 6) return "جيد — أداء مرضي ومتماسك ✨";
    if (score <= 8) return "جيد جداً — اقتربت من الإتقان الكامل 🌟";
    if (score <= 9) return "ممتاز — فهم عميق ومتميز 🏆";
    return "أداء عبقري ودرجة كاملة! 👑";
  }

  // Filter helper functions
  function getFilteredQuestions(): Question[] {
    const currentFilter = state.filter;
    return QUESTIONS_DATA.filter((q) => {
      const isAnswered = !!state.answers[q.id] && state.answers[q.id].trim().length > 0;
      const hasRating = state.ratings[q.id] !== undefined;
      const masteryStatus = state.mastery[q.id];

      if (currentFilter === "unanswered") {
        return !isAnswered;
      }
      if (currentFilter === "unrated") {
        return !hasRating;
      }
      if (currentFilter === "needs_review") {
        return masteryStatus === "mid";
      }
      if (currentFilter === "not_mastered") {
        return masteryStatus === "low";
      }
      if (currentFilter === "mastered") {
        return masteryStatus === "high";
      }
      return true; // "all"
    });
  }

  function getFilteredIndex(): number {
    const filtered = getFilteredQuestions();
    const currentQ = QUESTIONS_DATA[state.currentIndex];
    if (!currentQ) return -1;
    return filtered.findIndex((q) => q.id === currentQ.id);
  }

  function ensureValidFilterSelection(updatedFilter: typeof state.filter) {
    const filtered = QUESTIONS_DATA.filter((q) => {
      const isAnswered = !!state.answers[q.id] && state.answers[q.id].trim().length > 0;
      const hasRating = state.ratings[q.id] !== undefined;
      const masteryStatus = state.mastery[q.id];

      if (updatedFilter === "unanswered") return !isAnswered;
      if (updatedFilter === "unrated") return !hasRating;
      if (updatedFilter === "needs_review") return masteryStatus === "mid";
      if (updatedFilter === "not_mastered") return masteryStatus === "low";
      if (updatedFilter === "mastered") return masteryStatus === "high";
      return true;
    });

    if (filtered.length === 0) return;
    const currentQ = QUESTIONS_DATA[state.currentIndex];
    const isStillValid = filtered.some((q) => q.id === currentQ?.id);

    if (!isStillValid) {
      const targetQ = filtered[0];
      const origIndex = QUESTIONS_DATA.findIndex((q) => q.id === targetQ.id);
      if (origIndex !== -1) {
        setState((prev) => ({
          ...prev,
          currentIndex: origIndex,
          filter: updatedFilter,
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        filter: updatedFilter,
      }));
    }
  }

  function setFilter(newFilter: typeof state.filter) {
    ensureValidFilterSelection(newFilter);
  }

  function toggleTheme() {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  }

  function navigateTo(screen: AppState["currentScreen"]) {
    setState((prev) => ({
      ...prev,
      currentScreen: screen,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function performReset() {
    setState({
      currentScreen: "practice",
      currentIndex: 0,
      answers: {},
      shownAnswers: {},
      ratings: {},
      mastery: {},
      theme: state.theme,
      filter: "all",
    });
    setResetModalOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswerChange(qId: string, text: string) {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qId]: text,
      },
    }));
  }

  function revealModelAnswer(qId: string) {
    setState((prev) => ({
      ...prev,
      shownAnswers: {
        ...prev.shownAnswers,
        [qId]: true,
      },
    }));
  }

  function rateQuestion(qId: string, score: number) {
    setState((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [qId]: score,
      },
    }));
  }

  function setMasteryStatus(qId: string, status: "high" | "mid" | "low") {
    setState((prev) => ({
      ...prev,
      mastery: {
        ...prev.mastery,
        [qId]: status,
      },
    }));
  }

  const filteredQuestions = getFilteredQuestions();
  const filteredIndex = getFilteredIndex();
  const activeQuestion = QUESTIONS_DATA[state.currentIndex];

  // Global calculations
  const totalQuestions = QUESTIONS_DATA.length;
  const answeredCount = QUESTIONS_DATA.filter(
    (q) => (state.answers[q.id] || "").trim().length > 0
  ).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const ratedCount = QUESTIONS_DATA.filter(
    (q) => state.ratings[q.id] !== undefined
  ).length;
  const ratedPercent = Math.round((ratedCount / totalQuestions) * 100);

  const shownCount = QUESTIONS_DATA.filter(
    (q) => !!state.shownAnswers[q.id]
  ).length;

  const hasHistory = answeredCount > 0;

  // Rating and Score Sum
  const maxScore = totalQuestions * 10;
  let totalScore = 0;
  QUESTIONS_DATA.forEach((q) => {
    if (state.ratings[q.id] !== undefined) {
      totalScore += state.ratings[q.id];
    }
  });
  const scorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Mastery categories counter
  let masteryHigh = 0;
  let masteryMid = 0;
  let masteryLow = 0;
  QUESTIONS_DATA.forEach((q) => {
    const m = state.mastery[q.id];
    if (m === "high") masteryHigh++;
    else if (m === "mid") masteryMid++;
    else if (m === "low") masteryLow++;
  });

  return (
    <div className="min-height-screen bg-madrasati-light-lavender dark:bg-[#0F0B1E] text-madrasati-dark-ink dark:text-[#E9E6FA] flex flex-col min-h-screen transition-colors duration-200 selection:bg-madrasati-soft-lavender selection:text-madrasati-purple">
      
      {/* Top Simple Navigation Header */}
      <nav className="navbar sticky top-0 z-50 flex justify-between items-center bg-white dark:bg-[#161226] border-b border-madrasati-border dark:border-[#32284D] py-3 px-6 shadow-sm transition-all">
        <div 
          className="brand flex items-center gap-3 cursor-pointer"
          id="nav-brand"
          onClick={() => navigateTo("home")}
        >
          <img 
            className="brand-logo h-10 w-10 object-contain rounded-lg shadow-sm border border-madrasati-border dark:border-[#32284D]" 
            src={madrasatiLogo} 
            alt="تطبيق مدرسي" 
            referrerPolicy="no-referrer"
          />
          <span className="brand-name font-bold text-xl text-madrasati-purple dark:text-[#8E52DC]">تطبيق مدرسي</span>
        </div>
        
        <div className="nav-actions flex items-center gap-3">
          {state.currentScreen !== "home" && (
            <button 
              className="btn flex items-center gap-2 bg-white dark:bg-[#161226] hover:bg-slate-100 dark:hover:bg-[#221936] text-madrasati-dark-ink dark:text-[#E9E6FA] border border-madrasati-border dark:border-[#32284D] px-4 py-2 rounded-lg font-semibold transition-all text-sm"
              id="nav-home-btn"
              onClick={() => navigateTo("home")}
            >
              <HomeIcon size={16} />
              الرئيسية
            </button>
          )}

          {/* Theme Switcher */}
          <button 
            className="btn rounded-full p-2 h-10 w-10 flex items-center justify-center bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] text-madrasati-dark-ink dark:text-[#E9E6FA] hover:bg-slate-100 dark:hover:bg-[#221936] transition-all cursor-pointer"
            id="theme-toggle"
            title="تبديل الوضع الليلي والنهاري"
            onClick={toggleTheme}
          >
            {state.theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container max-w-[900px] w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME SCREEN */}
          {state.currentScreen === "home" && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="home-screen flex flex-col items-center text-center gap-6 py-8"
            >
              <h1 className="home-title text-4xl md:text-5xl font-black text-madrasati-purple dark:text-[#8E52DC] tracking-tight mt-6">
                تطبيق مدرسي التعليمي
              </h1>
              <p className="home-subtitle text-lg md:text-xl text-madrasati-soft-gray dark:text-[#9E99B3] max-w-2xl mt-[-8px] leading-relaxed">
                الأسئلة الوزارية الشاملة حول الاستبدال لقواعد اللغة العربية للصف السادس الإعدادي
              </p>
              
              <div className="home-steps-card bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] rounded-3xl w-full max-w-[580px] p-8 shadow-sm text-right mt-3">
                <h3 className="home-steps-title text-lg font-bold mb-5 text-madrasati-dark-ink dark:text-[#E9E6FA] border-r-4 border-madrasati-purple dark:border-[#8E52DC] pr-3 flex items-center gap-2">
                  طريقة العمل المختصرة في التطبيق:
                </h3>
                <ul className="home-steps-list flex flex-col gap-4">
                  <li className="flex items-center gap-3">
                    <span className="home-steps-num bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">١</span>
                    <span className="text-sm md:text-base text-slate-700 dark:text-[#D9D3F0]">اكتب جوابك الشخصي كاملاً وبكل أمانة في الحقل المخصص لكل سؤال.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="home-steps-num bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">٢</span>
                    <span className="text-sm md:text-base text-slate-700 dark:text-[#D9D3F0]">اضغط على زر <strong className="text-madrasati-purple dark:text-[#8E52DC]">أظهر الجواب النموذجي</strong> للمقارنة الدقيقة مع الأجوبة الرسمية.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="home-steps-num bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">٣</span>
                    <span className="text-sm md:text-base text-slate-700 dark:text-[#D9D3F0]">قيّم جوابك يا بطل بموضوعية واختر الدرجة الأكاديمية المناسبة من (0 إلى 10).</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="home-steps-num bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">٤</span>
                    <span className="text-sm md:text-base text-slate-700 dark:text-[#D9D3F0]">حدّد مستوى تمكنك من مهارة السؤال لمراجعة نقاط ضعفك لاحقاً بكل سهولة.</span>
                  </li>
                </ul>
              </div>

              <div className="home-stats-preview text-sm md:text-base text-madrasati-soft-gray dark:text-[#9E99B3] font-semibold leading-relaxed">
                عدد الأسئلة الكلي في هذا التدريب الأكاديمي: <strong className="text-madrasati-purple dark:text-[#8E52DC] font-bold">{totalQuestions}</strong> سؤالاً وزارياً.
                {hasHistory && (
                  <div className="mt-1 text-madrasati-purple dark:text-[#8E52DC] font-bold">
                    لقد أجبت على <strong className="text-madrasati-purple dark:text-[#8E52DC] font-extrabold">{answeredCount}</strong> من أصل <strong className="text-madrasati-purple dark:text-[#8E52DC] font-extrabold">{totalQuestions}</strong> سؤالاً سابقاً.
                  </div>
                )}
              </div>

              <div className="home-actions flex flex-col gap-3 w-full max-w-[340px] mt-2">
                {hasHistory ? (
                  <>
                    <button 
                      className="btn bg-madrasati-purple hover:bg-madrasati-medium-purple text-white border-none py-3.5 px-6 rounded-full font-bold shadow-md hover:translate-y-[-2px] hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="btn-continue"
                      onClick={() => navigateTo("practice")}
                    >
                      <Play size={18} fill="currentColor" />
                      متابعة التدريب الحالي
                    </button>
                    <button 
                      className="btn bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] text-madrasati-dark-ink dark:text-[#E9E6FA] hover:bg-slate-50 dark:hover:bg-[#221936] py-3 px-6 rounded-full font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="btn-new-attempt"
                      onClick={() => setResetModalOpen(true)}
                    >
                      <RotateCcw size={18} />
                      بدء محاولة جديدة تماماً
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn bg-madrasati-purple hover:bg-madrasati-medium-purple text-white border-none py-4 px-8 rounded-full font-bold shadow-md hover:translate-y-[-2px] hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer"
                    id="btn-start"
                    onClick={() => navigateTo("practice")}
                  >
                    <GraduationCap size={20} />
                    ابدأ التدريب الآن
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. PRACTICE SCREEN */}
          {state.currentScreen === "practice" && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              
              {/* Practice Header with Progress Gauges */}
              <div className="practice-header bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] p-5 rounded-2xl shadow-sm">
                
                {/* Solved Progress Bar */}
                <div className="mb-4">
                  <div className="progress-container flex items-center justify-between mb-1.5">
                    <span className="progress-label text-xs md:text-sm text-madrasati-soft-gray dark:text-[#9E99B3] font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-madrasati-medium-purple inline-block"></span>
                      أسئلة أجبت عليها: {answeredCount} من {totalQuestions}
                    </span>
                    <span className="progress-label text-xs md:text-sm font-bold text-madrasati-medium-purple">{progressPercent}%</span>
                  </div>
                  <div className="progress-bar-outer bg-slate-100 dark:bg-[#221936] h-2 w-full rounded-full overflow-hidden">
                    <div 
                      className="progress-bar-inner bg-madrasati-medium-purple h-full rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Self-Evaluated Progress Bar */}
                <div>
                  <div className="progress-container flex items-center justify-between mb-1.5">
                    <span className="progress-label text-xs md:text-sm text-madrasati-dark-ink dark:text-[#E9E6FA] font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-madrasati-purple inline-block"></span>
                      درجات الأسئلة المقيّمة ذاتياً: {ratedCount} من {totalQuestions}
                    </span>
                    <span className="progress-label text-xs md:text-sm font-bold text-madrasati-purple dark:text-[#8E52DC]">{ratedPercent}%</span>
                  </div>
                  <div className="progress-bar-outer bg-slate-100 dark:bg-[#221936] h-2 w-full rounded-full overflow-hidden">
                    <div 
                      className="progress-bar-inner bg-madrasati-purple h-full rounded-full transition-all duration-300" 
                      style={{ width: `${ratedPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar mt-5 bg-madrasati-light-lavender/40 dark:bg-[#0F0B1E]/40 border border-madrasati-border/70 dark:border-[#32284D]/70 p-3 rounded-xl flex flex-col md:flex-row gap-2.5 md:items-center">
                  <span className="filter-label text-xs md:text-sm font-bold text-madrasati-dark-ink dark:text-[#E9E6FA] flex items-center gap-1.5 shrink-0">
                    <Filter size={14} className="text-madrasati-purple dark:text-[#8E52DC]" />
                    تصنيف وتصفية الأسئلة:
                  </span>
                  <div className="filter-options flex flex-wrap gap-1.5">
                    {(["all", "unanswered", "unrated", "needs_review", "not_mastered", "mastered"] as const).map((filterOpt) => {
                      const label = 
                        filterOpt === "all" ? "الكل" :
                        filterOpt === "unanswered" ? "غير المحلولة" :
                        filterOpt === "unrated" ? "لم يتم التقييم" :
                        filterOpt === "needs_review" ? "تحتاج مراجعة" :
                        filterOpt === "not_mastered" ? "غير متمكن" : "متمكن";

                      return (
                        <button
                          key={filterOpt}
                          className={`filter-btn text-xs md:text-[13px] font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                            state.filter === filterOpt
                              ? "bg-madrasati-purple text-white border-madrasati-purple shadow-sm"
                              : "bg-white dark:bg-[#161226] text-madrasati-soft-gray dark:text-[#9E99B3] border-madrasati-border dark:border-[#32284D] hover:text-madrasati-purple dark:hover:text-[#8E52DC] hover:border-madrasati-purple dark:hover:border-[#8E52DC]"
                          }`}
                          onClick={() => setFilter(filterOpt)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horizontal Navigation Dots Rail */}
                {filteredQuestions.length > 0 && (
                  <div className="mt-5 border-t border-dashed border-madrasati-border dark:border-[#32284D] pt-4">
                    <div className="text-[12px] font-bold text-madrasati-soft-gray dark:text-[#9E99B3] mb-2 text-right">الملاحة السريعة للأسئلة المصفّاة:</div>
                    <div className="question-navigator flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-madrasati-border scrollbar-track-transparent">
                      {filteredQuestions.map((q, idx) => {
                        const originalNum = QUESTIONS_DATA.findIndex((item) => item.id === q.id) + 1;
                        const isDotActive = state.currentIndex === QUESTIONS_DATA.findIndex((item) => item.id === q.id);
                        const isAnswered = !!state.answers[q.id] && state.answers[q.id].trim().length > 0;

                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              const origIndex = QUESTIONS_DATA.findIndex((item) => item.id === q.id);
                              if (origIndex !== -1) {
                                setState((prev) => ({ ...prev, currentIndex: origIndex }));
                              }
                            }}
                            className={`nav-dot min-w-[38px] h-[38px] flex items-center justify-center text-sm font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
                              isDotActive
                                ? "bg-madrasati-purple text-white border-madrasati-purple shadow-md scale-105"
                                : isAnswered
                                ? "bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] border-madrasati-border dark:border-[#32284D]"
                                : "bg-white dark:bg-[#161226] text-madrasati-dark-ink dark:text-[#E9E6FA] border-madrasati-border dark:border-[#32284D] hover:border-madrasati-purple"
                            }`}
                            title={`سؤال وزاراتي ${originalNum}`}
                          >
                            {originalNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Question View Container */}
              <div className="questions-list">
                {filteredQuestions.length === 0 ? (
                  <div className="empty-filter-state bg-white dark:bg-[#161226] border border-dashed border-madrasati-border dark:border-[#32284D] rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center text-madrasati-soft-gray dark:text-[#9E99B3]">
                    <span className="text-4xl mb-3">🔍</span>
                    <h3 className="text-lg font-bold text-madrasati-dark-ink dark:text-[#E9E6FA] mb-1">لا توجد أسئلة تطابق التصفية المحددة</h3>
                    <p className="text-sm max-w-sm mb-4">جرب تغيير تصنيف التصفية من الأعلى أو اضغط على الزر أدناه لإعادة عرض كل الأسئلة.</p>
                    <button 
                      className="btn bg-madrasati-purple hover:bg-madrasati-medium-purple text-white border-none py-2 px-5 rounded-full text-xs font-bold shadow-sm cursor-pointer"
                      onClick={() => setFilter("all")}
                    >
                      عرض جميع الأسئلة الوزارية
                    </button>
                  </div>
                ) : activeQuestion ? (
                  (() => {
                    const originalIndex = QUESTIONS_DATA.findIndex((item) => item.id === activeQuestion.id);
                    const originalNum = originalIndex + 1;
                    const isAnswered = !!state.answers[activeQuestion.id] && state.answers[activeQuestion.id].trim().length > 0;
                    const isShown = !!state.shownAnswers[activeQuestion.id];
                    const hasRating = state.ratings[activeQuestion.id] !== undefined;
                    const masteryStatus = state.mastery[activeQuestion.id];

                    // Determine Status Badge
                    let statusText = "لم تتم الإجابة";
                    let statusClass = "bg-slate-100 text-slate-500 dark:bg-[#221936] dark:text-[#9E99B3]";

                    if (hasRating) {
                      statusText = "تم التقييم";
                      statusClass = "bg-green-100 text-green-700 dark:bg-[#0E4E2C] dark:text-green-300";
                    } else if (isShown) {
                      statusText = "تم عرض الجواب";
                      statusClass = "bg-amber-100 text-amber-700 dark:bg-[#4B3205] dark:text-amber-300";
                    } else if (isAnswered) {
                      statusText = "تمت الإجابة";
                      statusClass = "bg-sky-100 text-sky-700 dark:bg-[#0C3E5B] dark:text-sky-300";
                    }

                    // Determine Mastery Badge
                    let masteryBadge = null;
                    if (masteryStatus) {
                      let mText = "";
                      let mClass = "";
                      if (masteryStatus === "high") {
                        mText = "متمكن";
                        mClass = "bg-green-50 text-green-700 border-green-200 dark:bg-[#0E4E2C]/50 dark:text-green-300 dark:border-[#0E4E2C]";
                      } else if (masteryStatus === "mid") {
                        mText = "يحتاج مراجعة";
                        mClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#4B3205]/50 dark:text-amber-300 dark:border-[#4B3205]";
                      } else if (masteryStatus === "low") {
                        mText = "غير متمكن";
                        mClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#4C1A1A]/50 dark:text-rose-300 dark:border-[#4C1A1A]";
                      }
                      masteryBadge = (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${mClass}`}>
                          {mText}
                        </span>
                      );
                    }

                    return (
                      <div 
                        id={`card-${activeQuestion.id}`} 
                        className="accordion-card active bg-white dark:bg-[#161226] border-2 border-madrasati-purple dark:border-[#8E52DC] rounded-2xl overflow-hidden shadow-md"
                      >
                        {/* Card Header */}
                        <div className="card-header bg-slate-50/50 dark:bg-[#1d1931]/40 border-b border-madrasati-border dark:border-[#32284D] px-5 py-3.5 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                          <div className="card-header-left flex items-center gap-3">
                            <span className="question-num-badge bg-madrasati-purple dark:bg-[#8E52DC] text-white font-extrabold text-sm w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              {originalNum}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-madrasati-purple dark:text-[#8E52DC] block">سؤال وزاري</span>
                              <span className="text-sm font-bold text-slate-800 dark:text-[#D9D3F0] block mt-[-2px]">{activeQuestion.year}</span>
                            </div>
                          </div>
                          <div className="card-header-right flex items-center gap-2 mt-1 md:mt-0 self-end md:self-auto">
                            {masteryBadge}
                            <span className={`status-badge text-[11px] font-bold px-3 py-1 rounded-full ${statusClass}`}>
                              {statusText}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="card-body p-6 flex flex-col gap-5">
                          
                          {/* Metadata Badges */}
                          <div className="badges-row flex flex-wrap gap-2">
                            <span className="year-badge bg-[#E9FBE9] dark:bg-[#143A1E] text-[#228B22] dark:text-[#6EE7B7] border border-[#C2F0C2] dark:border-[#065F46] text-xs font-bold px-3 py-1 rounded-lg">
                              كتاب النحو — صفحة {activeQuestion.sourcePage}
                            </span>
                            <span className="year-badge bg-madrasati-soft-lavender/40 dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] border border-madrasati-border dark:border-[#32284D] text-xs font-bold px-3 py-1 rounded-lg">
                              سؤال رقم {activeQuestion.sourceItemOrder}
                            </span>
                          </div>

                          {/* Render Verse / Passage context if present */}
                          {activeQuestion.verse && (
                            <div className="quran-container bg-[#FAF9FE] dark:bg-[#1D1632] border-y border-[#E2DCF5] dark:border-[#3E3060] p-5 rounded-2xl shadow-inner border-r-4 border-l-4 border-r-madrasati-purple border-l-madrasati-purple my-1">
                              <p className="quran-verse text-center font-sans text-base md:text-lg leading-relaxed text-slate-800 dark:text-[#E9E6FA] font-medium" dir="rtl" lang="ar">
                                {activeQuestion.verse}
                              </p>
                            </div>
                          )}

                          {/* Render Poetry context if present */}
                          {activeQuestion.poetryLines && activeQuestion.poetryLines.length > 0 && (
                            <div className="poetry-wrapper bg-[#FAF9FE] dark:bg-[#1D1632] border border-dashed border-madrasati-border dark:border-[#32284D] p-5 rounded-2xl my-1 relative">
                              <div className="poetry-intro-text text-xs font-bold text-madrasati-soft-gray dark:text-[#9E99B3] mb-3 text-right">
                                قال الشاعر:
                              </div>
                              <div className="poetry-verse flex flex-col gap-3 justify-center items-center text-center">
                                {activeQuestion.poetryLines.map((line, lIdx) => (
                                  <div key={lIdx} className="poetry-two-halves flex flex-col sm:flex-row flex-wrap items-baseline justify-center gap-2 sm:gap-6 text-base md:text-[17px] font-bold text-madrasati-dark-ink dark:text-[#E9E6FA] leading-relaxed">
                                    <span className="poetry-hemistich text-right">{line.first}</span>
                                    <span className="poetry-separator text-madrasati-purple/40 dark:text-[#8E52DC]/40 hidden sm:inline font-normal">◀◀</span>
                                    <span className="poetry-hemistich text-left">{line.second}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Main Question Text Block */}
                          <div className="relative pr-4 border-r-4 border-madrasati-purple dark:border-[#8E52DC] py-1 mt-2">
                            <h3 className="question-text text-base md:text-lg font-bold text-slate-900 dark:text-[#FAF9FE] leading-relaxed text-right">
                              {activeQuestion.text}
                            </h3>
                          </div>

                          {/* Student Answer Textarea Box */}
                          <div className="answer-input-container flex flex-col gap-2 mt-4">
                            <label className="answer-label text-sm font-bold text-slate-800 dark:text-[#D9D3F0]" htmlFor={`textarea-${activeQuestion.id}`}>
                              إجابتك الشخصية يا بطل النحو:
                            </label>
                            <textarea
                              className="answer-textarea w-full h-[120px] p-4 rounded-xl border border-madrasati-border dark:border-[#32284D] bg-slate-50/50 dark:bg-[#0F0B1E] text-madrasati-dark-ink dark:text-[#E9E6FA] focus:border-madrasati-purple dark:focus:border-[#8E52DC] focus:bg-white dark:focus:bg-[#161226] focus:ring-4 focus:ring-madrasati-purple/10 text-sm md:text-base resize-none outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
                              id={`textarea-${activeQuestion.id}`}
                              placeholder="اكتب هنا إجابتك الكاملة والمفصلة لمقارنتها لاحقاً بالجواب الرسمي للوزارة..."
                              disabled={isShown}
                              value={state.answers[activeQuestion.id] || ""}
                              onChange={(e) => handleAnswerChange(activeQuestion.id, e.target.value)}
                            />
                          </div>

                          {/* Action button to reveal Answer */}
                          <div className="submit-action-row flex justify-start mt-1">
                            {!isShown ? (
                              <button
                                className="btn bg-madrasati-purple hover:bg-madrasati-medium-purple text-white border-none py-3 px-6 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                id={`btn-show-${activeQuestion.id}`}
                                disabled={!state.answers[activeQuestion.id] || state.answers[activeQuestion.id].trim().length === 0}
                                onClick={() => revealModelAnswer(activeQuestion.id)}
                              >
                                <Eye size={18} />
                                تمت الإجابة — أظهر الجواب النموذجي
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                                <CheckCircle2 size={16} />
                                تم قفل إجابتك ومقارنتها بالحل النموذجي
                              </div>
                            )}
                          </div>

                          {/* Model Answer Card Context */}
                          {isShown && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="model-answer-section relative bg-emerald-50/20 dark:bg-[#10B981]/5 border-2 border-emerald-500/40 dark:border-[#10B981]/30 rounded-2xl p-6 mt-6 shadow-sm flex flex-col gap-3.5"
                              id={`model-${activeQuestion.id}`}
                            >
                              <div className="absolute top-[-15px] right-6 bg-emerald-600 dark:bg-[#10B981] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                                <Check size={14} strokeWidth={3} />
                                الجواب النموذجي المعتمد من وزارة التربية:
                              </div>
                              <p className="model-answer-text text-base md:text-lg font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed text-right pt-2">
                                {activeQuestion.modelAnswer}
                              </p>
                            </motion.div>
                          )}

                          {/* Self Evaluation Slider Section */}
                          {isShown && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="evaluation-section border-t border-dashed border-madrasati-border dark:border-[#32284D] pt-6 mt-5 flex flex-col gap-4"
                              id={`eval-${activeQuestion.id}`}
                            >
                              <div>
                                <h4 className="eval-title text-base font-extrabold text-madrasati-purple dark:text-[#8E52DC] flex items-center gap-2 mb-1">
                                  <Award size={18} />
                                  ميزان التقييم الذاتي الأكاديمي (0 - 10 درجات)
                                </h4>
                                <p className="eval-subtitle text-xs text-madrasati-soft-gray dark:text-[#9E99B3] leading-relaxed">
                                  قارن إجابتك بالحل النموذجي المعتمد أعلاه بكل أمانة وموضوعية، ثم حدد الدرجة التي تستحقها على هذا التدريج التفاعلي:
                                </p>
                              </div>

                              <div className="academic-slider-wrapper bg-slate-50 dark:bg-[#1D1632]/30 border border-madrasati-border dark:border-[#32284D] rounded-2xl p-5 shadow-inner flex flex-col gap-5">
                                <div className="academic-badge-container flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
                                  <span className="academic-score-title text-sm font-bold text-madrasati-dark-ink dark:text-[#E9E6FA]">
                                    التقدير الأكاديمي لجوابك:
                                  </span>
                                  <div 
                                    className={`academic-score-badge text-xs md:text-sm font-extrabold px-4 py-1.5 rounded-full border transition-all text-center shrink-0 shadow-sm inline-block ${
                                      hasRating
                                        ? "bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] border-madrasati-purple/30 dark:border-[#8E52DC]/30 animate-badgePulse"
                                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                                    }`}
                                    id={`score-badge-${activeQuestion.id}`}
                                  >
                                    {hasRating ? `${state.ratings[activeQuestion.id]} / 10 — ${getAcademicLabel(state.ratings[activeQuestion.id])}` : "اضغط على الدرجة المستحقة بالأسفل"}
                                  </div>
                                </div>

                                <div className="academic-slider-container relative h-12 mx-3 flex items-center">
                                  {/* Absolute slider track background */}
                                  <div className="academic-slider-track absolute left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="academic-slider-fill bg-gradient-to-l from-madrasati-purple to-madrasati-medium-purple dark:from-[#8E52DC] dark:to-purple-500 h-full rounded-full transition-all duration-300" 
                                      style={{ width: `${hasRating ? state.ratings[activeQuestion.id] * 10 : 0}%` }}
                                    ></div>
                                  </div>

                                  {/* Absolute step nodes */}
                                  <div className="academic-slider-steps absolute left-0 right-0 h-full flex items-center justify-between">
                                    {Array.from({ length: 11 }).map((_, i) => {
                                      const isSelected = state.ratings[activeQuestion.id] === i;
                                      return (
                                        <button
                                          key={i}
                                          className={`step-node w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-sm border shadow-sm transition-all focus:outline-none cursor-pointer z-10 ${
                                            isSelected
                                              ? "bg-madrasati-purple border-madrasati-purple text-white scale-110 shadow-md"
                                              : "bg-white dark:bg-[#161226] border-madrasati-border dark:border-[#32284D] text-slate-600 dark:text-[#E9E6FA] hover:border-madrasati-purple"
                                          }`}
                                          title={`تقييم ${i} درجات`}
                                          onClick={() => rateQuestion(activeQuestion.id, i)}
                                        >
                                          {i}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Milestones descriptions */}
                                <div className="academic-milestones border-t border-dashed border-madrasati-border/70 dark:border-[#32284D]/70 pt-3 flex flex-wrap gap-3 items-center justify-between text-[11px] font-bold">
                                  <span className="milestone milestone-low text-rose-500 flex items-center gap-1">🔴 تأسيس وتركيز مكثف (0-2)</span>
                                  <span className="milestone milestone-mid text-amber-600 flex items-center gap-1">🟡 مقبول إلى جيد (3-6)</span>
                                  <span className="milestone milestone-high text-green-600 flex items-center gap-1">🟢 ممتاز ومتمكن (7-10)</span>
                                </div>
                              </div>

                              {/* Mastery Section */}
                              <div className="mastery-section border-t border-madrasati-border dark:border-[#32284D] pt-5 flex flex-col gap-3">
                                <h4 className="mastery-title text-sm font-extrabold text-slate-800 dark:text-[#D9D3F0]">
                                  تصنيف مستوى تمكنك العملي من مهارة السؤال:
                                </h4>
                                <div className="mastery-buttons grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  <button
                                    className={`btn-mastery py-3 px-4 font-bold rounded-xl border text-xs md:text-sm text-center transition-all cursor-pointer ${
                                      masteryStatus === "high"
                                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500 shadow-sm"
                                        : "bg-white dark:bg-[#161226] border-madrasati-border dark:border-[#32284D] text-slate-600 dark:text-[#E9E6FA] hover:border-green-500"
                                    }`}
                                    onClick={() => setMasteryStatus(activeQuestion.id, "high")}
                                  >
                                    متمكن من السؤال
                                  </button>
                                  <button
                                    className={`btn-mastery py-3 px-4 font-bold rounded-xl border text-xs md:text-sm text-center transition-all cursor-pointer ${
                                      masteryStatus === "mid"
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500 shadow-sm"
                                        : "bg-white dark:bg-[#161226] border-madrasati-border dark:border-[#32284D] text-slate-600 dark:text-[#E9E6FA] hover:border-amber-500"
                                    }`}
                                    onClick={() => setMasteryStatus(activeQuestion.id, "mid")}
                                  >
                                    أحتاج إلى مراجعة الموضوع
                                  </button>
                                  <button
                                    className={`btn-mastery py-3 px-4 font-bold rounded-xl border text-xs md:text-sm text-center transition-all cursor-pointer ${
                                      masteryStatus === "low"
                                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500 shadow-sm"
                                        : "bg-white dark:bg-[#161226] border-madrasati-border dark:border-[#32284D] text-slate-600 dark:text-[#E9E6FA] hover:border-rose-500"
                                    }`}
                                    onClick={() => setMasteryStatus(activeQuestion.id, "low")}
                                  >
                                    غير متمكن
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : null}
              </div>

              {/* Bottom Pagination Fast Jump Container */}
              {filteredQuestions.length > 0 && (
                <div className="bottom-pagination-container bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] p-5 rounded-2xl shadow-sm mt-2">
                  <div className="pagination-header flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <span className="pagination-title text-sm font-extrabold text-madrasati-dark-ink dark:text-[#E9E6FA] flex items-center gap-1.5">
                      <LayoutGrid size={16} className="text-madrasati-purple dark:text-[#8E52DC]" />
                      الوصول السريع لجميع الأسئلة:
                    </span>
                    <div className="pagination-legend flex flex-wrap gap-4 items-center text-xs font-bold text-madrasati-soft-gray dark:text-[#9E99B3]">
                      <span className="legend-item flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#161226]"></span>
                        غير مُجاب
                      </span>
                      <span className="legend-item flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-madrasati-purple bg-madrasati-soft-lavender dark:bg-[#221936]"></span>
                        مُجاب
                      </span>
                      <span className="legend-item flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-madrasati-purple shadow-sm ring-2 ring-white dark:ring-[#161226] ring-offset-2 ring-offset-madrasati-purple"></span>
                        السؤال الحالي
                      </span>
                    </div>
                  </div>

                  <div className="pagination-list flex flex-wrap gap-2 justify-start">
                    {QUESTIONS_DATA.map((q, idx) => {
                      const isCurrent = state.currentIndex === idx;
                      const isAnswered = !!state.answers[q.id] && state.answers[q.id].trim().length > 0;
                      const hasItemRating = state.ratings[q.id] !== undefined;

                      return (
                        <button
                          key={q.id}
                          className={`pagination-item-btn w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                            isCurrent
                              ? "bg-madrasati-purple text-white border-madrasati-purple shadow-md scale-105"
                              : isAnswered
                              ? "bg-madrasati-soft-lavender dark:bg-[#221936] text-madrasati-purple dark:text-[#8E52DC] border-madrasati-border dark:border-[#32284D]"
                              : "bg-slate-50 dark:bg-[#1D1632]/20 text-slate-600 dark:text-[#D9D3F0] border-madrasati-border dark:border-[#32284D] hover:border-madrasati-purple"
                          }`}
                          onClick={() => {
                            setState((prev) => ({ ...prev, currentIndex: idx }));
                          }}
                          title={`سؤال رقم ${idx + 1}`}
                        >
                          <span className="btn-num font-bold text-sm">{idx + 1}</span>
                          
                          {/* Small status indicator badge under numbers */}
                          {isAnswered ? (
                            <span className="absolute bottom-1 flex justify-center text-madrasati-purple dark:text-[#8E52DC] current:text-white">
                              <Check size={8} strokeWidth={4} className={isCurrent ? "text-white" : ""} />
                            </span>
                          ) : (
                            <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 opacity-60"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation and Finish Row */}
              <div className="bottom-nav flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-madrasati-border dark:border-[#32284D] pt-6 mt-4">
                <button
                  className="btn bg-white dark:bg-[#161226] hover:bg-slate-100 dark:hover:bg-[#221936] text-madrasati-dark-ink dark:text-[#E9E6FA] border border-madrasati-border dark:border-[#32284D] px-5 py-3 rounded-xl font-bold text-sm transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-prev-q"
                  disabled={filteredIndex <= 0}
                  onClick={() => {
                    if (filteredIndex > 0) {
                      const targetQ = filteredQuestions[filteredIndex - 1];
                      const origIndex = QUESTIONS_DATA.findIndex((q) => q.id === targetQ.id);
                      if (origIndex !== -1) {
                        setState((prev) => ({ ...prev, currentIndex: origIndex }));
                      }
                    }
                  }}
                >
                  <ArrowRight size={18} />
                  السؤال السابق المصفّى
                </button>

                <button
                  className="btn bg-madrasati-purple hover:bg-madrasati-medium-purple text-white border-none py-3.5 px-8 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
                  id="btn-finish-practice"
                  onClick={() => navigateTo("results")}
                >
                  <Sparkles size={16} />
                  إنهاء التدريب وعرض النتائج والتمكن
                </button>

                <button
                  className="btn bg-white dark:bg-[#161226] hover:bg-slate-100 dark:hover:bg-[#221936] text-madrasati-dark-ink dark:text-[#E9E6FA] border border-madrasati-border dark:border-[#32284D] px-5 py-3 rounded-xl font-bold text-sm transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-next-q"
                  disabled={filteredIndex === -1 || filteredIndex >= filteredQuestions.length - 1}
                  onClick={() => {
                    if (filteredIndex < filteredQuestions.length - 1) {
                      const targetQ = filteredQuestions[filteredIndex + 1];
                      const origIndex = QUESTIONS_DATA.findIndex((q) => q.id === targetQ.id);
                      if (origIndex !== -1) {
                        setState((prev) => ({ ...prev, currentIndex: origIndex }));
                      }
                    }
                  }}
                >
                  السؤال التالي المصفّى
                  <ArrowLeft size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. RESULTS SCREEN */}
          {state.currentScreen === "results" && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="results-screen bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-6"
            >
              <h2 className="results-title text-center text-madrasati-purple dark:text-[#8E52DC] text-2xl md:text-3xl font-extrabold">
                تقرير الأداء والتمكن الأكاديمي الذاتي
              </h2>

              {/* Circular score display */}
              <div className="score-circle-container flex justify-center my-2">
                <div className="score-circle w-[160px] h-[160px] rounded-full border-8 border-slate-100 dark:border-slate-800 border-t-madrasati-purple border-l-madrasati-purple flex flex-col items-center justify-center shadow-md bg-slate-50/50 dark:bg-[#0F0B1E]/40">
                  <span className="score-value text-3xl font-extrabold text-madrasati-purple dark:text-[#8E52DC] leading-none">
                    {totalScore}/{maxScore}
                  </span>
                  <span className="score-label text-[11px] text-madrasati-soft-gray dark:text-[#9E99B3] mt-2 font-bold uppercase tracking-wider">
                    النسبة: {scorePercentage}%
                  </span>
                </div>
              </div>

              {/* Dynamic Badge Display based on Solved Ratio & Score */}
              {answeredCount === totalQuestions ? (
                (() => {
                  let badgeTitle = "";
                  let badgeColorClass = "";
                  let badgeDesc = "";
                  let badgeGraphic = null;

                  if (scorePercentage >= 90) {
                    badgeTitle = "وسام التميز الأكاديمي الذهبي";
                    badgeColorClass = "badge-gold bg-gradient-to-b from-amber-500/5 to-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300";
                    badgeDesc = "ألف مبروك! لقد أتممت حل جميع الأسئلة وحققت مستوى تمكن استثنائي باهر (90% فما فوق). أنت بطل حقيقي وقائد متميز في قواعد اللغة العربية!";
                    badgeGraphic = (
                      <svg className="w-24 h-24 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="7" fill="rgba(245, 158, 11, 0.1)" stroke="currentColor" strokeWidth="2" />
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 5l1 2h2l-1.5 1.5.5 2.5-2-1.5-2 1.5.5-2.5L8 7h2z" fill="currentColor" />
                      </svg>
                    );
                  } else if (scorePercentage >= 70) {
                    badgeTitle = "وسام الإبداع اللغوي الفضي";
                    badgeColorClass = "badge-silver bg-gradient-to-b from-slate-400/5 to-slate-400/15 border-slate-400 text-slate-800 dark:text-slate-300";
                    badgeDesc = "أداء ممتاز جداً! أتممت حل جميع الأسئلة بمهارة عالية ودقة ممتازة (70% - 89%). واصل هذا التميز اللغوي الرائع لتعتلي الصدارة دائماً!";
                    badgeGraphic = (
                      <svg className="w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="7" fill="rgba(148, 163, 184, 0.1)" stroke="currentColor" strokeWidth="2" />
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 5l1 2h2l-1.5 1.5.5 2.5-2-1.5-2 1.5.5-2.5L8 7h2z" fill="currentColor" />
                      </svg>
                    );
                  } else {
                    badgeTitle = "وسام المثابرة والاجتهاد البرونزي";
                    badgeColorClass = "badge-bronze bg-gradient-to-b from-amber-700/5 to-amber-700/15 border-amber-700 text-amber-950 dark:text-amber-400";
                    badgeDesc = "أحسنت صنعاً! لقد أثبتّ التزامك التام وحللت جميع أسئلة الاستبدال بجد واجتهاد. استمر في المراجعة والتدرب لتطوير مستوى تمكنك وستصل للوسام الفضي والذهبي قريباً!";
                    badgeGraphic = (
                      <svg className="w-24 h-24 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="7" fill="rgba(180, 83, 9, 0.1)" stroke="currentColor" strokeWidth="2" />
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 5l1 2h2l-1.5 1.5.5 2.5-2-1.5-2 1.5.5-2.5L8 7h2z" fill="currentColor" />
                      </svg>
                    );
                  }

                  return (
                    <div className={`achievement-badge-card border-2 p-6 rounded-2xl relative text-center max-w-[540px] mx-auto shadow-md ${badgeColorClass}`}>
                      <div className="badge-ribbon absolute -top-4 left-1/2 transform -translate-x-1/2 bg-madrasati-purple text-white text-xs font-black px-4 py-1 rounded-full shadow-md select-none">
                        وسام التمكين والإنجاز
                      </div>
                      <div className="badge-image-container flex justify-center mb-3 mt-1 relative">
                        <div className="absolute inset-0 bg-white/20 dark:bg-black/10 blur-xl rounded-full w-28 h-28 mx-auto"></div>
                        <div className="relative hover:scale-105 duration-300 transition-all">
                          {badgeGraphic}
                        </div>
                      </div>
                      <h3 className="badge-card-title text-base font-black mb-1 text-slate-900 dark:text-white">{badgeTitle}</h3>
                      <p className="badge-card-desc text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                        {badgeDesc}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="achievement-badge-card border-2 border-dashed border-madrasati-border dark:border-[#32284D] bg-slate-50/50 dark:bg-[#161226]/50 p-6 rounded-2xl relative text-center max-w-[540px] mx-auto">
                  <div className="badge-image-container flex justify-center mb-3">
                    <div className="p-4 bg-slate-100 dark:bg-[#221936] rounded-full text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800">
                      <Lock size={36} />
                    </div>
                  </div>
                  <h3 className="badge-card-title text-base font-black text-slate-800 dark:text-[#E9E6FA] mb-1">أوسمة التمكن مغلقة حالياً</h3>
                  <p className="badge-card-desc text-xs md:text-sm text-madrasati-soft-gray dark:text-[#9E99B3] leading-relaxed max-w-sm mx-auto">
                    أكمل حل وتقييم جميع الأسئلة النحوية الـ <strong className="text-madrasati-purple dark:text-[#8E52DC] font-bold">{totalQuestions}</strong> (أنت الآن في {answeredCount} سؤال) لتكشف عن وسام تمكنك الدراسي اللامع وتزين به تقرير تفوقك!
                  </p>
                </div>
              )}

              {/* Recharts-Style Interactive SVG Mastery Chart */}
              <div className="recharts-wrapper border-2 border-madrasati-border dark:border-[#32284D] bg-slate-50/30 dark:bg-[#1D1632]/10 rounded-2xl p-5 max-w-[520px] w-full mx-auto shadow-sm">
                <h4 className="text-right text-xs md:text-sm font-extrabold text-slate-800 dark:text-[#E9E6FA] mb-4 flex items-center justify-between">
                  <span>📊 توزيع مستويات التمكن الأكاديمي</span>
                  <span className="text-[10px] text-madrasati-soft-gray dark:text-[#9E99B3] font-normal">(رسم تفاعلي بياني)</span>
                </h4>
                
                <div className="relative w-full h-[220px]">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 450 250">
                    <defs>
                      <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity="0.9"/>
                        <stop offset="95%" stopColor="#047857" stopOpacity="0.9"/>
                      </linearGradient>
                      <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity="0.9"/>
                        <stop offset="95%" stopColor="#B45309" stopOpacity="0.9"/>
                      </linearGradient>
                      <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity="0.9"/>
                        <stop offset="95%" stopColor="#B91C1C" stopOpacity="0.9"/>
                      </linearGradient>
                    </defs>

                    {/* Horizontal Y-Axis Grid Lines */}
                    {[190, 143, 96, 50].map((y, tIdx) => {
                      const maxVal = Math.max(masteryHigh, masteryMid, masteryLow, 4);
                      const currentVal = Math.round(maxVal * (tIdx === 0 ? 0 : tIdx === 1 ? 0.33 : tIdx === 2 ? 0.67 : 1));
                      return (
                        <g key={y}>
                          <line x1="50" y1={y} x2="400" y2={y} stroke="rgba(217, 211, 240, 0.4)" strokeDasharray="3 3" />
                          <text x="35" y={y + 4} fill="var(--color-madrasati-soft-gray)" fontFamily="var(--font-sans)" fontSize="10" textAnchor="end" fontWeight="bold">
                            {currentVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* X-Axis Line */}
                    <line x1="50" y1="190" x2="400" y2="190" stroke="var(--color-madrasati-border)" strokeWidth="1.5" />

                    {/* High Mastery Bar */}
                    {(() => {
                      const maxVal = Math.max(masteryHigh, masteryMid, masteryLow, 4);
                      const scaleVal = 140 / maxVal;
                      const hHigh = masteryHigh * scaleVal;
                      const yHigh = 190 - hHigh;

                      return (
                        <g 
                          className="chart-bar-group cursor-pointer"
                          onMouseEnter={() => setHoveredBar("high")}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <rect 
                            className="transition-all duration-300"
                            x="90" 
                            y={yHigh} 
                            width="45" 
                            height={hHigh || 2} 
                            rx="5" 
                            fill="url(#colorHigh)"
                            style={{ filter: hoveredBar === "high" ? "brightness(1.1)" : "none" }}
                          />
                          <text x="112.5" y={yHigh - 8} fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">
                            {masteryHigh}
                          </text>
                          {hoveredBar === "high" && (
                            <g>
                              <rect x="72" y={yHigh - 40} width="81" height="26" rx="5" fill="#1D2433" opacity="0.95" />
                              <text x="112.5" y={yHigh - 23} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">متمكن: {masteryHigh}</text>
                            </g>
                          )}
                        </g>
                      );
                    })()}

                    {/* Mid Mastery Bar */}
                    {(() => {
                      const maxVal = Math.max(masteryHigh, masteryMid, masteryLow, 4);
                      const scaleVal = 140 / maxVal;
                      const hMid = masteryMid * scaleVal;
                      const yMid = 190 - hMid;

                      return (
                        <g 
                          className="chart-bar-group cursor-pointer"
                          onMouseEnter={() => setHoveredBar("mid")}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <rect 
                            className="transition-all duration-300"
                            x="202.5" 
                            y={yMid} 
                            width="45" 
                            height={hMid || 2} 
                            rx="5" 
                            fill="url(#colorMid)"
                            style={{ filter: hoveredBar === "mid" ? "brightness(1.1)" : "none" }}
                          />
                          <text x="225" y={yMid - 8} fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">
                            {masteryMid}
                          </text>
                          {hoveredBar === "mid" && (
                            <g>
                              <rect x="180" y={yMid - 40} width="90" height="26" rx="5" fill="#1D2433" opacity="0.95" />
                              <text x="225" y={yMid - 23} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">مراجعة: {masteryMid}</text>
                            </g>
                          )}
                        </g>
                      );
                    })()}

                    {/* Low Mastery Bar */}
                    {(() => {
                      const maxVal = Math.max(masteryHigh, masteryMid, masteryLow, 4);
                      const scaleVal = 140 / maxVal;
                      const hLow = masteryLow * scaleVal;
                      const yLow = 190 - hLow;

                      return (
                        <g 
                          className="chart-bar-group cursor-pointer"
                          onMouseEnter={() => setHoveredBar("low")}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <rect 
                            className="transition-all duration-300"
                            x="315" 
                            y={yLow} 
                            width="45" 
                            height={hLow || 2} 
                            rx="5" 
                            fill="url(#colorLow)"
                            style={{ filter: hoveredBar === "low" ? "brightness(1.1)" : "none" }}
                          />
                          <text x="337.5" y={yLow - 8} fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle">
                            {masteryLow}
                          </text>
                          {hoveredBar === "low" && (
                            <g>
                              <rect x="292" y={yLow - 40} width="91" height="26" rx="5" fill="#1D2433" opacity="0.95" />
                              <text x="337.5" y={yLow - 23} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">غير متمكن: {masteryLow}</text>
                            </g>
                          )}
                        </g>
                      );
                    })()}

                    {/* X-Axis Labels */}
                    <text x="112.5" y="210" fill="var(--color-madrasati-dark-ink)" fontSize="10" fontWeight="bold" textAnchor="middle">متمكن</text>
                    <text x="225" y="210" fill="var(--color-madrasati-dark-ink)" fontSize="10" fontWeight="bold" textAnchor="middle">يحتاج مراجعة</text>
                    <text x="337.5" y="210" fill="var(--color-madrasati-dark-ink)" fontSize="10" fontWeight="bold" textAnchor="middle">غير متمكن</text>
                  </svg>
                </div>

                {/* Legend elements */}
                <div className="flex justify-center gap-5 mt-2 text-[10px] md:text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>متمكن</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>أحتاج مراجعة</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>غير متمكن</span>
                </div>
              </div>

              {/* Statistical report metrics */}
              <div className="results-grid grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                <div className="stat-item bg-slate-50 dark:bg-[#1D1632]/30 border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl flex items-center justify-between">
                  <span className="stat-label text-xs md:text-sm text-slate-500 dark:text-[#9E99B3] font-bold">عدد الأسئلة الكلي المتوفر:</span>
                  <span className="stat-val font-black text-sm md:text-base text-slate-800 dark:text-[#FAF9FE]">{totalQuestions}</span>
                </div>
                <div className="stat-item bg-slate-50 dark:bg-[#1D1632]/30 border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl flex items-center justify-between">
                  <span className="stat-label text-xs md:text-sm text-slate-500 dark:text-[#9E99B3] font-bold">الأسئلة التي تمت إجابتها:</span>
                  <span className="stat-val font-black text-sm md:text-base text-slate-800 dark:text-[#FAF9FE]">{answeredCount}</span>
                </div>
                <div className="stat-item bg-slate-50 dark:bg-[#1D1632]/30 border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl flex items-center justify-between">
                  <span className="stat-label text-xs md:text-sm text-slate-500 dark:text-[#9E99B3] font-bold">الأجوبة النموذجية المعروضة:</span>
                  <span className="stat-val font-black text-sm md:text-base text-slate-800 dark:text-[#FAF9FE]">{shownCount}</span>
                </div>
                <div className="stat-item bg-slate-50 dark:bg-[#1D1632]/30 border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl flex items-center justify-between">
                  <span className="stat-label text-xs md:text-sm text-slate-500 dark:text-[#9E99B3] font-bold">الأسئلة التي تم تقييم درجاتها:</span>
                  <span className="stat-val font-black text-sm md:text-base text-slate-800 dark:text-[#FAF9FE]">{ratedCount}</span>
                </div>
              </div>

              {/* Mastery Summary Card list */}
              <div className="mastery-summary bg-slate-50 dark:bg-[#1D1632]/30 border border-madrasati-border dark:border-[#32284D] rounded-2xl p-5">
                <h3 className="mastery-summary-title text-sm md:text-base font-black mb-4 text-slate-800 dark:text-[#FAF9FE] border-b border-madrasati-border dark:border-[#32284D] pb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-madrasati-purple dark:text-[#8E52DC]" />
                  ملخص مستويات تمكنك الأكاديمية:
                </h3>
                <div className="mastery-summary-grid grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="mastery-sum-card bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl text-center flex md:flex-col justify-between items-center shadow-sm">
                    <span className="mastery-sum-count font-black text-2xl text-green-600 dark:text-green-400 order-2 md:order-1">{masteryHigh}</span>
                    <span className="mastery-sum-label text-xs text-slate-500 dark:text-[#9E99B3] font-bold order-1 md:order-2 mt-0 md:mt-1">متمكن من السؤال</span>
                  </div>
                  <div className="mastery-sum-card bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl text-center flex md:flex-col justify-between items-center shadow-sm">
                    <span className="mastery-sum-count font-black text-2xl text-amber-600 dark:text-amber-400 order-2 md:order-1">{masteryMid}</span>
                    <span className="mastery-sum-label text-xs text-slate-500 dark:text-[#9E99B3] font-bold order-1 md:order-2 mt-0 md:mt-1">أحتاج مراجعة وتدرب</span>
                  </div>
                  <div className="mastery-sum-card bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] p-4 rounded-xl text-center flex md:flex-col justify-between items-center shadow-sm">
                    <span className="mastery-sum-count font-black text-2xl text-rose-600 dark:text-rose-400 order-2 md:order-1">{masteryLow}</span>
                    <span className="mastery-sum-label text-xs text-slate-500 dark:text-[#9E99B3] font-bold order-1 md:order-2 mt-0 md:mt-1">غير متمكن</span>
                  </div>
                </div>
              </div>

              {/* Unrated warnings context (if they revealed answer but didn't select rating) */}
              {(() => {
                const unratedList: { num: number; id: string; idx: number }[] = [];
                QUESTIONS_DATA.forEach((q, qIdx) => {
                  if (state.shownAnswers[q.id] && state.ratings[q.id] === undefined) {
                    unratedList.push({ num: qIdx + 1, id: q.id, idx: qIdx });
                  }
                });

                if (unratedList.length === 0) return null;

                return (
                  <div className="unrated-list bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl flex flex-col gap-2 shadow-inner">
                    <div className="unrated-title font-bold text-xs md:text-sm flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertTriangle size={16} />
                      تنبيه: لقد كشفت الأجوبة النموذجية لأسئلة لم تقيّمها بالدرجات بعد:
                    </div>
                    <div className="unrated-items flex flex-wrap gap-2 text-xs font-extrabold mt-1">
                      {unratedList.map((item) => (
                        <button
                          key={item.id}
                          className="unrated-link bg-white dark:bg-[#161226] border border-amber-200 dark:border-[#32284D] hover:border-amber-500 px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                          onClick={() => {
                            setState((prev) => ({
                              ...prev,
                              currentScreen: "practice",
                              currentIndex: item.idx,
                            }));
                          }}
                        >
                          سؤال {item.num} ◀
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Actions row */}
              <div className="results-actions flex flex-col sm:flex-row justify-center items-center gap-3.5 border-t border-madrasati-border dark:border-[#32284D] pt-6">
                <button
                  className="btn bg-madrasati-purple hover:bg-madrasati-medium-purple text-white border-none py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-return-practice"
                  onClick={() => navigateTo("practice")}
                >
                  <Edit3 size={18} />
                  العودة لتعديل تقييمات الأسئلة
                </button>

                <button
                  className="btn bg-white dark:bg-[#161226] hover:bg-slate-100 dark:hover:bg-[#221936] text-madrasati-dark-ink dark:text-[#E9E6FA] border border-madrasati-border dark:border-[#32284D] py-3.5 px-6 rounded-xl font-bold text-sm transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-results-reset"
                  onClick={() => setResetModalOpen(true)}
                >
                  <RotateCcw size={18} />
                  بدء محاولة تدرب جديدة تماماً
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <footer className="text-center py-6 px-4 bg-white dark:bg-[#161226] border-t border-madrasati-border dark:border-[#32284D] mt-auto">
        <p className="text-xs text-madrasati-soft-gray dark:text-[#9E99B3] font-bold max-w-2xl mx-auto leading-relaxed">
          © ٢٠٢٦ تطبيق مدرسي التعليمي — جميع الأسئلة والأجوبة مأخوذة بأمانة تامة من المصادر الرسمية المعتمدة لوزارة التربية العراقية.
        </p>
      </footer>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="modal fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 transition-all">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-content bg-white dark:bg-[#161226] border border-madrasati-border dark:border-[#32284D] p-6 max-w-[460px] w-full rounded-2xl shadow-xl text-center flex flex-col gap-4"
          >
            <h3 className="modal-title text-lg font-black text-rose-600 dark:text-rose-400">تأكيد إعادة التدريب والمحاولة</h3>
            <p className="modal-text text-sm text-madrasati-soft-gray dark:text-[#9E99B3] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف جميع إجاباتك السابقة، تقييماتك الذاتية، ومستويات تمكنك وبدء التدريب من الصفر؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.
            </p>
            <div className="modal-actions flex flex-col sm:flex-row gap-2.5 justify-center mt-2">
              <button 
                className="btn bg-rose-600 hover:bg-rose-700 text-white border-none py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                id="modal-confirm"
                onClick={performReset}
              >
                <RotateCcw size={16} />
                نعم، ابدأ محاولة جديدة
              </button>
              <button 
                className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-[#FAF9FE] border-none py-2.5 px-5 rounded-xl font-bold text-sm cursor-pointer"
                id="modal-cancel"
                onClick={() => setResetModalOpen(false)}
              >
                إلغاء التراجع
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
