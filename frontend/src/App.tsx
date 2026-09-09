import { useState, useEffect, type FormEvent } from 'react';


export interface Position {
  id: number;
  ticker: string;
  asset_name: string;
  purchase_price: number;
  quantity: number;
  current_price: number | null;
  daily_change_pct: number | null;
}

// Toma la URL del .env o usa localhost:8000 por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el nuevo formulario
  const [ticker, setTicker] = useState('');
  const [assetName, setAssetName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/portfolio`);
      if (!response.ok) throw new Error('Error al cargar el portafolio');
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const newPosition = {
      ticker: ticker.toUpperCase(),
      asset_name: assetName,
      purchase_price: parseFloat(purchasePrice),
      quantity: parseFloat(quantity),
      purchase_date: purchaseDate
    };
    try {
      const response = await fetch(`${API_URL}/api/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPosition),
      });

      if (!response.ok) throw new Error('Error al guardar el instrumento');
      
      // Limpiar el formulario
      setTicker('');
      setAssetName('');
      setPurchasePrice('');
      setQuantity('');
      setPurchaseDate('');
      
      // Recargar la tabla para mostrar el nuevo registro y sus cálculos actualizados
      fetchPortfolio();
      
    } catch (err) {
      alert('Hubo un problema al agregar el instrumento');
    }
  };

  
  const handleDelete = async (id: number) => {
    // Confirmación simple para evitar borrados accidentales
    if (!window.confirm('¿Estás seguro de que deseas eliminar este instrumento?')) return;

    try {
      const response = await fetch(`${API_URL}/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el instrumento');
      
      // Actualizamos el estado local filtrando el elemento eliminado
      // Esto es más rápido que volver a hacer un fetchPortfolio()
      setPositions(prevPositions => prevPositions.filter(pos => pos.id !== id));
      
    } catch (err) {
      alert('Hubo un problema al intentar eliminar el instrumento.');
    }
  };

  if (isLoading && positions.length === 0) {
    return <div>Despertando el servidor (puede tomar hasta 50 segundos)...</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard de Inversiones</h1>

      {/* FORMULARIO DE INGRESO */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
        <h3>Agregar Instrumento</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Ticker (Ej: AAPL)" 
            value={ticker} 
            onChange={(e) => setTicker(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Nombre del activo" 
            value={assetName} 
            onChange={(e) => setAssetName(e.target.value)} 
            required 
          />
          <input 
            type="number" 
            step="0.01" 
            placeholder="Precio de compra" 
            value={purchasePrice} 
            onChange={(e) => setPurchasePrice(e.target.value)} 
            required 
          />
          <input 
            type="number" 
            step="0.0001" 
            placeholder="Cantidad" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            required 
          />
          <input 
            type="date" 
            value={purchaseDate} 
            onChange={(e) => setPurchaseDate(e.target.value)} 
            required 
          />
          <button type="submit">Agregar</button>
        </form>
      </div>
      
      {/* TABLA DE RESULTADOS */}
      {error && <div style={{color: 'red'}}>{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Nombre</th>
            <th>Numero de acciones</th>
            <th>Precio Compra</th>
            <th>Precio Actual</th>
            <th>Variación Diaria (%)</th>
            <th>¿Eliminar?</th> {/* Nueva columna */}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id}>
              <td>{pos.ticker}</td>
              <td>{pos.asset_name}</td>
              <td>{pos.quantity}</td>
              <td>${pos.purchase_price}</td>
              <td>${pos.current_price ?? 'N/D'}</td>
              <td style={{ color: (pos.daily_change_pct ?? 0) >= 0 ? 'green' : 'red' }}>
                {pos.daily_change_pct !== null ? `${pos.daily_change_pct}%` : 'N/D'}
              </td>
              <td>
                {/* Botón de borrado que llama a handleDelete con el ID del registro */}
                <button 
                  onClick={() => handleDelete(pos.id)}
                  style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
