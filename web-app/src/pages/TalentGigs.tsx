import { useState } from 'react';
import { GIGS } from '../data/talent';
import { Check, Hand } from 'lucide-react';

export default function TalentGigs() {
  const [interested, setInterested] = useState<Set<string>>(new Set(['g1']));

  const toggleInterest = (id: string) => {
    const next = new Set(interested);
    next.has(id) ? next.delete(id) : next.add(id);
    setInterested(next);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Available Gigs</div>
        <div className="page-subtitle">{GIGS.length} open opportunities</div>
      </div>
      <div className="page-body">
        {GIGS.map(gig => {
          const isInt = interested.has(gig.id);
          return (
            <div key={gig.id} className="list-card" style={{ cursor: 'default' }}>
              <div className="list-info">
                <div className="list-title">{gig.title}</div>
                <div className="list-sub">{gig.type} · {gig.city} · {gig.date}</div>
                <div className="list-sub">{gig.needed} needed · <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{gig.comp}</span></div>
              </div>
              <button
                onClick={() => toggleInterest(gig.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  borderRadius: 20, border: `1.5px solid ${isInt ? 'var(--gold)' : 'var(--gold)'}`,
                  background: isInt ? 'var(--gold)' : 'transparent',
                  color: isInt ? 'var(--black)' : 'var(--gold)',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {isInt ? <Check size={14} /> : <Hand size={14} />}
                {isInt ? 'Interested' : 'Show Interest'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
