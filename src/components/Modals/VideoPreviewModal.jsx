import React from 'react';
import { X, PlayCircle, Lock } from "lucide-react";

const VideoPreviewModal = ({ isOpen, onClose, course, title, videoUrl }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      
      {/* Modal Content */}
      <div className="bg-slate-900 text-white w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Left Side: Video Player */}
        <div className="md:w-2/3 bg-black flex flex-col">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-sm truncate pr-4">Course Preview</h3>
            <span className="text-gray-400 text-xs font-bold">{course?.title}</span>
          </div>
          
          {/* PLAYER AREA */}
          <div className="flex-1 flex items-center justify-center bg-black relative group">
            {videoUrl ? (
              
              <video 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (

                <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                 <img src={course?.image} className="w-full h-full object-cover opacity-50" alt="preview" />
                 <PlayCircle className="w-20 h-20 text-white absolute opacity-90 group-hover:scale-110 transition" />
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-800 text-sm">
            <p className="font-bold mb-1">Now Playing:</p>
            <p className="text-gray-300">{title || "Course Introduction"}</p>
          </div>
        </div>

        {/* Right Side: Playlist */}
        <div className="md:w-1/3 bg-slate-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h4 className="font-bold">Free Sample Videos</h4>
            <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {[
              { title: "Course Introduction", time: "02:15", free: true },
              { title: "What you will learn", time: "05:30", free: true },
              { title: "Installing Tools", time: "10:00", free: false },
              { title: "First Program", time: "08:20", free: true },
            ].map((vid, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${vid.free ? 'hover:bg-slate-800' : 'opacity-50 cursor-not-allowed'}`}>
                <div className="relative w-16 h-10 bg-gray-800 rounded overflow-hidden shrink-0">
                  <img src={course?.image} className="w-full h-full object-cover opacity-60" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {vid.free ? <PlayCircle className="w-4 h-4 text-white" /> : <Lock className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-200">{vid.title}</p>
                  <p className="text-xs text-gray-500">{vid.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-800">
             <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition">
                Buy this course
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPreviewModal;