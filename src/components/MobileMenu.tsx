'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 -mr-2 text-slate-600 hover:text-[#ef5a28] transition-colors"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2 origin-top">
          <nav className="flex flex-col gap-4 text-[15px] font-bold text-slate-700">
            <Link 
              href="#moduller" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-gray-100 uppercase tracking-wider hover:text-[#ef5a28] transition-colors"
            >
              Modüller
            </Link>
            <Link 
              href="#akis" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-gray-100 uppercase tracking-wider hover:text-[#ef5a28] transition-colors"
            >
              Akış
            </Link>
            <Link 
              href="#referanslar" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-gray-100 uppercase tracking-wider hover:text-[#ef5a28] transition-colors"
            >
              Referanslar
            </Link>
            <Link 
              href="#iletisim-form" 
              onClick={() => setIsOpen(false)}
              className="py-2 uppercase tracking-wider hover:text-[#ef5a28] transition-colors"
            >
              İletişim
            </Link>
          </nav>
          <div className="mt-4 flex flex-col gap-3">
             <Link 
              href="/uye-ol" 
              className="rounded-xl border border-gray-200 text-center bg-white px-5 py-3.5 text-[14px] font-bold text-slate-700 shadow-sm transition-all active:scale-95"
            >
              Hesap Oluştur
            </Link>
            <Link 
              href="/giris" 
              className="rounded-xl bg-[#ef5a28] text-center px-5 py-3.5 text-[14px] font-bold text-white shadow-md active:scale-95"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
