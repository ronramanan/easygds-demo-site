window.APP_CURRENCY = 'USD'; // Default Currency
window.APP_LANGUAGE = 'en-US'; // Default Language

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
            searchPanel.classList.remove('max-w-4xl', 'rounded-2xl', 'shadow-elegant-xl', 'bg-white/10', 'backdrop-blur-md', 'border-white/30', 'p-2', 'lg:p-4');
            searchPanel.classList.add('max-w-full', 'rounded-b-2xl', 'border-t', 'border-gray-100', 'py-3', 'px-4', 'lg:px-6');
            searchContainerWrapper.classList.remove('px-4', 'lg:px-6', 'pb-6');

            updateTabStyles(true);
        };

        const removeSticky = () => {
            searchPanel.classList.remove('is-sticky', 'is-collapsed');
            searchPanel.classList.add('max-w-4xl', 'rounded-2xl', 'shadow-elegant-xl', 'bg-white/10', 'backdrop-blur-md', 'border-white/30', 'p-2', 'lg:p-4');
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
                t.classList.remove('active', 'bg-white', 'shadow-elegant', 'text-brand-primary', 'ring-1', 'ring-black/5');

                if (isSticky) {
                    t.classList.add('text-gray-500', 'hover:text-brand-primary', 'hover:bg-gray-50');
                    t.classList.remove('text-white/90', 'hover:text-white', 'hover:bg-white/10');
                } else {
                    t.classList.add('text-white/90', 'hover:text-white', 'hover:bg-white/10');
                    t.classList.remove('text-gray-500', 'hover:text-brand-primary', 'hover:bg-gray-50');
                }
            });

            // Activate clicked tab
            tab.classList.add('active', 'bg-white', 'shadow-elegant', 'text-brand-primary', 'ring-1', 'ring-black/5');
            tab.classList.remove('text-white/90', 'text-gray-500', 'hover:bg-white/10', 'hover:bg-gray-50', 'hover:text-white', 'hover:text-brand-primary');

            forms.forEach(form => form.classList.add('hidden'));
            const targetForm = document.getElementById(`${target}-form`);
            if (targetForm) targetForm.classList.remove('hidden');
        });
    });

    // Popovers are handled by homepage_logic_integrated.js


    // --- Currency Dropdown Logic ---
    const currencyCurrencies = ['AED', 'AUD', 'EUR', 'GBP', 'INR', 'JPY', 'MYR', 'NZD', 'SAR', 'SGD', 'TRY', 'USD', 'VND'];
    const currencyTriggerDesktop = document.getElementById('currency-trigger-desktop');
    const currencyMenuDesktop = document.getElementById('currency-menu-desktop');
    const currencyTriggerMobile = document.getElementById('currency-trigger-mobile');
    const currencyMenuMobile = document.getElementById('currency-menu-mobile');

    function setCurrency(code) {
        window.APP_CURRENCY = code;
        // Update Displays
        const dDesk = document.getElementById('currency-display-desktop');
        const dMob = document.getElementById('currency-display-mobile');
        if (dDesk) dDesk.textContent = code;
        if (dMob) dMob.textContent = code;

        // Visual Feedback (Desktop)
        if (currencyMenuDesktop) {
            currencyMenuDesktop.querySelectorAll('.currency-item').forEach(el => {
                if (el.dataset.val === code) el.classList.add('bg-brand-surface', 'text-brand-primary', 'font-bold');
                else el.classList.remove('bg-brand-surface', 'text-brand-primary', 'font-bold');
            });
        }
        // Visual Feedback (Mobile)
        if (currencyMenuMobile) {
            currencyMenuMobile.querySelectorAll('.currency-item-mobile').forEach(el => {
                if (el.dataset.val === code) el.classList.add('border-brand-primary', 'text-brand-primary', 'bg-brand-surface');
                else el.classList.remove('border-brand-primary', 'text-brand-primary', 'bg-brand-surface');
            });
        }

        // Close Desktop Menu
        if (currencyMenuDesktop) currencyMenuDesktop.classList.add('hidden');
    }

    // Init Desktop Menu
    if (currencyMenuDesktop) {
        const listContainer = currencyMenuDesktop.querySelector('.currency-list');
        listContainer.innerHTML = '';
        currencyCurrencies.forEach(c => {
            const item = document.createElement('div');
            item.className = 'currency-item px-4 py-2 hover:bg-brand-surface cursor-pointer text-sm font-medium text-brand-text transition-colors flex justify-between items-center';
            if (c === window.APP_CURRENCY) item.classList.add('bg-brand-surface', 'text-brand-primary', 'font-bold');
            item.textContent = c;
            item.dataset.val = c;
            item.onclick = (e) => { e.stopPropagation(); setCurrency(c); };
            listContainer.appendChild(item);
        });

        // Toggle (and close language dropdown)
        if (currencyTriggerDesktop) {
            currencyTriggerDesktop.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (langMenuDesk) langMenuDesk.classList.add('hidden');
                currencyMenuDesktop.classList.toggle('hidden');
            });
        }
    }

    // Init Mobile Menu
    if (currencyMenuMobile) {
        currencyMenuMobile.innerHTML = '';
        currencyCurrencies.forEach(c => {
            const item = document.createElement('div');
            item.className = 'currency-item-mobile py-2 px-3 text-center border border-gray-200 rounded-lg text-sm font-medium hover:border-brand-primary hover:text-brand-primary cursor-pointer transition-colors';
            if (c === window.APP_CURRENCY) item.classList.add('border-brand-primary', 'text-brand-primary', 'bg-brand-surface');
            item.textContent = c;
            item.dataset.val = c;
            item.onclick = (e) => { e.stopPropagation(); setCurrency(c); };
            currencyMenuMobile.appendChild(item);
        });

        if (currencyTriggerMobile) {
            currencyTriggerMobile.addEventListener('click', (e) => {
                // Close language mobile menu
                if (langMenuMob && !langMenuMob.classList.contains('hidden')) {
                    langMenuMob.classList.add('hidden');
                    const langChev = document.getElementById('lang-chevron-mobile');
                    if (langChev) langChev.classList.remove('rotate-180');
                }
                const chevron = document.getElementById('currency-chevron-mobile');
                currencyMenuMobile.classList.toggle('hidden');
                if (chevron) chevron.classList.toggle('rotate-180');
            });
        }
    }


    // --- Language Dropdown Logic ---
    const appLanguages = [
        { code: 'en-US', label: 'EN', flag: 'us' },
        { code: 'de-DE', label: 'DE', flag: 'de' },
        { code: 'ru-RU', label: 'RU', flag: 'ru' },
        { code: 'ja-JP', label: 'JP', flag: 'jp' }
    ];
    const langTriggerDesk = document.getElementById('lang-trigger-desktop');
    const langMenuDesk = document.getElementById('lang-menu-desktop');
    const langTriggerMob = document.getElementById('lang-trigger-mobile');
    const langMenuMob = document.getElementById('lang-menu-mobile');

    function setLanguage(langObj) {
        window.APP_LANGUAGE = langObj.code;

        // Update Displays
        const updateDisplay = (prefix) => {
            const label = document.getElementById(`${prefix}-label`);
            const flag = document.getElementById(`${prefix}-flag`);
            if (label) label.textContent = langObj.label;
            if (flag) flag.src = `https://flagcdn.com/w20/${langObj.flag}.png`;
        };
        updateDisplay('lang-display-desktop');
        updateDisplay('lang-display-mobile');

        // Visual Feedback
        const updateActive = (menu, itemClass, activeClass) => {
            if (!menu) return;
            menu.querySelectorAll(itemClass).forEach(el => {
                if (el.dataset.code === langObj.code) el.classList.add(...activeClass.split(' '));
                else el.classList.remove(...activeClass.split(' '));
            });
        };

        if (langMenuDesk) updateActive(langMenuDesk, '.lang-item', 'bg-brand-surface text-brand-primary font-bold');
        if (langMenuMob) updateActive(langMenuMob, '.lang-item-mobile', 'border-brand-primary text-brand-primary bg-brand-surface');

        // Close Menu
        if (langMenuDesk) langMenuDesk.classList.add('hidden');
    }

    // Init Desktop Lang Menu
    if (langMenuDesk) {
        const list = langMenuDesk.querySelector('.lang-list');
        list.innerHTML = '';
        appLanguages.forEach(l => {
            const item = document.createElement('div');
            item.className = 'lang-item px-4 py-2 hover:bg-brand-surface cursor-pointer text-sm font-medium text-brand-text transition-colors flex items-center gap-3';
            if (l.code === window.APP_LANGUAGE) item.classList.add('bg-brand-surface', 'text-brand-primary', 'font-bold');
            item.dataset.code = l.code;
            item.innerHTML = `
                <img src="https://flagcdn.com/w20/${l.flag}.png" class="w-5 h-auto rounded shadow-sm">
                <span>${l.label}</span>
            `;
            item.onclick = (e) => { e.stopPropagation(); setLanguage(l); };
            list.appendChild(item);
        });

        if (langTriggerDesk) {
            langTriggerDesk.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (currencyMenuDesktop) currencyMenuDesktop.classList.add('hidden');
                langMenuDesk.classList.toggle('hidden');
            });
        }
    }

    // Init Mobile Lang Menu
    if (langMenuMob) {
        langMenuMob.innerHTML = '';
        appLanguages.forEach(l => {
            const item = document.createElement('div');
            item.className = 'lang-item-mobile py-2 px-3 flex items-center justify-center gap-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-brand-primary hover:text-brand-primary cursor-pointer transition-colors';
            if (l.code === window.APP_LANGUAGE) item.classList.add('border-brand-primary', 'text-brand-primary', 'bg-brand-surface');
            item.dataset.code = l.code;
            item.innerHTML = `
                <img src="https://flagcdn.com/w20/${l.flag}.png" class="w-4 h-auto rounded shadow-sm">
                <span>${l.label}</span>
            `;
            item.onclick = (e) => { e.stopPropagation(); setLanguage(l); };
            langMenuMob.appendChild(item);
        });

        if (langTriggerMob) {
            langTriggerMob.addEventListener('click', () => {
                // Close currency mobile menu
                if (currencyMenuMobile && !currencyMenuMobile.classList.contains('hidden')) {
                    currencyMenuMobile.classList.add('hidden');
                    const currChev = document.getElementById('currency-chevron-mobile');
                    if (currChev) currChev.classList.remove('rotate-180');
                }
                const chev = document.getElementById('lang-chevron-mobile');
                langMenuMob.classList.toggle('hidden');
                if (chev) chev.classList.toggle('rotate-180');
            });
        }
    }

    // --- Close all desktop dropdowns on outside click ---
    document.addEventListener('click', (e) => {
        if (currencyMenuDesktop && currencyTriggerDesktop &&
            !currencyTriggerDesktop.contains(e.target) && !currencyMenuDesktop.contains(e.target)) {
            currencyMenuDesktop.classList.add('hidden');
        }
        if (langMenuDesk && langTriggerDesk &&
            !langTriggerDesk.contains(e.target) && !langMenuDesk.contains(e.target)) {
            langMenuDesk.classList.add('hidden');
        }
    });
});

