/* ═══════════════════════════════════════════
   ESPACE CLIENT — logique (localStorage)
════════════════════════════════════════════ */

// ── Utilitaires session ──
function ecGetUser(){
  try{ return JSON.parse(localStorage.getItem('ec_user')||'null'); }
  catch(e){ return null; }
}
function ecSetUser(u){ localStorage.setItem('ec_user', JSON.stringify(u)); }

// Vraie session séparée des données utilisateur
function ecIsLoggedIn(){ return localStorage.getItem('ec_session')==='1'; }
function ecSetSession(){ localStorage.setItem('ec_session','1'); }
function ecClearSession(){ localStorage.removeItem('ec_session'); }

function ecGuard(){
  if(!ecIsLoggedIn()) window.location.href='connexion.html';
}

// ── Toggle mot de passe visible/caché ──
function ecTogglePwd(inputId, btn){
  var inp = document.getElementById(inputId);
  if(!inp) return;
  var show = inp.type==='password';
  inp.type = show ? 'text' : 'password';
  btn.style.opacity = show ? '1' : '.5';
}

// ── Connexion ──
function ecLogin(){
  var email = (document.getElementById('ec-email')||{}).value||'';
  var pwd   = (document.getElementById('ec-pwd')||{}).value||'';
  var errEl = document.getElementById('ec-login-err');
  var btn   = document.querySelector('.ec-btn-primary');

  // Validation basique
  if(!email.trim() || !pwd){
    if(errEl){ errEl.textContent='Veuillez remplir tous les champs.'; errEl.style.display='block'; }
    return;
  }

  var user = ecGetUser();

  // Aucun compte créé
  if(!user){
    if(errEl){ errEl.innerHTML='Aucun compte trouvé. <a href="inscription.html">Créez votre compte</a>.'; errEl.style.display='block'; }
    return;
  }

  // Vérification des identifiants
  if(user.email !== email.trim().toLowerCase() || user.pwd !== pwd){
    if(errEl){ errEl.textContent='Email ou mot de passe incorrect.'; errEl.style.display='block'; }
    // Shake animation
    var card = document.querySelector('.ec-auth-card');
    if(card){ card.style.animation='none'; setTimeout(function(){ card.style.animation='ecShake .4s ease'; },10); }
    return;
  }

  if(errEl) errEl.style.display='none';
  if(btn){ btn.textContent='Connexion…'; btn.disabled=true; }

  // Ouvre la session
  ecSetSession();
  setTimeout(function(){ window.location.href='espaceclient.html'; }, 300);
}

// ── Inscription ──
function ecRegister(){
  var prenom = (document.getElementById('ec-prenom')||{}).value||'';
  var nom    = (document.getElementById('ec-nom')||{}).value||'';
  var email  = (document.getElementById('ec-email-reg')||{}).value||'';
  var tel    = (document.getElementById('ec-tel-reg')||{}).value||'';
  var ref    = (document.getElementById('ec-ref-dossier')||{}).value||'';
  var pwd    = (document.getElementById('ec-pwd-reg')||{}).value||'';
  var pwdC   = (document.getElementById('ec-pwd-confirm')||{}).value||'';
  var cgu    = document.getElementById('ec-cgu');
  var errEl  = document.getElementById('ec-reg-err');
  var btn    = document.querySelector('.ec-btn-primary');

  var errors=[];
  if(!prenom.trim()) errors.push('Le prénom est requis.');
  if(!nom.trim())    errors.push('Le nom est requis.');
  if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)) errors.push('Adresse email invalide.');
  if(!tel.trim())    errors.push('Le numéro de téléphone est requis.');
  if(pwd.length<8)   errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  if(pwd!==pwdC)     errors.push('Les mots de passe ne correspondent pas.');
  if(!cgu||!cgu.checked) errors.push('Vous devez accepter les Conditions Générales.');

  if(errors.length){
    if(errEl){ errEl.innerHTML=errors.join('<br/>'); errEl.style.display='block'; }
    return;
  }
  if(errEl) errEl.style.display='none';
  if(btn){ btn.textContent='Création…'; btn.disabled=true; }

  var uid = 'USR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
  var user={
    id: uid,
    prenom:prenom.trim(), nom:nom.trim(),
    email:email.trim().toLowerCase(), tel:tel.trim(),
    ref:ref.trim().toUpperCase(), pwd:pwd,
    createdAt:new Date().toISOString()
  };
  ecSetUser(user);
  ecSetSession();
  setTimeout(function(){ window.location.href='espaceclient.html'; }, 300);
}

// ── Déconnexion ──
function ecLogout(){
  ecClearSession();
  window.location.href='connexion.html';
}

