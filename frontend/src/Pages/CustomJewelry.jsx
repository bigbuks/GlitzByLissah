import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiPenTool,
  FiEdit3,
  FiTool,
  FiGift,
  FiUpload,
  FiX,
  FiChevronDown,
} from 'react-icons/fi';
import { notify } from '../utils/notify';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';

const BUDGETS = {
  USD: [
    { value: 'under-500', label: 'Under $500' },
    { value: '500-1000', label: '$500 – $1,000' },
    { value: '1000-2500', label: '$1,000 – $2,500' },
    { value: '2500-5000', label: '$2,500 – $5,000' },
    { value: '5000-plus', label: '$5,000+' },
    { value: 'open', label: 'Open / Not sure yet' },
  ],
  NGN: [
    { value: 'under-500', label: 'Under ₦500k' },
    { value: '500-1000', label: '₦500k – ₦1M' },
    { value: '1000-2500', label: '₦1M – ₦2.5M' },
    { value: '2500-5000', label: '₦2.5M – ₦5M' },
    { value: '5000-plus', label: '₦5M+' },
    { value: 'open', label: 'Open / Not sure yet' },
  ],
  GBP: [
    { value: 'under-500', label: 'Under £500' },
    { value: '500-1000', label: '£500 – £1,000' },
    { value: '1000-2500', label: '£1,000 – £2,500' },
    { value: '2500-5000', label: '£2,500 – £5,000' },
    { value: '5000-plus', label: '£5,000+' },
    { value: 'open', label: 'Open / Not sure yet' },
  ],
};

