const fs = require('fs');
const path = require('path');

const routes = [
  "gelen-talepler/sgk-giris", "gelen-talepler/sgk-cikis", "puantaj", 
  "personel/liste", "personel/kisitli", "sgk-giris/yeni", "sgk-giris/liste", 
  "sgk-giris/ayarlar", "sgk-cikis/yeni", "sgk-cikis/liste", "sgk-cikis/ayarlar", 
  "yetkililer/ana", "yetkililer/liste", "yetkililer/yeni", "firma/bilgiler", 
  "sube/bilgiler", "sube/yeni", "sube/istatistik", "departman/liste", "departman/yeni"
];

routes.forEach(r => {
  const dir = path.join(__dirname, '..', 'src', 'app', 'panel', r);
  fs.mkdirSync(dir, { recursive: true });
  const name = r.replace(/\//g, ' - ').toUpperCase();
  const content = `"use client";\n\nexport default function Page() {\n  return (\n    <div className="animate-slide-left h-[70vh] flex flex-col items-center justify-center p-8">\n      <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center max-w-lg w-full text-center">\n        <div className="w-16 h-16 bg-[#f4f5f8] rounded-2xl flex items-center justify-center mb-6 text-3xl shrink-0">\n          🚧\n        </div>\n        <h2 className="text-[20px] font-black text-[#172b4d] mb-3 tracking-tight">${name}</h2>\n        <p className="text-[14px] text-[#6b778c] font-medium leading-relaxed">Bu sekme içeriği yapılandırma ve geliştirme aşamasındadır.</p>\n      </div>\n    </div>\n  );\n}`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});

console.log("All sub-pages successfully provisioned.");