// ── Init header dashboard ──
function ecInitHeader(){
  var user=ecGetUser();
  if(!user) return;
  var av=document.getElementById('ec-hd-avatar');
  var nm=document.getElementById('ec-hd-name');
  var photo=localStorage.getItem('ec_photo');
  var initials=(((user.prenom||'')[0]||'').toUpperCase()+(( user.nom||'')[0]||'').toUpperCase())||'U';
  if(av){
    if(photo){
      av.innerHTML='<img src="'+photo+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
    } else {
      av.textContent=initials;
    }
  }
  if(nm) nm.textContent=user.prenom||'Mon compte';
  // Sidebar desktop
  var sav=document.getElementById('ec-sidebar-avatar');
  var snm=document.getElementById('ec-sidebar-user-name');
  var sid=document.getElementById('ec-sidebar-user-id');
  if(sav){ if(photo) sav.innerHTML='<img src="'+photo+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>'; else sav.textContent=initials; }
  if(snm) snm.textContent=(user.prenom||'')+' '+(user.nom||'');
  if(sid) sid.textContent=user.id||'—';
}

// ── Solde ──
function ecGetSolde(){ return parseFloat(localStorage.getItem('ec_solde')||'0'); }
function ecSetSolde(v){ localStorage.setItem('ec_solde', v.toFixed(2)); }
function ecFormatAmt(v){ return v.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'; }

function ecSoldeHidden(){ return localStorage.getItem('ec_solde_hidden')==='1'; }

function ecRefreshSolde(){
  var el = document.getElementById('ec-solde-amt');
  if(!el) return;
  if(ecSoldeHidden()){
    el.textContent = '* * * * * *';
  } else {
    el.textContent = ecFormatAmt(ecGetSolde());
  }
  var eyeBtn = document.getElementById('ec-eye-toggle');
  if(eyeBtn){
    eyeBtn.innerHTML = ecSoldeHidden()
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
}

function ecToggleSolde(){
  var hidden = ecSoldeHidden();
  localStorage.setItem('ec_solde_hidden', hidden ? '0' : '1');
  var el = document.getElementById('ec-solde-amt');
  if(el){
    el.style.transition = 'opacity .18s';
    el.style.opacity = '0';
    setTimeout(function(){
      ecRefreshSolde();
      ecRenderTx();
      el.style.opacity = '1';
    }, 180);
  } else {
    ecRefreshSolde();
    ecRenderTx();
  }
}

// ── Transactions ──
function ecGetTx(){ try{ return JSON.parse(localStorage.getItem('ec_tx')||'[]'); }catch(e){ return []; } }
function ecAddTx(tx){
  var list = ecGetTx();
  if(!tx.ts) tx.ts = Date.now();
  list.unshift(tx);
  if(list.length > 30) list = list.slice(0,30);
  localStorage.setItem('ec_tx', JSON.stringify(list));
}
function ecTxInitials(label){
  var words = label.replace(/—/g,' ').trim().split(/\s+/);
  if(words.length >= 2) return (words[0][0]+(words[1][0]||'')).toUpperCase();
  return label.substring(0,2).toUpperCase();
}
var EC_AVATAR_COLORS = [
  ['#DBEAFE','#1D4ED8'],['#D1FAE5','#065F46'],
  ['#FEE2E2','#991B1B'],['#EDE9FE','#6D28D9'],
  ['#FEF3C7','#92400E'],['#E0F2FE','#0369A1']
];
function ecTxColor(label){
  var i = label.charCodeAt(0) % EC_AVATAR_COLORS.length;
  return EC_AVATAR_COLORS[i];
}
var EC_TX_SHOW_ALL = false;
var EC_TX_FILTER = 'tous';

function ecToggleTxAll(e){
  if(e) e.preventDefault();
  EC_TX_SHOW_ALL = !EC_TX_SHOW_ALL;
  ecRenderTx();
  var btn = document.getElementById('ec-tx-voir-tout');
  if(btn) btn.textContent = EC_TX_SHOW_ALL ? 'Réduire' : 'Tout afficher';
}

function ecFilterTxList(list){
  var now = new Date();
  return list.filter(function(tx){
    if(EC_TX_FILTER==='tous') return true;
    if(EC_TX_FILTER==='depot') return tx.type==='depot';
    if(EC_TX_FILTER==='virement') return tx.type==='virement';
    if(EC_TX_FILTER==='mois'){
      var d = tx.ts ? new Date(tx.ts) : null;
      return d && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }
    return true;
  });
}

function ecRenderTx(){
  var list = ecFilterTxList(ecGetTx());
  var container = document.getElementById('ec-tx-list');
  var empty = document.getElementById('ec-tx-empty');
  if(!container) return;
  if(!list.length){
    container.innerHTML = '<div class="ec-tx-empty">'
      + (EC_TX_FILTER==='tous' ? 'Aucune opération pour le moment.' : 'Aucune transaction dans cette catégorie.')
      + '</div>';
    return;
  }
  if(empty) empty.style.display='none';
  var hidden = ecSoldeHidden();
  var displayed = EC_TX_SHOW_ALL ? list : list.slice(0,5);
  var html = displayed.map(function(tx){
    var isOut = tx.type==='virement';
    var isConv = tx.type==='convert';
    var sign = isOut ? '−' : '+';
    var amtCls = isOut ? 'ec-tx-amt--out' : 'ec-tx-amt--in';
    var icoCls = isConv ? 'ec-tx-ico--conv' : (isOut ? 'ec-tx-ico--out' : 'ec-tx-ico--in');
    var initials = ecTxInitials(tx.label);
    var colors = ecTxColor(tx.label);
    var avatarStyle = 'background:'+colors[0]+';color:'+colors[1]+';';
    var amtDisplay = hidden ? '<span style="letter-spacing:.12em;color:var(--muted)">* * * *</span>' : sign+ecFormatAmt(tx.amt);
    var txJson = encodeURIComponent(JSON.stringify(tx));
    return '<div class="ec-tx-item ec-tx-item--clickable" onclick="ecOpenTxDetail(\''+txJson+'\')">'
      +'<div class="ec-tx-ico '+icoCls+'" style="'+avatarStyle+'">'+initials+'</div>'
      +'<div class="ec-tx-info">'
      +'<div class="ec-tx-name">'+tx.label+'</div>'
      +'<div class="ec-tx-date">'+tx.date+'</div>'
      +'</div>'
      +'<div class="ec-tx-amt '+amtCls+'">'+amtDisplay+'</div>'
      +'<svg class="ec-tx-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>'
      +'</div>';
  }).join('');
  container.innerHTML = html;
}

// ── Détail transaction ──
function ecOpenTxDetail(encoded){
  var tx;
  try{ tx = JSON.parse(decodeURIComponent(encoded)); } catch(e){ return; }
  var isOut = tx.type==='virement';
  var isConv = tx.type==='convert';
  var sign = isOut ? '−' : '+';
  var typeLabel = isOut ? 'Virement sortant' : (isConv ? 'Conversion de devises' : 'Dépôt entrant');
  var typeColor = isOut ? 'var(--text)' : 'var(--green)';
  var statusHtml = '<span style="display:inline-flex;align-items:center;gap:.35rem;background:var(--green-light);color:var(--green);border:1px solid rgba(5,150,105,.2);border-radius:6px;padding:.22rem .65rem;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em">'
    +'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>Validée</span>';

  var el = document.getElementById('ec-modal-tx');
  if(!el) return;
  el.querySelector('#ec-tx-d-label').textContent  = tx.label;
  el.querySelector('#ec-tx-d-type').textContent   = typeLabel;
  el.querySelector('#ec-tx-d-date').textContent   = tx.date;
  el.querySelector('#ec-tx-d-amt').textContent    = sign + ecFormatAmt(tx.amt);
  el.querySelector('#ec-tx-d-amt').style.color    = typeColor;
  el.querySelector('#ec-tx-d-status').innerHTML   = statusHtml;
  el.querySelector('#ec-tx-d-ref').textContent    = 'TXN-'+(tx.date||'').replace(/\s/g,'').slice(-6).toUpperCase()+Math.floor(Math.random()*9000+1000);
  ecOpenModal('tx');
}

// ── Modals ──
function ecOpenModal(name){
  var el = document.getElementById('ec-modal-'+name);
  if(!el) return;
  var scrollY = window.scrollY || window.pageYOffset;
  document.body.dataset.scrollY = scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + scrollY + 'px';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
  el.classList.add('open');
}
function ecCloseModal(name){
  var el = document.getElementById('ec-modal-'+name);
  if(!el) return;
  el.classList.remove('open');
  var scrollY = parseInt(document.body.dataset.scrollY || '0');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollY);
}

function ecConfirmDepot(){
  var amt  = parseFloat((document.getElementById('ec-depot-amt')||{}).value||'0');
  var errEl = document.getElementById('ec-depot-err');
  if(!amt || amt <= 0){
    if(errEl){ errEl.textContent='Veuillez saisir un montant valide.'; errEl.style.display='block'; }
    return;
  }
  if(errEl) errEl.style.display='none';
  var nouveau = ecGetSolde() + amt;
  ecSetSolde(nouveau);
  ecAddTx({ type:'depot', label:'Dépôt', amt:amt, date: new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) });
  ecRefreshSolde();
  ecRenderTx();
  ecCloseModal('depot');
  document.getElementById('ec-depot-amt').value='';
  document.getElementById('ec-success-title').textContent='Dépôt effectué';
  document.getElementById('ec-success-msg').textContent='+'+ecFormatAmt(amt)+' crédités. Nouveau solde : '+ecFormatAmt(nouveau);
  ecOpenModal('success');
}

// ── Convertisseur ──
var EC_RATES = {
  GBP:0.8547, CHF:0.9623, SEK:11.42, NOK:11.73, DKK:7.461,
  PLN:4.258,  CZK:25.14,  HUF:393.2, RON:4.976, BGN:1.956,
  HRK:7.534,  TRY:36.12,  ISK:149.8
};
var EC_SYMBOLS = {
  GBP:'£', CHF:'Fr', SEK:'kr', NOK:'kr', DKK:'kr',
  PLN:'zł', CZK:'Kč', HUF:'Ft', RON:'lei', BGN:'лв',
  HRK:'kn', TRY:'₺', ISK:'kr'
};

function ecConvert(){
  var amt  = parseFloat((document.getElementById('ec-conv-amt')||{}).value||'0');
  var cur  = (document.getElementById('ec-conv-currency')||{}).value||'GBP';
  var rate = EC_RATES[cur] || 1;
  var sym  = EC_SYMBOLS[cur] || cur;
  var res  = amt * rate;
  var resEl  = document.getElementById('ec-conv-res-amt');
  var rateEl = document.getElementById('ec-conv-res-rate');
  if(resEl) resEl.textContent = amt > 0 ? res.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' '+sym : '—';
  if(rateEl) rateEl.textContent = amt > 0 ? '1 € = '+rate+' '+cur : '';
  // Refresh rates from API if available
  if(amt > 0 && !ecConvert._fetched){
    ecConvert._fetched = true;
    fetch('https://api.frankfurter.app/latest?from=EUR&to='+Object.keys(EC_RATES).join(','))
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.rates) Object.assign(EC_RATES, d.rates);
        ecConvert();
      }).catch(function(){});
  }
}

