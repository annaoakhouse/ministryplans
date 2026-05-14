// ===== Variation 3 — High-Contrast Spread =====
// Full-bleed navy chapter dividers alternating with white-paper form pages.
// Aggressive black uppercase Montserrat, brown accents, oversized digits.

(function () {
  const { useState, useEffect, useCallback } = React;
  const C = window.MP;

  // Module-level store so mp-submit.jsx can read/restore dynamic state.
  if (!window.__mpState) {
    window.__mpState = { ready: false };
  }

  /* ---------- atoms ---------- */
  const Field = ({ placeholder, style, on = 'paper', col, row }) =>
  <input type="text"
  className={'mp-input' + (on === 'dark' ? ' on-dark' : '')}
  placeholder={placeholder}
  data-mp-col={col}
  data-mp-row={row}
  style={style} />;

  const Area = ({ rows = 3, placeholder, on = 'paper', style, col, row }) =>
  <textarea className={'mp-area' + (on === 'dark' ? ' on-dark' : '')} rows={rows} placeholder={placeholder}
    data-mp-col={col} data-mp-row={row}
    style={style} />;


  /* ---------- chapter divider ---------- */
  const ChapterSpread = ({ num, title, kicker, mark }) =>
  <section style={{
    margin: '64px -64px 0',
    background: 'var(--ink)',
    color: 'var(--paper)',
    padding: '56px 64px 64px',
    position: 'relative',
    overflow: 'hidden'
  }}>
      <div style={{
      position: 'absolute',
      right: -40,
      top: -80,
      fontFamily: 'Montserrat',
      fontWeight: 900,
      fontSize: 460,
      lineHeight: 0.8,
      letterSpacing: '-0.05em',
      color: 'rgba(184,117,74,0.18)',
      zIndex: 0,
      userSelect: 'none'
    }}>{num}</div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ width: 36, height: 2, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 11, letterSpacing: '0.32em', color: 'var(--accent)', textTransform: 'uppercase' }}>{kicker}</span>
        </div>
        <h2 style={{ margin: 0, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 96, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--paper)', textTransform: 'uppercase' }}>
          {title}
        </h2>
        {mark &&
      <div style={{ marginTop: 22, fontFamily: 'Montserrat', fontWeight: 500, fontSize: 14, lineHeight: 1.6, color: 'rgba(244,237,225,0.65)', maxWidth: 620 }}>
            {mark}
          </div>
      }
      </div>
    </section>;


  /* paper sections sit on white between navy spreads */
  const Paper = ({ children, dark = false, pad = '56px 64px' }) =>
  <div style={{
    margin: '0 -64px',
    background: dark ? 'var(--ink)' : 'var(--white)',
    color: dark ? 'var(--paper)' : 'var(--ink)',
    padding: pad,
    position: 'relative'
  }}>
      {children}
    </div>;


  const Sub = ({ children, intro, dark, count }) =>
  <div style={{ marginTop: 40, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
        {count &&
      <span style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 56, lineHeight: 0.9, color: 'var(--accent)' }}>
            {count}
          </span>
      }
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 28, letterSpacing: '0.02em', textTransform: 'uppercase', color: dark ? 'var(--paper)' : 'var(--ink)' }}>
            {children}
          </h3>
        </div>
      </div>
      {intro &&
    <p style={{ margin: '12px 0 0', paddingLeft: count ? 80 : 0, fontFamily: 'Montserrat', fontWeight: 400, fontSize: 13, lineHeight: 1.6, color: dark ? 'rgba(244,237,225,0.65)' : 'var(--ink-soft)', maxWidth: 720 }}>
          {intro}
        </p>
    }
    </div>;


  const Tag = ({ children, dark }) =>
  <div style={{
    display: 'inline-block',
    fontFamily: 'Montserrat',
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: dark ? 'rgba(244,237,225,0.55)' : 'var(--ink-soft)',
    marginBottom: 6
  }}>{children}</div>;


  const Underline = ({ dark }) =>
  <div style={{ borderBottom: '2px solid', borderColor: dark ? 'var(--accent)' : 'var(--ink)', paddingBottom: 6 }} />;


  /* ---------- blocks ---------- */
  const SummaryGrid = () =>
  <div data-mp-region="summary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20 }}>
      {['Name', 'Role', 'Ministries', 'Departments'].map((label) =>
    <div key={label} data-mp-row="summary" data-mp-col={label.toLowerCase()}>
          <Tag dark>{label}</Tag>
          <Underline dark />
          <Field on="dark" col={label.toLowerCase()} row="summary" style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }} />
        </div>
    )}
    </div>;


  /* ---------- 1-10 scale picker for the Personal "How are you doing with The Five?" row ---------- */
  const ScaleRow = ({ scale, qNum }) => {
    const inputRef = React.useRef(null);
    const [value, setValue] = useState('');
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;
      const handler = () => setValue(input.value);
      input.addEventListener('input', handler);
      setValue(input.value);
      return () => input.removeEventListener('input', handler);
    }, []);
    const select = (n) => {
      const next = value === String(n) ? '' : String(n);
      const input = inputRef.current;
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, next);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setValue(next);
    };
    return (
      <div style={{ marginBottom: 8 }}>
        <input ref={inputRef} type="text"
          data-mp-row={'five.' + scale}
          data-mp-col={'Q' + qNum}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          tabIndex={-1} aria-hidden="true" readOnly />
        <div style={{
          fontFamily: 'Montserrat', fontWeight: 800, fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 3, lineHeight: 1.2,
        }}>{scale}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2 }}>
          {[1,2,3,4,5,6,7,8,9,10].map((n) => {
            const active = value === String(n);
            return (
              <button key={n} type="button" onClick={() => select(n)} className="mp-print-hide" style={{
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--ink)',
                border: '1px solid var(--ink)',
                fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9,
                padding: 0, height: 18, lineHeight: 1, cursor: 'pointer',
              }}>{n}</button>
            );
          })}
        </div>
        {/* Print-only display of the chosen value */}
        <div style={{ display: 'none' }} className="mp-print-only" />
      </div>
    );
  };
  const ScaleCell = ({ qNum }) =>
    <div>
      {C.PERSONAL_FIVE_SCALES.map((s) => <ScaleRow key={s} scale={s} qNum={qNum} />)}
    </div>;

  const Personal = ({ dark, dateLabels, subLabels }) =>
  <div data-mp-region="personal">
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: 0, border: dark ? '1.5px solid var(--accent)' : '1.5px solid var(--ink)' }}>
        <div style={{ padding: '14px 16px', borderRight: dark ? '1px solid rgba(184,117,74,0.4)' : '1px solid var(--ink)', background: dark ? 'rgba(184,117,74,0.18)' : 'var(--paper-2)' }}>
          <Tag dark={dark}>Reflection</Tag>
        </div>
        {C.QUARTERS.map((q, i) =>
      <div key={q.label} style={{
        padding: '14px 16px',
        borderRight: i === 3 ? 'none' : dark ? '1px solid rgba(184,117,74,0.4)' : '1px solid var(--ink)',
        background: dark ? 'rgba(184,117,74,0.18)' : 'var(--paper-2)'
      }}>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 13, letterSpacing: '0.02em', lineHeight: 1.2, color: dark ? 'var(--paper)' : 'var(--ink)', textTransform: 'uppercase' }}>{(dateLabels && dateLabels[i]) || ('Q' + q.n)}</div>
            {(subLabels && subLabels[i]) && <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', lineHeight: 1.4, color: 'var(--accent)', textTransform: 'uppercase', marginTop: 4 }}>{subLabels[i]}</div>}
          </div>
      )}
        {C.PERSONAL_PROMPTS.map((p, ri) => {
          const isFiveScales = ri === 0;
          return (
            <React.Fragment key={p}>
              <div style={{
                padding: '16px',
                borderTop: dark ? '1px solid rgba(184,117,74,0.4)' : '1px solid var(--ink)',
                borderRight: dark ? '1px solid rgba(184,117,74,0.4)' : '1px solid var(--ink)',
                minHeight: isFiveScales ? 220 : 110,
              }}>
                <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 13, lineHeight: 1.4, color: dark ? 'var(--paper)' : 'var(--ink)' }}>{p}</span>
              </div>
              {[0, 1, 2, 3].map((ci) =>
                <div key={ci} data-mp-row={p} data-mp-col={'Q' + (ci + 1)} style={{
                  padding: isFiveScales ? '12px 10px' : 12,
                  borderTop: dark ? '1px solid rgba(184,117,74,0.4)' : '1px solid var(--ink)',
                  borderRight: ci === 3 ? 'none' : dark ? '1px solid rgba(184,117,74,0.4)' : '1px solid var(--ink)',
                  minHeight: isFiveScales ? 220 : 110,
                }}>
                  {isFiveScales
                    ? <ScaleCell qNum={ci + 1} />
                    : <Area rows={4} on={dark ? 'dark' : 'paper'} row={p} col={'Q' + (ci + 1)} />}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>;


  const Values = ({ rows, setRows }) => {
    const addRow = () => setRows(rows + 1);
    const removeRow = () => setRows(Math.max(1, rows - 1));
    return (
      <div data-mp-region="values">
        {Array.from({ length: rows }).map((_, ri) =>
          <div key={ri} style={{ marginBottom: 24, borderTop: '3px solid var(--ink)', paddingTop: 16, position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1.5px solid var(--ink)' }} data-mp-row={String(ri)}>
              {C.VALUES_COLS.map((col, ci) =>
                <div key={col} data-mp-col={col} style={{
                  padding: '14px 14px 18px',
                  minHeight: 170,
                  borderRight: ci === 3 ? 'none' : '1px solid var(--ink)',
                  background: ci % 2 ? 'transparent' : 'rgba(29,39,51,0.04)'
                }}>
                  <Tag>{col}</Tag>
                  <div style={{ borderBottom: '1.5px solid var(--ink)', marginBottom: 10 }} />
                  <Area rows={5} row={String(ri)} col={col} />
                </div>
              )}
            </div>
            {rows > 1 && ri === rows - 1 &&
              <button
                onClick={removeRow}
                className="mp-print-hide"
                title="Remove last value"
                style={{
                  position: 'absolute', top: 10, right: 0,
                  width: 22, height: 22, border: 'none', background: 'transparent',
                  color: 'var(--ink-soft)', fontFamily: 'Montserrat',
                  fontWeight: 700, fontSize: 16, cursor: 'pointer', lineHeight: 1,
                }}>×</button>
            }
          </div>
        )}
        <button
          onClick={addRow}
          className="mp-print-hide"
          style={{
            marginTop: 4, padding: '10px 18px',
            background: 'transparent', border: '2px dashed var(--ink)', cursor: 'pointer',
            fontFamily: 'Montserrat', fontWeight: 900, fontSize: 11,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
          onMouseOver={(e) => {e.currentTarget.style.background = 'var(--ink)';e.currentTarget.style.color = 'var(--paper)';}}
          onMouseOut={(e) => {e.currentTarget.style.background = 'transparent';e.currentTarget.style.color = 'var(--ink)';}}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add value
        </button>
      </div>
    );
  };


  const FiveBlock = ({ questions }) =>
  <div data-mp-region="five">
      {questions.map((q, i) =>
      <div key={i} data-mp-row={'Q' + (i + 1)} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', borderBottom: '1.5px solid var(--ink)', padding: '18px 0' }}>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 28, color: 'var(--accent)', lineHeight: 1 }}>0{i + 1}</div>
          <div data-mp-col="answer">
            <h5 style={{ margin: '0 0 10px', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 16, color: 'var(--ink)', lineHeight: 1.35 }}>{q}</h5>
            <Area rows={3} row={'Q' + (i + 1)} col="answer" />
          </div>
        </div>
      )}
    </div>;


  const GoalRow = ({ cat, idx, columnMap }) =>
  <div data-mp-row={cat} style={{ display: 'grid', gridTemplateColumns: '200px 1.1fr 1.1fr 1.1fr 110px 1.4fr', borderTop: idx === 0 ? '3px solid var(--ink)' : '1px solid var(--ink)', minHeight: 140 }}>
      <div style={{ padding: '18px 18px', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: 4 }}>0{idx + 1}</div>
        <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 18, letterSpacing: 0, textTransform: 'uppercase', lineHeight: 1.05 }}>{cat}</div>
      </div>
      {['Goal', 'Why does this matter?', 'Tracking for success', 'Quarter', 'Action steps'].map((col, ci) => {
        const key = (columnMap || {})[col] || col.toLowerCase().split(' ')[0];
        return (
        <div key={col} data-mp-col={key} style={{ padding: '14px 14px', borderLeft: '1px solid var(--ink)' }}>
          <Tag>{col}</Tag>
          {col === 'Quarter' ?
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 6px', marginTop: 8 }}>
              {[1, 2, 3, 4].map((q) =>
        <label key={q} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11, color: 'var(--ink)', cursor: 'pointer' }}>
                  <input type="checkbox" data-mp-row={cat} data-mp-col="quarters" style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            width: 14,
            height: 14,
            margin: 0,
            border: '1.5px solid var(--ink)',
            borderRadius: 0,
            background: 'transparent',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0
          }} onChange={(e) => {
            e.target.style.background = e.target.checked ? 'var(--ink)' : 'transparent';
          }} />
                  Q{q}
                </label>
        )}
            </div> :

      <Area rows={4} row={cat} col={key} />
      }
        </div>
      );
      })}
    </div>;


  const TeamGrowth = ({ teams, setTeams }) => {
    const addTeam = () => setTeams([...teams, 'New team']);
    const removeTeam = (i) => setTeams(teams.filter((_, idx) => idx !== i));
    const renameTeam = (i, v) => setTeams(teams.map((t, idx) => idx === i ? v : t));

    return (
      <div data-mp-region="teamgrowth">
        <div style={{ border: '3px solid var(--ink)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 36px', background: 'var(--ink)', color: 'var(--paper)' }}>
            <div style={{ padding: '12px 16px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Team</div>
            {C.TEAM_COLS.map((col) =>
            <div key={col} style={{ padding: '12px 14px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', borderLeft: '1px solid rgba(184,117,74,0.5)' }}>{col}</div>
            )}
            <div style={{ borderLeft: '1px solid rgba(184,117,74,0.5)' }} />
          </div>
          {teams.map((team, ri) =>
          <div key={ri} data-mp-row={team} style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 36px', borderTop: ri === 0 ? 'none' : '1px solid var(--ink)' }}>
              <div style={{ padding: '14px 14px 14px 16px', background: 'rgba(29,39,51,0.06)', display: 'flex', alignItems: 'flex-start' }}>
                <input
                type="text"
                value={team}
                onChange={(e) => renameTeam(ri, e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1.5px dashed rgba(29,39,51,0.35)',
                  outline: 'none',
                  fontFamily: 'Montserrat',
                  fontWeight: 900,
                  fontSize: 17,
                  letterSpacing: '0.02em',
                  color: 'var(--ink)',
                  textTransform: 'uppercase',
                  padding: '4px 0 6px'
                }} />
              
              </div>
              {C.TEAM_COLS.map((col, ci) => {
              const colKeys = ['current', 'goal', 'priority', 'actions'];
              const key = colKeys[ci];
              return (
            <div key={ci} data-mp-col={key} style={{ padding: '14px', borderLeft: '1px solid var(--ink)', minHeight: 110 }}>
                  <Area rows={3} row={team} col={key} />
                </div>
              );
              })}
              <div style={{
              borderLeft: '1px solid var(--ink)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 10
            }} className="mp-print-hide">
                <button
                onClick={() => removeTeam(ri)}
                title="Remove team"
                disabled={teams.length <= 1}
                style={{
                  width: 22,
                  height: 22,
                  border: 'none',
                  background: 'transparent',
                  color: teams.length <= 1 ? 'rgba(29,39,51,0.2)' : 'var(--ink-soft)',
                  fontFamily: 'Montserrat',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: teams.length <= 1 ? 'not-allowed' : 'pointer',
                  lineHeight: 1
                }}>
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={addTeam}
          className="mp-print-hide"
          style={{
            marginTop: 12,
            padding: '10px 18px',
            background: 'transparent',
            border: '2px dashed var(--ink)',
            cursor: 'pointer',
            fontFamily: 'Montserrat',
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10
          }}
          onMouseOver={(e) => {e.currentTarget.style.background = 'var(--ink)';e.currentTarget.style.color = 'var(--paper)';}}
          onMouseOut={(e) => {e.currentTarget.style.background = 'transparent';e.currentTarget.style.color = 'var(--ink)';}}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add team
        </button>
      </div>);

  };

  const MetricsBlock = ({ rows, setRows }) => {
    const addRow = () => setRows(rows + 1);
    const removeRow = () => setRows(Math.max(1, rows - 1));
    const gridCols = 'minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1.5fr) 40px';
    const colKeys = ['description', 'previous', 'change', 'tracking', 'goal', 'actions'];
    return (
      <div data-mp-region="metrics">
        <div style={{ border: '3px solid var(--ink)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, background: 'var(--ink)', color: 'var(--paper)' }}>
            {C.METRICS_COLS.map((col, i) =>
              <div key={col} style={{ padding: '12px 12px', borderLeft: i === 0 ? 'none' : '1px solid rgba(184,117,74,0.5)', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', lineHeight: 1.4 }}>
                {col}
              </div>
            )}
            <div style={{ borderLeft: '1px solid rgba(184,117,74,0.5)' }} />
          </div>
          {Array.from({ length: rows }).map((_, ri) =>
            <div key={ri} data-mp-row={String(ri)} style={{ display: 'grid', gridTemplateColumns: gridCols, borderTop: '1px solid var(--ink)', background: ri % 2 ? 'rgba(29,39,51,0.04)' : 'transparent' }}>
              {C.METRICS_COLS.map((_, ci) =>
                <div key={ci} data-mp-col={colKeys[ci]} style={{ padding: 12, borderLeft: ci === 0 ? 'none' : '1px solid var(--ink)', minHeight: 72 }}>
                  <Area rows={2} row={String(ri)} col={colKeys[ci]} />
                </div>
              )}
              <div className="mp-print-hide" style={{ borderLeft: '1px solid var(--ink)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10 }}>
                {ri === rows - 1 && rows > 1 &&
                  <button
                    onClick={removeRow}
                    title="Remove last row"
                    style={{
                      width: 22,
                      height: 22,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink-soft)',
                      fontFamily: 'Montserrat',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}>
                    ×
                  </button>
                }
              </div>
            </div>
          )}
        </div>
        <button
          onClick={addRow}
          className="mp-print-hide"
          style={{
            marginTop: 12,
            padding: '10px 18px',
            background: 'transparent',
            border: '2px dashed var(--ink)',
            cursor: 'pointer',
            fontFamily: 'Montserrat',
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--paper)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)'; }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add metric
        </button>
      </div>);
  };

  const ProgrammingBlock = () =>
  <div data-mp-region="programming" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '3px solid var(--ink)' }}>
      {C.PROGRAMMING_QUESTIONS.map((q, i) => {
      const keys = ['stop', 'change', 'add', 'challenges'];
      const key = keys[i] || ('q' + (i + 1));
      return (
    <div key={i} data-mp-row={key} style={{
      padding: '20px 22px 22px',
      borderRight: i % 2 === 0 ? '1.5px solid var(--ink)' : 'none',
      borderBottom: i < 2 ? '1.5px solid var(--ink)' : 'none'
    }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 36, color: 'var(--accent)', lineHeight: 0.9 }}>0{i + 1}</span>
            <h5 style={{ margin: 0, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 14, color: 'var(--ink)', lineHeight: 1.35 }}>{q}</h5>
          </div>
          <Area rows={4} row={key} col="answer" />
        </div>
      );
      })}
    </div>;


  const QuarterCalendarTabs = () => {
    const [active, setActive] = useState(1);
    return (
      <div data-mp-quarter-tabs>
        <div className="mp-print-hide" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginBottom: 14,
        }}>
          {C.QUARTERS.map((qq, i) => {
            const isActive = active === qq.n;
            return (
              <button
                key={qq.n}
                onClick={() => setActive(qq.n)}
                style={{
                  padding: '14px 14px',
                  background: isActive ? 'var(--ink)' : 'transparent',
                  color: isActive ? 'var(--paper)' : 'var(--ink)',
                  border: '1.5px solid var(--ink)',
                  borderLeft: i === 0 ? '1.5px solid var(--ink)' : 'none',
                  fontFamily: 'Montserrat',
                  fontWeight: 900,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'background 120ms ease, color 120ms ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(29,39,51,0.06)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}>
                <span style={{ fontSize: 22, letterSpacing: '0.02em', lineHeight: 1 }}>Q{qq.n}</span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  opacity: isActive ? 0.75 : 0.6,
                }}>
                  {qq.months.join(' · ')}
                </span>
              </button>
            );
          })}
        </div>
        {C.QUARTERS.map((qq) =>
          <div
            key={qq.n}
            className="mp-quarter-panel"
            data-active={active === qq.n ? 'true' : 'false'}
            style={{ display: active === qq.n ? 'block' : 'none' }}>
            <QuarterCalendar q={qq} />
          </div>
        )}
      </div>
    );
  };

  const QuarterCalendar = ({ q }) =>
  <div data-mp-region={'calendar.Q' + q.n} style={{ marginBottom: 32 }}>
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 22px', display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 14, letterSpacing: '0.22em', color: 'var(--accent)' }}>QUARTER</span>
        <span style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 40, lineHeight: 1 }}>0{q.n}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(244,237,225,0.7)' }}>{q.months.join('  ·  ')}</span>
      </div>
      <div style={{ border: '3px solid var(--ink)', borderTop: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(3, 1fr)' }}>
          <div style={{ padding: '10px 12px', borderRight: '1.5px solid var(--ink)' }} />
          {q.months.map((m, i) =>
        <div key={m} style={{ padding: '10px 12px', borderRight: i === 2 ? 'none' : '1.5px solid var(--ink)', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)' }}>
              {m}
            </div>
        )}
          {[1, 2, 3, 4].map((wk, ri) =>
        <React.Fragment key={wk}>
              <div style={{ padding: '12px', borderTop: '1.5px solid var(--ink)', borderRight: '1.5px solid var(--ink)', background: 'rgba(29,39,51,0.06)', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', color: 'var(--ink)', textTransform: 'uppercase' }}>
                WK 0{wk}
              </div>
              {[0, 1, 2].map((ci) =>
          <div key={ci} data-mp-row={'wk' + wk} data-mp-col={q.months[ci]} style={{
            padding: 12,
            borderTop: '1.5px solid var(--ink)',
            borderRight: ci === 2 ? 'none' : '1.5px solid var(--ink)',
            minHeight: 70
          }}>
                  <Area rows={2} row={'wk' + wk} col={q.months[ci]} />
                </div>
          )}
            </React.Fragment>
        )}
        </div>
      </div>
    </div>;


  const ResourcesBlock = ({ cols, rows, setRows }) => {
    const addRow = () => setRows(rows + 1);
    const removeRow = () => setRows(Math.max(1, rows - 1));

    const colKeys = ['event', 'financial', 'staff', 'volunteer', 'reality', 'dream'];

    // Single grid for both header and body so columns line up exactly.
    const gridCols = 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.2fr) 40px';

    return (
      <div data-mp-region="resources">
        <div style={{ border: '3px solid var(--ink)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, background: 'var(--ink)', color: 'var(--paper)' }}>
            {cols.map((col, i) =>
            <div key={col} style={{ padding: '12px 12px', borderLeft: i === 0 ? 'none' : '1px solid rgba(184,117,74,0.5)', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', lineHeight: 1.4 }}>
                {col}
              </div>
            )}
            <div style={{ borderLeft: '1px solid rgba(184,117,74,0.5)' }} />
          </div>
          {Array.from({ length: rows }).map((_, ri) =>
          <div key={ri} data-mp-row={String(ri)} style={{ display: 'grid', gridTemplateColumns: gridCols, borderTop: '1px solid var(--ink)', background: ri % 2 ? 'rgba(29,39,51,0.04)' : 'transparent' }}>
              {cols.map((_, ci) =>
            <div key={ci} data-mp-col={colKeys[ci]} style={{ padding: 12, borderLeft: ci === 0 ? 'none' : '1px solid var(--ink)', minHeight: 80 }}>
                  <Area rows={3} row={String(ri)} col={colKeys[ci]} />
                </div>
            )}
              <div className="mp-print-hide" style={{ borderLeft: '1px solid var(--ink)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10 }}>
                {ri === rows - 1 && rows > 1 &&
              <button
                onClick={removeRow}
                title="Remove last row"
                style={{
                  width: 22,
                  height: 22,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink-soft)',
                  fontFamily: 'Montserrat',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  lineHeight: 1
                }}>
                    ×
                  </button>
              }
              </div>
            </div>
          )}
        </div>
        <button
          onClick={addRow}
          className="mp-print-hide"
          style={{
            marginTop: 12,
            padding: '10px 18px',
            background: 'transparent',
            border: '2px dashed var(--ink)',
            cursor: 'pointer',
            fontFamily: 'Montserrat',
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10
          }}
          onMouseOver={(e) => {e.currentTarget.style.background = 'var(--ink)';e.currentTarget.style.color = 'var(--paper)';}}
          onMouseOut={(e) => {e.currentTarget.style.background = 'transparent';e.currentTarget.style.color = 'var(--ink)';}}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add row
        </button>
      </div>);

  };

  /* ---------- Tab bar (entries + personal) ---------- */
  const Tab = ({ active, onClick, label, type, editable, onRename, onRemove, placeholder }) => {
    const typeBadge = type === 'ministry' ? 'M' : type === 'department' ? 'D' : type === 'personal' ? 'P' : null;
    return (
      <div onClick={onClick} style={{
        padding: '10px 16px',
        borderRight: '1px solid rgba(244,237,225,0.18)',
        cursor: 'pointer',
        background: active ? 'var(--paper)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--paper)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Montserrat',
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: '0.04em',
        transition: 'background 120ms ease, color 120ms ease',
        whiteSpace: 'nowrap',
      }}>
        {typeBadge && (
          <span style={{
            fontSize: 9, letterSpacing: '0.18em', fontWeight: 900,
            padding: '2px 5px', border: '1px solid currentColor',
            opacity: active ? 0.65 : 0.55,
          }}>{typeBadge}</span>
        )}
        {editable ? (
          <input
            type="text"
            value={label}
            placeholder={placeholder || 'Untitled'}
            onChange={(e) => onRename(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            spellCheck={false}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit',
              fontSize: 'inherit', letterSpacing: 'inherit', padding: 0,
              width: Math.max(8, (label || placeholder || 'Untitled').length) + 'ch',
              maxWidth: 200,
            }}
          />
        ) : (
          <span>{label}</span>
        )}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm('Remove this tab and all its data?')) onRemove(); }}
            title="Remove"
            className="mp-print-hide"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'inherit', opacity: 0.45, fontSize: 14, lineHeight: 1,
              padding: '0 2px', marginLeft: 2,
            }}>×</button>
        )}
      </div>
    );
  };

  const TabBar = ({ entries, activeId, setActiveId, addEntry, removeEntry, updateEntry, showPersonal }) => {
    return (
      <div className="mp-tabbar" style={{
        position: 'sticky', top: 0, zIndex: 20,
        margin: '0 -64px',
        background: 'var(--ink)',
        borderBottom: '2px solid var(--accent)',
        padding: '8px 64px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        flexWrap: 'wrap',
        rowGap: 4,
      }}>
        <div style={{
          fontFamily: 'Montserrat', fontWeight: 900, fontSize: 10,
          letterSpacing: '0.28em', color: 'var(--accent)',
          textTransform: 'uppercase', marginRight: 14, padding: '8px 0',
        }}>Plan ·</div>
        {showPersonal && (
          <Tab
            active={activeId === 'personal'}
            onClick={() => setActiveId('personal')}
            label="Personal"
            type="personal" />
        )}
        {entries.map(entry => (
          <Tab
            key={entry.id}
            active={activeId === entry.id}
            onClick={() => setActiveId(entry.id)}
            label={entry.name}
            placeholder={entry.type === 'ministry' ? 'Ministry name' : 'Department name'}
            type={entry.type}
            editable
            onRename={(name) => updateEntry(entry.id, { name })}
            onRemove={() => removeEntry(entry.id)} />
        ))}
        <button onClick={() => addEntry('ministry')} className="mp-print-hide" style={tabbarAddBtnStyle}>
          + Ministry
        </button>
        <button onClick={() => addEntry('department')} className="mp-print-hide" style={tabbarAddBtnStyle}>
          + Department
        </button>
      </div>
    );
  };

  const tabbarAddBtnStyle = {
    padding: '10px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Montserrat',
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginLeft: 6,
  };

  /* ---------- Entry panel (one ministry or department) ---------- */
  const EntryPanel = ({ entry, updateEntry }) => {
    const isMinistry = entry.type === 'ministry';
    let letterIdx = 0;
    const L = () => String.fromCharCode(65 + (letterIdx++)) + '.';

    return (
      <React.Fragment>
        <ChapterSpread num="01" kicker={`Part One · ${entry.type === 'ministry' ? 'Ministry' : 'Department'}`} title={entry.name || (isMinistry ? 'Untitled Ministry' : 'Untitled Department')} mark={isMinistry
          ? "Values and the metrics behind them, strategic goals, The Five, and your teams — the shape of what you'll lead this year."
          : "Values, the metrics behind them, The Five, and your teams — the shape of what this department will lead this year."} />
        <Paper>
          <Sub count={L()} intro={isMinistry ? C.VALUES_INTRO_MINISTRY : C.VALUES_INTRO_DEPARTMENT}>Values</Sub>
          <Values rows={entry.valuesRows} setRows={(n) => updateEntry({ valuesRows: typeof n === 'function' ? n(entry.valuesRows) : n })} />
          <div style={{ marginTop: 10, padding: '12px 18px', background: 'var(--ink)', color: 'var(--accent)', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            These values inform every other section that follows.
          </div>

          <Sub count={L()} intro={isMinistry
            ? "Track attendance, baptisms, prayer visits, email opens, money spent on consultants — whatever signals success. Knowing where you are now is what makes the goals below meaningful."
            : "Track whatever signals success for this department — output, response times, costs, satisfaction, whatever you measure. Knowing where you are now is what makes the goals below meaningful."}>Tracking Metrics</Sub>
          <MetricsBlock rows={entry.metricsRows} setRows={(n) => updateEntry({ metricsRows: typeof n === 'function' ? n(entry.metricsRows) : n })} />

          {isMinistry && <React.Fragment>
            <Sub count={L()} intro="Three categories — same shape, different weight. Plan something fun, something risky, and something excellent this year.">Top Strategic Goals</Sub>
            <div data-mp-region="goals" style={{ border: '3px solid var(--ink)' }}>
              {C.GOAL_CATEGORIES.map((cat, i) => <GoalRow key={cat} cat={cat} idx={i} columnMap={{'Goal':'goal','Why does this matter?':'why','Tracking for success':'tracking','Quarter':'quarters','Action steps':'actions'}} />)}
            </div>
          </React.Fragment>}

          <Sub count={L()} intro={C.FIVE_BLURB}>The Five</Sub>
          <FiveBlock questions={isMinistry ? C.FIVE_QUESTIONS_MINISTRY : C.FIVE_QUESTIONS_DEPARTMENT} />

          <Sub count={L()} intro="Add a row for each team you want to track independently — volunteers, leaders, worship, hospitality, whoever.">Team Growth</Sub>
          <TeamGrowth teams={entry.teams} setTeams={(t) => updateEntry({ teams: typeof t === 'function' ? t(entry.teams) : t })} />

          <Sub count={L()}>Team Care</Sub>
          <div data-mp-region="teamcare" style={{ border: '3px solid var(--ink)' }}>
            {C.CARE_CATEGORIES.map((cat, i) => <GoalRow key={cat} cat={cat} idx={i} columnMap={{'Goal':'goal','Why does this matter?':'why','Tracking for success':'tracking','Quarter':'quarters','Action steps':'actions'}} />)}
          </div>

          {isMinistry && <React.Fragment>
            <Sub count={L()} intro="Now that you've spent time with your values, metrics, goals, and team, consider how those will impact your programming.">Incorporating Values + Data</Sub>
            <ProgrammingBlock />
          </React.Fragment>}
        </Paper>

        <ChapterSpread num="02" kicker="Part Two" title={isMinistry ? 'Calendaring' : 'Dept. Calendaring'} mark={isMinistry
          ? "The calendar is where values, data, and goals become a year. Plan the shape first, then plan what you'll need to pull it off."
          : "The calendar is where projects and deadlines line up across the year. Plot the year, then plan what you'll need to deliver."} />
        <Paper>
          <Sub count={L()} intro={isMinistry
            ? "Based on the information above, write out a loose ministry calendar for the year. Q1 is open by default — click any quarter tab to flip to it."
            : "Map out the projects, deadlines, and milestones for each month of the year. Q1 is open by default — click any quarter tab to flip to it."}>
            {isMinistry ? 'Big Picture Calendaring' : 'Projects + Deadlines'}
          </Sub>
          <QuarterCalendarTabs />

          <Sub count={L()} intro={isMinistry
            ? "Based on your calendar, what should you consider as you plan the details for this ministry year?"
            : "Based on your projects and deadlines, what will you need to deliver them this year?"}>Resources Needed</Sub>
          <ResourcesBlock cols={isMinistry ? C.RESOURCES_COLS_MINISTRY : C.RESOURCES_COLS_DEPARTMENT} rows={entry.resourcesRows} setRows={(n) => updateEntry({ resourcesRows: typeof n === 'function' ? n(entry.resourcesRows) : n })} />
        </Paper>
      </React.Fragment>
    );
  };

  const PERSONAL_DATE_LABELS = [
    'Start of the Year',
    'End of Quarter 1',
    'Mid Year',
    'End of Quarter 3',
  ];
  const PERSONAL_SUB_LABELS = [
    'July',
    'September',
    'January',
    'March',
  ];

  /* ---------- Personal panel (inline tab, separate plan key) ---------- */
  const PersonalPanelInline = ({ personalKey }) => {
    const isLive = !!window.MP_BACKEND_URL;
    const needsSetup = isLive && !personalKey;
    return (
      <React.Fragment>
        <ChapterSpread num="01" kicker="Part One · Personal" title="Personal Plan" mark="A plan starts with the person making it. These pages are for you — your soul, your joy, your weight, your growth — to be revisited four times this year." />
        {needsSetup && (
          <div className="mp-print-hide" style={{
            margin: '0 -64px',
            padding: '20px 64px',
            background: 'rgba(184,117,74,0.12)',
            borderBottom: '1px solid rgba(184,117,74,0.4)',
            color: 'var(--ink)',
            fontFamily: 'Montserrat',
            fontSize: 12,
            lineHeight: 1.6,
          }}>
            <strong style={{ fontWeight: 900, letterSpacing: '0.04em' }}>⚠ Personal section needs setup.</strong> This page is loading shared plan data only. To autosave personal reflections separately, the page URL needs a <code style={{ fontFamily: 'monospace' }}>?personal=YOUR-NAME</code> parameter (in addition to <code style={{ fontFamily: 'monospace' }}>?plan=...</code>).
          </div>
        )}
        <Paper>
          <Sub intro="Each quarter, return to these five prompts. Be honest. The numbers below come back around in December, March, and June.">Personal Development</Sub>
          <Personal dateLabels={PERSONAL_DATE_LABELS} subLabels={PERSONAL_SUB_LABELS} />
        </Paper>
      </React.Fragment>
    );
  };

  /* ---------- the workbook ---------- */
  const newEntryId = () => 'e' + Math.random().toString(36).slice(2, 9);
  const blankEntry = (type) => ({
    id: newEntryId(),
    type: type || 'ministry',
    name: '',
    valuesRows: 1,
    metricsRows: 2,
    teams: ['Volunteers', 'Leaders'],
    resourcesRows: 2,
  });

  const ContrastSpread = () => {
    const [entries, setEntries] = useState(() => [blankEntry('ministry')]);
    const [activeId, setActiveId] = useState(() => entries[0].id);

    // Personal tab: live mode reads ?personal= URL param; standalone always shows it.
    const personalKey = (() => {
      try { return new URLSearchParams(window.location.search).get('personal') || ''; }
      catch (e) { return ''; }
    })();
    const isLive = !!window.MP_BACKEND_URL;
    const showPersonal = !isLive || !!personalKey || !!window.MP_INCLUDE_PERSONAL;

    const addEntry = useCallback((type) => {
      const e = blankEntry(type);
      setEntries((es) => [...es, e]);
      setActiveId(e.id);
    }, []);
    const removeEntry = useCallback((id) => {
      setEntries((es) => {
        const remaining = es.filter((e) => e.id !== id);
        // Move active away if needed
        if (activeId === id) {
          if (remaining.length > 0) setActiveId(remaining[0].id);
          else if (showPersonal) setActiveId('personal');
        }
        return remaining;
      });
    }, [activeId, showPersonal]);
    const updateEntry = useCallback((id, patch) => {
      setEntries((es) => es.map((e) => e.id === id ? { ...e, ...patch } : e));
    }, []);

    // Publish state to mp-live for save/restore.
    useEffect(() => {
      window.__mpState = {
        ready: true,
        entries, setEntries,
        activeId, setActiveId,
        personalKey,
        addEntry, removeEntry, updateEntry,
      };
      window.dispatchEvent(new Event('mp-state-ready'));
    }, [entries, activeId, personalKey, addEntry, removeEntry, updateEntry]);

    return (
      <div style={{
        background: 'var(--white)',
        color: 'var(--ink)',
        fontFamily: 'Montserrat, sans-serif',
        padding: '0 64px',
        minHeight: '100%',
        position: 'relative'
      }}>
        {/* ===== Cover — full-bleed navy ===== */}
        <section style={{
          margin: '0 -64px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '64px 64px 56px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: -50, bottom: -100, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 540, lineHeight: 0.8, letterSpacing: '-0.05em', color: 'rgba(184,117,74,0.14)', userSelect: 'none' }}>
            27
          </div>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="assets/icon-blue.png" alt="" style={{ width: 36, height: 36, background: 'var(--paper)', borderRadius: '50%' }} />
              <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 10, letterSpacing: '0.32em', color: 'var(--paper)' }}>OAKHOUSE CHURCH</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 10, letterSpacing: '0.32em', color: 'var(--accent)' }}>ANNUAL PLANNER</span>
              <div style={{ marginTop: 6, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 32, letterSpacing: '0.04em', color: 'var(--paper)' }}>'26 / '27</div>
            </div>
          </header>

          <div style={{ marginTop: 86, position: 'relative', zIndex: 1 }}>
            <Tag dark>The Annual</Tag>
            <h1 style={{ margin: 0, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 156, lineHeight: 0.85, letterSpacing: '-0.04em', color: 'var(--paper)', textTransform: 'uppercase' }}>
              Ministry<br />Plan
            </h1>
            <p style={{ marginTop: 28, maxWidth: 540, fontFamily: 'Montserrat', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,225,0.75)' }}>
              A year of intention, rhythm, and risk — for the ministries and departments entrusted to your care.
            </p>
            <p className="mp-print-hide" style={{ marginTop: 28, maxWidth: 540, fontFamily: 'Montserrat', fontWeight: 600, fontSize: 11, lineHeight: 1.65, letterSpacing: '0.04em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              Add a tab below for each ministry and department this plan covers. Each one is its own independent workbook.
            </p>
          </div>
        </section>

        {/* Sticky tab bar — switches between entries + optional Personal */}
        <TabBar
          entries={entries}
          activeId={activeId}
          setActiveId={setActiveId}
          addEntry={addEntry}
          removeEntry={removeEntry}
          updateEntry={updateEntry}
          showPersonal={showPersonal}
        />

        {/* Mount point for the live mp-live.jsx submitter block (quarter / year picker) */}
        <div id="mp-submitter-mount"></div>

        {/* Personal panel — always rendered (when shown) but display-toggled by active tab */}
        {showPersonal && (
          <div data-mp-personal-root style={{ display: activeId === 'personal' ? 'block' : 'none' }}>
            <PersonalPanelInline personalKey={personalKey} />
          </div>
        )}

        {/* Entry panels — all rendered (so mp-live can snapshot) but display-toggled */}
        {entries.map((entry) =>
          <div key={entry.id} data-mp-entry={entry.id} style={{ display: activeId === entry.id ? 'block' : 'none' }}>
            <EntryPanel entry={entry} updateEntry={(patch) => updateEntry(entry.id, patch)} />
          </div>
        )}

        {/* Empty state — no entries, personal tab not active */}
        {entries.length === 0 && activeId !== 'personal' && (
          <div style={{ padding: '120px 64px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 11, letterSpacing: '0.28em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14 }}>Empty plan</div>
            <h2 style={{ margin: '0 0 16px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--ink)', textTransform: 'uppercase' }}>Add a ministry<br/>or department</h2>
            <p style={{ margin: '0 auto 28px', maxWidth: 480, fontFamily: 'Montserrat', fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              Each tab is its own independent workbook — values, metrics, the five, teams, calendar, resources. Mix and match as many as you need.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button onClick={() => addEntry('ministry')} style={emptyAddBtnStyle('solid')}>+ Add ministry</button>
              <button onClick={() => addEntry('department')} style={emptyAddBtnStyle('outline')}>+ Add department</button>
            </div>
          </div>
        )}

        {/* ===== Footer block ===== */}
        <section style={{
          margin: '0 -64px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '40px 64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 12, letterSpacing: '0.32em' }}>
            OAKHOUSE CHURCH · 2026–27
          </div>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 10, letterSpacing: '0.32em', color: 'var(--accent)' }}>STAFF MINISTRY PLAN</div>
        </section>
      </div>);
  };

  const emptyAddBtnStyle = (kind) => ({
    padding: '14px 26px',
    border: kind === 'solid' ? 'none' : '2px solid var(--ink)',
    background: kind === 'solid' ? 'var(--ink)' : 'transparent',
    color: kind === 'solid' ? 'var(--paper)' : 'var(--ink)',
    fontFamily: 'Montserrat', fontWeight: 900, fontSize: 12,
    letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer',
  });

  window.MPContrast = ContrastSpread;

  /* ---------- Personal — separate document (own embed / own plan key) ---------- */
  const PersonalStandalone = () => {
    useEffect(() => {
      window.__mpState = { ready: true };
      window.dispatchEvent(new Event('mp-state-ready'));
    }, []);

    return (
      <div style={{
        background: 'var(--white)',
        color: 'var(--ink)',
        fontFamily: 'Montserrat, sans-serif',
        padding: '0 64px',
        minHeight: '100%',
        position: 'relative',
      }}>
        <section style={{
          margin: '0 -64px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '64px 64px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -50, bottom: -100,
            fontFamily: 'Montserrat', fontWeight: 900, fontSize: 540, lineHeight: 0.8,
            letterSpacing: '-0.05em', color: 'rgba(184,117,74,0.14)', userSelect: 'none',
          }}>01</div>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="assets/icon-blue.png" alt="" style={{ width: 36, height: 36, background: 'var(--paper)', borderRadius: '50%' }} />
              <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 10, letterSpacing: '0.32em', color: 'var(--paper)' }}>OAKHOUSE CHURCH</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 10, letterSpacing: '0.32em', color: 'var(--accent)' }}>QUARTERLY REFLECTION</span>
              <div style={{ marginTop: 6, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 32, letterSpacing: '0.04em', color: 'var(--paper)' }}>'26 / '27</div>
            </div>
          </header>
          <div style={{ marginTop: 86, position: 'relative', zIndex: 1 }}>
            <Tag dark>For you</Tag>
            <h1 style={{ margin: 0, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 156, lineHeight: 0.85, letterSpacing: '-0.04em', color: 'var(--paper)', textTransform: 'uppercase' }}>
              Personal<br />Plan
            </h1>
            <p style={{ marginTop: 28, maxWidth: 540, fontFamily: 'Montserrat', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,225,0.75)' }}>
              A plan starts with the person making it. These pages are for you — your soul, your joy, your weight, your growth — to be revisited four times this year.
            </p>
          </div>
        </section>

        <div id="mp-submitter-mount"></div>

        <div data-mp-personal-root>
          <Paper>
            <Sub intro="Each quarter, return to these five prompts. Be honest. The numbers below come back around in December, March, and June.">Personal Development</Sub>
            <Personal dateLabels={PERSONAL_DATE_LABELS} subLabels={PERSONAL_SUB_LABELS} />
          </Paper>
        </div>

        <section style={{
          margin: '0 -64px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '40px 64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 12, letterSpacing: '0.32em' }}>
            OAKHOUSE CHURCH · 2026–27
          </div>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 10, letterSpacing: '0.32em', color: 'var(--accent)' }}>
            PERSONAL PLAN
          </div>
        </section>
      </div>
    );
  };

  window.MPPersonal = PersonalStandalone;
})();