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
            1024: {
                slidesPerView: 4,
                spaceBetween: 50,
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
});