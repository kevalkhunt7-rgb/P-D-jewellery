import React from 'react';
import { HiOutlineTrash, HiOutlineXMark } from "react-icons/hi2";

export function DeleteModal({ isOpen, onClose, onConfirm, title = "Object Delete", message = "Are you sure you want to delete this object?" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Trash Icon Header */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
              <HiOutlineTrash className="w-8 h-8 text-rose-500" />
            </div>
            {/* Minimal Decorative Trash Lid Effect */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-rose-500 rounded-full shadow-sm shadow-rose-500/50" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          <h3 className="text-lg font-bold text-white tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-3 p-4 bg-slate-950/50 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-[0.98] transition-all"
          >
            Delete
          </button>
        </div>

        {/* Close Icon (Optional) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <HiOutlineXMark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