const TYPES = [
  { value: 'engagement-ring', label: 'Engagement Ring' },
  { value: 'wedding-band', label: 'Wedding Band' },
  { value: 'anniversary-gift', label: 'Anniversary Gift' },
  { value: 'necklace', label: 'Necklace / Pendant' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelet', label: 'Bracelet' },
  { value: 'redesign', label: 'Redesign / Reset an existing piece' },
  { value: 'other', label: 'Something else' },
];

const TIMELINES = [
  { value: 'within-6-weeks', label: 'Within 6 weeks' },
  { value: 'within-3-months', label: 'Within 3 months' },
  { value: 'no-rush', label: 'No rush' },
  { value: 'specific-date', label: 'I have a specific date' },
];

const FAQS = [
  { q: 'Do you work with my existing stones or heirlooms?', a: 'Absolutely. Share photos of the existing piece and our designers will advise on the best approach.' },
  { q: 'How much does a custom piece cost?', a: 'Custom pieces typically start at $500 / ₦500k and go up depending on metal, stones, and complexity. Share your budget and we will design within it.' },
  { q: 'What is the lead time?', a: 'Most custom pieces are completed 4–6 weeks after design approval. Rushed timelines may be possible — just tell us your date.' },
  { q: 'Do you ship internationally?', a: 'Yes — we ship worldwide with full tracking and insurance.' },
  { q: 'Can I see the design before I commit?', a: 'Yes. You will approve a sketch or digital mock-up before we source stones or begin crafting.' },
];

const CustomJewelry = () => {
  const prefersReducedMotion = useReducedMotion();
  const { currency } = useCurrency();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', type: '', budget: '',
    vision: '', timeline: '', preferredDate: '',
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const budgets = BUDGETS[currency] || BUDGETS.USD;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) { height = (height / width) * maxDim; width = maxDim; }
            else { width = (width / height) * maxDim; height = maxDim; }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      notify.error('Maximum 5 images');
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) { notify.error(`${file.name} is not an image`); continue; }
      if (file.size > 5 * 1024 * 1024) { notify.error(`${file.name} is over 5MB`); continue; }
      const dataUrl = await compressImage(file);
      setImages((prev) => [...prev, { url: dataUrl, alt: file.name }]);
    }
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.type || !formData.budget || !formData.vision || !formData.timeline) {
      notify.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post('/custom-inquiries', {
        ...formData, currency, images,
      });
      if (response.data.success) {
        notify.success("Inquiry received! We'll be in touch within 24 hours.");
        setFormData({ name: '', email: '', phone: '', type: '', budget: '', vision: '', timeline: '', preferredDate: '' });
        setImages([]);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      notify.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const processSteps = [
    { icon: FiPenTool, title: 'Envision', desc: 'Share your inspiration, budget, and the story behind the piece.' },
    { icon: FiEdit3, title: 'Design', desc: 'Our designers sketch concepts and source stones. You approve the design.' },
    { icon: FiTool, title: 'Craft', desc: 'Master craftsmen bring it to life. 4–6 weeks from approval to delivery.' },
    { icon: FiGift, title: 'Reveal', desc: 'Your piece arrives in a signature box, ready for the moment.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion ? { duration: 0.01 } : { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: prefersReducedMotion ? { duration: 0.01 } : { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  const inputClass = 'w-full px-4 py-3 border border-yellow-500/15 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    return (
    <div className="min-h-screen">
      {/* ==========================================
          HERO
      ========================================== */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-5 font-light">
              Bespoke by Lissah
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Made for the Moments That Matter
            </h1>
            <div className="mx-auto mb-7 h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Collaborate with us to design a piece as unique as your story.
              From engagement rings to heirloom resets — every detail is yours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          PROCESS
      ========================================== */}
      <section className="py-16 px-4 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-3 font-light">
              The Process
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              From Idea to Heirloom
            </h2>
            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  className="card-warm p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-4 shadow-warm-sm">
                    <Icon size={22} />
                  </div>
                  <p className="text-xs tracking-widest uppercase text-yellow-600 mb-1 font-light">
                    Step {i + 1}
                  </p>
                  <h3 className="font-serif text-xl mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          INQUIRY FORM
      ========================================== */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-3 font-light">
              Start Your Piece
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              Tell Us Your Vision
            </h2>
            <div className="mx-auto mb-5 h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <p className="text-gray-600 font-light">
              We'll reply within 24 hours. No obligation, no pressure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-warm p-6 md:p-8 space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className={inputClass}
              />
            </div>

            {/* What are you looking for */}
            <div>
              <label className={labelClass}>What are you looking for? *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select a piece type</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget + Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Budget *</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select a range</option>
                  {budgets.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Timeline *</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">When do you need it?</option>
                  {TIMELINES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Date (conditional) */}
            {formData.timeline === 'specific-date' && (
              <div>
                <label className={labelClass}>Preferred Date *</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClass}
                />
              </div>
            )}

            {/* Vision */}
            <div>
              <label className={labelClass}>Tell us about your vision *</label>
              <textarea
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Share the story, the occasion, any specific details — stones, metals, size, or inspiration."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Images */}
            <div>
              <label className={labelClass}>Inspiration Images (optional, up to 5)</label>

              <div className="space-y-3">
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-yellow-500/15">
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 shadow-sm transition"
                          aria-label="Remove image"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < 5 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-yellow-500/25 rounded-xl py-8 cursor-pointer hover:border-yellow-500/60 hover:bg-yellow-50/40 transition">
                    <FiUpload size={24} className="text-yellow-500 mb-2" />
                    <p className="text-sm text-gray-700 font-medium">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max 5 images • 5MB each
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-500 text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm hover:shadow-warm-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Sending inquiry...
                </>
              ) : (
                'Start My Custom Piece'
              )}
            </button>

            <p className="text-xs text-center text-gray-400">
              By submitting, you agree to be contacted about your inquiry.
            </p>
          </form>
        </div>
      </section>

      {/* ==========================================
          FAQ
      ========================================== */}
      <section className="py-16 md:py-20 px-4 bg-white/40">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-3 font-light">
              Questions
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              You Might Be Wondering
            </h2>
            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card-warm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-yellow-50/40 transition"
                >
                  <span className="font-medium text-gray-900 pr-4">
                    {faq.q}
                  </span>
                  <FiChevronDown
                    size={18}
                    className={`text-yellow-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? 'auto' : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomJewelry;