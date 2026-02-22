import React, { useState, useEffect } from 'react';
import { 
  Calculator, Save, Database, Plus, Trash2, 
  Target, ShieldCheck, Zap, Lock, Key, ArrowRight, User, Eye, EyeOff, Unlock, FileDown,
  AlertTriangle, CheckCircle2, XCircle, TrendingUp, Anchor, Settings, Skull, Activity, Sun, Moon
} from 'lucide-react';
import { supabase } from './supabaseClient';

const App = () => {
  const VERSION = "NÓMADA ELITE v9.60 - SUPREME ARCHITECT";
  const APP_DOWNLOAD_URL = (import.meta.env.VITE_SIMULADOR_APP_URL || "https://nomada-app.vercel.app/").trim();
  const STORAGE_KEY = "nomada_elite_state_v1";
  const THEME_KEY = "nomada_elite_theme_v1";
  const LOGIN_LOGO_SOURCES = [
    "/branding/nomada-logo-white.png",
    "/branding/nomada-logo-white.svg",
    "/branding/nomada-logo-negro.png",
    "/branding/nomada-logo-dark.png",
    "/branding/nomada-logo.png",
    "/branding/nomada-logo.svg",
    "/branding/logo.png",
    "/nomada-logo.png"
  ];
  
  // --- ESTADO DE AUTENTICACION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", pass: "" });
  const [loginError, setLoginError] = useState("");
  const [typewriterText, setTypewriterText] = useState("");
  const [logoSourceIndex, setLogoSourceIndex] = useState(0);
  const fullPhrase = "Mientras ellos adivinan nosotros ejecutamos.";

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("No se pudo recuperar la sesion", error);
      }
      if (!isMounted) return;
      setIsAuthenticated(Boolean(data.session));
      setAuthLoading(false);
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(session));
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading || isAuthenticated) return;
    let i = 0;
    const timer = setInterval(() => {
      setTypewriterText(fullPhrase.slice(0, i));
      i++;
      if (i > fullPhrase.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [authLoading, isAuthenticated]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSubmittingAuth) return;

    const email = credentials.email.trim().toLowerCase();
    const pass = credentials.pass.trim();
    if (!email || !pass) {
      setLoginError("Ingresa correo y contrasena.");
      return;
    }

    setIsSubmittingAuth(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      setLoginError("Credenciales invalidas o usuario no confirmado.");
      setCredentials({ email, pass: "" });
    } else {
      setIsAuthenticated(true);
      setCredentials({ email, pass: "" });
    }

    setIsSubmittingAuth(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("No se pudo cerrar sesion", error);
    }
    setIsAuthenticated(false);
  };

  // --- LOGICA DE NEGOCIO ---
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [nombreReceta, setNombreReceta] = useState("");
  const [costoMaximo, setCostoMaximo] = useState(0);
  const [activeTab, setActiveTab] = useState("receta");
  const crearIngrediente = () => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    tipo: "insumo",
    nombre: "",
    unidad: "GR",
    cant: "",
    precio: "",
    subRecetaId: ""
  });
  const [ingredientes, setIngredientes] = useState([
    { id: 1, tipo: "insumo", nombre: "", unidad: "GR", cant: "", precio: "", subRecetaId: "" }
  ]);
  const [subRecetas, setSubRecetas] = useState([
    {
      id: 1,
      nombre: "",
      rendimiento: "",
      ingredientes: [{ id: 1, nombre: "", unidad: "GR", cant: "", precio: "" }]
    }
  ]);
  
  const [params, setParams] = useState({
    error: 0,
    rendimiento: 0,
    target: 0,
    tax: 0
  });
  const [recetasCloud, setRecetasCloud] = useState([]);
  const [selectedRecetaId, setSelectedRecetaId] = useState("");
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("");
  const [cloudDataColumn, setCloudDataColumn] = useState("payload");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(THEME_KEY) || "dark";
  });
  const [isHydrated, setIsHydrated] = useState(false);

  const buildRecetaPayload = () => ({
    nombreReceta,
    costoMaximo,
    ingredientes,
    subRecetas,
    params,
    activeTab
  });

  const hydrateRecetaState = (payload) => {
    if (!payload || typeof payload !== "object") return;
    if (typeof payload.nombreReceta === "string") setNombreReceta(payload.nombreReceta);
    if (payload.costoMaximo !== undefined) setCostoMaximo(payload.costoMaximo);
    if (Array.isArray(payload.ingredientes) && payload.ingredientes.length > 0) setIngredientes(payload.ingredientes);
    if (Array.isArray(payload.subRecetas) && payload.subRecetas.length > 0) setSubRecetas(payload.subRecetas);
    if (payload.params && typeof payload.params === "object") setParams((prev) => ({ ...prev, ...payload.params }));
    if (payload.activeTab === "receta" || payload.activeTab === "subrecetas" || payload.activeTab === "empresa") setActiveTab(payload.activeTab);
  };

  const normalizeRecetaRow = (row) => {
    const candidatePayload = row?.payload ?? row?.data ?? null;
    const payload = candidatePayload && typeof candidatePayload === "object" ? candidatePayload : null;
    return {
      id: row?.id,
      nombre: row?.nombre || payload?.nombreReceta || "RECETA SIN NOMBRE",
      payload,
      updatedAt: row?.updated_at || row?.created_at || null
    };
  };

  const getPayloadColumnFromRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return cloudDataColumn;
    const firstWithPayload = rows.find((row) => row && typeof row === "object") || {};
    if (Object.prototype.hasOwnProperty.call(firstWithPayload, "payload")) return "payload";
    if (Object.prototype.hasOwnProperty.call(firstWithPayload, "data")) return "data";
    return cloudDataColumn;
  };

  const isMissingColumnError = (error, col) => {
    if (!error?.message) return false;
    const msg = error.message.toLowerCase();
    return msg.includes(`column "${col}"`) || msg.includes(`column ${col}`);
  };

  const loadRecetasCloud = async () => {
    setCloudLoading(true);
    setCloudMessage("");

    const { data, error } = await supabase.from("recetas").select("*");
    if (error) {
      setCloudLoading(false);
      setCloudMessage("No se pudo cargar recetas desde Supabase.");
      console.error("Error al listar recetas", error);
      return;
    }

    const detectedColumn = getPayloadColumnFromRows(data);
    setCloudDataColumn(detectedColumn);

    const normalized = (data || [])
      .map(normalizeRecetaRow)
      .filter((row) => row.id)
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });

    setRecetasCloud(normalized);
    setCloudLoading(false);
  };

  const saveRecetaCloud = async () => {
    if (cloudSaving) return;

    const nombre = (nombreReceta || "").trim();
    if (!nombre) {
      setCloudMessage("Debes asignar un nombre a la receta antes de guardar.");
      return;
    }

    setCloudSaving(true);
    setCloudMessage("");

    const payload = buildRecetaPayload();

    const persistWithColumn = async (columnName) => {
      const record = { nombre, [columnName]: payload };
      if (selectedRecetaId) {
        return supabase.from("recetas").update(record).eq("id", selectedRecetaId).select("id").single();
      }
      return supabase.from("recetas").insert(record).select("id").single();
    };

    let currentColumn = cloudDataColumn;
    let result = await persistWithColumn(currentColumn);
    if (result.error && (isMissingColumnError(result.error, currentColumn) || result.error.code === "PGRST204")) {
      const alternateColumn = currentColumn === "payload" ? "data" : "payload";
      const retry = await persistWithColumn(alternateColumn);
      if (!retry.error) {
        currentColumn = alternateColumn;
        result = retry;
      }
    }

    if (result.error) {
      setCloudSaving(false);
      setCloudMessage("Error guardando receta en Supabase.");
      console.error("Error al guardar receta", result.error);
      return;
    }

    setCloudDataColumn(currentColumn);
    setSelectedRecetaId(result.data?.id ? String(result.data.id) : selectedRecetaId);
    await loadRecetasCloud();
    setCloudSaving(false);
    setCloudMessage("Receta guardada en la nube.");
  };

  const loadSelectedRecetaCloud = () => {
    if (!selectedRecetaId) {
      setCloudMessage("Selecciona una receta para cargar.");
      return;
    }
    const selected = recetasCloud.find((row) => String(row.id) === String(selectedRecetaId));
    if (!selected || !selected.payload) {
      setCloudMessage("La receta seleccionada no contiene datos cargables.");
      return;
    }
    hydrateRecetaState(selected.payload);
    setCloudMessage(`Receta cargada: ${selected.nombre}`);
  };

  const deleteSelectedRecetaCloud = async () => {
    if (!selectedRecetaId) {
      setCloudMessage("Selecciona una receta para eliminar.");
      return;
    }

    const selected = recetasCloud.find((row) => String(row.id) === String(selectedRecetaId));
    const selectedName = selected?.nombre || "esta receta";
    const confirmed = window.confirm(`Vas a eliminar ${selectedName}. Esta accion no se puede deshacer. Continuar?`);
    if (!confirmed) {
      setCloudMessage("Eliminacion cancelada.");
      return;
    }

    const { error } = await supabase.from("recetas").delete().eq("id", selectedRecetaId);
    if (error) {
      setCloudMessage("No se pudo eliminar la receta.");
      console.error("Error al eliminar receta", error);
      return;
    }

    setSelectedRecetaId("");
    await loadRecetasCloud();
    setCloudMessage("Receta eliminada.");
  };

  const crearNuevaReceta = () => {
    setSelectedRecetaId("");
    setNombreReceta("");
    setCostoMaximo(0);
    setIngredientes([{ id: Date.now(), tipo: "insumo", nombre: "", unidad: "GR", cant: "", precio: "", subRecetaId: "" }]);
    setSubRecetas([
      {
        id: Date.now() + 1,
        nombre: "",
        rendimiento: "",
        ingredientes: [{ id: Date.now() + 2, nombre: "", unidad: "GR", cant: "", precio: "" }]
      }
    ]);
    setParams({ error: 0, rendimiento: 0, target: 0, tax: 0 });
    setActiveTab("receta");
    setCloudMessage("Nueva receta en blanco.");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsHydrated(true);
        return;
      }
      const saved = JSON.parse(raw);
      if (typeof saved.nombreReceta === "string") setNombreReceta(saved.nombreReceta);
      if (saved.costoMaximo !== undefined) setCostoMaximo(saved.costoMaximo);
      if (Array.isArray(saved.ingredientes) && saved.ingredientes.length > 0) setIngredientes(saved.ingredientes);
      if (Array.isArray(saved.subRecetas) && saved.subRecetas.length > 0) setSubRecetas(saved.subRecetas);
      if (saved.params && typeof saved.params === "object") setParams((prev) => ({ ...prev, ...saved.params }));
      if (saved.activeTab === "receta" || saved.activeTab === "subrecetas" || saved.activeTab === "empresa") setActiveTab(saved.activeTab);
    } catch (error) {
      console.error("No se pudo cargar estado guardado", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    const payload = { nombreReceta, costoMaximo, ingredientes, subRecetas, params, activeTab };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [isHydrated, nombreReceta, costoMaximo, ingredientes, subRecetas, params, activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecetasCloud([]);
      setSelectedRecetaId("");
      setCloudMessage("");
      return;
    }
    loadRecetasCloud();
  }, [isAuthenticated]);

  // --- MOTOR DE CALCULO MAESTRO ---
  const resumenSubRecetas = subRecetas.map((sub) => {
    const costoTotal = sub.ingredientes.reduce((acc, i) => acc + (Number(i.cant) * Number(i.precio)), 0);
    const costoUnitario = Number(sub.rendimiento) > 0 ? costoTotal / Number(sub.rendimiento) : 0;
    return { ...sub, costoTotal, costoUnitario };
  });
  const subrecetasEnUsoIds = [
    ...new Set(
      ingredientes
        .filter((i) => i.tipo === "subreceta" && i.subRecetaId)
        .map((i) => String(i.subRecetaId))
    )
  ];
  const subrecetasDisponibles = resumenSubRecetas.length;
  const subrecetasEnUso = subrecetasEnUsoIds.length;
  const subrecetasSinAsignar = ingredientes.filter((i) => i.tipo === "subreceta" && !i.subRecetaId).length;

  const subtotalInsumos = ingredientes.reduce((acc, i) => {
    if (i.tipo === "subreceta") {
      const sub = resumenSubRecetas.find((s) => String(s.id) === String(i.subRecetaId));
      return acc + (Number(i.cant) * Number(sub?.costoUnitario || 0));
    }
    return acc + (Number(i.cant) * Number(i.precio));
  }, 0);
  const totalCostoProd = subtotalInsumos * (1 + (Number(params.error) / 100));
  const costoPorcion = params.rendimiento > 0 ? totalCostoProd / Number(params.rendimiento) : 0;
  const divisorTarget = Number(params.target) / 100;
  const precioSugeridoBase = divisorTarget > 0 ? costoPorcion / divisorTarget : 0;
  const precioSugerido = precioSugeridoBase * (1 + (Number(params.tax) / 100));
  const precioFinalRedondeado = Math.ceil(precioSugerido / 100) * 100;
  const precioSinTax = precioFinalRedondeado / (1 + (Number(params.tax) / 100));
  const foodCostReal = precioSinTax > 0 ? (costoPorcion / precioSinTax) * 100 : 0;
  const margenContribucion = precioSinTax - costoPorcion;
  const desviacion = foodCostReal - Number(params.target);

  const sobrepasoCMP = costoMaximo > 0 && costoPorcion > costoMaximo;

  const getClasificacionNomada = () => {
    if (costoPorcion <= 0) return { label: "SIN DATA", color: "text-zinc-600", icon: <Zap size={18} /> };
    
    const esBajoCosto = costoMaximo > 0 ? costoPorcion <= costoMaximo : foodCostReal <= 30;
    const esAltoMargen = margenContribucion > (precioSinTax * 0.65);

    if (sobrepasoCMP) return { label: "PASIVO FINANCIERO CRITICO", color: "text-red-500", icon: <Skull size={18} />, desc: "Supera el Costo Maximo Permitido (CMP)." };
    if (esBajoCosto && esAltoMargen) return { label: "ACTIVO DE ALTA RENTABILIDAD", color: "text-cyan-400", icon: <TrendingUp size={18} />, desc: "El rey del menu." };
    if (esBajoCosto && !esAltoMargen) return { label: "PRODUCTO DE VOLUMEN / ANCLA", color: "text-emerald-400", icon: <Anchor size={18} />, desc: "Sostiene la operacion." };
    return { label: "DESAFIO OPERATIVO", color: "text-yellow-500", icon: <Settings size={18} />, desc: "Requiere ingenieria de procesos." };
  };

  const clasificacion = getClasificacionNomada();

  const getSemaforoStatus = () => {
    if (params.target <= 0 || foodCostReal <= 0) return { label: "PENDIENTE", color: "text-zinc-500", icon: <Activity size={20} /> };
    if (sobrepasoCMP) return { label: "TECHO SUPERADO", color: "text-red-600", icon: <XCircle size={20} /> };
    if (desviacion <= 0) return { label: "ZONA OPTIMA", color: "text-[#22c55e]", icon: <CheckCircle2 size={20} /> };
    if (desviacion <= 5) return { label: "ZONA DE RIESGO", color: "text-yellow-500", icon: <AlertTriangle size={20} /> };
    return { label: "ZONA CRITICA", color: "text-red-500", icon: <AlertTriangle size={20} /> };
  };

  const semaforo = getSemaforoStatus();

  const agregarFila = () => setIngredientes([...ingredientes, crearIngrediente()]);
  const eliminarFila = (id) => ingredientes.length > 1 && setIngredientes(ingredientes.filter(i => i.id !== id));
  const updateIng = (id, field, val) => setIngredientes(ingredientes.map(i => i.id === id ? { ...i, [field]: val } : i));
  const cambiarTipoIngrediente = (id, tipo) => setIngredientes(
    ingredientes.map((i) => i.id === id
      ? {
          ...i,
          tipo,
          nombre: tipo === "insumo" ? i.nombre : "",
          unidad: tipo === "insumo" ? i.unidad : "UN",
          precio: tipo === "insumo" ? i.precio : "",
          subRecetaId: tipo === "subreceta" ? i.subRecetaId : ""
        }
      : i)
  );

  const agregarSubReceta = () => setSubRecetas([
    ...subRecetas,
    {
      id: Date.now(),
      nombre: "",
      rendimiento: "",
      ingredientes: [{ id: Date.now() + 1, nombre: "", unidad: "GR", cant: "", precio: "" }]
    }
  ]);
  const eliminarSubReceta = (id) => subRecetas.length > 1 && setSubRecetas(subRecetas.filter((s) => s.id !== id));
  const updateSubReceta = (id, field, value) => setSubRecetas(subRecetas.map((s) => s.id === id ? { ...s, [field]: value } : s));
  const agregarIngSubReceta = (subId) => setSubRecetas(
    subRecetas.map((s) => s.id === subId
      ? { ...s, ingredientes: [...s.ingredientes, { id: Date.now(), nombre: "", unidad: "GR", cant: "", precio: "" }] }
      : s)
  );
  const eliminarIngSubReceta = (subId, ingId) => setSubRecetas(
    subRecetas.map((s) => {
      if (s.id !== subId || s.ingredientes.length <= 1) return s;
      return { ...s, ingredientes: s.ingredientes.filter((i) => i.id !== ingId) };
    })
  );
  const updateIngSubReceta = (subId, ingId, field, value) => setSubRecetas(
    subRecetas.map((s) => {
      if (s.id !== subId) return s;
      return {
        ...s,
        ingredientes: s.ingredientes.map((i) => i.id === ingId ? { ...i, [field]: value } : i)
      };
    })
  );

  const exportarPDF = () => window.print();

  // --- INTERFAZ DE LOGIN ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center p-6">
        <p className="text-zinc-400 text-xs uppercase tracking-[0.25em] font-black">Validando sesion...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-amber-300/10 blur-[120px]" />
          <div className="absolute -bottom-24 -right-20 w-[420px] h-[420px] rounded-full bg-zinc-400/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative z-10 w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-2 rounded-[40px] overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl bg-black/45">
          <section className="hidden lg:flex flex-col justify-between p-10 border-r border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent">
            <div>
              <div className="mb-5 flex justify-start">
                {logoSourceIndex < LOGIN_LOGO_SOURCES.length ? (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-3">
                    <img
                      src={LOGIN_LOGO_SOURCES[logoSourceIndex]}
                      alt="Logo Nómada"
                      className="w-44 sm:w-52 h-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                      onError={() => setLogoSourceIndex((prev) => prev + 1)}
                    />
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/15 rounded-2xl px-4 py-3">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-zinc-100">
                      <path d="M4 20L20 4M4 4L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 1.5V4M12 20V22.5M1.5 12H4M20 12H22.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] text-zinc-200 font-black uppercase tracking-[0.25em]">Nomada</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.18em]">Consultorias Gastronomicas</p>
                    </div>
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-5xl leading-[0.95] font-black italic tracking-tight text-white">
                Nómada<span className="text-amber-300">Elite</span>
              </h2>
              <p className="mt-5 text-zinc-400 text-sm leading-relaxed max-w-[34ch]">
                Centro de mando para ingenieria de costos, pricing y rentabilidad gastronomica.
              </p>
            </div>
            <p className="text-red-400/90 text-[11px] uppercase tracking-[0.2em] font-black italic">
              "{typewriterText}"
              <span className="animate-pulse border-r border-red-500 ml-1" />
            </p>
          </section>

          <section className="p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.22em]">Elite Access</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase mb-2">
              Ingreso Seguro
            </h1>
            <p className="text-zinc-500 text-xs uppercase tracking-[0.25em] mb-8">
              Sistema de Ingenieria Maestra
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative group text-left">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-300 transition-colors" size={17} />
                <input
                  type="email"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold outline-none focus:border-amber-300/70 focus:bg-amber-300/[0.04] transition-all"
                  placeholder="Correo de Acceso"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>

              <div className="relative group text-left">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-300 transition-colors" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold outline-none focus:border-amber-300/70 focus:bg-amber-300/[0.04] transition-all"
                  placeholder="Token de Seguridad"
                  value={credentials.pass}
                  onChange={(e) => setCredentials({ ...credentials, pass: e.target.value })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {loginError && (
                <p className="text-red-400 text-[10px] font-black uppercase text-center tracking-[0.25em] animate-pulse pt-1">
                  {loginError}
                </p>
              )}

              <button
                disabled={isSubmittingAuth}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 text-black font-black uppercase tracking-[0.25em] text-[11px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_12px_30px_rgba(251,191,36,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmittingAuth ? "Validando..." : "Ingresar"}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="lg:hidden mt-8 min-h-[20px]">
              <p className="text-red-400/90 text-[10px] font-black uppercase tracking-[0.18em] italic">
                "{typewriterText}"
                <span className="animate-pulse border-r border-red-500 ml-1" />
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }
  // --- PANEL PRINCIPAL (VERSION v9.42 BASE) ---
  return (
    <div className={`min-h-screen text-white p-6 lg:p-10 selection:bg-cyan-500/30 relative overflow-hidden ${theme === "light" ? "theme-light bg-[#eef2f7]" : "theme-dark bg-[#050505]"}`}>
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 no-print"
        style={{
          backgroundImage: theme === "light"
            ? `url("https://www.transparenttextures.com/patterns/diamond-upholstery.png"), radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)`
            : `url("https://www.transparenttextures.com/patterns/carbon-fibre.png"), radial-gradient(circle at 50% 50%, #111 0%, #050505 100%)`,
          transform: `translateY(${offset * 0.2}px)`,
          zIndex: 0
        }}
      />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=JetBrains+Mono:wght@700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #050505; }
        .glass-master { background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); }
        .neon-border-cian { border-left: 4px solid #06b6d4; }
        .neon-border-magenta { border-left: 4px solid #d946ef; }
        .neon-border-verde { border-left: 4px solid #22c55e; }
        .input-tech { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; transition: all 0.3s; }
        .input-tech:focus { background: rgba(6, 182, 212, 0.08); border-color: #06b6d4; outline: none; }
        .input-tech option { color: #111111; background: #ffffff; }
        .label-yellow { color: #facc15; font-weight: 800; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; text-shadow: 0 0 10px rgba(250, 204, 21, 0.3); }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .pdf-executive-header { display: none; }

        .theme-light { color: #0f172a; }
        .theme-light .glass-master { background: rgba(255, 255, 255, 0.86); border: 1px solid rgba(15, 23, 42, 0.12); box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08); }
        .theme-light .input-tech { background: rgba(15, 23, 42, 0.04); border: 1px solid rgba(15, 23, 42, 0.15); color: #0f172a; }
        .theme-light .input-tech:focus { background: rgba(6, 182, 212, 0.08); border-color: #0891b2; }
        .theme-light .text-white { color: #0f172a !important; }
        .theme-light .text-zinc-400, .theme-light .text-zinc-500, .theme-light .text-zinc-600 { color: #475569 !important; }
        .theme-light .border-white\/5 { border-color: rgba(15, 23, 42, 0.1) !important; }
        .theme-light .border-white\/10 { border-color: rgba(15, 23, 42, 0.16) !important; }
        .theme-light .bg-\[\#0a0a0a\] { background: #f8fafc !important; }
        .theme-light .text-zinc-800 { color: #1e293b !important; }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .glass-master { background: white !important; border: 1px solid #000 !important; color: black !important; backdrop-filter: none !important; box-shadow: none !important; border-radius: 10px !important; margin-bottom: 20px; }
          .label-yellow { color: #000000 !important; text-shadow: none !important; font-size: 10px !important; font-weight: 900 !important; border-bottom: 1px solid black !important; }
          input, select { background: transparent !important; color: #000000 !important; border: none !important; font-weight: 900 !important; opacity: 1 !important; }
          .text-white, .text-[#06b6d4], .text-[#d946ef], .text-[#22c55e], .mono, .text-7xl { color: #000000 !important; text-shadow: none !important; }
          .neon-border-cian, .neon-border-magenta, .neon-border-verde { border-left: 5px solid black !important; }
          .pdf-executive-header { display: block !important; border: 2px solid #000; padding: 16px; border-radius: 10px; margin-bottom: 14px; }
          .pdf-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
          .pdf-kpi { border: 1px solid #000; padding: 6px; border-radius: 6px; }
          .footer-pdf { display: block !important; position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 10px; color: #000 !important; font-weight: 800; border-top: 2px solid black; padding-top: 10px; }
        }
        .footer-pdf { display: none; }
      `}</style>

      <div className="relative z-10">
        <header className="max-w-[1600px] mx-auto mb-12 flex justify-between items-center border-b border-white/10 pb-10 no-print">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Zap size={24} className="text-[#06b6d4] fill-[#06b6d4]" />
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                Nómada<span className="text-[#06b6d4]">Elite</span>
              </h1>
            </div>
            <p className="text-[10px] font-black tracking-[0.6em] text-zinc-600 uppercase italic">“No optimizamos cocinas… construimos imperios gastronómicos rentables.”</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </button>
            <button onClick={exportarPDF} className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#06b6d4] hover:text-white transition-all shadow-lg">
              <FileDown size={14} /> Exportar Reporte PDF
            </button>
            <button onClick={handleLogout} className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/20 transition-all">
              <Unlock size={14} /> Bloquear
            </button>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto space-y-12">
          <div className="pdf-executive-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <div>
                <p style={{ fontWeight: 900, letterSpacing: "0.2em", fontSize: "10px", textTransform: "uppercase" }}>NOMADA CONSULTORIAS GASTRONOMICAS</p>
                <p style={{ fontWeight: 800, fontSize: "9px", marginTop: "4px" }}>Reporte Ejecutivo de Ingenieria de Menu</p>
              </div>
              <div style={{ textAlign: "right", fontSize: "9px", fontWeight: 800 }}>
                <p>Fecha: {new Date().toLocaleDateString()}</p>
                <p>Receta: {nombreReceta || "SIN NOMBRE"}</p>
              </div>
            </div>
            <div className="pdf-kpis">
              <div className="pdf-kpi">
                <p style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Costo x Porcion</p>
                <p style={{ fontSize: "16px", fontWeight: 900 }}>${Math.round(costoPorcion).toLocaleString()}</p>
              </div>
              <div className="pdf-kpi">
                <p style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Precio Sugerido</p>
                <p style={{ fontSize: "16px", fontWeight: 900 }}>${precioFinalRedondeado.toLocaleString()}</p>
              </div>
              <div className="pdf-kpi">
                <p style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Food Cost Real</p>
                <p style={{ fontSize: "16px", fontWeight: 900 }}>{foodCostReal.toFixed(1)}%</p>
              </div>
              <div className="pdf-kpi">
                <p style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase" }}>Clasificacion</p>
                <p style={{ fontSize: "12px", fontWeight: 900 }}>{clasificacion.label}</p>
              </div>
            </div>
          </div>

          <section className="no-print">
            <div className="glass-master rounded-[24px] p-3 inline-flex gap-3 border border-white/10">
              <button
                onClick={() => setActiveTab("receta")}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
                  activeTab === "receta"
                    ? "bg-[#06b6d4] text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Receta Estandar
              </button>
              <button
                onClick={() => setActiveTab("subrecetas")}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
                  activeTab === "subrecetas"
                    ? "bg-[#d946ef] text-white"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Banco Subrecetas
              </button>
              <button
                onClick={() => setActiveTab("empresa")}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
                  activeTab === "empresa"
                    ? "bg-amber-300 text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Empresa
              </button>
            </div>
          </section>

          {activeTab === "receta" && (
            <section className="no-print">
              <div className="glass-master rounded-[24px] p-5 border border-white/10">
                <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black mb-2">Recetas en la nube</p>
                    <select
                      className="input-tech w-full p-4 rounded-xl text-sm font-black uppercase bg-[#0a0a0a]"
                      value={selectedRecetaId}
                      onChange={(e) => setSelectedRecetaId(e.target.value)}
                    >
                      <option value="">Seleccionar receta...</option>
                      {recetasCloud.map((receta) => (
                        <option key={receta.id} value={receta.id}>{receta.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={saveRecetaCloud}
                      disabled={cloudSaving}
                      className="bg-cyan-500 text-black px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-cyan-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save size={14} /> {cloudSaving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={loadSelectedRecetaCloud}
                      className="bg-white/5 border border-white/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Database size={14} /> Cargar
                    </button>
                    <button
                      onClick={deleteSelectedRecetaCloud}
                      className="bg-red-500/15 border border-red-500/30 text-red-300 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-red-500/25 transition-all"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                    <button
                      onClick={crearNuevaReceta}
                      className="bg-amber-300 text-black px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-amber-200 transition-all"
                    >
                      <Plus size={14} /> Nueva
                    </button>
                    <button
                      onClick={loadRecetasCloud}
                      disabled={cloudLoading}
                      className="bg-white/5 border border-white/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Activity size={14} /> {cloudLoading ? "Actualizando..." : "Actualizar"}
                    </button>
                  </div>
                </div>

                {cloudMessage && (
                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">{cloudMessage}</p>
                )}
              </div>
            </section>
          )}
          
          {/* IDENTIFICADOR, COSTO MÁXIMO Y AUDITORÍA */}
                    {activeTab === "receta" && (
            <section className="glass-master border border-white/10 rounded-[24px] p-5 no-print">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black">Subrecetas Disponibles</p>
                    <p className="text-xl font-black text-white mono">{subrecetasDisponibles}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black">Subrecetas en Uso</p>
                    <p className="text-xl font-black text-[#22c55e] mono">{subrecetasEnUso}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black">Filas sin Asignar</p>
                    <p className={`text-xl font-black mono ${subrecetasSinAsignar > 0 ? "text-yellow-500" : "text-zinc-400"}`}>{subrecetasSinAsignar}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("subrecetas")}
                  className="bg-[#d946ef]/20 border border-[#d946ef]/40 text-[#f0abfc] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-[#d946ef]/30 transition-all"
                >
                  Ir al Banco
                </button>
              </div>
            </section>
          )}
{activeTab === "receta" && (
            <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="glass-master neon-border-cian p-10 rounded-[35px] lg:col-span-8 print:p-6 print:lg:col-span-12">
              <span className="text-[#06b6d4] text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic flex items-center gap-2 no-print">
                <Target size={14} /> Nombre de la receta
              </span>
              <input 
                className="w-full bg-transparent text-7xl font-black text-white outline-none tracking-tighter placeholder:text-zinc-900 uppercase italic print:text-4xl"
                placeholder="ESCRIBE EL NOMBRE DEL IMPERIO..."
                value={nombreReceta}
                onChange={(e) => setNombreReceta(e.target.value)}
              />
            </section>

            <section className={`glass-master p-8 rounded-[35px] lg:col-span-2 flex flex-col justify-center items-center text-center no-print border-white/5 transition-all ${sobrepasoCMP ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <span className="label-yellow text-[9px] mb-2">CMP (Costo Máx)</span>
              <input 
                type="number"
                className={`bg-transparent text-3xl font-black mono text-center outline-none w-full ${sobrepasoCMP ? 'text-red-500' : 'text-white'}`}
                placeholder="0"
                value={costoMaximo}
                onChange={(e) => setCostoMaximo(e.target.value)}
              />
              <p className="text-[8px] text-zinc-500 mt-2 uppercase tracking-tighter">Techo Financiero</p>
            </section>

            <section className={`glass-master lg:col-span-2 p-8 rounded-[35px] flex flex-col justify-center items-center text-center no-print border-white/5`}>
              <div className={`${semaforo.color} mb-2 animate-pulse`}>
                {semaforo.icon}
              </div>
              <span className={`text-[9px] font-black tracking-[0.2em] uppercase mb-1 ${semaforo.color}`}>Auditoría:</span>
              <h3 className={`text-xl font-black italic uppercase ${semaforo.color}`}>
                {semaforo.label}
              </h3>
              <p className="text-[8px] font-bold text-zinc-500 mt-1 uppercase">Real: {foodCostReal.toFixed(1)}%</p>
            </section>
          </div>

          {/* CLASIFICACIÓN DE INGENIERÍA NÓMADA */}
          <section className={`glass-master border-t-2 ${clasificacion.color.replace('text', 'border')} p-6 rounded-[30px] flex items-center gap-6 no-print`}>
            <div className={`p-4 rounded-2xl bg-white/5 ${clasificacion.color}`}>
              {clasificacion.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Clasificación Nómada</p>
              <h4 className={`text-2xl font-black italic uppercase ${clasificacion.color}`}>{clasificacion.label}</h4>
              <p className="text-xs text-zinc-400 font-medium italic">"{clasificacion.desc}"</p>
            </div>
          </section>

            </>
          )}

          {/* BANCO DE SUBRECETAS */}
          {activeTab === "subrecetas" && (
          <section className="glass-master rounded-[35px] overflow-hidden border border-white/5 shadow-2xl no-print">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
              <Database size={18} className="text-[#d946ef]" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] italic text-zinc-400">Banco de Subrecetas</h2>
            </div>
            <div className="p-8 space-y-8">
              {resumenSubRecetas.map((sub) => (
                <div key={sub.id} className="border border-white/10 rounded-3xl p-6 bg-white/[0.015]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                    <div className="lg:col-span-5 space-y-2">
                      <label className="label-yellow text-[9px] block">Nombre de subreceta</label>
                      <input
                        className="input-tech w-full p-4 rounded-xl font-black uppercase"
                        placeholder="Ej: Salsa madre"
                        value={sub.nombre}
                        onChange={(e) => updateSubReceta(sub.id, "nombre", e.target.value)}
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="label-yellow text-[9px] block">Rendimiento (unidades)</label>
                      <input
                        type="number"
                        className="input-tech w-full p-4 rounded-xl text-center font-black mono text-[#06b6d4]"
                        value={sub.rendimiento}
                        onChange={(e) => updateSubReceta(sub.id, "rendimiento", e.target.value)}
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="label-yellow text-[9px] block">Costo total</label>
                      <div className="input-tech w-full p-4 rounded-xl text-right font-black mono text-white">
                        ${Math.round(sub.costoTotal).toLocaleString()}
                      </div>
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="label-yellow text-[9px] block">Costo unitario</label>
                      <div className="input-tech w-full p-4 rounded-xl text-right font-black mono text-[#22c55e]">
                        ${Math.round(sub.costoUnitario).toLocaleString()}
                      </div>
                    </div>
                    <div className="lg:col-span-1 flex lg:justify-end lg:items-end">
                      <button onClick={() => eliminarSubReceta(sub.id)} className="p-3 text-zinc-500 hover:text-[#d946ef] transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-3 mb-3 px-1">
                    <div className="col-span-4 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">Nombre del insumo</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 text-center">Unidad</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 text-center">Cantidad</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 text-right">Precio unitario</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 text-right">Subtotal</div>
                  </div>

                  <div className="space-y-4">
                    {sub.ingredientes.map((ing) => (
                      <div key={ing.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">Nombre del insumo</label>
                          <input className="input-tech w-full p-3 rounded-xl text-sm font-bold" placeholder="Insumo..." value={ing.nombre} onChange={(e) => updateIngSubReceta(sub.id, ing.id, "nombre", e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">Unidad</label>
                          <select className="input-tech w-full p-3 rounded-xl text-center text-xs font-black uppercase bg-[#0a0a0a]" value={ing.unidad} onChange={(e) => updateIngSubReceta(sub.id, ing.id, "unidad", e.target.value)}>
                            <option value="GR">GR</option><option value="ML">ML</option><option value="UN">UN</option><option value="KG">KG</option><option value="LT">LT</option>
                          </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">Cantidad</label>
                          <input type="number" className="input-tech w-full p-3 rounded-xl text-center font-black mono text-[#06b6d4]" value={ing.cant} onChange={(e) => updateIngSubReceta(sub.id, ing.id, "cant", e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">Precio unitario</label>
                          <input type="number" className="input-tech w-full p-3 rounded-xl text-right font-black mono" value={ing.precio} onChange={(e) => updateIngSubReceta(sub.id, ing.id, "precio", e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500 text-right block">Subtotal</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 text-right text-sm font-black mono text-[#22c55e]">
                              ${(Number(ing.cant) * Number(ing.precio)).toLocaleString()}
                            </div>
                            <button onClick={() => eliminarIngSubReceta(sub.id, ing.id)} className="p-2 text-zinc-700 hover:text-[#d946ef] transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => agregarIngSubReceta(sub.id)} className="w-full mt-5 py-3 border border-dashed border-[#d946ef]/25 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-[#d946ef]/60 hover:text-[#d946ef] hover:bg-[#d946ef]/5 transition-all flex items-center justify-center gap-3">
                    <Plus size={14} /> Agregar insumo a subreceta
                  </button>
                </div>
              ))}

              <button onClick={agregarSubReceta} className="w-full py-5 border border-dashed border-[#d946ef]/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] text-[#d946ef]/60 hover:text-[#d946ef] hover:bg-[#d946ef]/5 transition-all flex items-center justify-center gap-4">
                <Plus size={16} /> Crear subreceta
              </button>
            </div>
          </section>
          )}

          {/* INFORMACION DE LA EMPRESA */}
          {activeTab === "empresa" && (
            <>
              <section className="glass-master border border-amber-300/30 rounded-[28px] p-8 no-print">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">NOMADA CONSULTORIAS GASTRONOMICAS</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white">Quienes Somos</h2>
                <p className="mt-5 text-sm md:text-base text-zinc-300 leading-relaxed max-w-5xl">
                  Somos un equipo especializado en coaching empresarial, diseno y estandarizacion de carta,
                  costos y presupuestos para negocios gastronomicos.
                </p>
                <p className="mt-4 text-sm md:text-base text-zinc-400 leading-relaxed max-w-5xl">
                  Contamos con mas de 10 anos de experiencia en el mercado, auditores en ISO 22000:2018
                  y programas de talleres de cocina privados para equipos y lideres operativos.
                </p>
              </section>

              <section className="glass-master border border-cyan-400/30 rounded-[28px] p-8 no-print">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="max-w-4xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Descarga de la App</p>
                    <h3 className="mt-2 text-2xl md:text-3xl font-black uppercase italic text-white">NOMADA PRESUPUESTOS GASTRONOMICOS</h3>
                    <p className="mt-3 text-sm md:text-base text-zinc-300 leading-relaxed">
                      App especializada para crear presupuestos gastronomicos con control de costos, recetas estandarizadas,
                      calculo de food cost y definicion de precios sugeridos para mejorar la rentabilidad del negocio.
                    </p>
                  </div>
                  <a
                    href={APP_DOWNLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[11px] hover:bg-cyan-400 transition-all"
                  >
                    Descargar App
                  </a>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
                {[
                  {
                    title: "Coaching Empresarial",
                    desc: "Acompanamiento estrategico para lideres, equipos y decisiones clave de crecimiento.",
                    color: "text-cyan-400"
                  },
                  {
                    title: "Diseno y Estandarizacion de Carta",
                    desc: "Estructura de menu, recetas maestras y control operativo para ejecutar con consistencia.",
                    color: "text-[#22c55e]"
                  },
                  {
                    title: "Costos y Presupuestos",
                    desc: "Modelos financieros, food cost y presupuestos para proteger margen y rentabilidad.",
                    color: "text-yellow-400"
                  },
                  {
                    title: "Auditorias B.P.M y Seguridad Alimentaria",
                    desc: "Auditorias tecnicas de calidad e inocuidad con enfoque en cumplimiento y mejora continua.",
                    color: "text-[#d946ef]"
                  }
                ].map((service) => (
                  <article key={service.title} className="glass-master rounded-[24px] p-6 border border-white/10">
                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${service.color}`}>Servicio</p>
                    <h3 className="mt-3 text-xl font-black uppercase italic text-white">{service.title}</h3>
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{service.desc}</p>
                  </article>
                ))}
              </section>
            </>
          )}

          {activeTab === "receta" && (
            <>
          {/* ARQUITECTURA DE INSUMOS */}
          <section className="glass-master rounded-[35px] overflow-hidden border border-white/5 shadow-2xl print:rounded-xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center gap-4 no-print">
              <Calculator size={18} className="text-[#06b6d4]" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] italic text-zinc-400">Desglose de Arquitectura</h2>
            </div>
            
            <div className="p-8 print:p-4">
              <div className="grid grid-cols-12 gap-4 mb-8 px-4 border-b border-white/5 pb-6 print:mb-4 print:pb-2">
                <div className="col-span-4 label-yellow">Insumo Técnico</div>
                <div className="col-span-2 label-yellow text-center">Und</div>
                <div className="col-span-2 label-yellow text-center">Cant</div>
                <div className="col-span-2 label-yellow text-right">V. Unit</div>
                <div className="col-span-2 label-yellow text-right">V. Total</div>
              </div>

              <div className="space-y-4 print:space-y-2">
                {ingredientes.map((ing) => (
                  <div key={ing.id} className="grid grid-cols-12 gap-4 items-center group relative">
                    <div className="col-span-4">
                      <div className="grid grid-cols-12 gap-2">
                        <select className="input-tech col-span-4 p-3 rounded-xl text-[10px] font-black uppercase bg-[#0a0a0a] no-print" value={ing.tipo} onChange={(e) => cambiarTipoIngrediente(ing.id, e.target.value)}>
                          <option value="insumo">Insumo</option>
                          <option value="subreceta">Subreceta</option>
                        </select>
                        {ing.tipo === "insumo" ? (
                          <input className="input-tech col-span-8 w-full p-4 rounded-xl text-white font-bold text-lg print:p-0 print:text-sm" placeholder="Nombre..." value={ing.nombre} onChange={(e) => updateIng(ing.id, 'nombre', e.target.value)} />
                        ) : (
                          <select className="input-tech col-span-8 w-full p-4 rounded-xl text-white font-bold text-sm uppercase bg-[#0a0a0a]" value={ing.subRecetaId} onChange={(e) => updateIng(ing.id, "subRecetaId", e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {resumenSubRecetas.map((s) => (
                              <option key={s.id} value={s.id}>{s.nombre || `Subreceta ${s.id}`}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      {ing.tipo === "insumo" ? (
                        <select className="input-tech w-full p-4 rounded-xl text-center text-xs font-black uppercase bg-[#0a0a0a] print:p-0" value={ing.unidad} onChange={(e) => updateIng(ing.id, 'unidad', e.target.value)}>
                          <option value="GR">GR</option><option value="ML">ML</option><option value="UN">UN</option><option value="KG">KG</option><option value="LT">LT</option>
                        </select>
                      ) : (
                        <div className="input-tech w-full p-4 rounded-xl text-center text-xs font-black uppercase">UN</div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <input type="number" className="input-tech w-full p-4 rounded-xl text-center font-black text-xl text-[#06b6d4] mono print:p-0 print:text-sm" value={ing.cant} onChange={(e) => updateIng(ing.id, 'cant', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      {ing.tipo === "insumo" ? (
                        <input type="number" className="input-tech w-full p-4 rounded-xl text-right font-black text-xl text-white mono print:p-0 print:text-sm" value={ing.precio} onChange={(e) => updateIng(ing.id, 'precio', e.target.value)} />
                      ) : (
                        <div className="input-tech w-full p-4 rounded-xl text-right font-black text-xl text-white mono print:p-0 print:text-sm">
                          ${Math.round(resumenSubRecetas.find((s) => String(s.id) === String(ing.subRecetaId))?.costoUnitario || 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="flex-1 text-right font-black text-xl text-[#22c55e] mono bg-[#22c55e]/5 p-4 rounded-xl border border-[#22c55e]/10 print:text-black print:p-0 print:border-none">
                        ${(
                          ing.tipo === "subreceta"
                            ? Number(ing.cant) * Number(resumenSubRecetas.find((s) => String(s.id) === String(ing.subRecetaId))?.costoUnitario || 0)
                            : Number(ing.cant) * Number(ing.precio)
                        ).toLocaleString()}
                      </div>
                      <button onClick={() => eliminarFila(ing.id)} className="p-2 text-zinc-800 hover:text-[#d946ef] transition-all no-print"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={agregarFila} className="w-full mt-10 py-6 border border-dashed border-[#06b6d4]/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500/40 hover:text-[#06b6d4] hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-4 no-print">
                <Plus size={18} /> Inyectar Insumo
              </button>
            </div>
          </section>

          {/* ALGORITMO DE CONTROL */}
          <section className="glass-master neon-border-verde p-10 rounded-[40px] print:p-6 print:rounded-xl">
            <h3 className="text-[#22c55e] text-[11px] font-black uppercase tracking-[0.5em] italic flex items-center gap-3 mb-8 border-b border-white/5 pb-6 no-print">
              <ShieldCheck size={18} /> Algoritmo de Control Maestro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 print:flex print:justify-between print:gap-4">
              {[
                { label: "M. Error %", k: "error", c: "text-[#06b6d4]" },
                { label: "Porciones", k: "rendimiento", c: "text-[#06b6d4]" },
                { label: "FC Target %", k: "target", c: "text-[#d946ef]" },
                { label: "Impuesto %", k: "tax", c: "text-[#d946ef]" }
              ].map((p) => (
                <div key={p.k} className="space-y-4 print:space-y-0 print:text-center">
                  <label className="label-yellow print:text-[8px] print:block print:mb-1">{p.label}</label>
                  <input type="number" className={`input-tech w-full p-6 rounded-2xl font-black text-4xl mono ${p.c} print:p-0 print:text-lg`} value={params[p.k]} onChange={(e) => setParams({...params, [p.k]: e.target.value})} />
                </div>
              ))}
            </div>
          </section>

          {/* RESULTADOS FINALES MAESTROS */}
          <section className="glass-master neon-border-magenta p-12 rounded-[50px] relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 print:flex-row print:p-8 print:rounded-xl">
            <div className="relative z-10 w-full md:w-1/3 print:w-auto">
              <span className="text-zinc-600 text-[11px] font-black uppercase tracking-[0.6em] italic mb-4 block print:mb-1 print:text-[9px]">Costo x Porción</span>
              <h2 className={`text-6xl font-black italic tracking-tighter mono print:text-2xl print:text-black ${sobrepasoCMP ? 'text-red-500' : 'text-white'}`}>
                <span className="text-[#d946ef] print:text-black">$</span>{Math.round(costoPorcion).toLocaleString()}
              </h2>
              {sobrepasoCMP && <p className="text-red-500 text-[10px] font-black uppercase mt-2 no-print animate-pulse">Exceso sobre CMP detectado</p>}
            </div>

            <div className="h-px md:h-24 w-full md:w-px bg-white/10 relative z-10 no-print"></div>

            <div className="relative z-10 w-full md:w-1/2 text-right print:w-auto print:text-left">
              <span className="text-[#d946ef] text-[11px] font-black uppercase tracking-[0.8em] italic mb-6 block print:mb-1 print:text-[9px] print:text-black">Precio Sugerido Final</span>
              <div className="flex items-baseline justify-end gap-3 print:justify-start">
                <span className="text-4xl font-bold text-zinc-800 mono no-print">$</span>
                <h2 className="text-[100px] font-black text-white italic tracking-tighter leading-none mono print:text-4xl print:text-black">
                  ${precioFinalRedondeado.toLocaleString()}
                </h2>
              </div>
            </div>
          </section>
            </>
          )}

        </main>

        <footer className="max-w-[1600px] mx-auto mt-20 mb-10 text-center opacity-30 italic tracking-[1em] text-[10px] uppercase no-print">
          Exponiendo la mediocridad de la consultoría tradicional
        </footer>

        {/* FOOTER PDF RECONSTRUIDO CON CLARIDAD */}
        <div className="footer-pdf">
          <p className="font-black uppercase tracking-widest text-[10px]">NÓMADA CONSULTORÍAS GASTRONÓMICAS</p>
          <p className="mt-1 opacity-80 text-[8px]">"Mientras ellos adivinan nosotros ejecutamos."</p>
          <p className="mt-2 text-[7px] uppercase tracking-widest">INGENIERÍA DE MENÚ: {clasificacion.label} — {new Date().toLocaleDateString()}</p>
          <p className="mt-1 text-[7px] uppercase tracking-widest">FOOD COST REAL: {foodCostReal.toFixed(1)}% | CMP ESTABLECIDO: ${Number(costoMaximo).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default App;




