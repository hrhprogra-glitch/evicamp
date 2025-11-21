// src/components/panel-de-control-entrada.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Ventas } from '../components/ventas'; 
// 1. IMPORTAMOS EL NUEVO COMPONENTE
import { Inventario } from '../components/Inventario';

interface PanelProps {
  userEmail: string;
  onLogout: () => void;
}

// Estructura de una Ventana
interface WindowItem {
  id: number;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface DragAction {
  type: 'move' | 'resize' | null;
  windowId: number | null;
  resizeDir?: ResizeDirection;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  startWindowX: number;
  startWindowY: number;
}

interface PreviewRect {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  snapType?: string;
}

export function PanelDeControlEntrada({ userEmail, onLogout }: PanelProps) {
  // --- ESTADOS ---
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [snapMenuOpenId, setSnapMenuOpenId] = useState<number | null>(null);
  
  const [dragAction, setDragAction] = useState<DragAction>({
    type: null, windowId: null,
    offsetX: 0, offsetY: 0,
    startX: 0, startY: 0,
    startW: 0, startH: 0,
    startWindowX: 0, startWindowY: 0
  });

  const [previewRect, setPreviewRect] = useState<PreviewRect>({ visible: false, x:0, y:0, width:0, height:0 });

  const maxZIndex = useRef(10);
  const mainRef = useRef<HTMLElement>(null);
  const snapTimeoutRef = useRef<number | null>(null);
  
  const minWidth = 300;
  const minHeight = 200;

  useEffect(() => {
    const handleClickOutside = () => setSnapMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };
  }, []);

