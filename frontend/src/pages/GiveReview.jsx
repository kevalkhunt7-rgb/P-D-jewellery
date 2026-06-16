import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Camera, X, Loader2, Sparkles, ChevronLeft, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function GiveReview() {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(null); // Added for premium star behavior
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/get-product/${productId}`);
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        toast.error('Product not found');
        navigate('/profile#orders');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please share your thoughts');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', rating);
      formData.append('comment', comment);
      
      images.forEach((image) => {
        formData.append('images', image);
      });

      const { data } = await api.post('/reviews/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success('Reflection shared with the atelier');
        navigate(`/product/${productId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B76E79]" />
        <p className="text-xs font-serif italic text-stone-400 tracking-wider">Loading Atelier Record...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-28 pb-24 selection:bg-[#B76E79]/10">
      <div className="container mx-auto px-4 max-w-xl">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors text-[10px] font-bold uppercase tracking-widest mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" /> 
          Back to Orders
        </button>

        {/* Main Card container */}
        <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-xl shadow-stone-200/30 p-6 sm:p-10">
          
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/60 rounded-full border border-amber-100 text-[#D4AF37] mb-3">
              <Sparkles className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Patron Reflection</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-wide">Share Your Experience</h1>
            <p className="text-stone-400 text-xs mt-1.5 font-light italic">Your insights guide the curation of our collection.</p>
          </div>

          {/* Product Minimalist Context Display */}
          <div className="flex items-center gap-4 mb-8 p-3.5 bg-stone-50 rounded-xl border border-stone-100">
            <img 
              src={product?.images?.[0]?.url || product?.images?.[0]} 
              alt={product?.name} 
              className="w-14 h-14 object-cover rounded-lg bg-stone-100 border border-stone-200/40 shadow-xs"
            />
            <div className="min-w-0">
              <h3 className="font-serif text-base text-stone-900 truncate">{product?.name}</h3>
              <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-widest mt-0.5">Atelier Signature Series</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Elegant Luxury Interactive Star Rating Grid */}
            <div className="space-y-2 text-center bg-stone-50/50 py-4 rounded-xl border border-stone-100">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block mb-1">
                Valuation of Quality
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = hoveredRating !== null ? star <= hoveredRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="transition-transform duration-100 hover:scale-110 active:scale-95 p-1"
                    >
                      <Star 
                        className={`w-7 h-7 transition-colors duration-150 ${
                          isFilled 
                            ? 'fill-[#D4AF37] text-[#D4AF37]' 
                            : 'text-stone-200 fill-transparent'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Styled Textarea Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block">
                Detailed Reflection
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the texture, craftsmanship, and narrative of your new luxury piece..."
                rows={4}
                className="w-full bg-stone-50/30 border border-stone-200 rounded-xl p-4 text-sm font-serif outline-none focus:bg-white focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 transition-all duration-200 resize-none placeholder:text-stone-300"
              />
            </div>

            {/* Luxury Media Uploader */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block">
                Atelier Imagery <span className="font-normal text-stone-400 lowercase italic">(up to 3)</span>
              </label>
              
              <div className="grid grid-cols-4 gap-3">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 group animate-in fade-in zoom-in-95 duration-150">
                    <img src={preview} alt="Preview Portfolio" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full p-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-md backdrop-blur-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#B76E79] hover:bg-stone-50/50 transition-all text-stone-400 hover:text-[#B76E79] group">
                    <Camera className="w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Add Photo</span>
                    <input type="file" className="hidden" multiple onChange={handleImageChange} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            {/* Submission Action Call Component */}
            <button
              disabled={submitting}
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-[0.18em] shadow-lg shadow-stone-900/10 hover:bg-[#B76E79] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2.5 hover:tracking-[0.22em]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Archiving Reflection...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish Reflection</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}