import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, RotateCcw, Calculator, RefreshCw, ArrowRight, Sun, Moon, ChevronDown, BookOpen, TrendingUp, Zap, Award, Target, GraduationCap, CheckCircle, Clock, Info, AlertCircle } from 'lucide-react';

// Grade Scale with colors
const GRADE_SCALE = [
  { letter: 'A', point: 4.0, range: '90–100', color: '#10b981', assessment: 'Outstanding' },
  { letter: 'A-', point: 3.67, range: '86–89', color: '#14b8a6', assessment: 'Excellent' },
  { letter: 'B+', point: 3.33, range: '82–85', color: '#06b6d4', assessment: 'Very Good' },
  { letter: 'B', point: 3.0, range: '78–81', color: '#3b82f6', assessment: 'Good' },
  { letter: 'B-', point: 2.67, range: '74–77', color: '#6366f1', assessment: 'Above Average' },
  { letter: 'C+', point: 2.33, range: '70–73', color: '#8b5cf6', assessment: 'Average' },
  { letter: 'C', point: 2.0, range: '66–69', color: '#f59e0b', assessment: 'Below Average' },
  { letter: 'C-', point: 1.67, range: '62–65', color: '#f97316', assessment: 'Poor' },
  { letter: 'D+', point: 1.33, range: '58–61', color: '#ef4444', assessment: 'Very Poor' },
  { letter: 'D', point: 1.0, range: '55–57', color: '#dc2626', assessment: 'Pass' },
  { letter: 'F', point: 0, range: '0–54', color: '#991b1b', assessment: 'Fail' }
];

let courseIdCounter = 1;
const generateId = () => courseIdCounter++;

