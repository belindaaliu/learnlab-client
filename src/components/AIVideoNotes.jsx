import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Loader2, 
  Edit2, 
  Save, 
  Trash2, 
  Download, 
  Copy, 
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AIVideoNotes({ contentId, videoTitle }) {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, completed, error
  const [progressStep, setProgressStep] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    checkExistingNotes();
  }, [contentId]);

  const checkExistingNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/video-notes/video/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.data) {
        setNotes(res.data.data);
        setEditedContent(res.data.data.notes);
        setStatus('completed');
      }
    } catch (err) {
      console.error('Error checking notes:', err);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/video-notes/status/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.data.hasNotes) {
        setNotes(res.data.data.notes);
        setEditedContent(res.data.data.notes);
        setStatus('completed');
        setProcessing(false);
        setMessage('✨ Notes are ready!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const startAutoGeneration = async () => {
    setProcessing(true);
    setStatus('processing');
    setProgressStep(1);
    setMessage('🎬 Step 1: Starting video processing...');
    
    try {
      const response = await axios.post(`${API_URL}/video-notes/auto-generate`, {
        contentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('✅ Processing started! This will take 2-3 minutes...');
      setProgressStep(2);

      // Poll for completion every 5 seconds
      const interval = setInterval(async () => {
        setProgressStep(3);
        setMessage('⏳ Still processing... AI is transcribing your video.');
        
        await checkStatus();
        
        if (status === 'completed') {
          clearInterval(interval);
        }
      }, 5000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (status !== 'completed') {
          setProcessing(false);
          setStatus('error');
          setMessage('⏰ Processing is taking longer than expected. Please check back later.');
        }
      }, 300000);

    } catch (err) {
      setProcessing(false);
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to start processing');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const saveNotes = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/video-notes/${notes.id}`, {
        notes: editedContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotes({ ...notes, notes: editedContent });
      setEditing(false);
      setMessage('Notes saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save notes');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotes = async () => {
    if (!confirm('Delete these notes?')) return;
    try {
      await axios.delete(`${API_URL}/video-notes/${notes.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(null);
      setStatus('idle');
      setMessage('Notes deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to delete notes');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes.notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadNotes = () => {
    const blob = new Blob([notes.notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">AI Video Notes</h3>
          </div>
          
          {status === 'idle' && (
            <button
              onClick={startAutoGeneration}
              disabled={processing}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          )}
        </div>
        <p className="text-xs text-purple-100 mt-1">
          One click - AI transcribes and creates notes automatically
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {status === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            
            {/* Progress Steps */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs ${progressStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Starting
                </span>
                <span className={`text-xs ${progressStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Transcribing
                </span>
                <span className={`text-xs ${progressStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Generating Notes
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(progressStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-gray-800 font-medium mb-2">
              {progressStep === 1 && "🎬 Preparing video..."}
              {progressStep === 2 && "🎤 AI is transcribing audio..."}
              {progressStep === 3 && "📝 Generating study notes..."}
            </p>
            <p className="text-sm text-gray-500">{message}</p>
            <p className="text-xs text-gray-400 mt-4">
              This may take 2-3 minutes for longer videos
            </p>
          </div>
        )}

        {status === 'completed' && notes && (
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 border-b border-gray-100 pb-3">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditedContent(notes.notes);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    disabled={loading}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={downloadNotes}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Download as Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={deleteNotes}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Notes content */}
            {editing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            ) : (
              <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                {notes.notes.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-xl font-bold mt-4 mb-2 text-gray-900">{line.replace('# ', '')}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-semibold mt-3 mb-1 text-gray-800">{line.replace('## ', '')}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-md font-medium mt-2 mb-1 text-gray-700">{line.replace('### ', '')}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc text-gray-700">{line.replace('- ', '')}</li>;
                  } else if (line.trim() === '') {
                    return <br key={i} />;
                  } else {
                    return <p key={i} className="mb-2 text-gray-700">{line}</p>;
                  }
                })}
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-800 font-medium">Something went wrong</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
            <button
              onClick={startAutoGeneration}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Message toast */}
        {message && status !== 'processing' && (
          <div className={`mt-3 p-3 rounded-lg text-center text-sm ${
            message.includes('Failed') || message.includes('error')
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}