import { useState } from 'react';
import { TALENT, type TalentType } from '../data/talent';
import { SlidersHorizontal, Check, X, ChevronLeft, ChevronRight, Send, Plus } from 'lucide-react';

function PhotoSlider({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="photo-slider">
      <img src={photos[idx]} alt="" />
      {photos.length > 1 && (
        <>
          <button className="slider-nav prev" onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}><ChevronLeft size={18} /></button>
          <button className="slider-nav next" onClick={() => setIdx(i => (i + 1) % photos.length)}><ChevronRight size={18} /></button>
          <div className="slider-dots">
            {photos.map((_, i) => <div key={i} className={`slider-dot ${idx === i ? 'active' : ''}`} onClick={() => setIdx(i)} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function ClientSearch() {
  const approved = TALENT.filter(t => t.status === 'approved');
  const [detail, setDetail] = useState<TalentType | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [filterRace, setFilterRace] = useState('');
  const [filterBody, setFilterBody] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const cities = [...new Set(approved.map(t => t.city))].sort();
  const races = [...new Set(approved.map(t => t.race))].sort();
  const bodies = [...new Set(approved.map(t => t.bodyType))].sort();
  const cats = [...new Set(approved.flatMap(t => t.categories))].sort();

  const filtered = approved.filter(t => {
    if (filterCity && t.city !== filterCity) return false;
    if (filterRace && t.race !== filterRace) return false;
    if (filterBody && t.bodyType !== filterBody) return false;
    if (filterCat && !t.categories.includes(filterCat)) return false;
    return true;
  });

  const activeFilterCount = [filterCity, filterRace, filterBody, filterCat].filter(Boolean).length;
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const clearFilters = () => { setFilterCity(''); setFilterRace(''); setFilterBody(''); setFilterCat(''); };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Search Talent</div>
        <div className="page-subtitle">{filtered.length} of {approved.length} talent available</div>
        <div className="filter-bar" style={{ marginTop: 8 }}>
          <button className={`filter-chip ${activeFilterCount > 0 ? 'active' : ''}`} onClick={() => setShowFilters(true)} style={activeFilterCount > 0 ? {} : { borderColor: 'var(--gold)', color: 'var(--gold)' }}>
            <SlidersHorizontal size={13} /> Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          {cities.map(c => (
            <button key={c} className={`filter-chip ${filterCity === c ? 'active' : ''}`} onClick={() => setFilterCity(filterCity === c ? '' : c)}>{c}</button>
          ))}
          {activeFilterCount > 0 && <button className="filter-chip" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={clearFilters}>Clear All</button>}
        </div>
      </div>
      <div className="page-body" style={{ paddingBottom: selected.size > 0 ? 80 : undefined }}>
        <div className="talent-grid">
          {filtered.map(t => {
            const isSel = selected.has(t.id);
            return (
              <div key={t.id} className={`talent-card ${isSel ? 'selected' : ''}`} onClick={() => setDetail(t)}>
                <img src={t.photos[0]} alt={t.firstName} />
                <div className="card-check" style={isSel ? { background: 'var(--gold)', borderColor: 'var(--gold)' } : {}} onClick={e => { e.stopPropagation(); toggleSelect(t.id); }}>
                  {isSel && <Check size={14} color="var(--black)" />}
                </div>
                <div className="card-info">
                  <div className="card-name">{t.firstName} {t.lastName}</div>
                  <div className="card-sub">{t.city} · {t.heightCm}cm</div>
                  <div className="card-cat">{t.categories[0]}</div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--sub)', fontSize: 16 }}>No talent matches your filters</p>
            <button className="btn-outline" style={{ marginTop: 12 }} onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
      </div>
      {/* Selection Bar */}
      {selected.size > 0 && (
        <div className="selection-bar">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.size} talent selected</div>
            <span style={{ color: 'var(--sub)', fontSize: 12, cursor: 'pointer' }} onClick={() => setSelected(new Set())}>Clear selection</span>
          </div>
          <button className="btn-gold" onClick={() => { alert(`Selection of ${selected.size} talent submitted to Diamond Angels!`); setSelected(new Set()); }}>
            <Send size={16} /> Submit Selection
          </button>
        </div>
      )}
      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-close"><button onClick={() => setDetail(null)}><X size={18} /></button></div>
            <PhotoSlider photos={detail.photos} />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{detail.firstName} {detail.lastName}</h2>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 4 }}>
              {detail.city}, {detail.area} · {detail.race} · {detail.bodyType} · {detail.heightCm}cm
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {detail.categories.map((c, i) => <span key={i} className="chip">{c}</span>)}
            </div>
            <div className="section-header"><div className="section-title">Background</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{detail.background}</p>
            <div className="section-header"><div className="section-title">Qualifications</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{detail.qualifications}</p>
            <div className="section-header"><div className="section-title">Skills</div></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {detail.skills.map((s, i) => <span key={i} className="chip purple">{s}</span>)}
            </div>
            <div className="section-header"><div className="section-title">Work Experience</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{detail.workExperience}</p>
            <div className="section-header"><div className="section-title">Availability</div></div>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{detail.availability}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className={`btn-gold`} style={{ flex: 1, justifyContent: 'center', background: selected.has(detail.id) ? 'var(--green)' : undefined }} onClick={() => toggleSelect(detail.id)}>
                {selected.has(detail.id) ? <><Check size={16} /> Selected</> : <><Plus size={16} /> Select Talent</>}
              </button>
              <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Filter Modal */}
      {showFilters && (
        <div className="modal-overlay" onClick={() => setShowFilters(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Filter Talent</h3>
              <button className="btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={clearFilters}>Clear All</button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block' }}>City</label>
              <div className="filter-bar">
                <button className={`filter-chip ${!filterCity ? 'active' : ''}`} onClick={() => setFilterCity('')}>All</button>
                {cities.map(c => <button key={c} className={`filter-chip ${filterCity === c ? 'active' : ''}`} onClick={() => setFilterCity(c)}>{c}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block' }}>Race</label>
              <div className="filter-bar">
                <button className={`filter-chip ${!filterRace ? 'active' : ''}`} onClick={() => setFilterRace('')}>All</button>
                {races.map(r => <button key={r} className={`filter-chip ${filterRace === r ? 'active' : ''}`} onClick={() => setFilterRace(r)}>{r}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block' }}>Body Type</label>
              <div className="filter-bar">
                <button className={`filter-chip ${!filterBody ? 'active' : ''}`} onClick={() => setFilterBody('')}>All</button>
                {bodies.map(b => <button key={b} className={`filter-chip ${filterBody === b ? 'active' : ''}`} onClick={() => setFilterBody(b)}>{b}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block' }}>Category</label>
              <div className="filter-bar">
                <button className={`filter-chip ${!filterCat ? 'active' : ''}`} onClick={() => setFilterCat('')}>All</button>
                {cats.map(c => <button key={c} className={`filter-chip ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>)}
              </div>
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => setShowFilters(false)}>
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
