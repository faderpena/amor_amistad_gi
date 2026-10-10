/* =========================================================
   Amigo Secreto - Grupo de Instrumentos
   Toda la información (personajes, poderes, imágenes y
   opciones de regalo) se lee de:  datos/personajes.json
   ========================================================= */

const RUTA_DATOS = './datos/personajes.json';
const DATOS = { personajes: [], sorteo: { asignaciones: [] }, evento: {} };

let mapa = null;

document.addEventListener('DOMContentLoaded', iniciar);

async function iniciar() {
    configurarPestanas();

    try {
        const respuesta = await fetch(RUTA_DATOS, { cache: 'no-store' });
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        const json = await respuesta.json();

        DATOS.personajes = Array.isArray(json.personajes) ? json.personajes : [];
        DATOS.sorteo = json.sorteo || { asignaciones: [] };
        DATOS.evento = json.evento || {};

        renderEvento(DATOS.evento);
        renderPersonajes(DATOS.personajes);
        renderSorteo(DATOS.sorteo);
        configurarBuscador();
    } catch (error) {
        mostrarErrorDeCarga(error);
    }
}

/* ---------------------------------------------
   Utilidades
   --------------------------------------------- */

function escapar(texto) {
    return String(texto == null ? '' : texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* Quita tildes y pasa a minúsculas para que la búsqueda sea tolerante */
function normalizar(texto) {
    return String(texto == null ? '' : texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function iniciales(nombre) {
    return normalizar(nombre)
        .split(/\s+/)
        .filter(p => /[a-z0-9]/.test(p))
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join('');
}

/* Comprueba si un archivo de imagen existe (para el ícono del mapa) */
function imagenExiste(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

/* ---------------------------------------------
   Pestañas
   --------------------------------------------- */

function configurarPestanas() {
    const botones = document.querySelectorAll('.tab-button');
    const contenidos = document.querySelectorAll('.tab-content');

    function activar(id, actualizarHash) {
        contenidos.forEach(c => c.classList.toggle('active', c.id === id));
        botones.forEach(b => {
            const activo = b.dataset.tab === id;
            b.classList.toggle('active', activo);
            b.setAttribute('aria-selected', activo ? 'true' : 'false');
        });

        if (actualizarHash && location.hash !== '#' + id) {
            history.replaceState(null, '', '#' + id);
        }

        // El mapa necesita recalcular su tamaño cuando su pestaña se muestra
        if (id === 'evento') setTimeout(iniciarMapa, 60);
    }

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            activar(boton.dataset.tab, true);
            // Al cambiar de pestaña se vuelve arriba para no quedar a mitad de la lista
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const idInicial = location.hash.replace('#', '');
    if (idInicial && document.getElementById(idInicial)) {
        activar(idInicial, false);
    } else {
        activar('evento', false);
    }

    // Si alguien abre o comparte un enlace tipo #personajes con la página ya cargada
    window.addEventListener('hashchange', () => {
        const id = location.hash.replace('#', '');
        if (id && document.getElementById(id)) activar(id, false);
    });
}

/* ---------------------------------------------
   Datos del evento
   --------------------------------------------- */

function renderEvento(evento) {
    const poner = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor || 'Por confirmar';
    };
    poner('evento-fecha', evento.fecha);
    poner('evento-hora', evento.hora);
    poner('evento-lugar', evento.lugar);
    if (evento.titulo) {
        const h2 = document.querySelector('#evento h2');
        if (h2) h2.textContent = evento.titulo;
    }

    const contenedorAviso = document.getElementById('evento-aviso');
    const aviso = evento.aviso;
    if (contenedorAviso && aviso) {
        const items = (aviso.items || []).map(i => `<li>${escapar(i)}</li>`).join('');
        contenedorAviso.innerHTML =
            (aviso.titulo ? `<strong>${escapar(aviso.titulo)}</strong>` : '') +
            (items ? `<ul>${items}</ul>` : '');
        contenedorAviso.hidden = !(aviso.titulo || items);
    }
}

/* ---------------------------------------------
   Personajes
   --------------------------------------------- */

function renderPersonajes(personajes) {
    const contenedor = document.getElementById('personajes-grid');
    contenedor.innerHTML = personajes.map(tarjetaHTML).join('');
    actualizarContador(personajes.length, personajes.length);

    // Si la imagen del personaje no carga, se muestran sus iniciales
    contenedor.querySelectorAll('.card-media img').forEach(img => {
        img.addEventListener('error', () => {
            img.closest('.card-media').classList.add('sin-imagen');
        });
    });
}

function tarjetaHTML(personaje) {
    const nombre = personaje.nombre || 'Personaje sin nombre';
    const poderes = (personaje.poderes || [])
        .map(p => `<li>${escapar(p)}</li>`)
        .join('');

    const regalos = (personaje.regalos || []).map(regalo => {
        const nota = regalo.nota ? `<span class="nota">${escapar(regalo.nota)}</span>` : '';
        const contenido = regalo.url
            ? `<a href="${escapar(regalo.url)}" target="_blank" rel="noopener noreferrer">${escapar(regalo.nombre)}</a>`
            : escapar(regalo.nombre);
        return `<li class="regalo">${contenido}${nota}</li>`;
    }).join('');

    const regalosHTML = regalos
        ? `<p class="etiqueta-regalos">Opciones de regalo:</p><ul class="regalos">${regalos}</ul>`
        : '';

    const imagen = personaje.url
        ? `<img src="${escapar(personaje.url)}" alt="${escapar(nombre)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
        : '';

    return `
        <article class="card" id="personaje-${escapar(personaje.id || normalizar(nombre))}">
            <div class="card-media${imagen ? '' : ' sin-imagen'}">
                ${imagen}
                <span class="iniciales" aria-hidden="true">${escapar(iniciales(nombre))}</span>
            </div>
            <h3>${escapar(nombre)}</h3>
            ${poderes ? `<ul class="poderes">${poderes}</ul>` : ''}
            ${regalosHTML}
        </article>`;
}

/* ---------------------------------------------
   Buscador
   --------------------------------------------- */

function configurarBuscador() {
    const input = document.getElementById('buscador');
    const botonLimpiar = document.getElementById('limpiar-busqueda');
    if (!input) return;

    function filtrar() {
        const consulta = normalizar(input.value);
        const visibles = [];

        document.querySelectorAll('#personajes-grid .card').forEach(tarjeta => {
            const coincide = !consulta || normalizar(tarjeta.textContent).includes(consulta);
            tarjeta.hidden = !coincide;
            if (coincide) visibles.push(tarjeta);
        });

        const hayFiltro = consulta.length > 0;
        botonLimpiar.hidden = !hayFiltro;
        document.getElementById('sin-resultados').hidden = visibles.length > 0;
        actualizarContador(visibles.length, DATOS.personajes.length);
    }

    let temporizador;
    input.addEventListener('input', () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(filtrar, 120);
    });

    botonLimpiar.addEventListener('click', () => {
        input.value = '';
        filtrar();
        input.focus();
    });
}

function actualizarContador(visibles, total) {
    const contador = document.getElementById('contador');
    if (!contador) return;
    const palabra = total === 1 ? 'personaje' : 'personajes';
    contador.textContent = visibles === total
        ? `${total} ${palabra}`
        : `${visibles} de ${total} ${palabra}`;
}

/* ---------------------------------------------
   Sorteo
   --------------------------------------------- */

function renderSorteo(sorteo) {
    const titulo = document.getElementById('sorteo-titulo');
    if (titulo && sorteo.titulo) titulo.textContent = sorteo.titulo;

    const nota = document.getElementById('sorteo-nota');
    if (nota) {
        const asignaciones = sorteo.asignaciones || [];
        // El texto de cierre es opcional y vive en el JSON ('sorteo.cierre')
        const cierre = (asignaciones.length && sorteo.cierre)
            ? `<br><br><i>${escapar(sorteo.cierre)}</i>`
            : '';
        nota.innerHTML = escapar(sorteo.nota || 'Emparejamiento aleatorio.') + cierre;
    }

    const lista = document.getElementById('sorteo-lista');
    if (!lista) return;

    const asignaciones = sorteo.asignaciones || [];
    if (!asignaciones.length) {
        lista.innerHTML = '<li class="sorteo-pendiente">Todavía no hay asignaciones publicadas.</li>';
        return;
    }

    lista.innerHTML = asignaciones.map(a =>
        `<li><strong>${escapar(a.de)}</strong> le regala a <strong>${escapar(a.para)}</strong></li>`
    ).join('');
}

/* ---------------------------------------------
   Mapa
   --------------------------------------------- */

async function iniciarMapa() {
    const contenedor = document.getElementById('map');
    if (!contenedor) return;

    // Si el CDN de Leaflet está bloqueado (red restringida), no dejar un recuadro vacío
    if (typeof L === 'undefined') {
        const evento = DATOS.evento || {};
        const c = evento.coordenadas || [4.623449, -74.06847];
        contenedor.classList.add('mapa-sin-leaflet');
        contenedor.innerHTML = `<p><strong>${escapar(evento.lugar || 'Lugar del evento')}</strong><br>
            <small>El mapa necesita conexión a internet.</small><br>
            <a href="https://www.google.com/maps/search/?api=1&query=${c[0]},${c[1]}" target="_blank" rel="noopener noreferrer">Ver la ubicación en el mapa</a></p>`;
        return;
    }

    const evento = DATOS.evento || {};
    const coords = evento.coordenadas || [4.623449, -74.06847];
    const zoom = evento.zoom || 16;

    if (mapa) { mapa.invalidateSize(); return; }

    mapa = L.map('map').setView(coords, zoom);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });

    osmLayer.addTo(mapa);
    L.control.layers({ 'OpenStreetMap': osmLayer, 'Satelital (Esri)': satelliteLayer }).addTo(mapa);

    // Ícono de regalo propio; si los archivos de imagen no están, usa el marcador por defecto
    const icono = await iconoRegalo();

    L.marker(coords, icono ? { icon: icono } : {})
        .addTo(mapa)
        .bindPopup(`<strong>${escapar(evento.lugar || 'Lugar del evento')}</strong>`)
        .openPopup();

    setTimeout(() => mapa.invalidateSize(), 150);
}

async function iconoRegalo() {
    const url = './img/icon_gift.png';
    if (!await imagenExiste(url)) return null;

    const opciones = { iconUrl: url, iconSize: [45, 45], iconAnchor: [22, 44], popupAnchor: [-3, -76] };
    const sombra = './img/icon_shadow_gift.png';
    if (await imagenExiste(sombra)) {
        opciones.shadowUrl = sombra;
        opciones.shadowSize = [51, 24];
        opciones.shadowAnchor = [4, 22];
    }
    return L.icon(opciones);
}

/* ---------------------------------------------
   Errores
   --------------------------------------------- */

function mostrarErrorDeCarga(error) {
    console.error('No se pudo leer ' + RUTA_DATOS, error);
    const contenedor = document.getElementById('personajes-grid');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="sin-resultados" style="grid-column:1/-1">
                <p><strong>No se pudieron cargar los personajes.</strong></p>
                <p>Revisa que el archivo <code>datos/personajes.json</code> exista y que la página se esté abriendo desde un servidor
                (por ejemplo: <code>python -m http.server</code> en la carpeta del proyecto).</p>
                <p><small>${escapar(error.message || error)}</small></p>
            </div>`;
    }
    const contador = document.getElementById('contador');
    if (contador) contador.textContent = '';
}
