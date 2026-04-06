import { useState } from 'react';
import { BOOKINGS, TALENT } from '../data/talent';
import { ChevronDown, ChevronUp, XCircle, PlusCircle, Clock, CheckCircle, Eye } from 'lucide-react';

export default function ClientSelections() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bookings] = useState(BOOKINGS.slice(0, 3));

  const getTalent = (id: string) => TALENT.find(t => t.id === id);

  return (
    <>
      <div className="page-header">
        <div className="page-title">My Selections</div>
        <div className="page-subtitle">{bookings.length} active selections</div>
      </div>
      <div className="page-body">
        {bookings.map(item => {
          const isExpanded = expanded === item.id;
          const talents = item.talentIds.map(getTalent).filter(Boolean);
          const statusColor = item.status === 'confirmed' ? 'green' : item.status === 'pending' ? 'warn' : 'purple';

          return (
            <div key={item.id} style={{ marginBottom: 14 }}>
              <div className="list-card" style={{ marginBottom: 0, borderRadius: isExpanded ? '12px 12px 0 0' : 12, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : item.id)}>
                <div className="list-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="list-title">{item.type}</div>
                    <span className={`badge ${statusColor}`}>{item.status}</span>
                  </div>
                  <div className="list-sub">{item.date} · {item.city}</div>
                  <div className="list-sub">{item.venue}</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, gap: 4 }}>
                    {talents.slice(0, 5).map((t: any, i: number) => (
                      <img key={t.id} src={t.photos[0]} alt="" style={{ width: 30, height: 30, borderRadius: 15, border: '2px solid var(--card)', marginLeft: i > 0 ? -8 : 0, objectFit: 'cover' }} />
                    ))}
                    <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>{item.talentIds.length} talent</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} color="var(--muted)" /> : <ChevronDown size={20} color="var(--muted)" />}
              </div>
              {isExpanded && (
                <div style={{ background: 'var(--card-light)', borderRadius: '0 0 12px 12px', padding: 16 }}>
                  {item.notes && (
                    <div style={{ background: 'rgba(201,168,76,0.08)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                      <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600 }}>Notes</span>
                      <p style={{ color: 'var(--sub)', fontSize: 12, marginTop: 4 }}>{item.notes}</p>
                    </div>
                  )}
                  <h4 style={{ marginBottom: 10 }}>Selected Talent ({item.talentIds.length})</h4>
                  {talents.map((t: any) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                      <img src={t.photos[0]} alt="" style={{ width: 50, height: 64, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.firstName} {t.lastName}</div>
                        <div style={{ color: 'var(--sub)', fontSize: 12, marginTop: 2 }}>{t.city}, {t.area} · {t.heightCm}cm</div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          {t.categories.slice(0, 2).map((c: string, i: number) => <span key={i} className="chip">{c}</span>)}
                        </div>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                        <XCircle size={20} color="var(--red)" />
                      </button>
                    </div>
                  ))}
                  <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 8, borderStyle: 'dashed' }}>
                    <PlusCircle size={16} /> Add More Talent
                  </button>
                  <div style={{ marginTop: 14, background: item.status === 'confirmed' ? 'rgba(16,185,129,0.08)' : item.status === 'pending' ? 'rgba(245,158,11,0.08)' : 'rgba(139,92,246,0.08)', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.status === 'confirmed' ? <CheckCircle size={16} color="var(--green)" /> : item.status === 'pending' ? <Clock size={16} color="var(--warn)" /> : <Eye size={16} color="var(--purple)" />}
                      <span style={{ color: item.status === 'confirmed' ? 'var(--green)' : item.status === 'pending' ? 'var(--warn)' : 'var(--purple)', fontWeight: 600, fontSize: 13 }}>
                        {item.status === 'confirmed' ? 'Confirmed' : item.status === 'pending' ? 'Pending Review' : 'Under Review'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--sub)', fontSize: 12, marginTop: 4 }}>
                      {item.status === 'confirmed' ? 'All selected talent have been confirmed for your event.' : item.status === 'pending' ? 'Diamond Angels is reviewing your selection.' : 'Our team is reaching out to the selected talent.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