function ecConfirmVirement(){
  var nom   = ((document.getElementById('ec-vir-nom')||{}).value||'').trim();
  var iban  = ((document.getElementById('ec-vir-iban')||{}).value||'').trim();
  var amt   = parseFloat((document.getElementById('ec-vir-amt')||{}).value||'0');
  var errEl = document.getElementById('ec-vir-err');
  var solde = ecGetSolde();

  if(!nom){ if(errEl){ errEl.textContent='Le nom du bénéficiaire est requis.'; errEl.style.display='block'; } return; }
  if(!iban){ if(errEl){ errEl.textContent='L\'IBAN destinataire est requis.'; errEl.style.display='block'; } return; }
  if(!amt || amt <= 0){ if(errEl){ errEl.textContent='Veuillez saisir un montant valide.'; errEl.style.display='block'; } return; }
  if(amt > solde){ if(errEl){ errEl.textContent='Solde insuffisant ('+ecFormatAmt(solde)+' disponible).'; errEl.style.display='block'; } return; }

  if(errEl) errEl.style.display='none';
  var nouveau = solde - amt;
  ecSetSolde(nouveau);
  ecAddTx({ type:'virement', label:'Virement — '+nom, amt:amt, date: new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) });
  ecRefreshSolde();
  ecRenderTx();
  ecCloseModal('virement');
  ['ec-vir-nom','ec-vir-iban','ec-vir-amt','ec-vir-motif'].forEach(function(id){ var e=document.getElementById(id); if(e)e.value=''; });
  document.getElementById('ec-success-title').textContent='Virement envoyé';
  document.getElementById('ec-success-msg').textContent=ecFormatAmt(amt)+' virés à '+nom+'. Nouveau solde : '+ecFormatAmt(nouveau);
  ecOpenModal('success');
}

