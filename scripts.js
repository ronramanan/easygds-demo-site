// Global definition to ensure it works regardless of load order or other script failures
window.openExclusiveDeal = function (city, code) {
    console.log("Opening Deal Modal (Exclusive) for:", city, code);
    const dealModal = document.getElementById('deal-modal');
    if (!dealModal) {
        console.error("Deal modal element not found!");
        return;
    }

    const modalDestName = document.getElementById('deal-modal-dest-name');
    const modalDestInput = document.getElementById('modal-dest');
    const modalBackdrop = document.getElementById('deal-modal-backdrop');
    const modalContent = document.getElementById('deal-modal-content');

    if (modalDestName) modalDestName.textContent = city;
    if (modalDestInput) {
        modalDestInput.value = city;
        modalDestInput.dataset.code = code;
    }

    // Re-initialize flatpickr if needed
    const modalDates = document.getElementById('modal-dates');
    if (modalDates && window.flatpickr) {
        if (!modalDates._flatpickr) {
            flatpickr(modalDates, { mode: "range", dateFormat: "Y-m-d", minDate: "today" });
        }
        const fp = modalDates._flatpickr;
        if (fp) {
            const d1 = new Date(); d1.setDate(d1.getDate() + 28);
            const d2 = new Date(d1); d2.setDate(d1.getDate() + 7);
            fp.setDate([d1, d2]);
        }
    }

    // Force visible
    dealModal.style.display = 'block';
    dealModal.classList.remove('hidden');

    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        if (modalBackdrop) modalBackdrop.classList.remove('opacity-0');
        if (modalContent) modalContent.classList.remove('opacity-0', 'scale-95');
    }, 10);
};

