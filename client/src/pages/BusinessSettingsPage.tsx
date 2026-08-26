import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Business, BusinessHours } from '../types';
import { Settings, Clock, Save, RefreshCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BusinessSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  // Business Profile Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [services, setServices] = useState('');
  const [pricing, setPricing] = useState('');

  // Weekly Hours Form State
  const [hoursList, setHoursList] = useState<BusinessHours[]>([]);

  const fetchSettings = async () => {
    try {
      const biz: Business = await api.business.getProfile();
      setName(biz.name || '');
      setDescription(biz.description || '');
      setPhone(biz.phone || '');
      setEmail(biz.email || '');
      setWebsite(biz.website || '');
      setAddress(biz.address || '');
      setServices(biz.services || '');
      setPricing(biz.pricing || '');
      
      // Standard ordering for days
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const sortedHours = (biz.businessHours || []).sort(
        (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
      );
      setHoursList(sortedHours);
    } catch (err) {
      console.error('Failed to load business profile settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await api.business.updateProfile({
        name,
        description,
        phone,
        email,
        website,
        address,
        services,
        pricing,
      });
      // Update local storage business object
      localStorage.setItem('reception_business', JSON.stringify(data));
      confetti({
        particleCount: 50,
        spread: 30,
        colors: ['#E4C1F9', '#FCF6BD'],
      });
    } catch (err) {
      console.error('Failed to update business profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleHoursChange = (dayIndex: number, field: keyof BusinessHours, value: any) => {
    setHoursList(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHours(true);
    try {
      const data = await api.business.updateHours(hoursList);
      setHoursList(data);
      confetti({
        particleCount: 50,
        spread: 30,
        colors: ['#D0E1FD', '#FFE5EC'],
      });
    } catch (err) {
      console.error('Failed to update weekly hours:', err);
    } finally {
      setSavingHours(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#A582B8] flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Loading configurations...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-load">
      {/* 1. Left: Profile card fields */}
      <div className="lg:col-span-7 bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-6 shadow-soft-card">
        <h3 className="font-display text-lg text-[#2E1E38] mb-4 flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-[#A582B8]" /> Business Profile Information
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-bold text-[#52405A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Studio/Business Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Industry
              </label>
              <input
                type="text"
                placeholder="e.g. Healthcare / Dentistry"
                value={name.includes('Dental') ? 'Healthcare / Dental' : 'General Service'}
                disabled
                className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-gray-100 text-xs text-[#8C7B93] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
              Studio / Business Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#2E1E38] bg-white text-xs font-medium text-[#2E1E38] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Studio Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Studio Location Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[#2E1E38]/10 pt-4 space-y-4">
            <h4 className="font-display text-base text-[#2E1E38] flex items-center gap-1">
              <span>📚 AI Service Knowledge Parameters</span>
            </h4>
            
            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Services Offered (comma separated lists)
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Pricing & Insurance Information Guidelines
              </label>
              <textarea
                rows={2}
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-[#2E1E38] bg-white text-xs font-medium text-[#2E1E38] focus:outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full mt-2 py-3 rounded-full text-xs font-bold bg-[#E4C1F9] hover:bg-[#D9D2EC] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {savingProfile ? 'Saving profile...' : 'Save Profile Details ✨'}
          </button>
        </form>
      </div>

      {/* 2. Right: Weekly Hours card */}
      <div className="lg:col-span-5 bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-6 shadow-soft-card flex flex-col justify-between">
        <div>
          <h3 className="font-display text-lg text-[#2E1E38] mb-4 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-[#A582B8]" /> Weekly Business Hours
          </h3>

          <form onSubmit={handleHoursSubmit} className="space-y-4">
            <div className="space-y-3.5">
              {hoursList.map((day, idx) => (
                <div key={day.id} className="flex items-center justify-between border-b border-[#2E1E38]/5 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-xs font-bold text-[#2E1E38] w-24">{day.dayOfWeek}</span>
                  
                  <div className="flex items-center gap-2">
                    {!day.isClosed ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          maxLength={5}
                          value={day.openTime}
                          onChange={(e) => handleHoursChange(idx, 'openTime', e.target.value)}
                          className="w-12 text-center py-1 rounded-md border border-[#2E1E38] text-[11px] font-bold text-[#2E1E38] focus:outline-none bg-white"
                        />
                        <span className="text-[10px] font-bold text-gray-400">to</span>
                        <input
                          type="text"
                          maxLength={5}
                          value={day.closeTime}
                          onChange={(e) => handleHoursChange(idx, 'closeTime', e.target.value)}
                          className="w-12 text-center py-1 rounded-md border border-[#2E1E38] text-[11px] font-bold text-[#2E1E38] focus:outline-none bg-white"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-red-500 uppercase w-[120px] text-center bg-red-50 py-1 rounded-md border border-red-200">
                        Closed
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleHoursChange(idx, 'isClosed', !day.isClosed)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold border cursor-pointer transition-colors ${
                        day.isClosed
                          ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                      }`}
                    >
                      {day.isClosed ? 'Open' : 'Close'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={savingHours}
              className="w-full mt-6 py-3 rounded-full text-xs font-bold bg-[#D0E1FD] hover:bg-[#A9CFFF] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {savingHours ? 'Saving Schedule...' : 'Save Weekly Schedule 🌸'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default BusinessSettingsPage;
