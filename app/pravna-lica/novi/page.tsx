'use client';

import { useRouter } from 'next/navigation';
import LegalEntityForm from '../../components/LegalEntityForm';

export default function NovoPravnoLicePage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Nakon uspesnog kreiranja, preusmeri na listu pravnih lica
        router.push('/pravna-lica');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
            {/* Navigation back button */}
            <div className="max-w-6xl mx-auto mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-600 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Nazad
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                <LegalEntityForm
                    onSuccess={handleSuccess}
                    submitLabel="💾 Sačuvaj pravno lice"
                    loadingLabel="💾 Čuvanje..."
                />
            </div>
        </div>
    );
}
