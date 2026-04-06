import { BOOKINGS, TALENT } from '../data/talent';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function AdminBookings() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Booking Requests</div>
        <div className="page-subtitle">{BOOKINGS.length} active bookings</div>
      </div>
      <div className="page-body">
        {BOOKINGS.map(b => {
          const talents = b.talentIds.map(id => TALENT.find(t => t.id === id)).filter(Boolean);
          return (
            <div key={b.id} className="list-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="list-title">{b.company}</div>
                  <div className="list-sub" style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{b.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{b.city}, {b.venue}</span>
                  </div>
                  <div className="list-sub"><span className="chip" style={{ marginTop: 4 }}>{b.type}</span></div>
                </div>
                <span className={`badge ${b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'warn' : 'purple'}`}>{b.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Users size={14} color="var(--muted)" />
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>{b.count} talent requested</span>
                <div style={{ display: 'flex', marginLeft: 8 }}>
                  {talents.slice(0, 4).map((t: any, i: number) => (
                    <img key={t.id} src={t.photos[0]} alt={t.firstName} style={{ width: 28, height: 28, borderRadius: 14, border: '2px solid var(--card)', marginLeft: i > 0 ? -6 : 0, objectFit: 'cover' }} />
                  ))}
                  {talents.length > 4 && (
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--card-light)', marginLeft: -6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--gold)', border: '2px solid var(--card)' }}>
                      +{talents.length - 4}
                    </div>
                  )}
                </div>
              </div>
              {b.notes && (
                <div style={{ fontSize: 12, color: 'var(--sub)', background: 'rgba(201,168,76,0.06)', padding: 10, borderRadius: 8, marginTop: 4 }}>
                  {b.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
