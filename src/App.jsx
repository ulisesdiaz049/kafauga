import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  User, CheckCircle, XCircle, LogIn, Plus, Trash2, 
  Settings, Users, ClipboardList, Search, Activity, 
  MessageCircle, Mail, ArrowLeft, Edit 
} from 'lucide-react';

// =========================================================================
// PEGA AQUÍ TU OBJETO firebaseConfig
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAmR3KyPVysYLv9EwL85D20kPOBK-nuWcc",
  authDomain: "kafa-studio.firebaseapp.com",
  projectId: "kafa-studio",
  storageBucket: "kafa-studio.firebasestorage.app",
  messagingSenderId: "291757537879",
  appId: "1:291757537879:web:3ee3118457a546f847c112",
  measurementId: "G-89RRFX1HG6"
};
// =========================================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('HOME');
  const [users, setUsers] = useState([]);
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubUsers = onSnapshot(collection(db, 'kafa_users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubAtt = onSnapshot(collection(db, 'kafa_attendances'), (s) => setAttendances(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubUsers(); unsubAtt(); };
  }, [currentUser]);

  const saveAttendance = async (userId, status) => {
    await addDoc(collection(db, 'kafa_attendances'), { 
      userId, 
      date: new Date().toISOString().split('T')[0], 
      status, 
      timestamp: new Date().toISOString() 
    });
  };

  const saveUser = async (u) => {
	try {
    if (u.id) {
      const { id, ...data } = u;
      await updateDoc(doc(db, 'kafa_users', id), data);
    } else {
      await addDoc(collection(db, 'kafa_users'), u);
    }
	console.log("Alumno guardado correctamente");
	} catch (error) {
	console.error("Error al guardar el alumno: ", error);
	}
  };

  const deleteUser = async (id) => { 
    if(window.confirm("¿Seguro que deseas eliminar este alumno?")) {
      await deleteDoc(doc(db, 'kafa_users', id)); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Header Top Derecho */}
      <header className="p-6 flex justify-end items-center absolute top-0 right-0 w-full z-50 pointer-events-none">
        <button 
          onClick={() => setCurrentView(currentView === 'HOME' ? 'ADMIN_LOGIN' : 'HOME')} 
          className="pointer-events-auto flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm transition-colors text-slate-300 shadow-lg"
        >
          {currentView === 'HOME' ? (
            <> <LogIn size={16} /> Admin </>
          ) : (
            <> <ArrowLeft size={16} /> Volver </>
          )}
        </button>
      </header>

      <main className="p-4 flex flex-col items-center justify-center min-h-screen pt-20">
        {currentView === 'HOME' && <HomeView users={users} onSave={saveAttendance} />}
        {currentView === 'ADMIN_LOGIN' && <AdminLogin onSuccess={() => setCurrentView('ADMIN_DASHBOARD')} />}
        {currentView === 'ADMIN_DASHBOARD' && <AdminDashboard users={users} attendances={attendances} onSave={saveUser} onDelete={deleteUser} />}
      </main>
    </div>
  );
}

