"use client";
export default function Page() {
  return (
    <div className="animate-slide-left h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-[#f4f5f8] rounded-2xl flex items-center justify-center mb-6 text-3xl shrink-0">
          🚧
        </div>
        <h2 className="text-[20px] font-black text-[#172b4d] mb-3 tracking-tight">BİRİM</h2>
        <p className="text-[14px] text-[#6b778c] font-medium leading-relaxed">
          Birim listesi ve yeni birim için sol menüden <strong className="text-[#172b4d]">Birim İşlemleri</strong> altındaki bağlantıları kullanın.
        </p>
      </div>
    </div>
  );
}