// ── Tableau de bord ──
function ecInitDashboard(){
  ecGuard();
  ecInitHeader();
  ecRefreshSolde();
  ecRenderTx();
  var user=ecGetUser();

  var welcomeEl=document.getElementById('ec-welcome-name');
  if(welcomeEl) welcomeEl.textContent='Bonjour, '+(user.prenom||'')+' !';

  var dateEl=document.getElementById('ec-welcome-date');
  if(dateEl){
    var d=new Date();
    dateEl.textContent=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  var loan = user.loan || {};
  var capital    = loan.montant    || 0;
  var mens       = loan.mensualite || 0;
  var duree      = loan.duree      || 60;
  var dateDebut  = loan.dateDebut  ? new Date(loan.dateDebut) : new Date();
  var moisPasses = Math.max(0, Math.floor((new Date() - dateDebut) / (30.44 * 24 * 3600 * 1000)));
  moisPasses     = Math.min(moisPasses, duree);
  var restant    = capital > 0 ? Math.round(capital - (capital / duree) * moisPasses) : 0;
  var pct        = capital > 0 ? Math.round((moisPasses / duree) * 100) : 0;

  var refEl=document.getElementById('ec-credit-ref');
  if(refEl) refEl.textContent=user.ref||'—';

  var set=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};

  if(capital > 0){
    set('ec-stat-capital', capital.toLocaleString('fr-FR')+'€');
    set('ec-stat-mens',    mens.toLocaleString('fr-FR')+'€ / mois');
    set('ec-stat-restant', restant.toLocaleString('fr-FR')+'€');
    set('ec-prog-pct',     pct+'%');
    set('ec-next-amt',     mens.toLocaleString('fr-FR')+'€');
  } else {
    set('ec-stat-capital', 'En attente');
    set('ec-stat-mens',    '—');
    set('ec-stat-restant', '—');
    set('ec-prog-pct',     '0%');
    set('ec-next-amt',     '—');
  }

  var fill=document.getElementById('ec-prog-fill');
  if(fill) setTimeout(function(){fill.style.width=pct+'%';},200);

  var next=new Date(); next.setDate(1); next.setMonth(next.getMonth()+1);
  var nextStr='1er '+next.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  set('ec-next-date',nextStr);
  set('ec-next-date-2',nextStr);
  set('ec-next-amt-2',mens>0?mens.toLocaleString('fr-FR')+'€':'—');

  ecInitAlertBanner();
  ecInitHealthScore();
  ecInitSpendingChart();
  ecInitRib();
  ecCalcRemb();
  ecInitNotifs();
}

