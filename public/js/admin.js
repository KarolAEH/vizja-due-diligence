'use strict';
(function () {
  const FS = window.VIZJA_SCHEMA.formSchema;
  const AS = window.VIZJA_SCHEMA.assessmentSchema;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let L = localStorage.getItem('vizja_lang') || 'en';
  const tr = o => (o && (o[L] ?? o.en)) || '';
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  const UI = {
    en:{ none:'—', yes:'Yes', no:'No', confirmed:'Confirmed', notconfirmed:'Not confirmed', other:'Other',
      agency:'Agency', country:'Country', date:'Submitted', status:'Status', decision:'Decision', action:'',
      open:'Open', empty:'No answer', save:'Save assessment', saved:'Assessment saved.', total:'Total score',
      copy:'Copy', copied:'Copied to clipboard', deactivate:'Deactivate', active:'Active', used:'Used / inactive',
      link:'Link', note:'Note', created:'Created', delete:'Delete', confirmDel:'Delete this submission permanently?',
      print:'Print assessment', comment:'Comment', prepared:'Prepared by', reviewed:'Reviewed by', approved:'Approved by',
      name:'Name', position:'Position', finalDecision:'Final decision', answersTitle:'Agency responses',
      stTotal:'Total', stPending:'Awaiting review', stDone:'Reviewed', noSubs:'No submissions yet. Create an invitation link and share it with an agency.' },
    pl:{ none:'—', yes:'Tak', no:'Nie', confirmed:'Potwierdzono', notconfirmed:'Nie potwierdzono', other:'Inne',
      agency:'Agencja', country:'Kraj', date:'Wysłano', status:'Status', decision:'Decyzja', action:'',
      open:'Otwórz', empty:'Brak odpowiedzi', save:'Zapisz ocenę', saved:'Ocena zapisana.', total:'Wynik łączny',
      copy:'Kopiuj', copied:'Skopiowano do schowka', deactivate:'Dezaktywuj', active:'Aktywny', used:'Użyty / nieaktywny',
      link:'Link', note:'Notatka', created:'Utworzono', delete:'Usuń', confirmDel:'Trwale usunąć to zgłoszenie?',
      print:'Drukuj ocenę', comment:'Komentarz', prepared:'Przygotował(a)', reviewed:'Sprawdził(a)', approved:'Zatwierdził(a)',
      name:'Imię i nazwisko', position:'Stanowisko', finalDecision:'Decyzja końcowa', answersTitle:'Odpowiedzi agencji',
      stTotal:'Łącznie', stPending:'Do oceny', stDone:'Ocenione', noSubs:'Brak zgłoszeń. Utwórz link zaproszenia i udostępnij go agencji.' }
  };
  const u = () => UI[L];

  function toast(m, k){ const t=$('#toast'); t.textContent=m; t.className='toast show '+(k||''); setTimeout(()=>t.className='toast',2400); }
  async function api(path, opts){ const r=await fetch(path, opts); if(r.status===401){ showLogin(); throw new Error('401'); } return r; }

  function applyLang(){
    document.documentElement.lang=L;
    $$('[data-en]').forEach(b=> b.textContent = b.dataset[L] || b.dataset.en);
    $$('[data-ph-en]').forEach(b=> b.placeholder = b.dataset['ph'+L.charAt(0).toUpperCase()+L.slice(1)] || b.dataset.phEn);
    $$('.lang-toggle button').forEach(x=>x.classList.toggle('active',x.dataset.lang===L));
  }

  // ---------------- AUTH ----------------
  function showLogin(){ $('#login').classList.remove('hidden'); $('#app').classList.add('hidden'); $('#logoutBtn').classList.add('hidden'); }
  function showApp(){ $('#login').classList.add('hidden'); $('#app').classList.remove('hidden'); $('#logoutBtn').classList.remove('hidden'); loadSubmissions(); }
  async function checkAuth(){ const r=await fetch('/api/me'); const d=await r.json(); d.authed?showApp():showLogin(); }
  $('#loginBtn').addEventListener('click', async ()=>{
    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('#pw').value})});
    if(r.ok){ $('#loginErr').classList.add('hidden'); showApp(); }
    else { const e=$('#loginErr'); e.textContent = L==='pl'?'Nieprawidłowe hasło':'Incorrect password'; e.classList.remove('hidden'); }
  });
  $('#pw').addEventListener('keydown',e=>{ if(e.key==='Enter') $('#loginBtn').click(); });
  $('#logoutBtn').addEventListener('click', async ()=>{ await fetch('/api/logout',{method:'POST'}); showLogin(); });

  // ---------------- TABS ----------------
  $$('.tab').forEach(t=> t.addEventListener('click',()=>{
    $$('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
    const v=t.dataset.view;
    $('#view-submissions').classList.toggle('hidden', v!=='submissions');
    $('#view-invites').classList.toggle('hidden', v!=='invites');
    $('#view-detail').classList.add('hidden');
    if(v==='invites') loadInvites(); else loadSubmissions();
  }));

  // ---------------- SUBMISSIONS LIST ----------------
  function decBadge(dec){
    if(!dec) return `<span class="badge gray">${L==='pl'?'Nieoceniony':'Not reviewed'}</span>`;
    const map={ 'Approved':'green','Approved conditionally':'amber','Further information required':'blue','Rejected':'red','Escalate to Legal / Compliance':'red' };
    const lbl = pickLabel(AS.decision.options, dec);
    return `<span class="badge ${map[dec]||'gray'}">${esc(lbl)}</span>`;
  }
  function pickLabel(opts, enValue){ const o=opts.find(x=>x.en===enValue); return o?tr(o):enValue; }

  async function loadSubmissions(){
    const r=await api('/api/submissions'); const rows=await r.json();
    const stats=$('#stats'); const pending=rows.filter(x=>!x.decision).length;
    stats.innerHTML='';
    [[rows.length,u().stTotal],[pending,u().stPending],[rows.length-pending,u().stDone]].forEach(([n,l])=>{
      const s=el('div','stat'); s.innerHTML=`<div class="n">${n}</div><div class="l">${l}</div>`; stats.append(s);
    });
    const th=$('#subTable thead'), tb=$('#subTable tbody');
    th.innerHTML=`<tr><th>#</th><th>${u().agency}</th><th>${u().country}</th><th>${u().date}</th><th>${u().decision}</th><th></th></tr>`;
    tb.innerHTML='';
    if(!rows.length){ tb.innerHTML=`<tr><td colspan="6" class="muted" style="padding:22px">${u().noSubs}</td></tr>`; return; }
    rows.forEach(s=>{
      const tr_=el('tr');
      tr_.innerHTML=`<td>${s.id}</td><td><strong>${esc(s.agency_name)||u().none}</strong></td>
        <td>${esc(s.country)||u().none}</td><td>${fmtDate(s.submitted_at)}</td><td>${decBadge(s.decision)}</td>
        <td style="white-space:nowrap"><button class="btn ghost" data-open="${s.id}">${u().open}</button>
        <button class="delrow" data-del="${s.id}" title="${u().delete}">×</button></td>`;
      tb.append(tr_);
    });
    tb.querySelectorAll('[data-open]').forEach(b=> b.addEventListener('click',()=>openDetail(b.dataset.open)));
    tb.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click',async()=>{ if(confirm(u().confirmDel)){ await api('/api/submissions/'+b.dataset.del,{method:'DELETE'}); loadSubmissions(); }}));
  }
  function fmtDate(iso){ if(!iso)return''; const d=new Date(iso); return d.toLocaleDateString(L==='pl'?'pl-PL':'en-GB')+' '+d.toLocaleTimeString(L==='pl'?'pl-PL':'en-GB',{hour:'2-digit',minute:'2-digit'}); }

  // ---------------- INVITES ----------------
  async function loadInvites(){
    const r=await api('/api/invitations'); const rows=await r.json();
    const th=$('#invTable thead'), tb=$('#invTable tbody');
    th.innerHTML=`<tr><th>${u().agency}</th><th>${u().link}</th><th>${u().note}</th><th>${u().created}</th><th>${u().status}</th><th></th></tr>`;
    tb.innerHTML='';
    rows.forEach(v=>{
      const url=location.origin+'/form/'+v.token;
      const tr_=el('tr');
      tr_.innerHTML=`<td>${esc(v.agency_name)||u().none}</td>
        <td><span class="inv-link">${esc(url)}</span></td>
        <td>${esc(v.note)||''}</td><td>${fmtDate(v.created_at)}</td>
        <td>${v.active?`<span class="badge green">${u().active}</span>`:`<span class="badge gray">${u().used}</span>`}</td>
        <td style="white-space:nowrap"><button class="btn ghost" data-copy="${esc(url)}">${u().copy}</button>
        ${v.active?`<button class="delrow" data-deact="${v.token}" title="${u().deactivate}">×</button>`:''}</td>`;
      tb.append(tr_);
    });
    tb.querySelectorAll('[data-copy]').forEach(b=> b.addEventListener('click',()=>{ navigator.clipboard.writeText(b.dataset.copy).then(()=>toast(u().copied,'ok')); }));
    tb.querySelectorAll('[data-deact]').forEach(b=> b.addEventListener('click',async()=>{ await api('/api/invitations/'+b.dataset.deact,{method:'DELETE'}); loadInvites(); }));
  }
  $('#invCreate').addEventListener('click', async ()=>{
    await api('/api/invitations',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({agency_name:$('#invAgency').value,note:$('#invNote').value})});
    $('#invAgency').value=''; $('#invNote').value=''; loadInvites();
  });

  // ---------------- DETAIL: answers rendering ----------------
  const YESNO=[{en:'Yes',pl:'Tak'},{en:'No',pl:'Nie'}];
  const CONFIRM=[{en:'Confirmed',pl:'Potwierdzono'},{en:'Not confirmed',pl:'Nie potwierdzono'}];
  const REFUND=[{en:'Yes',pl:'Tak'},{en:'No',pl:'Nie'},{en:'Partly',pl:'Częściowo'}];

  function answerHTML(f, v){
    const empty = `<span class="a empty">${u().empty}</span>`;
    const isEmpty = v==null || v==='' || (Array.isArray(v)&&!v.length) || (typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length);
    switch(f.type){
      case 'text': case 'textarea': case 'date':
        return (v&&String(v).trim())?`<div class="a">${esc(v)}</div>`:empty;
      case 'yesno': { const opts=f.options||YESNO; return (typeof v==='number'&&opts[v])?`<div class="a">${esc(tr(opts[v]))}</div>`:empty; }
      case 'confirm': return (typeof v==='number'&&CONFIRM[v])?`<div class="a">${esc(tr(CONFIRM[v]))}</div>`:empty;
      case 'checkboxes': case 'rowsCheck': {
        if(!v) return empty; const items=[]; const src=f.options||f.rows;
        (v.sel||[]).forEach(i=>{ if(src[i]) items.push(tr(src[i])); else if(i===src.length && v.other) items.push(`${u().other}: ${v.other}`); });
        if(v.other && !(v.sel||[]).includes(src.length)) items.push(`${u().other}: ${v.other}`);
        return items.length?`<div class="chips">${items.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:empty;
      }
      case 'rowsYesNo': {
        if(!v||!Object.keys(v).length) return empty;
        return kv(f.rows.map((r,i)=>[tr(r), v[i]? (v[i]==='yes'?u().yes:u().no) : u().none]));
      }
      case 'rowsYesNoExplain': {
        if(!v||!Object.keys(v).length) return empty;
        const rows=f.rows.map((r,i)=>{ const c=v[i]||{}; return [tr(r), c.v?(c.v==='yes'?u().yes:u().no):u().none, c.e||'']; });
        return `<table class="kvtable"><thead><tr><th>${''}</th><th>${u().yes}/${u().no}</th><th>${u().other}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>`;
      }
      case 'rowsConfirm': {
        if(!v||!Object.keys(v).length) return empty;
        return kv(f.rows.map((r,i)=>[tr(r), v[i]?'✓ '+u().confirmed:'✗']));
      }
      case 'table': {
        if(!Array.isArray(v)||!v.length) return empty;
        if(f.fixedRows){
          const rows=v.map((row,i)=>[tr(f.rows[i]), row[f.columns.find(c=>!c.readonly).id]||'']);
          return kv(rows);
        }
        const cols=f.columns; const head=cols.map(c=>`<th>${esc(tr(c.label))}</th>`).join('');
        const body=v.filter(r=>Object.values(r).some(x=>String(x||'').trim())).map(r=>`<tr>${cols.map(c=>`<td>${esc(r[c.id]||'')}</td>`).join('')}</tr>`).join('');
        return body?`<table class="kvtable"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`:empty;
      }
      case 'feeTable': {
        if(!v) return empty;
        const rows=[];
        f.rows.forEach((label,i)=>{ const c=v['r'+i]; if(c&&Object.values(c).some(x=>String(x||'').trim())) rows.push([tr(label),c]); });
        if(v.other&&Object.values(v.other).some(x=>String(x||'').trim())) rows.push([v.other.label||u().other, v.other]);
        if(!rows.length) return empty;
        return `<table class="kvtable"><thead><tr><th></th><th>${L==='pl'?'Kwota':'Amount'}</th><th>${L==='pl'?'Waluta':'Currency'}</th><th>${L==='pl'?'Termin':'When'}</th><th>${u().confirmed?'':''}${L==='pl'?'Zwrotne':'Refundable'}</th></tr></thead><tbody>`+
          rows.map(([lab,c])=>`<tr><td>${esc(lab)}</td><td>${esc(c.amount)}</td><td>${esc(c.currency)}</td><td>${esc(c.when)}</td><td>${c.refundable!=null&&c.refundable!==''?esc(tr(REFUND[c.refundable])):''}</td></tr>`).join('')+`</tbody></table>`;
      }
      default: return empty;
    }
  }
  function kv(pairs){ return `<table class="kvtable"><tbody>${pairs.map(p=>`<tr><td>${esc(p[0])}</td><td><strong>${esc(p[1])}</strong></td></tr>`).join('')}</tbody></table>`; }

  function renderAnswers(sub){
    const box=$('#detailAnswers'); box.innerHTML='';
    const head=el('div','card');
    head.innerHTML=`<h2>${esc(sub.agency_name)||u().none}</h2>
      <div class="muted">${u().country}: ${esc(sub.country)||u().none} · ${u().date}: ${fmtDate(sub.submitted_at)} · ID ${sub.id} · ${L==='pl'?'Język wypełnienia':'Filled in'}: ${(sub.lang||'en').toUpperCase()}</div>`;
    box.append(head);
    FS.sections.forEach(sec=>{
      const card=el('section','card');
      card.append(el('div','section-head', `<span class="section-num">${sec.id}</span><h3 style="margin:0">${esc(tr(sec.title))}</h3>`));
      sec.fields.forEach(f=>{
        const a=el('div','answer');
        a.innerHTML=`<div class="q">${/^\d/.test(f.id)?`<span class="qid">${f.id}</span> `:''}${esc(tr(f.label))}</div>`;
        a.insertAdjacentHTML('beforeend', answerHTML(f, sub.answers[f.id]));
        card.append(a);
      });
      box.append(card);
    });
  }

  // ---------------- DETAIL: assessment form ----------------
  let CUR=null, ASSESS=null;
  function renderAssessment(sub){
    ASSESS = sub.assessment || {};
    const box=$('#detailAssessment'); box.innerHTML='';
    const card=el('div','card'); card.style.position='sticky'; card.style.top='14px';
    card.append(el('div','section-head',`<h2 style="margin:0">${esc(tr(AS.title))}</h2>`));
    card.append(el('div','section-note', esc(tr(AS.subtitle))));

    // meta
    AS.meta.forEach(m=>{
      const f=el('div','field'); f.innerHTML=`<label class="q">${esc(tr(m.label))}</label>`;
      const inp=el('input'); inp.type=m.type==='date'?'date':'text'; inp.value=(ASSESS[m.id]||'');
      inp.addEventListener('input',()=>ASSESS[m.id]=inp.value); f.append(inp); card.append(f);
    });

    // A. completeness
    card.append(el('h3',null,esc(tr(AS.completeness.title))));
    ASSESS.completeness = ASSESS.completeness || {};
    const ct=el('table','matrix'); ct.innerHTML=`<thead><tr><th></th><th>${L==='pl'?'Dostarczone':'Provided'}</th><th>${u().comment}</th></tr></thead>`;
    const ctb=el('tbody');
    AS.completeness.items.forEach((it,i)=>{
      const c=ASSESS.completeness[i]||{}; ASSESS.completeness[i]=c;
      const trr=el('tr'); trr.append(el('td',null,esc(tr(it))));
      const tdc=el('td','center'); const cb=el('input'); cb.type='checkbox'; cb.checked=!!c.ok; cb.addEventListener('change',()=>c.ok=cb.checked); tdc.append(cb); trr.append(tdc);
      const tdm=el('td'); const ci=el('input'); ci.type='text'; ci.value=c.note||''; ci.addEventListener('input',()=>c.note=ci.value); tdm.append(ci); trr.append(tdm);
      ctb.append(trr);
    });
    ct.append(ctb); card.append(ct);

    // B. risk
    card.append(el('h3',null,esc(tr(AS.risk.title))));
    ASSESS.risk = ASSESS.risk || {};
    const rt=el('table','matrix'); rt.innerHTML=`<thead><tr><th></th><th>1–5</th><th>${u().comment}</th></tr></thead>`;
    const rtb=el('tbody');
    const totalCell=()=>{ let s=0; AS.risk.areas.forEach((_,i)=>{ const n=parseInt((ASSESS.risk[i]||{}).score); if(n>=1&&n<=5)s+=n; }); return s; };
    AS.risk.areas.forEach((ar,i)=>{
      const c=ASSESS.risk[i]||{}; ASSESS.risk[i]=c;
      const trr=el('tr'); trr.append(el('td',null,esc(tr(ar))));
      const tds=el('td','center'); const si=el('input','score-input'); si.type='number'; si.min=1; si.max=5; si.value=c.score||'';
      si.addEventListener('input',()=>{ c.score=si.value; $('#riskTotal').textContent=totalCell(); }); tds.append(si); trr.append(tds);
      const tdm=el('td'); const ci=el('input'); ci.type='text'; ci.value=c.note||''; ci.addEventListener('input',()=>c.note=ci.value); tdm.append(ci); trr.append(tdm);
      rtb.append(trr);
    });
    rt.append(rtb); card.append(rt);
    const tot=el('p'); tot.innerHTML=`<span class="score-total">${u().total}: <span id="riskTotal">${totalCell()}</span> / 55</span>`; card.append(tot);

    // C. red flags
    card.append(el('h3',null,esc(tr(AS.redFlags.title))));
    ASSESS.redFlags = ASSESS.redFlags || {};
    const ft=el('table','matrix'); ft.innerHTML=`<thead><tr><th></th><th>${u().yes}</th><th>${u().no}</th><th>${u().comment}</th></tr></thead>`;
    const ftb=el('tbody');
    AS.redFlags.items.forEach((it,i)=>{
      const c=ASSESS.redFlags[i]||{}; ASSESS.redFlags[i]=c;
      const trr=el('tr'); trr.append(el('td',null,esc(tr(it))));
      ['yes','no'].forEach(val=>{ const td=el('td','center'); const rb=el('input'); rb.type='radio'; rb.name='rf'+i; rb.checked=c.v===val; rb.addEventListener('change',()=>c.v=val); td.append(rb); trr.append(td); });
      const tdm=el('td'); const ci=el('input'); ci.type='text'; ci.value=c.note||''; ci.addEventListener('input',()=>c.note=ci.value); tdm.append(ci); trr.append(tdm);
      ftb.append(trr);
    });
    ft.append(ftb); card.append(ft);

    // D. decision
    card.append(el('h3',null,esc(tr(AS.decision.title))));
    const ds=el('div','check-col');
    AS.decision.options.forEach(o=>{ const lab=el('label','opt'); const r=el('input'); r.type='radio'; r.name='decision'; r.checked=ASSESS.decision===o.en;
      r.addEventListener('change',()=>ASSESS.decision=o.en); lab.append(r,document.createTextNode(tr(o))); ds.append(lab); });
    card.append(ds);

    // E. conditions
    card.append(el('h3',null,esc(tr(AS.conditions.title))));
    const cta=el('textarea'); cta.value=ASSESS.conditions||''; cta.placeholder=tr(AS.conditions.placeholder); cta.addEventListener('input',()=>ASSESS.conditions=cta.value); card.append(cta);

    // F. monitoring
    card.append(el('h3',null,esc(tr(AS.monitoring.title))));
    const ms=el('div','check-col');
    AS.monitoring.options.forEach(o=>{ const lab=el('label','opt'); const r=el('input'); r.type='radio'; r.name='monitoring'; r.checked=ASSESS.monitoring===o.en;
      r.addEventListener('change',()=>ASSESS.monitoring=o.en); lab.append(r,document.createTextNode(tr(o))); ms.append(lab); });
    card.append(ms);

    // G. approval
    card.append(el('h3',null,esc(tr(AS.approval.title))));
    ASSESS.approval = ASSESS.approval || {};
    [['prepared',u().prepared],['reviewed',u().reviewed],['approved',u().approved]].forEach(([key,label])=>{
      const blk=el('div'); blk.style.marginBottom='10px';
      blk.append(el('div','muted',`<strong>${label}</strong>`));
      const row=el('div','btn-row');
      ['name','position','date'].forEach(fld=>{
        const inp=el('input'); inp.type=fld==='date'?'date':'text'; inp.style.maxWidth='180px';
        inp.placeholder = fld==='name'?u().name: fld==='position'?u().position:'';
        const k=key+'_'+fld; inp.value=ASSESS.approval[k]||''; inp.addEventListener('input',()=>ASSESS.approval[k]=inp.value); row.append(inp);
      });
      blk.append(row); card.append(blk);
    });
    const fd=el('div','field'); fd.innerHTML=`<label class="q">${u().finalDecision}</label>`;
    const sel=el('select'); sel.append(el('option','',''));
    AS.approval.finalOptions.forEach(o=>{ const op=el('option'); op.value=o.en; op.textContent=tr(o); op.selected=ASSESS.approval.final===o.en; sel.append(op); });
    sel.addEventListener('change',()=>ASSESS.approval.final=sel.value); fd.append(sel); card.append(fd);

    // actions
    const actions=el('div','btn-row no-print'); actions.style.marginTop='14px';
    const saveB=el('button','btn',u().save); saveB.addEventListener('click',()=>saveAssessment());
    const printB=el('button','btn ghost',u().print); printB.addEventListener('click',()=>window.print());
    actions.append(saveB,printB); card.append(actions);

    box.append(card);
  }

  async function saveAssessment(){
    await api('/api/submissions/'+CUR+'/assessment',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:ASSESS})});
    toast(u().saved,'ok');
  }

  async function openDetail(id){
    CUR=id;
    const r=await api('/api/submissions/'+id); const sub=await r.json();
    $('#view-submissions').classList.add('hidden'); $('#view-invites').classList.add('hidden');
    $('#view-detail').classList.remove('hidden');
    renderAnswers(sub); renderAssessment(sub);
    window.scrollTo(0,0);
  }
  $('#backBtn').addEventListener('click',()=>{ $('#view-detail').classList.add('hidden'); $('#view-submissions').classList.remove('hidden'); loadSubmissions(); });

  // ---------------- LANG ----------------
  $$('.lang-toggle button').forEach(b=> b.addEventListener('click',()=>{
    L=b.dataset.lang; localStorage.setItem('vizja_lang',L); applyLang();
    if(!$('#app').classList.contains('hidden')){
      if(!$('#view-detail').classList.contains('hidden') && CUR){ openDetail(CUR); }
      else if(!$('#view-invites').classList.contains('hidden')){ loadInvites(); }
      else loadSubmissions();
    }
  }));

  // init
  applyLang();
  checkAuth();
})();
