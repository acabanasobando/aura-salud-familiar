/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext.tsx';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight,
  Syringe, 
  Stethoscope, 
  History, 
  FlaskConical, 
  TrendingUp, 
  Pill,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  Lock,
  Cloud,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Trash2,
  Edit2,
  HeartPulse,
  Building2,
  Download,
  MessageCircle,
  Share2,
  Moon,
  Sun
} from 'lucide-react';

// --- Types ---

type Screen = 
  | 'login' 
  | 'dashboard' 
  | 'profiles' 
  | 'vaccination' 
  | 'consultations' 
  | 'studies' 
  | 'reports' 
  | 'medical-directory'
  | 'add-medical-entity'
  | 'add-family' 
  | 'register-vaccine' 
  | 'register-consultation' 
  | 'upload-study';

interface Profile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'Hombre' | 'Mujer';
  bloodType?: string;
  nss: string;
  status: string;
  type?: string;
  img?: string;
  color?: string;
  icon?: any;
  active?: boolean;
  alert?: boolean;
  insurance?: {
    insurer: string;
    policyNumber: string;
    validity: string;
    policyImg?: string;
  };
}

interface Vaccine {
  id: string;
  profileId: string;
  name: string;
  date: string;
  dose: string;
  status: 'Aplicada' | 'Pendiente';
  location?: string;
  brand?: string;
}

interface Study {
  id: string;
  profileId: string;
  name: string;
  date: string;
  lab: string;
  category: 'Laboratorio' | 'Imagen';
  type: 'pdf' | 'img';
  cost?: string;
}

interface Consultation {
  id: string;
  profileId: string;
  type: 'Consulta' | 'Hospitalización';
  doctor: string;
  specialty: string;
  hospital?: string;
  date: string;
  time: string;
  status: 'Confirmada' | 'Completada' | 'Cancelada';
  reason: string;
  cost?: string;
  prescriptionImg?: string;
  reminder24h?: boolean;
}

interface MedicalEntity {
  id: string;
  type: 'Médico' | 'Laboratorio' | 'Hospital';
  name: string;
  specialty?: string;
  phone: string;
  address?: string;
  attachment?: string;
}

const LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCQbMLGC_QU-pZXp00XkG3pTJfXfdMDolnSHZatjHl5HvvBH_tsf8Bb5M-_fEvXNd2OPkrL7FmBfHVqlLtNlDXVeXbrxszt82VjQb3uodjSH22cP7IBxWtvbTSFhvL02vduqd586XEzttFYNFh3SiBQT2phQ6lrjdqhwuUzQmRi3k3tzuIuE1UPHbSDE0A5R3_Lo9jwJopKjbyUjCuwL27aUlAZJ4UA5-HIJfisoPvrKzBG4vQGJ-ZN66jBgBe3bt8xAt-HywsFldNG";

// --- Helper Functions ---

