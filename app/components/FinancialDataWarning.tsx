'use client';

import React from 'react';

interface FinancialDataWarningProps {
  onOpenForm: () => void;
}

export default function FinancialDataWarning({ onOpenForm }: FinancialDataWarningProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Процена ризика није могућа без финансијских података
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              Према стандарду SRPS A.L2.003:2025, финансијски подаци су <strong>обавезни</strong> за тачну процену ризика.
              Без њих, резултати процене неће бити валидни.
            </p>
            <p className="mt-2">
              Молимо унесите следеће податке:
            </p>
            <ul className="list-disc list-inside mt-1">
              <li>Пословни приходи (AOP 1001) из последњег биланса</li>
              <li>Вредност имовине (некретине, постројења, опрема, залихе)</li>
              <li>Тип делатности организације</li>
            </ul>
          </div>
          <div className="mt-4">
            <button
              onClick={onOpenForm}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              📊 Унеси финансијске податке
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}