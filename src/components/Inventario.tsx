import { useState, useMemo, useRef, useEffect } from 'react';

// --- TIPOS ---
interface InventoryProduct {
  id: number;
  code: string;
  name: string;
  stock: number;
  cost: number;
  price: number;
}

// --- BASE DE DATOS FALSA DE INVENTARIO ---
const INITIAL_INVENTORY: InventoryProduct[] = [
  { id: 1, code: '101', name: 'Coca Cola 3L', stock: 50, cost: 9.00, price: 12.00 },
  { id: 2, code: '102', name: 'Galletas Oreo', stock: 15, cost: 1.50, price: 2.50 },
  { id: 3, code: '103', name: 'Arroz Costeño 1kg', stock: 5, cost: 3.50, price: 4.80 },
  { id: 4, code: '104', name: 'Aceite Primor', stock: 22, cost: 7.00, price: 9.50 },
  { id: 5, code: '105', name: 'Inca Kola 1.5L', stock: 80, cost: 4.00, price: 6.50 },
  { id: 6, code: '106', name: 'Leche Gloria', stock: 10, cost: 3.00, price: 4.00 },
];

export function Inventario() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const inputRef = useRef<HTMLInputElement>(null);

  // Efecto para escuchar atajos de teclado y enfocar input
  useEffect(() => {
    inputRef.current?.focus();
    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, []);


  // --- LÓGICA DE INVENTARIO ---

  const adjustStock = () => { // Ajustar Stock (A)
    const productCode = prompt('Ingresa el CÓDIGO del producto a ajustar:');
    if (!productCode) return;

    const newStock = prompt('Ingresa la NUEVA cantidad de stock:');
    const quantity = parseInt(newStock || '0');

    if (quantity >= 0) {
        setInventory(prev => prev.map(p => {
            if (p.code === productCode) {
                return { ...p, stock: quantity };
            }
            return p;
        }));
        alert(`Stock del producto ${productCode} actualizado a ${quantity}.`);
    } else if (newStock !== null) {
         alert('Cantidad inválida.');
    }
  };

  const handleHotkeys = (e: KeyboardEvent) => {
    // Si estamos en un input de texto, solo permitimos F5/Enter para no interferir
    const target = e.target as HTMLElement;
    if (target.matches('input') || target.matches('textarea') || target.matches('button')) {
        if (e.key === 'F5' || e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.focus();
        }
        return; 
    }
    
    switch (e.key) {
        case 'F5': case 'Enter': e.preventDefault(); inputRef.current?.focus(); break; // Enfocar Buscador
        case 'F6': e.preventDefault(); alert('Formulario: Añadir Nuevo Producto (F6)'); break; // Nuevo Producto
        case 'a': case 'A': e.preventDefault(); adjustStock(); break; // Ajustar Stock
        case 'r': case 'R': e.preventDefault(); alert('Generando Reporte de Stock Actual (R)...'); break; // Reporte
        case 't': case 'T': e.preventDefault(); alert('Módulo de Transferencia entre Almacenes (T)...'); break; // Transferencia
        case 'F1': e.preventDefault(); alert('Ayuda / Manual de Inventario (F1)'); break; // Ayuda
    }
  };


  // --- CÁLCULOS Y FILTRADO ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return inventory;
    const term = searchTerm.toLowerCase();
    return inventory.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.code.includes(term)
    );
  }, [searchTerm, inventory]);

  const totalProducts = inventory.length;
  const totalStock = inventory.reduce((sum, p) => sum + p.stock, 0);

  // Estilo base para los botones de la barra derecha
  const actionButtonStyle: React.CSSProperties = {
    width: '100%', padding: '15px 10px', fontSize: '1rem', 
    fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', 
    border: 'none', marginBottom: '10px', color: 'white', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'background 0.2s'
  };


  // --- RENDERIZADO DE LA INTERFAZ ---
  return (
    <div style={{ display: 'flex', height: '100%', color: '#333' }}>
      
      {/* --- SECCIÓN PRINCIPAL (TABLA Y BÚSQUEDA) --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', borderRight: '1px solid #eee' }}>
        
        {/* HEADER Y ESTADÍSTICAS */}
        <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
          <h3 style={{ margin: 0, color: '#1b4332' }}>Gestión de Almacén</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            <span> SKU Únicos: <strong style={{color: '#1b4332'}}>{totalProducts}</strong></span>
            <span> Stock Total: <strong style={{color: '#1b4332'}}>{totalStock}</strong> unidades</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>
              [F5/Enter] Buscar | [F6] Nuevo Producto | [A] Ajustar Stock
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto por nombre o código..." 
            style={{ 
              flex: 1, padding: '10px', borderRadius: '6px', 
              border: '1px solid #ccc', fontSize: '1rem', outline: 'none'
            }} 
          />
          <button 
            onClick={() => alert('Próximamente: Añadir Nuevo Producto')}
            style={{ 
              padding: '0 20px', background: '#1976d2', color: 'white', 
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
            }}
            title="Atajo: F6"
          >
            + Nuevo (F6)
          </button>
        </div>

        {/* TABLA DE INVENTARIO */}
        <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              <tr style={{ textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>
                <th style={{ padding: '12px', width: '10%' }}>CÓDIGO</th>
                <th style={{ padding: '12px', width: '35%' }}>PRODUCTO</th>
                <th style={{ padding: '12px', width: '15%', textAlign: 'center' }}>STOCK</th>
                <th style={{ padding: '12px', width: '15%', textAlign: 'right' }}>COSTO</th>
                <th style={{ padding: '12px', width: '15%', textAlign: 'right' }}>PRECIO VENTA</th>
                <th style={{ padding: '12px', width: '10%', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => (
                <tr key={item.id} style={{ 
                    borderBottom: '1px solid #eee', 
                    // Resaltar bajo stock
                    background: item.stock < 10 ? '#fff3e0' : 'white' 
                }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.code}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    {item.stock < 10 && <span style={{ fontSize: '0.75rem', color: '#f57c00' }}>⚠️ ¡Bajo Stock!</span>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: item.stock < 10 ? '#dc3545' : '#1b4332' }}>
                    {item.stock}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>${item.cost.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>${item.price.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => alert(`Editando ${item.name}`)}
                      style={{ border: 'none', background: 'transparent', color: '#1976d2', cursor: 'pointer', fontSize: '0.9rem' }}
                      title="Editar Producto"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>No se encontraron productos con ese criterio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      
      {/* --- BARRA LATERAL DERECHA (ACCIONES RÁPIDAS) --- */}
      <aside style={{ width: '220px', padding: '20px', background: '#f8f9fa', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ddd' }}>
          <h4 style={{ color: '#1b4332', marginTop: '0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Atajos</h4>

          {/* AJUSTAR STOCK */}
          <button 
              onClick={adjustStock} 
              style={{ ...actionButtonStyle, background: '#ffc107', color: '#333' }}
              title="Atajo: A"
          >
              AJUSTAR STOCK (A)
          </button>

          {/* TRANSFERENCIA */}
          <button 
              onClick={() => alert('Módulo de Transferencia (T)')} 
              style={{ ...actionButtonStyle, background: '#1976d2' }}
              title="Atajo: T"
          >
              TRANSFERIR (T)
          </button>

          {/* GENERAR REPORTE */}
          <button 
              onClick={() => alert('Generando Reporte (R)...')} 
              style={{ ...actionButtonStyle, background: '#28a745' }}
              title="Atajo: R"
          >
              REPORTE (R)
          </button>

          {/* AYUDA */}
          <button 
              onClick={() => alert('Ayuda/Manual (F1)')} 
              style={{ ...actionButtonStyle, background: '#6c757d', marginTop: 'auto' }}
              title="Atajo: F1"
          >
              AYUDA (F1)
          </button>

      </aside>
    </div>
  );
}