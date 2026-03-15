import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn, Button } from './UI';

export const AttendanceModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  date, 
  currentType 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (type: 'D' | 'M' | 'F' | null) => void; 
  date: Date;
  currentType: 'D' | 'M' | 'F' | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-900 animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Registrar Presença</p>
        </div>
        
        <div className="px-6 pb-8 space-y-3">
          <button
            onClick={() => onSelect('D')}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
              currentType === 'D' 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", currentType === 'D' ? "bg-white/20" : "bg-emerald-500 text-white")}>
                <CheckCircle2 size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Diária</p>
                <p className={cn("text-[10px] font-medium", currentType === 'D' ? "text-white/80" : "text-slate-500")}>Dia completo</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('M')}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
              currentType === 'M' 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                : "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", currentType === 'M' ? "bg-white/20" : "bg-blue-500 text-white")}>
                <Clock size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Meia Diária</p>
                <p className={cn("text-[10px] font-medium", currentType === 'M' ? "text-white/80" : "text-slate-500")}>Meio período</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('F')}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
              currentType === 'F' 
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                : "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", currentType === 'F' ? "bg-white/20" : "bg-rose-500 text-white")}>
                <XCircle size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">Falta</p>
                <p className={cn("text-[10px] font-medium", currentType === 'F' ? "text-white/80" : "text-slate-500")}>Ausência</p>
              </div>
            </div>
          </button>

          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={() => onSelect(null)}
              className="w-full py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
            >
              Limpar Registro
            </button>
            <Button onClick={onClose} variant="ghost" className="w-full h-12 rounded-2xl font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-900">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
