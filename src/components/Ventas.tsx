import { useState, useRef, useEffect } from 'react';

// --- TIPOS ---
interface Product {
  code: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

// --- BASE DE DATOS FALSA ---
const MOCK_DB: Product[] = [
  { code: '101', name: 'Coca Cola 3L', price: 12.00 },
  { code: '102', name: 'Galletas Oreo', price: 2.50 },
  { code: '103', name: 'Arroz Costeño 1kg', price: 4.80 },
  { code: '104', name: 'Aceite Primor', price: 9.50 },
  { code: '105', name: 'Inca Kola 1.5L', price: 6.50 },
  { code: '106', name: 'Leche Gloria', price: 4.00 },
];

export function Ventas() {
  // --- ESTADOS DE VENTA ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0); 
  const [isCreditSale, setIsCreditSale] = useState(false); 
  const [documentType, setDocumentType] = useState<'BOLETA' | 'FACTURA' | 'NINGUNO'>('BOLETA');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Efectos de montaje (enfocar input, escuchar atajos)
  useEffect(() => {
    inputRef.current?.focus();
    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, [cart, isCreditSale, discountPercent, documentType]);

  // --- LÓGICA DE CÁLCULO ---
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getDiscountAmount = () => getSubtotal() * (discountPercent / 100);
  const getTotalSale = () => getSubtotal() - getDiscountAmount();

  // --- ACCIONES RÁPIDAS (HOTKEYS) Y FUNCIONES ---

  const toggleCreditSale = () => { // (1) Vender al crédito
    setIsCreditSale(prev => !prev);
  };
  
  const setDocType = (type: 'BOLETA' | 'FACTURA') => {
      setDocumentType(type);
      alert(`Documento seleccionado: ${type}`);
  };

  const applyDiscount = () => { // Aplicar descuento (D)
    const newDiscount = prompt('Aplicar Descuento (%):', discountPercent.toString());
    if (newDiscount !== null) {
        const percent = Math.min(100, Math.max(0, parseFloat(newDiscount) || 0));
        setDiscountPercent(percent);
    }
  };

  const customerDeposit = () => { // (3) Abono de cliente
    alert('Acción rápida: Ventana de Abono de Cliente simulada.');
  };
  
  const cancelSale = () => { // Cancelar venta (ESC)
    if (cart.length > 0 && confirm('¿Estás seguro de cancelar la venta?')) {
        setCart([]);
        setDiscountPercent(0);
        setIsCreditSale(false);
        setDocumentType('BOLETA');
        alert('Venta cancelada.');
    }
  };

  const handleHotkeys = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.matches('input') || target.matches('textarea') || target.matches('button')) {
        if (e.key === 'Escape') {
             if (document.activeElement === inputRef.current) { setInputValue(''); } else { cancelSale(); }
        }
        return; 
    }
    
    switch (e.key) {
        case '1': e.preventDefault(); toggleCreditSale(); break;
        case '2': e.preventDefault(); setDocType('FACTURA'); break; // Factura (2)
        case '3': e.preventDefault(); customerDeposit(); break; // Abono (3)
        case '4': case 'F3': e.preventDefault(); setDocType('BOLETA'); break; // Boleta (4 o F3)
        case 'd': case 'D': e.preventDefault(); applyDiscount(); break; // Descuento
        case 'F9': e.preventDefault(); handlePay(); break; // Cobrar
        case 'Escape': e.preventDefault(); cancelSale(); break;
    }
  };

  // --- LÓGICA DEL CARRITO ---

  const addToCart = () => {
    if (!inputValue.trim()) return;
    const term = inputValue.toLowerCase();
    const product = MOCK_DB.find(p => p.code === term || p.name.toLowerCase().includes(term));
    if (product) {
      setCart(prev => {
        const exists = prev.find(item => item.code === product.code);
        if (exists) {
          return prev.map(item => item.code === product.code ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      setInputValue(''); 
    } else {
      alert('Producto no encontrado');
    }
  };

  const removeFromCart = (code: string) => { setCart(prev => prev.filter(item => item.code !== code)); };

  const updateQuantity = (code: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.code === code) { return { ...item, quantity: Math.max(1, item.quantity + delta) }; }
      return item;
    }));
  };

  const handlePay = () => {
    if (cart.length === 0) return;
    const status = isCreditSale ? 'a Crédito' : 'Contado';
    const document = documentType === 'NINGUNO' ? 'sin Documento' : documentType;
    alert(`Procesando venta ${status}, Documento: ${document}, por $${getTotalSale().toFixed(2)}. Descuento: ${discountPercent}%`);
    setCart([]);
    setDiscountPercent(0);
    setIsCreditSale(false);
    setDocumentType('BOLETA');
  };

  // --- RENDERIZADO DE LA INTERFAZ ---

  // Estilo genérico para los botones de la barra derecha
  const actionButtonStyle: React.CSSProperties = {
    width: '100%', padding: '15px 10px', fontSize: '1rem', 
    fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', 
    border: 'none', marginBottom: '10px', color: 'white', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };
  
