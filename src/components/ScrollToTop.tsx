"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[99]">
      <button
        onClick={scrollToTop}
        className={`group flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ef5a28] to-[#FA4A0C] text-white shadow-xl shadow-[#ef5a28]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ef5a28]/50 active:scale-95 ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4 pointer-events-none"
        }`}
        aria-label="Yukarı Çık"
      >
        <ArrowUp className="h-6 w-6 stroke-[3] transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
}