const calculateAge = (birthDateStr: string): number | null => {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const handleDownloadFile = (fileName: string, content: string = "Contenido del archivo de Aura Salud Familiar") => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// --- Components ---

const BottomNav = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Inicio' },
    { id: 'profiles', icon: Users, label: 'Perfiles' },
    { id: 'vaccination', icon: Syringe, label: 'Vacunas' },
    { id: 'consultations', icon: Stethoscope, label: 'Consultas' },
    { id: 'studies', icon: FlaskConical, label: 'Estudios' },
    { id: 'reports', icon: FileText, label: 'Reportes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t-2 border-slate-100 dark:border-zinc-900 h-20 px-4 flex justify-between items-center z-50 transition-colors duration-300">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button 
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : ''}`}>
              <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const Header = ({ title, onBack, rightElement }: { title: string, onBack?: () => void, rightElement?: ReactNode }) => (
  <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-900 px-4 h-16 flex items-center justify-between transition-colors duration-300">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">{title}</h1>
    </div>
    {rightElement}
  </header>
);

// --- Screens ---

const LoginScreen = () => {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('token');
    const resetEmail = params.get('email');
    if (resetToken && resetEmail) {
      setToken(resetToken);
      setEmail(resetEmail);
      setMode('reset');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password);
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setMessage('Se ha enviado un código de recuperación a tu correo.');
        setMode('reset');
      } else if (mode === 'reset') {
        await resetPassword(email, token, newPassword);
        setMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] dark:bg-black relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-accent-blue/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-sm flex flex-col items-center relative z-10">
        <h1 className="text-5xl font-black mb-1 tracking-tighter text-slate-900 dark:text-white">Aura</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-12 font-medium tracking-wide">Salud familiar simplificada</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 text-center uppercase tracking-widest">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta'}
              {mode === 'forgot' && 'Recuperar Clave'}
              {mode === 'reset' && 'Nueva Clave'}
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Correo electrónico</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com" 
                className="w-full h-16 px-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg dark:text-white"
              />
            </div>

            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Contraseña</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-16 px-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg dark:text-white"
                  />
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
                {mode === 'register' && (
                  <p className="text-[10px] text-slate-400 font-bold px-1">
                    Mínimo 8 caracteres, letras, números y símbolos.
                  </p>
                )}
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Código de recuperación</label>
                  <input 
                    type="text" 
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ABC12345" 
                    className="w-full h-16 px-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg uppercase dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-16 px-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg dark:text-white"
                  />
                </div>
              </>
            )}
          </div>

          {error && <p className="text-rose-500 text-xs font-bold px-1 text-center">{error}</p>}
          {message && <p className="text-emerald-500 text-xs font-bold px-1 text-center">{message}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black text-lg h-16 rounded-2xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (
              <>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Registrarme'}
                {mode === 'forgot' && 'Enviar Código'}
                {mode === 'reset' && 'Cambiar Clave'}
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="flex flex-col gap-3 pt-4">
            {mode === 'login' && (
              <>
                <button 
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
                <button 
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-slate-400 font-bold text-sm hover:text-slate-600"
                >
                  Olvidé mi contraseña
                </button>
              </>
            )}
            {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
              <button 
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-400 font-bold text-sm hover:text-slate-600"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardScreen = ({ 
  setScreen, 
  medicalEntities,
  onSaveAll,
  showSaveToast,
  onLogout,
  darkMode,
  setDarkMode
}: { 
  setScreen: (s: Screen) => void,
  medicalEntities: MedicalEntity[],
  onSaveAll: () => void,
  showSaveToast: boolean,
  onLogout: () => void,
  darkMode: boolean,
  setDarkMode: (d: boolean) => void
}) => (
  <div className="pb-24">
    <div className="fixed inset-0 aura-gradient opacity-40 pointer-events-none" />
    
    <AnimatePresence>
      {showSaveToast && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none"
        >
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <CheckCircle2 size={20} />
            <span className="font-black text-xs uppercase tracking-widest">Cambios guardados en dispositivo</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <header className="relative pt-10 sm:pt-12 px-4 sm:px-6 pb-8 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tighter">Aura</h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-primary/10 flex items-center justify-center text-primary border-2 border-primary/5 dark:border-slate-700 active:scale-90 transition-all"
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
        >
          {darkMode ? <Sun size={20} className="sm:w-6 sm:h-6" /> : <Moon size={20} className="sm:w-6 sm:h-6" />}
        </button>
        {/* 
        <button 
          onClick={onLogout}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-rose-500/10 flex items-center justify-center text-rose-500 border-2 border-rose-500/5 dark:border-slate-700 active:scale-90 transition-all"
          title="Cerrar Sesión"
        >
          <LogOut size={20} className="sm:w-6 sm:h-6" />
        </button>
        */}
        <button 
          onClick={onSaveAll}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-primary/10 flex items-center justify-center text-primary border-2 border-primary/5 dark:border-slate-700 active:scale-90 transition-all"
          title="Guardar todo en dispositivo"
        >
          <Cloud size={20} className="sm:w-6 sm:h-6" />
        </button>
        <div className="flex -space-x-2 sm:-space-x-3">
          <img src="https://picsum.photos/seed/dad/100/100" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-white dark:border-slate-800 object-cover shadow-lg" alt="Dad" />
          <img src="https://picsum.photos/seed/mom/100/100" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-white dark:border-slate-800 object-cover shadow-lg" alt="Mom" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-white dark:border-slate-800 bg-primary text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg">+2</div>
        </div>
      </div>
    </header>

    <main className="px-4 sm:px-6 space-y-6 sm:space-y-8 relative">
      <section className="space-y-4">
        <div className="section-border">
          <h2 className="text-xl font-bold text-slate-800">Accesos Directos</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {/* 1. Perfiles de Usuario */}
          <div 
            onClick={() => setScreen('profiles')}
            className="highlight-card p-6 flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-emerald-500 flex items-center justify-center rounded-[1.5rem] text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">Perfiles de Usuario</h3>
              <p className="text-sm text-slate-500">Administrar miembros de la familia</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </div>

          {/* 2. Consulta */}
          <div 
            onClick={() => setScreen('consultations')}
            className="highlight-card p-6 flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-[1.5rem] text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Stethoscope size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Consultas</h3>
              <p className="text-sm text-slate-500">Historial y próximas citas</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </div>

          {/* 3. Vacunación */}
          <div 
            onClick={() => setScreen('vaccination')}
            className="highlight-card p-6 flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-accent-blue flex items-center justify-center rounded-[1.5rem] text-white shadow-lg shadow-accent-blue/20 group-hover:scale-110 transition-transform">
              <Syringe size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Vacunación</h3>
              <p className="text-sm text-slate-500">Mateo • Próximo refuerzo en 12 días</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </div>

          {/* 4. Laboratorio */}
          <div 
            onClick={() => setScreen('studies')}
            className="highlight-card p-6 flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-accent-orange flex items-center justify-center rounded-[1.5rem] text-white shadow-lg shadow-accent-orange/20 group-hover:scale-110 transition-transform">
              <FlaskConical size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Laboratorio</h3>
              <p className="text-sm text-slate-500">6 resultados nuevos este mes</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </div>

          {/* 5. Directorio Médico */}
          <div 
            onClick={() => setScreen('medical-directory')}
            className="highlight-card p-6 flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-rose-500 flex items-center justify-center rounded-[1.5rem] text-white shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
              <HeartPulse size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Directorio Médico</h3>
              <p className="text-sm text-slate-500">{medicalEntities.length} contactos registrados</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <button 
      onClick={() => setScreen('reports')}
      className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-40 border-4 border-white dark:border-slate-800"
    >
      <FileText size={32} />
    </button>
  </div>
);

const ProfilesScreen = ({ 
  profiles, 
  setScreen, 
  onDelete, 
  onEdit 
}: { 
  profiles: Profile[], 
  setScreen: (s: Screen) => void,
  onDelete: (id: string) => void,
  onEdit: (p: Profile) => void
}) => (
  <div className="pb-24">
    <Header 
      title="Perfiles Familiares" 
      rightElement={
        <button onClick={() => setScreen('add-family')} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
          <Plus size={24} />
        </button>
      }
    />
    <div className="px-6 py-6">
      <div className="section-border mb-6">
        <p className="text-slate-500 text-sm font-medium">Gestiona los perfiles de tu familia</p>
      </div>
      
      <div className="space-y-6">
        {profiles.map((profile) => {
          const age = calculateAge(profile.birthDate);
          return (
            <div 
              key={profile.id}
              className="highlight-card p-5 flex items-center gap-5 cursor-pointer relative group"
            >
              <div className="relative">
                {profile.img ? (
                  <img src={profile.img} className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-slate-100 dark:border-slate-700 shadow-md" alt={profile.name} />
                ) : (
                  <div className={`w-20 h-20 rounded-[1.5rem] ${profile.color || 'bg-slate-100 dark:bg-slate-900 text-slate-400'} flex items-center justify-center shadow-md`}>
                    <Users size={36} />
                  </div>
                )}
                {profile.active && <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-slate-800">{profile.name}</h3>
                  {profile.type && <span className="text-[10px] font-black px-2 py-1 bg-primary text-white rounded-lg uppercase tracking-tighter">{profile.type}</span>}
                </div>
                <p className="text-sm font-bold text-slate-400">{age !== null ? `${age} años` : 'Edad desconocida'}</p>
                <div className={`mt-2 flex items-center text-xs font-bold ${profile.alert ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {profile.alert ? <AlertCircle size={14} className="mr-1" /> : <CheckCircle2 size={14} className="mr-1" />}
                  {profile.status}
                </div>
                <div className="flex gap-2 mt-2">
                  {profile.bloodType && (
                    <div className="flex items-center text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-1 rounded-lg w-fit">
                      <HeartPulse size={12} className="mr-1" />
                      {profile.bloodType}
                    </div>
                  )}
                  {profile.insurance?.insurer && (
                    <div className="flex items-center text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg w-fit">
                      <Shield size={12} className="mr-1" />
                      {profile.insurance.insurer}
                    </div>
                  )}
                </div>
              </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-rose-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        
        <button 
          onClick={() => setScreen('add-family')}
          className="w-full border-4 border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3 opacity-60 hover:opacity-100 hover:border-primary/40 transition-all group"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Plus size={32} />
          </div>
          <p className="text-sm font-bold text-slate-500 group-hover:text-primary transition-colors">Añadir nuevo familiar</p>
        </button>
      </div>
    </div>
  </div>
);

const VaccinationScreen = ({ 
  onBack, 
  setScreen, 
  vaccines, 
  profiles, 
  activeProfileId, 
  setActiveProfileId,
  onDelete,
  onEdit
}: { 
  onBack: () => void, 
  setScreen: (s: Screen) => void,
  vaccines: Vaccine[],
  profiles: Profile[],
  activeProfileId: string,
  setActiveProfileId: (id: string) => void,
  onDelete: (id: string) => void,
  onEdit: (v: Vaccine) => void
}) => {
  const filteredVaccines = vaccines.filter(v => v.profileId === activeProfileId);
  const appliedCount = filteredVaccines.filter(v => v.status === 'Aplicada').length;
  const pendingCount = filteredVaccines.filter(v => v.status === 'Pendiente').length;

  return (
    <div className="pb-24">
      <Header 
        title="Vacunas" 
        onBack={onBack}
        rightElement={<button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"><Bell size={24} /></button>}
      />
      <div className="px-6 py-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar">
          {profiles.map((p) => (
            <button 
              key={p.id} 
              onClick={() => setActiveProfileId(p.id)}
              className="flex-shrink-0 flex flex-col items-center gap-3"
            >
              <div className={`w-20 h-20 rounded-[1.5rem] p-1 transition-all duration-300 ${activeProfileId === p.id ? 'ring-4 ring-primary bg-white dark:bg-slate-800 shadow-xl scale-110' : 'opacity-40 grayscale'}`}>
                {p.img ? (
                  <img src={p.img} className="rounded-[1.2rem] w-full h-full object-cover" alt={p.name} />
                ) : (
                  <div className={`w-full h-full rounded-[1.2rem] ${p.color || 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
                    <Users size={32} />
                  </div>
                )}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${activeProfileId === p.id ? 'text-primary' : 'text-slate-400'}`}>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="highlight-card p-6 bg-emerald-500 border-emerald-400 shadow-emerald-100">
            <CheckCircle2 className="text-white mb-3" size={28} />
            <p className="text-4xl font-black text-white">{appliedCount}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Aplicadas</p>
          </div>
          <div className="highlight-card p-6 bg-amber-500 border-amber-400 shadow-amber-100">
            <Calendar className="text-white mb-3" size={28} />
            <p className="text-4xl font-black text-white">{pendingCount}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Pendientes</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="section-border">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Historial Cronológico</h3>
          </div>
          <div className="relative space-y-8">
            <div className="absolute left-[15px] top-4 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
            
            {filteredVaccines.length > 0 ? filteredVaccines.map((v) => (
              <div key={v.id} className="relative pl-12 group">
                <div className={`absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 shadow-md ${v.status === 'Aplicada' ? 'bg-emerald-500' : 'bg-amber-500'} z-10`} />
                <div className="highlight-card p-5 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{v.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{v.dose}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${v.status === 'Aplicada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                  
                  {(v.location || v.brand) && (
                    <div className="mb-4 space-y-1">
                      {v.location && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">📍 {v.location}</p>}
                      {v.brand && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🏷️ {v.brand}</p>}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-slate-50 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span className={`text-xs font-black ${v.status === 'Pendiente' ? 'text-amber-600 underline underline-offset-4' : 'text-slate-600'}`}>{v.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEdit(v)}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(v.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <Syringe size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Sin vacunas registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-24 left-0 right-0 px-6 pointer-events-none">
        <button 
          onClick={() => setScreen('register-vaccine')}
          className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 pointer-events-auto active:scale-95 transition-all border-4 border-white dark:border-slate-800"
        >
          <Plus size={28} strokeWidth={3} />
          REGISTRAR VACUNA
        </button>
      </div>
    </div>
  );
};

const ConsultationsScreen = ({ 
  onBack, 
  setScreen, 
  consultations, 
  profiles, 
  activeConsultationProfileId, 
  setActiveConsultationProfileId,
  onDelete,
  onEdit
}: { 
  onBack: () => void, 
  setScreen: (s: Screen) => void,
  consultations: Consultation[],
  profiles: Profile[],
  activeConsultationProfileId: string,
  setActiveConsultationProfileId: (id: string) => void,
  onDelete: (id: string) => void,
  onEdit: (c: Consultation) => void
}) => {
  const filteredConsultations = consultations.filter(c => c.profileId === activeConsultationProfileId);

  return (
    <div className="pb-24">
      <Header title="Consultas Médicas" onBack={onBack} />
      <div className="px-6 py-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar">
          {profiles.map((p) => (
            <button 
              key={p.id} 
              onClick={() => setActiveConsultationProfileId(p.id)}
              className="flex-shrink-0 flex flex-col items-center gap-3"
            >
              <div className={`w-20 h-20 rounded-[1.5rem] p-1 transition-all duration-300 ${activeConsultationProfileId === p.id ? 'ring-4 ring-primary bg-white dark:bg-slate-800 shadow-xl scale-110' : 'opacity-40 grayscale'}`}>
                {p.img ? (
                  <img src={p.img} className="rounded-[1.2rem] w-full h-full object-cover" alt={p.name} />
                ) : (
                  <div className={`w-full h-full rounded-[1.2rem] ${p.color || 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
                    <Users size={32} />
                  </div>
                )}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${activeConsultationProfileId === p.id ? 'text-primary' : 'text-slate-400'}`}>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <button 
            onClick={() => setScreen('register-consultation')}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Nueva Consulta
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar consulta..." 
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm text-sm font-medium focus:border-primary/40 outline-none transition-all"
            />
          </div>
          <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400">
            <Filter size={24} />
          </button>
        </div>

        <div className="relative space-y-10">
          <div className="absolute left-5 top-2 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
          
          {filteredConsultations.length > 0 ? filteredConsultations.map((c) => (
            <div key={c.id} className="flex gap-6 group">
              <div className={`w-10 h-10 rounded-full ${c.status === 'Confirmada' ? 'bg-primary' : 'bg-slate-300'} flex items-center justify-center ring-8 ring-[#F1F5F9] dark:ring-[#0F172A] z-10 shadow-md`}>
                {c.status === 'Confirmada' ? <Calendar size={18} className="text-white" /> : <CheckCircle2 size={18} className="text-white" />}
              </div>
              <div className="flex-1 highlight-card p-6 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black tracking-[0.1em] uppercase ${c.status === 'Confirmada' ? 'text-primary' : 'text-slate-500'}`}>{c.date} • {c.time}</span>
                    <h3 className="font-black text-base sm:text-lg text-slate-800 truncate mt-1">{c.doctor}</h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{c.type}</span>
                  </div>
                    <div className="flex items-center gap-1">
                      {c.reminder24h && (
                        <div className="bg-amber-500 text-white p-1.5 rounded-lg shadow-sm" title="Alerta 24h activa">
                          <Bell size={12} strokeWidth={3} />
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${c.status === 'Confirmada' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                        {c.status}
                      </span>
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2">
                  <Stethoscope size={16} className="text-primary" />
                  {c.specialty}
                </p>
                {c.hospital && (
                  <p className="text-xs font-bold text-rose-500 mb-4 flex items-center gap-2">
                    <Building2 size={14} />
                    {c.hospital}
                  </p>
                )}
                
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                  <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Motivo</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{c.reason}</p>
                </div>

                <div className="flex items-center justify-between">
                  {c.cost && <p className="text-xs font-black text-primary uppercase tracking-tighter">Costo: ${c.cost}</p>}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(c)}
                      className="p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(c.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {c.prescriptionImg && (
                  <button 
                    onClick={() => handleDownloadFile(`receta_${c.id}.pdf`)}
                    className="mt-4 w-full p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between group hover:bg-primary/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Receta adjunta</span>
                    </div>
                    <Download size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-10 opacity-40">
              <Stethoscope size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Sin consultas registradas</p>
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={() => setScreen('register-consultation')}
        className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center z-40 border-4 border-white dark:border-slate-800 active:scale-95 transition-all hover:scale-110"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

const RegisterConsultationScreen = ({ 
  onBack, 
  onSave, 
  editingConsultation,
  medicalEntities
}: { 
  onBack: () => void, 
  onSave: (c: Partial<Consultation>) => void,
  editingConsultation?: Consultation | null,
  medicalEntities: MedicalEntity[]
}) => {
  const [formData, setFormData] = useState({
    type: editingConsultation?.type || 'Consulta' as 'Consulta' | 'Hospitalización',
    doctor: editingConsultation?.doctor || '',
    specialty: editingConsultation?.specialty || '',
    hospital: editingConsultation?.hospital || '',
    date: editingConsultation?.date || '',
    time: editingConsultation?.time || '',
    status: editingConsultation?.status || 'Confirmada' as 'Confirmada' | 'Completada' | 'Cancelada',
    reason: editingConsultation?.reason || '',
    cost: editingConsultation?.cost || '',
    prescriptionImg: editingConsultation?.prescriptionImg || '',
    reminder24h: editingConsultation?.reminder24h || false
  });

  const doctors = medicalEntities.filter(e => e.type === 'Médico');
  const hospitals = medicalEntities.filter(e => e.type === 'Hospital');

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-black transition-colors duration-300">
      <Header title={editingConsultation ? "Editar Registro" : "Nueva Consulta"} onBack={onBack} />
      <main className="px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8 pb-24">
        <div className="section-border">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter">
            {editingConsultation ? "Actualizar Datos" : "Nueva Consulta"}
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">Registra los detalles médicos.</p>
        </div>

        <div className="highlight-card p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Registro</label>
              <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                {['Consulta', 'Hospitalización'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setFormData({ ...formData, type: t as any })}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Doctor / Especialista *</label>
              <select 
                value={formData.doctor}
                onChange={(e) => {
                  const doc = doctors.find(d => d.name === e.target.value);
                  setFormData({ 
                    ...formData, 
                    doctor: e.target.value,
                    specialty: doc?.specialty || formData.specialty
                  });
                }}
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all"
              >
                <option value="">Seleccionar del inventario</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                ))}
                <option value="Otro">Otro (Ingresar manualmente)</option>
              </select>
              {formData.doctor === 'Otro' && (
                <input 
                  type="text" 
                  placeholder="Nombre del doctor"
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all mt-2"
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Especialidad</label>
              <input 
                type="text" 
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ej. Cardiología" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all" 
              />
            </div>

            {formData.type === 'Hospitalización' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hospital *</label>
                <select 
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all"
                >
                  <option value="">Seleccionar hospital</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                  <option value="Otro">Otro (Ingresar manualmente)</option>
                </select>
                {formData.hospital === 'Otro' && (
                  <input 
                    type="text" 
                    placeholder="Nombre del hospital"
                    className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all mt-2"
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha *</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                <input 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Motivo / Diagnóstico</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej. Chequeo general..." 
                className="w-full h-32 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Costo ($)</label>
              <input 
                type="text" 
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:border-primary/40 outline-none transition-all" 
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Receta / Documento</label>
              <div 
                onClick={() => handleDownloadFile('receta.pdf')}
                className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-center group cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                  <Download size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descargar o Cargar Receta</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
              <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                {['Confirmada', 'Completada', 'Cancelada'].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setFormData({ ...formData, status: s as any })}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-50 dark:border-slate-800">
              <button 
                onClick={() => setFormData({ ...formData, reminder24h: !formData.reminder24h })}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${formData.reminder24h ? 'bg-primary/10 border-2 border-primary/20' : 'bg-slate-50 dark:bg-slate-900 border-2 border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.reminder24h ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    <Bell size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Alerta 24 hrs</p>
                    <p className="text-[10px] font-bold text-slate-400">Notificar un día antes de la cita</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.reminder24h ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${formData.reminder24h ? 'left-7' : 'left-1'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 border-4 border-white active:scale-95 transition-all"
        >
          <CheckCircle2 size={24} />
          {editingConsultation ? "ACTUALIZAR REGISTRO" : "GUARDAR REGISTRO"}
        </button>
      </main>
    </div>
  );
};

const StudiesScreen = ({ 
  onBack, 
  setScreen, 
  studies, 
  profiles, 
  activeStudyProfileId, 
  setActiveStudyProfileId,
  onDelete,
  onEdit
}: { 
  onBack: () => void, 
  setScreen: (s: Screen) => void,
  studies: Study[],
  profiles: Profile[],
  activeStudyProfileId: string,
  setActiveStudyProfileId: (id: string) => void,
  onDelete: (id: string) => void,
  onEdit: (s: Study) => void
}) => {
  const [activeTab, setActiveTab] = useState<'Todos' | 'Laboratorio' | 'Imagen'>('Todos');
  const filteredStudies = studies.filter(s => {
    const matchesProfile = s.profileId === activeStudyProfileId;
    const matchesTab = activeTab === 'Todos' || s.category === activeTab;
    return matchesProfile && matchesTab;
  });

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-20 pt-10 sm:pt-12 pb-6 px-4 sm:px-6 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b-2 border-slate-100 dark:border-zinc-900 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button onClick={onBack} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-primary hover:bg-primary/10 transition-colors">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-black text-primary tracking-tighter">Aura</h1>
          <button className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-primary">
            <Bell size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="section-border mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">Estudios Lab</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar mb-4">
          {profiles.map((p) => (
            <button 
              key={p.id} 
              onClick={() => setActiveStudyProfileId(p.id)}
              className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-3"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] p-1 transition-all duration-300 ${activeStudyProfileId === p.id ? 'ring-4 ring-primary bg-white dark:bg-slate-800 shadow-xl scale-110' : 'opacity-40 grayscale'}`}>
                {p.img ? (
                  <img src={p.img} className="rounded-[1rem] w-full h-full object-cover" alt={p.name} />
                ) : (
                  <div className={`w-full h-full rounded-[1rem] ${p.color || 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${activeStudyProfileId === p.id ? 'text-primary' : 'text-slate-400'}`}>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 sm:h-5" />
          <input 
            type="text" 
            placeholder="Buscar resultados..." 
            className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 text-xs sm:text-sm font-bold dark:text-slate-200"
          />
        </div>
      </header>
      <main className="px-4 sm:px-6 py-4">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto py-4 no-scrollbar">
          {['Todos', 'Laboratorio', 'Imagen'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20 hover:text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="space-y-4 sm:space-y-6 mt-4">
          {filteredStudies.length > 0 ? filteredStudies.map((s) => (
            <div key={s.id} className="highlight-card p-4 sm:p-5 flex items-center gap-4 sm:gap-5 cursor-pointer group relative">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 transition-transform ${s.category === 'Laboratorio' ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-accent-blue text-white shadow-accent-blue/20'}`}>
                {s.category === 'Laboratorio' ? <FileText size={28} className="sm:w-8 sm:h-8" /> : <TrendingUp size={28} className="sm:w-8 sm:h-8" />}
              </div>
              <div 
                onClick={() => handleDownloadFile(`estudio_${s.id}.${s.type}`)}
                className="flex-1 min-w-0"
              >
                <h3 className="font-black text-base sm:text-lg text-slate-800 truncate">{s.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{s.date} • {s.lab} • <span className="text-primary">{s.category}</span></p>
                {s.cost && <p className="text-xs font-black text-primary mt-2 uppercase tracking-tighter">Costo: ${s.cost}</p>}
              </div>
              <div className="flex flex-col gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(s); }}
                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 opacity-40">
              <FlaskConical size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Sin estudios registrados</p>
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-24 left-0 right-0 px-6 pointer-events-none">
        <button 
          onClick={() => setScreen('upload-study')}
          className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 pointer-events-auto active:scale-95 transition-all border-4 border-white dark:border-slate-800"
        >
          <Plus size={28} strokeWidth={3} />
          SUBIR ESTUDIO
        </button>
      </div>
    </div>
  );
};

const MedicalDirectoryScreen = ({ 
  onBack, 
  setScreen, 
  entities, 
  onDelete, 
  onEdit 
}: { 
  onBack: () => void, 
  setScreen: (s: Screen) => void,
  entities: MedicalEntity[],
  onDelete: (id: string) => void,
  onEdit: (e: MedicalEntity) => void
}) => (
  <div className="pb-24">
    <Header title="Directorio Médico" onBack={onBack} />
    <main className="px-6 py-8 space-y-8">
      <div className="section-border flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 tracking-tighter">Contactos</h2>
        <button 
          onClick={() => setScreen('add-medical-entity')}
          className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {entities.length > 0 ? entities.map((e) => (
          <div key={e.id} className="highlight-card p-6 group relative">
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                e.type === 'Médico' ? 'bg-primary text-white shadow-primary/20' : 
                e.type === 'Laboratorio' ? 'bg-accent-orange text-white shadow-accent-orange/20' : 
                'bg-rose-500 text-white shadow-rose-200'
              }`}>
                {e.type === 'Médico' ? <Stethoscope size={28} /> : 
                 e.type === 'Laboratorio' ? <FlaskConical size={28} /> : 
                 <Building2 size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{e.type}</span>
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(e)} className="p-1 text-slate-400 hover:text-primary transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(e.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-black text-base sm:text-lg text-slate-800 truncate">{e.name}</h3>
                {e.specialty && <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 truncate">{e.specialty}</p>}
                
                <div className="mt-4 space-y-2">
                  <a href={`tel:${e.phone}`} className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-primary transition-colors">
                    <Phone size={14} />
                    {e.phone}
                  </a>
                  {e.address && (
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-400 truncate">
                      <Search size={14} />
                      {e.address}
                    </p>
                  )}
                </div>

                {e.attachment && (
                  <button 
                    onClick={() => handleDownloadFile(`anexo_${e.id}.pdf`)}
                    className="mt-4 w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Documento adjunto</span>
                    </div>
                    <Download size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 opacity-40">
            <HeartPulse size={64} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Directorio vacío</p>
          </div>
        )}
      </div>
    </main>
  </div>
);

const AddMedicalEntityScreen = ({ 
  onBack, 
  onSave, 
  editingEntity 
}: { 
  onBack: () => void, 
  onSave: (e: Partial<MedicalEntity>) => void,
  editingEntity?: MedicalEntity | null
}) => {
  const [formData, setFormData] = useState({
    type: editingEntity?.type || 'Médico' as 'Médico' | 'Laboratorio' | 'Hospital',
    name: editingEntity?.name || '',
    specialty: editingEntity?.specialty || '',
    phone: editingEntity?.phone || '',
    address: editingEntity?.address || '',
    attachment: editingEntity?.attachment || ''
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-black transition-colors duration-300">
      <Header title={editingEntity ? "Editar Contacto" : "Nuevo Contacto"} onBack={onBack} />
      <main className="px-4 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-10 pb-24">
        <div className="section-border">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter">
            {editingEntity ? "Actualizar Datos" : "Registrar Contacto"}
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">Guarda información de médicos y centros.</p>
        </div>

        <div className="highlight-card p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Entidad</label>
              <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                {['Médico', 'Laboratorio', 'Hospital'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setFormData({ ...formData, type: t as any })}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo o razón social" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
            </div>

            {formData.type === 'Médico' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Especialidad</label>
                <input 
                  type="text" 
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ej. Pediatría, Ginecología..." 
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono *</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número telefónico" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ubicación física" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Anexo / Documento</label>
              <div 
                onClick={() => handleDownloadFile('documento_medico.pdf')}
                className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-center group cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                  <Download size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descargar o Cargar Documento</p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 border-4 border-white active:scale-95 transition-all"
        >
          <CheckCircle2 size={24} />
          {editingEntity ? "ACTUALIZAR CONTACTO" : "GUARDAR CONTACTO"}
        </button>
      </main>
    </div>
  );
};

const ReportsScreen = ({ 
  onBack, 
  profiles 
}: { 
  onBack: () => void, 
  profiles: Profile[] 
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      setShowShareOptions(true);
    }, 2000);
  };

  const shareVia = (method: string) => {
    const message = `Hola, te comparto el reporte médico de ${selectedProfile?.name}.`;
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } else if (method === 'email') {
      window.location.href = `mailto:?subject=Reporte Médico - ${selectedProfile?.name}&body=${encodeURIComponent(message)}`;
    } else if (method === 'native' && navigator.share) {
      navigator.share({
        title: 'Reporte Médico',
        text: message,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert(`Compartiendo vía ${method}...`);
    }
  };

  return (
    <div className="pb-24">
      <Header 
        title="Reportes Médicos" 
        onBack={onBack}
        rightElement={<button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"><TrendingUp size={24} /></button>}
      />
      <main className="px-6 py-8 space-y-10">
        <section>
          <div className="section-border mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Seleccionar Familiar</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {profiles.map((p) => (
              <button 
                key={p.id} 
                onClick={() => {
                  setSelectedProfileId(p.id);
                  setReportGenerated(false);
                }}
                className="flex flex-col items-center gap-3 min-w-[80px]"
              >
                <div className={`size-16 rounded-[1.5rem] p-1 transition-all duration-300 ${selectedProfileId === p.id ? 'ring-4 ring-primary bg-white dark:bg-slate-800 shadow-xl scale-110' : 'opacity-40 grayscale'}`}>
                  {p.img ? (
                    <img src={p.img} className="size-full rounded-[1.2rem] object-cover" alt={p.name} />
                  ) : (
                    <div className={`size-full rounded-[1.2rem] ${p.color || 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedProfileId === p.id ? 'text-primary' : 'text-slate-400'}`}>{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="section-border mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Tipos de Reporte</h2>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Historial Completo', desc: 'Resumen integral de toda la información clínica.', icon: FileText, color: 'bg-primary', shadow: 'shadow-primary/20' },
              { title: 'Cartilla de Vacunación', desc: 'Registro detallado de inmunizaciones.', icon: Syringe, color: 'bg-accent-blue', shadow: 'shadow-accent-blue/20' },
            ].map((r, i) => (
              <div key={i} className="highlight-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-slate-800">{r.title}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">{r.desc}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${r.color} text-white flex items-center justify-center shadow-lg ${r.shadow}`}>
                    <r.icon size={24} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className={`flex-1 ${r.color} text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg ${r.shadow} active:scale-95 transition-all disabled:opacity-50`}
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FileText size={18} />
                    )}
                    {isGenerating ? 'GENERANDO...' : 'GENERAR REPORTE'}
                  </button>
                  <button 
                    onClick={() => shareVia('email')}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-3.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Mail size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {reportGenerated && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="section-border mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Reporte Listo</h2>
            </div>
            <div className="highlight-card p-8 bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800">¡Reporte Generado!</h3>
                  <p className="text-xs font-bold text-slate-400">El documento está listo para ser compartido.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => alert('Descargando PDF...')}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-primary/40 transition-all group"
                >
                  <Download size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Descargar</span>
                </button>
                <button 
                  onClick={() => shareVia('whatsapp')}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-green-500/40 transition-all group"
                >
                  <MessageCircle size={24} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">WhatsApp</span>
                </button>
                <button 
                  onClick={() => shareVia('email')}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-primary/40 transition-all group"
                >
                  <Mail size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Correo</span>
                </button>
                <button 
                  onClick={() => shareVia('native')}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-primary/40 transition-all group"
                >
                  <Share2 size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Otros</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}

        <section>
          <div className="section-border mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Vista Previa</h2>
          </div>
          <div className="highlight-card border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-black text-primary tracking-tighter">Aura Health</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-[0.2em]">Reporte Clínico Digital</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] font-bold text-slate-400">Ref: #AH-{Math.floor(Math.random() * 90000) + 10000}</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedProfile?.name || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NSS</p>
                  <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{selectedProfile?.nss || '---'}</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b-2 border-slate-100 dark:border-slate-800 pb-3 mb-6 uppercase tracking-widest">Resumen Reciente</h5>
              <div className="space-y-8">
                {[
                  { title: 'Consulta General', sub: 'Dr. Ricardo Salinas', date: 'RECIENTE' },
                  { title: 'Estudios de Sangre', sub: 'Laboratorios Chopo', date: 'PENDIENTE' },
                ].map((item, i) => (
                  <div key={i} className="relative pl-8 border-l-4 border-primary/10">
                    <div className="absolute -left-[10px] top-0 size-4 bg-primary rounded-full border-4 border-white dark:border-slate-800 shadow-md" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">{item.sub}</p>
                      </div>
                      <span className="text-[10px] font-black text-primary">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const RegisterVaccineScreen = ({ 
  onBack, 
  onSave, 
  editingVaccine 
}: { 
  onBack: () => void, 
  onSave: (v: Partial<Vaccine>) => void,
  editingVaccine?: Vaccine | null
}) => {
  const [formData, setFormData] = useState({
    name: editingVaccine?.name || '',
    date: editingVaccine?.date || '',
    dose: editingVaccine?.dose || '',
    status: editingVaccine?.status || 'Aplicada' as 'Aplicada' | 'Pendiente',
    location: editingVaccine?.location || '',
    brand: editingVaccine?.brand || ''
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-black transition-colors duration-300">
      <Header 
        title={editingVaccine ? "Editar Vacuna" : "Nueva Vacuna"} 
        onBack={onBack}
        rightElement={<button onClick={() => onSave(formData)} className="text-primary font-black uppercase tracking-widest text-xs">Guardar</button>}
      />
      <main className="px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-10">
        <div className="section-border">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter">
            {editingVaccine ? "Actualizar Registro" : "Registrar Aplicación"}
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">Completa los datos de la cartilla.</p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="highlight-card p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Syringe size={24} />
              </div>
              <h3 className="font-black text-lg text-slate-800 uppercase tracking-widest">Información</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Vacuna *</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Influenza, COVID-19..."
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:border-primary/40 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Aplicación *</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:border-primary/40 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dosis / Descripción</label>
                <input 
                  type="text"
                  value={formData.dose}
                  onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                  placeholder="Ej. 1ra Dosis, Refuerzo..."
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:border-primary/40 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label>
                  <input 
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej. Pfizer, Sanofi..."
                    className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Lugar</label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej. IMSS, Clínica..."
                    className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:border-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                  {['Aplicada', 'Pendiente'].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setFormData({ ...formData, status: s as 'Aplicada' | 'Pendiente' })}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 border-4 border-white active:scale-95 transition-all"
          >
            <CheckCircle2 size={24} />
            {editingVaccine ? "ACTUALIZAR REGISTRO" : "GUARDAR VACUNA"}
          </button>
        </div>
      </main>
    </div>
  );
};

const AddFamilyScreen = ({ 
  onBack, 
  onSave, 
  editingProfile 
}: { 
  onBack: () => void, 
  onSave: (p: Partial<Profile>) => void,
  editingProfile?: Profile | null
}) => {
  const [formData, setFormData] = useState({
    name: editingProfile?.name || '',
    birthDate: editingProfile?.birthDate || '',
    gender: editingProfile?.gender || 'Hombre' as 'Hombre' | 'Mujer',
    bloodType: editingProfile?.bloodType || '',
    nss: editingProfile?.nss || '',
    insurance: {
      insurer: editingProfile?.insurance?.insurer || '',
      policyNumber: editingProfile?.insurance?.policyNumber || '',
      validity: editingProfile?.insurance?.validity || '',
      policyImg: editingProfile?.insurance?.policyImg || ''
    }
  });

  const age = useMemo(() => calculateAge(formData.birthDate), [formData.birthDate]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-black transition-colors duration-300">
      <Header title={editingProfile ? "Editar Familiar" : "Registrar Familiar"} onBack={onBack} />
      <main className="px-4 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-10">
        <div 
          onClick={() => handleDownloadFile('foto_perfil.jpg')}
          className="flex flex-col items-center gap-4 sm:gap-6 cursor-pointer group"
        >
          <div className="relative">
            <div className="bg-white dark:bg-slate-800 border-4 border-dashed border-primary/30 size-32 sm:size-40 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-xl group-hover:border-primary/60 transition-all">
              {editingProfile?.img ? (
                <img src={editingProfile.img} className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] object-cover" alt="Profile" />
              ) : (
                <Download size={40} className="sm:w-12 sm:h-12 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-primary text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-slate-800 shadow-lg">
              <Download size={16} className="sm:w-5 sm:h-5" strokeWidth={3} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter">
              {editingProfile ? "Descargar o Actualizar" : "Descargar o Cargar"}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-bold mt-1">Toque para gestionar la foto de perfil</p>
          </div>
        </div>

        <div className="highlight-card p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Juan Pérez" 
              className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
            <div className="flex gap-4">
              <input 
                type="date" 
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="flex-1 h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
              <div className="w-28 bg-primary/10 dark:bg-primary/20 rounded-2xl flex flex-col items-center justify-center border-2 border-primary/20 dark:border-primary/30 shadow-inner">
                <span className="text-[10px] uppercase font-black text-primary tracking-widest">Edad</span>
                <span className="text-primary font-black text-2xl">{age !== null ? age : '--'}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sexo</label>
              <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                {['Hombre', 'Mujer'].map((g) => (
                  <button 
                    key={g} 
                    onClick={() => setFormData({ ...formData, gender: g as 'Hombre' | 'Mujer' })}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Sangre</label>
              <input 
                type="text" 
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                placeholder="Ej. O+, A-" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Número de Seguridad Social</label>
            <input 
              type="text" 
              value={formData.nss}
              onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
              placeholder="Ej. 12345678901" 
              className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
            />
          </div>

          <div className="section-border pt-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Gastos Médicos Mayores</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Aseguradora</label>
            <input 
              type="text" 
              value={formData.insurance.insurer}
              onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, insurer: e.target.value } })}
              placeholder="Ej. GNP, AXA, MetLife..." 
              className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Número de Póliza</label>
              <input 
                type="text" 
                value={formData.insurance.policyNumber}
                onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, policyNumber: e.target.value } })}
                placeholder="Póliza #" 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vigencia</label>
              <input 
                type="date" 
                value={formData.insurance.validity}
                onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, validity: e.target.value } })}
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Archivo de la Póliza</label>
            <div 
              onClick={() => handleDownloadFile('poliza.pdf')}
              className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-center group cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                <Download size={32} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descargar o Cargar Archivo</p>
            </div>
          </div>

          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 mt-4 border-4 border-white active:scale-95 transition-all"
          >
            {editingProfile ? "ACTUALIZAR PERFIL" : "GUARDAR PERFIL"}
          </button>
        </div>
      </main>
    </div>
  );
};

const UploadStudyScreen = ({ 
  onBack, 
  onSave, 
  editingStudy,
  medicalEntities
}: { 
  onBack: () => void, 
  onSave: (s: Partial<Study>) => void,
  editingStudy?: Study | null,
  medicalEntities: MedicalEntity[]
}) => {
  const [formData, setFormData] = useState({
    name: editingStudy?.name || '',
    lab: editingStudy?.lab || '',
    category: editingStudy?.category || 'Laboratorio' as 'Laboratorio' | 'Imagen',
    type: editingStudy?.type || 'pdf' as 'pdf' | 'img',
    cost: editingStudy?.cost || ''
  });

  const labEntities = medicalEntities.filter(e => e.type === 'Laboratorio' || e.type === 'Hospital');

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-black transition-colors duration-300">
      <Header title={editingStudy ? "Editar Estudio" : "Cargar Resultado"} onBack={onBack} />
      <main className="px-4 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-10">
        <div 
          onClick={() => handleDownloadFile('estudio.pdf')}
          className="highlight-card border-dashed border-4 border-primary/30 bg-white dark:bg-slate-800 p-8 sm:p-12 flex flex-col items-center justify-center gap-4 sm:gap-6 text-center shadow-2xl group cursor-pointer hover:border-primary/60 transition-all"
        >
          <div className="size-16 sm:size-20 bg-primary/10 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Download size={32} className="sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200 tracking-tighter">Descargar o Cargar Archivo</h2>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mt-2">PDF, JPG o PNG (Máx. 10MB)</p>
          </div>
          <button className="bg-primary text-white font-black px-8 sm:px-10 h-12 sm:h-14 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] sm:text-xs border-4 border-white dark:border-slate-800">
            Elegir Archivo
          </button>
        </div>

        <div className="highlight-card p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Estudio</label>
            <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              {['Laboratorio', 'Imagen'].map((c) => (
                <button 
                  key={c} 
                  onClick={() => setFormData({ ...formData, category: c as any })}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.category === c ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Estudio</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Análisis de Sangre Completo" 
              className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Laboratorio / Centro</label>
            <div className="space-y-4">
              <select 
                value={formData.lab}
                onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
                className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all appearance-none"
              >
                <option value="">Seleccionar del directorio...</option>
                {labEntities.map(e => (
                  <option key={e.id} value={e.name}>{e.name} ({e.type})</option>
                ))}
                <option value="other">Otro (Escribir abajo)</option>
              </select>
              
              {(formData.lab === 'other' || !labEntities.find(e => e.name === formData.lab)) && (
                <input 
                  type="text" 
                  value={formData.lab === 'other' ? '' : formData.lab}
                  onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
                  placeholder="Nombre del centro manual" 
                  className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Costo del Estudio ($)</label>
            <input 
              type="text" 
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00" 
              className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-800 focus:border-primary/40 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Formato de Archivo</label>
            <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              {['pdf', 'img'].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setFormData({ ...formData, type: t as 'pdf' | 'img' })}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-primary text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/40 mt-4 flex items-center justify-center gap-3 border-4 border-white active:scale-95 transition-all"
          >
            <Cloud size={24} />
            {editingStudy ? "ACTUALIZAR ESTUDIO" : "SUBIR Y GUARDAR"}
          </button>
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('aura_current_screen');
    if (saved === 'login') return 'dashboard';
    return (saved as Screen) || 'dashboard';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aura_dark_mode');
    if (saved === null) return true; // Default to dark mode
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aura_dark_mode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    if (user && screen === 'login') {
      setScreen('dashboard');
    }
  }, [user, screen]);
  
  // --- State with LocalStorage Persistence ---
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('aura_profiles');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Elena García', birthDate: '1992-04-12', gender: 'Mujer', bloodType: 'O+', nss: '12345678901', status: 'Esquema completo', type: 'Tú', img: 'https://picsum.photos/seed/elena/100/100', active: true },
      { id: '2', name: 'Mateo Ruiz', birthDate: '2020-05-06', gender: 'Hombre', bloodType: 'O+', nss: '98765432109', status: 'Refuerzo pendiente', color: 'bg-blue-100 text-blue-500', alert: true },
      { id: '3', name: 'Carlos Ruiz', birthDate: '1989-11-20', gender: 'Hombre', bloodType: 'A+', nss: '55544433322', status: 'Análisis al día', color: 'bg-slate-100 text-slate-400' },
    ];
  });

  const [vaccines, setVaccines] = useState<Vaccine[]>(() => {
    const saved = localStorage.getItem('aura_vaccines');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', profileId: '2', name: 'Influenza (Gripe)', date: '2024-10-15', dose: 'Dosis Anual 2024', status: 'Aplicada', location: 'Centro de Salud N1', brand: 'Sanofi' },
      { id: 'v2', profileId: '2', name: 'DPT (Refuerzo)', date: '2024-11-22', dose: 'Difteria, Tosferina, Tétanos', status: 'Pendiente' },
    ];
  });

  const [studies, setStudies] = useState<Study[]>(() => {
    const saved = localStorage.getItem('aura_studies');
    return saved ? JSON.parse(saved) : [
      { id: 's1', profileId: '2', name: 'Análisis de Sangre', date: '2023-10-12', lab: 'Lab Central', category: 'Laboratorio', type: 'pdf', cost: '450.00' },
      { id: 's2', profileId: '2', name: 'Radiografía de Tórax', date: '2023-10-05', lab: 'Clínica San José', category: 'Imagen', type: 'img', cost: '850.00' },
    ];
  });

  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('aura_consultations');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', profileId: '2', type: 'Consulta', doctor: 'Dr. Alejandro Vargas', specialty: 'Cardiología Clínica', date: '2024-02-22', time: '10:30 AM', status: 'Confirmada', reason: 'Chequeo anual y revisión de presión arterial.', cost: '1200.00' },
      { id: 'c2', profileId: '2', type: 'Consulta', doctor: 'Dra. Elena Martínez', specialty: 'Dermatología', date: '2023-10-12', time: '4:15 PM', status: 'Completada', reason: 'Dermatitis atópica leve.', cost: '800.00' },
    ];
  });

  const [medicalEntities, setMedicalEntities] = useState<MedicalEntity[]>(() => {
    const saved = localStorage.getItem('aura_medical_entities');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', type: 'Médico', name: 'Dr. Ricardo Salinas', specialty: 'Pediatría', phone: '555-0199', address: 'Av. Reforma 123' },
      { id: 'm2', type: 'Laboratorio', name: 'Laboratorio Chopo', phone: '555-0200', address: 'Calle 5 de Mayo 45' },
      { id: 'm3', type: 'Hospital', name: 'Hospital Ángeles', phone: '555-0300', address: 'Periférico Sur 1000' },
    ];
  });

  // --- Effects to Save State ---
  useEffect(() => { localStorage.setItem('aura_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('aura_vaccines', JSON.stringify(vaccines)); }, [vaccines]);
  useEffect(() => { localStorage.setItem('aura_studies', JSON.stringify(studies)); }, [studies]);
  useEffect(() => { localStorage.setItem('aura_consultations', JSON.stringify(consultations)); }, [consultations]);
  useEffect(() => { localStorage.setItem('aura_medical_entities', JSON.stringify(medicalEntities)); }, [medicalEntities]);
  useEffect(() => { localStorage.setItem('aura_current_screen', screen); }, [screen]);

  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleSaveAllToDevice = () => {
    // In a real app, this might sync to a cloud or just confirm local storage
    // Since we already use localStorage in useEffects, this is mostly for user peace of mind
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
    
    // Also trigger a literal download of the data as a backup
    const allData = {
      profiles,
      vaccines,
      studies,
      consultations,
      medicalEntities,
      timestamp: new Date().toISOString()
    };
    handleDownloadFile(`aura_respaldo_${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(allData, null, 2));
  };

  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string>('2');
  const [activeStudyProfileId, setActiveStudyProfileId] = useState<string>('2');
  const [activeConsultationProfileId, setActiveConsultationProfileId] = useState<string>('2');
  const [editingMedicalEntity, setEditingMedicalEntity] = useState<MedicalEntity | null>(null);

  const handleLogout = async () => {
    await logout();
    setScreen('dashboard');
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este perfil?')) {
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const handleEditProfile = (p: Profile) => {
    setEditingProfile(p);
    setScreen('add-family');
  };

  const handleSaveProfile = (data: Partial<Profile>) => {
    if (editingProfile) {
      setProfiles(profiles.map(p => p.id === editingProfile.id ? { ...p, ...data } : p));
    } else {
      const newProfile: Profile = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name || '',
        birthDate: data.birthDate || '',
        gender: data.gender as 'Hombre' | 'Mujer' || 'Hombre',
        nss: data.nss || '',
        status: 'Perfil nuevo',
        ...data
      } as Profile;
      setProfiles([...profiles, newProfile]);
    }
    setEditingProfile(null);
    setScreen('profiles');
  };

  const handleSaveVaccine = (data: Partial<Vaccine>) => {
    if (editingVaccine) {
      setVaccines(vaccines.map(v => v.id === editingVaccine.id ? { ...v, ...data } : v));
    } else {
      const newVaccine: Vaccine = {
        id: Math.random().toString(36).substr(2, 9),
        profileId: activeProfileId,
        name: data.name || '',
        date: data.date || '',
        dose: data.dose || '',
        status: data.status || 'Aplicada',
        location: data.location || '',
        brand: data.brand || '',
        ...data
      } as Vaccine;
      setVaccines([...vaccines, newVaccine]);
    }
    setEditingVaccine(null);
    setScreen('vaccination');
  };

  const handleDeleteVaccine = (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro de vacuna?')) {
      setVaccines(vaccines.filter(v => v.id !== id));
    }
  };

  const handleEditVaccine = (v: Vaccine) => {
    setEditingVaccine(v);
    setScreen('register-vaccine');
  };

  const handleSaveStudy = (data: Partial<Study>) => {
    if (editingStudy) {
      setStudies(studies.map(s => s.id === editingStudy.id ? { ...s, ...data } : s));
    } else {
      const newStudy: Study = {
        id: Math.random().toString(36).substr(2, 9),
        profileId: activeStudyProfileId,
        name: data.name || '',
        date: new Date().toISOString().split('T')[0],
        lab: data.lab || '',
        category: data.category || 'Laboratorio',
        type: data.type || 'pdf',
        cost: data.cost || '',
        ...data
      } as Study;
      setStudies([...studies, newStudy]);
    }
    setEditingStudy(null);
    setScreen('studies');
  };

  const handleDeleteStudy = (id: string) => {
    if (window.confirm('¿Deseas eliminar este estudio?')) {
      setStudies(studies.filter(s => s.id !== id));
    }
  };

  const handleEditStudy = (s: Study) => {
    setEditingStudy(s);
    setScreen('upload-study');
  };

  const handleSaveConsultation = (data: Partial<Consultation>) => {
    if (editingConsultation) {
      setConsultations(consultations.map(c => c.id === editingConsultation.id ? { ...c, ...data } : c));
    } else {
      const newConsultation: Consultation = {
        id: Math.random().toString(36).substr(2, 9),
        profileId: activeConsultationProfileId,
        type: data.type || 'Consulta',
        doctor: data.doctor || '',
        specialty: data.specialty || '',
        hospital: data.hospital || '',
        date: data.date || new Date().toISOString().split('T')[0],
        time: data.time || '10:00 AM',
        status: data.status || 'Confirmada',
        reason: data.reason || '',
        cost: data.cost || '',
        prescriptionImg: data.prescriptionImg || '',
        reminder24h: data.reminder24h || false,
        ...data
      } as Consultation;
      setConsultations([...consultations, newConsultation]);
    }
    setEditingConsultation(null);
    setScreen('consultations');
  };

  const handleDeleteConsultation = (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro de consulta?')) {
      setConsultations(consultations.filter(c => c.id !== id));
    }
  };

  const handleEditConsultation = (c: Consultation) => {
    setEditingConsultation(c);
    setScreen('register-consultation');
  };

  const handleSaveMedicalEntity = (data: Partial<MedicalEntity>) => {
    if (editingMedicalEntity) {
      setMedicalEntities(medicalEntities.map(e => e.id === editingMedicalEntity.id ? { ...e, ...data } : e));
    } else {
      const newEntity: MedicalEntity = {
        id: Math.random().toString(36).substr(2, 9),
        type: data.type || 'Médico',
        name: data.name || '',
        specialty: data.specialty || '',
        phone: data.phone || '',
        address: data.address || '',
        attachment: data.attachment || '',
        ...data
      } as MedicalEntity;
      setMedicalEntities([...medicalEntities, newEntity]);
    }
    setEditingMedicalEntity(null);
    setScreen('medical-directory');
  };

  const handleDeleteMedicalEntity = (id: string) => {
    if (window.confirm('¿Deseas eliminar este contacto del directorio?')) {
      setMedicalEntities(medicalEntities.filter(e => e.id !== id));
    }
  };

  const handleEditMedicalEntity = (e: MedicalEntity) => {
    setEditingMedicalEntity(e);
    setScreen('add-medical-entity');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* 
  if (!user) {
    return <LoginScreen />;
  }
  */

  const renderScreen = () => {
    switch (screen) {
      case 'login': return <LoginScreen />;
      case 'dashboard': return (
        <DashboardScreen 
          setScreen={setScreen} 
          medicalEntities={medicalEntities} 
          onSaveAll={handleSaveAllToDevice}
          showSaveToast={showSaveToast}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      );
      case 'profiles': return (
        <ProfilesScreen 
          profiles={profiles} 
          setScreen={setScreen} 
          onDelete={handleDeleteProfile}
          onEdit={handleEditProfile}
        />
      );
      case 'vaccination': return (
        <VaccinationScreen 
          onBack={() => setScreen('dashboard')} 
          setScreen={setScreen} 
          vaccines={vaccines}
          profiles={profiles}
          activeProfileId={activeProfileId}
          setActiveProfileId={setActiveProfileId}
          onDelete={handleDeleteVaccine}
          onEdit={handleEditVaccine}
        />
      );
      case 'consultations': return (
        <ConsultationsScreen 
          onBack={() => setScreen('dashboard')} 
          setScreen={setScreen} 
          consultations={consultations}
          profiles={profiles}
          activeConsultationProfileId={activeConsultationProfileId}
          setActiveConsultationProfileId={setActiveConsultationProfileId}
          onDelete={handleDeleteConsultation}
          onEdit={handleEditConsultation}
        />
      );
      case 'studies': return (
        <StudiesScreen 
          onBack={() => setScreen('dashboard')} 
          setScreen={setScreen} 
          studies={studies}
          profiles={profiles}
          activeStudyProfileId={activeStudyProfileId}
          setActiveStudyProfileId={setActiveStudyProfileId}
          onDelete={handleDeleteStudy}
          onEdit={handleEditStudy}
        />
      );
      case 'medical-directory': return (
        <MedicalDirectoryScreen 
          onBack={() => setScreen('dashboard')} 
          setScreen={setScreen}
          entities={medicalEntities}
          onDelete={handleDeleteMedicalEntity}
          onEdit={handleEditMedicalEntity}
        />
      );
      case 'add-medical-entity': return (
        <AddMedicalEntityScreen 
          onBack={() => { setEditingMedicalEntity(null); setScreen('medical-directory'); }} 
          onSave={handleSaveMedicalEntity}
          editingEntity={editingMedicalEntity}
        />
      );
      case 'reports': return <ReportsScreen onBack={() => setScreen('dashboard')} profiles={profiles} />;
      case 'register-vaccine': return (
        <RegisterVaccineScreen 
          onBack={() => { setEditingVaccine(null); setScreen('vaccination'); }} 
          onSave={handleSaveVaccine}
          editingVaccine={editingVaccine}
        />
      );
      case 'add-family': return (
        <AddFamilyScreen 
          onBack={() => { setEditingProfile(null); setScreen('profiles'); }} 
          onSave={handleSaveProfile}
          editingProfile={editingProfile}
        />
      );
      case 'upload-study': return (
        <UploadStudyScreen 
          onBack={() => { setEditingStudy(null); setScreen('studies'); }} 
          onSave={handleSaveStudy}
          editingStudy={editingStudy}
          medicalEntities={medicalEntities}
        />
      );
      case 'register-consultation': return (
        <RegisterConsultationScreen 
          onBack={() => { setEditingConsultation(null); setScreen('consultations'); }} 
          onSave={handleSaveConsultation}
          editingConsultation={editingConsultation}
          medicalEntities={medicalEntities}
        />
      );
      default: return (
        <DashboardScreen 
          setScreen={setScreen} 
          medicalEntities={medicalEntities} 
          onSaveAll={handleSaveAllToDevice}
          showSaveToast={showSaveToast}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      );
    }
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-[#F8FAFC] dark:bg-black relative overflow-x-hidden transition-all duration-300 ${darkMode ? `border-4 page-border-${screen}` : ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      
      {!['login', 'register-vaccine', 'add-family', 'upload-study', 'register-consultation'].includes(screen) && (
        <BottomNav currentScreen={screen} setScreen={setScreen} />
      )}
    </div>
  );
}
