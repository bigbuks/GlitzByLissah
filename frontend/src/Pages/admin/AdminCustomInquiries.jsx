import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCalendar, FiX, FiSave, FiUser } from 'react-icons/fi';
import { notify } from '../../utils/notify';
import api from '../../utils/api';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'in-review', label: 'In Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-700' },
  { value: 'won', label: 'Won', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

const TYPE_LABELS = {
  'engagement-ring': 'Engagement Ring',
  'wedding-band': 'Wedding Band',
  'anniversary-gift': 'Anniversary Gift',
  necklace: 'Necklace / Pendant',
  earrings: 'Earrings',
  bracelet: 'Bracelet',
  redesign: 'Redesign / Reset',
  other: 'Other',
};

const BUDGET_LABELS = {
  'under-500': 'Under 500',
  '500-1000': '500 – 1,000',
  '1000-2500': '1,000 – 2,500',
  '2500-5000': '2,500 – 5,000',
  '5000-plus': '5,000+',
  open: 'Open / Not sure',
};

const TIMELINE_LABELS = {
  'within-6-weeks': 'Within 6 weeks',
  'within-3-months': 'Within 3 months',
  'no-rush': 'No rush',
  'specific-date': 'Specific date',
};

const AdminCustomInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // ==========================================
  // FETCH
  // ==========================================
    const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/custom-inquiries');
      if (response.data.success) {
        setInquiries(response.data.inquiries || []);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      notify.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // ==========================================
  // OPEN / CLOSE DETAIL
  // ==========================================
  const openDetail = (inquiry) => {
    setSelected(inquiry);
    setEditStatus(inquiry.status);
    setEditNotes(inquiry.adminNotes || '');
  };

  const closeDetail = () => {
    setSelected(null);
    setEditStatus('');
    setEditNotes('');
  };

  // ==========================================
  // SAVE
  // ==========================================
    const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await api.put(`/admin/custom-inquiries/${selected._id}`, {
        status: editStatus,
        adminNotes: editNotes,
      });
      if (response.data.success) {
        notify.success('Inquiry updated');
        setInquiries((prev) =>
          prev.map((i) => (i._id === selected._id ? response.data.inquiry : i))
        );
        setSelected(response.data.inquiry);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      notify.error('Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================
  const filtered =
    filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  const getStatusStyle = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return opt ? opt.color : 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return opt ? opt.label : status;
  };

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    'in-review': inquiries.filter((i) => i.status === 'in-review').length,
    quoted: inquiries.filter((i) => i.status === 'quoted').length,
    won: inquiries.filter((i) => i.status === 'won').length,
    lost: inquiries.filter((i) => i.status === 'lost').length,
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl">Custom Inquiries</h1>
        <p className="text-sm text-gray-500">
          {inquiries.length} total {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          ...STATUS_OPTIONS.map((s) => ({ key: s.value, label: s.label })),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.key
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`ml-1.5 text-xs ${
                  filter === tab.key ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                ({counts[tab.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          No inquiries with status "{filter === 'all' ? 'any' : getStatusLabel(filter)}"
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header row */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-2">Budget</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Received</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map((inquiry) => (
              <button
                key={inquiry._id}
                onClick={() => openDetail(inquiry)}
                className="w-full text-left p-4 lg:px-6 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center hover:bg-gray-50 transition"
              >
                <div className="lg:col-span-3">
                  <p className="text-xs text-gray-400 lg:hidden">Name</p>
                  <p className="font-medium text-sm">{inquiry.name}</p>
                  <p className="text-xs text-gray-500 truncate">{inquiry.email}</p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-xs text-gray-400 lg:hidden">Type</p>
                  <p className="text-sm">{TYPE_LABELS[inquiry.type] || inquiry.type}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-400 lg:hidden">Budget</p>
                  <p className="text-sm text-gray-600">
                    {inquiry.currency} {BUDGET_LABELS[inquiry.budget]}
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-400 lg:hidden">Status</p>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(inquiry.status)}`}>
                    {getStatusLabel(inquiry.status)}
                  </span>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-400 lg:hidden">Received</p>
                  <p className="text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          DETAIL SIDE PANEL
      ========================================== */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeDetail}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Panel header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-serif text-xl">Inquiry Details</h2>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact */}
              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 font-semibold">Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <FiUser size={16} className="text-gray-400" />
                    <span className="font-medium">{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FiMail size={16} className="text-gray-400" />
                    <a href={`mailto:${selected.email}`} className="text-yellow-600 hover:text-yellow-700">
                      {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <FiPhone size={16} className="text-gray-400" />
                      <a href={`tel:${selected.phone}`} className="text-gray-700">
                        {selected.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <FiCalendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      Received {new Date(selected.createdAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request summary */}
              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 font-semibold">Request</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium">{TYPE_LABELS[selected.type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium">{selected.currency} {BUDGET_LABELS[selected.budget]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Timeline</span>
                    <span className="font-medium">{TIMELINE_LABELS[selected.timeline]}</span>
                  </div>
                  {selected.preferredDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target date</span>
                      <span className="font-medium text-yellow-600">
                        {new Date(selected.preferredDate).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vision */}
              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 font-semibold">Vision</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
                  {selected.vision}
                </p>
              </div>

              {/* Images */}
              {selected.images && selected.images.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 font-semibold">
                    Inspiration Images ({selected.images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.images.map((img, i) => (
                      <a
                        key={i}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-500 transition"
                      >
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 font-semibold">Status</p>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Admin notes */}
              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 font-semibold">Admin Notes</p>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows="4"
                  placeholder="Add internal notes about this inquiry (only you can see these)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-sm"
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Changes
                  </>
                )}
              </button>

              {/* Reply shortcut */}
              <a
                href={`mailto:${selected.email}?subject=Re: Your Custom Inquiry - GlitzByLissah`}
                className="w-full flex items-center justify-center gap-2 border border-yellow-500/20 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-yellow-50 transition"
              >
                <FiMail size={16} />
                Reply by Email
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCustomInquiries;