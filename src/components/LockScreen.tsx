import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { cn } from './UI';
import { signOut, auth } from '../firebase';

export const LockScreen = ({ onUnlock, userPin }: { onUnlock: () => void; userPin: string }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === userPin.length) {
        if (newPin === userPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-100 shadow-xl border border-slate-700">
            <Lock size={32} className={cn(error && "text-rose-500 animate-shake")} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Bloqueio Digital</h2>
          <p className="text-slate-300 text-sm">Insira seu PIN para acessar</p>
        </div>

        <div className="flex justify-center gap-4">
          {Array.from({ length: userPin.length }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                pin.length > i ? "bg-white border-white scale-110" : "border-slate-700",
                error && "border-rose-500 bg-rose-500"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-16 h-16 mx-auto rounded-full bg-slate-800 text-white text-2xl font-bold hover:bg-slate-700 active:scale-90 transition-all border border-slate-700/50"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 mx-auto rounded-full bg-slate-800 text-white text-2xl font-bold hover:bg-slate-700 active:scale-90 transition-all border border-slate-700/50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => signOut(auth)}
            className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};