// ================= CONFIGURATION =================
const API_BASE_URL = 'https://demo.apps.easygds.com/api';
const SESSION_ID = 'demo_session_dynamic_homepage_' + Math.floor(Math.random() * 10000);

// Product IDs
const FLIGHT_CONFIG_ID = '3dca0e8c-b1ec-4fef-913e-09b577956c6d';
const HOTEL_CONFIG_ID = '4a5c9770-f901-4b96-8673-ecdc5ee49102';
const PACKAGE_CONFIG_ID = 'aaa34775-f480-477c-a656-f7a9a07ce605';
const TRANSFER_CONFIG_ID = '7bf47e3c-8951-4016-9190-d813047b3939';

// ================= UTILITIES =================
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDefaultDates() {
    const start = new Date();
    start.setDate(start.getDate() + 14); // 2 weeks out
    const end = new Date();
    end.setDate(end.getDate() + 17); // 3 days trip
    const fmt = (d) => d.toISOString().split('T')[0];
    return { startStr: fmt(start), endStr: fmt(end) };
}

async function fetchLocations(query, type, countryCode, placeId) {
    const url = new URL(`${API_BASE_URL}/places`, window.location.origin);
    url.searchParams.append("search_text", query);
    url.searchParams.append("language_code", "en-US");
    // Dynamic types based on input data-type
    let typeParam = "country,airport,administrative_area_level_4,administrative_area_level_3";
    if (type === 'airport_code') {
        typeParam = "airport"; // Strict filtering for flights/packages
    } else if (type === 'hotel') {
        typeParam = "hotel"; // Strict filtering for transfer dropoff (properties only)
    }
    url.searchParams.append("types", typeParam);
    if (countryCode) {
        url.searchParams.append("country_code", countryCode);
    }
    if (placeId) {
        url.searchParams.append("place_id", placeId);
    }
    url.searchParams.append("has_code", "false");
    url.searchParams.append("per_page", "20");
    url.searchParams.append("page", "1");

    // Handle specific type logic for properties (hotels)
    if (type === 'tour_region' || type === 'airport_code') {
        url.searchParams.append("with_properties", "false");
    } else {
        // For hotels or generic search, we might want properties
        url.searchParams.append("with_properties", "true");
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("API Request Failed");
        const data = await res.json();
        let results = [];

        if (Array.isArray(data)) {
            // ... existing array handling ...
            results = data.map(item => ({
                name: item.name,
                code: item.code || item.id,
                type: 'airport_code',
                id: item.id,
                city: item.location?.city_code || item.city,
                country: item.country,
                ancestors: item.ancestors || [],
                icon: '✈️'
            }));
        } else {
            // Object response
            const places = (data.places || []).map(p => ({
                name: p.long_name || p.name,
                code: p.code || p.id,
                type: p.type === 'airport' ? 'airport_code' : 'place_id',
                rawType: p.type,
                id: p.id,
                city: p.name,
                country: p.location?.country_code,
                ancestors: p.ancestors || [],
                icon: p.type === 'airport' ? '✈️' : '📍'
            }));
            const props = (data.properties || []).map(p => ({
                name: p.name,
                code: p.hotel_id || p.id,
                type: 'hotel',
                id: p.id,
                city: p.city_name || p.city || p.location?.city_name || p.location?.city_code || p.location?.name || '',
                country: p.country_code || p.location?.country_code || '',
                ancestors: p.ancestors || p.places || [],
                stars: p.star || 0,
                icon: '🏨'
            }));
            results = [...places, ...props];
        }

        // Client-side filtering: API seems to ignore country_code
        if (countryCode) {
            results = results.filter(r => r.country === countryCode);
        }

        return results;
    } catch (e) {
        console.warn("API Error:", e);
        return [];
    }
}

function getPlaceIdFromAncestors(ancestors) {
    if (!ancestors || !Array.isArray(ancestors)) return null;
    const findId = (t) => ancestors.find(a => a.type === t)?.id;
    return findId('country') || findId('city') || findId('multi_city_vicinity') || findId('province_state');
}

