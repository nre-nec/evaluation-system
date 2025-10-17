
const API = "https://evaluation-api.drelsodany3.workers.dev/api";
const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
const toast = (m)=>alert(m);

function saveSession(d){ localStorage.setItem('ncn_session', JSON.stringify(d)); }
function getSession(){ try{return JSON.parse(localStorage.getItem('ncn_session'))||null}catch(e){return null} }
function clearSession(){ localStorage.removeItem('ncn_session'); }
function ensureAuth(redir=true){ const s=getSession(); if(!s||!s.user){ if(redir) location.href='login.html'; return null; } return s; }
function logout(){ clearSession(); location.href='login.html'; }

// Login
async function initLogin(){
  const sel=$('#evaluatorSelect'), pwd=$('#passwordInput'), btn=$('#loginBtn');
  let evaluators=[];
  try{
    const r=await fetch(`${API}/evaluators`); evaluators=await r.json();
  }catch(e){ return toast('تعذر تحميل قائمة المقيمين / Unable to load evaluators'); }
  sel.innerHTML='<option value="">— اختر الاسم | Select —</option>'+evaluators.map(e=>`<option value="${e.username}" data-role="${e.role||'evaluator'}" data-committee="${e.committee||''}">${e.username}</option>`).join('');
  btn.addEventListener('click',()=>{
    const u=sel.value.trim(); const p=pwd.value.trim();
    if(!u||!p) return toast('يرجى اختيار الاسم وإدخال كلمة المرور / Please choose name and enter password');
    const user=evaluators.find(x=>x.username===u); if(!user) return toast('المستخدم غير موجود / User not found');
    if(user.password && user.password===p){ saveSession({user:{username:u, role:user.role||'evaluator', committee:user.committee||''}}); location.href='applicants.html'; }
    else toast('كلمة المرور غير صحيحة / Wrong password');
  });
}

// Applicants
async function initApplicants(){
  const s=ensureAuth(true); if(!s) return;
  $('#whoami').textContent=s.user.username;
  $('#logoutBtn').addEventListener('click',logout);
  let list=[]; try{ const r=await fetch(`${API}/applicants`); list=await r.json(); }catch(e){ return toast('تعذر تحميل بيانات المتقدمين / Failed to load applicants'); }
  const filtered=list.filter(a=>a.visible===true && (!s.user.committee || (a.committee||'')==(s.user.committee||'')));
  const tbody=$('#applicantsBody');
  tbody.innerHTML=filtered.length?filtered.map(a=>`
    <tr>
      <td>${a.id||''}</td><td>${a.name||''}</td><td>${a.department||''}</td><td>${a.position||''}</td><td>${a.committee||''}</td><td>${a.year||''}</td>
      <td><button class="secondary" data-id="${a.id}">تقييم | Evaluate</button></td>
    </tr>`).join(''):`<tr><td colspan="7" style="text-align:center;color:#888">لا يوجد متقدمون متاحون الآن | No visible applicants</td></tr>`;
  tbody.addEventListener('click',e=>{ const b=e.target.closest('button[data-id]'); if(!b) return; const id=b.getAttribute('data-id'); const app=filtered.find(x=>x.id==id); const ss=getSession()||{}; ss.applicant=app; saveSession(ss); location.href='evaluation.html'; });
}

// Evaluation
function calcTotal(){ let t=0; $$('#scores input[type="number"]').forEach(i=>t+=(+i.value||0)); $('#totalScore').textContent=t; return t; }
async function initEvaluation(){
  const s=ensureAuth(true); if(!s) return;
  $('#logoutBtn').addEventListener('click',logout);
  if(!s.applicant){ toast('لم يتم اختيار متقدم / No applicant selected'); location.href='applicants.html'; return; }
  $('#whoami').textContent=s.user.username;
  $('#appName').textContent=s.applicant.name||''; $('#appDept').textContent=s.applicant.department||''; $('#appPos').textContent=s.applicant.position||'';
  $('#appCommittee').textContent=s.applicant.committee||''; $('#appYear').textContent=s.applicant.year||'';
  $$('#scores input[type="number"]').forEach(inp=>inp.addEventListener('input',calcTotal)); calcTotal();
  $('#saveBtn').addEventListener('click', async ()=>{
    const payload={ applicantId:s.applicant.id||'', evaluatorName:s.user.username, committee:s.user.committee||'', year:s.applicant.year||'',
      scores:{ q1:+($('#q1').value||0), q2:+($('#q2').value||0), q3:+($('#q3').value||0), q4:+($('#q4').value||0) },
      total:calcTotal(), remarks:$('#remarks').value.trim(), timestamp:new Date().toISOString() };
    try{ const r=await fetch(`${API}/evaluations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!r.ok) throw new Error('HTTP '+r.status); toast('تم الحفظ بنجاح / Saved successfully ✅'); }
    catch(e){ toast('تعذر الحفظ / Failed to save ❌'); }
  });
}

document.addEventListener('DOMContentLoaded',()=>{ if(document.body.dataset.page==='login') return initLogin(); if(document.body.dataset.page==='applicants') return initApplicants(); if(document.body.dataset.page==='evaluation') return initEvaluation(); });