// Close logic
document.addEventListener('DOMContentLoaded', () => {
    const closeModal = () => {
        const dealModal = document.getElementById('deal-modal');
        const modalBackdrop = document.getElementById('deal-modal-backdrop');
        const modalContent = document.getElementById('deal-modal-content');

        if (modalBackdrop) modalBackdrop.classList.add('opacity-0');
        if (modalContent) modalContent.classList.add('opacity-0', 'scale-95');
        if (dealModal) {
            setTimeout(() => {
                dealModal.classList.add('hidden');
                dealModal.style.display = ''; // Reset inline style
            }, 300);
        }
    };

    const closeBtn = document.getElementById('deal-close-btn');
    const modalBackdrop = document.getElementById('deal-modal-backdrop');

    if (closeBtn) closeBtn.onclick = closeModal;
    if (modalBackdrop) modalBackdrop.onclick = closeModal;

    // Initialize Lucide Icons
    lucide.createIcons();

    // Add 'loaded' class for animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // --- Hero Carousel ---
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    let slideInterval;

    const updateCarousel = (index) => {
        // Update slides
        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');

        // Update dots
        dots.forEach(d => {
            d.classList.remove('active', 'bg-white', 'w-8');
            d.classList.add('bg-white/40', 'w-2.5');
        });

        const activeDot = dots[index];
        activeDot.classList.remove('bg-white/40', 'w-2.5');
        activeDot.classList.add('active', 'bg-white', 'w-8');

        currentSlide = index;
    };

    const startSlideShow = () => {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            const next = (currentSlide + 1) % slides.length;
            updateCarousel(next);
        }, 6000);
    };

    // Initialize
    startSlideShow();

    // Click Handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateCarousel(index);
            startSlideShow(); // Reset timer
        });
    });

    // --- Mobile Menu Toggle ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                mobileMenu.classList.remove('translate-x-full');
                mobileBtn.innerHTML = '<i data-lucide="x" class="w-7 h-7"></i>';
                mobileBtn.classList.remove('text-white');
                mobileBtn.classList.add('text-brand-primary');
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenu.classList.add('translate-x-full');
                mobileBtn.innerHTML = '<i data-lucide="menu" class="w-7 h-7"></i>';
                mobileBtn.classList.add('text-white');
                mobileBtn.classList.remove('text-brand-primary');
                document.body.style.overflow = '';
            }
            lucide.createIcons();
        });
    }

    // --- Sticky Search Logic ---
    const header = document.getElementById('main-header');
    const searchContainerWrapper = document.getElementById('search-container-wrapper');
    const searchPanel = document.getElementById('search-panel');
    const searchInputsContainer = document.getElementById('search-inputs-container');
    const searchTabsContainer = document.getElementById('search-tabs-container');

    if (header && searchContainerWrapper && searchPanel) {
        const headerHeight = header.offsetHeight;
        let isSticky = false;
        let isExpanded = false;

        const applySticky = () => {
            searchPanel.classList.add('is-sticky', 'is-collapsed');
            searchPanel.classList.remove('max-w-4xl', 'rounded-2xl', 'shadow-premium', 'bg-white/10', 'backdrop-blur-md', 'border-white/30', 'p-2', 'lg:p-4');
            searchPanel.classList.add('max-w-full', 'rounded-b-2xl', 'border-t', 'border-gray-100', 'py-3', 'px-4', 'lg:px-6');
            searchContainerWrapper.classList.remove('px-4', 'lg:px-6', 'pb-6');

            updateTabStyles(true);
        };

        const removeSticky = () => {
            searchPanel.classList.remove('is-sticky', 'is-collapsed');
            searchPanel.classList.add('max-w-4xl', 'rounded-2xl', 'shadow-premium', 'bg-white/10', 'backdrop-blur-md', 'border-white/30', 'p-2', 'lg:p-4');
            searchPanel.classList.remove('max-w-full', 'rounded-b-2xl', 'border-t', 'border-gray-100', 'py-3', 'px-4', 'lg:px-6');
            searchContainerWrapper.classList.add('px-4', 'lg:px-6', 'pb-6');

            isExpanded = false;
            updateTabStyles(false);
        };

        const updateTabStyles = (sticky) => {
            const tabs = searchTabsContainer.querySelectorAll('.search-tab');
            tabs.forEach(tab => {
                if (!tab.classList.contains('active')) {
                    if (sticky) {
                        tab.classList.remove('text-white/90', 'hover:text-white', 'hover:bg-white/10');
                        tab.classList.add('text-gray-500', 'hover:text-brand-primary', 'hover:bg-gray-50');
                    } else {
                        tab.classList.add('text-white/90', 'hover:text-white', 'hover:bg-white/10');
                        tab.classList.remove('text-gray-500', 'hover:text-brand-primary', 'hover:bg-gray-50');
                    }
                }
            });
        };

        window.addEventListener('scroll', () => {
            const triggerPoint = searchContainerWrapper.offsetTop - headerHeight;

            if (window.scrollY > triggerPoint) {
                if (!isSticky) {
                    isSticky = true;
                    applySticky();
                }
            } else {
                if (isSticky) {
                    isSticky = false;
                    removeSticky();
                }
            }
        });

        // Expand on tab click when sticky
        if (searchTabsContainer) {
            searchTabsContainer.addEventListener('click', (e) => {
                const clickedTab = e.target.closest('.search-tab');
                if (clickedTab && isSticky) {
                    isExpanded = true;
                    searchPanel.classList.remove('is-collapsed');
                    searchPanel.classList.remove('py-3');
                    searchPanel.classList.add('py-4');
                }
            });
        }

        // Collapse on outside click when sticky
        document.addEventListener('click', (e) => {
            if (isSticky && isExpanded) {
                const isClickInside = searchPanel.contains(e.target);
                if (!isClickInside) {
                    isExpanded = false;
                    searchPanel.classList.add('is-collapsed');
                    searchPanel.classList.add('py-3');
                    searchPanel.classList.remove('py-4');
                }
            }
        });
    }

    // --- Search Tab Switching ---
    const tabs = document.querySelectorAll('.search-tab');
    const forms = document.querySelectorAll('.search-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            const searchPanel = document.getElementById('search-panel');
            const isSticky = searchPanel.classList.contains('is-sticky');

            tabs.forEach(t => {
                // Reset all tabs
                t.classList.remove('active', 'bg-white', 'shadow-premium', 'text-brand-primary', 'ring-1', 'ring-black/5');

                if (isSticky) {
                    t.classList.add('text-gray-500', 'hover:text-brand-primary', 'hover:bg-gray-50');
                    t.classList.remove('text-white/90', 'hover:text-white', 'hover:bg-white/10');
                } else {
                    t.classList.add('text-white/90', 'hover:text-white', 'hover:bg-white/10');
                    t.classList.remove('text-gray-500', 'hover:text-brand-primary', 'hover:bg-gray-50');
                }
            });

            // Activate clicked tab
            tab.classList.add('active', 'bg-white', 'shadow-premium', 'text-brand-primary', 'ring-1', 'ring-black/5');
            tab.classList.remove('text-white/90', 'text-gray-500', 'hover:bg-white/10', 'hover:bg-gray-50', 'hover:text-white', 'hover:text-brand-primary');

            forms.forEach(form => form.classList.add('hidden'));
            const targetForm = document.getElementById(`${target}-form`);
            if (targetForm) targetForm.classList.remove('hidden');
        });
    });

    // Popovers are handled by homepage_logic_integrated.js
});
