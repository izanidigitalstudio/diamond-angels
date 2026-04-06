import { useState } from 'react';
import { Diamond, Users, Briefcase, Megaphone, Search, Heart, ShoppingBag, User, Activity, ArrowLeftRight, LogOut, Shirt } from 'lucide-react';
import AdminMembers from '../pages/AdminMembers';
import AdminBookings from '../pages/AdminBookings';
import AdminGigs from '../pages/AdminGigs';
import ClientSearch from '../pages/ClientSearch';
import ClientSelections from '../pages/ClientSelections';
import ClientGigBoard from '../pages/ClientGigBoard';
import OutfitsShop from '../pages/OutfitsShop';
import TalentProfile from '../pages/TalentProfile';
import TalentGigs from '../pages/TalentGigs';
import TalentActivity from '../pages/TalentActivity';

type DemoRole = 'admin' | 'client' | 'talent';

const NAV: Record<DemoRole, { key: string; label: string; icon: React.ReactNode }[]> = {
  admin: [
    { key: 'members', label: 'Members', icon: <Users size={18} /> },
    { key: 'bookings', label: 'Bookings', icon: <Briefcase size={18} /> },
    { key: 'gigs', label: 'Gigs', icon: <Megaphone size={18} /> },
  ],
  client: [
    { key: 'search', label: 'Search Talent', icon: <Search size={18} /> },
    { key: 'selections', label: 'My Selections', icon: <Heart size={18} /> },
    { key: 'gigboard', label: 'Gig Board', icon: <ShoppingBag size={18} /> },
    { key: 'outfits', label: 'Outfits', icon: <Shirt size={18} /> },
  ],
  talent: [
    { key: 'gigs', label: 'Available Gigs', icon: <Briefcase size={18} /> },
    { key: 'activity', label: 'My Activity', icon: <Activity size={18} /> },
    { key: 'outfits', label: 'Outfits', icon: <Shirt size={18} /> },
    { key: 'profile', label: 'My Profile', icon: <User size={18} /> },
  ],
};

const PAGE_MAP: Record<string, Record<string, React.FC>> = {
  admin: { members: AdminMembers, bookings: AdminBookings, gigs: AdminGigs },
  client: { search: ClientSearch, selections: ClientSelections, gigboard: ClientGigBoard, outfits: OutfitsShop },
  talent: { gigs: TalentGigs, activity: TalentActivity, outfits: OutfitsShop, profile: TalentProfile },
};

export default function AppLayout({ role, onSwitchRole }: { role: DemoRole; onSwitchRole: (r: DemoRole | null) => void }) {
  const navItems = NAV[role];
  const [activeTab, setActiveTab] = useState(navItems[0].key);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const PageComponent = PAGE_MAP[role]?.[activeTab] || (() => <div>Page not found</div>);

  const handleSwitch = (newRole: DemoRole) => {
    onSwitchRole(newRole);
    setActiveTab(NAV[newRole][0].key);
    setShowSwitcher(false);
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo"><Diamond size={20} color="#C9A84C" /></div>
          <span className="sidebar-title">Diamond</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`sidebar-link ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-link" onClick={() => setShowSwitcher(true)}>
            <ArrowLeftRight size={18} />
            <span>Switch Role</span>
          </div>
          <div className="sidebar-link" onClick={() => onSwitchRole(null)}>
            <LogOut size={18} />
            <span>Exit Demo</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        <PageComponent />
      </div>
      {/* Demo pill */}
      <div className="demo-pill" onClick={() => setShowSwitcher(true)}>
        <Diamond size={12} />
        DEMO: {role.toUpperCase()}
      </div>
      {/* Role Switcher */}
      {showSwitcher && (
        <div className="modal-overlay" onClick={() => setShowSwitcher(false)}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, background: 'var(--card)', borderRadius: 20, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>Switch Role</h3>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20 }}>Preview the app as different user types</p>
            {(['admin', 'client', 'talent'] as const).map(r => (
              <div key={r} className="role-card" style={{ marginBottom: 8, borderColor: role === r ? 'var(--gold)' : undefined, background: role === r ? 'rgba(201,168,76,0.08)' : undefined }} onClick={() => handleSwitch(r)}>
                <div className="role-icon"><Diamond size={18} color="#C9A84C" /></div>
                <div className="role-info">
                  <div className="role-name" style={{ textTransform: 'capitalize' }}>{r}</div>
                </div>
                {role === r && <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>Active</span>}
              </div>
            ))}
            <button className="btn-outline red" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => { setShowSwitcher(false); onSwitchRole(null); }}>
              Exit Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
