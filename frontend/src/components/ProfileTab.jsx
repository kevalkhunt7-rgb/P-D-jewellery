import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { sanitizePhone } from '../utils/phoneValidation';

export function ProfileTab({
  user,
  isEditing,
  setIsEditing,
  editData,
  setEditData,
  imagePreview,
  handleFileChange,
  handleUpdateProfile,
  updateLoading
}) {
  return (
    <div className="space-y-8 animate-fade-in-slow">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-white shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-xl">Account Details</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 font-semibold text-sm border rounded-full hover:bg-stone-300 cursor-pointer transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Avatar Input Only Visible when Editing to keep the form unified */}
          {isEditing && (
            <div className="flex flex-col items-center gap-2 pb-4 border-b border-stone-100 sm:hidden">
              <span className="text-[10px] uppercase tracking-wider text-[#2C2C2C]/40">Update Avatar</span>
              <label className="px-4 py-2 text-xs bg-[#FDF8F3] border border-[#E8C7B7] rounded-xl cursor-pointer flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Choose Image
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase tracking-wider ml-1">
              Full Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full mt-1 py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#B76E79]/30 outline-none focus:border-[#B76E79]"
              />
            ) : (
              <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#E8C7B7]/20">
                {user?.name}
              </p>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider ml-1">
              Email Address
            </span>
            <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#E8C7B7]/20 opacity-60">
              {user?.email}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider ml-1">
              Phone Number
            </span>
            {isEditing ? (
              <input
                type="tel"
                maxLength={10}
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: sanitizePhone(e.target.value) })}
                className="w-full mt-1 py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#B76E79]/30 outline-none focus:border-[#B76E79]"
              />
            ) : (
              <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#E8C7B7]/20">
                {user?.phone || 'Not Provided'}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="pt-4">
              <button
                disabled={updateLoading}
                type="submit"
                className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-medium hover:bg-[#A65D68] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Profile Information
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}