// ── Mes documents ──
function ecInitDocuments(){
  ecGuard();
  ecInitHeader();
  var user = ecGetUser();
  if(!user) return;
  var createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  var fmtDate = function(d){ return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}); };
  // Date de signature = date de création du compte
  var signDate = fmtDate(createdAt);
  // Relevé mois précédent
  var releve1 = new Date(createdAt); releve1.setDate(1);
  var releve1Lbl = releve1.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  var releve1Dispo = new Date(releve1); releve1Dispo.setMonth(releve1Dispo.getMonth()+1);
  var releve2 = new Date(releve1); releve2.setMonth(releve2.getMonth()-1);
  var releve2Lbl = releve2.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  var releve2Dispo = new Date(releve2); releve2Dispo.setMonth(releve2Dispo.getMonth()+1);
  // Attestation valide 1 an
  var assuranceExp = new Date(createdAt); assuranceExp.setFullYear(assuranceExp.getFullYear()+1);

  var setDoc = function(sel, txt){ var el = document.querySelector(sel); if(el) el.textContent = txt; };
  // Contrat + tableau
  document.querySelectorAll('.ec-doc-item[data-cat="contrat"] .ec-doc-meta')[0] &&
    (document.querySelectorAll('.ec-doc-item[data-cat="contrat"] .ec-doc-meta')[0].textContent = 'Signé le '+signDate+' · 124 Ko');
  document.querySelectorAll('.ec-doc-item[data-cat="contrat"] .ec-doc-meta')[1] &&
    (document.querySelectorAll('.ec-doc-item[data-cat="contrat"] .ec-doc-meta')[1].textContent = 'Généré le '+signDate+' · 48 Ko');
  // Relevés
  var releveMetas = document.querySelectorAll('.ec-doc-item[data-cat="releve"] .ec-doc-meta');
  if(releveMetas[0]) releveMetas[0].textContent = 'Disponible le '+fmtDate(releve1Dispo)+' · 32 Ko';
  if(releveMetas[1]) releveMetas[1].textContent = 'Disponible le '+fmtDate(releve2Dispo)+' · 30 Ko';
  // Noms relevés
  var releveNoms = document.querySelectorAll('.ec-doc-item[data-cat="releve"] .ec-doc-name');
  if(releveNoms[0]) releveNoms[0].textContent = 'Relevé de compte — '+releve1Lbl.charAt(0).toUpperCase()+releve1Lbl.slice(1);
  if(releveNoms[1]) releveNoms[1].textContent = 'Relevé de compte — '+releve2Lbl.charAt(0).toUpperCase()+releve2Lbl.slice(1);
  // Attestation
  var attMeta = document.querySelector('.ec-doc-item[data-cat="attestation"] .ec-doc-meta');
  if(attMeta) attMeta.textContent = 'Valide jusqu\'au '+fmtDate(assuranceExp)+' · 56 Ko';
}

function ecDocFilter(cat, btn){
  document.querySelectorAll('.ec-doc-ftab').forEach(function(t){t.classList.remove('active');});
  btn.classList.add('active');
  document.querySelectorAll('.ec-doc-item').forEach(function(item){
    item.classList.toggle('hidden', cat!=='tous' && item.dataset.cat!==cat);
  });
}
function ecFakeDownload(btn){
  var orig=btn.innerHTML;
  btn.innerHTML='✓'; btn.style.background='var(--teal)'; btn.style.color='#fff';
  setTimeout(function(){btn.innerHTML=orig; btn.style.background=''; btn.style.color='';},2200);
}
function ecRequestDoc(btn){ btn.textContent='Envoyé !'; btn.disabled=true; }

