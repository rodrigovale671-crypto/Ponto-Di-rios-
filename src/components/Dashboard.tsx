import React, { useMemo } from 'react';
import { 
  format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Users, CheckCircle2, BarChart3, TrendingUp, Wallet, Calendar as CalendarIcon, X
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Card, Button, cn } from './UI';
import { Employee, AttendanceRecord } from '../types';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  getSummary: (id: string, monthYear?: string) => any;
  setActiveView: (view: 'dashboard' | 'team' | 'calendar') => void;
}

export const Dashboard = ({ 
  employees, 
  attendance, 
  currentMonth, 
  setCurrentMonth, 
  getSummary,
  setActiveView
}: DashboardProps) => {
  const monthStr = format(currentMonth, 'yyyy-MM');
  
  const stats = useMemo(() => {
    const totalFinanceiro = employees.reduce((acc, emp) => {
      const s = getSummary(emp.id, monthStr);
      const rate = emp.dailyRate || 0;
      return acc + (s.diarias * rate) + (s.meias * (rate / 2));
    }, 0);

    const presencasNoMes = attendance.filter(a => a.type === 'D' && a.monthYear === monthStr).length;
    const meiasNoMes = attendance.filter(a => a.type === 'M' && a.monthYear === monthStr).length;
    const faltasNoMes = attendance.filter(a => a.type === 'F' && a.monthYear === monthStr).length;

    return {
      totalFinanceiro,
      presencasNoMes,
      meiasNoMes,
      faltasNoMes,
      totalEquipe: employees.length
    };
  }, [employees, attendance, monthStr, getSummary]);

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayRecords = attendance.filter(a => a.date === dayStr);
      return {
        name: format(day, 'dd'),
        presencas: dayRecords.filter(r => r.type === 'D').length,
        meias: dayRecords.filter(r => r.type === 'M').length,
      };
    });
  }, [attendance, currentMonth]);

  const distributionData = useMemo(() => {
    return [
      { name: 'Diárias', value: stats.presencasNoMes, color: '#34d399' }, // emerald-400
      { name: 'Meias', value: stats.meiasNoMes, color: '#60a5fa' }, // blue-400
      { name: 'Faltas', value: stats.faltasNoMes, color: '#fb7185' }, // rose-400
    ].filter(d => d.value > 0);
  }, [stats]);

  const COLORS = ['#34d399', '#60a5fa', '#fb7185'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-100">Visão Geral</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Acompanhe o desempenho da sua equipe</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-10 w-10 p-0 rounded-xl">
            <ChevronLeft size={20} />
          </Button>
          <div className="px-4 py-2 min-w-[140px] text-center">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
          </div>
          <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-10 w-10 p-0 rounded-xl">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        {[
          { label: 'Equipe', value: stats.totalEquipe, icon: Users, color: 'from-blue-400 to-blue-600' },
          { label: 'Presenças', value: stats.presencasNoMes, icon: CheckCircle2, color: 'from-emerald-400 to-emerald-600' },
          { label: 'Meias', value: stats.meiasNoMes, icon: TrendingUp, color: 'from-amber-400 to-amber-600' },
          { label: 'Faltas', value: stats.faltasNoMes, icon: X, color: 'from-rose-400 to-rose-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <div className={cn(
              "w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr",
              stat.color
            )}>
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-2 border-white dark:border-slate-950">
                <stat.icon size={24} className="text-slate-900 dark:text-slate-100" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</p>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-100 dark:to-slate-200 dark:text-slate-900 border-none shadow-2xl shadow-slate-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={20} className="text-emerald-400 dark:text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Financeiro</span>
          </div>
          <TrendingUp size={20} className="text-emerald-400 dark:text-emerald-600" />
        </div>
        <h3 className="text-4xl font-black tracking-tighter">
          R$ {stats.totalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
        <p className="text-xs mt-2 opacity-60 font-medium">Previsão de pagamentos para {format(currentMonth, 'MMMM', { locale: ptBR })}</p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="secondary" 
          onClick={() => setActiveView('team')}
          className="h-16 gap-3 text-sm font-bold uppercase tracking-widest bg-white dark:bg-slate-900 border-dashed border-2"
        >
          <Users size={20} />
          Gerenciar Equipe
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setActiveView('calendar')}
          className="h-16 gap-3 text-sm font-bold uppercase tracking-widest bg-white dark:bg-slate-900 border-dashed border-2"
        >
          <CalendarIcon size={20} />
          Lançar Pontos
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => window.print()}
          className="h-16 gap-3 text-sm font-bold uppercase tracking-widest bg-white dark:bg-slate-900 border-dashed border-2"
        >
          <TrendingUp size={20} />
          Relatório Completo
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 space-y-6 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" />
                Fluxo de Presenças
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Diárias</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Meias</div>
              </div>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              {stats.presencasNoMes + stats.meiasNoMes > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="presencas" fill="#34d399" radius={[4, 4, 0, 0]} barSize={8} />
                    <Bar dataKey="meias" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-700">
                  <BarChart3 size={48} strokeWidth={1} />
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 space-y-6 h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Distribuição
            </h3>
            <div className="h-[200px] w-full relative">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                  <BarChart3 size={40} strokeWidth={1} />
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Sem dados no mês</span>
                </div>
              )}
              {distributionData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.presencasNoMes + stats.meiasNoMes + stats.faltasNoMes}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Resumo por Funcionário</h3>
        </div>
        <Card className="overflow-hidden border-none shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white dark:bg-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Funcionário</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Diárias</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Meias</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Faltas</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Total a Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Users size={40} strokeWidth={1} />
                        <p className="text-sm font-medium">Nenhum funcionário cadastrado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {employees.map(emp => {
                      const summary = getSummary(emp.id, monthStr);
                      const rate = emp.dailyRate || 0;
                      const total = (summary.diarias * rate) + (summary.meias * (rate / 2));
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{emp.name}</div>
                                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">R$ {rate.toFixed(2)} / dia</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{summary.diarias}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{summary.meias}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{summary.faltas}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 dark:bg-slate-900/50 font-black">
                      <td className="px-6 py-4 text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Geral</td>
                      <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400">{stats.presencasNoMes}</td>
                      <td className="px-6 py-4 text-center text-blue-600 dark:text-blue-400">{stats.meiasNoMes}</td>
                      <td className="px-6 py-4 text-center text-rose-600 dark:text-rose-400">{stats.faltasNoMes}</td>
                      <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-100">
                        R$ {stats.totalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
