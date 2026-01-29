'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Korisnik {
    id: number;
    email: string;
    ime: string;
    prezime: string;
    je_admin: boolean;
}

export default function Header() {
    const [korisnik, setKorisnik] = useState<Korisnik | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Don't show header on login/register pages
    const hideHeaderPaths = ['/prijava', '/registracija'];
    const shouldHideHeader = hideHeaderPaths.includes(pathname);

    useEffect(() => {
        const korisnikData = localStorage.getItem('korisnik');
        if (korisnikData) {
            setKorisnik(JSON.parse(korisnikData));
        }

        // Listen for storage changes
        const handleStorageChange = () => {
            const korisnikData = localStorage.getItem('korisnik');
            if (korisnikData) {
                setKorisnik(JSON.parse(korisnikData));
            } else {
                setKorisnik(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('korisnik');
        setKorisnik(null);
        router.push('/prijava');
    };

    // If no user is logged in or should hide header, don't show the header
    if (!korisnik || shouldHideHeader) {
        return null;
    }

    return (
        <nav className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title - Clickable to go home */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Digitalni Registar</h1>
                            <p className="text-xs text-gray-500 -mt-1">Procena Rizika</p>
                        </div>
                    </button>

                    {/* Right side - User menu */}
                    <div className="flex items-center space-x-4">
                        {/* User Profile Button */}
                        <button
                            onClick={() => router.push('/profil')}
                            className="hidden md:flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                    {korisnik.ime.charAt(0)}{korisnik.prezime.charAt(0)}
                                </span>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-900">{korisnik.ime} {korisnik.prezime}</p>
                                <p className="text-gray-500 text-xs">{korisnik.email}</p>
                            </div>
                        </button>

                        {/* Mobile Profile Button */}
                        <button
                            onClick={() => router.push('/profil')}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profil
                        </button>

                        {/* Admin Button */}
                        {korisnik.je_admin && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Admin
                            </button>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Odjava
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
