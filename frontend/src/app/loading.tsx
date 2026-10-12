import { Music2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 select-none">
      <div className="relative w-20 h-20 flex items-center justify-center mb-4">
        {/* Pulsing dance ring (gentle 14s spin) */}
        <div className="absolute inset-0 rounded-full border-2 border-[#FFD200]/50 animate-spin [animation-duration:14s]" />
        <div className="absolute inset-1.5 rounded-full border-2 border-[#7928CA]/30 animate-dance-ring" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF1E82] to-[#7928CA] flex items-center justify-center shadow-md shadow-pink-500/20">
          <Music2 className="w-6 h-6 text-white animate-pulse [animation-duration:2.5s]" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-xl font-black text-gray-900 tracking-tight">
        <span>Step</span>
        <span className="text-[#FF1E82]">Up</span>
      </div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
        Loading…
      </p>

      {/* Mini equalizer bars */}
      <div className="flex items-center gap-1 mt-4 h-5">
        <span className="w-1 h-3.5 bg-[#FF1E82] rounded-full animate-bar-1 origin-bottom" />
        <span className="w-1 h-5 bg-[#7928CA] rounded-full animate-bar-2 origin-bottom" />
        <span className="w-1 h-4 bg-[#FFD200] rounded-full animate-bar-3 origin-bottom" />
        <span className="w-1 h-5 bg-[#FF6600] rounded-full animate-bar-4 origin-bottom" />
        <span className="w-1 h-3 bg-[#00B4D8] rounded-full animate-bar-5 origin-bottom" />
      </div>
    </div>
  );
}
