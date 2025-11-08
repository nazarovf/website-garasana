; (function () {

    class Details {
        constructor() {
            this.DOM = {};

            const detailsTmpl = `
            <div class="details__bg">
                <button class="details__close"><i class="fas fa-2x fa-times icon--cross tm-fa-close"></i></button>
                <div class="details__description"></div>
            </div>                    
            `;

            this.DOM.details = document.createElement('div');
            this.DOM.details.className = 'details';
            this.DOM.details.innerHTML = detailsTmpl;
            document.body.appendChild(this.DOM.details); // Tambahkan ke body agar fixed position berfungsi dengan baik
            this.init();
        }
        init() {
            this.DOM.bgDown = this.DOM.details.querySelector('.details__bg');
            this.DOM.description = this.DOM.details.querySelector('.details__description');
            this.DOM.close = this.DOM.details.querySelector('.details__close');

            this.initEvents();
        }
        initEvents() {
            // close page when outside of page is clicked.
            document.body.addEventListener('click', (event) => {
                // Pastikan yang diklik bukan bagian dari panel detail
                if (!this.DOM.bgDown.contains(event.target) && this.DOM.details.classList.contains('details--open')) {
                    this.close();
                }
            });
            // prevent close page when inside of page is clicked.
            this.DOM.bgDown.addEventListener('click', function (event) {
                event.stopPropagation();
            });
            // close page when cross button is clicked.
            this.DOM.close.addEventListener('click', () => this.close());
        }
        fill(info) {
            // fill current page info
            this.DOM.description.innerHTML = info.description;
        }
        getProductDetailsRect() {
            var p = 0;
            var d = 0;

            try {
                p = this.DOM.productBg.getBoundingClientRect();
                d = this.DOM.bgDown.getBoundingClientRect();
            }
            catch (e) { }

            return {
                productBgRect: p,
                detailsBgRect: d
            };
        }
        open(data) {
            if (this.isAnimating) return false;
            this.isAnimating = true;

            this.DOM.details.style.display = 'flex'; // Pastikan display flex untuk centering
            this.DOM.details.classList.add('details--open');

            this.DOM.productBg = data.productBg;
            this.DOM.productBg.style.opacity = 0;

            const rect = this.getProductDetailsRect();

            // Hitung posisi awal transformasi agar berpusat ke tengah item grid yang diklik
            const initialTranslateX = rect.productBgRect.left + rect.productBgRect.width / 2 - rect.detailsBgRect.width / 2;
            const initialTranslateY = rect.productBgRect.top + rect.productBgRect.height / 2 - rect.detailsBgRect.height / 2;

            this.DOM.bgDown.style.transform = `translateX(${initialTranslateX}px) translateY(${initialTranslateY}px) scaleX(${rect.productBgRect.width / rect.detailsBgRect.width}) scaleY(${rect.productBgRect.height / rect.detailsBgRect.height})`;
            this.DOM.bgDown.style.opacity = 1;

            // animate background
            anime({
                targets: [this.DOM.bgDown],
                duration: (target, index) => index ? 800 : 250,
                easing: (target, index) => index ? 'easeOutElastic' : 'easeOutSine',
                elasticity: 250,
                translateX: 0, // Targetkan 0 karena parent .details sekarang flexbox & centering
                translateY: 0, // Targetkan 0 karena parent .details sekarang flexbox & centering
                scaleX: 1,
                scaleY: 1,
                complete: () => {
                    this.isAnimating = false;
                    // Aktifkan scroll di body jika konten di dalam panel detail lebih panjang dari viewport
                    document.body.style.overflow = 'hidden';
                }
            });

            // animate content
            anime({
                targets: [this.DOM.description],
                duration: 1000,
                easing: 'easeOutExpo',
                translateY: ['100%', 0],
                opacity: 1
            });

            // animate close button
            anime({
                targets: this.DOM.close,
                duration: 250,
                easing: 'easeOutSine',
                translateY: ['-100%', 0], // Animasikan dari atas
                opacity: 1
            });

            this.setCarousel();

            // Pastikan carousel di-destroy dan re-initialize pada resize jika perlu
            $(window).off("resize", this.setCarousel); // Hapus event listener sebelumnya
            $(window).on("resize", this.setCarousel); // Tambahkan event listener baru
        }
        close() {
            if (this.isAnimating) return false;
            this.isAnimating = true;

            document.body.style.overflow = 'auto'; // Kembalikan scroll body

            this.DOM.details.classList.remove('details--open');

            anime({
                targets: this.DOM.close,
                duration: 250,
                easing: 'easeOutSine',
                translateY: '-100%', // Animasikan ke atas atau keluar
                opacity: 0
            });

            anime({
                targets: [this.DOM.description],
                duration: 20,
                easing: 'linear',
                opacity: 0
            });

            const rect = this.getProductDetailsRect();

            // Hitung posisi akhir transformasi untuk kembali ke item grid yang diklik
            const finalTranslateX = rect.productBgRect.left + rect.productBgRect.width / 2 - rect.detailsBgRect.width / 2;
            const finalTranslateY = rect.productBgRect.top + rect.productBgRect.height / 2 - rect.detailsBgRect.height / 2;

            anime({
                targets: [this.DOM.bgDown],
                duration: 250,
                easing: 'easeOutSine',
                translateX: finalTranslateX,
                translateY: finalTranslateY,
                scaleX: rect.productBgRect.width / rect.detailsBgRect.width,
                scaleY: rect.productBgRect.height / rect.detailsBgRect.height,
                complete: () => {
                    this.DOM.bgDown.style.opacity = 0;
                    this.DOM.bgDown.style.transform = 'none';
                    this.DOM.productBg.style.opacity = 1;
                    this.DOM.details.style.display = 'none';
                    this.isAnimating = false;
                }
            });

            // Hapus event listener resize untuk carousel saat panel ditutup
            $(window).off("resize", this.setCarousel);
        }
        // Slick Carousel
        setCarousel() {
            var slider = $('.details .tm-img-slider');

            if (slider.length) { // check if slider exist
                if (slider.hasClass('slick-initialized')) {
                    slider.slick('destroy'); // Hancurkan carousel yang sudah ada
                }

                if ($(window).width() > 767) {
                    // Slick carousel
                    slider.slick({
                        dots: true,
                        infinite: true,
                        slidesToShow: 4,
                        slidesToScroll: 3,
                        responsive: [ // Tambahkan responsive settings untuk kasus ini
                            {
                                breakpoint: 992,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 2
                                }
                            }
                        ]
                    });
                }
                else {
                    slider.slick({
                        dots: true,
                        infinite: true,
                        slidesToShow: 2,
                        slidesToScroll: 1
                    });
                }
            }
        }
    }; // class Details

    class Item {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.DOM.product = this.DOM.el.querySelector('.product');
            this.DOM.productBg = this.DOM.product.querySelector('.product__bg');

            this.info = {
                description: this.DOM.product.querySelector('.product__description').innerHTML
            };

            this.initEvents();
        }
        initEvents() {
            this.DOM.product.addEventListener('click', () => this.open());
        }
        open() {
            DOM.details.fill(this.info);
            DOM.details.open({
                productBg: this.DOM.productBg
            });
        }
    }; // class Item

    const DOM = {};
    DOM.grid = document.querySelector('.grid');
    DOM.content = DOM.grid.parentNode;
    DOM.gridItems = Array.from(DOM.grid.querySelectorAll('.grid__item'));
    let items = [];
    DOM.gridItems.forEach(item => items.push(new Item(item)));

    DOM.details = new Details();

    /* Global setup for footer and other initializations */
    function initGlobalSettings() {
        // Hapus fungsi setupFooter() karena sudah diatasi dengan CSS Flexbox
        // Jika ada logika lain yang perlu dijalankan saat DOM ready, letakkan di sini.

        $('.tm-current-year').text(new Date().getFullYear());    // Update year in copyright             
    }

    // Jalankan inisialisasi setelah DOM siap
    $(document).ready(function () {
        initGlobalSettings();
    });

})();