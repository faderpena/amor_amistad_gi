document.addEventListener('DOMContentLoaded', () => {
    // Manejo de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            // Ocultar todos los contenidos y desactivar todos los botones
            tabContents.forEach(content => content.classList.remove('active'));
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Mostrar el contenido y activar el botón correcto
            document.getElementById(tabId).classList.add('active');
            button.classList.add('active');
        });
    });

    // Swiper para Personajes
	const swiperPersonajes = new Swiper('.mySwiperPersonajes', {
		// slidePerView: 1,  <-- Remueve esta línea, ya que los breakpoints la definen.
		spaceBetween: 10, // <-- Ajusta el espacio global a un valor más pequeño y consistente
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			640: {
				slidesPerView: 2,
				spaceBetween: 5, // <--- Ajusta a un valor menor
			},
			768: {
				slidesPerView: 3,
				spaceBetween: 1, // <--- Ajusta a un valor menor
			},
			1024: {
				slidesPerView: 4,
				spaceBetween: 1, // <--- Ajusta a un valor menor
			},
		},
	});

    // Swiper para Lista de Regalos
    const swiperRegalos = new Swiper('.mySwiperRegalos', {
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 40,
            },
        },
    });
	
	//const anlaCoords = [4.623449, -74.068470]; 
	
	// Agrega esta lógica para el mapa al final de tu script.js
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Coordenadas aproximadas para la ANLA en Bogotá
        const anlaCoords = [4.623449, -74.068470]; 

        // Inicializa el mapa
        const map = L.map('map').setView(anlaCoords, 16);

        // Define las capas base que deseas ofrecer
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // Capa satelital de Esri (proveedor de imágenes de satélite)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        // Agrega la capa de OpenStreetMap al mapa por defecto
        osmLayer.addTo(map);

        // Crea un objeto con las capas base para el control
        const baseMaps = {
            "OpenStreetMap": osmLayer,
            "Satelital (Esri)": satelliteLayer
        };

		var greenIcon = L.icon({
			iconUrl: './img/icon_gift.png',
			shadowUrl: './img/icon_shadow_gift.png',

			iconSize:     [45, 45], // size of the icon
			shadowSize:   [51, 24], // size of the shadow
			iconAnchor:   [22, 44], // point of the icon which will correspond to marker's location
			shadowAnchor: [4, 22],  // the same for the shadow
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		});
		
        // Añade el control de capas al mapa
        L.control.layers(baseMaps).addTo(map);

        // Añade un marcador en la ubicación del evento
        L.marker(anlaCoords, {icon: greenIcon})
            .addTo(map)
            .bindPopup('<i>Salón de la Justicia</i><br><b>Auditorio Piso 11 ANLA</b>')
            .openPopup();
    }
});

