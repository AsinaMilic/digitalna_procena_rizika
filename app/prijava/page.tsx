'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function Prijava() {
    const [formData, setFormData] = useState({
        email: '',
        lozinka: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/prijava', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Čuvanje tokena u localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('korisnik', JSON.stringify(data.korisnik));

                // Preusmeravanje na početnu stranicu
                router.push('/');
            } else {
                setError(data.greška || 'Došlo je do greške');
            }
        } catch (err) {
            setError('Došlo je do greške pri slanju zahteva');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Prijava
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email adresa"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Lozinka"
                                value={formData.lozinka}
                                onChange={(e) => setFormData({...formData, lozinka: e.target.value})}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Prijavljujem...' : 'Prijavite se'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link href="/registracija" className="text-indigo-600 hover:text-indigo-500">
                            Nemate nalog? Registrujte se
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