function setupAutocomplete(input) {
    if (!input) return;

    // Find the .search-input-box parent for proper positioning
    const inputBox = input.closest('.search-input-box');
    if (!inputBox) return;

    // Create container if not exists
    let container = inputBox.querySelector('.autocomplete-results');
    if (!container) {
        container = document.createElement('div');
        container.className = 'autocomplete-results hidden';
        inputBox.appendChild(container);
    }

    let debounceTimer;

    input.addEventListener('input', () => {
        const query = input.value;
        const type = input.dataset.type || 'any'; // Dynamic type check

        if (query.length < 3) {
            container.classList.add('hidden');
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            container.innerHTML = '<div class="p-3 text-sm text-gray-400">Loading...</div>';
            container.classList.remove('hidden');

            // Dependent Logic for Transfer Dropoff
            let countryFilter = null;
            let placeIdFilter = null;
            if (input.id === 'tr-dropoff') {
                const pickupInput = document.getElementById('tr-pickup');
                if (pickupInput) {
                    if (pickupInput.dataset.country) countryFilter = pickupInput.dataset.country;
                    if (pickupInput.dataset.placeIdFilter) placeIdFilter = pickupInput.dataset.placeIdFilter;
                }
            }

            const results = await fetchLocations(query, type, countryFilter, placeIdFilter);

            container.innerHTML = '';
            if (results.length === 0) {
                container.innerHTML = '<div class="p-3 text-sm text-gray-400">No results found</div>';
            } else {
                results.forEach(res => {
                    const item = document.createElement('div');
                    item.className = 'p-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-gray-50 last:border-0';

                    let icon = res.icon || '📍';
                    if (!res.icon) {
                        if (res.type === 'airport_code') icon = '✈️';
                        if (res.type === 'hotel') icon = '🏨';
                        if (res.type === 'station') icon = '🚆';
                    }

                    // Build location string
                    let locParts = [res.city, res.country].filter(Boolean);
                    let locStr = locParts.join(', ');

                    // Format code display
                    let codeDisplay = '';
                    if (res.code && res.type === 'airport_code') {
                        codeDisplay = `<span class="inline-flex items-center px-2 py-0.5 rounded bg-brand-surface text-brand-primary text-xs font-bold ml-2">${res.code}</span>`;
                    }

                    // Stars for hotels
                    let starsDisplay = '';
                    if (res.stars && res.stars > 0) {
                        starsDisplay = `<span class="text-yellow-500 ml-1">${'★'.repeat(res.stars)}</span>`;
                    }

                    item.innerHTML = `
                        <div class="flex items-start gap-3">
                            <span class="text-lg flex-shrink-0 mt-0.5">${icon}</span>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center flex-wrap">
                                    <span class="font-semibold text-slate-800">${res.name}</span>
                                    ${codeDisplay}
                                    ${starsDisplay}
                                </div>
                                ${locStr ? `<div class="text-xs text-slate-400 mt-0.5">${locStr}</div>` : ''}
                            </div>
                        </div>
                    `;

                    item.onclick = () => {
                        input.value = res.name;
                        input.dataset.code = res.code;
                        input.dataset.id = res.id;
                        input.dataset.selType = res.type;
                        input.dataset.rawType = res.rawType;
                        if (res.country) {
                            input.dataset.country = res.country; // Save country for dependent fields
                        }
                        const filterId = getPlaceIdFromAncestors(res.ancestors);
                        if (filterId) {
                            input.dataset.placeIdFilter = filterId;
                        } else {
                            delete input.dataset.placeIdFilter;
                        }
                        container.classList.add('hidden');
                    };
                    container.appendChild(item);
                });
            }
        }, 400);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!inputBox.contains(e.target)) {
            container.classList.add('hidden');
        }
    });

    // Close on blur with delay to allow click selection
    input.addEventListener('blur', () => {
        setTimeout(() => container.classList.add('hidden'), 200);
    });
}

function getCode(id, def) {
    const el = document.getElementById(id);
    return (el && el.dataset.code) ? el.dataset.code : def;
}

function validateInputs(ids) {
    let isValid = true;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        let val = el.value;
        if (el.tagName === 'DIV' || el.tagName === 'SPAN') {
            val = el.textContent ? el.textContent.trim() : '';
        }

        if (!val || val === '') {
            isValid = false;
            const box = el.closest('.search-input-box');
            if (box) {
                // Subtle red border
                box.style.borderColor = '#ef4444';
                // Remove on interaction
                const clear = () => { box.style.borderColor = ''; };
                el.addEventListener('input', clear, { once: true });
                el.addEventListener('click', clear, { once: true });
                box.addEventListener('click', clear, { once: true });
            }
        }
    });
    return isValid;
}