// ── Suivi dossier ──
function ecInitSuivi(){
  ecGuard();
  ecInitHeader();
  var user=ecGetUser();
  if(user&&user.ref){
    var inp=document.getElementById('ec-suivi-ref');
    if(inp) inp.value=user.ref;
  }
}

function ecSuiviSearch(){
  var val=((document.getElementById('ec-suivi-ref')||{}).value||'').trim();
  var errEl=document.getElementById('ec-suivi-err');
  var result=document.getElementById('ec-suivi-result');

  // Validation : au moins 5 caractères
  if(val.length<5){
    if(errEl){errEl.style.display='block';}
    if(result){result.style.display='none';}
    return;
  }
  if(errEl) errEl.style.display='none';
  if(result) result.style.display='block';

  // Affiche le numéro saisi
  var refDisp=document.getElementById('ec-suivi-ref-disp');
  if(refDisp) refDisp.textContent=val.toUpperCase();

  // Date simulée : hier
  var d=new Date(); d.setDate(d.getDate()-1);
  var dateStr=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})+' à '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var dateEl=document.getElementById('ec-tl-date1');
  if(dateEl) dateEl.textContent=dateStr;

  if(result) result.scrollIntoView({behavior:'smooth',block:'start'});
}

// ── Indicateur force mot de passe ──
(function(){
  var inp=document.getElementById('ec-pwd-reg');
  var bar=document.getElementById('ec-pwd-strength');
  if(!inp||!bar) return;
  inp.addEventListener('input',function(){
    var v=this.value;
    bar.innerHTML='<span></span><span></span><span></span>';
    bar.className='ec-pwd-strength';
    if(!v) return;
    if(v.length>=10&&/[A-Z]/.test(v)&&/[0-9]/.test(v)) bar.classList.add('strong');
    else if(v.length>=8) bar.classList.add('medium');
    else bar.classList.add('weak');
  });
})();

// ── Touche Entrée sur les formulaires ──
(function(){
  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter') return;
    var path=window.location.pathname;
    if(path.indexOf('connexion')!==-1) ecLogin();
    else if(path.indexOf('inscription')!==-1) ecRegister();
    else if(path.indexOf('suivi-dossier')!==-1) ecSuiviSearch();
  });
})();


// ── Bannière alerte ──
function ecInitAlertBanner(){
  var user=ecGetUser();
  if(!user) return;
  var loan=user.loan||{};
  var mens=loan.mensualite||0;
  var solde=parseFloat(localStorage.getItem('ec_solde')||'0');
  var msgs=[];

  // Prochaine échéance dans <7 jours ?
  var next=new Date(); next.setDate(1); next.setMonth(next.getMonth()+1);
  var diff=Math.ceil((next-new Date())/(24*3600*1000));
  if(mens>0 && diff<=7) msgs.push('Votre prochaine échéance de '+mens.toLocaleString('fr-FR')+'€ est dans '+diff+' jour'+(diff>1?'s':'')+'.');

  // Solde faible ?
  if(mens>0 && solde < mens*2) msgs.push('Votre solde est insuffisant pour couvrir 2 mensualités.');

  var banner=document.getElementById('ec-alert-banner');
  var txt=document.getElementById('ec-alert-banner-text');
  var dot=document.getElementById('ec-bell-dot');
  if(msgs.length>0){
    if(txt) txt.textContent=msgs[0];
    if(banner) banner.style.display='flex';
    if(dot) dot.style.display='block';
  }
}

// ── Santé financière ──
function ecInitHealthScore(){
  var user=ecGetUser();
  if(!user) return;
  var loan=user.loan||{};
  var mens=loan.mensualite||0;
  var solde=parseFloat(localStorage.getItem('ec_solde')||'0');
  var card=document.getElementById('ec-health-card');
  if(!card) return;
  if(!mens){ card.style.display='none'; return; }

  var ratio=solde>0 ? mens/solde : 1;
  var score,label,pct,cls;
  if(ratio<0.2){score='Excellent';pct=95;cls='excellent';}
  else if(ratio<0.35){score='Bon';pct=70;cls='bon';}
  else if(ratio<0.5){score='Correct';pct=45;cls='correct';}
  else{score='À surveiller';pct=20;cls='surveiller';}

  var scoreEl=document.getElementById('ec-health-score');
  var fill=document.getElementById('ec-health-fill');
  var detail=document.getElementById('ec-health-detail');
  if(scoreEl){scoreEl.textContent=score;scoreEl.className='ec-health-score '+cls;}
  if(fill) setTimeout(function(){fill.style.width=pct+'%';fill.style.background=cls==='excellent'?'var(--teal)':cls==='bon'?'#2563EB':cls==='correct'?'#F59E0B':'var(--coral)';},300);
  if(detail) detail.textContent='Ratio mensualité/solde : '+Math.round(ratio*100)+'%';
}

