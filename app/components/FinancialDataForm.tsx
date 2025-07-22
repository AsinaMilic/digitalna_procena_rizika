'use client';

import React, { useState } from 'react';
import { UTICAJ_DELATNOSTI } from '../data/riskDataLoader';

interface FinancialData {
  poslovniPrihodi: number;
  vrednostImovine: number;
  delatnost: string;
  stvarnaSteta: number;
}

interface FinancialDataFormProps {
  procenaId: string;
  initialData?: Partial<FinancialData>;
  onSave: (data: FinancialData) => void;
  onClose: () => void;
}

export default function FinancialDataForm({ procenaId, initialData, onSave, onClose }: FinancialDataFormProps) {
  const [formData, setFormData] = useState<FinancialData>({
    poslovniPrihodi: initialData?.poslovniPrihodi || 1000000,
    vrednostImovine: initialData?.vrednostImovine || 5000000,
    delatnost: initialData?.delatnost || 'default',
    stvarnaSteta: initialData?.stvarnaSteta || 0
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Sačuvaj finansijske podatke
      const response = await fetch(`/api/procena/${procenaId}/financial-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave(formData);
        onClose();
      } else {
        throw new Error('Greška pri čuvanju podataka');
      }
    } catch (error) {
      console.error('Greška:', error);
      alert('Greška pri čuvanju finansijskih podataka');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FinancialData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const delatnostiOptions = Object.keys(UTICAJ_DELATNOSTI).map(key => ({
    value: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    iud: UTICAJ_DELATNOSTI[key]
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              💰 Finansijski podaci za procenu
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Poslovni prihodi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poslovni prihodi (AOP 1001) - RSD
              </label>
              <input
                type="number"
                value={formData.poslovniPrihodi}
                onChange={(e) => handleChange('poslovniPrihodi', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000000"
                required
              />
              <p className="text-xs text-gray-900 mt-1">
                Iz poslednjeg objavljenog bilansa uspеha (AOP 1001)
              </p>
            </div>

            {/* Vrednost imovine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vrednost imovine (SVnpoz) - RSD
              </label>
              <input
                type="number"
                value={formData.vrednostImovine}
                onChange={(e) => handleChange('vrednostImovine', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5000000"
                required
              />
              <p className="text-xs text-gray-900 mt-1">
                Sadašnja vrednost nekretina, postrojenja, opreme i zaliha
              </p>
            </div>

            {/* Delatnost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delatnost organizacije
              </label>
              <select
                value={formData.delatnost}
                onChange={(e) => handleChange('delatnost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {delatnostiOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} (Iud: {option.iud})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-900 mt-1">
                Utiče na indeks uticaja delatnosti (Iud) u kalkulaciji VMŠ
              </p>
            </div>

            {/* Stvarna šteta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stvarna šteta (SŠ) - RSD
              </label>
              <input
                type="number"
                value={formData.stvarnaSteta}
                onChange={(e) => handleChange('stvarnaSteta', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-900 mt-1">
                Evidentirana šteta u protekle 3 godine (može biti 0)
              </p>
            </div>

            {/* Kalkulacija preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📊 Pregled kalkulacije</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>
                  <strong>SŠ procenat:</strong> {formData.poslovniPrihodi > 0 ? 
                    ((formData.stvarnaSteta / formData.poslovniPrihodi) * 100).toFixed(2) : 0}% od poslovnih prihoda
                </div>
                <div>
                  <strong>Iud (indeks uticaja delatnosti):</strong> {UTICAJ_DELATNOSTI[formData.delatnost]}
                </div>
                <div>
                  <strong>Ukupna vrednost za kalkulacije:</strong> {(formData.poslovniPrihodi + formData.vrednostImovine).toLocaleString()} RSD
                </div>
              </div>
            </div>

            {/* Dugmad */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={saving}
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Čuvam...' : 'Sačuvaj'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}