import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { careerService } from '@/services/career.service';
import type { CareerPreferencesData } from '@/types/career.types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPreferences: CareerPreferencesData;
  onPreferencesUpdated: () => void;
}

const AVAILABLE_CAREERS = [
  'Software Engineer',
  'Data Scientist',
  'Cybersecurity Analyst',
  'Doctor',
  'Biotechnologist',
  'Chartered Accountant',
  'Investment Banker',
  'Product Manager',
  'Corporate Lawyer',
  'Civil Servant (IAS / IPS / IFS)',
  'Clinical Psychologist',
  'UI/UX Designer',
];

const WORK_ENVIRONMENTS = [
  'Office-based',
  'Remote / Hybrid',
  'Field & Laboratory',
  'Flexible',
];

const CAREER_TYPES = [
  'Private Sector',
  'Public & Government',
  'Entrepreneurial & Startup',
  'Research & Academia',
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  initialPreferences,
  onPreferencesUpdated,
}) => {
  const [preferredCareers, setPreferredCareers] = useState<string[]>(
    initialPreferences.preferred_careers || []
  );
  const [workEnvironment, setWorkEnvironment] = useState<string>(
    initialPreferences.work_environment || 'Office-based'
  );
  const [careerType, setCareerType] = useState<string>(
    initialPreferences.career_type || 'Private Sector'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCareer = (careerName: string) => {
    if (preferredCareers.includes(careerName)) {
      setPreferredCareers(preferredCareers.filter((c) => c !== careerName));
    } else {
      if (preferredCareers.length >= 3) {
        setErrorMsg('You can select a maximum of 3 preferred careers.');
        return;
      }
      setErrorMsg(null);
      setPreferredCareers([...preferredCareers, careerName]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await careerService.updatePreferences({
        preferred_careers: preferredCareers,
        work_environment: workEnvironment,
        career_type: careerType,
      });
      onPreferencesUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 text-left animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Update Career Preferences</h3>
              <p className="text-xs text-muted-foreground">
                Adjust your aspirations to refine personalized recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-medium">
            {errorMsg}
          </div>
        )}

        {/* 1. Preferred Careers Selection (Max 3) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Preferred Careers ({preferredCareers.length} / 3 selected)
            </label>
            <span className="text-[11px] text-muted-foreground">Select up to 3</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {AVAILABLE_CAREERS.map((careerName) => {
              const isSelected = preferredCareers.includes(careerName);
              const rank = preferredCareers.indexOf(careerName) + 1;

              return (
                <button
                  key={careerName}
                  type="button"
                  onClick={() => toggleCareer(careerName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-2xs'
                      : 'bg-muted/20 text-foreground border-border hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  {isSelected && (
                    <span className="h-4 w-4 rounded-full bg-primary-foreground/20 text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                      {rank}
                    </span>
                  )}
                  <span>{careerName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Work Environment Preference */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Preferred Work Environment
          </label>
          <div className="grid grid-cols-2 gap-2">
            {WORK_ENVIRONMENTS.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setWorkEnvironment(env)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                  workEnvironment === env
                    ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                    : 'bg-muted/15 text-foreground border-border hover:bg-muted/25'
                }`}
              >
                <span>{env}</span>
                {workEnvironment === env && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Career Sector Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Sector Preference
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CAREER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCareerType(type)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                  careerType === type
                    ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                    : 'bg-muted/15 text-foreground border-border hover:bg-muted/25'
                }`}
              >
                <span>{type}</span>
                {careerType === type && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button onClick={onClose} variant="outline" size="sm" className="rounded-xl text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            size="sm"
            className="gap-2 rounded-xl text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
