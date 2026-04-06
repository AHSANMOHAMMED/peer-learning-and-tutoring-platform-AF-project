import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadPreferredMedium, savePreferredMedium, supportedMediums, getQAUiText } from '../../data/qaData';

const MediumSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedMedium, setSelectedMedium] = useState(() => {
    const initial = loadPreferredMedium();
    return supportedMediums.includes(initial) ? initial : supportedMediums[0];
  });
  const uiText = getQAUiText(selectedMedium).mediumSelection;

  const cards = useMemo(
    () => supportedMediums.map((medium) => {
      const accents = {
        Tamil: 'bg-orange-100 text-orange-800',
        Sinhala: 'bg-emerald-100 text-emerald-800',
        English: 'bg-sky-100 text-sky-800'
      };
      return {
        key: medium,
        title: medium,
        description: uiText.cardDescription(medium),
        accent: accents[medium] || 'bg-slate-100 text-slate-700'
      };
    }),
    [uiText]
  );

  const handleContinue = () => {
    const mediumToSave = supportedMediums.includes(selectedMedium) ? selectedMedium : supportedMediums[0];
    savePreferredMedium(mediumToSave);
    navigate('/qa/grades');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">{uiText.preferredExamMedium}</p>
          <h1 className="text-4xl font-bold text-slate-900 mt-3">{uiText.chooseLearningMedium}</h1>
          <p className="text-slate-600 mt-3 max-w-2xl">
            {uiText.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          {cards.map((card) => {
            const active = card.key === selectedMedium;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelectedMedium(card.key)}
                className={`rounded-3xl border p-6 text-left shadow-sm transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  active ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.accent}`}>{uiText.mediumBadge}</span>
                </div>
                <p className="text-slate-600">{card.description}</p>
                {active && <p className="mt-4 rounded-2xl bg-blue-100 px-4 py-2 text-sm text-blue-800">{uiText.selected}</p>}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-700">{uiText.currentPreferredMedium}: <strong>{selectedMedium}</strong></p>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {uiText.continueToGradeSelection}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediumSelectionPage;
