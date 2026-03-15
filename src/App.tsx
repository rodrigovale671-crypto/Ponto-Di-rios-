import React, { useState, useEffect, useMemo } from 'react';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, query, where, onSnapshot, addDoc, deleteDoc, doc, setDoc,
  OperationType, handleFirestoreError, User 
} from './firebase';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Calendar as CalendarIcon, LogIn, Menu, Settings, X, CreditCard, Download, Upload, Sun, Moon, Fingerprint, ShieldCheck, LogOut, Lock, ChevronLeft
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { ErrorBoundary } from './components/ErrorBoundary';
import { Button, Card, cn } from './components/UI';
import { Toast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { LockScreen } from './components/LockScreen';
import { AttendanceModal } from './components/AttendanceModal';
import { Dashboard } from './components/Dashboard';
import { Team } from './components/Team';
import { CalendarView } from './components/CalendarView';
import { ConfirmModal } from './components/ConfirmModal';
import { BottomNav } from './components/BottomNav';
import { Employee, UserConfig, AttendanceRecord } from './types';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoadingTimeout(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [loading]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [newPin, setNewPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'team' | 'calendar'>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  useEffect(() => {
    (window as any).openSettings = () => setIsSettingsOpen(true);
  }, []);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [attendanceModal, setAttendanceModal] = useState<{
    isOpen: boolean;
    date: Date | null;
    employeeId: string | null;
    currentType: 'D' | 'M' | 'F' | null;
  }>({ isOpen: false, date: null, employeeId: null, currentType: null });

  // Form states
  const [empForm, setEmpForm] = useState({
    name: '', role: '', dailyRate: '', pix: '', bankName: '', bankAgency: '', bankAccount: ''
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
        setIsLocked(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'userConfigs', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.data() as UserConfig;
        setUserConfig(config);
        if (!config.pin) setIsLocked(false);
      } else {
        setUserConfig({ ownerId: user.uid });
        setIsLocked(false);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading user config", err);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || isLocked) return;
    const employeesQuery = query(collection(db, 'employees'), where('ownerId', '==', user.uid));
    const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'employees'));

    const monthStr = format(currentMonth, 'yyyy-MM');
    const attendanceQuery = query(collection(db, 'attendance'), where('ownerId', '==', user.uid), where('monthYear', '==', monthStr));
    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

    return () => { unsubscribeEmployees(); unsubscribeAttendance(); };
  }, [user, currentMonth, isLocked]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const handleLogin = async () => { 
    setLoginLoading(true);
    try { 
      await signInWithPopup(auth, googleProvider); 
    } catch (err: any) { 
      console.error('Login error', err);
      let msg = 'Erro ao entrar com Google.';
      if (err.code === 'auth/popup-blocked') msg = 'O popup foi bloqueado pelo navegador.';
      if (err.code === 'auth/cancelled-popup-request') msg = 'A requisição foi cancelada.';
      showToast(msg, 'error');
    } finally {
      setLoginLoading(false);
    }
  };
  const handleLogout = () => signOut(auth);

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !empForm.name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const rate = parseFloat(empForm.dailyRate.replace(',', '.'));
      await addDoc(collection(db, 'employees'), {
        name: empForm.name.trim(), role: empForm.role.trim(), dailyRate: isNaN(rate) ? 0 : rate,
        pixKey: empForm.pix.trim(), bankName: empForm.bankName.trim(), bankAgency: empForm.bankAgency.trim(),
        bankAccount: empForm.bankAccount.trim(), ownerId: user.uid, createdAt: new Date().toISOString()
      });
      showToast('Funcionário cadastrado!');
      setEmpForm({ name: '', role: '', dailyRate: '', pix: '', bankName: '', bankAgency: '', bankAccount: '' });
      setIsAddEmployeeOpen(false);
    } catch (err) { showToast('Erro ao cadastrar', 'error'); handleFirestoreError(err, OperationType.CREATE, 'employees'); }
    finally { setIsSubmitting(false); }
  };

  const openEditModal = () => {
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;
    setEmpForm({
      name: emp.name, role: emp.role || '', dailyRate: emp.dailyRate?.toString() || '',
      pix: emp.pixKey || '', bankName: emp.bankName || '', bankAgency: emp.bankAgency || '', bankAccount: emp.bankAccount || ''
    });
    setIsEditEmployeeOpen(true);
  };

  const updateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEmployeeId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const rate = parseFloat(empForm.dailyRate.replace(',', '.'));
      await setDoc(doc(db, 'employees', selectedEmployeeId), {
        name: empForm.name.trim(), role: empForm.role.trim(), dailyRate: isNaN(rate) ? 0 : rate,
        pixKey: empForm.pix.trim(), bankName: empForm.bankName.trim(), bankAgency: empForm.bankAgency.trim(),
        bankAccount: empForm.bankAccount.trim(), ownerId: user.uid,
        createdAt: employees.find(e => e.id === selectedEmployeeId)?.createdAt || new Date().toISOString()
      }, { merge: true });
      showToast('Dados atualizados!');
      setIsEditEmployeeOpen(false);
    } catch (err) { showToast('Erro ao atualizar', 'error'); handleFirestoreError(err, OperationType.UPDATE, 'employees'); }
    finally { setIsSubmitting(false); }
  };

  const deleteEmployee = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Funcionário',
      message: 'Tem certeza que deseja excluir este funcionário? Todos os registros de ponto associados serão perdidos.',
      onConfirm: async () => {
        try { 
          await deleteDoc(doc(db, 'employees', id)); 
          if (selectedEmployeeId === id) setSelectedEmployeeId(null); 
          showToast('Funcionário excluído com sucesso', 'success');
        } catch (err) { 
          handleFirestoreError(err, OperationType.DELETE, 'employees'); 
          showToast('Erro ao excluir funcionário', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const savePin = async () => {
    if (!user || !newPin.match(/^\d{4,6}$/)) return alert("PIN inválido.");
    try { await setDoc(doc(db, 'userConfigs', user.uid), { pin: newPin, ownerId: user.uid }, { merge: true }); setIsSettingPin(false); setNewPin(''); }
    catch (err) { console.error(err); }
  };

  const removePin = async () => {
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: 'Remover PIN',
      message: 'Tem certeza que deseja remover o PIN de segurança? Seu dashboard ficará acessível imediatamente após o login.',
      onConfirm: async () => {
        try { 
          await setDoc(doc(db, 'userConfigs', user.uid), { pin: null, ownerId: user.uid }, { merge: true }); 
          showToast('PIN removido com sucesso', 'success');
        } catch (err) { 
          console.error(err); 
          showToast('Erro ao remover PIN', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getSummary = (employeeId: string, monthYear?: string) => {
    const records = attendance.filter(a => 
      a.employeeId === employeeId && (!monthYear || a.monthYear === monthYear)
    );
    return {
      diarias: records.filter(r => r.type === 'D').length,
      meias: records.filter(r => r.type === 'M').length,
      faltas: records.filter(r => r.type === 'F').length,
      total: records.filter(r => r.type === 'D').length + (records.filter(r => r.type === 'M').length * 0.5)
    };
  };

  const generatePDF = () => {
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;
    const monthStr = format(currentMonth, 'yyyy-MM');
    const summary = getSummary(emp.id, monthStr);
    const rate = emp.dailyRate || 0;
    const total = (summary.diarias * rate) + (summary.meias * (rate / 2));
    const docPdf = new jsPDF();
    docPdf.text('Relatório de Ponto', 105, 20, { align: 'center' });
    docPdf.text(`Funcionário: ${emp.name}`, 20, 40);
    docPdf.text(`Mês: ${format(currentMonth, 'MMMM yyyy', { locale: ptBR })}`, 20, 50);
    docPdf.text(`Total a Pagar: R$ ${total.toFixed(2)}`, 20, 60);
    autoTable(docPdf, {
      startY: 70,
      head: [['Data', 'Tipo']],
      body: daysInMonth.map(d => [
        format(d, 'dd/MM/yyyy'), 
        attendance.find(a => a.employeeId === emp.id && a.date === format(d, 'yyyy-MM-dd'))?.type || '-'
      ]).filter(r => r[1] !== '-')
    });
    docPdf.save(`Ponto_${emp.name}_${monthStr}.pdf`);
  };

  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
      {loadingTimeout && (
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Isso está demorando mais que o esperado...</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>Recarregar Página</Button>
        </div>
      )}
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
      <div className="w-full max-w-md text-center space-y-8 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 bg-slate-900 dark:bg-slate-100 rounded-[2rem] flex items-center justify-center text-white dark:text-slate-900 mx-auto shadow-2xl shadow-slate-900/20">
          <CalendarIcon size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-100">PontoFácil</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão de equipe simplificada</p>
        </div>
        <Button 
          onClick={handleLogin} 
          disabled={loginLoading}
          className="w-full py-7 text-lg gap-3 rounded-2xl shadow-lg shadow-slate-900/10"
        >
          {loginLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn size={22} /> 
              <span>Entrar com Google</span>
            </>
          )}
        </Button>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Acesso seguro via Google Auth</p>
      </div>
    </div>
  );

  if (isLocked && userConfig?.pin) return <LockScreen userPin={userConfig.pin} onUnlock={() => setIsLocked(false)} />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-slate-950">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
      <AttendanceModal isOpen={attendanceModal.isOpen} onClose={() => setAttendanceModal(p => ({ ...p, isOpen: false }))} onSelect={(type) => {
        if (!user || !attendanceModal.employeeId || !attendanceModal.date) return;
        const dateStr = format(attendanceModal.date, 'yyyy-MM-dd');
        const recordId = `${attendanceModal.employeeId}_${dateStr}`;
        if (type === null) deleteDoc(doc(db, 'attendance', recordId));
        else setDoc(doc(db, 'attendance', recordId), { employeeId: attendanceModal.employeeId, date: dateStr, type, monthYear: format(attendanceModal.date, 'yyyy-MM'), ownerId: user.uid });
        setAttendanceModal(p => ({ ...p, isOpen: false }));
      }} date={attendanceModal.date || new Date()} currentType={attendanceModal.currentType} />

      <div className="hidden lg:block">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          user={user} 
          onLogout={handleLogout} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[var(--color-line)] flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-3">
            {activeView !== 'dashboard' && (
              <button 
                onClick={() => setActiveView('dashboard')} 
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-xl font-black tracking-tighter italic">
              {activeView === 'dashboard' ? 'PontoFácil' : 
               activeView === 'team' ? 'Equipe' : 'Calendário'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Settings size={22} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeView === 'dashboard' && <Dashboard employees={employees} attendance={attendance} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} getSummary={getSummary} setActiveView={setActiveView} />}
            {activeView === 'team' && <Team employees={employees} setIsAddEmployeeOpen={setIsAddEmployeeOpen} setSelectedEmployeeId={setSelectedEmployeeId} openEditModal={openEditModal} deleteEmployee={deleteEmployee} setActiveView={setActiveView} />}
            {activeView === 'calendar' && <CalendarView employees={employees} selectedEmployeeId={selectedEmployeeId} setSelectedEmployeeId={setSelectedEmployeeId} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} daysInMonth={daysInMonth} getAttendanceForDay={(id, d) => attendance.find(a => a.employeeId === id && a.date === format(d, 'yyyy-MM-dd'))?.type} toggleAttendance={(id, d, t) => setAttendanceModal({ isOpen: true, date: d, employeeId: id, currentType: t })} generatePDF={generatePDF} />}
          </div>
        </main>
      </div>

      <BottomNav 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onOpenAddEmployee={() => setIsAddEmployeeOpen(true)} 
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-0 overflow-hidden rounded-3xl border-none">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic">Perfil</h3>
                <Button variant="ghost" onClick={() => setIsSettingsOpen(false)} className="rounded-full w-10 h-10 p-0"><X size={20} /></Button>
              </div>
              
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-4 border-white dark:border-slate-950 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-3xl font-black italic text-slate-900 dark:text-slate-100">{user?.displayName?.charAt(0)}</div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">{user?.displayName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                      {darkMode ? <Moon size={16} className="text-indigo-500" /> : <Sun size={16} className="text-amber-500" />}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Modo Escuro</span>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)} 
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors", 
                      darkMode ? "bg-indigo-600" : "bg-slate-300"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform", 
                      darkMode ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                      <Lock size={16} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Segurança PIN</span>
                  </div>
                  
                  {userConfig?.pin ? (
                    <Button variant="ghost" onClick={removePin} className="w-full h-11 rounded-xl text-rose-600 font-bold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100">
                      Desativar PIN
                    </Button>
                  ) : (
                    isSettingPin ? (
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          value={newPin} 
                          onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} 
                          className="pro-input text-center h-11 bg-white dark:bg-slate-800 border-none rounded-xl font-black tracking-[0.5em]" 
                          maxLength={4} 
                          placeholder="0000"
                        />
                        <Button onClick={savePin} className="h-11 px-6 rounded-xl">Salvar</Button>
                      </div>
                    ) : (
                      <Button variant="secondary" onClick={() => setIsSettingPin(true)} className="w-full h-11 rounded-xl font-bold">
                        Configurar PIN
                      </Button>
                    )
                  )}
                </div>

                <Button variant="ghost" onClick={() => signOut(auth)} className="w-full h-11 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10">
                  <LogOut size={18} className="mr-2" /> Sair da Conta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {(isAddEmployeeOpen || isEditEmployeeOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-0 overflow-hidden rounded-3xl border-none">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic">
                  {isAddEmployeeOpen ? 'Novo Colaborador' : 'Editar Perfil'}
                </h3>
                <Button variant="ghost" onClick={() => { setIsAddEmployeeOpen(false); setIsEditEmployeeOpen(false); }} className="rounded-full w-10 h-10 p-0">
                  <X size={20} />
                </Button>
              </div>
              
              <form onSubmit={isAddEmployeeOpen ? addEmployee : updateEmployee} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Informações Básicas</label>
                  <input type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="pro-input h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Nome Completo" required />
                  <input type="text" value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="pro-input h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Cargo / Função" />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input type="number" step="0.01" value={empForm.dailyRate} onChange={e => setEmpForm({...empForm, dailyRate: e.target.value})} className="pro-input h-12 pl-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Valor da Diária" />
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Dados Bancários / PIX</label>
                  <input type="text" value={empForm.pix} onChange={e => setEmpForm({...empForm, pix: e.target.value})} className="pro-input h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Chave PIX" />
                  <input type="text" value={empForm.bankName} onChange={e => setEmpForm({...empForm, bankName: e.target.value})} className="pro-input h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Nome do Banco" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={empForm.bankAgency} onChange={e => setEmpForm({...empForm, bankAgency: e.target.value})} className="pro-input h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Agência" />
                    <input type="text" value={empForm.bankAccount} onChange={e => setEmpForm({...empForm, bankAccount: e.target.value})} className="pro-input h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" placeholder="Conta" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 h-12 rounded-xl font-black italic tracking-tight text-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Processando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><AppContent /></ErrorBoundary>; }
