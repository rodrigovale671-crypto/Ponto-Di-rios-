import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut 
} from 'lucide-react';
import { cn } from './UI';
import { User } from '../firebase';

export const Sidebar = ({ 
  activeView, 
  setActiveView, 
  user, 
  onLogout, 
  onOpenSettings 
}: { 
  activeView: string; 
  setActiveView: (view: any) => void; 
  user: User; 
  onLogout: () => void;
  onOpenSettings: () => void;
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'settings', label: 'Configurações', icon: Settings, action: onOpenSettings },
  ];

  return (
    <div className="w-20 xl:w-64 h-full flex flex-col bg-white dark:bg-slate-950 border-r border-[var(--color-line)] transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Calendar className="text-white w-5 h-5" />
        </div>
        <span className="hidden xl:block font-black text-slate-900 dark:text-slate-100 text-xl tracking-tighter italic">PontoFácil</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : setActiveView(item.id)}
            className={cn(
              "sidebar-item w-full justify-center xl:justify-start group",
              activeView === item.id 
                ? "text-slate-900 dark:text-slate-100" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <item.icon size={26} strokeWidth={activeView === item.id ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
            <span className={cn(
              "hidden xl:block font-bold tracking-tight text-lg",
              activeView === item.id ? "font-black" : "font-medium"
            )}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-line)]">
        <button 
          onClick={onLogout}
          className="sidebar-item w-full justify-center xl:justify-start text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <LogOut size={26} />
          <span className="hidden xl:block font-bold tracking-tight">Sair</span>
        </button>
      </div>
    </div>
  );
};
