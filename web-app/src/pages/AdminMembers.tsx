import { useState } from 'react';
import { TALENT, MEMBERS, type TalentType } from '../data/talent';
import { Users, Briefcase, Flag, UtensilsCrossed, Building2, MapPin, Phone, Mail, MessageSquare, X, ChevronLeft, ChevronRight } from 'lucide-react';

const TABS = [
  { key: 'talent', label: 'Talent', icon: <Users size={14} />, color: '#C9A84C' },
  { key: 'golf_days', label: 'Golf Days', icon: <Flag size={14} />, color: '#F59E0B' },
  { key: 'corporate', label: 'Corporate', icon: <Building2 size={14} />, color: '#8B5CF6' },
  { key: 'restaurants', label: 'Restaurants', icon: <UtensilsCrossed size={14} />, color: '#10B981' },
  { key: 'agencies', label: 'Agencies', icon: <Briefcase size={14} />, color: '#3B82F6' },
];

function PhotoSlider({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  const valid = photos.filter(Boolean);
  if (!valid.length) return <div style={{ width: '100%', height: 300, background: 'var(--card-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={48} color="var(--muted)" /></div>;
  return (
    <div className="photo-slider">
      <img src={valid[idx]} alt="Photo" />
      {valid.length > 1 && (
        <>
          <button className="slider-nav prev" onClick={() => setIdx(i => (i - 1 + valid.length) % valid.length)}><ChevronLeft size={18} /></button>
          <button className="slider-nav next" onClick={() => setIdx(i => (i + 1) % valid.length)}><ChevronRight size={18} /></button>
          <div className="slider-dots">
            {valid.map((_, i) => <div key={i} className={`slider-dot ${idx === i ? 'active' : ''}`} onClick={() => setIdx(i)} />)}
          </div>
        </>
      )}
    </div>
  );
}

function ContactBar({ phone, email, name }: { phone?: string; email?: string; name: string }) {
  if (!phone && !email) return null;
  return (
    <div className="contact-bar">
      {phone && <a className="contact-btn call" href={`tel:${phone.replace(/[^0-9+]/g, '')}`}><Phone size={12} />Call</a>}
      {phone && <a className="contact-btn sms" href={`sms:${phone.replace(/[^0-9+]/g, '')}`}><MessageSquare size={12} />SMS</a>}
      {phone && <a className="contact-btn whatsapp" href={`https://wa.me/${phone.replace(/[^0-9+]/g, '').replace('+','')}`} target="_blank" rel="noreferrer"><MessageSquare size={12} />WhatsApp</a>}
      {email && <a className="contact-btn email" href={`mailto:${email}?subject=${encodeURIComponent('Diamond Angels - ' + name)}`}><Mail size={12} />Email</a>}
    </div>
  );
}

export default function AdminMembers() {
  const [activeTab, setActiveTab] = useState('talent');
  const [selected, setSelected] = useState<TalentType | null>(null);

  const approved = TALENT.filter(t => t.status === 'approved');
  const pending = TALENT.filter(t => t.status === 'pending');
  const allTalent = [...approved, ...pending];
  const members = MEMBERS.filter(m => m.category === activeTab);

  const tabCounts: Record<string, number> = {
    talent: allTalent.length,
    corporate: MEMBERS.filter(m => m.category === 'corporate').length,
    golf_days: MEMBERS.filter(m => m.category === 'golf_days').length,
    restaurants: MEMBERS.filter(m => m.category === 'restaurants').length,
    agencies: MEMBERS.filter(m => m.category === 'agencies').length,
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Members</div>
        <div className="page-subtitle">Manage all contacts & talent</div>
        <div className="filter-bar" style={{ marginTop: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`filter-chip ${activeTab === tab.key ? 'active' : ''}`}
              style={activeTab === tab.key ? { background: tab.color + '20', borderColor: tab.color, color: tab.color } : {}}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label} ({tabCounts[tab.key] || 0})
            </button>
          ))}
        </div>
      </div>
      <div className="page-body">
        {activeTab === 'talent' ? (
          allTalent.map(t => (
            <div key={t.id} className="list-card" onClick={() => setSelected(t)}>
              <img src={t.photos[0]} alt={t.firstName} className="list-thumb" />
              <div className="list-info">
                <div className="list-title">{t.firstName} {t.lastName}</div>
                <div className="list-sub">{t.city}{t.area ? `, ${t.area}` : ''}{t.heightCm ? ` · ${t.heightCm}cm` : ''}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {t.categories.slice(0, 3).map((c, i) => <span key={i} className="chip">{c}</span>)}
                </div>
              </div>
              <span className={`badge ${t.status === 'approved' ? 'green' : 'warn'}`}>{t.status}</span>
            </div>
          ))
        ) : (
          members.map(m => (
            <div key={m.id} className="list-card">
              <div className="avatar" style={{ background: TABS.find(t => t.key === m.category)?.color + '25', color: TABS.find(t => t.key === m.category)?.color }}>
                {getInitials(m.name)}
              </div>
              <div className="list-info">
                <div className="list-title">{m.name}</div>
                <div style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600 }}>{m.company}</div>
                <div className="list-sub">{m.role}</div>
                <div className="list-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{m.city}</div>
              </div>
              <ContactBar phone={m.phone} email={m.email} name={m.name} />
            </div>
          ))
        )}
      </div>
      {/* Talent Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-close"><button onClick={() => setSelected(null)}><X size={18} /></button></div>
            <PhotoSlider photos={selected.photos} />
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{selected.firstName} {selected.lastName}</h2>
            <span className={`badge ${selected.status === 'approved' ? 'green' : 'warn'}`} style={{ marginTop: 6, alignSelf: 'flex-start' }}>{selected.status}</span>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 6 }}>{selected.city}{selected.area ? `, ${selected.area}` : ''} · {selected.race} · {selected.bodyType} · {selected.heightCm}cm</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {selected.categories.map((c, i) => <span key={i} className="chip">{c}</span>)}
            </div>
            <div className="section-header"><div className="section-title">Background</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{selected.background}</p>
            <div className="section-header"><div className="section-title">Skills</div></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.skills.map((s, i) => <span key={i} className="chip purple">{s}</span>)}
            </div>
            <div className="section-header"><div className="section-title">Work Experience</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{selected.workExperience}</p>
            <div className="section-header"><div className="section-title">Availability</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{selected.availability}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {selected.status === 'pending' ? (
                <>
                  <button className="btn-green" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { alert('Approved!'); setSelected(null); }}>Approve</button>
                  <button className="btn-red" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { alert('Declined'); setSelected(null); }}>Decline</button>
                </>
              ) : (
                <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelected(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