  // --- GESTIÓN DE VENTANAS ---
  const bringToFront = (id: number) => {
    maxZIndex.current += 1;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex.current } : w));
  };

  const openWindow = (type: string, title: string) => {
    const existing = windows.find(w => w.type === type);
    if (existing) {
      bringToFront(existing.id);
      return;
    }

    const newWindow: WindowItem = {
      id: Date.now(),
      type,
      title,
      x: 50 + (windows.length * 30),
      y: 50 + (windows.length * 30),
      width: 700, 
      height: 550,
      isMaximized: false,
      zIndex: maxZIndex.current + 1
    };
    
    maxZIndex.current += 1;
    setWindows([...windows, newWindow]);
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const toggleMaximize = (id: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    bringToFront(id);
  };

  const applySnap = (id: number, type: string) => {
    if (!mainRef.current) return;
    const { clientWidth: W, clientHeight: H } = mainRef.current;
    
    let newX=0, newY=0, newW=W, newH=H;
    let maximize = false;

    switch (type) {
      case 'full':   maximize = true; break;
      case 'left':   newX=0; newY=0; newW=W/2; newH=H; break;
      case 'right':  newX=W/2; newY=0; newW=W/2; newH=H; break;
      case 'top':    maximize = true; break; 
      case 'bottom': newX=0; newY=H/2; newW=W; newH=H/2; break; 
      case 'tl': newX=0; newY=0; newW=W/2; newH=H/2; break;
      case 'tr': newX=W/2; newY=0; newW=W/2; newH=H/2; break;
      case 'bl': newX=0; newY=H/2; newW=W/2; newH=H/2; break;
      case 'br': newX=W/2; newY=H/2; newW=W/2; newH=H/2; break;
      case 'col1': newX=0; newY=0; newW=W/3; newH=H; break;
      case 'col2': newX=W/3; newY=0; newW=W/3; newH=H; break;
      case 'col3': newX=(W/3)*2; newY=0; newW=W/3; newH=H; break;
    }

    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: maximize, x: newX, y: newY, width: newW, height: newH } : w
    ));
    bringToFront(id);
  };

  const handleSnapMouseEnter = (id: number) => {
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    bringToFront(id);
    setSnapMenuOpenId(id);
  };
  const handleSnapMouseLeave = () => {
    snapTimeoutRef.current = setTimeout(() => setSnapMenuOpenId(null), 300);
  };

  // --- MOUSE ---
  const startMove = (e: React.MouseEvent, w: WindowItem) => {
    if (w.isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return; 
    e.preventDefault();
    bringToFront(w.id);
    setDragAction({
      type: 'move', windowId: w.id,
      offsetX: e.clientX - w.x, offsetY: e.clientY - w.y,
      startX: 0, startY: 0, startW: 0, startH: 0, startWindowX: 0, startWindowY: 0
    });
  };

  const startResize = (e: React.MouseEvent, w: WindowItem, dir: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront(w.id);
    setDragAction({
      type: 'resize', windowId: w.id, resizeDir: dir,
      offsetX: 0, offsetY: 0,
      startX: e.clientX, startY: e.clientY,
      startW: w.width, startH: w.height,
      startWindowX: w.x, startWindowY: w.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragAction.type || dragAction.windowId === null) return;
    const { windowId, type, resizeDir, startX, startY, startW, startH, startWindowX, startWindowY } = dragAction;

    if (type === 'move') {
      const newX = e.clientX - dragAction.offsetX;
      const newY = e.clientY - dragAction.offsetY;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, x: newX, y: newY } : w));

      if (mainRef.current) {
        const { left, top, width: screenW, height: screenH } = mainRef.current.getBoundingClientRect();
        const mouseX = e.clientX - left; 
        const mouseY = e.clientY - top;
        const margin = 20;

        let snapType = '';
        let pX=0, pY=0, pW=0, pH=0;

        if (mouseY < margin && mouseX < margin) { snapType='tl'; pX=0; pY=0; pW=screenW/2; pH=screenH/2; }
        else if (mouseY < margin && mouseX > screenW - margin) { snapType='tr'; pX=screenW/2; pY=0; pW=screenW/2; pH=screenH/2; }
        else if (mouseY > screenH - margin && mouseX < margin) { snapType='bl'; pX=0; pY=screenH/2; pW=screenW/2; pH=screenH/2; }
        else if (mouseY > screenH - margin && mouseX > screenW - margin) { snapType='br'; pX=screenW/2; pY=screenH/2; pW=screenW/2; pH=screenH/2; }
        else if (mouseY < margin) { snapType='full'; pX=0; pY=0; pW=screenW; pH=screenH; } 
        else if (mouseX < margin) { snapType='left'; pX=0; pY=0; pW=screenW/2; pH=screenH; }
        else if (mouseX > screenW - margin) { snapType='right'; pX=screenW/2; pY=0; pW=screenW/2; pH=screenH; }

        if (snapType) setPreviewRect({ visible: true, x: pX, y: pY, width: pW, height: pH, snapType });
        else setPreviewRect({ visible: false, x:0, y:0, width:0, height:0 });
      }
    } 
    else if (type === 'resize' && resizeDir) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setWindows(prev => prev.map(w => {
        if (w.id !== windowId) return w;
        let newW = startW, newH = startH, newX = startWindowX, newY = startWindowY;
        if (resizeDir.includes('e')) newW = Math.max(minWidth, startW + deltaX);
        if (resizeDir.includes('w')) {
          const proposedW = startW - deltaX;
          if (proposedW >= minWidth) { newW = proposedW; newX = startWindowX + deltaX; }
          else { newW = minWidth; newX = startWindowX + (startW - minWidth); }
        }
        if (resizeDir.includes('s')) newH = Math.max(minHeight, startH + deltaY);
        if (resizeDir.includes('n')) {
          const proposedH = startH - deltaY;
          if (proposedH >= minHeight) { newH = proposedH; newY = startWindowY + deltaY; }
          else { newH = minHeight; newY = startWindowY + (startH - minHeight); }
        }
        return { ...w, width: newW, height: newH, x: newX, y: newY };
      }));
    }
  };

  const handleMouseUp = () => {
    if (dragAction.type === 'move' && dragAction.windowId && previewRect.visible && previewRect.snapType) {
      applySnap(dragAction.windowId, previewRect.snapType);
    }
    setDragAction({ type: null, windowId: null, offsetX: 0, offsetY: 0, startX: 0, startY: 0, startW: 0, startH: 0, startWindowX: 0, startWindowY: 0 });
    setPreviewRect({ ...previewRect, visible: false }); 
  };

  // --- RENDER CONTENT ---
  const renderWindowContent = (type: string) => {
    switch (type) {
      case 'inicio': return <div style={{padding:'20px'}}><h3>Inicio</h3><p>Resumen...</p></div>;
      case 'venta': return <Ventas />;
      
      // 2. USAMOS EL COMPONENTE INVENTARIO
      case 'inventario': return <Inventario />;
      
      case 'perfil': return <div style={{padding:'20px'}}><h3>{userEmail}</h3></div>;
      default: return null;
    }
  };

  const getMenuButtonStyle = (type: string) => {
    const isActive = windows.some(w => w.type === type);
    return {
      display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center',
      padding: '12px', width: '100%',
      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent', borderLeft: isActive ? '4px solid #4caf50' : '4px solid transparent',
      color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.1rem', borderRadius: '4px', marginBottom: '8px', transition: 'all 0.2s',
      whiteSpace: 'nowrap' as const, overflow: 'hidden'
    };
  };

  const windowBtnStyle: React.CSSProperties = {
    width: '46px', height: '100%', border: 'none', background: 'transparent',
    color: 'white', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', transition: 'background 0.2s', outline: 'none', userSelect: 'none' 
  };

  const snapOptionStyle = {
    background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', overflow: 'hidden'
  };

  const activePartStyle = { background: 'rgba(0, 120, 255, 0.6)', backdropFilter: 'blur(2px)' };
  const inactivePartStyle = { background: 'rgba(255, 255, 255, 0.1)' };

  return (
    <div 
      style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden', userSelect: 'none' }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
    >
      <aside style={{
        width: isSidebarOpen ? '260px' : '80px', backgroundColor: '#1b4332', color: 'white',
        display: 'flex', flexDirection: 'column', padding: '15px', zIndex: 9999,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', marginBottom: '30px', height: '40px' }}>
          {isSidebarOpen && <h2 style={{ margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap' }}>EviCamp</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>☰</button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '5px' }}>
          <button onClick={() => openWindow('inicio', '🏠 Inicio')} style={getMenuButtonStyle('inicio')}><span style={{ fontSize: '1.5rem' }}>🏠</span>{isSidebarOpen && <span style={{ marginLeft: '15px' }}>Inicio</span>}</button>
          <button onClick={() => openWindow('venta', '🛒 Ventas')} style={getMenuButtonStyle('venta')}><span style={{ fontSize: '1.5rem' }}>🛒</span>{isSidebarOpen && <span style={{ marginLeft: '15px' }}>Ventas</span>}</button>
          <button onClick={() => openWindow('inventario', '📦 Inventario')} style={getMenuButtonStyle('inventario')}><span style={{ fontSize: '1.5rem' }}>📦</span>{isSidebarOpen && <span style={{ marginLeft: '15px' }}>Inventario</span>}</button>
          <button onClick={() => openWindow('perfil', '👤 Perfil')} style={getMenuButtonStyle('perfil')}><span style={{ fontSize: '1.5rem' }}>👤</span>{isSidebarOpen && <span style={{ marginLeft: '15px' }}>Perfil</span>}</button>
        </nav>
        <button onClick={onLogout} style={{ marginTop: 'auto', display: 'flex', padding: '12px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}><span style={{ fontSize: '1.2rem' }}>🚪</span>{isSidebarOpen && <span style={{ marginLeft: '15px', fontWeight: 'bold' }}>Salir</span>}</button>
      </aside>

      <main ref={mainRef} style={{ flex: 1, backgroundColor: '#f4f6f8', position: 'relative', overflow: 'hidden' }}>
        
        {windows.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}><h1 style={{ fontSize: '4rem', margin: 0 }}>👋</h1><p>Panel de Control</p></div>}

        {previewRect.visible && (
          <div style={{
            position: 'absolute',
            left: previewRect.x, top: previewRect.y, width: previewRect.width, height: previewRect.height,
            backgroundColor: 'rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(4px)',
            borderRadius: '8px', zIndex: 9990, transition: 'all 0.1s ease-out', pointerEvents: 'none'
          }} />
        )}

        {windows.map((win) => (
          <div
            key={win.id}
            style={{
              position: 'absolute',
              left: win.isMaximized ? 0 : win.x, top: win.isMaximized ? 0 : win.y,
              width: win.isMaximized ? '100%' : win.width, height: win.isMaximized ? '100%' : win.height,
              zIndex: win.zIndex, backgroundColor: 'white', boxShadow: win.isMaximized ? 'none' : '0 15px 35px rgba(0,0,0,0.3)',
              borderRadius: win.isMaximized ? '0' : '8px', display: 'flex', flexDirection: 'column',
              border: win.isMaximized ? 'none' : '1px solid rgba(0,0,0,0.1)',
              transition: dragAction.type ? 'none' : 'width 0.2s, height 0.2s, top 0.2s, left 0.2s'
            }}
            onMouseDown={() => bringToFront(win.id)}
          >
            <div
              onMouseDown={(e) => startMove(e, win)}
              onDoubleClick={() => toggleMaximize(win.id)}
              style={{
                backgroundColor: '#1b4332', color: 'white', height: '40px', cursor: win.isMaximized ? 'default' : 'move', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '15px', overflow: 'visible',
                borderTopLeftRadius: win.isMaximized ? 0 : '8px', borderTopRightRadius: win.isMaximized ? 0 : '8px',
                position: 'relative', zIndex: 50
              }}
            >
              <span style={{ fontWeight: '600', fontSize: '0.9rem', flex: 1 }}>{win.title}</span>
              
              <div 
                onMouseDown={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', height: '100%', alignItems: 'flex-start' }}
              >
                <div 
                  style={{ position: 'relative', height: '100%' }}
                  onMouseEnter={() => handleSnapMouseEnter(win.id)}
                  onMouseLeave={handleSnapMouseLeave}
                >
                  <button onClick={(e) => e.stopPropagation()} style={windowBtnStyle} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>田</button>
                  
                  {snapMenuOpenId === win.id && (
                    <div style={{
                      position: 'absolute', top: '40px', right: '0', 
                      background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '10px', borderRadius: '8px',
                      zIndex: 99999, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', width: '170px',
                      display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'default'
                    }} onMouseDown={(e) => e.stopPropagation()}>
                      
                      <div onClick={() => applySnap(win.id, 'full')} title="Pantalla Completa" style={{...snapOptionStyle, height: '30px', background: 'rgba(255,255,255,0.05)'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                         <div style={{...activePartStyle, width: '90%', height: '80%', borderRadius:'2px'}}></div>
                      </div>

                      <div style={{display:'flex', gap:'5px', height:'40px'}}>
                         <div onClick={() => applySnap(win.id, 'left')} title="Izquierda" style={{...snapOptionStyle, flex:1, display:'flex'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={{...activePartStyle, flex:1, height:'100%'}}></div><div style={{...inactivePartStyle, flex:1, height:'100%'}}></div>
                         </div>
                         <div onClick={() => applySnap(win.id, 'right')} title="Derecha" style={{...snapOptionStyle, flex:1, display:'flex'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={{...inactivePartStyle, flex:1, height:'100%'}}></div><div style={{...activePartStyle, flex:1, height:'100%'}}></div>
                         </div>
                      </div>

                      <div style={{display:'flex', gap:'5px', height:'40px'}}>
                         <div onClick={() => applySnap(win.id, 'col1')} title="Col 1" style={{...snapOptionStyle, flex:1, display:'flex'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={{...activePartStyle, flex:1}}></div><div style={{...inactivePartStyle, flex:1}}></div><div style={{...inactivePartStyle, flex:1}}></div>
                         </div>
                         <div onClick={() => applySnap(win.id, 'col2')} title="Col 2" style={{...snapOptionStyle, flex:1, display:'flex'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={{...inactivePartStyle, flex:1}}></div><div style={{...activePartStyle, flex:1}}></div><div style={{...inactivePartStyle, flex:1}}></div>
                         </div>
                         <div onClick={() => applySnap(win.id, 'col3')} title="Col 3" style={{...snapOptionStyle, flex:1, display:'flex'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={{...inactivePartStyle, flex:1}}></div><div style={{...inactivePartStyle, flex:1}}></div><div style={{...activePartStyle, flex:1}}></div>
                         </div>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', height:'60px'}}>
                         <div onClick={() => applySnap(win.id, 'tl')} title="TL" style={{...snapOptionStyle, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'1px'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={activePartStyle}></div><div style={inactivePartStyle}></div><div style={inactivePartStyle}></div><div style={inactivePartStyle}></div>
                         </div>
                         <div onClick={() => applySnap(win.id, 'tr')} title="TR" style={{...snapOptionStyle, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'1px'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={inactivePartStyle}></div><div style={activePartStyle}></div><div style={inactivePartStyle}></div><div style={inactivePartStyle}></div>
                         </div>
                         <div onClick={() => applySnap(win.id, 'bl')} title="BL" style={{...snapOptionStyle, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'1px'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={inactivePartStyle}></div><div style={inactivePartStyle}></div><div style={activePartStyle}></div><div style={inactivePartStyle}></div>
                         </div>
                         <div onClick={() => applySnap(win.id, 'br')} title="BR" style={{...snapOptionStyle, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'1px'}} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                           <div style={inactivePartStyle}></div><div style={inactivePartStyle}></div><div style={inactivePartStyle}></div><div style={activePartStyle}></div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} style={windowBtnStyle} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>{win.isMaximized ? '❐' : '□'}</button>
                <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} style={{...windowBtnStyle, borderTopRightRadius: win.isMaximized?0:'8px'}} onMouseEnter={(e)=>e.currentTarget.style.background='#E81123'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>✕</button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'white', borderBottomLeftRadius: win.isMaximized?0:'8px', borderBottomRightRadius: win.isMaximized?0:'8px', zIndex: 1 }}>
              {renderWindowContent(win.type)}
              {(dragAction.type !== null) && <div style={{ position: 'absolute', inset: 0, zIndex: 9999 }} />}
            </div>
            
            {!win.isMaximized && (
              <>
                <div onMouseDown={(e) => startResize(e, win, 'n')} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', cursor: 'n-resize', zIndex: 10 }} />
                <div onMouseDown={(e) => startResize(e, win, 's')} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', cursor: 's-resize', zIndex: 10 }} />
                <div onMouseDown={(e) => startResize(e, win, 'e')} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '5px', cursor: 'e-resize', zIndex: 10 }} />
                <div onMouseDown={(e) => startResize(e, win, 'w')} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px', cursor: 'w-resize', zIndex: 10 }} />
                <div onMouseDown={(e) => startResize(e, win, 'se')} style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'se-resize', zIndex: 20 }} />
                <div onMouseDown={(e) => startResize(e, win, 'sw')} style={{ position: 'absolute', bottom: 0, left: 0, width: '15px', height: '15px', cursor: 'sw-resize', zIndex: 20 }} />
                <div onMouseDown={(e) => startResize(e, win, 'ne')} style={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', cursor: 'ne-resize', zIndex: 20 }} />
                <div onMouseDown={(e) => startResize(e, win, 'nw')} style={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '15px', cursor: 'nw-resize', zIndex: 20 }} />
              </>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}