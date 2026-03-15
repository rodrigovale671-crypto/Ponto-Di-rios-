import React from 'react';
import { Plus, UserCircle, Pencil, Trash2 } from 'lucide-react';
import { Card, Button } from './UI';
import { Employee } from '../types';

interface TeamProps {
  employees: Employee[];
  setIsAddEmployeeOpen: (open: boolean) => void;
  setSelectedEmployeeId: (id: string | null) => void;
  openEditModal: () => void;
  deleteEmployee: (id: string) => void;
  setActiveView: (view: any) => void;
}

export const Team = ({ 
  employees, 
  setIsAddEmployeeOpen, 
  setSelectedEmployeeId, 
  openEditModal, 
  deleteEmployee,
  setActiveView
}: TeamProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic">Equipe</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gerencie seus colaboradores</p>
        </div>
        <Button onClick={() => setIsAddEmployeeOpen(true)} className="rounded-full w-10 h-10 p-0">
          <Plus size={24} />
        </Button>
      </div>

      <div className="space-y-1">
        {employees.map(emp => (
          <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-2 border-white dark:border-slate-950 text-slate-900 dark:text-slate-100 font-black text-xl italic">
                  {emp.name.charAt(0)}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{emp.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{emp.role || 'Colaborador'}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">R$ {emp.dailyRate?.toFixed(2) || '0.00'} / dia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedEmployeeId(emp.id);
                  setActiveView('calendar');
                }}
                className="h-9 px-4 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800"
              >
                Ver Ponto
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedEmployeeId(emp.id);
                  openEditModal();
                }} 
                className="p-2 h-9 w-9 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <Pencil size={18} />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => deleteEmployee(emp.id)} 
                className="p-2 h-9 w-9 rounded-full text-slate-400 hover:text-rose-600"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <UserCircle size={48} />
            </div>
            <p className="text-slate-500 font-medium">Nenhum colaborador encontrado</p>
            <Button onClick={() => setIsAddEmployeeOpen(true)} variant="secondary">Adicionar Primeiro</Button>
          </div>
        )}
      </div>
    </div>
  );
};
