import { useState } from 'react';
import { TALENT } from '../data/talent';
import { MapPin, ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react';

export default function TalentProfile() {
  const [talent] = useState(TALENT[0]);
  const [photoIdx, setPhotoIdx] = useState(0);

  const HERO_H = 500;

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {/* Hero Photo */}
      <div style={{ position: 'relative', height: HERO_H }}>
        <img src={talent.photos[photoIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {talent.photos.length > 1 && (
          <>
            <button className="slider-nav prev" style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPhotoIdx(i => (i - 1 + talent.photos.length) % talent.photos.length)}><ChevronLeft size={20} /></button>
            <button className="slider-nav next" style={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPhotoIdx(i => (i + 1) % talent.photos.length)}><ChevronRight size={20} /></button>
          </>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(transparent, rgba(10,10,15,0.8), var(--bg))' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>{talent.firstName} {talent.lastName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <MapPin size={14} color="var(--gold)" />
            <span style={{ color: 'var(--sub)', fontSize: 14 }}>{talent.city}, {talent.area}</span>
            <span className="badge green" style={{ marginLeft: 8 }}>Approved</span>
          </div>
          {talent.photos.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {talent.photos.map((_: string, i: number) => (
                <div key={i} style={{ width: photoIdx === i ? 24 : 8, height: 4, borderRadius: 2, background: photoIdx === i ? 'var(--gold)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }} onClick={() => setPhotoIdx(i)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 24px 60px' }}>
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card" style={{ borderLeftColor: '#A78BFA' }}>
            <span className="stat-label">Height</span>
            <span className="stat-value">{talent.heightCm}<span style={{ fontSize: 13, color: 'var(--sub)' }}>cm</span></span>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#2DD4BF' }}>
            <span className="stat-label">Build</span>
            <span className="stat-value" style={{ fontSize: 17 }}>{talent.bodyType}</span>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#60A5FA' }}>
            <span className="stat-label">Race</span>
            <span className="stat-value" style={{ fontSize: 17 }}>{talent.race}</span>
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {talent.categories.map((c, i) => (
            <span key={i} style={{ background: 'rgba(201,168,76,0.15)', padding: '6px 12px', borderRadius: 16, border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', fontSize: 12, fontWeight: 600 }}>{c}</span>
          ))}
        </div>

        {/* Photo gallery thumbnails */}
        <div style={{ marginTop: 20, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Photos ({talent.photos.length}/5)</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {talent.photos.map((url: string, i: number) => (
            <div key={i} style={{ width: 80, height: 105, borderRadius: 12, overflow: 'hidden', border: photoIdx === i ? '2px solid var(--gold)' : '1px solid var(--border)', cursor: 'pointer', flexShrink: 0, position: 'relative' }} onClick={() => setPhotoIdx(i)}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--gold)', textAlign: 'center', padding: '1px 0' }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: '#000' }}>MAIN</span>
                </div>
              )}
            </div>
          ))}
          {talent.photos.length < 5 && (
            <div style={{ width: 80, height: 105, borderRadius: 12, border: '2px dashed rgba(201,168,76,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.04)', flexShrink: 0, cursor: 'pointer' }}>
              <Plus size={20} color="var(--gold)" />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', marginTop: 2 }}>Add</span>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="section-header" style={{ marginTop: 24 }}>
          <div className="section-icon" style={{ background: 'rgba(167,139,250,0.2)' }}>
            <Pencil size={14} color="#A78BFA" />
          </div>
          <div className="section-title">About Me</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{talent.background}</p>
        </div>

        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(245,158,11,0.2)' }}>
            <span style={{ fontSize: 14 }}>🎓</span>
          </div>
          <div className="section-title">Qualifications</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{talent.qualifications}</p>
        </div>

        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(45,212,191,0.2)' }}>
            <span style={{ fontSize: 14 }}>⚡</span>
          </div>
          <div className="section-title">Skills</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {talent.skills.map((s, i) => <span key={i} className="chip teal">{s}</span>)}
        </div>

        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(244,114,182,0.2)' }}>
            <span style={{ fontSize: 14 }}>⭐</span>
          </div>
          <div className="section-title">Talents</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {talent.talents.map((t: string, i: number) => <span key={i} className="chip pink">{t}</span>)}
        </div>

        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(251,146,60,0.2)' }}>
            <span style={{ fontSize: 14 }}>❤️</span>
          </div>
          <div className="section-title">Hobbies</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {talent.hobbies.map((h: string, i: number) => <span key={i} className="chip orange">{h}</span>)}
        </div>

        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(96,165,250,0.2)' }}>
            <span style={{ fontSize: 14 }}>💼</span>
          </div>
          <div className="section-title">Work Experience</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{talent.workExperience}</p>
        </div>

        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(52,211,153,0.2)' }}>
            <span style={{ fontSize: 14 }}>📅</span>
          </div>
          <div className="section-title">Availability</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{talent.availability}</p>
        </div>
      </div>
    </div>
  );
}
