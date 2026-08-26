import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FAQ } from '../types';
import { BookOpen, Search, Plus, Trash2, Edit2, Check, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const KnowledgeBasePage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Services');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    try {
      const list = await api.faqs.list({
        category: selectedCategory,
        search: searchTerm,
      });
      setFaqs(list);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [searchTerm, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !category) return;

    setSaving(true);
    try {
      if (editingId) {
        // Update FAQ
        await api.faqs.update(editingId, { question, answer, category, active });
        confetti({ particleCount: 30, spread: 20, colors: ['#FCF6BD', '#E8DFF5'] });
      } else {
        // Create FAQ
        await api.faqs.create({ question, answer, category, active });
        confetti({ particleCount: 70, spread: 45, origin: { y: 0.8 }, colors: ['#E4C1F9', '#D0E1FD'] });
      }
      
      // Reset form
      setQuestion('');
      setAnswer('');
      setCategory('Services');
      setActive(true);
      setEditingId(null);
      setShowForm(false);
      
      fetchFaqs();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setActive(faq.active);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ entry?')) return;
    try {
      await api.faqs.delete(id);
      fetchFaqs();
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      await api.faqs.update(faq.id, { active: !faq.active });
      fetchFaqs();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Categories list
  const categories = ['Hours', 'Pricing', 'Location', 'Services', 'Booking'];

  return (
    <div className="space-y-6 fade-in-load">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[#2E1E38] flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[#A582B8]" /> Knowledge Base (FAQs)
          </h1>
          <p className="text-xs font-semibold text-[#8C7B93]">
            Teach your AI receptionist how to reply by maintaining frequently asked business questions.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setQuestion('');
            setAnswer('');
            setCategory('Services');
            setActive(true);
          }}
          className="px-5 py-2.5 rounded-full bg-[#E4C1F9] hover:bg-[#D9D2EC] text-[#2E1E38] border-2 border-[#2E1E38] text-xs font-bold shadow-cute-border active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel Editor' : 'Add New FAQ'}
        </button>
      </div>

      {/* Editor Form Card */}
      {showForm && (
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-6 shadow-soft-card max-w-xl mx-auto">
          <h3 className="font-display text-lg text-[#2E1E38] mb-4">
            {editingId ? 'Edit Knowledge Base FAQ 📝' : 'Create New FAQ Entry 🌸'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-[#52405A]">
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs font-semibold text-[#2E1E38] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Question
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Do you accept appointment rescheduling?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs font-semibold text-[#2E1E38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Answer content
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Yes, we accept rescheduling up to 24 hours prior to appointment times without penalty..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-[#2E1E38] bg-white text-xs font-medium text-[#2E1E38] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 border-2 border-[#2E1E38] rounded bg-white checked:bg-[#A582B8]"
              />
              <label htmlFor="active" className="text-xs text-[#2E1E38] font-bold select-none cursor-pointer">
                Active (AI Receptionist will use this FAQ answer)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-3 rounded-full text-xs font-bold bg-[#E4C1F9] hover:bg-[#D9D2EC] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center"
            >
              {saving ? 'Saving...' : editingId ? 'Update FAQ Entry' : 'Publish FAQ Entry ✨'}
            </button>
          </form>
        </div>
      )}

      {/* Filters & Grid list */}
      <div className="space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-[#FAF6F0]/40 border-2 border-[#2E1E38] p-3 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A582B8] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search question and answer logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold border-2 border-[#2E1E38] transition-colors cursor-pointer ${
                selectedCategory === '' ? 'bg-[#2E1E38] text-white' : 'bg-white text-[#8C7B93] hover:text-[#2E1E38]'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold border-2 border-[#2E1E38] transition-colors cursor-pointer ${
                  selectedCategory === c ? 'bg-[#2E1E38] text-white' : 'bg-white text-[#8C7B93] hover:text-[#2E1E38]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[#A582B8] flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Fetching Knowledge Base...
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-12 text-center text-[#8C7B93]">
            No FAQ entries match the current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between ${
                  !faq.active ? 'opacity-65' : ''
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-0.5 rounded-full bg-[#E8DFF5] border border-[#2E1E38] text-[9px] font-bold uppercase tracking-wider text-[#2E1E38]">
                      {faq.category}
                    </span>
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className={`px-2 py-0.5 rounded-full border border-[#2E1E38] text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        faq.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {faq.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <h3 className="font-display text-base text-[#2E1E38] leading-snug pt-1">
                    Q: {faq.question}
                  </h3>
                  
                  <p className="text-xs font-semibold text-[#52405A] leading-relaxed">
                    A: {faq.answer}
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-[#2E1E38]/5 pt-3 mt-1 shrink-0">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-2 rounded-full border border-[#2E1E38]/10 hover:border-[#2E1E38] text-gray-600 hover:text-[#2E1E38] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 rounded-full border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default KnowledgeBasePage;
