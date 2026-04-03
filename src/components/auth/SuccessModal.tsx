import { Check, TriangleAlert, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuccessModal({ firmaKodu }: { firmaKodu: string }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-white mx-4 w-full max-w-[460px] rounded-3xl p-10 flex flex-col items-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] animate-modal-pop relative z-50">
        <div className="w-[72px] h-[72px] bg-green-100 rounded-full flex items-center justify-center mb-5 shadow-sm border border-green-200/60 ring-8 ring-green-50/50">
          <Check className="h-9 w-9 text-green-500 stroke-[3]" />
        </div>
        <h3 className="text-[26px] font-extrabold text-[#172b4d] mb-2 tracking-tight">Kayıt Başarılı!</h3>
        <p className="text-[13.5px] text-center text-[#6b778c] mb-6 font-semibold leading-[1.6]">
          Hesabınız oluşturuldu. Aşağıdaki firma kodunu lütfen kaydediniz. Giriş yaparken bu koda ihtiyacınız olacaktır.
        </p>
        <div className="w-full border-[2.5px] border-dashed border-[#ef5a28]/60 rounded-[20px] py-6 px-4 flex flex-col items-center justify-center bg-[#ef5a28]/5 mb-6 hover:bg-[#ef5a28]/10 transition-colors cursor-default">
          <span className="text-[10px] font-extrabold text-[#ef5a28] uppercase tracking-[0.2em] mb-1 opacity-80">Firma Kodunuz</span>
          <span className="text-[38px] font-black text-[#ef5a28] tracking-[0.15em] drop-shadow-sm select-all">{firmaKodu}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-8 w-full justify-center bg-red-50/80 px-4 py-3 rounded-lg border border-red-100">
          <TriangleAlert className="h-[18px] w-[18px] text-red-500 shrink-0 stroke-[2.5]" />
          <p className="text-[11.5px] font-bold text-red-500">
            Bu kodu güvenli bir yere not edin. Daha sonra tekrar gösterilmeyecektir.
          </p>
        </div>
        <button
          onClick={() => router.push("/panel")} 
          className="w-full bg-[#0a1b3a] hover:bg-[#ef5a28] text-white font-extrabold text-[15px] py-4 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2.5 active:scale-95 hover:shadow-orange-500/30"
        >
          <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
          Tamam, Panele Git
        </button>
      </div>
    </div>
  );
}