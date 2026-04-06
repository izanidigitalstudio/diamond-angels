export default function TalentActivity() {
  const items = [
    { id: '1', gig: 'Summer Festival Promoters', city: 'Johannesburg', date: '15-16 Feb 2025', status: 'interested' },
    { id: '2', gig: 'Luxury Brand Launch', city: 'Cape Town', date: '8 Mar 2025', status: 'selected' },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title">My Activity</div>
        <div className="page-subtitle">Track your gig applications</div>
      </div>
      <div className="page-body">
        {items.map(item => (
          <div key={item.id} className="list-card" style={{ cursor: 'default' }}>
            <div className="list-info">
              <div className="list-title">{item.gig}</div>
              <div className="list-sub">{item.city} · {item.date}</div>
            </div>
            <span className={`badge ${item.status === 'selected' ? 'green' : ''}`} style={item.status !== 'selected' ? { background: 'rgba(201,168,76,0.15)', color: 'var(--gold)' } : {}}>
              {item.status}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--sub)', fontSize: 16 }}>No activity yet</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Express interest in gigs to see your activity here.</p>
          </div>
        )}
      </div>
    </>
  );
}
