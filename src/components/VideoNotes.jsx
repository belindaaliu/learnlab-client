import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Loader2, Edit2, Save, Trash2, Download, Copy, Check } from 'lucide-react';

export default function VideoNotes({ contentId, videoTitle }) {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchNotes();
  }, [contentId]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/video-notes/video/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setNotes(res.data.data);
        setEditedContent(res.data.data.notes);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const generateNotes = async () => {
    setGenerating(true);
    setMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/video-notes/generate`, {
        contentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotes(res.data.data);
      setEditedContent(res.data.data.notes);
      setMessage('Notes generated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate notes');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setGenerating(false);
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Video Notes</h3>
          </div>
          
          {!notes && !generating && (
            <button
              onClick={generateNotes}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Generate Notes
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {generating && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-gray-600">AI is analyzing the video and generating notes...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
          </div>
        )}

        {notes && !generating && (
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
              <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto">
                {notes.notes.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-semibold mt-3 mb-1">{line.replace('## ', '')}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-md font-medium mt-2 mb-1">{line.replace('### ', '')}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                  } else if (line.trim() === '') {
                    return <br key={i} />;
                  } else {
                    return <p key={i} className="mb-2">{line}</p>;
                  }
                })}
              </div>
            )}
          </div>
        )}

        {/* Message toast */}
        {message && (
          <div className={`mt-3 p-3 rounded-lg text-center text-sm ${
            message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}