'use strict';
(function () {
  const S = window.VIZJA_SCHEMA.formSchema;
  const $ = (s, r = document) => r.querySelector(s);
  let L = localStorage.getItem('vizja_lang') || 'en';
  const tr = o => (o && (o[L] ?? o.en)) || '';

  // token from /form/:token
  const m = location.pathname.match(/\/form\/([^/?#]+)/);
  const TOKEN = m ? decodeURIComponent(m[1]) : null;
  const DRAFT_KEY = 'vizja_draft_' + (TOKEN || 'open');

  // ---- state ----
  let answers = {};
  try { answers = JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch (_) {}

  const UI = {
    en: { saved:'Draft saved on this device.', submit:'Your form has been submitted to VIZJA University. Thank you.',
      err:'Please complete the required fields highlighted above.', required:'Required',
      yes:'Yes', no:'No', confirmed:'Confirmed', notconfirmed:'Not confirmed', other:'Other',
      add:'+ Add row', explain:'Explanation, if yes', checked:'Checked',
      amount:'Approx. amount / range', currency:'Currency', when:'When payable', refundable:'Refundable?',
      partly:'Partly', feeType:'Type of fee', submitNote:'By submitting you confirm the information is accurate. A reviewer at VIZJA University will assess it.',
      netErr:'Could not submit — please try again or use Print / Save as PDF.' },
    pl: { saved:'Wersję roboczą zapisano na tym urządzeniu.', submit:'Formularz został wysłany do VIZJA University. Dziękujemy.',
      err:'Prosimy uzupełnić wymagane pola zaznaczone powyżej.', required:'Wymagane',
      yes:'Tak', no:'Nie', confirmed:'Potwierdzono', notconfirmed:'Nie potwierdzono', other:'Inne',
      add:'+ Dodaj wiersz', explain:'Wyjaśnienie, jeśli tak', checked:'Zaznaczone',
      amount:'Przybliżona kwota / zakres', currency:'Waluta', when:'Termin płatności', refundable:'Zwrotne?',
      partly:'Częściowo', feeType:'Rodzaj opłaty', submitNote:'Wysyłając formularz potwierdzasz, że informacje są prawdziwe. Recenzent VIZJA University dokona oceny.',
      netErr:'Nie udało się wysłać — spróbuj ponownie lub użyj Drukuj / Zapisz jako PDF.' }
  };
  const u = () => UI[L];

  // Required field ids
  const REQUIRED = ['1.1','1.3','1.8','16.name','16.position','16.agency','16.signature'];

  // ---------- helpers ----------
  function el(tag, cls, html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function saveDraft(){ localStorage.setItem(DRAFT_KEY, JSON.stringify(answers)); }
  function setA(id,v){ answers[id]=v; saveDraft(); updateProgress(); }
  function optList(f, fallback){ return (f.options || fallback).map(tr); }

  function toast(msg, kind){ const t=$('#toast'); t.textContent=msg; t.className='toast show '+(kind||''); setTimeout(()=>t.className='toast',2600); }

  // ---------- field renderers ----------
  function fieldWrap(f, controlNode){
    const w = el('div','field'); w.dataset.fid=f.id;
    const req = REQUIRED.includes(f.id);
    const lab = el('label','q');
    if(/^\d/.test(f.id)) lab.innerHTML = `<span class="qid">${f.id}</span>`;
    lab.append(document.createTextNode(tr(f.label)));
    if(req){ const r=el('span','req',' *'); lab.append(r); }
    w.append(lab);
    w.append(controlNode);
    return w;
  }

  function rText(f, multiline){
    const node = el(multiline?'textarea':'input');
    if(!multiline) node.type = f.type==='date'?'date':'text';
    node.value = answers[f.id] || '';
    node.placeholder = '';
    node.addEventListener('input', ()=>setA(f.id, node.value));
    return fieldWrap(f, node);
  }

  function rYesNo(f, fallback){
    const opts = optList(f, fallback);
    const box = el('div','radio-row');
    opts.forEach((label,i)=>{
      const o=el('label','opt'); const inp=el('input'); inp.type='radio'; inp.name=f.id;
      if(answers[f.id]===i){ inp.checked=true; o.classList.add('checked'); }
      inp.addEventListener('change',()=>{ setA(f.id,i); box.querySelectorAll('.opt').forEach(x=>x.classList.remove('checked')); o.classList.add('checked'); });
      o.append(inp, document.createTextNode(label)); box.append(o);
    });
    return fieldWrap(f, box);
  }

  function rCheckboxes(f){
    const opts = (f.options||[]).map(tr);
    const cur = answers[f.id] || {sel:[],other:''};
    const box = el('div','check-col');
    opts.forEach((label,i)=>{
      const o=el('label','opt'); const inp=el('input'); inp.type='checkbox';
      if(cur.sel.includes(i)){ inp.checked=true; o.classList.add('checked'); }
      inp.addEventListener('change',()=>{ const s=new Set(cur.sel); inp.checked?s.add(i):s.delete(i); cur.sel=[...s].sort((a,b)=>a-b); o.classList.toggle('checked',inp.checked); setA(f.id,cur); });
      o.append(inp, document.createTextNode(label)); box.append(o);
    });
    if(f.other){
      const row=el('div','radio-row'); row.style.marginTop='8px';
      const lbl=el('span','muted', u().other+':'); lbl.style.alignSelf='center';
      const inp=el('input'); inp.type='text'; inp.style.maxWidth='320px'; inp.value=cur.other||'';
      inp.placeholder=u().other; inp.addEventListener('input',()=>{cur.other=inp.value; setA(f.id,cur);});
      row.append(lbl,inp); box.append(row);
    }
    return fieldWrap(f, box);
  }

  function rRowsCheck(f){
    const cur = answers[f.id] || {sel:[],other:''};
    const tbl = el('table','matrix');
    const thead=el('thead'); thead.append(rowCells(['',u().checked],true)); tbl.append(thead);
    const tb=el('tbody');
    f.rows.forEach((r,i)=>{
      const tr_=el('tr'); tr_.append(el('td',null,tr(r)));
      const td=el('td','center'); const inp=el('input'); inp.type='checkbox';
      if(cur.sel.includes(i)) inp.checked=true;
      inp.addEventListener('change',()=>{const s=new Set(cur.sel); inp.checked?s.add(i):s.delete(i); cur.sel=[...s].sort((a,b)=>a-b); setA(f.id,cur);});
      td.append(inp); tr_.append(td); tb.append(tr_);
    });
    if(f.other){
      const tr_=el('tr'); const td0=el('td'); const oi=el('input'); oi.type='text'; oi.placeholder=u().other; oi.value=cur.other||'';
      oi.addEventListener('input',()=>{cur.other=oi.value; setA(f.id,cur);}); td0.append(oi); tr_.append(td0);
      const td=el('td','center'); const inp=el('input'); inp.type='checkbox'; const OI=f.rows.length;
      if(cur.sel.includes(OI)) inp.checked=true;
      inp.addEventListener('change',()=>{const s=new Set(cur.sel); inp.checked?s.add(OI):s.delete(OI); cur.sel=[...s].sort((a,b)=>a-b); setA(f.id,cur);});
      td.append(inp); tr_.append(td); tb.append(tr_);
    }
    tbl.append(tb);
    return fieldWrap(f, tbl);
  }

  function rRowsYesNo(f){
    const cur = answers[f.id] || {};
    const tbl=el('table','matrix'); const thead=el('thead'); thead.append(rowCells(['',u().yes,u().no],true)); tbl.append(thead);
    const tb=el('tbody');
    f.rows.forEach((r,i)=>{
      const tr_=el('tr'); tr_.append(el('td',null,tr(r)));
      ['yes','no'].forEach(v=>{ const td=el('td','center'); const inp=el('input'); inp.type='radio'; inp.name=f.id+'_'+i;
        if(cur[i]===v) inp.checked=true;
        inp.addEventListener('change',()=>{cur[i]=v; setA(f.id,cur);}); td.append(inp); tr_.append(td); });
      tb.append(tr_);
    });
    tbl.append(tb); return fieldWrap(f, tbl);
  }

  function rRowsYesNoExplain(f){
    const cur = answers[f.id] || {};
    const tbl=el('table','matrix'); const thead=el('thead'); thead.append(rowCells(['',u().yes,u().no,u().explain],true)); tbl.append(thead);
    const tb=el('tbody');
    f.rows.forEach((r,i)=>{
      const c = cur[i] || {v:null,e:''}; cur[i]=c;
      const tr_=el('tr'); tr_.append(el('td',null,tr(r)));
      ['yes','no'].forEach(v=>{ const td=el('td','center'); const inp=el('input'); inp.type='radio'; inp.name=f.id+'_'+i;
        if(c.v===v) inp.checked=true; inp.addEventListener('change',()=>{c.v=v; setA(f.id,cur);}); td.append(inp); tr_.append(td); });
      const tde=el('td'); const ti=el('input'); ti.type='text'; ti.value=c.e||''; ti.addEventListener('input',()=>{c.e=ti.value; setA(f.id,cur);}); tde.append(ti); tr_.append(tde);
      tb.append(tr_);
    });
    tbl.append(tb); return fieldWrap(f, tbl);
  }

  function rRowsConfirm(f){
    const cur = answers[f.id] || {};
    const tbl=el('table','matrix'); const thead=el('thead'); thead.append(rowCells(['',u().confirmed],true)); tbl.append(thead);
    const tb=el('tbody');
    f.rows.forEach((r,i)=>{
      const tr_=el('tr'); tr_.append(el('td',null,tr(r)));
      const td=el('td','center'); const inp=el('input'); inp.type='checkbox'; if(cur[i])inp.checked=true;
      inp.addEventListener('change',()=>{cur[i]=inp.checked; setA(f.id,cur);}); td.append(inp); tr_.append(td); tb.append(tr_);
    });
    tbl.append(tb); return fieldWrap(f, tbl);
  }

  function rConfirm(f){
    const optsF=[{en:'Confirmed',pl:'Potwierdzono'},{en:'Not confirmed',pl:'Nie potwierdzono'}];
    return rYesNo(f, optsF);
  }

  function rTable(f){
    const cur = answers[f.id] || (f.fixedRows ? f.rows.map(()=> ({})) : [{}]);
    answers[f.id]=cur;
    const tbl=el('table','matrix'); const thead=el('thead');
    const headLabels = f.columns.map(c=>tr(c.label)); if(!f.fixedRows) headLabels.push('');
    thead.append(rowCells(headLabels,true)); tbl.append(thead);
    const tb=el('tbody');
    function drawRow(rowObj, idx){
      const tr_=el('tr');
      f.columns.forEach((c)=>{
        const td=el('td');
        if(f.fixedRows && c.readonly){ td.textContent = tr(f.rows[idx]); td.style.background='#f7fafe'; td.style.fontWeight='600'; }
        else { const inp=el('input'); inp.type='text'; inp.value=rowObj[c.id]||''; inp.addEventListener('input',()=>{rowObj[c.id]=inp.value; saveDraft(); updateProgress();}); td.append(inp); }
        tr_.append(td);
      });
      if(!f.fixedRows){ const td=el('td','center'); const b=el('button','delrow','×'); b.type='button';
        b.addEventListener('click',()=>{ cur.splice(idx,1); rerenderTable(); }); td.append(b); tr_.append(td); }
      return tr_;
    }
    function rerenderTable(){ tb.innerHTML=''; cur.forEach((r,i)=>tb.append(drawRow(r,i))); }
    rerenderTable(); tbl.append(tb);
    const w = fieldWrap(f, tbl);
    if(!f.fixedRows){ const add=el('button','addrow',u().add); add.type='button';
      add.addEventListener('click',()=>{ cur.push({}); tb.append(drawRow(cur[cur.length-1],cur.length-1)); saveDraft(); }); w.append(add); }
    return w;
  }

  function rFeeTable(f){
    const cur = answers[f.id] || {};
    answers[f.id]=cur;
    const refundOpts = [{en:'Yes',pl:'Tak'},{en:'No',pl:'Nie'},{en:'Partly',pl:'Częściowo'}];
    const tbl=el('table','matrix'); const thead=el('thead');
    thead.append(rowCells([u().feeType,u().amount,u().currency,u().when,u().refundable],true)); tbl.append(thead);
    const tb=el('tbody');
    function feeRow(label, key, editableLabel){
      const c = cur[key] || {}; cur[key]=c;
      const tr_=el('tr');
      const tl=el('td');
      if(editableLabel){ const li=el('input'); li.type='text'; li.placeholder=u().other; li.value=c.label||''; li.addEventListener('input',()=>{c.label=li.value; saveDraft();}); tl.append(li); }
      else { tl.textContent=tr(label); tl.style.fontWeight='600'; }
      tr_.append(tl);
      ['amount','currency','when'].forEach(k=>{ const td=el('td'); const inp=el('input'); inp.type='text'; inp.value=c[k]||''; inp.addEventListener('input',()=>{c[k]=inp.value; saveDraft(); updateProgress();}); td.append(inp); tr_.append(td); });
      const tdr=el('td'); const sel=el('select'); sel.append(el('option','',''));
      refundOpts.forEach((o,i)=>{ const op=el('option'); op.value=i; op.textContent=tr(o); if(c.refundable==i)op.selected=true; sel.append(op); });
      sel.addEventListener('change',()=>{c.refundable=sel.value; saveDraft();}); tdr.append(sel); tr_.append(tdr);
      return tr_;
    }
    f.rows.forEach((label,i)=> tb.append(feeRow(label,'r'+i,false)));
    if(f.allowOther) tb.append(feeRow(null,'other',true));
    tbl.append(tb);
    return fieldWrap(f, tbl);
  }

  // small table helpers
  function rowCells(labels, head){ const tr_=el('tr'); labels.forEach(l=>{ const c=el(head?'th':'td'); c.textContent=l; tr_.append(c); }); return tr_; }
  function elHead(){ return el('thead'); }

  const RENDERERS = {
    text:f=>rText(f,false), date:f=>rText(f,false), textarea:f=>rText(f,true),
    yesno:f=>rYesNo(f,[{en:'Yes',pl:'Tak'},{en:'No',pl:'Nie'}]),
    checkboxes:rCheckboxes, rowsCheck:rRowsCheck, rowsYesNo:rRowsYesNo,
    rowsYesNoExplain:rRowsYesNoExplain, rowsConfirm:rRowsConfirm,
    confirm:rConfirm, table:rTable, feeTable:rFeeTable
  };

  // ---------- build the form ----------
  function build(){
    // header + intro
    $('#hdr-sub').textContent = tr(S.subtitle);
    document.documentElement.lang = L;
    const intro = $('#intro'); intro.innerHTML='';
    intro.append(el('h2',null,tr(S.intro.heading)));
    S.intro.body.forEach(p=> intro.append(el('p',null,tr(p))));

    const form = $('#ddform'); form.innerHTML='';
    S.sections.forEach(sec=>{
      const card=el('section','card section'); card.id='sec-'+sec.id;
      const head=el('div','section-head');
      head.append(el('span','section-num',sec.id), el('h2',null,tr(sec.title)));
      card.append(head);
      if(sec.intro) card.append(el('div','section-note',tr(sec.intro)));
      sec.fields.forEach(f=>{ const r=(RENDERERS[f.type]||RENDERERS.text)(f); card.append(r); });
      form.append(card);
    });

    // localized buttons / notes
    document.querySelectorAll('[data-en]').forEach(b=> b.textContent = b.dataset[L] || b.dataset.en);
    $('#submit-note').textContent = u().submitNote;
    updateProgress();
  }

  // ---------- progress ----------
  function answerable(){
    let total=0, done=0;
    S.sections.forEach(s=> s.fields.forEach(f=>{
      if(f.type==='info') return; total++;
      const v=answers[f.id];
      let filled=false;
      if(v==null) filled=false;
      else if(typeof v==='string') filled=v.trim()!=='';
      else if(typeof v==='number') filled=true;
      else if(Array.isArray(v)) filled=v.some(x=>x&&Object.values(x).some(z=>String(z||'').trim()!==''));
      else if(typeof v==='object'){
        if('sel'in v) filled=(v.sel&&v.sel.length)|| (v.other&&v.other.trim());
        else filled=Object.values(v).some(z=> z===true || (typeof z==='string'&&z.trim()!=='') || (z&&typeof z==='object'&&(z.v||String(z.e||'').trim())));
      }
      if(filled) done++;
    }));
    return {total,done};
  }
  function updateProgress(){ const {total,done}=answerable(); $('#progbar').style.width = Math.round(done/Math.max(total,1)*100)+'%'; }

  // ---------- validation ----------
  function validate(){
    let ok=true, first=null;
    document.querySelectorAll('.field.invalid').forEach(e=>e.classList.remove('invalid'));
    REQUIRED.forEach(id=>{ const v=answers[id]; if(!v||(typeof v==='string'&&!v.trim())){ ok=false; const w=document.querySelector(`.field[data-fid="${id}"]`); if(w){w.classList.add('invalid'); if(!first)first=w;} }});
    if(first){ first.scrollIntoView({behavior:'smooth',block:'center'}); }
    return ok;
  }

  // ---------- submit ----------
  async function submitForm(){
    if(!validate()){ toast(u().err,'bad'); return; }
    const btn=$('#submitBtn'); btn.disabled=true;
    try{
      const url = TOKEN ? '/api/submit/'+encodeURIComponent(TOKEN) : '/api/submit';
      const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers,lang:L})});
      if(!res.ok) throw new Error('http '+res.status);
      localStorage.removeItem(DRAFT_KEY);
      document.querySelector('main.wrap').innerHTML =
        `<div class="card intro-card"><h2>✓ ${tr(S.university? {en:'Submitted',pl:'Wysłano'}:{en:'Submitted'})}</h2><p>${u().submit}</p></div>`;
      window.scrollTo(0,0);
    }catch(e){ toast(u().netErr,'bad'); btn.disabled=false; }
  }

  // ---------- invitation banner ----------
  async function loadInvite(){
    if(!TOKEN) return;
    try{ const r=await fetch('/api/invitation/'+encodeURIComponent(TOKEN)); const d=await r.json();
      if(d.found && d.agency_name){ const b=$('#invite-banner'); b.classList.remove('hidden');
        b.textContent = (L==='pl'?'Zaproszenie dla: ':'Invitation for: ')+d.agency_name;
        if(!answers['1.1']){ answers['1.1']=d.agency_name; } }
    }catch(_){}
  }

  // ---------- events ----------
  document.querySelectorAll('.lang-toggle button').forEach(b=> b.addEventListener('click',()=>{
    L=b.dataset.lang; localStorage.setItem('vizja_lang',L);
    document.querySelectorAll('.lang-toggle button').forEach(x=>x.classList.toggle('active',x===b));
    build(); loadInvite().then(build);
  }));
  document.querySelectorAll('.lang-toggle button').forEach(x=>x.classList.toggle('active',x.dataset.lang===L));

  $('#saveDraft').addEventListener('click',()=>{ saveDraft(); toast(u().saved,'ok'); });
  $('#printBtn').addEventListener('click',()=> window.print());
  $('#submitBtn').addEventListener('click', submitForm);

  // init
  build();
  loadInvite().then(build);
})();
