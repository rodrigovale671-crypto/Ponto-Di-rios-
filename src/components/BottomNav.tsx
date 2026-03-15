import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, Settings, PlusSquare
} from 'lucide-react';
import { cn } from './UI';

export const BottomNav = ({ 
  activeView, 
  setActiveView,
  onOpenAddEmployee
}: { 
  activeView: string; 
  setActiveView: (view: any) => void;
  onOpenAddEmployee: () => void;
}) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'calendar', icon: Calendar, label: 'Ponto' },
    { id: 'add', icon: PlusSquare, label: 'Novo', action: onOpenAddEmployee },
    { id: 'team', icon: Users, label: 'Equipe' },
    { id: 'settings', icon: Settings, label: 'Perfil', action: () => (window as any).openSettings() },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-[var(--color-line)] flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => item.action ? item.action() : setActiveView(item.id)}
          className={cn(
            "insta-nav-item flex-1 h-full",
            activeView === item.id 
              ? "text-slate-900 dark:text-slate-100" 
              : "text-slate-400 dark:text-slate-500"
          )}
        >
          <item.icon size={24} strokeWidth={activeView === item.id ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );
};