  const docButtonStyle = (type: 'BOLETA' | 'FACTURA') => ({
      ...actionButtonStyle,
      background: documentType === type ? '#1b4332' : '#6c757d',
      transition: 'background 0.2s',
      marginBottom: '5px'
  });

  return (
    <div style={{ display: 'flex', height: '100%', color: '#333' }}>
      
      {/* --- SECCIÓN PRINCIPAL (INPUT Y TABLA) --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', borderRight: '1px solid #eee' }}>
        
        {/* BARRA SUPERIOR DE ESTADO Y ATAJOS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '5px', borderBottom: '1px solid #ddd' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', color: isCreditSale ? '#ff4444' : '#1b4332' }}>
                    {isCreditSale ? 'CRÉDITO (1)' : 'CONTADO (1)'}
                </span>
                <span style={{ fontWeight: 'bold', color: documentType === 'FACTURA' ? '#1976d2' : documentType === 'BOLETA' ? '#2e7d32' : '#666' }}>
                    {documentType}
                </span>
                {discountPercent > 0 && (
                    <span style={{ fontWeight: 'bold', color: '#f57c00' }}>
                        DESC: {discountPercent}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                [ESC] Cancelar | [D] Descuento | [F9] Cobrar
            </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addToCart()}
            placeholder="Código o nombre del producto..." 
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }} 
          />
          <button onClick={addToCart} style={{ padding: '0 20px', background: '#1b4332', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            AGREGAR
          </button>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    {/* ... Encabezados de tabla ... */}
                </thead>
                <tbody>
                    {/* ... Filas de productos ... */}
                    {cart.map((item) => (
                      <tr key={item.code} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}><div style={{ fontWeight: 'bold' }}>{item.name}</div><div style={{ fontSize: '0.8rem', color: '#888' }}>{item.code}</div></td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => updateQuantity(item.code, -1)} style={{ width: '24px', height: '24px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '4px' }}>-</button>
                          <span style={{ margin: '0 10px', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.code, 1)} style={{ width: '24px', height: '24px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '4px' }}>+</button>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => removeFromCart(item.code)} style={{ border: 'none', background: 'transparent', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }} title="Eliminar">×</button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>El carrito está vacío</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* --- SECCIÓN INFERIOR: TOTAL Y DESCUENTO --- */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '2px solid #eee', paddingTop: '15px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px', fontSize: '1rem' }}>
                <span style={{ color: '#666' }}>SUBTOTAL:</span>
                <span style={{ fontWeight: 'bold' }}>${getSubtotal().toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px', fontSize: '1rem', color: '#f57c00' }}>
                <span style={{ color: '#f57c00' }}>DESCUENTO ({discountPercent}%):</span>
                <span style={{ fontWeight: 'bold' }}>-${getDiscountAmount().toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', color: '#666' }}>TOTAL FINAL</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2e7d32' }}>${getTotalSale().toFixed(2)}</div>
                    </div>
                    <button onClick={handlePay} style={{ padding: '15px 40px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' }} title="Atajo: F9">
                        COBRAR (F9)
                    </button>
                </div>
            </div>
        </div>

      </main>
      
      {/* --- BARRA LATERAL DERECHA (ACCIONES RÁPIDAS) --- */}
      <aside style={{ width: '220px', padding: '20px', background: '#f8f9fa', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ddd' }}>
          <h4 style={{ color: '#1b4332', marginTop: '0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Acciones (Atajos)</h4>

          {/* DOCUMENTOS */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>Tipo de Documento</h5>
            <button onClick={() => setDocType('BOLETA')} style={{ ...docButtonStyle('BOLETA') }} title="Atajo: 4 o F3">
                BOLETA (4/F3)
            </button>
            <button onClick={() => setDocType('FACTURA')} style={{ ...docButtonStyle('FACTURA') }} title="Atajo: 2">
                FACTURA (2)
            </button>
          </div>

          {/* DESCUENTO */}
          <button 
              onClick={applyDiscount} 
              style={{ ...actionButtonStyle, background: '#f57c00' }}
              title="Atajo: D"
          >
              APLICAR DESCUENTO (D)
          </button>

          {/* CRÉDITO / CONTADO */}
          <button 
              onClick={toggleCreditSale} 
              style={{ ...actionButtonStyle, background: isCreditSale ? '#dc3545' : '#1976d2' }}
              title="Atajo: 1"
          >
              VENDER A {isCreditSale ? 'CONTADO' : 'CRÉDITO'} (1)
          </button>

          {/* ABONO DE CLIENTE */}
          <button 
              onClick={customerDeposit} 
              style={{ ...actionButtonStyle, background: '#007bff' }}
              title="Atajo: 3"
          >
              ABONO DE CLIENTE (3)
          </button>
          
          {/* CANCELAR VENTA */}
          <button 
              onClick={cancelSale} 
              style={{ ...actionButtonStyle, background: '#dc3545', marginTop: 'auto' }}
              title="Atajo: ESC"
          >
              CANCELAR VENTA (ESC)
          </button>

      </aside>
    </div>
  );
}