// ── Graphique dépenses (donut SVG) ──
function ecInitSpendingChart(){
  var txRaw=localStorage.getItem('ec_tx');
  var txList=[];
  try{txList=JSON.parse(txRaw)||[];}catch(e){}

  var cats={};
  var colors=['#0B5E8A','#0B9E8A','#ff6b5c','#F59E0B','#7C3AED','#059669'];
  var LABELS={virement:'Virements',convert:'Conversions'};
  txList.forEach(function(tx){
    if(tx.type==='virement'||tx.type==='convert'){
      var c=LABELS[tx.type]||'Autre';
      cats[c]=(cats[c]||0)+Math.abs(tx.amt||0);
    }
  });

  var entries=Object.entries(cats).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  var total=entries.reduce(function(s,e){return s+e[1];},0);

  var svg=document.getElementById('ec-donut-svg');
  var legend=document.getElementById('ec-chart-legend');
  var totalEl=document.getElementById('ec-donut-total');
  var card=document.getElementById('ec-chart-card');
  if(!svg||!legend) return;

  if(!entries.length||total===0){if(card) card.style.display='none';return;}

  if(totalEl) totalEl.textContent=total.toLocaleString('fr-FR')+'€';

  var cx=55,cy=55,r=42,stroke=14;
  var circ=2*Math.PI*r;
  var offset=0;
  var paths='';
  entries.forEach(function(e,i){
    var pct=e[1]/total;
    var dash=pct*circ;
    var gap=circ-dash;
    paths+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+colors[i%colors.length]+'" stroke-width="'+stroke+'" stroke-dasharray="'+dash.toFixed(2)+' '+gap.toFixed(2)+'" stroke-dashoffset="'+(-offset*circ/1).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')" />';
    offset+=pct;

    var item=document.createElement('div');
    item.className='ec-chart-legend-item';
    item.innerHTML='<div class="ec-chart-legend-dot" style="background:'+colors[i%colors.length]+'"></div><span>'+e[0]+'</span><span class="ec-chart-legend-pct">'+Math.round(pct*100)+'%</span>';
    legend.appendChild(item);
  });
  svg.innerHTML='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="var(--border)" stroke-width="'+stroke+'"/>'+paths;
}

// ── Filtrer transactions ──
function ecFilterTx(type, btn){
  document.querySelectorAll('.ec-tx-ftab').forEach(function(t){t.classList.remove('active');});
  if(btn) btn.classList.add('active');
  EC_TX_FILTER = type || 'tous';
  ecRenderTx();
}

