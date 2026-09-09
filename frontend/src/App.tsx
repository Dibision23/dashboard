import React, { useState, useEffect } from 'react'

interface Item {
  id: number
  titulo: string
  descripcion?: string
}

// Toma la URL del .env o usa localhost:8000 por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener los registros desde FastAPI
  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/api/items`)
      if (!res.ok) throw new Error('Error al conectar con la API')
      const data = await res.json()
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Función para enviar un nuevo elemento a la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) return

    try {
      const res = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion }),
      })
      if (!res.ok) throw new Error('Error al guardar el elemento')
      
      setTitulo('')
      setDescripcion('')
      fetchItems() // Refresca la lista
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 16px' }}>
      <h1>Panel de Registros (React + FastAPI)</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Título del elemento"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          required
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
        >
          Guardar en Base de Datos
        </button>
      </form>

      <h2>Lista de Registros</h2>
      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && items.length === 0 && <p>No hay registros creados aún. ¡Crea el primero!</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8, background: '#f9fafb' }}>
            <strong style={{ color: '#111827' }}>{item.titulo}</strong>
            {item.descripcion && <p style={{ margin: '6px 0 0 0', color: '#4b5563' }}>{item.descripcion}</p>}
          </li>
        ))}
      </ul>
    </main>
  )
}