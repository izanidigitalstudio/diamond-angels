import { useState } from 'react';
import { DEMO_OUTFITS, OUTFIT_CATEGORIES } from '../data/talent';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';

export default function OutfitsShop() {
  const [activeCat, setActiveCat] = useState('All');
  const [detail, setDetail] = useState<any>(null);
  const [selSize, setSelSize] = useState('');
  const [selColor, setSelColor] = useState('');
  const [qty, setQty] = useState(1);

  const filtered = activeCat === 'All' ? DEMO_OUTFITS : DEMO_OUTFITS.filter(o => o.category === activeCat);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Outfits Shop</div>
        <div className="page-subtitle">{filtered.length} outfits available</div>
        <div className="filter-bar" style={{ marginTop: 8 }}>
          {OUTFIT_CATEGORIES.map(cat => (
            <button key={cat} className={`filter-chip ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="page-body">
        <div className="outfit-grid">
          {filtered.map(item => (
            <div key={item.id} className="outfit-card" onClick={() => { setDetail(item); setSelSize(''); setSelColor(''); setQty(1); }}>
              <img src={item.image} alt={item.name} />
              <div className="outfit-info">
                <div className="outfit-name">{item.name}</div>
                <div className="outfit-cat">{item.category}</div>
                <div className="outfit-bottom">
                  <span className="outfit-price">R{item.price}</span>
                  {item.brandable && <span className="chip" style={{ fontSize: 9 }}>BRANDABLE</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-close"><button onClick={() => setDetail(null)}><X size={18} /></button></div>
            <img src={detail.image} alt={detail.name} style={{ width: '100%', borderRadius: 14, aspectRatio: '3/4', objectFit: 'cover' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{detail.name}</h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="chip">{detail.category}</span>
                  {detail.brandable && <span className="chip green">Brandable</span>}
                </div>
              </div>
              <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 22 }}>R{detail.price}</span>
            </div>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>{detail.description}</p>
            <h4 style={{ marginTop: 18 }}>Size</h4>
            <div className="filter-bar">
              {detail.sizes.map((sz: string) => (
                <button key={sz} className={`filter-chip ${selSize === sz ? 'active' : ''}`} onClick={() => setSelSize(sz)}>{sz}</button>
              ))}
            </div>
            <h4 style={{ marginTop: 14 }}>Color</h4>
            <div className="filter-bar">
              {detail.colors.map((clr: string) => (
                <button key={clr} className={`filter-chip ${selColor === clr ? 'active' : ''}`} onClick={() => setSelColor(clr)}>{clr}</button>
              ))}
            </div>
            <h4 style={{ marginTop: 14 }}>Quantity</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <button className="btn-secondary" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
              <span style={{ fontSize: 18, fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{qty}</span>
              <button className="btn-secondary" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setQty(qty + 1)}><Plus size={16} /></button>
              <span style={{ color: 'var(--sub)', fontSize: 13, marginLeft: 8 }}>Total: <strong style={{ color: 'var(--gold)' }}>R{detail.price * qty}</strong></span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                if (!selSize || !selColor) { alert('Please choose a size and color.'); return; }
                alert(`Order submitted: ${qty}x ${detail.name} (${selSize}, ${selColor}) - R${detail.price * qty}`);
                setDetail(null);
              }}>
                <ShoppingCart size={16} /> Order Now
              </button>
              <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
