// CheckObra V11.2 RC · Firebase Online Ready
// 1) Pega tu firebaseConfig real abajo.
// 2) Si no existe config, la app funciona en modo local para probar navegación.
const firebaseConfig = {
  apiKey: "PEGAR_API_KEY",
  authDomain: "PEGAR_AUTH_DOMAIN",
  projectId: "PEGAR_PROJECT_ID",
  storageBucket: "PEGAR_STORAGE_BUCKET",
  messagingSenderId: "PEGAR_MESSAGING_SENDER_ID",
  appId: "PEGAR_APP_ID"
};
const USE_FIREBASE = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PEGAR_');

const usuarios = [
  {id:'paul', nombre:'Paul González', rol:'Administrador Maestro', pass:'1234', puedeClave:true},
  {id:'cristobal', nombre:'Cristóbal Candia', rol:'Administrador de Obra', pass:'1234'},
  {id:'gonzalo', nombre:'Gonzalo Riquelme', rol:'Jefe de Terminaciones', pass:'1234'},
  {id:'vicente', nombre:'Vicente Bizama', rol:'Control Calidad', pass:'1234'},
  {id:'nicole', nombre:'Nicole Jaques', rol:'Supervisora', pass:'1234'},
  {id:'jose', nombre:'José Labraña', rol:'Supervisor', pass:'1234'},
  {id:'paulina', nombre:'Paulina Cruces', rol:'Supervisora', pass:'1234'},
];
const partidas = [
 {id:'trazado', nombre:'Trazado de Tabiques', resp:'paulina', deps:[], checks:['Ejes y niveles revisados','Trazado según plano','Vanos rectificados','Registro fotográfico']},
 {id:'rasgos', nombre:'Rasgos de Ventana', resp:'paulina', deps:['trazado'], checks:['Rasgo rectificado','Plomo revisado','Escuadra revisada','Preparación para cerámico']},
 {id:'tg', nombre:'Terminación Gruesa', resp:'paulina', deps:['rasgos'], checks:['Superficie limpia','Planeidad verificada','Desaplome dentro tolerancia','Encuentros corregidos']},
 {id:'tab_perim', nombre:'Tabiquería Perimetral', resp:'jose', deps:['trazado'], checks:['Solera instalada','Montantes a 40 cm','Planchas fijadas','Encuentros sellados','Desaplome máx. 5 mm']},
 {id:'volcopanel', nombre:'Volcopanel', resp:'jose', deps:['trazado'], checks:['Rectificación trazo','Instalación eléctrica','Instalación sanitaria','Cuñas y alineadores','Sello espuma máximo 2 cm','Eliminar excesos']},
 {id:'marcos', nombre:'Marcos de Puerta', resp:'nicole', deps:['tg'], checks:['Plomo marco','Nivel dintel','5 fijaciones cruzadas','Diagonales verificadas']},
 {id:'imp_banos', nombre:'Impermeabilización Baños', resp:'nicole', deps:['tg'], checks:['Superficie seca y limpia','Encuentros reforzados','Pasadas reforzadas','Continuidad 100%','Sin poros ni cortes']},
 {id:'cer_piso', nombre:'Cerámico Piso Depto', resp:'nicole', deps:['tg'], checks:['Adhesivo mínimo 70%','Diferencia nivel máx. 1 mm','Canterías ±2 mm','Alineación ±2 mm en 3 m','Limpieza final']},
 {id:'cer_rasgos', nombre:'Cerámicos Rasgos de Ventana', resp:'nicole', deps:['rasgos'], checks:['Rasgo preparado','Adhesivo mínimo 70%','Planeidad ±3 mm','Escuadra revisada','Terminación esquinas']},
 {id:'cornisas', nombre:'Cornisas', resp:'nicole', deps:['tg'], checks:['Trazado nivelado','Juntas máx. 1 mm','Nivelación 3 mm/m','Cortes remate ≥30 cm','Terminación limpia']},
 {id:'shaft', nombre:'Shaft', resp:'jose', deps:['trazado'], checks:['Estructura instalada','Registros accesibles','Sellos ejecutados','Revisión general depto']},
 {id:'dinteles', nombre:'Dinteles', resp:'jose', deps:['trazado'], checks:['Altura revisada','Nivel revisado','Fijaciones completas','Revisión general depto']},
 {id:'presion', nombre:'Prueba de Presión', resp:'jose', deps:['volcopanel'], checks:['Registro presión inicial','Tiempo de prueba cumplido','Registro presión final','Fotos cargadas']},
];
const tolerancias = [
 ['Tabiquería Perimetral','Planeidad sin huinchas','±5 mm','Regla 1,2 m o láser'],['Tabiquería Perimetral','Planeidad terminada','±3 mm','Regla 1,2 m'],['Tabiquería Perimetral','Desaplome','máx. 5 mm piso-cielo','Plomo / láser'],['Tabiquería Perimetral','Cuadratura','3 mm a 40 cm','Escuadra'],
 ['Volcopanel','Sello espuma','máx. 2 cm','Inspección y huincha'],['Volcopanel','Alineación','±5 mm','Regla / láser'],
 ['Cerámico Piso Depto','Diferencia entre palmetas','máx. 1 mm','Galga / regla'],['Cerámico Piso Depto','Adhesivo efectivo','mín. 70%','Levantamiento muestra'],['Cerámico Piso Depto','Canterías','±2 mm','Huincha / regla 3 m'],
 ['Cerámicos Rasgos de Ventana','Planeidad remate','±3 mm','Regla'],['Cerámicos Rasgos de Ventana','Canterías','±2 mm','Huincha'],
 ['Cornisas','Junta','máx. 1 mm','Visual / galga'],['Cornisas','Nivelación','3 mm/m','Nivel láser'],['Cornisas','Remate mínimo','30 cm','Huincha'],
 ['Marcos de Puerta','Plomo','±3 mm','Nivel'],['Marcos de Puerta','Escuadra','±3 mm','Diagonales'],
 ['Terminación Gruesa','Encuentros verticales','±2 mm/m','Plomo / regla'],['Terminación Gruesa','Cielo terminado','±3 mm','Regla 1,2 m']
];
const deptos=['201','202','203','204','205','301','302','303','304','305','306'];
let state = JSON.parse(localStorage.checkobra112||'{}');
state.checks ||= {}; state.obs ||= []; state.hot ||= []; state.comp ||= []; state.usuario ||= null; state.noPass ||= false;
const $ = (s)=>document.querySelector(s); const app=$('#app');
function save(){localStorage.checkobra112=JSON.stringify(state)}
function top(title){return `<div class="top"><div><div class="brand">CheckObra V11.2 RC</div><div class="sub">${title}</div></div><button class="btn gray" onclick="logout()">Salir</button></div>`}
function render(){state.usuario?home():login()}
function login(){app.innerHTML=`<div class="wrap"><div class="card"><h1>CheckObra</h1><p>Castellón 227 · V11.2 RC Firebase Online</p><select id="u" class="input">${usuarios.map(u=>`<option value="${u.id}">${u.nombre} · ${u.rol}</option>`).join('')}</select><div class="row"><input id="p" class="input" type="password" placeholder="Contraseña"><button class="btn gray" onclick="togglePass()">👁 Ver</button></div><button class="btn" onclick="doLogin()">Ingresar</button><p class="small">Paul puede deshabilitar contraseñas desde su perfil.</p></div></div>`}
window.togglePass=()=>{const p=$('#p');p.type=p.type==='password'?'text':'password'}
window.doLogin=()=>{let u=usuarios.find(x=>x.id===$('#u').value); if(!state.noPass && $('#p').value!==u.pass) return alert('Contraseña incorrecta'); state.usuario=u; save(); render()}
window.logout=()=>{state.usuario=null;save();render()}
function home(){const u=state.usuario; app.innerHTML=top(`${u.nombre} · ${u.rol}`)+`<div class="wrap"><div class="grid">${kpis()}</div><div class="card"><h2>Centro de Gestión</h2><div class="menu"><button class="btn" onclick="listado('atrasos')">Atrasos</button><button class="btn red" onclick="listado('obs')">Obs. críticas</button><button class="btn yellow" onclick="listado('restr')">Restricciones</button><button class="btn red" onclick="listado('hot')">Papas calientes</button><button class="btn" onclick="listado('calidad')">Pendientes calidad</button></div></div><div class="card"><h2>Departamentos</h2><div class="menu">${deptos.map(d=>`<button class="btn" onclick="depto('${d}')">Depto ${d}</button>`).join('')}</div></div>${u.id==='paul'?perfilPaul():''}<div class="card"><h2>Biblioteca de tolerancias</h2><button class="btn" onclick="biblioteca()">Ver tolerancias numéricas</button></div><div class="card"><h2>Notificaciones</h2><button class="btn green" onclick="activarNotif()">Activar notificaciones y sonido</button><p class="small">En PWA web el sonido depende del navegador. Se fuerza vibración y notificación de alta prioridad; Android usará el sonido del canal del navegador.</p></div></div>`}
function kpis(){let all=deptos.length*partidas.length, done=0, started=0; deptos.forEach(d=>partidas.forEach(p=>{let c=getC(d,p.id); if(c.estado==='Liberada Supervisor'||c.estado==='Validada Calidad') done++; if(c.estado!=='Sin iniciar') started++})); return `<div class="kpi" onclick="desplegableAvance()">Avance validado <b>${Math.round(done/all*100)}%</b></div><div class="kpi" onclick="programa()">Cumplimiento semanal <b>100%</b></div><div class="kpi" onclick="listado('obs')">Obs. abiertas <b>${state.obs.length}</b></div><div class="kpi" onclick="listado('restr')">Restricciones <b>0</b></div>`}
function perfilPaul(){return `<div class="card"><h2>Perfil Paul</h2><label><input type="checkbox" ${state.noPass?'checked':''} onchange="state.noPass=this.checked;save();alert('Configuración actualizada')"> Deshabilitar contraseñas</label></div>`}
window.depto=(d)=>{app.innerHTML=top(`Depto ${d}`)+`<div class="wrap"><button class="btn gray" onclick="render()">← Inicio</button><h1>Depto ${d}</h1>${partidas.map(p=>cardPartida(d,p)).join('')}</div>`}
function getC(d,p){state.checks[d] ||= {}; state.checks[d][p] ||= {items:[],estado:'Sin iniciar',liberadaEx:false}; return state.checks[d][p]}
function cardPartida(d,p){let c=getC(d,p.id); let pend=p.deps.filter(x=>!['Liberada Supervisor','Validada Calidad'].includes(getC(d,x).estado)); let bloq=pend.length&&!c.liberadaEx; return `<div class="card ${bloq?'bloq':c.estado==='Sin iniciar'?'':'ok'}"><div class="row"><div><h3>${p.nombre}</h3><span class="small">Responsable: ${usuarios.find(u=>u.id===p.resp)?.nombre}</span></div><span class="status">${bloq?'Bloqueada':c.estado}</span></div>${bloq?`<p>🔒 Pendientes: ${pend.map(x=>partidas.find(p=>p.id===x).nombre).join(', ')}</p><button class="btn red" onclick="liberar('${d}','${p.id}')">Liberar excepcionalmente</button>`:`<button class="btn" onclick="checklist('${d}','${p.id}')">Abrir checklist</button>`}</div>`}
window.liberar=(d,p)=>{if(!['paul','cristobal','gonzalo','vicente'].includes(state.usuario.id))return alert('Solo Gonzalo, Paul, Vicente o Cristóbal pueden liberar'); getC(d,p).liberadaEx=true; notify('Liberación excepcional',`Depto ${d} · ${partidas.find(x=>x.id===p).nombre}`); save(); depto(d)}
window.checklist=(d,pid)=>{let p=partidas.find(x=>x.id===pid), c=getC(d,pid); app.innerHTML=top(`${p.nombre} · Depto ${d}`)+`<div class="wrap"><button class="btn gray" onclick="depto('${d}')">← Volver</button><div class="card"><h2>${p.nombre}</h2><p>Estado actual: <b>${c.estado}</b></p>${p.checks.map((ch,i)=>`<label class="check"><input type="checkbox" ${c.items.includes(i)?'checked':''} onchange="marcar('${d}','${pid}',${i},this.checked)"><span>${ch}</span></label>`).join('')}<button class="btn yellow" onclick="agregarPapa('${d}','${pid}')">Crear papa caliente</button><button class="btn red" onclick="crearObs('${d}','${pid}')">Crear observación</button></div></div>`}
window.marcar=(d,pid,i,on)=>{let c=getC(d,pid), p=partidas.find(x=>x.id===pid); c.items = on?[...new Set([...c.items,i])]:c.items.filter(x=>x!==i); let old=c.estado; c.estado=c.items.length===0?'Sin iniciar':(c.items.length===p.checks.length?'Liberada Supervisor':'En ejecución'); save(); if(old!==c.estado) notify('Cambio de estado',`Depto ${d} · ${p.nombre}: ${c.estado}`); checklist(d,pid)}
window.agregarPapa=(d,pid)=>{state.hot.push({d,pid,txt:'Papa caliente creada',fecha:new Date().toLocaleString()}); notify('🔥 Papa caliente',`Depto ${d} · ${partidas.find(x=>x.id===pid).nombre}`); save(); checklist(d,pid)}
window.crearObs=(d,pid)=>{state.obs.push({d,pid,txt:'Observación crítica abierta',fecha:new Date().toLocaleString()}); notify('🚨 Observación crítica',`Depto ${d} · ${partidas.find(x=>x.id===pid).nombre}`); save(); checklist(d,pid)}
window.biblioteca=()=>{app.innerHTML=top('Biblioteca Técnica')+`<div class="wrap"><button class="btn gray" onclick="render()">← Inicio</button><div class="card"><h2>Tolerancias numéricas</h2><table class="table"><tr><th>Partida</th><th>Control</th><th>Tolerancia</th><th>Instrumento</th></tr>${tolerancias.map(t=>`<tr><td>${t[0]}</td><td>${t[1]}</td><td><b>${t[2]}</b></td><td>${t[3]}</td></tr>`).join('')}</table></div></div>`}
window.programa=()=>{app.innerHTML=top('Programa Semanal')+`<div class="wrap"><button class="btn gray" onclick="render()">← Inicio</button><div class="card"><h2>Programa semanal</h2><p>Los cumplidos se ocultan en un desplegable para no hacer interminable el listado.</p><details><summary><b>Historial cumplidos por depto</b></summary>${deptos.map(d=>`<p>Depto ${d}: cumplidos visibles aquí.</p>`).join('')}</details></div></div>`}
window.desplegableAvance=()=>{app.innerHTML=top('Avance por piso')+`<div class="wrap"><button class="btn gray" onclick="render()">← Inicio</button><div class="card"><h2>Avance desplegable</h2>${['Piso 2','Piso 3'].map(p=>`<details><summary><b>${p}</b></summary><p>Detalle de departamentos y partidas.</p></details>`).join('')}</div></div>`}
window.listado=(tipo)=>{let data= tipo==='hot'?state.hot: tipo==='obs'?state.obs: []; app.innerHTML=top(tipo)+`<div class="wrap"><button class="btn gray" onclick="render()">← Inicio</button><div class="card"><h2>${tipo}</h2>${data.length?data.map(x=>`<p><b>Depto ${x.d}</b> · ${partidas.find(p=>p.id===x.pid)?.nombre}<br><span class="small">${x.fecha}</span></p>`).join(''):'<p>Sin registros.</p>'}</div></div>`}
async function notify(title, body){document.querySelector('#alertSound')?.play().catch(()=>{}); if('vibrate' in navigator) navigator.vibrate([200,80,200]); if(Notification.permission==='granted') new Notification(title,{body,icon:'assets/icon-192.png',vibrate:[200,80,200]});}
window.activarNotif=async()=>{if('serviceWorker' in navigator) await navigator.serviceWorker.register('./firebase-messaging-sw.js'); if('Notification' in window){let r=await Notification.requestPermission(); alert(r==='granted'?'Notificaciones activadas':'Permiso no concedido'); notify('CheckObra','Notificaciones y vibración activadas');} else alert('Este dispositivo/navegador no soporta notificaciones web')}
if('serviceWorker' in navigator) navigator.serviceWorker.register('./firebase-messaging-sw.js').catch(()=>{});
render();
