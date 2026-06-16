import React from 'react';

/**
 * SectionCard: Container for settings sections with a header and save button
 */
export const SectionCard = ({ title, description, children, onSave, loading }) => (
  <div className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:border-amber-500/10 transition-all duration-300">
    <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <button
        onClick={onSave}
        disabled={loading}
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98]"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
    <div className="p-6 space-y-6 bg-slate-900/40">
      {children}
    </div>
  </div>
);

/**
 * InputField: Reusable text/number/email input with label
 */
export const InputField = ({ label, id, type = "text", value, onChange, placeholder, helperText }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors shadow-inner"
    />
    {helperText && <p className="text-[10px] text-slate-500 mt-1 ml-1 italic">{helperText}</p>}
  </div>
);

/**
 * ToggleSwitch: Modern toggle switch for boolean settings
 */
export const ToggleSwitch = ({ label, id, checked, onChange, description }) => (
  <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/60 rounded-2xl hover:border-slate-700 transition-colors group">
    <div className="space-y-0.5 max-w-[80%]">
      <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{label}</p>
      {description && <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange({ target: { id, type: 'checkbox', checked: !checked } })}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-sm ${
        checked ? 'bg-amber-500' : 'bg-slate-800'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

/**
 * ImageUpload: Upload component with preview for logo/banners
 */
export const ImageUpload = ({ label, id, preview, onChange, dimensions }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className={`relative border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden bg-slate-950 transition-all duration-300 ${preview ? 'aspect-video' : 'h-32'} flex items-center justify-center`}>
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500 group-hover:text-amber-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-400">Click to upload</p>
          </div>
        )}
        <input
          type="file"
          id={id}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
        />
      </div>
      {dimensions && <p className="text-[10px] text-slate-600 mt-1.5 ml-1 italic">{dimensions}</p>}
    </div>
  </div>
);
