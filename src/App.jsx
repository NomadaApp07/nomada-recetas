import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const App = () => {
  // NÚCLEO NÓMADA - CONFIGURACIÓN DE CONEXIÓN MAESTRA
  const [config] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('nomada_url'),
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('nomada_key')
  });

  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ESTADOS DE INGENIERÍA GASTRONÓMICA - DESARROLLO POR ESTEBAN
  const [nombreReceta, setNombreReceta] = useState("");
  const [ingredientes, setIngredientes] = useState([{ nombre: "", unidad: "", cant: "", precio: "" }]);
  const [porciones, setPorciones] = useState(1);
  const [margenError, setMargenError] = useState(5); 
  const [costoObjetivo, setCostoObjetivo] = useState(30); 
  const [iva, setIva] = useState(19); 

  // PROTOCOLO DE CONEXIÓN MAESTRA
  useEffect(() => {
    if (config.url && config.key) {
      const client = createClient(config.url, config.key);
      setSupabase(client);
      localStorage.setItem('nomada_url', config.url);
      localStorage.setItem('nomada_key', config.key);
      client.auth.getSession().then(({ data: { session } }) => setSession(session));
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => setSession(session));
      return () => subscription.unsubscribe();
    }
  }, [config]);

  // ALGORITMOS DE CÁLCULO NÓMADA
  const calcularFila = (c, p) => Math.round((parseFloat(c) || 0) * (parseFloat(p) || 0));
  const costoTotalIngredientes = ingredientes.reduce((acc, i) => acc + calcularFila(i.cant, i.precio), 0);
  const valorMargenError = Math.round(costoTotalIngredientes * (margenError / 100));
  const costoTotalPreparacion = costoTotalIngredientes + valorMargenError;
  const costoPorPorcion = Math.round(costoTotalPreparacion / (porciones || 1));
  const precioPotencialVenta = costoPorPorcion / (costoObjetivo / 100);
  const valorIva = precioPotencialVenta * (iva / 100);
  const precioCarta = Math.ceil((precioPotencialVenta + valorIva) / 100) * 100;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!supabase) return alert("SISTEMA NO INICIALIZADO");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("ACCESO DENEGADO - VERIFIQUE CREDENCIALES");
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-zinc-300">
        <div className="w-full max-w-[400px] bg-[#0D0D0D] border border-white/5 p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.7)]"></div>
          <h1 className="text-4xl font-black text-white text-center mb-1 tracking-tighter italic uppercase">NÓMADA</h1>
          <p className="text-[9px] tracking-[0.4em] text-zinc-500 text-center mb-10 uppercase italic font-bold">Exponiendo la mediocridad de la consultoría tradicional</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input className="w-full bg-[#050505] border border-white/5 p-5 rounded-2xl text-white text-sm outline-none focus:border-blue-600 transition-all placeholder:text-zinc-800" type="email" placeholder="USUARIO OPERATIVO" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full bg-[#050505] border border-white/5 p-5 rounded-2xl text-white text-sm outline-none focus:border-blue-600 transition-all placeholder:text-zinc-800" type="password" placeholder="CONTRASEÑA" value={password} onChange={e => setPassword(e.target.value)} required />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-500 transition-all">
              {loading ? "SINCRONIZANDO..." : "EJECUTAR ACCESO"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080A] text-zinc-300 font-sans selection:bg-blue-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap');
        body { background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0); background-size: 40px 40px; background-attachment: fixed; }
        .nomada-shimmer { background: linear-gradient(180deg, #FFFFFF 0%, #71717A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass-card { background: rgba(13, 13, 15, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .blue-panel { background: linear-gradient(145deg, #1D4ED8 0%, #111827 100%); box-shadow: 0 40px 100px -20px rgba(29, 78, 216, 0.4); }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        @media print { .no-print { display: none !important; } .print-area { width: 100% !important; color: black !important; background: white !important; } }
      `}</style>

      <nav className="no-print border-b border-white/5 glass-card sticky top-0 z-50">
        <div className="max-w-[1550px] mx-auto px-10 h-28 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black nomada-shimmer tracking-tighter italic leading-none uppercase">NÓMADA</h1>
            <p className="text-[10px] tracking-[0.6em] text-blue-500 uppercase font-black mt-2">Mientras ellos adivinan nosotros ejecutamos</p>
          </div>
          <div className="flex gap-8 items-center">
            <button onClick={() => window.print()} className="bg-white/5 border border-white/10 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">Generar Reporte Maestro</button>
            <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold text-zinc-700 uppercase hover:text-red-500 transition-all">Desconectar</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1550px] mx-auto px-10 py-16 print-area">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <div className="glass-card p-14 rounded-[55px] border-l-[12px] border-blue-600 shadow-2xl">
               <span className="text-zinc-500 font-black text-[12px] tracking-[0.6em] uppercase mb-4 block italic">Ingeniería de Producto / Esteban</span>
               <input className="w-full bg-transparent text-8xl font-black text-white outline-none tracking-tighter placeholder:text-zinc-900 uppercase italic" placeholder="NOMBRE DEL PLATO..." value={nombreReceta} onChange={e => setNombreReceta(e.target.value)} />
            </div>

            <div className="glass-card rounded-[55px] overflow-hidden shadow-2xl border border-white/5">
              <div className="grid grid-cols-12 gap-6 bg-white/[0.04] p-10 text-[11px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                <div className="col-span-4">Insumo / Materia Prima</div>
                <div className="col-span-2 text-center">Unidad</div>
                <div className="col-span-2 text-center">Cant.</div>
                <div className="col-span-2 text-right">Vr. Unitario</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              <div className="p-8 space-y-4">
                {ingredientes.map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-6 p-6 rounded-[35px] items-center transition-all bg-white/[0.01] hover:bg-white/[0.05] border border-transparent hover:border-white/5 group">
                    <div className="col-span-4"><input className="w-full bg-transparent text-white text-2xl font-bold outline-none placeholder:text-zinc-900" placeholder="Componente..." value={ing.nombre} onChange={e => { const n = [...ingredientes]; n[idx].nombre = e.target.value; setIngredientes(n); }} /></div>
                    <div className="col-span-2 flex justify-center"><input className="w-24 bg-black/50 p-4 rounded-2xl text-zinc-500 text-center text-[11px] font-black outline-none border border-white/5 uppercase" placeholder="UND" value={ing.unidad} onChange={e => { const n = [...ingredientes]; n[idx].unidad = e.target.value; setIngredientes(n); }} /></div>
                    <div className="col-span-2 flex justify-center"><input type="number" className="w-28 bg-black/70 p-4 rounded-2xl text-white text-center text-2xl font-black outline-none border border-white/5 focus:border-blue-600 mono-font" value={ing.cant} onChange={e => { const n = [...ingredientes]; n[idx].cant = e.target.value; setIngredientes(n); }} /></div>
                    <div className="col-span-2 text-right px-2"><input type="number" className="bg-transparent text-zinc-600 text-sm font-bold text-right outline-none w-28" placeholder="0" value={ing.precio} onChange={e => { const n = [...ingredientes]; n[idx].precio = e.target.value; setIngredientes(n); }} /></div>
                    <div className="col-span-2 text-right"><span className="text-white text-4xl font-black italic tracking-tighter mono-font">${calcularFila(ing.cant, ing.precio).toLocaleString()}</span></div>
                  </div>
                ))}
                <button onClick={() => setIngredientes([...ingredientes, { nombre: "", unidad: "", cant: "", precio: "" }])} className="no-print w-full py-10 text-[12px] font-black text-zinc-700 hover:text-white transition-all uppercase tracking-[0.8em] border border-dashed border-white/10 mt-10 rounded-[45px]">
                  + Sincronizar Nuevo Componente Maestro
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-12">
            <div className="glass-card p-12 rounded-[55px] space-y-10 shadow-2xl">
               <h3 className="text-[13px] font-black text-blue-500 uppercase tracking-[0.5em] border-b border-white/5 pb-8 italic">Algoritmo de Control</h3>
               <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: "Margen Error %", val: margenError, set: setMargenError },
                    { label: "Rendimiento #", val: porciones, set: setPorciones },
                    { label: "Food Cost Target %", val: costoObjetivo, set: setCostoObjetivo },
                    { label: "IVA / IMP %", val: iva, set: setIva }
                  ].map((item, i) => (
                    <div key={i} className="space-y-4">
                      <label className="text-[11px] font-black text-zinc-600 uppercase tracking-tighter">{item.label}</label>
                      <input type="number" className="w-full bg-black/70 p-6 rounded-3xl text-white font-black text-4xl outline-none border border-white/5 focus:border-blue-600 transition-all mono-font" value={item.val} onChange={item.set} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="blue-panel p-16 rounded-[75px] flex flex-col justify-center relative overflow-hidden min-h-[620px] shadow-3xl">
                <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none select-none no-print"><h1 className="text-[300px] font-black italic tracking-tighter leading-none uppercase">NMD</h1></div>
                <div className="space-y-20 relative z-10">
                  <div className="border-b border-white/20 pb-14 text-center lg:text-left">
                    <span className="text-[16px] font-black uppercase tracking-[0.6em] text-blue-200 italic block mb-6">Costo de Ejecución</span>
                    <span className="text-7xl font-black italic tracking-tighter text-white mono-font">${costoPorPorcion.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 text-center lg:text-left">
                    <p className="text-[16px] font-black uppercase tracking-[0.8em] text-white/60 mb-8 italic">Precio Sugerido Venta</p>
                    <h2 className="text-[140px] font-black italic tracking-tighter text-white leading-none drop-shadow-3xl mono-font">${precioCarta.toLocaleString()}</h2>
                  </div>
                </div>
                <button className="no-print w-full bg-black text-white py-10 rounded-[40px] font-black uppercase text-[13px] tracking-[0.6em] mt-20 transition-all shadow-3xl hover:bg-zinc-900 active:scale-95 shadow-black/50">Finalizar Ingeniería</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;