import { useState } from 'react';
import { GIGS } from '../data/talent';
import { Calendar, MapPin, Users, DollarSign, X, PlusCircle, Info, Megaphone } from 'lucide-react';

export default function ClientGigBoard() {
  const [detail, setDetail] = useState<any>(null);
  const [showPost, setShowPost] = useState(false);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Gig Board</div>
        <div className="page-subtitle">{GIGS.length} open opportunities</div>
      </div>
      <div className="page-body">
        <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginBottom: 20, padding: 14 }} onClick={() => setShowPost(true)}>
          <PlusCircle size={18} /> Post a Gig Request
        </button>
        {GIGS.map(gig => (
          <div key={gig.id} className="gig-card" onClick={() => setDetail(gig)}>
            <div className="gig-header">
              <span className="chip">{gig.type}</span>
              <span className="badge green">Open</span>
            </div>
            <div className="gig-body">
              <div className="gig-title">{gig.title}</div>
              <div className="gig-desc">{gig.desc}</div>
            </div>
            <div className="gig-details">
              <span className="gig-detail"><Calendar size={13} />{gig.date}</span>
              <span className="gig-detail"><MapPin size={13} />{gig.city}</span>
              <span className="gig-detail"><Users size={13} />{gig.needed} needed</span>
              <span className="gig-detail" style={{ color: 'var(--gold)', fontWeight: 600 }}><DollarSign size={13} />{gig.comp}</span>
            </div>
            <div className="gig-footer">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {gig.categories.map((c, i) => <span key={i} className="chip purple">{c}</span>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="gig-progress"><div className="gig-progress-fill" style={{ width: `${Math.min((gig.interests / gig.needed) * 100, 100)}%`, background: 'var(--gold)' }} /></div>
                <span style={{ fontSize: 11, color: 'var(--sub)', whiteSpace: 'nowrap' }}>{gig.interests}/{gig.needed} interested</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-close"><button onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="chip">{detail.type}</span>
              <span className="badge green">Open</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{detail.title}</h2>
            <p style={{ color: 'var(--sub)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{detail.desc}</p>
            <div style={{ background: 'var(--card-light)', borderRadius: 12, padding: 16, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16} color="var(--gold)" />Date: <strong>{detail.date}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} color="var(--gold)" />Venue: <strong>{detail.venue}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} color="var(--gold)" />Talent Needed: <strong>{detail.needed}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} color="var(--gold)" />Compensation: <strong style={{ color: 'var(--gold)' }}>{detail.comp}</strong></div>
            </div>
            <h4 style={{ marginTop: 20, marginBottom: 8 }}>Required Categories</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {detail.categories.map((c: string, i: number) => <span key={i} className="chip">{c}</span>)}
            </div>
            <h4 style={{ marginTop: 20, marginBottom: 8 }}>Interest</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--card-light)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((detail.interests / detail.needed) * 100, 100)}%`, height: '100%', background: 'var(--gold)', borderRadius: 4 }} />
              </div>
              <span style={{ fontWeight: 600 }}>{detail.interests}/{detail.needed}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { alert('Interest submitted!'); setDetail(null); }}>Express Interest</button>
              <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Post Gig Modal */}
      {showPost && (
        <div className="modal-overlay" onClick={() => setShowPost(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-close"><button onClick={() => setShowPost(false)}><X size={18} /></button></div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Post a Gig Request</h2>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20 }}>Tell us what talent you need</p>
            <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8, marginTop: 16 }}>Event Type</label>
            <div className="filter-bar">
              {['Brand Activation', 'Music Festival', 'Corporate Event', 'Fashion Show', 'Golf Day'].map(t => (
                <button key={t} className="filter-chip">{t}</button>
              ))}
            </div>
            <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8, marginTop: 16 }}>Talent Categories</label>
            <div className="filter-bar">
              {['Model', 'Hostess', 'Promoter', 'Brand Ambassador', 'Bottle Girl'].map(c => (
                <button key={c} className="filter-chip">{c}</button>
              ))}
            </div>
            <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8, marginTop: 16 }}>Notes & Requirements</label>
            <textarea className="input-field" placeholder="Dress code, timing, venue details..." />
            <div style={{ background: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 14, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} color="var(--gold)" /><span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 13 }}>What happens next?</span></div>
              <p style={{ color: 'var(--sub)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>Your gig will be posted and qualified talent will express interest within 24-48 hours.</p>
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} onClick={() => { alert('Gig request submitted!'); setShowPost(false); }}>
              <Megaphone size={16} /> Post Gig
            </button>
          </div>
        </div>
      )}
    </>
  );
}