// ==========================================
// PANTALLA PRINCIPAL (ASISTENCIA)
// ==========================================
function HomeView({ users, onSave }) {
  const [nip, setNip] = useState('');
  const [message, setMessage] = useState(null);
  const user = users.find(u => u.nip === nip);

  const handleSave = (id, status) => {
    onSave(id, status);
    setMessage(`¡Asistencia guardada con éxito!`);
    setNip('');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-[420px] bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden relative border border-slate-700/50">
      <div className="h-32 bg-gradient-to-br from-pink-900/40 via-[#1e293b] to-cyan-900/40 absolute top-0 left-0 w-full opacity-60"></div>
      
      <div className="p-8 pt-12 relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#0f172a] rounded-full flex items-center justify-center border-4 border-[#1e293b] shadow-xl mb-6">
          <User size={32} className="text-slate-500" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Registro de Asistencia</h2>
        <p className="text-slate-400 text-xs mb-8 text-center leading-relaxed">
          Ingresa tu NIP para buscar tu perfil y confirmar tu asistencia hoy.
        </p>

        {message && (
          <div className="w-full mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm text-center">
            {message}
          </div>
        )}
        
        <div className="w-full mb-6">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">INGRESA TU NIP</label>
          <input 
            type="password" 
            value={nip} 
            onChange={(e) => setNip(e.target.value)} 
            placeholder="••••" 
            className="w-full bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-widest text-white outline-none focus:border-cyan-500 transition-colors shadow-inner" 
          />
        </div>

        {user ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex gap-3">
              <button onClick={() => handleSave(user.id, 'Asiste')} className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 text-sm">Asistiré</button>
              <button onClick={() => handleSave(user.id, 'No asiste')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 text-sm border border-slate-600">No asistiré</button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-xs italic h-[44px] flex items-center">
            {nip.length > 0 ? "Buscando NIP..." : "Esperando NIP..."}
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// PANTALLA LOGIN ADMIN
// ==========================================
function AdminLogin({ onSuccess }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (user === 'admin' && pass === '1234') onSuccess();
    else setError(true);
  };

  return (
    <div className="w-full max-w-[380px] bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-slate-700/50">
      <div className="flex justify-center mb-4 text-pink-500">
        <Settings size={44} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-center text-white mb-8">Acceso Admin</h2>
      
      {error && <p className="text-red-400 text-xs text-center mb-4">Credenciales incorrectas</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Usuario</label>
          <input 
            type="text" value={user} onChange={(e) => setUser(e.target.value)} 
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 outline-none text-sm" 
            placeholder="Ej: admin" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Contraseña</label>
          <input 
            type="password" value={pass} onChange={(e) => setPass(e.target.value)} 
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 outline-none text-sm" 
            placeholder="••••" 
          />
        </div>
        <button 
          onClick={handleLogin} 
          className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold py-3 rounded-lg transition-colors mt-4 text-sm shadow-lg shadow-pink-500/20"
        >
          Entrar al Dashboard
        </button>
      </div>
      <!--p className="text-[10px] text-slate-500 text-center mt-6">Credenciales demo: admin / 123456789</p-->
    </div>
  );
}

// ==========================================
// DASHBOARD ADMINISTRADOR
// ==========================================
function AdminDashboard({ users, attendances, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState('RESERVAS');
  const [editingUser, setEditingUser] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(a => a.date === todayStr);

  // Fecha formateada en español
  const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (editingUser !== null) {
    return <UserForm user={editingUser} onClose={() => setEditingUser(null)} onSave={(u) => { onSave(u); setEditingUser(null); }} />;
  }

  return (
    <div className="w-full max-w-5xl animate-in fade-in duration-300">
      
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard General</h1>
          <p className="text-slate-400 text-sm mt-1 capitalize">{dateStr}</p>
        </div>
        
        <div className="flex bg-[#1e293b] p-1 rounded-xl border border-slate-700/50">
          <button 
            onClick={() => setActiveTab('RESERVAS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'RESERVAS' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            <ClipboardList size={18} /> Reservas de Hoy
          </button>
          <button 
            onClick={() => setActiveTab('USUARIOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'USUARIOS' ? 'bg-pink-500/10 text-pink-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={18} /> Gestión de Alumnos
          </button>
        </div>
      </div>

      {activeTab === 'RESERVAS' && <ReservasTab users={users} todayAttendances={todayAttendances} />}
      {activeTab === 'USUARIOS' && <UsuariosTab users={users} onAddNew={() => setEditingUser({})} onEdit={setEditingUser} onDelete={onDelete} />}
    </div>
  );
}

// --- PESTAÑA: RESERVAS DE HOY ---
function ReservasTab({ users, todayAttendances }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400"><CheckCircle size={24} /></div>
          <div><p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Asistirán hoy</p><p className="text-2xl font-bold">{todayAttendances.filter(a => a.status === 'Asiste').length}</p></div>
        </div>
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-400"><XCircle size={24} /></div>
          <div><p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">No Asistirán</p><p className="text-2xl font-bold">{todayAttendances.filter(a => a.status === 'No asiste').length}</p></div>
        </div>
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-300"><Activity size={24} /></div>
          <div><p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Sin Confirmar</p><p className="text-2xl font-bold">{users.length - todayAttendances.length}</p></div>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-700/50 bg-[#1e293b]/50"><h3 className="font-bold text-sm">Estado de los Alumnos</h3></div>
        <div className="divide-y divide-slate-700/50 max-h-[50vh] overflow-y-auto">
          {users.map(user => {
            const att = todayAttendances.find(a => a.userId === user.id);
            let statusBadge = <span className="bg-[#0f172a] text-slate-400 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">Pendiente</span>;
            if (att?.status === 'Asiste') statusBadge = <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-medium">Asiste</span>;
            else if (att?.status === 'No asiste') statusBadge = <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1 rounded-full text-xs font-medium">No asiste</span>;

            return (
              <div key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-700/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0f172a] border border-slate-600 flex items-center justify-center"><User size={18} className="text-slate-400"/></div>
                  <div><p className="font-medium text-sm">{user.name} {user.lastNameP}</p><p className="text-xs text-slate-500">{user.classTime || 'Sin turno'}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  {statusBadge}
                  {!att && (
                    <div className="flex gap-2">
                      <button className="p-2 border border-green-900/50 bg-green-900/20 text-green-500 hover:bg-green-900/40 rounded-lg transition-colors"><MessageCircle size={16} /></button>
                      <button className="p-2 border border-slate-700 bg-[#0f172a] text-slate-400 hover:text-white rounded-lg transition-colors"><Mail size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- PESTAÑA: GESTIÓN DE ALUMNOS ---
function UsuariosTab({ users, onAddNew, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => `${u.name} ${u.lastNameP}`.toLowerCase().includes(search.toLowerCase()) || (u.nip && u.nip.includes(search)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" placeholder="Buscar por nombre o NIP..." value={search} onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-[#1e293b] border border-slate-700/50 focus:border-pink-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors text-sm shadow-sm" 
          />
        </div>
        <button 
          onClick={onAddNew} 
          className="flex items-center justify-center gap-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-lg shadow-pink-500/20"
        >
          <Plus size={16} /> Nuevo Alumno
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(user => (
          <div key={user.id} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors shadow-lg group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0f172a] border border-slate-700 flex items-center justify-center"><User size={20} className="text-slate-500"/></div>
                <div>
                  <h4 className="font-bold text-sm text-white">{user.name} {user.lastNameP}</h4>
                  <p className="text-xs text-slate-400">NIP: <span className="font-mono text-cyan-400">{user.nip}</span></p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(user)} className="p-1.5 text-slate-400 hover:text-white bg-[#0f172a] rounded-md border border-slate-700"><Edit size={14}/></button>
                <button onClick={() => onDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-400 bg-[#0f172a] rounded-md border border-slate-700"><Trash2 size={14}/></button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-0.5 font-semibold">Turno</span>
                {user.classTime || '-'}
              </div>
              <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-0.5 font-semibold">Contacto</span>
                {user.phone || '-'}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-slate-500 text-sm col-span-full">No se encontraron alumnos.</p>}
      </div>
    </div>
  );
}

// ==========================================
// FORMULARIO DE REGISTRO COMPLETO
// ==========================================
function UserForm({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nip: user?.nip || Math.floor(1000 + Math.random() * 9000).toString(),
    classTime: user?.classTime || '', status: user?.status || 'Activo',
    name: user?.name || '', lastNameP: user?.lastNameP || '', lastNameM: user?.lastNameM || '',
    birthDate: user?.birthDate || '', sex: user?.sex || 'Femenino',
    phone: user?.phone || '', email: user?.email || '', instagram: user?.instagram || '',
    medical: user?.medical || 'Ninguna', weight: user?.weight || '', height: user?.height || ''
  });

  const calculatedIMC = useMemo(() => {
    const w = parseFloat(formData.weight); const h = parseFloat(formData.height);
    return (w > 0 && h > 0) ? (w / (h * h)).toFixed(1) : '0.0';
  }, [formData.weight, formData.height]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData, imc: calculatedIMC });
  };

  return (
    <div className="w-full max-w-4xl bg-[#1e293b] p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-700/50 relative animate-in slide-in-from-bottom-8 duration-300">
      <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"><XCircle size={20} /></button>
      
      <h2 className="text-2xl font-bold text-white mb-8">{user?.id ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECCIÓN 1: Control y Acceso */}
        <div>
          <h3 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Settings size={14}/> Control y Acceso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">NIP de Acceso (4 dígitos)</label>
              <input required type="text" name="nip" value={formData.nip} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-mono outline-none focus:border-pink-500 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Clase (Turno)</label>
              <input type="text" name="classTime" value={formData.classTime} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Estatus</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Datos Personales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Nombre(s)</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Apellido P.</label>
            <input required type="text" name="lastNameP" value={formData.lastNameP} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Apellido M.</label>
            <input type="text" name="lastNameM" value={formData.lastNameM} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
          </div>
          
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Sexo</label>
            <select name="sex" value={formData.sex} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm">
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN 3: Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Celular (WhatsApp)</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Correo Electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Instagram</label>
            <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500 text-sm" />
          </div>
        </div>

        {/* SECCIÓN 4: Salud */}
        <div>
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-4"><Activity size={14}/> Estado Físico y Salud</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Enfermedad o Lesión</label>
              <input type="text" name="medical" value={formData.medical} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Estatura (m)</label>
              <input type="number" step="0.01" name="height" value={formData.height} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-3 bg-[#0f172a] px-4 py-2 rounded-lg border border-slate-700 w-fit">
            <span className="text-[11px] text-slate-400">IMC Calculado:</span>
            <span className={`text-lg font-bold ${parseFloat(calculatedIMC) > 25 ? 'text-pink-500' : 'text-cyan-400'}`}>{calculatedIMC}</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">Cancelar</button>
          <button type="submit" className="bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold px-8 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-pink-500/20">Guardar Alumno</button>
        </div>
      </form>
    </div>
  );
}
