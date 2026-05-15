// ===== Ministry Plan — Live (multi-entry; per-embed plan key + Apps Script backend) =====
// A single ?plan= URL holds an array of "entries" — each one a named
// ministry or department with its own values, metrics, teams, calendar etc.
//
// Optional ?personal=NAME URL param attaches the Personal tab to its own,
// separate plan_key — so the same iframe shows shared team data PLUS the
// viewing person's private personal reflections, stored independently.
//
// Configure at the top of Ministry Plan - Live.html:
//   window.MP_BACKEND_URL  = "https://script.google.com/macros/s/.../exec";
//   window.MP_DEFAULT_PLAN = "default";          // used when no ?plan= is given
//   window.MP_WRITE_SECRET = "optional-secret";  // only needed if you set WRITE_SECRET in Apps Script

(function () {
  const { useState, useEffect, useRef, useCallback } = React;

  /* ---------------- utilities ---------------- */

  function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function debounce(fn, ms) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // pathFor returns a stable key for a given input element. It is scoped to:
  //  - its nearest [data-mp-entry] (entry id), if any — for multi-entry plans
  //  - or [data-mp-personal-root] — for the personal sidecar
  // Returns an object: { scope: 'entry'|'personal'|'flat', entryId?, path }
  function pathFor(el) {
    const region = el.closest('[data-mp-region]')?.getAttribute('data-mp-region');
    if (!region) return null;
    const row = el.closest('[data-mp-row]')?.getAttribute('data-mp-row');
    const col = el.closest('[data-mp-col]')?.getAttribute('data-mp-col')
              || el.getAttribute('data-mp-col');
    if (!row || !col) return null;
    const base = `${region}::${row}::${col}`;
    const entryEl = el.closest('[data-mp-entry]');
    const personalEl = el.closest('[data-mp-personal-root]');
    if (personalEl) return { scope: 'personal', path: base };
    if (entryEl) return { scope: 'entry', entryId: entryEl.getAttribute('data-mp-entry'), path: base };
    return { scope: 'flat', path: base };
  }

  // Snapshot ALL inputs and split them into:
  //  - entryFields: keyed by entry::<id>::path (for the main plan)
  //  - personalFields: keyed by path (for the personal sidecar)
  function snapshotAllFields() {
    const root = document.getElementById('root');
    const entryFields = {};
    const personalFields = {};
    if (!root) return { entryFields, personalFields };
    const els = root.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]');
    els.forEach((el) => {
      if (el.closest('[data-mp-submitter]')) return;
      // Also skip the tab-bar rename inputs (they're entry.name, tracked separately).
      if (el.closest('.mp-tabbar')) return;
      const p = pathFor(el);
      if (!p) return;
      if (el.type === 'checkbox') {
        const target = p.scope === 'personal' ? personalFields : entryFields;
        const key = p.scope === 'entry' ? `entry::${p.entryId}::${p.path}` : p.path;
        const arr = (target[key] = target[key] || []);
        if (el.checked) {
          const label = (el.closest('label')?.textContent || '').trim();
          if (label && !arr.includes(label)) arr.push(label);
        }
      } else {
        const v = el.value || '';
        if (!v) return;
        if (p.scope === 'personal') {
          personalFields[p.path] = v;
        } else if (p.scope === 'entry') {
          entryFields[`entry::${p.entryId}::${p.path}`] = v;
        } else {
          // flat (shouldn't happen with the multi-entry model, but safe)
          entryFields[p.path] = v;
        }
      }
    });
    return { entryFields, personalFields };
  }

  // Apply field values back to the DOM. `fields` is a flat map.
  // For entry-scoped fields, keys look like `entry::<id>::region::row::col`.
  // For personal fields, keys look like `region::row::col`.
  function restoreFields(fields, scope) {
    const root = document.getElementById('root');
    if (!root || !fields) return;
    const els = Array.from(root.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]'));
    els.forEach((el) => {
      if (el.closest('[data-mp-submitter]')) return;
      if (el.closest('.mp-tabbar')) return;
      const p = pathFor(el);
      if (!p) return;
      // Only restore for matching scope
      if (scope === 'personal' && p.scope !== 'personal') return;
      if (scope === 'entry' && p.scope !== 'entry') return;
      const key = p.scope === 'entry' ? `entry::${p.entryId}::${p.path}` : p.path;
      const val = fields[key];
      if (val === undefined) return;
      if (el.type === 'checkbox') {
        const labels = Array.isArray(val) ? val : [];
        const label = (el.closest('label')?.textContent || '').trim();
        const shouldCheck = labels.includes(label);
        if (shouldCheck !== el.checked) el.click();
      } else {
        if (el.value !== val) setNativeValue(el, val);
      }
    });
  }

  function whenStateReady() {
    return new Promise((resolve) => {
      if (window.__mpState && window.__mpState.ready) return resolve();
      const handler = () => {
        window.removeEventListener('mp-state-ready', handler);
        resolve();
      };
      window.addEventListener('mp-state-ready', handler);
    });
  }

  /* ---------------- URL params ---------------- */

  function normalizeKey(raw) {
    return String(raw || '').toLowerCase().replace(/[^a-z0-9_\-]/g, '-').slice(0, 80);
  }
  function getPlanKey() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('plan') || window.MP_DEFAULT_PLAN || 'default';
    return normalizeKey(raw) || 'default';
  }
  function getPersonalKey() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('personal') || '';
    return normalizeKey(raw);
  }

  /* ---------------- backend API ---------------- */

  function backendConfigured() {
    const url = window.MP_BACKEND_URL;
    return !!(url && !/PASTE_/.test(url));
  }

  async function callBackend(action, body) {
    if (!backendConfigured()) throw new Error('Backend not configured yet — see SETUP.md');
    const res = await fetch(window.MP_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action,
        secret: window.MP_WRITE_SECRET || undefined,
        ...body,
      }),
    });
    if (!res.ok) throw new Error(`Backend ${action} failed: HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  /* ---------------- Submitter block (top of form) ---------------- */

  const SubmitterBlock = ({ planKey, personalKey, year, entryCount }) => {
    return (
      <div data-mp-submitter="true" className="mp-print-hide" style={{
        margin: '0 -64px',
        padding: '14px 64px 16px',
        background: 'rgba(184,117,74,0.12)',
        borderBottom: '1px solid rgba(184,117,74,0.5)',
        display: 'flex',
        gap: 22,
        alignItems: 'baseline',
        fontFamily: 'Montserrat',
        fontSize: 11,
        lineHeight: 1.55,
        color: 'var(--ink-soft)',
        flexWrap: 'wrap',
      }}>
        <div>
          <span style={{ fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: 9 }}>Plan ID</span>{' '}
          <span style={{ fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>{planKey}</span>
        </div>
        {personalKey && (
          <div>
            <span style={{ fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: 9 }}>Personal</span>{' '}
            <span style={{ fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>{personalKey}</span>
          </div>
        )}
        <div>
          <span style={{ fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: 9 }}>Year</span>{' '}
          <span style={{ fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>{year}</span>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--ink-soft)', fontStyle: 'italic' }}>
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'} · autosaves as you type
        </div>
      </div>
    );
  };

  /* ---------------- Bottom live bar ---------------- */

  const LiveBar = ({ planKey, status, savedAt, error, onSyncAsana, syncStatus, syncResult, dashboardUrl }) => {
    const fmtTime = (d) => {
      if (!d) return null;
      const diff = (Date.now() - d) / 1000;
      if (diff < 5) return 'just now';
      if (diff < 60) return Math.floor(diff) + 's ago';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      return d.toLocaleTimeString();
    };
    return (
      <div className="mp-print-hide" style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
        background: 'var(--ink)', color: 'var(--paper)',
        padding: '12px 28px',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', gap: 18, fontFamily: 'Montserrat',
      }}>
        <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: '0.28em', color: 'var(--accent)', textTransform: 'uppercase' }}>
          Ministry Plan · {planKey}
        </div>
        <div style={{ flex: 1, fontSize: 12, color: 'rgba(244,237,225,0.7)' }}>
          {status === 'needs-setup' && <span style={{ color: '#f0c98b' }}>⚠ Backend not configured yet — set <code style={{ fontFamily: 'monospace' }}>MP_BACKEND_URL</code> in the page (see SETUP.md).</span>}
          {status === 'loading' && <span>Loading plan…</span>}
          {status === 'saving' && <span>Saving…</span>}
          {status === 'saved' && savedAt && <span>✓ Saved {fmtTime(savedAt)}</span>}
          {status === 'idle' && savedAt && <span>Last saved {fmtTime(savedAt)}</span>}
          {status === 'error' && <span style={{ color: '#f0a48b' }}>Save failed: {error}</span>}
          {syncStatus === 'syncing' && <span> · Syncing to Asana…</span>}
          {syncStatus === 'synced' && syncResult && (
            <span style={{ color: '#9fd49f' }}> · ✓ Asana synced: {syncResult.created} created, {syncResult.updated} updated</span>
          )}
          {syncStatus === 'sync-error' && <span style={{ color: '#f0a48b' }}> · Asana sync failed</span>}
        </div>

        {dashboardUrl && (
          <a href={dashboardUrl} target="_blank" rel="noopener" style={{
            color: 'rgba(244,237,225,0.7)', textDecoration: 'none', fontWeight: 700, fontSize: 10,
            letterSpacing: '0.2em', textTransform: 'uppercase', padding: '8px 12px',
            border: '1px solid rgba(244,237,225,0.25)',
          }}>All Plans →</a>
        )}

        <button onClick={onSyncAsana} disabled={syncStatus === 'syncing'} style={{
          background: 'var(--accent)', color: 'var(--paper)', border: 'none',
          padding: '12px 22px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 11,
          letterSpacing: '0.24em', textTransform: 'uppercase',
          cursor: syncStatus === 'syncing' ? 'wait' : 'pointer',
          opacity: syncStatus === 'syncing' ? 0.6 : 1,
        }}>{syncStatus === 'syncing' ? 'Syncing…' : 'Sync to Asana →'}</button>
      </div>
    );
  };

  /* ---------------- Top-level orchestrator ---------------- */

  function defaultQuarter() {
    const m = new Date().getMonth();
    if (m >= 6 && m <= 8) return 'Q1';
    if (m >= 9 && m <= 11) return 'Q2';
    if (m >= 0 && m <= 2) return 'Q3';
    return 'Q4';
  }
  function defaultYear() {
    const d = new Date();
    const yr = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(yr).slice(2)}-${String(yr + 1).slice(2)}`;
  }

  const MPLive = () => {
    const isPersonalOnly = window.MP_LIVE_MODE === 'personal';
    const planKey = getPlanKey();
    const personalKey = isPersonalOnly ? '' : getPersonalKey();
    // Quarter + year are LOCKED — the plan stores one row per plan_key for the whole year.
    // The MP_YEAR config in the HTML controls which fiscal year's row this page reads/writes.
    const lockedQuarter = 'Q1';
    const lockedYear = window.MP_YEAR || defaultYear();
    const [planMeta] = useState({ quarter: lockedQuarter, year: lockedYear });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [savedAt, setSavedAt] = useState(null);
    const [syncStatus, setSyncStatus] = useState(null);
    const [syncResult, setSyncResult] = useState(null);
    const [entryCount, setEntryCount] = useState(1);
    const dirtyRef = useRef(false);
    const lastLoadedKeyRef = useRef(null);

    // Track entry count for the submitter block by polling __mpState (cheap, only on render).
    useEffect(() => {
      const t = setInterval(() => {
        if (window.__mpState?.entries) {
          const n = window.__mpState.entries.length;
          setEntryCount((cur) => (cur === n ? cur : n));
        }
      }, 500);
      return () => clearInterval(t);
    }, []);

    /* ----- Load when keys/quarter/year change ----- */
    useEffect(() => {
      if (!backendConfigured()) {
        setStatus('needs-setup');
        return;
      }
      const loadKey = `${planKey}|${personalKey}|${planMeta.quarter}|${planMeta.year}`;
      if (lastLoadedKeyRef.current === loadKey) return;
      lastLoadedKeyRef.current = loadKey;
      (async () => {
        setStatus('loading');
        setError(null);
        try {
          await whenStateReady();
          const data = await callBackend('load', {
            planKey,
            personalKey: personalKey || undefined,
            quarter: planMeta.quarter,
            year: planMeta.year,
          });

          // Personal-only mode: planKey's row holds personal fields. Restore those.
          if (isPersonalOnly) {
            if (data.plan) {
              const p = data.plan;
              requestAnimationFrame(() => requestAnimationFrame(() => {
                restoreFields(p.fields || {}, 'personal');
                setStatus('idle');
                if (p.updatedAt) setSavedAt(new Date(p.updatedAt));
                dirtyRef.current = false;
              }));
            } else {
              setStatus('idle');
            }
            return;
          }

          // Restore entries (multi-entry plan)
          if (data.plan && window.__mpState?.setEntries) {
            const p = data.plan;
            if (Array.isArray(p.entries) && p.entries.length > 0) {
              window.__mpState.setEntries(p.entries);
              if (window.__mpState.setActiveId && p.entries[0]) {
                window.__mpState.setActiveId(p.entries[0].id);
              }
            }
            // Wait for React to render entry panels, then restore the field values
            requestAnimationFrame(() => requestAnimationFrame(() => {
              restoreFields(p.fields || {}, 'entry');
              // Also restore personal fields if we got them
              if (data.personalPlan?.fields) {
                restoreFields(data.personalPlan.fields, 'personal');
              }
              setStatus('idle');
              if (p.updatedAt) setSavedAt(new Date(p.updatedAt));
              dirtyRef.current = false;
            }));
          } else {
            // No prior plan — but restore personal fields if present
            if (data.personalPlan?.fields) {
              requestAnimationFrame(() => requestAnimationFrame(() => {
                restoreFields(data.personalPlan.fields, 'personal');
              }));
            }
            setStatus('idle');
          }
        } catch (e) {
          console.error(e);
          setStatus('error');
          setError(e.message);
        }
      })();
    }, [planKey, personalKey, planMeta.quarter, planMeta.year]);

    /* ----- Autosave on any input change ----- */
    useEffect(() => {
      if (!backendConfigured()) return;

      const save = debounce(async () => {
        if (!dirtyRef.current) return;
        dirtyRef.current = false;
        setStatus('saving');
        try {
          const { entryFields, personalFields } = snapshotAllFields();

          let payload;
          if (isPersonalOnly) {
            // Personal-only page: just store personal fields under planKey.
            payload = {
              planKey,
              quarter: planMeta.quarter,
              year: planMeta.year,
              plan: { entries: [], fields: personalFields },
            };
          } else {
            const entries = (window.__mpState?.entries || []).map(({ id, type, name, valuesRows, metricsRows, teams, resourcesRows }) =>
              ({ id, type, name, valuesRows, metricsRows, teams, resourcesRows }));
            payload = {
              planKey,
              personalKey: personalKey || undefined,
              quarter: planMeta.quarter,
              year: planMeta.year,
              plan: { entries, fields: entryFields },
              personalPlan: personalKey ? { fields: personalFields } : undefined,
            };
          }
          const data = await callBackend('save', payload);
          setStatus('saved');
          setSavedAt(new Date(data.updatedAt || Date.now()));
          setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 1500);
        } catch (e) {
          console.error(e);
          setStatus('error');
          setError(e.message);
        }
      }, 1200);

      const markDirty = () => { dirtyRef.current = true; save(); };

      const onAnyInput = (e) => {
        if (e.target.closest && e.target.closest('[data-mp-submitter]')) return;
        if (!e.target.matches || !e.target.matches('input, textarea')) return;
        markDirty();
      };

      // Also re-save when entries[] structure changes (add/remove/rename/type swap).
      let lastSnapshot = '';
      const structuralPoll = setInterval(() => {
        if (!window.__mpState?.entries) return;
        const sig = JSON.stringify(
          window.__mpState.entries.map(({ id, type, name, valuesRows, metricsRows, resourcesRows, teams }) =>
            ({ id, type, name, valuesRows, metricsRows, resourcesRows, teams }))
        );
        if (lastSnapshot && sig !== lastSnapshot) markDirty();
        lastSnapshot = sig;
      }, 800);

      document.addEventListener('input', onAnyInput, true);
      document.addEventListener('change', onAnyInput, true);
      return () => {
        document.removeEventListener('input', onAnyInput, true);
        document.removeEventListener('change', onAnyInput, true);
        clearInterval(structuralPoll);
      };
    }, [planKey, personalKey, planMeta.quarter, planMeta.year]);

    /* ----- Sync to Asana (uses the current plan_key; all entries' tasks are pushed) ----- */
    const onSyncAsana = useCallback(async () => {
      setSyncStatus('syncing');
      setSyncResult(null);
      try {
        const data = await callBackend('sync-asana', {
          planKey,
          quarter: planMeta.quarter,
          year: planMeta.year,
        });
        setSyncStatus('synced');
        setSyncResult(data);
        setTimeout(() => setSyncStatus(null), 6000);
      } catch (e) {
        console.error(e);
        setSyncStatus('sync-error');
        setError(e.message);
      }
    }, [planKey, planMeta.quarter, planMeta.year]);

    /* ----- Render ----- */
    const submitterMount = document.getElementById('mp-submitter-mount');
    return (
      <React.Fragment>
        {submitterMount && ReactDOM.createPortal(
          <SubmitterBlock
            planKey={planKey}
            personalKey={personalKey}
            year={planMeta.year}
            entryCount={entryCount} />,
          submitterMount
        )}
        <LiveBar
          planKey={planKey}
          status={status}
          savedAt={savedAt}
          error={error}
          onSyncAsana={onSyncAsana}
          syncStatus={syncStatus}
          syncResult={syncResult}
          dashboardUrl={window.MP_DASHBOARD_URL} />
      </React.Fragment>
    );
  };

  window.MPLive = MPLive;
})();
