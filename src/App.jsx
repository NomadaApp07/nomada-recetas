import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'merchantPosts'
const tipoOpciones = [
  { value: 'venta', label: 'Venta' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'receta', label: 'Receta' },
]
const tipoLabel = {
  venta: 'Venta realizada',
  inventario: 'Movimiento de inventario',
  receta: 'Receta estándar',
}
const tipoPlaceholder = {
  venta: 'Ej: 25 tacos vendidos por $1250, o 10 vasos de jugo por $80',
  inventario: 'Ej: 20 panes, 5 litros de aceite, 12 bolsas de tortillas',
  receta: 'Ej: receta de taco al pastor con ingredientes y preparación',
}

function App() {
  const [posts, setPosts] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [form, setForm] = useState({ nombre: '', negocio: '', tipo: 'venta', titulo: '', detalle: '', monto: '', contacto: '' })
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [error, setError] = useState('')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts])

  const filteredPosts = filtroTipo === 'todos' ? posts : posts.filter((post) => post.tipo === filtroTipo)
  const totalVentas = posts.reduce((sum, post) => sum + (post.tipo === 'venta' ? Number(post.monto || 0) : 0), 0)
  const totalByType = {
    venta: posts.filter((post) => post.tipo === 'venta').length,
    inventario: posts.filter((post) => post.tipo === 'inventario').length,
    receta: posts.filter((post) => post.tipo === 'receta').length,
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.nombre.trim() || !form.negocio.trim() || !form.titulo.trim() || !form.detalle.trim()) {
      setError('Completa nombre, negocio, título y detalles antes de publicar.')
      return
    }
    if (form.tipo === 'venta' && !form.monto.trim()) {
      setError('Agrega el monto de la venta para calcular los totales.')
      return
    }

    const nuevoPost = {
      id: Date.now(),
      ...form,
      monto: form.tipo === 'venta' ? parseFloat(form.monto) || 0 : 0,
      fecha: new Date().toLocaleString(),
    }

    setPosts((prev) => [nuevoPost, ...prev])
    setForm({ nombre: '', negocio: '', tipo: 'venta', titulo: '', detalle: '', monto: '', contacto: '' })
    setError('')
  }

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id))
  }

  return (
    <div className="app-container">
      <header className="hero">
        <div>
          <span className="label">Vendedores de comida</span>
          <h1>Registra ventas, inventarios y recetas</h1>
          <p>
            Software ligero para pequeños puestos y cocineros ambulantes. Lleva el control de tus ventas, organiza tu stock y guarda recetas estandarizadas con facilidad.
          </p>
        </div>
        <div className="hero-stats">
          <article className="stat-card">
            <span>Ventas registradas</span>
            <strong>{totalByType.venta}</strong>
          </article>
          <article className="stat-card">
            <span>Movimientos inventario</span>
            <strong>{totalByType.inventario}</strong>
          </article>
          <article className="stat-card">
            <span>Recetas guardadas</span>
            <strong>{totalByType.receta}</strong>
          </article>
          <article className="stat-card">
            <span>Total ventas</span>
            <strong>${totalVentas.toFixed(2)}</strong>
          </article>
        </div>
      </header>

      <section className="content">
        <div className="form-card">
          <h2>Nuevo registro</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre del vendedor
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre" />
            </label>

            <label>
              Nombre del negocio
              <input
                type="text"
                name="negocio"
                value={form.negocio}
                onChange={handleChange}
                placeholder="Ej: Tacos La Esquina" />
            </label>

            <label>
              Tipo de registro
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                {tipoOpciones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Título
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej: Venta de hoy / Stock de tortillas" />
            </label>

            <label>
              {tipoLabel[form.tipo]}
              <textarea
                name="detalle"
                value={form.detalle}
                onChange={handleChange}
                placeholder={tipoPlaceholder[form.tipo]}
                rows="5" />
            </label>

            {form.tipo === 'venta' && (
              <label>
                Monto de la venta
                <input
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Ej: 1250.00" />
              </label>
            )}

            <label>
              Contacto (opcional)
              <input
                type="text"
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
                placeholder="Teléfono, WhatsApp o dirección" />
            </label>

            {error && <p className="error">{error}</p>}
            <button type="submit">Guardar registro</button>
          </form>
        </div>

        <div className="posts-card">
          <div className="posts-header">
            <div>
              <h2>Registros recientes</h2>
              <div className="summary-row">
                <span>Total: {posts.length}</span>
                <span>Ventas: {totalByType.venta}</span>
                <span>Inventario: {totalByType.inventario}</span>
                <span>Recetas: {totalByType.receta}</span>
                <span>Total ventas: ${totalVentas.toFixed(2)}</span>
              </div>
            </div>
            <div className="posts-controls">
              <label>
                Filtrar por tipo
                <select value={filtroTipo} onChange={(event) => setFiltroTipo(event.target.value)}>
                  <option value="todos">Todos</option>
                  {tipoOpciones.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="csv-button" onClick={() => {
                const headers = ['Fecha', 'Tipo', 'Negocio', 'Vendedor', 'Título', 'Detalle', 'Contacto', 'Monto']
                const rows = filteredPosts.map((post) => [
                  post.fecha,
                  tipoOpciones.find((option) => option.value === post.tipo)?.label || post.tipo,
                  post.negocio,
                  post.nombre,
                  post.titulo,
                  post.detalle,
                  post.contacto || '',
                  post.tipo === 'venta' ? Number(post.monto || 0).toFixed(2) : '',
                ])
                const csv = [headers, ...rows]
                  .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
                  .join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'registros_comida.csv'
                link.click()
                URL.revokeObjectURL(url)
              }}>
                Exportar CSV
              </button>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <p className="empty-state">No hay registros en este filtro. Cambia el tipo o añade un nuevo registro.</p>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="post-item">
                  <div className="post-header">
                    <div>
                      <strong>{post.titulo}</strong>
                      <p className="post-owner">{post.negocio} · Por {post.nombre}</p>
                    </div>
                    <div className="post-meta">
                      <span className={`post-type post-type-${post.tipo}`}>
                        {tipoOpciones.find((option) => option.value === post.tipo)?.label || 'Registro'}
                      </span>
                      <span>{post.fecha}</span>
                    </div>
                  </div>
                  <p className="post-detail">{post.detalle || post.mensaje}</p>
                  {post.tipo === 'venta' && post.monto != null && (
                    <p className="post-amount">Monto: ${Number(post.monto || 0).toFixed(2)}</p>
                  )}
                  {post.contacto && <p className="post-contacto">Contacto: {post.contacto}</p>}
                  <button className="delete-button" onClick={() => handleDelete(post.id)}>
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
