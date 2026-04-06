import { GIGS } from '../data/talent';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

export default function AdminGigs() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Gig Management</div>
        <div className="page-subtitle">{GIGS.length} active gigs</div>
      </div>
      <div className="page-body">
        {GIGS.map(gig => (
          <div key={gig.id} className="gig-card" style={{ cursor: 'default' }}>
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
                <div className="gig-progress">
                  <div className="gig-progress-fill" style={{ width: `${Math.min((gig.interests / gig.needed) * 100, 100)}%`, background: gig.interests >= gig.needed ? 'var(--gold)' : 'var(--green)' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--sub)', whiteSpace: 'nowrap' }}>{gig.interests}/{gig.needed} interested</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
