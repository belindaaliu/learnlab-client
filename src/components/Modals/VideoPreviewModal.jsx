import React, { useState } from 'react'; 
import { X, PlayCircle, Lock, FileText, HelpCircle, CheckCircle, AlertCircle } from "lucide-react";

// --- Sub-Component: Quiz Preview (Client-Side Only) ---
const QuizPreview = ({ lesson }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({}); // { qId: optionId }
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Extract questions safely
  // Note: Ensure your backend includes 'Assessments' -> 'AssessmentQuestions' -> 'AssessmentOptions'
  const assessment = lesson.Assessments?.[0] || {}; 
  const questions = assessment.AssessmentQuestions || [];

  if (questions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
            <HelpCircle size={48} className="mb-4 opacity-50"/>
            <p>No questions available for preview.</p>
        </div>
    );
  }

  const handleSelect = (qId, optId) => {
    setSelectedOptions({ ...selectedOptions, [qId]: optId });
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach(q => {
      const selected = selectedOptions[q.id];
      // In preview mode, we assume 'is_correct' is present in options
      const correctOpt = q.AssessmentOptions?.find(opt => opt.is_correct);
      
      // Compare IDs (BigInt safe comparison)
      if (correctOpt && selected && String(correctOpt.id) === String(selected)) { 
         correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  // --- Result View ---
  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
        <div className="mb-6">
            {score >= 50 ? (
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            ) : (
                <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto" />
            )}
        </div>
        <h3 className="text-3xl font-bold mb-2">Preview Completed</h3>
        <p className="text-xl mb-8 text-gray-300">You scored <span className={score >= 50 ? "text-green-400" : "text-yellow-400"}>{score}%</span></p>
        
        <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-slate-700">
            <p className="text-sm text-gray-400 mb-4">
                This was just a preview. To save your progress, earn certificates, and access the full exam, please enroll in the course.
            </p>
            <button 
                onClick={() => { setShowResults(false); setCurrentQIndex(0); setSelectedOptions({}); }}
                className="w-full px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition font-bold text-white"
            >
                Retake Preview
            </button>
        </div>
      </div>
    );
  }

  // --- Question View ---
  const currentQ = questions[currentQIndex];

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto w-full">
      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mb-8">
        <div 
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="mb-8">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Question {currentQIndex + 1} of {questions.length}
        </span>
        <h3 className="text-2xl font-bold mt-3 leading-relaxed">{currentQ.question_text}</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {currentQ.AssessmentOptions?.map((opt) => (
            <div 
                key={opt.id}
                onClick={() => handleSelect(currentQ.id, opt.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-4 ${
                    selectedOptions[currentQ.id] === opt.id 
                    ? "bg-purple-900/20 border-purple-500 text-white" 
                    : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-gray-300"
                }`}
            >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedOptions[currentQ.id] === opt.id ? "border-purple-500" : "border-gray-500"
                }`}>
                    {selectedOptions[currentQ.id] === opt.id && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                </div>
                <span className="text-lg">{opt.option_text}</span>
            </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
        <button 
            disabled={currentQIndex === 0}
            onClick={() => setCurrentQIndex(prev => prev - 1)}
            className="px-6 py-2.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 font-medium transition"
        >
            Previous
        </button>
        
        {currentQIndex === questions.length - 1 ? (
            <button 
                onClick={calculateScore}
                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/20"
            >
                Finish & Check
            </button>
        ) : (
            <button 
                onClick={() => setCurrentQIndex(prev => prev + 1)}
                className="px-8 py-2.5 bg-white text-slate-900 hover:bg-gray-100 rounded-lg font-bold transition"
            >
                Next Question
            </button>
        )}
      </div>
    </div>
  );
};

// --- Main Modal Component ---
const VideoPreviewModal = ({ 
  isOpen, 
  onClose, 
  activeLesson, 
  courseContent, 
  courseTitle, 
  courseImage, 
  onChangeLesson,
  onUnlock, 
  unlockLabel, 
  coursePrice
}) => {
  if (!isOpen || !activeLesson) return null;

  // Render Content based on Type
  const renderContent = () => {
    switch (activeLesson.type) {
        case 'video':
            return activeLesson.video_url ? (
                <video 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain bg-black"
                    src={activeLesson.video_url}
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <PlayCircle size={64} className="mb-6 opacity-30"/>
                    <p className="text-lg font-medium">Video not available for preview</p>
                </div>
            );
        
        case 'note':
            return (
                <div className="h-full bg-white text-gray-900 p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold mb-4">READING MATERIAL</span>
                        <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-100">{activeLesson.title}</h2>
                        <div 
                            className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600"
                            dangerouslySetInnerHTML={{ __html: activeLesson.note_content || "<p className='text-gray-500 italic'>No content available.</p>" }} 
                        />
                    </div>
                </div>
            );

        case 'assessment':
            return (
                <div className="h-full bg-slate-900 text-white overflow-hidden">
                    <QuizPreview lesson={activeLesson} />
                </div>
            );

        default:
            return <div className="p-10 text-white">Unknown content type</div>;
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Modal Content */}
      <div className="bg-slate-900 text-white w-full max-w-7xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] border border-slate-800" onClick={e => e.stopPropagation()}>
        
        {/* Left Side: Content Player */}
        <div className="md:w-3/4 bg-black flex flex-col relative">
          {/* Player Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-slate-900">
            <div className="flex items-center gap-3 overflow-hidden">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    activeLesson.type === 'video' ? 'bg-blue-500/20 text-blue-300' :
                    activeLesson.type === 'note' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-purple-500/20 text-purple-300'
                }`}>
                    {activeLesson.type}
                </span>
                <h3 className="font-bold text-sm md:text-base truncate pr-4">{activeLesson.title}</h3>
            </div>
            <span className="text-gray-500 text-xs hidden sm:block font-medium">{courseTitle}</span>
          </div>
          
          {/* CONTENT AREA */}
          <div className="flex-1 overflow-hidden relative">
             {renderContent()}
          </div>
        </div>

        {/* Right Side: Playlist (Sidebar) */}
        <div className="md:w-1/4 bg-slate-900 border-l border-gray-800 flex flex-col w-full">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h4 className="font-bold text-sm text-gray-200">Free Preview Content</h4>
            <button onClick={onClose} className="hover:bg-slate-800 p-2 rounded-full transition text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {courseImage && (
            <div className="w-full h-32 relative overflow-hidden hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                <img src={courseImage} alt="Course" className="w-full h-full object-cover opacity-60" />
                <div className="absolute bottom-3 left-4 z-20">
                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Course Preview</span>
                </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {/* Filter content to show sections structure or flat list. Simplest is flat list of all lessons */}
            {courseContent
                .filter(item => item.type !== 'section') // Show only lessons
                .sort((a,b) => a.order_index - b.order_index) // Ensure order
                .map((lesson, idx) => (
              <div 
                key={lesson.id} 
                onClick={() => lesson.is_preview ? onChangeLesson(lesson) : null}
                className={`flex items-center gap-3 p-3 rounded-lg border border-transparent transition group
                    ${lesson.id === activeLesson.id ? 'bg-slate-800 border-slate-700 shadow-sm' : ''}
                    ${lesson.is_preview ? 'cursor-pointer hover:bg-slate-800/50' : 'opacity-40 cursor-not-allowed grayscale'}
                `}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    lesson.id === activeLesson.id ? 'bg-slate-700' : 'bg-slate-800'
                }`}>
                    {lesson.type === 'video' && <PlayCircle size={14} className={lesson.id === activeLesson.id ? "text-blue-400" : "text-gray-500"} />}
                    {lesson.type === 'note' && <FileText size={14} className={lesson.id === activeLesson.id ? "text-yellow-400" : "text-gray-500"} />}
                    {lesson.type === 'assessment' && <HelpCircle size={14} className={lesson.id === activeLesson.id ? "text-purple-400" : "text-gray-500"} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate mb-1 ${lesson.id === activeLesson.id ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}>
                    {idx + 1}. {lesson.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {!lesson.is_preview ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase"><Lock size={8}/> Locked</span>
                    ) : (
                        <span className="text-[9px] font-bold text-green-500 uppercase bg-green-500/10 px-1.5 rounded">Free</span>
                    )}
                    {lesson.duration_seconds && <span className="text-[9px] text-gray-600">{Math.floor(lesson.duration_seconds/60)}m</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-slate-900">
             <button 
                onClick={onUnlock}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-purple-900/20 flex flex-col items-center justify-center gap-1"
             >
                <span>{unlockLabel || "Unlock Full Course"}</span>
                {coursePrice && !unlockLabel?.includes("Subscription") && (
                  <span className="text-[10px] font-normal opacity-80">
                    One-time payment of ${coursePrice}
                  </span>
                )}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPreviewModal;