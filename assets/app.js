
const API = "https://evaluation-api.drelsodany3.workers.dev";
const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

function toast(msg, cls='notice') {
  const t = document.createElement('div'); t.className = cls; t.textContent = msg;
  document.querySelector('.container')?.prepend(t);
  setTimeout(()=>t.remove(), 3500);
}

function saveSession(s){ localStorage.setItem('ncn_session', JSON.stringify(s)); }
function getSession(){ try{ return JSON.parse(localStorage.getItem('ncn_session'))||null;}catch(e){return null} }
function clearSession(){ localStorage.removeItem('ncn_session'); }
function ensureAuth(){ const s=getSession(); if(!s||!s.user){ location.href='login.html'; return null; } return s; }
function logout(){ clearSession(); location.href='login.html'; }

async function apiGet(path){
  const r = await fetch(`${API}/${path}`);
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

async function apiPost(path, body){
  const r = await fetch(`${API}/${path}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if(!r.ok) throw new Error('HTTP '+r.status);
  try{ return await r.json(); }catch(_){ return {ok:true}; }
}

function exportCSV(filename, rows) {
  const csv = rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click();
}