// ── RIB / IBAN ──
function ecGenerateIban(userId){
  var seed=(userId||'SOF000').replace(/[^0-9]/g,'').padStart(10,'0').slice(0,10);
  return 'FR76 3000 6000 '+seed.slice(0,4)+' '+seed.slice(4,8)+' '+seed.slice(8)+'00 00';
}
function ecInitRib(){
  var user=ecGetUser();
  if(!user) return;
  var iban=ecGenerateIban(user.id||'');
  var set=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};
  set('ec-rib-titulaire',(user.prenom||'')+' '+(user.nom||''));
  set('ec-rib-iban',iban);
  set('ec-rib-bic','SWEKFRPPXXX');
  set('ec-rib-banque','Swek');
}
function ecCopyIban(){
  var user=ecGetUser();
  if(!user) return;
  var iban=ecGenerateIban(user.id||'').replace(/\s/g,'');
  navigator.clipboard.writeText(iban).then(function(){
    var msg=document.getElementById('ec-rib-copied');
    if(msg){msg.textContent='IBAN copié !';setTimeout(function(){msg.textContent='';},2500);}
  });
}
function ecDownloadRib(){
  var user=ecGetUser();
  if(!user) return;
  var iban=ecGenerateIban(user.id||'');
  var content='RIB — Swek\n\nTitulaire : '+(user.prenom||'')+' '+(user.nom||'')+'\nIBAN      : '+iban+'\nBIC       : SWEKFRPPXXX\nBanque    : Swek\n\nDocument généré le '+new Date().toLocaleDateString('fr-FR');
  var blob=new Blob([content],{type:'text/plain'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RIB_Swek.txt';a.click();
}

// ── Remboursement anticipé ──
function ecCalcRemb(){
  var user=ecGetUser();
  if(!user) return;
  var loan=user.loan||{};
  var capital=loan.montant||0;
  var mens=loan.mensualite||0;
  var duree=loan.duree||60;
  var taux=(loan.taux||3)/100/12;
  var dateDebut=loan.dateDebut?new Date(loan.dateDebut):new Date();
  var moisPasses=Math.max(0,Math.floor((new Date()-dateDebut)/(30.44*24*3600*1000)));
  moisPasses=Math.min(moisPasses,duree);
  var restant=Math.max(0,Math.round(capital-(capital/duree)*moisPasses));

  var sixMoisInterets=Math.round(restant*taux*6);
  var troisPctCapital=Math.round(restant*0.03);
  var ira=Math.min(sixMoisInterets,troisPctCapital);
  var total=restant+ira;

  var set=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};
  set('ec-remb-capital',restant.toLocaleString('fr-FR')+'€');
  set('ec-remb-ira',ira.toLocaleString('fr-FR')+'€');
  set('ec-remb-total',total.toLocaleString('fr-FR')+'€');
}

// ── Notifications ──
function ecInitNotifs(){
  var user=ecGetUser();
  var loan=(user||{}).loan||{};
  var mens=loan.mensualite||0;
  var solde=parseFloat(localStorage.getItem('ec_solde')||'0');
  var list=document.getElementById('ec-notif-list');
  if(!list) return;
  list.innerHTML='';
  var notifs=[];

  var next=new Date();next.setDate(1);next.setMonth(next.getMonth()+1);
  var diff=Math.ceil((next-new Date())/(24*3600*1000));
  if(mens>0&&diff<=7) notifs.push({type:'warn',txt:'<strong>Échéance proche</strong> — Prélèvement de '+mens.toLocaleString('fr-FR')+'€ dans '+diff+' jour'+(diff>1?'s':'')+'.'});
  if(mens>0&&solde<mens*2) notifs.push({type:'warn',txt:'<strong>Solde faible</strong> — Votre solde est inférieur à 2 mensualités.'});
  notifs.push({type:'info',txt:'<strong>Bienvenue</strong> — Votre espace client Swek est actif.'});

  if(!notifs.length){
    list.innerHTML='<div class="ec-notif-empty">Aucune notification.</div>';return;
  }
  notifs.forEach(function(n){
    var item=document.createElement('div');
    item.className='ec-notif-item ec-notif-item--'+n.type;
    item.innerHTML='<div class="ec-notif-dot ec-notif-dot--'+n.type+'"></div><div class="ec-notif-txt">'+n.txt+'</div>';
    list.appendChild(item);
  });
}

// ── Messagerie ──
function ecGetMessages(){
  try{return JSON.parse(localStorage.getItem('ec_messages')||'[]');}catch(e){return[];}
}
function ecSaveMessages(msgs){localStorage.setItem('ec_messages',JSON.stringify(msgs));}

function ecInitMessagerie(){
  ecGuard();
  ecInitHeader();
  ecRenderMessages();
}
function ecRenderMessages(){
  var msgs=ecGetMessages();
  var list=document.getElementById('ec-msg-list');
  if(!list) return;
  if(!msgs.length){
    list.innerHTML='<div class="ec-msg-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>Aucun message pour le moment.</p></div>';
    return;
  }
  list.innerHTML='';
  msgs.slice().reverse().forEach(function(m,i){
    var d=new Date(m.date);
    var dateStr=d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' à '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    var item=document.createElement('div');
    item.className='ec-msg-item'+(m.fromClient?' ec-msg-item--client':' ec-msg-item--bank');
    item.innerHTML='<div class="ec-msg-bubble"><div class="ec-msg-meta"><span class="ec-msg-sender">'+(m.fromClient?'Vous':'Swek')+'</span><span class="ec-msg-time">'+dateStr+'</span></div><div class="ec-msg-body">'+m.text+'</div></div>';
    list.appendChild(item);
  });
}
function ecSendMessage(){
  var inp=document.getElementById('ec-msg-input');
  if(!inp||!inp.value.trim()) return;
  var msgs=ecGetMessages();
  msgs.push({text:inp.value.trim(),date:new Date().toISOString(),fromClient:true});
  // Auto-réponse simulée après 1s
  var clientMsg=inp.value.trim();
  ecSaveMessages(msgs);
  inp.value='';
  ecRenderMessages();
  setTimeout(function(){
    var m2=ecGetMessages();
    m2.push({text:'Merci pour votre message. Un conseiller Swek vous répondra dans les 24h ouvrées.',date:new Date().toISOString(),fromClient:false});
    ecSaveMessages(m2);
    ecRenderMessages();
  },1200);
}

// ── Auto-init selon la page ──
(function(){
  var p=window.location.pathname;
  if(p.indexOf('espaceclient.html')!==-1) ecInitDashboard();
  else if(p.indexOf('mes-documents.html')!==-1) ecInitDocuments();
  else if(p.indexOf('suivi-dossier.html')!==-1) ecInitSuivi();
  else if(p.indexOf('messagerie.html')!==-1) ecInitMessagerie();
})();
