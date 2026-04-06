import { useState } from 'react';
import { Diamond, ChevronRight, Lock } from 'lucide-react';
import AppLayout from './components/AppLayout';
import './index.css';

type DemoRole = 'admin' | 'client' | 'talent' | null;

function RoleSelect({ onSelect }: { onSelect: (role: DemoRole) => void }) {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAdminAccess = () => { setShowPin(true); setPin(''); setPinError(''); };
  const verifyPin = () => {
    if (pin === '2025') { setShowPin(false); onSelect('admin'); }
    else { setPinError('Incorrect PIN. Try again.'); setPin(''); }
  };

  return (
    <div className="role-select-container">
      <div className="role-select-box">
        <div className="role-select-logo">
          <div className="icon-circle"><Diamond size={32} color="#C9A84C" /></div>
          <h1>Diamond Angels</h1>
          <p>South Africa's Premier Female Talent Agency</p>
        </div>
        {[
          { key: 'admin' as const, label: 'Agency Admin', desc: 'Manage talent, bookings & gigs', locked: true },
          { key: 'client' as const, label: 'Client', desc: 'Search talent & submit bookings', locked: false },
          { key: 'talent' as const, label: 'Talent', desc: 'View profile & browse gigs', locked: false },
        ].map(r => (
          <div key={r.key} className="role-card" onClick={() => r.locked ? handleAdminAccess() : onSelect(r.key)}>
            <div className="role-icon"><Diamond size={22} color="#C9A84C" /></div>
            <div className="role-info">
              <div className="role-name">{r.label}</div>
              <div className="role-desc">{r.desc}</div>
            </div>
            {r.locked ? <Lock size={18} color="#C9A84C" /> : <ChevronRight size={20} color="#6B7280" />}
          </div>
        ))}
      </div>
      {showPin && (
        <div className="modal-overlay" onClick={() => setShowPin(false)}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, background: 'var(--card)', borderRadius: 20, padding: 28, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: 'rgba(201,168,76,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Lock size={24} color="#C9A84C" />
            </div>
            <h3 style={{ marginBottom: 6 }}>Admin Access</h3>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20 }}>Enter the admin PIN to access the dashboard</p>
            <input
              type="password" maxLength={4} className="input-field" autoFocus
              style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: 12 }}
              value={pin} onChange={e => { setPin(e.target.value); setPinError(''); }}
              onKeyDown={e => e.key === 'Enter' && verifyPin()}
              placeholder="----"
            />
            {pinError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{pinError}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={verifyPin}>Enter</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowPin(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<DemoRole>(null);

  if (!role) return <RoleSelect onSelect={setRole} />;

  return <AppLayout role={role} onSwitchRole={setRole} />;
}
