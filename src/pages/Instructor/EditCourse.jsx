import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  BookOpen,
  Users,
  FileText,
  Loader2,
  Layout,
  PlayCircle,
  HelpCircle,
  GripVertical,
  Video,
  UploadCloud,
  Link as LinkIcon,
  FileEdit,
  ListChecks,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Tag,
  Eye,
  EyeOff, // Added Eye icons
} from "lucide-react";
import CategorySelector from "../../components/common/CategorySelector";
import toast from "react-hot-toast";

const EditCourse = () => {
  const params = useParams();
  const courseId = params.courseId || params.id;
  const navigate = useNavigate();

  // --- GENERAL STATES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- BASIC INFO STATES ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    thumbnail_url: "",
    long_description: "",
    language: "English",
    requirements: [""],
    target_audience: [""],
    tags: [],
  });

  const [newTagInput, setNewTagInput] = useState("");

  // --- CURRICULUM STATES ---
  const [sections, setSections] = useState([]);

  // Section UI States
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [expandedSections, setExpandedSections] = useState({});

  // Lesson UI States
  const [addingLessonToSectionId, setAddingLessonToSectionId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("video");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");

  // Upload States
  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Note Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNoteLesson, setCurrentNoteLesson] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  // Quiz Modal States
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizLesson, setCurrentQuizLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // --- CONFIG ---
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // =========================================
  // 1. FETCH DATA
  // =========================================
  const fetchData = async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      const res = await axios.get(`${API_URL}/courses/${courseId}`, config);
      const course = res.data;

      let parsedReqs = [];
      let parsedAudience = [];
      try {
        parsedReqs = course.requirements
          ? JSON.parse(course.requirements)
          : [""];
      } catch (e) {
        console.warn(e);
        parsedReqs = [""];
      }
      try {
        parsedAudience = course.target_audience
          ? JSON.parse(course.target_audience)
          : [""];
      } catch (e) {
        console.warn(e);
        parsedAudience = [""];
      }

      const existingTags = course.CourseTags
        ? course.CourseTags.map((t) => t.tag_name)
        : [];

      setFormData({
        title: course.title,
        description: course.description || "",
        price: course.price,
        category_id: course.category_id ? parseInt(course.category_id) : "",
        thumbnail_url: course.thumbnail_url || "",
        long_description: course.long_description || "",
        language: course.language || "English",
        requirements: parsedReqs.length ? parsedReqs : [""],
        target_audience: parsedAudience.length ? parsedAudience : [""],
        tags: existingTags,
      });

      if (course.CourseContent) {
        const rawSections = course.CourseContent.filter(
          (item) => item.type === "section",
        ).sort((a, b) => a.order_index - b.order_index);
        const organized = rawSections.map((section) => {
          const lessons = course.CourseContent.filter(
            (item) => item.parent_id === section.id && item.type !== "section",
          ).sort((a, b) => a.order_index - b.order_index);
          return { ...section, lessons };
        });
        setSections(organized);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // =========================================
  // 2. HANDLERS
  // =========================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, value, field) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (index, field) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  // --- TAGS HANDLERS ---
  const handleAddTag = () => {
    if (
      newTagInput.trim() !== "" &&
      !formData.tags.includes(newTagInput.trim())
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTagInput.trim()],
      });
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanRequirements = formData.requirements.filter(
        (item) => item.trim() !== "",
      );
      const cleanAudience = formData.target_audience.filter(
        (item) => item.trim() !== "",
      );

      const payload = {
        ...formData,
        requirements: cleanRequirements,
        target_audience: cleanAudience,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        tags: formData.tags,
      };

      await axios.put(`${API_URL}/courses/${courseId}`, payload, config);
      toast.success("Course basic info updated successfully!");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update course info.");
    } finally {
      setSaving(false);
    }
  };

  // --- CURRICULUM ACTIONS ---
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <PlayCircle size={14} />;
      case "note":
        return <FileText size={14} />;
      case "assessment":
        return <HelpCircle size={14} />;
      default:
        return <PlayCircle size={14} />;
    }
  };

  const getLessonBadgeColor = (type) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-600";
      case "note":
        return "bg-orange-100 text-orange-600";
      case "assessment":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // --- PREVIEW TOGGLE ---
  const handleTogglePreview = async (lesson) => {
    try {
      const newStatus = !lesson.is_preview;
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${lesson.id}`,
        { is_preview: newStatus },
        config,
      );
      fetchData();
      toast.success(
        `Preview turned ${newStatus ? "ON" : "OFF"} for this lesson.`,
      );
    } catch (error) {
      console.error("Error toggling preview:", error);
      toast.error("Failed to update preview status");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;
    if (source.droppableId !== destination.droppableId) {
      toast.error("Moving lessons between sections not implemented.");
      return;
    }

    const sectionId = source.droppableId.replace("section-", "");
    const sectionIndex = sections.findIndex(
      (s) => s.id.toString() === sectionId,
    );
    if (sectionIndex === -1) return;

    const section = sections[sectionIndex];
    const newLessons = Array.from(section.lessons);
    const [reorderedItem] = newLessons.splice(source.index, 1);
    newLessons.splice(destination.index, 0, reorderedItem);

    const newSections = [...sections];
    newSections[sectionIndex] = { ...section, lessons: newLessons };
    setSections(newSections);

    try {
      const reorderedIds = newLessons.map((l) => l.id.toString());
      await axios.put(
        `${API_URL}/courses/${courseId}/sections/${sectionId}/reorder`,
        { lessonIds: reorderedIds },
        config,
      );
      toast.success("Curriculum order updated!");
    } catch (error) {
      console.error("Reorder failed", error);
      toast.error("Failed to save new order.");
      fetchData();
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    try {
      await axios.post(
        `${API_URL}/courses/${courseId}/sections`,
        { title: newSectionTitle },
        config,
      );
      setNewSectionTitle("");
      setIsAddingSection(false);
      fetchData();
      toast.success("Section added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error adding section");
    }
  };

  const handleUpdateSection = async () => {
    if (!editSectionTitle.trim()) return;
    try {
      await axios.put(
        `${API_URL}/courses/${courseId}/sections/${editingSectionId}`,
        { title: editSectionTitle },
        config,
      );
      setEditingSectionId(null);
      fetchData();
      toast.success("Section renamed!");
    } catch (error) {
      console.error(error);
      toast.error("Error renaming section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      !window.confirm("Delete this section? All lessons inside will be lost!")
    )
      return;
    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}/sections/${sectionId}`,
        config,
      );
      fetchData();
      toast.success("Section deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete section");
    }
  };

  const handleAddLesson = async (e, sectionId) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    try {
      await axios.post(
        `${API_URL}/courses/${courseId}/sections/${sectionId}/lessons`,
        { title: newLessonTitle, type: newLessonType, is_preview: false },
        config,
      );
      setNewLessonTitle("");
      setNewLessonType("video");
      setAddingLessonToSectionId(null);
      if (!expandedSections[sectionId]) toggleSection(sectionId);
      fetchData();
      toast.success("Lesson added!");
    } catch (error) {
      console.error(error);
      toast.error("Error adding lesson");
    }
  };

  const handleUpdateLesson = async () => {
    if (!editLessonTitle.trim()) return;
    try {
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${editingLessonId}`,
        { title: editLessonTitle },
        config,
      );
      setEditingLessonId(null);
      fetchData();
      toast.success("Lesson title updated!");
    } catch (error) {
      console.error(error);
      toast.error("Error updating lesson");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}/lessons/${lessonId}`,
        config,
      );
      fetchData();
      toast.success("Lesson deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting lesson");
    }
  };

  // --- MODAL FUNCTIONS ---
  const handleFileUpload = async (e, lessonId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLessonId(lessonId);
    setUploadProgress(0);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    try {
      const uploadRes = await axios.post(`${API_URL}/upload`, formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (p) =>
          setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${lessonId}`,
        { video_url: uploadRes.data.url },
        config,
      );
      fetchData();
      toast.success("Video uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed.");
    } finally {
      setUploadingLessonId(null);
      setUploadProgress(0);
    }
  };

  const openNoteEditor = (lesson) => {
    setCurrentNoteLesson(lesson);
    setNoteContent(lesson.note_content || "");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    try {
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${currentNoteLesson.id}`,
        { note_content: noteContent },
        config,
      );
      setIsNoteModalOpen(false);
      fetchData();
      toast.success("Note saved!");
    } catch (error) {
      console.error("Save note error:", error);
      toast.error("Failed to save note");
    }
  };

  const openQuizManager = async (lesson) => {
    setCurrentQuizLesson(lesson);
    try {
      const res = await axios.get(
        `${API_URL}/courses/${courseId}/lessons/${lesson.id}/quiz`,
        config,
      );

      const questions = (res.data.questions || []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: (q.AssessmentOptions || []).map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      }));
      setQuizQuestions(questions);
      setIsQuizModalOpen(true);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setQuizQuestions([]);
      setIsQuizModalOpen(true);
    }
  };

  const quizActions = {
    addQuestion: () =>
      setQuizQuestions([
        ...quizQuestions,
        {
          question_text: "",
          question_type: "mcq",
          options: [
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
          ],
        },
      ]),
    updateText: (idx, txt) => {
      const u = [...quizQuestions];
      u[idx].question_text = txt;
      setQuizQuestions(u);
    },
    updateType: (idx, type) => {
      const u = [...quizQuestions];
      u[idx].question_type = type;
      u[idx].options =
        type === "truefalse"
          ? [
              { option_text: "True", is_correct: true },
              { option_text: "False", is_correct: false },
            ]
          : [
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
            ];
      setQuizQuestions(u);
    },
    removeQuestion: (idx) => {
      const u = [...quizQuestions];
      u.splice(idx, 1);
      setQuizQuestions(u);
    },
    updateOption: (qIdx, oIdx, txt) => {
      const u = [...quizQuestions];
      u[qIdx].options[oIdx].option_text = txt;
      setQuizQuestions(u);
    },
    setCorrect: (qIdx, oIdx) => {
      const u = [...quizQuestions];
      u[qIdx].options.forEach((o) => (o.is_correct = false));
      u[qIdx].options[oIdx].is_correct = true;
      setQuizQuestions(u);
    },
    addOption: (qIdx) => {
      const u = [...quizQuestions];
      u[qIdx].options.push({ option_text: "", is_correct: false });
      setQuizQuestions(u);
    },
    removeOption: (qIdx, oIdx) => {
      const u = [...quizQuestions];
      u[qIdx].options.splice(oIdx, 1);
      setQuizQuestions(u);
    },
  };

  const handleSaveQuiz = async () => {
    try {
      await axios.put(
        `${API_URL}/courses/${courseId}/lessons/${currentQuizLesson.id}/quiz`,
        { questions: quizQuestions },
        config,
      );
      setIsQuizModalOpen(false);
      toast.success("Quiz saved!");
    } catch (error) {
      console.error("Save quiz error:", error);
      toast.error("Failed to save quiz");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/instructor/courses")}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
            <p className="text-sm text-gray-500">
              Manage course details and content
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmitBasicInfo}
          disabled={saving}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 transition shadow-sm"
        >
          {saving ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Save size={20} />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: BASIC INFO */}
        <div className="lg:col-span-4 space-y-8">
          <form onSubmit={handleSubmitBasicInfo} className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
                <BookOpen size={20} className="text-purple-600" /> Basic
                Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Persian">Persian</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </div>
                <div>
                  <CategorySelector
                    selectedId={formData.category_id}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* --- TAGS SECTION --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
                <Tag size={20} className="text-purple-600" /> Tags & Keywords
              </h3>

              <div className="flex gap-2">
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Type tag and press Enter..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {formData.tags.length === 0 && (
                  <span className="text-sm text-gray-400 italic">
                    No tags added yet.
                  </span>
                )}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
                <FileText size={20} className="text-purple-600" /> Detailed
                Description
              </h3>
              <textarea
                name="long_description"
                value={formData.long_description}
                onChange={handleChange}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>

            {/* Requirements & Audience */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
                <CheckCircleIcon /> Requirements
              </h3>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={req}
                    onChange={(e) =>
                      handleArrayChange(index, e.target.value, "requirements")
                    }
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Add requirement..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, "requirements")}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("requirements")}
                className="text-sm font-bold text-purple-600 flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
                <Users size={20} className="text-purple-600" /> Target Audience
              </h3>
              {formData.target_audience.map((aud, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={aud}
                    onChange={(e) =>
                      handleArrayChange(
                        index,
                        e.target.value,
                        "target_audience",
                      )
                    }
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Add audience..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, "target_audience")}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("target_audience")}
                className="text-sm font-bold text-purple-600 flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: CURRICULUM BUILDER */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <Layout size={24} className="text-purple-600" /> Course
                Curriculum
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {sections.length} Sections
              </div>
            </div>

            {/* --- SECTIONS LIST (Wrapped in DND) --- */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="space-y-4 mb-8">
                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    Start by adding your first section!
                  </div>
                )}

                {sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                  >
                    {/* Section Header */}
                    <div className="bg-gray-50 p-3 flex items-center justify-between group select-none">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="cursor-pointer"
                          onClick={() => toggleSection(section.id)}
                        >
                          {expandedSections[section.id] ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </div>
                        {editingSectionId === section.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              autoFocus
                              className="flex-1 px-2 py-1 border rounded"
                              value={editSectionTitle}
                              onChange={(e) =>
                                setEditSectionTitle(e.target.value)
                              }
                            />
                            <button
                              onClick={handleUpdateSection}
                              className="p-1 bg-green-100 text-green-700 rounded"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingSectionId(null)}
                              className="p-1 bg-red-100 text-red-700 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="font-bold text-gray-800 cursor-pointer"
                            onClick={() => toggleSection(section.id)}
                          >
                            Section {idx + 1}: {section.title}
                          </span>
                        )}
                      </div>
                      {editingSectionId !== section.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingSectionId(section.id);
                              setEditSectionTitle(section.title);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-2 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section Content */}
                    {expandedSections[section.id] && (
                      <div className="border-t border-gray-100 bg-white p-2 space-y-1">
                        <Droppable droppableId={`section-${section.id}`}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-1"
                            >
                              {section.lessons &&
                                section.lessons.map((lesson, index) => (
                                  <Draggable
                                    key={lesson.id}
                                    draggableId={lesson.id.toString()}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`flex items-center justify-between pl-2 pr-4 py-3 rounded-lg group border-b border-gray-50 last:border-0 ${snapshot.isDragging ? "bg-purple-100 shadow-lg" : "hover:bg-purple-50"}`}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="text-gray-400 cursor-grab hover:text-gray-600 p-1"
                                          >
                                            <GripVertical size={20} />
                                          </div>
                                          <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getLessonBadgeColor(lesson.type)}`}
                                          >
                                            {getLessonIcon(lesson.type)}
                                          </div>
                                          {editingLessonId === lesson.id ? (
                                            <div className="flex items-center gap-2 flex-1">
                                              <input
                                                autoFocus
                                                className="flex-1 px-2 py-1 border rounded text-sm"
                                                value={editLessonTitle}
                                                onChange={(e) =>
                                                  setEditLessonTitle(
                                                    e.target.value,
                                                  )
                                                }
                                              />
                                              <button
                                                onClick={handleUpdateLesson}
                                                className="p-1 bg-green-100 rounded"
                                              >
                                                <Check size={12} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setEditingLessonId(null)
                                                }
                                                className="p-1 bg-red-100 rounded"
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col">
                                              <span className="text-sm font-medium">
                                                {lesson.title}
                                              </span>
                                              {lesson.type === "video" && (
                                                <span className="text-xs text-gray-400">
                                                  {lesson.video_url
                                                    ? "Video Uploaded"
                                                    : "No Content"}
                                                </span>
                                              )}
                                              {lesson.type === "note" && (
                                                <span className="text-xs text-gray-400">
                                                  {lesson.note_content
                                                    ? "Content Added"
                                                    : "Empty Note"}
                                                </span>
                                              )}
                                              {lesson.type === "assessment" && (
                                                <span className="text-xs text-gray-400">
                                                  Quiz
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {lesson.type === "video" && (
                                            <div className="relative">
                                              {uploadingLessonId ===
                                              lesson.id ? (
                                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                                  <Loader2
                                                    size={14}
                                                    className="animate-spin text-purple-600"
                                                  />
                                                  <span className="text-xs font-bold text-gray-600">
                                                    {uploadProgress}%
                                                  </span>
                                                </div>
                                              ) : (
                                                <>
                                                  <input
                                                    type="file"
                                                    id={`up-${lesson.id}`}
                                                    className="hidden"
                                                    accept="video/*"
                                                    onChange={(e) =>
                                                      handleFileUpload(
                                                        e,
                                                        lesson.id,
                                                      )
                                                    }
                                                  />
                                                  <label
                                                    htmlFor={`up-${lesson.id}`}
                                                    className="cursor-pointer text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100"
                                                  >
                                                    <UploadCloud size={12} />{" "}
                                                    {lesson.video_url
                                                      ? "Re-upload"
                                                      : "Upload"}
                                                  </label>
                                                </>
                                              )}
                                            </div>
                                          )}
                                          {lesson.type === "note" && (
                                            <button
                                              onClick={() =>
                                                openNoteEditor(lesson)
                                              }
                                              className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-100"
                                            >
                                              <FileEdit size={12} /> Edit
                                            </button>
                                          )}
                                          {lesson.type === "assessment" && (
                                            <button
                                              onClick={() =>
                                                openQuizManager(lesson)
                                              }
                                              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-100"
                                            >
                                              <ListChecks size={12} /> Questions
                                            </button>
                                          )}

                                          <div className="flex items-center gap-3 justify-end">
                                            {/* PREVIEW TOGGLE BUTTON */}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleTogglePreview(lesson)
                                              }
                                              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                                                lesson.is_preview
                                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                              }`}
                                              title={
                                                lesson.is_preview
                                                  ? "Public Preview Enabled"
                                                  : "Set as Preview"
                                              }
                                            >
                                              {lesson.is_preview ? (
                                                <Eye size={14} />
                                              ) : (
                                                <EyeOff size={14} />
                                              )}
                                              {lesson.is_preview
                                                ? "Preview On"
                                                : "Preview Off"}
                                            </button>

                                            {editingLessonId !== lesson.id && (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    setEditingLessonId(
                                                      lesson.id,
                                                    );
                                                    setEditLessonTitle(
                                                      lesson.title,
                                                    );
                                                  }}
                                                  className="text-gray-400 hover:text-blue-500 p-1"
                                                >
                                                  <Edit2 size={14} />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleDeleteLesson(
                                                      lesson.id,
                                                    )
                                                  }
                                                  className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Add Lesson Form */}
                        <div className="bg-gray-50 p-3 mt-2 rounded border border-dashed flex items-center gap-2">
                          {addingLessonToSectionId === section.id ? (
                            <form
                              onSubmit={(e) => handleAddLesson(e, section.id)}
                              className="flex items-center gap-2 flex-1 animate-in fade-in"
                            >
                              <select
                                value={newLessonType}
                                onChange={(e) =>
                                  setNewLessonType(e.target.value)
                                }
                                className="text-xs p-2 border rounded"
                              >
                                <option value="video">Video</option>
                                <option value="note">Article</option>
                                <option value="assessment">Quiz</option>
                              </select>
                              <input
                                autoFocus
                                placeholder="Lesson title..."
                                className="flex-1 text-sm p-2 border rounded"
                                value={newLessonTitle}
                                onChange={(e) =>
                                  setNewLessonTitle(e.target.value)
                                }
                              />
                              <button
                                type="submit"
                                className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddingLessonToSectionId(null)}
                                className="text-gray-500 text-xs px-2"
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() =>
                                setAddingLessonToSectionId(section.id)
                              }
                              className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 ml-4"
                            >
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

            {/* Add Section Button */}
            {isAddingSection ? (
              <form
                onSubmit={handleAddSection}
                className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-2 animate-in fade-in"
              >
                <input
                  className="flex-1 p-3 border border-purple-200 rounded-lg"
                  placeholder="Section title..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 rounded-lg"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="text-gray-500 px-4"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingSection(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition"
              >
                <Plus size={20} /> Add New Section
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 m-4">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileEdit className="text-orange-500" /> Edit Note
            </h3>
            <textarea
              rows={10}
              className="w-full p-3 border rounded-lg font-mono text-sm"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 m-4 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ListChecks className="text-purple-600" /> Quiz Manager
              </h3>
              <button onClick={() => setIsQuizModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {quizQuestions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-gray-50 p-4 rounded-xl border relative"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-gray-400">
                      Question {qIndex + 1}
                    </span>
                    <button
                      onClick={() => quizActions.removeQuestion(qIndex)}
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <input
                      className="flex-1 p-2 border rounded"
                      value={q.question_text}
                      onChange={(e) =>
                        quizActions.updateText(qIndex, e.target.value)
                      }
                      placeholder="Question..."
                    />
                    <select
                      className="p-2 border rounded"
                      value={q.question_type}
                      onChange={(e) =>
                        quizActions.updateType(qIndex, e.target.value)
                      }
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="truefalse">True / False</option>
                    </select>
                  </div>
                  <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <button
                          onClick={() => quizActions.setCorrect(qIndex, oIndex)}
                          className={`p-1 rounded-full border ${opt.is_correct ? "bg-green-50 border-green-500 text-green-600" : "text-gray-300"}`}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <input
                          className="flex-1 p-1 border rounded text-sm"
                          value={opt.option_text}
                          onChange={(e) =>
                            quizActions.updateOption(
                              qIndex,
                              oIndex,
                              e.target.value,
                            )
                          }
                          placeholder="Option..."
                        />
                        {q.question_type !== "truefalse" && (
                          <button
                            onClick={() =>
                              quizActions.removeOption(qIndex, oIndex)
                            }
                            className="text-gray-300 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {q.question_type === "mcq" && (
                      <button
                        onClick={() => quizActions.addOption(qIndex)}
                        className="text-xs text-purple-600 font-bold flex items-center gap-1 mt-1"
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between">
              <button
                onClick={quizActions.addQuestion}
                className="px-4 py-2 border-2 border-dashed rounded text-gray-500 font-bold"
              >
                + Add Question
              </button>
              <button
                onClick={handleSaveQuiz}
                className="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700"
              >
                Save Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-purple-600"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default EditCourse;
