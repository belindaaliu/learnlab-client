import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, GripVertical, Trash2, Edit2, Check, X, 
  PlayCircle, FileText, ChevronDown, ChevronRight, Video, HelpCircle, 
  UploadCloud, Loader2, Link as LinkIcon, FileEdit, ListChecks, CheckCircle
} from 'lucide-react';

const CurriculumBuilder = ({ courseId, sections = [], onUpdate }) => {
  // ==========================
  // STATES
  // ==========================
  const [loading, setLoading] = useState(false);
  
  // --- Section States ---
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [expandedSections, setExpandedSections] = useState({}); 

  // --- Lesson States ---
  const [addingLessonToSectionId, setAddingLessonToSectionId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("video");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");

  // --- Upload States ---
  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- Note Modal States ---
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNoteLesson, setCurrentNoteLesson] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  // --- Quiz Modal States ---
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizLesson, setCurrentQuizLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]); 

  // --- Config ---
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ==========================
  // HELPERS
  // ==========================
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle size={14} />;
      case 'note': return <FileText size={14} />;
      case 'assessment': return <HelpCircle size={14} />;
      default: return <PlayCircle size={14} />;
    }
  };

  const getLessonBadgeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-600';
      case 'note': return 'bg-orange-100 text-orange-600';
      case 'assessment': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ==========================
  // DRAG AND DROP LOGIC
  // ==========================
  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Moving between different sections (Not supported yet)
    if (source.droppableId !== destination.droppableId) {
        alert("Moving lessons between sections requires saving. (Feature coming soon)");
        return;
    }

    // Extract Section ID from droppableId string "section-123"
    const sectionId = parseInt(source.droppableId.replace('section-', ''));
    const section = sections.find(s => s.id === sectionId);
    
    // Reorder Locally (Optimistic UI update)
    const newLessons = Array.from(section.lessons);
    const [reorderedItem] = newLessons.splice(source.index, 1);
    newLessons.splice(destination.index, 0, reorderedItem);

    // Call API to save order
    try {
        const reorderedIds = newLessons.map(l => l.id);
        await axios.put(
            `${API_URL}/courses/${courseId}/sections/${sectionId}/reorder`, 
            { lessonIds: reorderedIds }, 
            config
        );
        onUpdate();
    } catch (error) {
        console.error("Reorder failed", error);
        alert("Failed to save new order");
    }
  };

  // ==========================
  // QUIZ LOGIC
  // ==========================
  const openQuizManager = async (lesson) => {
    setCurrentQuizLesson(lesson);
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/courses/${courseId}/lessons/${lesson.id}/quiz`, config);
      const loadedQuestions = res.data.questions.map(q => ({
        id: q.id, 
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.AssessmentOptions.map(opt => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct
        }))
      }));
      setQuizQuestions(loadedQuestions);
      setIsQuizModalOpen(true);
    } catch (error) {
      console.error("Failed to load quiz:", error);
      alert("Error loading quiz data.");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { question_text: "", question_type: "mcq", options: [{ option_text: "", is_correct: false }, { option_text: "", is_correct: false }] }]);
  };

  const updateQuestionText = (index, text) => {
    const updated = [...quizQuestions];
    updated[index].question_text = text;
    setQuizQuestions(updated);
  };

  const updateQuestionType = (index, type) => {
    const updated = [...quizQuestions];
    updated[index].question_type = type;
    if (type === 'truefalse') {
      updated[index].options = [{ option_text: "True", is_correct: true }, { option_text: "False", is_correct: false }];
    } else {
      updated[index].options = [{ option_text: "", is_correct: false }, { option_text: "", is_correct: false }];
    }
    setQuizQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...quizQuestions];
    updated.splice(index, 1);
    setQuizQuestions(updated);
  };

  const updateOptionText = (qIndex, oIndex, text) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex].option_text = text;
    setQuizQuestions(updated);
  };

  const setCorrectOption = (qIndex, oIndex) => {
    const updated = [...quizQuestions];
    updated[qIndex].options.forEach(opt => opt.is_correct = false);
    updated[qIndex].options[oIndex].is_correct = true;
    setQuizQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...quizQuestions];
    updated[qIndex].options.push({ option_text: "", is_correct: false });
    setQuizQuestions(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...quizQuestions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuizQuestions(updated);
  };

  const saveQuiz = async () => {
    setLoading(true);
    try {
      for (const q of quizQuestions) {
        if (!q.question_text.trim()) {
           alert("Please fill in all question texts.");
           setLoading(false); return;
        }
      }
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${currentQuizLesson.id}/quiz`,
        { questions: quizQuestions },
        config
      );
      alert("Quiz saved successfully!");
      setIsQuizModalOpen(false);
    } catch (error) {
      console.error("Save quiz failed:", error);
      alert("Failed to save quiz.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // NOTE LOGIC
  // ==========================
  const openNoteEditor = (lesson) => {
    setCurrentNoteLesson(lesson);
    setNoteContent(lesson.note_content || ""); 
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!currentNoteLesson) return;
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${currentNoteLesson.id}`, 
        { note_content: noteContent }, 
        config
      );
      setIsNoteModalOpen(false);
      onUpdate(); 
      alert("Note saved successfully!");
    } catch (error) {
      console.error("Save note failed:", error);
      alert("Failed to save note.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // UPLOAD LOGIC
  // ==========================
  const handleFileUpload = async (e, lessonId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLessonId(lessonId);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const fileUrl = uploadRes.data.url;

      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${lessonId}`, 
        { video_url: fileUrl }, 
        config
      );

      onUpdate(); 
      alert("Video uploaded successfully!");

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploadingLessonId(null);
      setUploadProgress(0);
      e.target.value = null; 
    }
  };

  // ==========================
  // SECTION CRUD
  // ==========================
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/courses/${courseId}/sections`, { title: newSectionTitle }, config);
      setNewSectionTitle("");
      setIsAddingSection(false);
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding section");
    } finally {
      setLoading(false);
    }
  };

  const startEditingSection = (section) => {
    setEditingSectionId(section.id);
    setEditSectionTitle(section.title);
  };

  const handleUpdateSection = async () => {
    if (!editSectionTitle.trim()) return;
    try {
      await axios.put(`${API_URL}/courses/${courseId}/sections/${editingSectionId}`, { title: editSectionTitle }, config);
      setEditingSectionId(null);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("Error renaming section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section and all its lessons?")) return;
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/sections/${sectionId}`, config);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("Error deleting section");
    }
  };

  // ==========================
  // LESSON CRUD
  // ==========================
  const handleAddLesson = async (e, sectionId) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/courses/${courseId}/sections/${sectionId}/lessons`, 
        { title: newLessonTitle, type: newLessonType, is_preview: false }, 
        config
      );
      setNewLessonTitle("");
      setNewLessonType("video");
      setAddingLessonToSectionId(null);
      if (!expandedSections[sectionId]) toggleSection(sectionId);
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding lesson");
    } finally {
      setLoading(false);
    }
  };

  const startEditingLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
  };

  const handleUpdateLesson = async () => {
    if (!editLessonTitle.trim()) return;
    try {
      await axios.put(`${API_URL}/courses/${courseId}/lessons/${editingLessonId}`, { title: editLessonTitle }, config);
      setEditingLessonId(null);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("Error updating lesson title");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/lessons/${lessonId}`, config);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("Error deleting lesson");
    }
  };

  // ==========================
  // MAIN RENDER
  // ==========================
  const rootSections = sections.filter(item => item.type === 'section');
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Course Curriculum</h2>

      {/* --- DRAG & DROP CONTEXT --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-4 mb-8">
            {rootSections.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                Start by adding your first section!
            </div>
            )}

            {rootSections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                
                {/* --- SECTION HEADER --- */}
                <div className="bg-gray-50 p-3 flex items-center justify-between group select-none">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="cursor-pointer p-1 rounded hover:bg-gray-200 transition" onClick={() => toggleSection(section.id)}>
                            {expandedSections[section.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </div>
                        
                        {editingSectionId === section.id ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md animate-in fade-in">
                            <input 
                              autoFocus
                              className="flex-1 px-2 py-1 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                              value={editSectionTitle}
                              onChange={(e) => setEditSectionTitle(e.target.value)}
                            />
                            <button onClick={handleUpdateSection} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={14}/></button>
                            <button onClick={() => setEditingSectionId(null)} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={14}/></button>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-800 cursor-pointer" onClick={() => toggleSection(section.id)}>
                              {section.title}
                          </span>
                        )}
                    </div>

                    {editingSectionId !== section.id && (
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditingSection(section)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteSection(section.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    )}
                </div>

                {/* --- LESSONS LIST (Droppable) --- */}
                {expandedSections[section.id] && (
                <div className="border-t border-gray-100 bg-white">
                    <Droppable droppableId={`section-${section.id}`}>
                        {(provided) => (
                            <div 
                                className="p-2 space-y-1"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {section.lessons.map((lesson, index) => (
                                    <Draggable key={lesson.id} draggableId={lesson.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between pl-2 pr-4 py-3 rounded-lg group transition-colors border-b border-gray-50 last:border-0 ${snapshot.isDragging ? "bg-purple-100 shadow-lg" : "hover:bg-purple-50"}`}
                                            >
                                                {/* Left: Icon, Drag Handle & Title */}
                                                <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0">
                                                    
                                                    <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600 p-1">
                                                        <GripVertical size={20} />
                                                    </div>

                                                    <div className={`w-8 h-8 min-w-[32px] rounded-full flex items-center justify-center ${getLessonBadgeColor(lesson.type)}`}>
                                                        {getLessonIcon(lesson.type)}
                                                    </div>

                                                    {editingLessonId === lesson.id ? (
                                                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                                                          <input 
                                                            autoFocus
                                                            className="flex-1 text-sm px-2 py-1 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                                            value={editLessonTitle}
                                                            onChange={(e) => setEditLessonTitle(e.target.value)}
                                                          />
                                                          <button onClick={handleUpdateLesson} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={12}/></button>
                                                          <button onClick={() => setEditingLessonId(null)} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={12}/></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                                                            {lesson.is_preview && <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Preview</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-3 justify-end">
                                                    
                                                    {/* 1. VIDEO UPLOAD */}
                                                    {lesson.type === 'video' && (
                                                      <div className="relative">
                                                        {uploadingLessonId === lesson.id ? (
                                                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                                            <Loader2 size={14} className="animate-spin text-purple-600" />
                                                            <span className="text-xs font-bold text-gray-600">{uploadProgress}%</span>
                                                          </div>
                                                        ) : (
                                                          <>
                                                            <input type="file" id={`upload-${lesson.id}`} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, lesson.id)} />
                                                            <label htmlFor={`upload-${lesson.id}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${lesson.video_url ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"}`}>
                                                              {lesson.video_url ? <LinkIcon size={12}/> : <UploadCloud size={14}/>}
                                                              {lesson.video_url ? "Re-upload" : "Upload"}
                                                            </label>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}

                                                    {/* 2. NOTE EDIT */}
                                                    {lesson.type === 'note' && (
                                                      <button onClick={() => openNoteEditor(lesson)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                                                        <FileEdit size={14} /> Edit Content
                                                      </button>
                                                    )}

                                                    {/* 3. QUIZ MANAGE */}
                                                    {lesson.type === 'assessment' && (
                                                      <button onClick={() => openQuizManager(lesson)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200">
                                                        <ListChecks size={14} /> Manage Questions
                                                      </button>
                                                    )}

                                                    {/* Common Actions */}
                                                    {editingLessonId !== lesson.id && (
                                                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                                        <button onClick={() => startEditingLesson(lesson)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                      </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {/* ADD LESSON FORM */}
                    <div className="bg-gray-50 p-3 border-t border-dashed border-gray-200">
                      {addingLessonToSectionId === section.id ? (
                        <form onSubmit={(e) => handleAddLesson(e, section.id)} className="flex items-center gap-2 pl-8 animate-in slide-in-from-top-1">
                          <select value={newLessonType} onChange={(e) => setNewLessonType(e.target.value)} className="text-xs p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none bg-white cursor-pointer">
                            <option value="video">Video</option>
                            <option value="note">Article</option>
                            <option value="assessment">Quiz</option>
                          </select>
                          <input autoFocus placeholder="Lesson title..." className="flex-1 text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                          <button type="submit" disabled={loading} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700">Add</button>
                          <button type="button" onClick={() => setAddingLessonToSectionId(null)} className="px-3 py-1.5 text-gray-500 text-xs font-bold hover:bg-gray-200 rounded">Cancel</button>
                        </form>
                      ) : (
                        <button onClick={() => setAddingLessonToSectionId(section.id)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 ml-8 transition-colors">
                          <Plus size={16} /> Add Lesson Content
                        </button>
                      )}
                    </div>
                </div>
                )}
            </div>
            ))}
        </div>
      </DragDropContext>

      {/* ADD SECTION BTN */}
      {isAddingSection ? (
        <form onSubmit={handleAddSection} className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-2 animate-in fade-in">
          <input className="flex-1 p-3 border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter new section title..." value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} />
          <button type="submit" className="bg-purple-600 text-white px-6 font-bold rounded-lg hover:bg-purple-700 transition">Save Section</button>
          <button type="button" onClick={() => setIsAddingSection(false)} className="text-gray-500 font-bold px-4 hover:bg-purple-100 rounded-lg">Cancel</button>
        </form>
      ) : (
        <button onClick={() => setIsAddingSection(true)} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition">
          <Plus size={20} /> Add New Section
        </button>
      )}

      {/* NOTE EDITOR MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 m-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileEdit className="text-orange-500"/> Edit Note Content
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
              <input disabled value={currentNoteLesson?.title || ""} className="w-full p-2 bg-gray-100 border rounded text-gray-500" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
              <textarea rows={10} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm" placeholder="Type your lesson content here..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsNoteModalOpen(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveNote} disabled={loading} className="px-5 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>} Save Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MANAGER MODAL */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in overflow-y-auto py-10">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 m-4 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ListChecks className="text-purple-600"/> Quiz Manager: <span className="text-purple-600">{currentQuizLesson?.title}</span>
              </h3>
              <button onClick={()=>setIsQuizModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {quizQuestions.length === 0 && <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">No questions yet. Click "Add Question" below.</div>}
              
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-gray-400 text-xs uppercase">Question {qIndex + 1}</span>
                    <button onClick={() => removeQuestion(qIndex)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <input className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Type your question here..." value={q.question_text} onChange={(e) => updateQuestionText(qIndex, e.target.value)} />
                    <select className="p-2 border border-gray-300 rounded bg-white text-sm" value={q.question_type} onChange={(e) => updateQuestionType(qIndex, e.target.value)}>
                      <option value="mcq">Multiple Choice</option>
                      <option value="truefalse">True / False</option>
                    </select>
                  </div>

                  <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <button onClick={() => setCorrectOption(qIndex, oIndex)} className={`p-1 rounded-full border-2 ${opt.is_correct ? "border-green-500 bg-green-50 text-green-600" : "border-gray-300 text-gray-300 hover:border-gray-400"}`} title="Mark as Correct Answer">
                          <CheckCircle size={16} fill={opt.is_correct ? "currentColor" : "none"} />
                        </button>
                        <input className={`flex-1 p-1.5 border rounded text-sm ${opt.is_correct ? "border-green-500 bg-green-50" : "border-gray-200"}`} placeholder={`Option ${oIndex + 1}`} value={opt.option_text} onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)} readOnly={q.question_type === 'truefalse'} />
                        {q.question_type !== 'truefalse' && (
                          <button onClick={() => removeOption(qIndex, oIndex)} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                        )}
                      </div>
                    ))}
                    {q.question_type === 'mcq' && (
                      <button onClick={() => addOption(qIndex)} className="text-xs font-bold text-purple-600 hover:underline mt-2 flex items-center gap-1">
                        <Plus size={12}/> Add Option
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <button onClick={addQuestion} className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 transition">
                + Add Question
              </button>
              <div className="flex gap-3">
                <button onClick={()=>setIsQuizModalOpen(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={saveQuiz} disabled={loading} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin"/> : <Check size={18}/>} Save Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CurriculumBuilder;