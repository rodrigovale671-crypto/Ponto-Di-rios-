import React from 'react';
import { 
  format, subMonths, addMonths, getDay, isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, FileText, Calendar as CalendarIcon 
} from 'lucide-react';
import { Card, Button, cn } from './UI';
import { Employee } from '../types';

interface CalendarViewProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  daysInMonth: Date[];
  getAttendanceForDay: (id: string, date: Date) => any;
  toggleAttendance: (id: string, date: Date, type: any) => void;
  generatePDF: () => void;
}

export const CalendarView = ({ 
  employees, 
  selectedEmployeeId, 
  setSelectedEmployeeId, 
  currentMonth, 
  setCurrentMonth,
  daysInMonth,
  getAttendanceForDay,
  toggleAttendance,
  generatePDF
}: CalendarViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic">Calendário</h3>
          {selectedEmployeeId && (
            <Button variant="ghost" onClick={generatePDF} className="rounded-full w-10 h-10 p-0 text-slate-600 dark:text-slate-400">
              <FileText size={20} />
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={selectedEmployeeId || ''} 
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="pro-input flex-1 h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold text-sm"
          >
            <option value="">Selecionar Colaborador</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl p-1">
            <Button variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-9 w-9 p-0 rounded-lg">
              <ChevronLeft size={18} />
            </Button>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 capitalize px-4 min-w-[100px] text-center">
              {format(currentMonth, 'MMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-9 w-9 p-0 rounded-lg">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {selectedEmployeeId ? (
        <div className="bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-900 shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-900">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="py-3 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-900">
            {Array.from({ length: getDay(daysInMonth[0]) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white dark:bg-slate-950 h-20 sm:h-28 opacity-40" />
            ))}

            {daysInMonth.map(day => {
              const attendanceType = getAttendanceForDay(selectedEmployeeId, day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => toggleAttendance(selectedEmployeeId, day, attendanceType)}
                  className={cn(
                    "bg-white dark:bg-slate-950 h-20 sm:h-28 p-2 flex flex-col items-center justify-between transition-all relative group",
                    isToday(day) && "after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:bg-rose-500 after:rounded-full"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-black",
                    isToday(day) ? "text-slate-900 dark:text-slate-100" : "text-slate-300 dark:text-slate-700"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex flex-col items-center gap-1">
                    {attendanceType === 'D' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                    )}
                    {attendanceType === 'M' && (
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                    {attendanceType === 'F' && (
                      <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                      </div>
                    )}
                    
                    <span className="text-[7px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-600">
                      {attendanceType === 'D' && 'Diária'}
                      {attendanceType === 'M' && 'Meia'}
                      {attendanceType === 'F' && 'Falta'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800">
            <CalendarIcon size={40} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Selecione um colaborador</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[200px] mx-auto">Escolha alguém para gerenciar o histórico de ponto.</p>
          </div>
        </div>
      )}
    </div>
  );
};