const GradeDistributionBar = ({ courses, retakeCourses, isDark }) => {
  const gradeCount = useMemo(() => {
    const counts = {};
    GRADE_SCALE.forEach(g => counts[g.letter] = 0);
    
    courses.forEach(c => {
      if (c.grade) {
        const grade = GRADE_SCALE.find(g => g.point === parseFloat(c.grade));
        if (grade) counts[grade.letter]++;
      }
    });
    
    retakeCourses.forEach(c => {
      if (c.newGrade) {
        const grade = GRADE_SCALE.find(g => g.point === parseFloat(c.newGrade));
        if (grade) counts[grade.letter]++;
      }
    });
    
    return counts;
  }, [courses, retakeCourses]);
  
  const total = Object.values(gradeCount).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return null;
  
  return (
    <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 mb-4 sm:mb-6 transition-all duration-500 ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Grade Distribution
        </h3>
        <div className="flex items-center gap-6">
          {Object.entries(gradeCount).filter(([_, count]) => count > 0).map(([letter, count]) => {
            const grade = GRADE_SCALE.find(g => g.letter === letter);
            return (
              <div key={letter} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: grade.color }}
                />
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {letter}: {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="relative h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
        {GRADE_SCALE.map((grade, index) => {
          const count = gradeCount[grade.letter];
          const percentage = (count / total) * 100;
          const prevPercentage = GRADE_SCALE.slice(0, index).reduce((sum, g) => 
            sum + ((gradeCount[g.letter] / total) * 100), 0);
          
          if (count === 0) return null;
          
          return (
            <div
              key={grade.letter}
              className="absolute top-0 h-full transition-all duration-500"
              style={{
                left: `${prevPercentage}%`,
                width: `${percentage}%`,
                backgroundColor: grade.color
              }}
              title={`${grade.letter}: ${count} course${count !== 1 ? 's' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};

const GradeSelect = ({ value, onChange, disabled = false, minGrade = null, placeholder = "Select Grade", isDark }) => {
  const selectedGrade = GRADE_SCALE.find(g => g.point === parseFloat(value));
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                 ${isDark 
                   ? 'bg-slate-800/80 border-2 border-slate-700/50 text-white' 
                   : 'bg-white border-2 border-slate-200 text-slate-900'}
                 disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-400/50`}
      style={{
        borderColor: selectedGrade ? `${selectedGrade.color}80` : '',
        boxShadow: selectedGrade ? `0 0 0 3px ${selectedGrade.color}10` : '',
        color: selectedGrade ? selectedGrade.color : ''
      }}
    >
      <option value="" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{placeholder}</option>
      {GRADE_SCALE.map(grade => {
        const isDisabled = minGrade !== null && grade.point <= minGrade;
        return (
          <option 
            key={grade.letter} 
            value={grade.point}
            disabled={isDisabled}
            style={{ 
              color: grade.color,
              fontWeight: 'bold'
            }}
          >
            {grade.letter} ({grade.point.toFixed(2)}){isDisabled ? ' 🔒' : ''}
          </option>
        );
      })}
    </select>
  );
};

const AnimatedProgress = ({ value, isDark, showChancellorsList }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    if (value === null) {
      setAnimatedValue(0);
      return;
    }
    
    const duration = 1500;
    const start = Date.now();
    const targetValue = parseFloat(value);
    
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setAnimatedValue(eased * targetValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  const getGradeInfo = (val) => {
    if (val >= 3.5) return { color: '#10b981', text: 'Excellent!' };
    if (val >= 3.0) return { color: '#3b82f6', text: 'Great!' };
    if (val >= 2.0) return { color: '#f59e0b', text: 'Good!' };
    return { color: '#ef4444', text: 'Keep Going!' };
  };
  
  const info = getGradeInfo(animatedValue);
  const percentage = (animatedValue / 4.0) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
      {showChancellorsList && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold shadow-lg animate-bounce"
               style={{ animationDuration: '2s' }}>
            <Award size={14} />
            Chancellor's List
          </div>
        </div>
      )}
      
      {value !== null && (
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse"
          style={{ backgroundColor: info.color, animationDuration: '2s' }}
        />
      )}
      
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={isDark ? '#1e293b' : '#e2e8f0'}
          strokeWidth="12"
          className="opacity-30"
        />
        
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={value !== null ? info.color : 'transparent'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ 
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${value !== null ? info.color : 'transparent'})`
          }}
        />
      </svg>
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}
             style={{ color: value !== null ? info.color : '' }}>
          {value !== null ? animatedValue.toFixed(2) : '—'}
        </div>
        <div className={`text-sm font-medium mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          / 4.00
        </div>
        {value !== null && (
          <div className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold animate-bounce"
               style={{ 
                 backgroundColor: `${info.color}20`, 
                 color: info.color,
                 border: `1px solid ${info.color}40`,
                 animationDuration: '2s'
               }}>
            {info.text}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, index, onUpdate, onRemove, totalCount, isRetake = false, isDark }) => {
  const selectedGrade = GRADE_SCALE.find(g => g.point === parseFloat(isRetake ? course.newGrade : course.grade));
  
  return (
    <div className={`group relative flex flex-row items-center gap-3 sm:gap-4 p-4 rounded-xl border-2 transition-all duration-300 
                    hover:scale-[1.01] ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    } ${selectedGrade ? 'hover:shadow-lg' : ''}`}
         style={{ 
           boxShadow: selectedGrade ? `0 0 0 1px ${selectedGrade.color}20, 0 4px 12px ${selectedGrade.color}15` : ''
         }}>
      
      {/* Animated badge */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white
                        transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
                        ${isRetake 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30' 
                          : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30'}`}>
          {isRetake ? `R${index + 1}` : index + 1}
        </div>
      </div>
      
      {!isRetake ? (
        <>
          {/* Credits */}
          <div className="flex-shrink-0">
            <select
              value={course.credit}
              onChange={(e) => onUpdate({ ...course, credit: parseInt(e.target.value) })}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                         ${isDark 
                           ? 'bg-slate-800/80 border-slate-700/50 text-white' 
                           : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {[1, 2, 3, 4].map(c => (
                <option key={c} value={c}>{c} Credit{c !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          
          {/* Grade */}
          <div className="flex-1 min-w-[200px]">
            <GradeSelect
              value={course.grade}
              onChange={(val) => onUpdate({ ...course, grade: val })}
              isDark={isDark}
            />
          </div>
          
          {/* Assessment Label */}
          {selectedGrade && (
            <div className="flex-shrink-0">
              <span 
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ 
                  backgroundColor: selectedGrade.color,
                  boxShadow: `0 2px 8px ${selectedGrade.color}40`
                }}
              >
                {selectedGrade.assessment}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Credits */}
          <div className="flex-shrink-0">
            <select
              value={course.credit}
              onChange={(e) => onUpdate({ ...course, credit: parseInt(e.target.value) })}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                         ${isDark 
                           ? 'bg-slate-800/80 border-slate-700/50 text-white' 
                           : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {[1, 2, 3, 4].map(c => (
                <option key={c} value={c}>{c} Credit{c !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          
          {/* Previous Grade */}
          <div className="flex-1 min-w-[140px]">
            <GradeSelect
              value={course.prevGrade}
              onChange={(val) => {
                const newGradeVal = course.newGrade && parseFloat(course.newGrade) <= parseFloat(val) ? '' : course.newGrade;
                onUpdate({ ...course, prevGrade: val, newGrade: newGradeVal });
              }}
              placeholder="Old Grade"
              isDark={isDark}
            />
          </div>
          
          {/* Arrow */}
          <div className="flex-shrink-0">
            <ArrowRight className={`${isDark ? 'text-slate-600' : 'text-slate-400'}`} 
                        size={20} />
          </div>
          
          {/* New Grade */}
          <div className="flex-1 min-w-[140px]">
            <GradeSelect
              value={course.newGrade}
              onChange={(val) => onUpdate({ ...course, newGrade: val })}
              placeholder="New Grade"
              disabled={!course.prevGrade}
              minGrade={course.prevGrade ? parseFloat(course.prevGrade) : null}
              isDark={isDark}
            />
          </div>
          
          {/* Assessment Label for new grade */}
          {selectedGrade && (
            <div className="flex-shrink-0">
              <span 
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ 
                  backgroundColor: selectedGrade.color,
                  boxShadow: `0 2px 8px ${selectedGrade.color}40`
                }}
              >
                {selectedGrade.assessment}
              </span>
            </div>
          )}
        </>
      )}
      
      {/* Remove Button - visible on hover */}
      {totalCount > 1 && (
        <button
          onClick={onRemove}
          className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                     transition-all duration-300 opacity-0 group-hover:opacity-100
                     ${isDark 
                       ? 'text-red-400 hover:bg-red-900/30 bg-slate-800/90' 
                       : 'text-red-600 hover:bg-red-50 bg-white/90'}
                     shadow-lg hover:scale-110 hover:rotate-12`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

const HowToUse = ({ isDark }) => {
  const steps = [
    "Enter completed credits & CGPA (Step 1) to get projected CGPA",
    "Add fresh courses with credit hours and expected grade",
    "For retakes: select the old grade, then only grades above it unlock",
    "All results update live as you type"
  ];
  
  return (
    <div className={`rounded-xl sm:rounded-2xl p-5 border-2 transition-all duration-500 ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Info className="text-white" size={16} />
        </div>
        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          How to Use
        </h3>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                           ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              {index + 1}
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CGPAVision() {
  const [isDark, setIsDark] = useState(false);
  const [previousRecord, setPreviousRecord] = useState({ cgpa: '', credits: '' });
  const [courses, setCourses] = useState([
    { id: generateId(), credit: 3, grade: '' },
    { id: generateId(), credit: 3, grade: '' },
    { id: generateId(), credit: 3, grade: '' }
  ]);
  const [retakeCourses, setRetakeCourses] = useState([]);
  const [showRetakeSection, setShowRetakeSection] = useState(false);
  const [showGradeScale, setShowGradeScale] = useState(false);
  
  const hasPreviousRecord = useMemo(() => {
    const cgpa = parseFloat(previousRecord.cgpa);
    const credits = parseInt(previousRecord.credits);
    return !isNaN(cgpa) && cgpa >= 0 && cgpa <= 4 && !isNaN(credits) && credits > 0;
  }, [previousRecord]);
  
  const gradedCourses = useMemo(() => courses.filter(c => c.grade !== ''), [courses]);
  const freshWeightedSum = useMemo(() => gradedCourses.reduce((sum, c) => sum + c.credit * parseFloat(c.grade), 0), [gradedCourses]);
  const freshCredits = useMemo(() => gradedCourses.reduce((sum, c) => sum + c.credit, 0), [gradedCourses]);
  
  const validRetakes = useMemo(() => 
    retakeCourses.filter(c => {
      const prev = parseFloat(c.prevGrade);
      const newG = parseFloat(c.newGrade);
      return !isNaN(prev) && !isNaN(newG) && newG > prev;
    }), [retakeCourses]);
  
  const retakeWeightedImpact = useMemo(() => 
    validRetakes.reduce((sum, c) => sum + c.credit * (parseFloat(c.newGrade) - parseFloat(c.prevGrade)), 0), [validRetakes]);
  
  const semesterGPA = useMemo(() => {
    if (freshCredits === 0) return null;
    return (freshWeightedSum + retakeWeightedImpact) / freshCredits;
  }, [freshWeightedSum, retakeWeightedImpact, freshCredits]);
  
  const newCGPA = useMemo(() => {
    if (!hasPreviousRecord || semesterGPA === null) return semesterGPA;
    const prevCGPA = parseFloat(previousRecord.cgpa);
    const prevCredits = parseInt(previousRecord.credits);
    return (prevCGPA * prevCredits + freshWeightedSum + retakeWeightedImpact) / (prevCredits + freshCredits);
  }, [hasPreviousRecord, semesterGPA, previousRecord, freshWeightedSum, retakeWeightedImpact, freshCredits]);
  
  const displayGPA = hasPreviousRecord && newCGPA !== null ? newCGPA : semesterGPA;
  const totalCourseCount = courses.length + retakeCourses.length;
  const totalGradedCount = gradedCourses.length + validRetakes.length;
  const showChancellorsList = displayGPA !== null && displayGPA >= 3.75;
  
  const addCourse = () => setCourses([...courses, { id: generateId(), credit: 3, grade: '' }]);
  const addRetakeCourse = () => {
    setRetakeCourses([...retakeCourses, { id: generateId(), credit: 3, prevGrade: '', newGrade: '' }]);
    setShowRetakeSection(true);
  };
  const removeCourse = (id) => setCourses(courses.filter(c => c.id !== id));
  const removeRetakeCourse = (id) => {
    const newRetakes = retakeCourses.filter(c => c.id !== id);
    setRetakeCourses(newRetakes);
    if (newRetakes.length === 0) setShowRetakeSection(false);
  };
  const updateCourse = (id, updates) => setCourses(courses.map(c => c.id === id ? updates : c));
  const updateRetakeCourse = (id, updates) => setRetakeCourses(retakeCourses.map(c => c.id === id ? updates : c));
  const resetAll = () => {
    setCourses([
      { id: generateId(), credit: 3, grade: '' },
      { id: generateId(), credit: 3, grade: '' },
      { id: generateId(), credit: 3, grade: '' }
    ]);
    setRetakeCourses([]);
    setPreviousRecord({ cgpa: '', credits: '' });
    setShowRetakeSection(false);
  };
  
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40 
                              group-hover:opacity-60 transition-opacity animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 
                              flex items-center justify-center shadow-xl shadow-indigo-500/30
                              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <GraduationCap className="text-white" size={28} />
                </div>
              </div>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-black">
                  <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">CGPA</span>
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Vision</span>
                </h1>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Smart Grade Calculator
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsDark(!isDark)}
              className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-all duration-500 ${
                isDark ? 'bg-slate-800' : 'bg-indigo-200'
              }`}
            >
              <div className={`absolute top-0.5 sm:top-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center
                            transform transition-all duration-500 ${
                              isDark ? 'left-7 sm:left-9' : 'left-0.5 sm:left-1'
                            }`}>
                {isDark ? (
                  <Moon size={14} className="text-slate-700 animate-spin" style={{ animationDuration: '20s' }} />
                ) : (
                  <Sun size={14} className="text-indigo-500 animate-spin" style={{ animationDuration: '20s' }} />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Grade Distribution */}
        <GradeDistributionBar courses={courses} retakeCourses={retakeCourses} isDark={isDark} />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Target, label: 'Courses', value: totalCourseCount, color: 'from-blue-500 to-cyan-500' },
            { icon: CheckCircle, label: 'Graded', value: `${totalGradedCount} / ${totalCourseCount}`, color: 'from-orange-500 to-red-500' },
            { icon: Clock, label: 'Credits', value: freshCredits || '—', color: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, label: 'CGPA', value: displayGPA !== null ? displayGPA.toFixed(2) : '—', color: 'from-green-500 to-emerald-500' }
          ].map((stat, i) => (
            <div key={i} 
                 className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all duration-500
                            hover:scale-105 hover:shadow-xl cursor-pointer
                            ${isDark 
                              ? 'bg-slate-800/50 border-slate-700/50' 
                              : 'bg-white border-slate-200'}`}
                 style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 
                            group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-150`} />
              
              <div className="relative">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 sm:mb-3
                              shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <stat.icon className="text-white" size={18} />
                </div>
                <div className={`text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.label}
                </div>
                <div className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Previous Record */}
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-500 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 
                                flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20
                                animate-pulse" style={{ animationDuration: '3s' }}>
                    1
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Previous Academic Record
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      (optional)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Completed Credits
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 90"
                    value={previousRecord.credits}
                    onChange={(e) => setPreviousRecord({ ...previousRecord, credits: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                             ${isDark 
                               ? 'bg-slate-800/80 border-slate-700/50 text-white placeholder-slate-500' 
                               : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Current CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3.55"
                    value={previousRecord.cgpa}
                    onChange={(e) => setPreviousRecord({ ...previousRecord, cgpa: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                             ${isDark 
                               ? 'bg-slate-800/80 border-slate-700/50 text-white placeholder-slate-500' 
                               : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
              </div>
            </div>
            
            {/* Current Courses */}
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-500 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 
                                flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20
                                animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
                    2
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Fresh Courses This Semester
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {courses.length} course{courses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {courses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={index}
                    onUpdate={(updates) => updateCourse(course.id, updates)}
                    onRemove={() => removeCourse(course.id)}
                    totalCount={courses.length}
                    isDark={isDark}
                  />
                ))}
              </div>
              
              <button
                onClick={addCourse}
                className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white 
                         text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30
                         transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 
                         flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Course
              </button>
            </div>
            
            {/* Retake Courses */}
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-500 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 
                                flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20
                                animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                    3
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Retake Courses
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      (optional)
                    </p>
                  </div>
                </div>
                {retakeCourses.length > 0 && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {retakeCourses.length} course{retakeCourses.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {retakeCourses.length > 0 && (
                <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  isDark ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-200'
                }`}>
                  <AlertCircle className="flex-shrink-0 text-amber-500 mt-0.5" size={16} />
                  <p className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                    <strong>Retake rule:</strong> The new grade must be strictly higher than the old grade. 
                    Retaken course credits are <strong>not</strong> added to total credits — only the grade point difference is applied.
                  </p>
                </div>
              )}
              
              {showRetakeSection && retakeCourses.length > 0 ? (
                <>
                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    {retakeCourses.map((course, index) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        onUpdate={(updates) => updateRetakeCourse(course.id, updates)}
                        onRemove={() => removeRetakeCourse(course.id)}
                        totalCount={retakeCourses.length}
                        isRetake={true}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={addRetakeCourse}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white 
                             text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30
                             transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 
                             flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Retake Course
                  </button>
                </>
              ) : (
                <button
                  onClick={addRetakeCourse}
                  className={`w-full p-4 sm:p-5 rounded-xl border-2 border-dashed transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 sm:gap-4
                           ${isDark 
                             ? 'border-amber-800/50 hover:bg-amber-900/10' 
                             : 'border-amber-300 hover:bg-amber-50/50'}`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 
                                flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <RefreshCw className="text-white animate-spin" size={20} style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>
                      Add Retake Courses
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>
                      Only grade improvements allowed
                    </div>
                  </div>
                </button>
              )}
            </div>
            
            {/* Grade Scale */}
            <div className={`rounded-xl sm:rounded-2xl border-2 overflow-hidden transition-all duration-500 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <button
                onClick={() => setShowGradeScale(!showGradeScale)}
                className={`w-full p-4 sm:p-5 flex items-center justify-between text-sm transition-colors ${
                  isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="text-indigo-500" size={20} />
                  <div className="text-left">
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      UIU Grade Scale
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Full reference table • tap to expand
                    </p>
                  </div>
                </div>
                <ChevronDown 
                  className={`transition-transform duration-300 ${showGradeScale ? 'rotate-180' : ''} ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                  size={18} 
                />
              </button>
              
              {showGradeScale && (
                <div className={`p-4 sm:p-5 border-t-2 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                  <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className={`border-b-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                          <th className={`pb-3 pr-4 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Grade</th>
                          <th className={`pb-3 pr-4 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Points</th>
                          <th className={`pb-3 pr-4 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Marks %</th>
                          <th className={`pb-3 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Assessment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {GRADE_SCALE.map((grade) => (
                          <tr key={grade.letter} 
                              className={`border-b transition-colors ${
                                isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'
                              }`}>
                            <td className="py-3 pr-4">
                              <span 
                                className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm text-white shadow-sm"
                                style={{ 
                                  backgroundColor: grade.color,
                                  boxShadow: `0 2px 8px ${grade.color}40`
                                }}
                              >
                                {grade.letter}
                              </span>
                            </td>
                            <td className={`py-3 pr-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {grade.point.toFixed(2)}
                            </td>
                            <td className={`py-3 pr-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {grade.range}
                            </td>
                            <td className={`py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {grade.assessment}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Reset */}
            <button
              onClick={resetAll}
              className={`w-full py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 
                       hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2
                       ${isDark 
                         ? 'bg-red-900/20 text-red-400 border-2 border-red-800/50 hover:bg-red-900/30' 
                         : 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'}`}
            >
              <RotateCcw size={16} />
              Reset All
            </button>
          </div>
          
          {/* Right Column - Results */}
          <div className="lg:col-span-1 space-y-5">
            {/* Semester GPA Box */}
            <div className={`rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 transition-all duration-500 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className={`text-center text-sm sm:text-base font-black flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {hasPreviousRecord && newCGPA !== null ? 'New CGPA' : 'Semester GPA'}
                </h3>
                {showChancellorsList && (
                  <span className="text-xs font-bold text-orange-500 animate-pulse" style={{ animationDuration: '2s' }}>
                    • Live calculation
                  </span>
                )}
              </div>
              
              <AnimatedProgress value={displayGPA} isDark={isDark} showChancellorsList={showChancellorsList} />
              
              {hasPreviousRecord && newCGPA !== null && (
                <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
                  <div className={`p-3 sm:p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Previous CGPA
                      </span>
                      <span className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {parseFloat(previousRecord.cgpa).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 sm:p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Semester GPA
                      </span>
                      <span className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {semesterGPA?.toFixed(2) || '—'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 sm:p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Semester Credits
                      </span>
                      <span className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {freshCredits}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg 
                                animate-pulse" style={{ animationDuration: '3s' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-bold text-white/90">
                        Change
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white">
                        {newCGPA > parseFloat(previousRecord.cgpa) ? '↑' : 
                         newCGPA < parseFloat(previousRecord.cgpa) ? '↓' : '='} 
                        {Math.abs(newCGPA - parseFloat(previousRecord.cgpa)).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {displayGPA === null && (
                <div className="mt-8 sm:mt-12 text-center">
                  <Calculator className={`mx-auto mb-3 sm:mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} 
                             size={32} />
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Add courses to calculate
                  </p>
                </div>
              )}
            </div>
            
            {/* How to Use Box */}
            <div className={`rounded-xl sm:rounded-2xl p-5 border-2 transition-all duration-500 ${
              isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Info className="text-white" size={16} />
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  How to Use
                </h3>
              </div>
              
              <div className="space-y-3">
                {[
                  "Enter completed credits & CGPA (Step 1) to get projected CGPA",
                  "Add fresh courses with credit hours and expected grade",
                  "For retakes: select the old grade, then only grades above it unlock",
                  "All results update live as you type"
                ].map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                   ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                      {index + 1}
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`mt-12 sm:mt-16 py-6 sm:py-8 border-t-2 transition-all duration-500 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className={`text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Track your academic progress with real-time calculations • Not an official university tool
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            © 2026 <span className="font-bold text-indigo-500">Sourav Biswas</span> • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}