function go(paramsObj, customPath, newTab) {
    let base;
    if (customPath) {
        base = 'https://demo.apps.easygds.com/shopping/' + customPath;
    } else {
        base = 'https://demo.apps.easygds.com/shopping/processes/' + (paramsObj.process || 'flight');
    }

    // Explicit ordering to match working legacy URLs
    const ordered = {};
    const priorityKeys = ['process', 'place_type', 'place_id', 'currency_code', 'language_code', 'package_id', 'travelers', 'expectation'];

    // Set global defaults immediately
    paramsObj.currency_code = window.APP_CURRENCY;
    paramsObj.language_code = window.APP_LANGUAGE;

    // 1. Priority Keys
    priorityKeys.forEach(k => {
        if (paramsObj[k] !== undefined && paramsObj[k] !== null) ordered[k] = paramsObj[k];
    });

    // 2. Remaining Keys (excluding blacklist and handled)
    Object.keys(paramsObj).forEach(k => {
        if (!priorityKeys.includes(k) &&
            k !== 'disabled_currency' &&
            k !== 'search_id' &&
            k !== 'currency_code' && k !== 'language_code') {
            ordered[k] = paramsObj[k];
        }
    });

    // 3. Protocol Params (Hotel)
    if (paramsObj.process === 'hotel' || !paramsObj.process) {
        ordered.flight_campaign = '';
        ordered.partner_id = '';
        ordered.show_crew_booking = 'true';
        ordered.is_crew_booking = 'false';
    }

    // 4. Session Params
    ordered.session_id = SESSION_ID;
    ordered.office_domain = 'demo.b2c.easygds.com';
    ordered.scope_type = 'B2C';

    const qs = new URLSearchParams(ordered).toString();
    console.log("Submitting to:", base + '?' + qs);

    if (newTab) {
        window.open(base + '?' + qs, '_blank');
    } else {
        window.location.href = base + '?' + qs;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Init Autocomplete
    document.querySelectorAll('.auto-input').forEach(el => setupAutocomplete(el));

    // Custom Select Logic
    document.querySelectorAll('.custom-select').forEach(sel => {
        const opts = sel.querySelector('.custom-options');
        if (!opts) return;

        sel.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Close other dropdowns
            document.querySelectorAll('.custom-options').forEach(el => {
                if (el !== opts) el.classList.add('hidden');
            });
            opts.classList.toggle('hidden');
        });

        // Handle option selection
        opts.addEventListener('click', (e) => {
            e.stopPropagation();
            const opt = e.target.closest('.option-item');
            if (!opt) return;
            const val = opt.dataset.val || opt.textContent.trim();
            const display = sel.querySelector('.selected-val');
            if (display) display.textContent = opt.textContent.trim();
            sel.dataset.value = val;
            opts.classList.add('hidden');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-options').forEach(el => el.classList.add('hidden'));
    });

    // ================= FLIGHT LOGIC =================
    flatpickr('#fl-dates', { mode: "range", dateFormat: "Y-m-d", minDate: "today" });

    // Trip Type
    document.querySelectorAll('input[name="ft_type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const flDateInput = document.getElementById('fl-dates');
            const fp = flDateInput._flatpickr;
            if (e.target.value === 'oneway') {
                fp.set('mode', 'single');
                flDateInput.placeholder = "Depart";
            } else {
                fp.set('mode', 'range');
                flDateInput.placeholder = "Depart - Return";
            }
        });
    });

    // Flight Pax
    const flightPax = (function () {
        const state = { adt: 1, chd: 0, inf: 0, chdAges: [] };
        const MAX_SEATS = 8;
        const els = {
            trigger: document.getElementById('fl-pax-trigger'),
            menu: document.getElementById('fl-pax-menu'),
            display: document.getElementById('fl-pax-display'),
            btnDone: document.getElementById('btn-done-pax'),
            counts: {
                adt: document.getElementById('count-adt'),
                chd: document.getElementById('count-chd'),
                inf: document.getElementById('count-inf')
            },
            chdAgesCont: document.getElementById('chd-ages-container'),
            chdAgesGrid: document.getElementById('chd-ages-grid')
        };

        if (!els.trigger) return { getState: () => state };

        els.trigger.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            els.menu.classList.toggle('hidden');
        });
        els.menu.addEventListener('click', (e) => e.stopPropagation());
        if (els.btnDone) els.btnDone.addEventListener('click', () => els.menu.classList.add('hidden'));
        document.addEventListener('click', (e) => {
            if (!els.trigger.contains(e.target) && !els.menu.contains(e.target)) els.menu.classList.add('hidden');
        });

        document.querySelectorAll('.pax-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                updateState(btn.dataset.type, btn.dataset.action);
            });
        });

        function updateState(type, action) {
            let { adt, chd, inf } = state;
            let newAdt = adt, newChd = chd, newInf = inf;

            if (type === 'adt') action === 'plus' ? newAdt++ : newAdt--;
            else if (type === 'chd') action === 'plus' ? newChd++ : newChd--;
            else if (type === 'inf') action === 'plus' ? newInf++ : newInf--;

            if (newAdt < 1) return;
            if ((newAdt + newChd) > MAX_SEATS) return; // Simple max limit
            if (newInf > newAdt && type !== 'adt') return; // Infant limit
            if (type === 'adt' && newInf > newAdt) newInf = newAdt;

            state.adt = newAdt; state.chd = newChd; state.inf = newInf;

            // Age array sync
            while (state.chdAges.length < state.chd) state.chdAges.push(5);
            while (state.chdAges.length > state.chd) state.chdAges.pop();

            render();
        }

        function render() {
            if (els.counts.adt) els.counts.adt.textContent = state.adt;
            if (els.counts.chd) els.counts.chd.textContent = state.chd;
            if (els.counts.inf) els.counts.inf.textContent = state.inf;

            const parts = [];
            parts.push(`${state.adt} Adult${state.adt > 1 ? 's' : ''}`);
            if (state.chd > 0) parts.push(`${state.chd} Child${state.chd > 1 ? 'ren' : ''}`);
            if (state.inf > 0) parts.push(`${state.inf} Infant${state.inf > 1 ? 's' : ''}`);
            const txt = parts.join(', ');
            if (els.display) {
                els.display.textContent = txt;
                if (els.display.tagName === 'INPUT') els.display.value = txt;
            } else if (els.trigger.querySelector('input')) {
                els.trigger.querySelector('input').value = txt;
            }

            if (state.chd > 0) {
                els.chdAgesCont.classList.remove('hidden');
                els.chdAgesGrid.innerHTML = '';
                state.chdAges.forEach((age, idx) => {
                    const wrapper = document.createElement('div');
                    wrapper.className = "flex flex-col";
                    const label = document.createElement('div');
                    label.className = 'text-[10px] text-gray-500 mb-1';
                    label.textContent = `Child ${idx + 1}`;
                    const sel = document.createElement('select');
                    sel.className = 'w-full p-2 bg-slate-50 border rounded text-xs outline-none';
                    for (let i = 2; i <= 11; i++) {
                        const opt = document.createElement('option');
                        opt.value = i; opt.textContent = `${i} yrs`;
                        if (i === age) opt.selected = true;
                        sel.appendChild(opt);
                    }
                    sel.onchange = (e) => state.chdAges[idx] = parseInt(e.target.value);
                    wrapper.appendChild(label);
                    wrapper.appendChild(sel);
                    els.chdAgesGrid.appendChild(wrapper);
                });
            } else {
                els.chdAgesCont.classList.add('hidden');
            }
        }
        render();
        return { getState: () => state };
    })();

    const flSearchBtn = document.getElementById('flight-search-btn');
    if (flSearchBtn) {
        flSearchBtn.onclick = () => {
            if (!validateInputs(['fl-origin', 'fl-dest', 'fl-dates', 'fl-pax-display'])) return;

            const dates = document.getElementById('fl-dates').value.split(' to ');
            const def = getDefaultDates();
            const paxState = flightPax.getState();

            const travelers = [];
            for (let i = 0; i < paxState.adt; i++) travelers.push({ type: 'adult', age: 30, room: 1 });
            paxState.chdAges.forEach(age => travelers.push({ type: 'child', age: age, room: 1 }));
            for (let i = 0; i < paxState.inf; i++) travelers.push({ type: 'infant', age: 1, room: 1 });

            const isRoundTrip = document.querySelector('input[name="ft_type"]:checked')?.value === 'round' || true;
            const cabin = document.getElementById('fl-cabin-val')?.textContent || 'Economy';

            const expectation = {
                is_multi_city: false,
                start_place_code: getCode('fl-origin', 'SIN'),
                start_place_type: 'airport_code',
                des_code: getCode('fl-dest', 'BKK'),
                des_type: 'airport_code',
                fl_cabin_class: cabin,
                fl_departure_date: dates[0] || def.startStr,
                fl_round_trip: isRoundTrip
            };
            if (isRoundTrip) expectation.fl_return_date = dates[1] || def.endStr;

            go({
                process: 'flight',
                package_id: FLIGHT_CONFIG_ID,
                expectation: JSON.stringify(expectation),
                travelers: JSON.stringify(travelers)
            });
        };
    }

    // ================= PACKAGE LOGIC =================
    flatpickr('#pkg-dates', { mode: "range", dateFormat: "Y-m-d", minDate: "today" });
    flatpickr('#pkg-hotel-dates', { mode: "range", dateFormat: "Y-m-d", minDate: "today" });

    const pkgCheck = document.getElementById('pkg-partial-hotel');
    const pkgHotelCont = document.getElementById('pkg-partial-dates-container');
    if (pkgCheck) {
        pkgCheck.addEventListener('change', (e) => {
            e.target.checked ? pkgHotelCont.classList.remove('hidden') : pkgHotelCont.classList.add('hidden');
        });
    }

    // Package API Logic
    const pkgTravelerState = [{ id: 1, adults: 2, children: [], infants: 0 }];
    const pkgManager = {
        render: () => {
            const container = document.getElementById('pkg-rooms-container');
            const summary = document.getElementById('pkg-traveler-summary');
            if (!container) return;
            container.innerHTML = '';

            pkgTravelerState.forEach((room, index) => {
                const roomEl = document.createElement('div');
                roomEl.className = 'w-full';
                // Room Header
                const header = document.createElement('div');
                header.className = 'flex justify-between items-center mb-3';
                header.innerHTML = `<h3 class="text-sm font-bold text-slate-700">Room ${index + 1}</h3>`;
                if (pkgTravelerState.length > 1) {
                    const rmBtn = document.createElement('button');
                    rmBtn.className = 'text-xs text-red-500 font-bold';
                    rmBtn.textContent = 'Remove';
                    rmBtn.onclick = (e) => { e.stopPropagation(); pkgTravelerState.splice(index, 1); pkgManager.render(); };
                    header.appendChild(rmBtn);
                }
                roomEl.appendChild(header);

                // Controls Container
                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-lg';

                // Helpers
                const createRow = (label, val, min, fn) => {
                    const r = document.createElement('div'); r.className = 'flex justify-between items-center';
                    r.innerHTML = `<span class="text-sm text-slate-600 font-medium">${label}</span>`;
                    const ctrls = document.createElement('div');
                    ctrls.className = 'flex items-center gap-2 bg-white rounded border border-gray-200 p-1';

                    const btnM = document.createElement('button'); btnM.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-slate-600 font-bold';
                    btnM.textContent = '-';
                    btnM.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (val > min) fn(val - 1); };

                    const txt = document.createElement('span'); txt.className = 'w-6 text-center text-sm font-bold'; txt.textContent = val;

                    const btnP = document.createElement('button'); btnP.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-slate-600 font-bold';
                    btnP.textContent = '+';
                    btnP.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fn(val + 1); };

                    ctrls.append(btnM, txt, btnP);
                    r.appendChild(ctrls);
                    return r;
                };

                grid.appendChild(createRow('Adults', room.adults, 1, (v) => { room.adults = v; pkgManager.render(); }));
                grid.appendChild(createRow('Children', room.children.length, 0, (v) => {
                    const d = v - room.children.length;
                    if (d > 0) for (let i = 0; i < d; i++) room.children.push(8);
                    else room.children.splice(d);
                    pkgManager.render();
                }));
                grid.appendChild(createRow('Infants', room.infants, 0, (v) => { room.infants = v; pkgManager.render(); }));

                // Ages
                if (room.children.length > 0) {
                    const ages = document.createElement('div'); ages.className = 'grid grid-cols-2 gap-2 mt-2';
                    room.children.forEach((age, ai) => {
                        const wrap = document.createElement('div');
                        wrap.innerHTML = `<label class="text-[10px] block text-gray-500">Child ${ai + 1}</label>`;
                        const sel = document.createElement('select'); sel.className = 'w-full p-1 text-xs border rounded';
                        for (let k = 2; k <= 17; k++) {
                            const o = document.createElement('option'); o.value = k; o.textContent = k; if (k === age) o.selected = true;
                            sel.appendChild(o);
                        }
                        sel.onchange = (e) => room.children[ai] = parseInt(e.target.value);
                        wrap.appendChild(sel);
                        ages.appendChild(wrap);
                    });
                    grid.appendChild(ages);
                }
                roomEl.appendChild(grid);
                container.appendChild(roomEl);
            });

            // Summary Update
            const ta = pkgTravelerState.reduce((a, b) => a + b.adults, 0);
            const tk = pkgTravelerState.reduce((a, b) => a + b.children.length + b.infants, 0);
            const tr = pkgTravelerState.length;
            summary.textContent = `${tr} Room${tr > 1 ? 's' : ''}, ${ta + tk} Pax`;
            // Or input value
            if (summary.tagName === 'INPUT') summary.value = `${tr} Room${tr > 1 ? 's' : ''}, ${ta + tk} Pax`;
        }
    };

    // Pkg Trigger Logic
    const pkgTrig = document.getElementById('pkg-traveler-trigger');
    const pkgPop = document.getElementById('pkg-traveler-popover');
    if (pkgTrig && pkgPop) {
        pkgTrig.addEventListener('click', (e) => { e.stopPropagation(); pkgPop.classList.toggle('hidden'); });
        pkgPop.addEventListener('click', e => e.stopPropagation());

        const btnAdd = document.getElementById('pkg-btn-add-room');
        if (btnAdd) btnAdd.onclick = (e) => { e.stopPropagation(); pkgTravelerState.push({ id: Date.now(), adults: 1, children: [], infants: 0 }); pkgManager.render(); };

        const btnDone = document.getElementById('pkg-btn-done-travelers');
        if (btnDone) btnDone.onclick = (e) => { e.stopPropagation(); pkgPop.classList.add('hidden'); };

        document.addEventListener('click', (e) => { if (pkgTrig && !pkgTrig.contains(e.target) && pkgPop && !pkgPop.contains(e.target)) pkgPop.classList.add('hidden'); });
        pkgManager.render();
    }

    document.getElementById('pkg-search-btn').onclick = () => {
        const isSep = document.getElementById('pkg-partial-hotel').checked;
        const required = ['pkg-origin', 'pkg-dest', 'pkg-dates', 'pkg-traveler-summary'];
        if (isSep) required.push('pkg-hotel-dates');

        if (!validateInputs(required)) return;

        const dates = document.getElementById('pkg-dates').value.split(' to ');
        const def = getDefaultDates();

        const originCode = getCode('pkg-origin', 'SIN');
        const destCode = getCode('pkg-dest', 'HKT');
        const destInput = document.getElementById('pkg-dest');
        const destId = (destInput && destInput.dataset.id) ? destInput.dataset.id : destCode;

        const travelersApi = [];
        pkgTravelerState.forEach((room, rIndex) => {
            for (let i = 0; i < room.adults; i++) travelersApi.push({ type: 'adult', age: 30, room: rIndex + 1 });
            room.children.forEach(age => travelersApi.push({ type: 'child', age: age, room: rIndex + 1 }));
            for (let i = 0; i < room.infants; i++) travelersApi.push({ type: 'infant', age: 1, room: rIndex + 1 });
        });

        const cabinVal = document.getElementById('pkg-cabin-val').textContent;
        // isSep already declared above

        go({
            process: 'bundle',
            package_id: PACKAGE_CONFIG_ID,
            place_type: 'airport',
            place_id: destId,
            is_separate: isSep,
            expectation: JSON.stringify({
                fl_cabin_class: cabinVal,
                fl_departure_date: dates[0] || def.startStr,
                fl_return_date: dates[1] || def.endStr,
                fl_round_trip: true,
                start_place_code: originCode,
                start_place_type: 'airport_code',
                des_code: destCode,
                des_type: 'airport_code',
                ht_des_code: destCode,
                ht_des_type: 'airport_code',
                ht_checkin_date: dates[0] || def.startStr,
                ht_checkout_date: dates[1] || def.endStr,
                is_separate: isSep,
                stars: null
            }),
            travelers: JSON.stringify(travelersApi)
        });
    };


    // ================= HOTEL LOGIC =================
    flatpickr('#ht-dates', { mode: "range", dateFormat: "Y-m-d", minDate: "today" });

    // Hotel Traveler state reuse similar structure but separate instance
    const htTravelerState = [{ id: 1, adults: 2, children: [], infants: 0 }];
    const htManager = {
        render: () => {
            const container = document.getElementById('rooms-container'); // Correct ID for Hotel
            const summary = document.getElementById('traveler-summary');
            if (!container) return;
            container.innerHTML = '';

            htTravelerState.forEach((room, index) => {
                const roomEl = document.createElement('div'); roomEl.className = 'w-full';
                const header = document.createElement('div'); header.className = 'flex justify-between items-center mb-3';
                header.innerHTML = `<h3 class="text-sm font-bold text-slate-700">Room ${index + 1}</h3>`;
                if (htTravelerState.length > 1) {
                    const rmBtn = document.createElement('button'); rmBtn.className = 'text-xs text-red-500 font-bold'; rmBtn.textContent = 'Remove';
                    rmBtn.onclick = (e) => { e.stopPropagation(); htTravelerState.splice(index, 1); htManager.render(); };
                    header.appendChild(rmBtn);
                }
                roomEl.appendChild(header);
                const grid = document.createElement('div'); grid.className = 'grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-lg';

                const createRow = (label, val, min, fn) => {
                    const r = document.createElement('div'); r.className = 'flex justify-between items-center';
                    r.innerHTML = `<span class="text-sm text-slate-600 font-medium">${label}</span>`;
                    const ctrls = document.createElement('div'); ctrls.className = 'flex items-center gap-2 bg-white rounded border border-gray-200 p-1';
                    const btnM = document.createElement('button'); btnM.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-slate-600 font-bold'; btnM.textContent = '-';
                    btnM.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (val > min) fn(val - 1); };
                    const txt = document.createElement('span'); txt.className = 'w-6 text-center text-sm font-bold'; txt.textContent = val;
                    const btnP = document.createElement('button'); btnP.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-slate-600 font-bold'; btnP.textContent = '+';
                    btnP.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fn(val + 1); };
                    ctrls.append(btnM, txt, btnP); r.appendChild(ctrls); return r;
                };

                grid.appendChild(createRow('Adults', room.adults, 1, (v) => { room.adults = v; htManager.render(); }));
                grid.appendChild(createRow('Children', room.children.length, 0, (v) => {
                    const d = v - room.children.length; if (d > 0) for (let i = 0; i < d; i++) room.children.push(8); else room.children.splice(d); htManager.render();
                }));
                roomEl.appendChild(grid);

                if (room.children.length > 0) {
                    const ages = document.createElement('div'); ages.className = 'grid grid-cols-2 gap-2 mt-2';
                    room.children.forEach((age, ai) => {
                        const wrap = document.createElement('div');
                        wrap.innerHTML = `<label class="text-[10px] block text-gray-500">Child ${ai + 1}</label>`;
                        const sel = document.createElement('select'); sel.className = 'w-full p-1 text-xs border rounded';
                        for (let k = 2; k <= 17; k++) {
                            const o = document.createElement('option'); o.value = k; o.textContent = k; if (k === age) o.selected = true; sel.appendChild(o);
                        }
                        sel.onchange = (e) => room.children[ai] = parseInt(e.target.value);
                        wrap.appendChild(sel); ages.appendChild(wrap);
                    });
                    grid.appendChild(ages);
                }
                container.appendChild(roomEl);
            });
            const ta = htTravelerState.reduce((a, b) => a + b.adults, 0);
            const tk = htTravelerState.reduce((a, b) => a + b.children.length, 0);
            const tr = htTravelerState.length;
            summary.textContent = `${tr} Room${tr > 1 ? 's' : ''}, ${ta + tk} Guests`;
            if (summary.tagName === 'INPUT') summary.value = `${tr} Room${tr > 1 ? 's' : ''}, ${ta + tk} Guests`;
        }
    };

    // Hotel Trigger
    const htTrig = document.getElementById('traveler-trigger');
    const htPop = document.getElementById('traveler-popover');
    if (htTrig && htPop) {
        htTrig.addEventListener('click', (e) => { e.stopPropagation(); htPop.classList.toggle('hidden'); });
        htPop.addEventListener('click', e => e.stopPropagation());

        const btnAdd = document.getElementById('btn-add-room');
        if (btnAdd) btnAdd.onclick = (e) => { e.stopPropagation(); htTravelerState.push({ id: Date.now(), adults: 1, children: [], infants: 0 }); htManager.render(); };

        const btnDone = document.getElementById('btn-done-travelers');
        if (btnDone) btnDone.onclick = (e) => { e.stopPropagation(); htPop.classList.add('hidden'); };

        document.addEventListener('click', (e) => { if (htTrig && !htTrig.contains(e.target) && htPop && !htPop.contains(e.target)) htPop.classList.add('hidden'); });
        htManager.render();
    }

    document.getElementById('hotel-search-btn').onclick = () => {
        const datesInput = document.getElementById('ht-dates');
        const destInput = document.getElementById('ht-dest');

        // Validation using new highlight function
        if (!validateInputs(['ht-dest', 'ht-dates', 'traveler-summary'])) return;

        const dates = datesInput.value.split(' to ');
        const def = getDefaultDates();

        const selType = destInput.dataset.selType || 'place_id';
        const rawType = destInput.dataset.rawType;

        // Use ID for standard places (non-airport/hotel)
        const code = (selType === 'airport_code' || selType === 'hotel')
            ? (destInput.dataset.code || '2766')
            : (destInput.dataset.id || destInput.dataset.code || '2766');

        const travelersApi = [];
        htTravelerState.forEach((room, rIndex) => {
            for (let i = 0; i < room.adults; i++) travelersApi.push({ type: 'adult', age: 30, room: rIndex + 1 });
            room.children.forEach(age => travelersApi.push({ type: 'child', age: age, room: rIndex + 1 }));
        });

        if (selType === 'hotel') {
            go({
                process: 'hotel',
                place_type: 'hotel',
                place_id: code,
                package_id: HOTEL_CONFIG_ID,
                expectation: JSON.stringify({
                    ht_des_code: code,
                    ht_checkin_date: dates[0] || def.startStr,
                    ht_checkout_date: dates[1] || def.endStr,
                    ht_des_type: 'property_id',
                    is_separate: true
                }),
                travelers: JSON.stringify(travelersApi)
            }, `products/hotel/${code}`);
        } else if (selType === 'airport_code') {
            go({
                process: 'hotel',
                place_type: 'airport',
                place_id: destInput.dataset.id || code,
                package_id: HOTEL_CONFIG_ID,
                expectation: JSON.stringify({
                    ht_des_code: code,
                    ht_checkin_date: dates[0] || def.startStr,
                    ht_checkout_date: dates[1] || def.endStr,
                    ht_des_type: 'airport_code',
                    is_separate: false
                }),
                travelers: JSON.stringify(travelersApi)
            });
        } else {
            go({
                process: 'hotel',
                place_type: rawType || 'administrative_area_level_4',
                place_id: code,
                package_id: HOTEL_CONFIG_ID,
                expectation: JSON.stringify({
                    ht_des_code: code,
                    ht_checkin_date: dates[0] || def.startStr,
                    ht_checkout_date: dates[1] || def.endStr,
                    ht_des_type: 'place_id',
                    is_separate: false
                }),
                travelers: JSON.stringify(travelersApi)
            });
        }
    };


    // ================= TRANSFER LOGIC =================
    flatpickr('#tr-date', { dateFormat: "Y-m-d", minDate: "today" });

    // Time Populator
    const trTimeOpts = document.getElementById('tr-time-opts');
    if (trTimeOpts) {
        for (let i = 0; i < 24; i++) {
            for (let m = 0; m < 60; m += 30) {
                const t = `${String(i).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const d = document.createElement('div');
                d.className = 'option-item p-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700';
                d.textContent = t;
                trTimeOpts.appendChild(d);
            }
        }
    }

    const trSwap = document.getElementById('btn-swap-transfer');
    if (trSwap) {
        trSwap.onclick = () => {
            const i1 = document.getElementById('tr-pickup');
            const i2 = document.getElementById('tr-dropoff');
            const l1 = i1.parentElement.querySelector('label');
            const l2 = i2.parentElement.querySelector('label');

            // Swap Labels
            const tmpL = l1.textContent; l1.textContent = l2.textContent; l2.textContent = tmpL;
            // Swap Values
            const tmpV = i1.value; i1.value = i2.value; i2.value = tmpV;
            // Swap Types
            const t1 = i1.dataset.type; const t2 = i2.dataset.type;
            i1.dataset.type = t2; i2.dataset.type = t1;
            // Swap Placeholder
            const p1 = i1.placeholder; i1.placeholder = i2.placeholder; i2.placeholder = p1;

            // Swap Datasets
            const swapD = (k) => {
                const v1 = i1.dataset[k]; const v2 = i2.dataset[k];
                if (v2) i1.dataset[k] = v2; else delete i1.dataset[k];
                if (v1) i2.dataset[k] = v1; else delete i2.dataset[k];
            };
            swapD('code'); swapD('id'); swapD('selType');
        };
    }

    document.getElementById('btn-search-transfer').onclick = () => {
        if (!validateInputs(['tr-pickup', 'tr-dropoff', 'tr-date'])) return;

        const date = document.getElementById('tr-date').value || getDefaultDates().startStr;
        const time = document.getElementById('tr-time-val').textContent;
        const topInput = document.getElementById('tr-pickup');
        const bottomInput = document.getElementById('tr-dropoff');
        const isFromAirport = topInput.dataset.type === 'airport_code';

        let airportCode, placeId, placeType;

        if (isFromAirport) {
            airportCode = getCode('tr-pickup', 'LHR') || 'LHR';
            placeId = (bottomInput.dataset.id || bottomInput.dataset.code || '27158');
            placeType = (bottomInput.dataset.selType === 'hotel') ? 'property_id' : 'place_id';
        } else {
            airportCode = getCode('tr-dropoff', 'LHR') || 'LHR';
            placeId = (topInput.dataset.id || topInput.dataset.code || '27158');
            placeType = (topInput.dataset.selType === 'hotel') ? 'property_id' : 'place_id';
        }

        go({
            process: 'transfer',
            package_id: TRANSFER_CONFIG_ID,
            expectation: JSON.stringify({
                is_separate: false,
                tf_airport_code: airportCode,
                tf_from_airport: isFromAirport,
                tf_pickup_date: date,
                tf_pickup_time: time,
                tf_place_code: placeId,
                tf_place_type: placeType,
                tf_return_date: null,
                tf_return_time: null,
                tf_round_trip: false
            }),
            travelers: JSON.stringify([{ type: 'adult', age: 30, room: 1 }])
        });
    };

    // ================= TOUR LOGIC =================
    flatpickr('#tour-dates', { mode: "range", dateFormat: "Y-m-d", minDate: "today" });

    // Tour Traveler State
    const tourPax = (function () {
        const state = { adt: 1, chd: 0, inf: 0, chdAges: [] };
        const MAX = 9;
        const els = {
            trigger: document.getElementById('tour-pax-trigger'),
            menu: document.getElementById('tour-pax-menu'),
            display: document.getElementById('tour-pax-display'),
            btnDone: document.getElementById('tour-btn-done-pax'),
            counts: {
                adt: document.getElementById('tour-count-adt'),
                chd: document.getElementById('tour-count-chd'),
                inf: document.getElementById('tour-count-inf')
            },
            agesCont: document.getElementById('tour-chd-ages-container'),
            agesGrid: document.getElementById('tour-chd-ages-grid')
        };

        if (!els.trigger) return { getState: () => state };

        els.trigger.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            els.menu.classList.toggle('hidden');
        });
        els.menu.addEventListener('click', (e) => e.stopPropagation());
        if (els.btnDone) els.btnDone.addEventListener('click', (e) => { e.stopPropagation(); els.menu.classList.add('hidden'); });
        document.addEventListener('click', (e) => {
            if (els.trigger && els.menu && !els.trigger.contains(e.target) && !els.menu.contains(e.target)) els.menu.classList.add('hidden');
        });

        document.querySelectorAll('.pax-btn-tour').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                const type = btn.dataset.type;
                const action = btn.dataset.action;

                let { adt, chd, inf } = state;
                if (type === 'adt') action === 'plus' ? adt++ : adt--;
                else if (type === 'chd') action === 'plus' ? chd++ : chd--;
                else if (type === 'inf') action === 'plus' ? inf++ : inf--;

                if (adt < 1) adt = 1;
                if ((adt + chd + inf) > MAX) return; // limit
                if (inf > adt) inf = adt;

                state.adt = adt; state.chd = chd; state.inf = inf;

                // Sync ages
                while (state.chdAges.length < chd) state.chdAges.push(5);
                while (state.chdAges.length > chd) state.chdAges.pop();

                render();
            });
        });

        function render() {
            if (els.counts.adt) els.counts.adt.textContent = state.adt;
            if (els.counts.chd) els.counts.chd.textContent = state.chd;
            if (els.counts.inf) els.counts.inf.textContent = state.inf;

            let txt = `${state.adt} Adult${state.adt > 1 ? 's' : ''}`;
            if (state.chd > 0) txt += `, ${state.chd} Chd`;
            if (state.inf > 0) txt += `, ${state.inf} Inf`;
            if (els.display) els.display.value = txt; // Input element

            if (state.chd > 0) {
                els.agesCont.classList.remove('hidden');
                els.agesGrid.innerHTML = '';
                state.chdAges.forEach((age, i) => {
                    const wrap = document.createElement('div');
                    wrap.className = "flex flex-col";
                    const lbl = document.createElement('div');
                    lbl.className = 'text-[10px] text-gray-500 mb-1';
                    lbl.textContent = `Child ${i + 1}`;
                    const sel = document.createElement('select');
                    sel.className = 'w-full p-2 bg-slate-50 border rounded text-xs outline-none';
                    for (let x = 2; x <= 11; x++) {
                        const opt = document.createElement('option');
                        opt.value = x; opt.textContent = `${x} yrs`;
                        if (x === age) opt.selected = true;
                        sel.appendChild(opt);
                    }
                    sel.onchange = (e) => state.chdAges[i] = parseInt(e.target.value);
                    wrap.append(lbl, sel);
                    els.agesGrid.appendChild(wrap);
                });
            } else {
                els.agesCont.classList.add('hidden');
            }
        }
        render();
        return { getState: () => state };
    })();

    document.getElementById('tour-search-btn').onclick = () => {
        if (!validateInputs(['tour-dest', 'tour-dates', 'tour-pax-display'])) return;

        const dates = document.getElementById('tour-dates').value.split(' to ');
        const destInput = document.getElementById('tour-dest');
        const desCode = destInput.dataset.id || destInput.dataset.code || '178312';
        // API Docs say: tr_des_type should be 'place_id' for tours
        const desType = 'place_id';

        const def = getDefaultDates();
        const startDate = dates[0] || def.startStr;
        const endDate = dates[1] || def.endStr;

        const pax = tourPax.getState();
        const travelers = [];
        for (let i = 0; i < pax.adt; i++) travelers.push({ type: 'adult', age: 30, room: 1 });
        pax.chdAges.forEach(age => travelers.push({ type: 'child', age: age, room: 1 }));
        for (let i = 0; i < pax.inf; i++) travelers.push({ type: 'infant', age: 1, room: 1 });

        go({
            process: 'tour',
            package_id: 'ddd85aba-76ad-47f0-abd4-a36d7767b624',
            expectation: JSON.stringify({
                is_separate: false,
                tr_des_code: desCode,
                tr_des_type: desType,
                tr_start_date: startDate,
                tr_end_date: endDate
            }),
            travelers: JSON.stringify(travelers)
        });
    };
    // ================= DEAL MODAL LOGIC =================
    const modal = document.getElementById('deal-modal');
    const modalContent = document.getElementById('deal-modal-content');
    const modalBackdrop = document.getElementById('deal-modal-backdrop');

    if (modal) {
        // --- Modal Traveler Managers ---
        const modalPkgTravelerState = [{ id: 1, adults: 2, children: [], infants: 0 }];
        const modalPkgManager = {
            render: () => {
                const container = document.getElementById('modal-rooms-container');
                const summary = document.getElementById('modal-traveler-summary');
                if (!container) return;
                container.innerHTML = '';

                modalPkgTravelerState.forEach((room, index) => {
                    const roomEl = document.createElement('div');
                    roomEl.className = 'w-full';
                    const header = document.createElement('div');
                    header.className = 'flex justify-between items-center mb-3';
                    header.innerHTML = `<h3 class="text-sm font-bold text-slate-700">Room ${index + 1}</h3>`;
                    if (modalPkgTravelerState.length > 1) {
                        const rmBtn = document.createElement('button');
                        rmBtn.className = 'text-xs text-red-500 font-bold';
                        rmBtn.textContent = 'Remove';
                        rmBtn.onclick = (e) => { e.stopPropagation(); modalPkgTravelerState.splice(index, 1); modalPkgManager.render(); };
                        header.appendChild(rmBtn);
                    }
                    roomEl.appendChild(header);

                    const grid = document.createElement('div');
                    grid.className = 'grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-lg';

                    const createRow = (label, val, min, fn) => {
                        const r = document.createElement('div'); r.className = 'flex justify-between items-center';
                        r.innerHTML = `<span class="text-sm text-slate-600 font-medium">${label}</span>`;
                        const ctrls = document.createElement('div');
                        ctrls.className = 'flex items-center gap-2 bg-white rounded border border-gray-200 p-1';
                        const btnM = document.createElement('button'); btnM.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-slate-600 font-bold';
                        btnM.textContent = '-';
                        btnM.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (val > min) fn(val - 1); };
                        const txt = document.createElement('span'); txt.className = 'w-6 text-center text-sm font-bold'; txt.textContent = val;
                        const btnP = document.createElement('button'); btnP.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-slate-600 font-bold';
                        btnP.textContent = '+';
                        btnP.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fn(val + 1); };
                        ctrls.append(btnM, txt, btnP); r.appendChild(ctrls); return r;
                    };

                    grid.appendChild(createRow('Adults', room.adults, 1, (v) => { room.adults = v; modalPkgManager.render(); }));
                    grid.appendChild(createRow('Children', room.children.length, 0, (v) => {
                        const d = v - room.children.length;
                        if (d > 0) for (let i = 0; i < d; i++) room.children.push(8);
                        else room.children.splice(d);
                        modalPkgManager.render();
                    }));
                    grid.appendChild(createRow('Infants', room.infants, 0, (v) => { room.infants = v; modalPkgManager.render(); }));

                    if (room.children.length > 0) {
                        const ages = document.createElement('div'); ages.className = 'grid grid-cols-2 gap-2 mt-2';
                        room.children.forEach((age, ai) => {
                            const wrap = document.createElement('div');
                            wrap.innerHTML = `<label class="text-[10px] block text-gray-500">Child ${ai + 1}</label>`;
                            const sel = document.createElement('select'); sel.className = 'w-full p-1 text-xs border rounded';
                            for (let k = 2; k <= 17; k++) {
                                const o = document.createElement('option'); o.value = k; o.textContent = k; if (k === age) o.selected = true;
                                sel.appendChild(o);
                            }
                            sel.onchange = (e) => room.children[ai] = parseInt(e.target.value);
                            wrap.appendChild(sel); ages.appendChild(wrap);
                        });
                        grid.appendChild(ages);
                    }
                    roomEl.appendChild(grid);
                    container.appendChild(roomEl);
                });
                const ta = modalPkgTravelerState.reduce((a, b) => a + b.adults, 0);
                const tk = modalPkgTravelerState.reduce((a, b) => a + b.children.length + b.infants, 0);
                const tr = modalPkgTravelerState.length;
                summary.value = `${tr} Room${tr > 1 ? 's' : ''}, ${ta + tk} Pax`;
            }
        };

        const modalTrig = document.getElementById('modal-traveler-trigger');
        const modalPop = document.getElementById('modal-traveler-popover');
        if (modalTrig && modalPop) {
            modalTrig.addEventListener('click', (e) => { e.stopPropagation(); modalPop.classList.toggle('hidden'); });
            modalPop.addEventListener('click', e => e.stopPropagation());

            const btnAdd = document.getElementById('modal-btn-add-room');
            if (btnAdd) btnAdd.onclick = (e) => { e.stopPropagation(); modalPkgTravelerState.push({ id: Date.now(), adults: 1, children: [], infants: 0 }); modalPkgManager.render(); };

            const btnDone = document.getElementById('modal-btn-done-travelers');
            if (btnDone) btnDone.onclick = (e) => { e.stopPropagation(); modalPop.classList.add('hidden'); };

            document.addEventListener('click', (e) => { if (!modalTrig.contains(e.target) && !modalPop.contains(e.target)) modalPop.classList.add('hidden'); });
            modalPkgManager.render();
        }

        // --- Flatpickr ---
        const modalFp = flatpickr('#modal-dates', { mode: "range", dateFormat: "Y-m-d", minDate: "today" });

        // --- Open/Close Logic ---
        // --- Open/Close Logic handled in HTML now to ensure reliability ---
        /* 
           Logic moved to flyadeal_holidays.html script block to prevent timing issues 
           and ensure global availability before DOMContentLoaded if needed.
        */

        // --- Search Handler ---
        document.getElementById('modal-search-btn').onclick = () => {
            const dates = document.getElementById('modal-dates').value.split(' to ');
            const def = getDefaultDates();
            const originCode = getCode('modal-origin', 'SIN');
            const destCode = document.getElementById('modal-dest').dataset.code || 'DXB';

            const travelersApi = [];
            modalPkgTravelerState.forEach((room, rIndex) => {
                for (let i = 0; i < room.adults; i++) travelersApi.push({ type: 'adult', age: 30, room: rIndex + 1 });
                room.children.forEach(age => travelersApi.push({ type: 'child', age: age, room: rIndex + 1 }));
                for (let i = 0; i < room.infants; i++) travelersApi.push({ type: 'infant', age: 1, room: rIndex + 1 });
            });

            const cabinVal = document.getElementById('modal-cabin-val').textContent;

            go({
                process: 'bundle',
                package_id: PACKAGE_CONFIG_ID,
                place_type: 'airport',
                place_id: destCode,
                is_separate: false,
                expectation: JSON.stringify({
                    fl_cabin_class: cabinVal,
                    fl_departure_date: dates[0] || def.startStr,
                    fl_return_date: dates[1] || def.endStr,
                    fl_round_trip: true,
                    start_place_code: originCode,
                    start_place_type: 'airport_code',
                    des_code: destCode,
                    des_type: 'airport_code',
                    ht_des_code: destCode,
                    ht_des_type: 'airport_code',
                    ht_checkin_date: dates[0] || def.startStr,
                    ht_checkout_date: dates[1] || def.endStr,
                    ht_des_type: 'airport_code',
                    is_separate: false,
                    stars: null
                }),
                travelers: JSON.stringify(travelersApi)
            }, null, true);
        };
    }
});
