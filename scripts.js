window.APP_CURRENCY = 'USD'; // Default Currency
window.APP_LANGUAGE = 'en-US'; // Default Language

// Global definition to ensure it works regardless of load order or other script failures
let _dealModalCloseTimer = null;

window.openDealModal = function (city, code) {
    console.log("Opening Deal Modal (Exclusive) for:", city, code);
    const dealModal = document.getElementById('deal-modal');
    if (!dealModal) {
        console.error("Deal modal element not found!");
        return;
    }

    // Cancel any pending close animation to prevent race condition
    if (_dealModalCloseTimer) {
        clearTimeout(_dealModalCloseTimer);
        _dealModalCloseTimer = null;
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

    // Lock body scroll — overflow:hidden on both html & body prevents
    // background scroll on all browsers including iOS Safari, without
    // the visual jump caused by position:fixed
    document.documentElement.classList.add('modal-open');

    // Force visible
    dealModal.style.display = 'block';
    dealModal.classList.remove('hidden');

    // Use double-rAF to guarantee the browser has painted display:block
    // before starting opacity/scale transitions (10ms setTimeout is unreliable on mobile)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (modalBackdrop) modalBackdrop.classList.remove('opacity-0');
            if (modalContent) modalContent.classList.remove('opacity-0', 'scale-95');
        });
    });
};

// Close logic
window.closeDealModal = function () {
    const dealModal = document.getElementById('deal-modal');
    const modalBackdrop = document.getElementById('deal-modal-backdrop');
    const modalContent = document.getElementById('deal-modal-content');

    if (modalBackdrop) modalBackdrop.classList.add('opacity-0');
    if (modalContent) modalContent.classList.add('opacity-0', 'scale-95');

    // Unlock body scroll
    document.documentElement.classList.remove('modal-open');

    if (dealModal) {
        _dealModalCloseTimer = setTimeout(() => {
            dealModal.classList.add('hidden');
            dealModal.style.display = ''; // Reset inline style
            _dealModalCloseTimer = null;
        }, 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('deal-close-btn');
    const modalBackdrop = document.getElementById('deal-modal-backdrop');

    if (closeBtn) closeBtn.onclick = closeDealModal;
    if (modalBackdrop) modalBackdrop.onclick = closeDealModal;

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
    // Scope to #search-panel only — do NOT select the modal's .search-form
    const forms = document.querySelectorAll('#search-panel .search-form');

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
    const url = new URL(`${API_BASE_URL}/places`);
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
    // More results for airport searches to accommodate multi-airport city grouping
    url.searchParams.append("per_page", (type === 'airport_code' || type === 'any' || type === 'tour_region') ? "30" : "20");
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
                cityCode: p.location?.city_code || null,
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

// ─── Autocomplete Grouping & Sorting ───────────────────────────────────────

function groupResults(results, fieldType, query) {
    const q = (query || '').trim().toLowerCase();
    if (fieldType === 'airport_code') {
        return groupAirportResults(results, q);
    } else if (fieldType === 'any') {
        return groupHotelDestResults(results, q);
    } else if (fieldType === 'hotel') {
        return groupTransferHotelResults(results);
    } else if (fieldType === 'tour_region') {
        return groupTourResults(results, q);
    }
    // Default: single section, no headers
    return [{ label: null, items: results.map(r => ({ ...r, indent: 0 })) }];
}

// Airport passenger traffic rank — top ~200 airports worldwide by annual passengers.
// Used to sort airports within multi-airport cities by importance (lower rank = busier).
// Source: ACI World / publicly available airport traffic statistics.
const AIRPORT_TRAFFIC_RANK = {
    // Rank 1-20: Global mega-hubs
    ATL: 1, DXB: 2, DFW: 3, LHR: 4, HND: 5,
    DEN: 6, IST: 7, LAX: 8, ORD: 9, CDG: 10,
    DEL: 11, JFK: 12, AMS: 13, SIN: 14, CAN: 15,
    FRA: 16, ICN: 17, PVG: 18, SEA: 19, PEK: 20,
    // Rank 21-50: Major international hubs
    BKK: 21, SFO: 22, MUC: 23, MAD: 24, BCN: 25,
    MEX: 26, KUL: 27, BOM: 28, DOH: 29, SYD: 30,
    EWR: 31, CGK: 32, YYZ: 33, JED: 34, LAS: 35,
    CLT: 36, MIA: 37, MCO: 38, SAW: 39, FCO: 40,
    PHX: 41, IAH: 42, SZX: 43, CTU: 44, TPE: 45,
    LGW: 46, BLR: 47, MSP: 48, DTW: 49, NRT: 50,
    // Rank 51-100: Major national/regional airports
    MNL: 51, HKG: 52, BOS: 53, FLL: 54, SHA: 55,
    MEL: 56, DME: 57, SVO: 58, OSL: 59, VIE: 60,
    ZRH: 61, CPH: 62, DUS: 63, MAN: 64, DUB: 65,
    BRU: 66, HEL: 67, LIS: 68, ARN: 69, ATH: 70,
    PMI: 71, AGP: 72, ORY: 73, ALC: 74, EDI: 75,
    GLA: 76, HAM: 77, STN: 78, WAW: 79, PRG: 80,
    BUD: 81, OTP: 82, BGY: 83, CIA: 84, TXL: 85,
    BER: 86, SXF: 87, LTN: 88, LCY: 89, BHX: 90,
    NCL: 91, BFS: 92, LBA: 93, EMA: 94, STR: 95,
    CGN: 96, TLS: 97, NCE: 98, LYS: 99, MRS: 100,
    // Rank 101-150: Secondary hubs & busy regionals
    GIG: 101, GRU: 102, EZE: 103, BOG: 104, SCL: 105,
    LIM: 106, PTY: 107, SJO: 108, CUN: 109, SJU: 110,
    AUH: 111, SHJ: 112, DWC: 113, RUH: 114, DMM: 115,
    BAH: 116, MCT: 117, AMM: 118, CAI: 119, CMN: 120,
    JNB: 121, CPT: 122, NBO: 123, ADD: 124, LOS: 125,
    ACC: 126, DAR: 127, MRU: 128, HYD: 129, MAA: 130,
    CCU: 131, COK: 132, GOI: 133, AMD: 134, PNQ: 135,
    DMK: 136, HKT: 137, CNX: 138, SGN: 139, HAN: 140,
    CXR: 141, DAD: 142, REP: 143, PNH: 144, RGN: 145,
    MLE: 146, CMB: 147, KTM: 148, ISB: 149, KHI: 150,
    // Rank 151-200: Tertiary airports & multi-city fills
    AKL: 151, CHC: 152, WLG: 153, BNE: 154, PER: 155,
    ADL: 156, OOL: 157, CNS: 158, CBR: 159, HBA: 160,
    NAN: 161, PPT: 162, SUV: 163, KIX: 164, NGO: 165,
    FUK: 166, CTS: 167, ITM: 168, OKA: 169, GMP: 170,
    PUS: 171, CJU: 172, MFM: 173, TSA: 174, RMQ: 175,
    KHH: 176, PKX: 177, XIY: 178, CKG: 179, KMG: 180,
    SEN: 181, BQH: 182, ABZ: 183, INV: 184, SOU: 185,
    EXT: 186, CWL: 187, JER: 188, GCI: 189, IOM: 190,
    MXP: 191, VCE: 192, NAP: 193, PSA: 194, BLQ: 195,
    TRN: 196, CTA: 197, PMO: 198, BRI: 199, OLB: 200
};

// Destination popularity rank — top ~2,000 destinations worldwide.
// Composite of GeoNames population + Wikidata sitelink count (global prominence).
// Generated by: node scripts/generate-destination-ranks.js
// Generated on: 2026-02-19
// Lower rank = more popular destination. Key format: "asciiname:CC"
const DESTINATION_POPULARITY_RANK = {
    // Rank 1-50: Global mega-destinations
    "beijing:CN": 1, "moscow:RU": 2, "istanbul:TR": 3, "london:GB": 4, "tokyo:JP": 5,
    "new york city:US": 6, "sicily:IT": 7, "cape town:ZA": 8, "ho chi minh city:VN": 9, "shanghai:CN": 10,
    "bogota:CO": 11, "mexico city:MX": 12, "cairo:EG": 13, "seoul:KR": 14, "jakarta:ID": 15,
    "saint petersburg:RU": 16, "tuscany:IT": 17, "santiago:CL": 18, "baghdad:IQ": 19, "sydney:AU": 20,
    "bangkok:TH": 21, "berlin:DE": 22, "mumbai:IN": 23, "tehran:IR": 24, "los angeles:US": 25,
    "dhaka:BD": 26, "kinshasa:CD": 27, "lima:PE": 28, "nairobi:KE": 29, "karachi:PK": 30,
    "delhi:IN": 31, "buenos aires:AR": 32, "rome:IT": 33, "ankara:TR": 34, "kyiv:UA": 35,
    "chicago:US": 36, "kabul:AF": 37, "havana:CU": 38, "hanoi:VN": 39, "paris:FR": 40,
    "melbourne:AU": 41, "taipei:TW": 42, "lagos:NG": 43, "dubai:AE": 44, "sapporo:JP": 45,
    "johannesburg:ZA": 46, "kolkata:IN": 47, "caracas:VE": 48, "addis ababa:ET": 49, "toronto:CA": 50,
    // Rank 51-200: Major international destinations
    "wuhan:CN": 51, "riyadh:SA": 52, "sardinia:IT": 53, "brasilia:BR": 54, "warsaw:PL": 55,
    "vienna:AT": 56, "guangzhou:CN": 57, "alexandria:EG": 58, "phnom penh:KH": 59, "osaka:JP": 60,
    "bucharest:RO": 61, "budapest:HU": 62, "abuja:NG": 63, "algiers:DZ": 64, "hamburg:DE": 65,
    "kyoto:JP": 66, "goa:IN": 67, "minsk:BY": 68, "luanda:AO": 69, "stockholm:SE": 70,
    "beirut:LB": 71, "houston:US": 72, "bengaluru:IN": 73, "okinawa:JP": 74, "quito:EC": 75,
    "damascus:SY": 76, "accra:GH": 77, "pretoria:ZA": 78, "yokohama:JP": 79, "makkah:SA": 80,
    "tashkent:UZ": 81, "dakar:SN": 82, "jeddah:SA": 83, "mauritius:MU": 84, "chennai:IN": 85,
    "izmir:TR": 86, "manila:PH": 87, "abidjan:CI": 88, "mogadishu:SO": 89, "montreal:CA": 90,
    "khartoum:SD": 91, "ouagadougou:BF": 92, "philadelphia:US": 93, "brisbane:AU": 94, "abu dhabi:AE": 95,
    "perth:AU": 96, "fes:MA": 97, "kuala lumpur:MY": 98, "brazzaville:CG": 99, "lahore:PK": 100,
    "lusaka:ZM": 101, "milan:IT": 102, "yangon:MM": 103, "sanaa:YE": 104, "rabat:MA": 105,
    "kampala:UG": 106, "casablanca:MA": 107, "lome:TG": 108, "belgrade:RS": 109, "ahmedabad:IN": 110,
    "prague:CZ": 111, "xi'an:CN": 112, "nagoya:JP": 113, "kathmandu:NP": 114, "phoenix:US": 115,
    "hyderabad:IN": 116, "nanjing:CN": 117, "dar es salaam:TZ": 118, "copenhagen:DK": 119, "conakry:GN": 120,
    "la paz:BO": 121, "montevideo:UY": 122, "marrakesh:MA": 123, "busan:KR": 124, "zhengzhou:CN": 125,
    "harare:ZW": 126, "oslo:NO": 127, "chengdu:CN": 128, "asuncion:PY": 129, "sofia:BG": 130,
    "jaipur:IN": 131, "amman:JO": 132, "santo domingo:DO": 133, "chattogram:BD": 134, "almaty:KZ": 135,
    "tripoli:LY": 136, "jerusalem:IL": 137, "guadalajara:MX": 138, "harbin:CN": 139, "dublin:IE": 140,
    "tbilisi:GE": 141, "brussels:BE": 142, "aleppo:SY": 143, "kharkiv:UA": 144, "monrovia:LR": 145,
    "bali:ID": 146, "dallas:US": 147, "hangzhou:CN": 148, "bursa:TR": 149, "ottawa:CA": 150,
    "fiji:FJ": 151, "durban:ZA": 152, "auckland:NZ": 153, "novosibirsk:RU": 154, "san diego:US": 155,
    "palawan:PH": 156, "antananarivo:MG": 157, "n'djamena:TD": 158, "adelaide:AU": 159, "pune:IN": 160,
    "niamey:NE": 161, "yaounde:CM": 162, "madinah:SA": 163, "maputo:MZ": 164, "san antonio:US": 165,
    "kazan:RU": 166, "cancun:MX": 167, "krasnodar:RU": 168, "brooklyn:US": 169, "shenyang:CN": 170,
    "yekaterinburg:RU": 171, "san francisco:US": 172, "ueruemqi:CN": 173, "birmingham:GB": 174, "amsterdam:NL": 175,
    "kigali:RW": 176, "hiroshima:JP": 177, "surabaya:ID": 178, "odesa:UA": 179, "lucknow:IN": 180,
    "manhattan:US": 181, "giza:EG": 182, "isfahan:IR": 183, "adana:TR": 184, "washington:US": 185,
    "marseille:FR": 186, "calgary:CA": 187, "qingdao:CN": 188, "nouakchott:MR": 189, "kobe:JP": 190,
    "riga:LV": 191, "nizhniy novgorod:RU": 192, "kunming:CN": 193, "gaziantep:TR": 194, "austin:US": 195,
    "ulan bator:MN": 196, "guayaquil:EC": 197, "surat:IN": 198, "macau:MO": 199, "athens:GR": 200,
    // Rank 201-500: Well-known destinations
    "helsinki:FI": 201, "lilongwe:MW": 202, "agra:IN": 203, "fukuoka:JP": 204, "peshawar:PK": 205,
    "mashhad:IR": 206, "changchun:CN": 207, "volgograd:RU": 208, "antalya:TR": 209, "montenegro:ME": 210,
    "krakow:PL": 211, "dalian:CN": 212, "bhopal:IN": 213, "rotterdam:NL": 214, "tabriz:IR": 215,
    "seattle:US": 216, "sarajevo:BA": 217, "tijuana:MX": 218, "kingston:JM": 219, "kanpur:IN": 220,
    "indianapolis:US": 221, "rostov-na-donu:RU": 222, "mosul:IQ": 223, "san jose:US": 224, "jinan:CN": 225,
    "zagreb:HR": 226, "columbus:US": 227, "omsk:RU": 228, "provence:FR": 229, "denver:US": 230,
    "nha trang:VN": 231, "samara:RU": 232, "medan:ID": 233, "suzhou:CN": 234, "fuzhou:CN": 235,
    "ashgabat:TM": 236, "patna:IN": 237, "boston:US": 238, "queens:US": 239, "nay pyi taw:MM": 240,
    "frankfurt am main:DE": 241, "varanasi:IN": 242, "libreville:GA": 243, "cordoba:AR": 244, "tegucigalpa:HN": 245,
    "ufa:RU": 246, "tunis:TN": 247, "chelyabinsk:RU": 248, "bangui:CF": 249, "lviv:UA": 250,
    "dnipro:UA": 251, "las vegas:US": 252, "muscat:OM": 253, "donetsk:UA": 254, "jacksonville:US": 255,
    "chisinau:MD": 256, "edmonton:CA": 257, "rawalpindi:PK": 258, "kayseri:TR": 259, "konya:TR": 260,
    "shiraz:IR": 261, "freetown:SL": 262, "faisalabad:PK": 263, "nagpur:IN": 264, "dodoma:TZ": 265,
    "lanzhou:CN": 266, "hefei:CN": 267, "vancouver:CA": 268, "saratov:RU": 269, "kaohsiung:TW": 270,
    "bujumbura:BI": 271, "perm:RU": 272, "the bronx:US": 273, "islamabad:PK": 274, "detroit:US": 275,
    "fort worth:US": 276, "quezon city:PH": 277, "krasnoyarsk:RU": 278, "vilnius:LT": 279, "puebla:MX": 280,
    "indore:IN": 281, "erbil:IQ": 282, "duesseldorf:DE": 283, "lisbon:PT": 284, "mombasa:KE": 285,
    "glasgow:GB": 286, "sendai:JP": 287, "monterrey:MX": 288, "taiyuan:CN": 289, "wroclaw:PL": 290,
    "charlotte:US": 291, "diyarbakir:TR": 292, "nashville:US": 293, "basrah:IQ": 294, "voronezh:RU": 295,
    "amritsar:IN": 296, "nanning:CN": 297, "oklahoma city:US": 298, "manchester:GB": 299, "dresden:DE": 300,
    "vladivostok:RU": 301, "guiyang:CN": 302, "goeteborg:SE": 303, "kumasi:GH": 304, "prayagraj:IN": 305,
    "chandigarh:IN": 306, "atlanta:US": 307, "lyon:FR": 308, "douala:CM": 309, "colombo:LK": 310,
    "zapopan:MX": 311, "aden:YE": 312, "haikou:CN": 313, "asmara:ER": 314, "palembang:ID": 315,
    "maracaibo:VE": 316, "edinburgh:GB": 317, "winnipeg:CA": 318, "gwangju:KR": 319, "djibouti:DJ": 320,
    "portland:US": 321, "baltimore:US": 322, "dongguan:CN": 323, "bremen:DE": 324, "miami:US": 325,
    "rosario:AR": 326, "sacramento:US": 327, "cusco:PE": 328, "kano:NG": 329, "santa cruz de la sierra:BO": 330,
    "memphis:US": 331, "xiamen:CN": 332, "madurai:IN": 333, "samarkand:UZ": 334, "coimbatore:IN": 335,
    "lodz:PL": 336, "zaporizhzhya:UA": 337, "toulouse:FR": 338, "liverpool:GB": 339, "vadodara:IN": 340,
    "skopje:MK": 341, "pristina:XK": 342, "qom:IR": 343, "tirana:AL": 344, "leipzig:DE": 345,
    "foshan:CN": 346, "arequipa:PE": 347, "oran:DZ": 348, "the hague:NL": 349, "gqeberha:ZA": 350,
    "gdansk:PL": 351, "mandalay:MM": 352, "irkutsk:RU": 353, "el paso:US": 354, "milwaukee:US": 355,
    "xining:CN": 356, "luxor:EG": 357, "bloemfontein:ZA": 358, "santiago de queretaro:MX": 359, "karaj:IR": 360,
    "sevastopol:UA": 361, "bratislava:SK": 362, "sharjah:AE": 363, "homs:SY": 364, "semarang:ID": 365,
    "ciudad juarez:MX": 366, "quebec:CA": 367, "albuquerque:US": 368, "srinagar:IN": 369, "san salvador:SV": 370,
    "hohhot:CN": 371, "nashik:IN": 372, "ludhiana:IN": 373, "tyumen:RU": 374, "tel aviv:IL": 375,
    "davao:PH": 376, "bhubaneswar:IN": 377, "karbala:IQ": 378, "khabarovsk:RU": 379, "poznan:PL": 380,
    "tallinn:EE": 381, "thiruvananthapuram:IN": 382, "shenzhen:CN": 383, "ibadan:NG": 384, "visakhapatnam:IN": 385,
    "yaroslavl:RU": 386, "leeds:GB": 387, "benghazi:LY": 388, "cotonou:BJ": 389, "louisville:US": 390,
    "ningbo:CN": 391, "kaliningrad:RU": 392, "quetta:PK": 393, "shymkent:KZ": 394, "bissau:GW": 395,
    "luoyang:CN": 396, "ranchi:IN": 397, "agadir:MA": 398, "sao paulo:BR": 399, "makhachkala:RU": 400,
    "acapulco de juarez:MX": 401, "tianjin:CN": 402, "gwalior:IN": 403, "raipur:IN": 404, "chiba:JP": 405,
    "astrakhan:RU": 406, "wuxi:CN": 407, "honolulu:US": 408, "jodhpur:IN": 409, "guwahati:IN": 410,
    "mysuru:IN": 411, "ulyanovsk:RU": 412, "sheffield:GB": 413, "bekasi:ID": 414, "multan:PK": 415,
    "kitakyushu:JP": 416, "tainan:TW": 417, "tucson:US": 418, "bristol:GB": 419, "leon de los aldama:MX": 420,
    "lubumbashi:CD": 421, "kochi:IN": 422, "izhevsk:RU": 423, "hong kong:HK": 424, "rio de janeiro:BR": 425,
    "singapore:SG": 426, "canberra:AU": 427, "nice:FR": 428, "fresno:US": 429, "tomsk:RU": 430,
    "barnaul:RU": 431, "wellington:NZ": 432, "bien hoa:VN": 433, "trujillo:PE": 434, "hyderabad:PK": 435,
    "juba:SS": 436, "kirkuk:IQ": 437, "aurangabad:IN": 438, "ahvaz:IR": 439, "eskisehir:TR": 440,
    "windhoek:NA": 441, "raleigh:US": 442, "mexicali:MX": 443, "denpasar:ID": 444, "bao'an:CN": 445,
    "merida:MX": 446, "suwon:KR": 447, "faridabad:IN": 448, "dammam:SA": 449, "guilin:CN": 450,
    "tolyatti:RU": 451, "panama:PA": 452, "meerut:IN": 453, "omaha:US": 454, "vijayawada:IN": 455,
    "jamshedpur:IN": 456, "yinchuan:CN": 457, "erzurum:TR": 458, "zhuhai:CN": 459, "bamako:ML": 460,
    "thane:IN": 461, "new taipei city:TW": 462, "new territories:HK": 463, "shijiazhuang:CN": 464, "herat:AF": 465,
    "zhongshan:CN": 466, "shantou:CN": 467, "astana:KZ": 468, "orenburg:RU": 469, "johor bahru:MY": 470,
    "new orleans:US": 471, "puyang:CN": 472, "tangshan:CN": 473, "kandahar:AF": 474, "lueliang:CN": 475,
    "madrid:ES": 476, "pyongyang:KP": 477, "navi mumbai:IN": 478, "minneapolis:US": 479, "kansas city:US": 480,
    "cardiff:GB": 481, "ryazan':RU": 482, "port said:EG": 483, "jabalpur:IN": 484, "kumamoto:JP": 485,
    "doha:QA": 486, "changsha:CN": 487, "port harcourt:NG": 488, "kryvyy rih:UA": 489, "incheon:KR": 490,
    "szczecin:PL": 491, "taichung:TW": 492, "padang:ID": 493, "rajkot:IN": 494, "callao:PE": 495,
    "thanh hoa:VN": 496, "malatya:TR": 497, "new delhi:IN": 498, "oakland:US": 499, "chihuahua:MX": 500,
    // Rank 501-1000: Notable destinations
    "brno:CZ": 501, "suez:EG": 502, "belo horizonte:BR": 503, "salvador:BR": 504, "long beach:US": 505,
    "gazipur:BD": 506, "haiphong:VN": 507, "tangerang:ID": 508, "gold coast:AU": 509, "colorado springs:US": 510,
    "belfast:GB": 511, "omdurman:SD": 512, "ghaziabad:IN": 513, "latakia:SY": 514, "kemerovo:RU": 515,
    "tampa:US": 516, "christchurch:NZ": 517, "cheboksary:RU": 518, "valencia:VE": 519, "kowloon:HK": 520,
    "sochi:RU": 521, "maseru:LS": 522, "penza:RU": 523, "malmoe:SE": 524, "karagandy:KZ": 525,
    "gujranwala:PK": 526, "bandung:ID": 527, "hamilton:CA": 528, "fortaleza:BR": 529, "cali:CO": 530,
    "daegu:KR": 531, "meknes:MA": 532, "gaza:PS": 533, "nanchang:CN": 534, "lipetsk:RU": 535,
    "cleveland:US": 536, "luhansk:UA": 537, "benin city:NG": 538, "tiruchirappalli:IN": 539, "wenzhou:CN": 540,
    "tula:RU": 541, "pietermaritzburg:ZA": 542, "kagoshima:JP": 543, "antofagasta:CL": 544, "blantyre:MW": 545,
    "howrah:IN": 546, "san juan:PR": 547, "kursk:RU": 548, "virginia beach:US": 549, "manaus:BR": 550,
    "baotou:CN": 551, "depok:ID": 552, "newcastle:AU": 553, "qingyang:CN": 554, "morelia:MX": 555,
    "mersin:TR": 556, "bogor:ID": 557, "valparaiso:CL": 558, "da nang:VN": 559, "san jose:CR": 560,
    "jalandhar:IN": 561, "van:TR": 562, "staten island:US": 563, "mississauga:CA": 564, "al ain city:AE": 565,
    "homyel':BY": 566, "tulsa:US": 567, "mbuji-mayi:CD": 568, "changzhou:CN": 569, "al mawsil al jadidah:IQ": 570,
    "rasht:IR": 571, "al basrah al qadimah:IQ": 572, "mykolayiv:UA": 573, "tver:RU": 574, "lianyungang:CN": 575,
    "medellin:CO": 576, "kirov:RU": 577, "mesa:US": 578, "nantes:FR": 579, "mazar-e sharif:AF": 580,
    "yantai:CN": 581, "wichita:US": 582, "kashgar:CN": 583, "kermanshah:IR": 584, "thessaloniki:GR": 585,
    "kaifeng:CN": 586, "barquisimeto:VE": 587, "mar del plata:AR": 588, "aligarh:IN": 589, "curitiba:BR": 590,
    "ordos:CN": 591, "sanliurfa:TR": 592, "camayenne:GN": 593, "sulaymaniyah:IQ": 594, "orumiyeh:IR": 595,
    "ajmer:IN": 596, "hermosillo:MX": 597, "quanzhou:CN": 598, "hargeysa:SO": 599, "andijon:UZ": 600,
    "pointe-noire:CG": 601, "bulawayo:ZW": 602, "orlando:US": 603, "kisangani:CD": 604, "malacca:MY": 605,
    "leicester:GB": 606, "jilin:CN": 607, "pekanbaru:ID": 608, "stavropol':RU": 609, "ljubljana:SI": 610,
    "kozhikode:IN": 611, "kota:IN": 612, "iasi:RO": 613, "strasbourg:FR": 614, "katowice:PL": 615,
    "bayan nur:CN": 616, "maiduguri:NG": 617, "pittsburgh:US": 618, "hamadan:IR": 619, "aguascalientes:MX": 620,
    "simferopol:UA": 621, "bryansk:RU": 622, "smolensk:RU": 623, "arusha:TZ": 624, "lublin:PL": 625,
    "kerman:IR": 626, "huizhou:CN": 627, "datong:CN": 628, "novokuznetsk:RU": 629, "mwanza:TZ": 630,
    "baoding:CN": 631, "ta'if:SA": 632, "dhanbad:IN": 633, "yazd:IR": 634, "khulna:BD": 635,
    "fushun:CN": 636, "kanazawa:JP": 637, "sholapur:IN": 638, "ar raqqah:SY": 639, "yogyakarta:ID": 640,
    "mangaluru:IN": 641, "anaheim:US": 642, "ivanovo:RU": 643, "rasapudipalem:IN": 644, "vladimir:RU": 645,
    "caloocan:PH": 646, "saltillo:MX": 647, "barcelona:ES": 648, "kallakurichi:IN": 649, "cincinnati:US": 650,
    "changshu:CN": 651, "huainan:CN": 652, "najaf:IQ": 653, "aswan:EG": 654, "anshan:CN": 655,
    "ipoh:MY": 656, "bergen:NO": 657, "culiacan:MX": 658, "vinnytsya:UA": 659, "vitebsk:BY": 660,
    "bakersfield:US": 661, "wiesbaden:DE": 662, "arkhangel'sk:RU": 663, "yangzhou:CN": 664, "jiangmen:CN": 665,
    "nottingham:GB": 666, "bordeaux:FR": 667, "agartala:IN": 668, "toluca:MX": 669, "port moresby:PG": 670,
    "plovdiv:BG": 671, "hamah:SY": 672, "saint paul:US": 673, "sale:MA": 674, "recife:BR": 675,
    "namangan:UZ": 676, "arlington:US": 677, "kaduna:NG": 678, "yancheng:CN": 679, "aktobe:KZ": 680,
    "kaunas:LT": 681, "mannheim:DE": 682, "varna:BG": 683, "yamoussoukro:CI": 684, "coventry:GB": 685,
    "belgorod:RU": 686, "pimpri-chinchwad:IN": 687, "anchorage:US": 688, "constantine:DZ": 689, "pokhara:NP": 690,
    "hrodna:BY": 691, "batman:TR": 692, "bikaner:IN": 693, "grozny:RU": 694, "bydgoszcz:PL": 695,
    "batam:ID": 696, "matsuyama:JP": 697, "wanzhou:CN": 698, "salta:AR": 699, "kawasaki:JP": 700,
    "santa marta:CO": 701, "goiania:BR": 702, "nassau:BS": 703, "reykjavik:IS": 704, "brugge:BE": 705,
    "maldives:MV": 706, "luzern:CH": 707, "cannes:FR": 708, "aruba:AW": 709, "bermuda:BM": 710,
    "dubrovnik:HR": 711, "victoria:SC": 712, "cinque terre:IT": 713, "chaozhou:CN": 714, "kananga:CD": 715,
    "lincoln:US": 716, "porto-novo:BJ": 717, "gurugram:IN": 718, "kota kinabalu:MY": 719, "taiz:YE": 720,
    "haifa:IL": 721, "samsun:TR": 722, "st. louis:US": 723, "malang:ID": 724, "soweto:ZA": 725,
    "san luis potosi:MX": 726, "changwon:KR": 727, "san miguel de tucuman:AR": 728, "kaluga:RU": 729, "brest:BY": 730,
    "nantong:CN": 731, "karlsruhe:DE": 732, "samarinda:ID": 733, "newcastle upon tyne:GB": 734, "can tho:VN": 735,
    "mahilyow:BY": 736, "merida:VE": 737, "belem:BR": 738, "porto alegre:BR": 739, "tetouan:MA": 740,
    "london:CA": 741, "daejeon:KR": 742, "arhus:DK": 743, "sialkot:PK": 744, "zahedan:IR": 745,
    "murmansk:RU": 746, "saransk:RU": 747, "udaipur:IN": 748, "puducherry:IN": 749, "ujjain:IN": 750,
    "cluj-napoca:RO": 751, "arak:IR": 752, "cartagena:CO": 753, "guntur:IN": 754, "elazig:TR": 755,
    "madison:US": 756, "naberezhnyye chelny:RU": 757, "bareilly:IN": 758, "baoji:CN": 759, "kahramanmaras:TR": 760,
    "zibo:CN": 761, "liuzhou:CN": 762, "brampton:CA": 763, "bradford:GB": 764, "bukhara:UZ": 765,
    "papeete:PF": 766, "surakarta:ID": 767, "huambo:AO": 768, "lexington:US": 769, "qiqihar:CN": 770,
    "gaborone:BW": 771, "kherson:UA": 772, "podgorica:ME": 773, "veracruz:MX": 774, "sanya:CN": 775,
    "ganja:AZ": 776, "osh:KG": 777, "corfu:GR": 778, "chita:RU": 779, "wuhu:CN": 780,
    "victoria:CA": 781, "shah alam:MY": 782, "ardabil:IR": 783, "macapa:BR": 784, "assiut:EG": 785,
    "oujda:MA": 786, "makassar:ID": 787, "lexington-fayette:US": 788, "vologda:RU": 789, "cuttack:IN": 790,
    "vladikavkaz:RU": 791, "concepcion:CL": 792, "bialystok:PL": 793, "pontianak:ID": 794, "newark:US": 795,
    "chernihiv:UA": 796, "zhanjiang:CN": 797, "amravati:IN": 798, "east jerusalem:PS": 799, "aba:NG": 800,
    "jammu:IN": 801, "alanya:TR": 802, "handan:CN": 803, "nanyang:CN": 804, "ostrava:CZ": 805,
    "yichang:CN": 806, "warangal:IN": 807, "jos:NG": 808, "saitama:JP": 809, "gorakhpur:IN": 810,
    "montpellier:FR": 811, "sumqayit:AZ": 812, "lille:FR": 813, "weifang:CN": 814, "salem:IN": 815,
    "tarsus:TR": 816, "ganzhou:CN": 817, "kuching:MY": 818, "gifu:JP": 819, "zanzibar:TZ": 820,
    "santa ana:US": 821, "bahawalpur:PK": 822, "cabinda:AO": 823, "southampton:GB": 824, "tabuk:SA": 825,
    "victoria de durango:MX": 826, "jamnagar:IN": 827, "shaoxing:CN": 828, "zhaoqing:CN": 829, "orel:RU": 830,
    "swansea:GB": 831, "magnitogorsk:RU": 832, "aurora:US": 833, "poltava:UA": 834, "bandar abbas:IR": 835,
    "zarqa:JO": 836, "al hudaydah:YE": 837, "ciudad nezahualcoyotl:MX": 838, "hobart:AU": 839, "bandar lampung:ID": 840,
    "abadan:IR": 841, "linyi:CN": 842, "yixing:CN": 843, "riverside:US": 844, "himeji:JP": 845,
    "budta:PH": 846, "corpus christi:US": 847, "buffalo:US": 848, "bouake:CI": 849, "shiyan:CN": 850,
    "petrozavodsk:RU": 851, "munich:DE": 852, "charleston:US": 853, "chiang mai:TH": 854, "bobo-dioulasso:BF": 855,
    "kota bharu:MY": 856, "goyang-si:KR": 857, "reading:GB": 858, "savannah:US": 859, "benguela:AO": 860,
    "dandong:CN": 861, "nukus:UZ": 862, "bodrum:TR": 863, "oita:JP": 864, "annaba:DZ": 865,
    "denizli:TR": 866, "gaya:IN": 867, "aqaba:JO": 868, "xuzhou:CN": 869, "hamhung:KP": 870,
    "ra's bayrut:LB": 871, "paramaribo:SR": 872, "heshan:CN": 873, "kingston upon hull:GB": 874, "abeokuta:NG": 875,
    "scottsdale:US": 876, "port-au-prince:HT": 877, "georgetown:GY": 878, "chiclayo:PE": 879, "jinzhong:CN": 880,
    "jayapura:ID": 881, "zaria:NG": 882, "naha:JP": 883, "tambov:RU": 884, "nizhny tagil:RU": 885,
    "santa fe:AR": 886, "boise:US": 887, "tai'an:CN": 888, "brighton:GB": 889, "tartus:SY": 890,
    "plymouth:GB": 891, "maoming:CN": 892, "langkawi:MY": 893, "luang prabang:LA": 894, "shaoguan:CN": 895,
    "pereira:CO": 896, "serang:ID": 897, "tirunelveli:IN": 898, "xalapa de enriquez:MX": 899, "daqing:CN": 900,
    "chernivtsi:UA": 901, "torreon:MX": 902, "kolhapur:IN": 903, "jhansi:IN": 904, "chemnitz:DE": 905,
    "sucre:BO": 906, "goma:CD": 907, "rajshahi:BD": 908, "shubra al khaymah:EG": 909, "trabzon:TR": 910,
    "putian:CN": 911, "tianshui:CN": 912, "jeonju:KR": 913, "toyama:JP": 914, "barranquilla:CO": 915,
    "cherkasy:UA": 916, "santiago de los caballeros:DO": 917, "al mansurah:EG": 918, "matola:MZ": 919, "hong kong island:HK": 920,
    "manado:ID": 921, "zhytomyr:UA": 922, "gustavo adolfo madero:MX": 923, "xiangyang:CN": 924, "derby:GB": 925,
    "rennes:FR": 926, "taganrog:RU": 927, "ismailia:EG": 928, "honcho:JP": 929, "gdynia:PL": 930,
    "tanta:EG": 931, "moradabad:IN": 932, "belagavi:IN": 933, "tuxtla:MX": 934, "nicosia:CY": 935,
    "toyota:JP": 936, "lubango:AO": 937, "salt lake city:US": 938, "bhilai:IN": 939, "al fayyum:EG": 940,
    "jieyang:CN": 941, "asansol:IN": 942, "kostroma:RU": 943, "anqing:CN": 944, "buraydah:SA": 945,
    "da lat:VN": 946, "yakutsk:RU": 947, "ilorin:NG": 948, "ciudad guayana:VE": 949, "groningen:NL": 950,
    "baton rouge:US": 951, "east london:ZA": 952, "bengbu:CN": 953, "nasiriyah:IQ": 954, "changde:CN": 955,
    "beira:MZ": 956, "hachioji:JP": 957, "mek'ele:ET": 958, "laval:CA": 959, "kurgan:RU": 960,
    "nampula:MZ": 961, "guarulhos:BR": 962, "enugu:NG": 963, "xianyang:CN": 964, "mainz:DE": 965,
    "jiujiang:CN": 966, "aizawl:IN": 967, "qinhuangdao:CN": 968, "anyang:CN": 969, "yerevan:AM": 970,
    "richmond:US": 971, "luohu district:CN": 972, "taraz:KZ": 973, "nakuru:KE": 974, "iquitos:PE": 975,
    "jersey city:US": 976, "stockton:US": 977, "khmelnytskyi:UA": 978, "jeju city:KR": 979, "aspen:US": 980,
    "meizhou:CN": 981, "reno:US": 982, "benxi:CN": 983, "pavlodar:KZ": 984, "yokosuka:JP": 985,
    "kaesong:KP": 986, "plano:US": 987, "george town:MY": 988, "gonder:ET": 989, "huai'an:CN": 990,
    "ndola:ZM": 991, "taizhou:CN": 992, "usak:TR": 993, "misratah:LY": 994, "balikpapan:ID": 995,
    "jining:CN": 996, "weihai:CN": 997, "eindhoven:NL": 998, "ansan-si:KR": 999, "yoshkar-ola:RU": 1000,
    // Rank 1001-2000: Regional destinations
    "fuyang:CN": 1001, "des moines:US": 1002, "malingao:PH": 1003, "amagasaki:JP": 1004, "fukushima:JP": 1005,
    "baku:AZ": 1006, "rustenburg:ZA": 1007, "shangrao:CN": 1008, "modesto:US": 1009, "cuernavaca:MX": 1010,
    "namp'o:KP": 1011, "ulsan:KR": 1012, "gandhinagar:IN": 1013, "saskatoon:CA": 1014, "oral:KZ": 1015,
    "jambi city:ID": 1016, "bhavnagar:IN": 1017, "toledo:US": 1018, "jiaxing:CN": 1019, "qazvin:IR": 1020,
    "kitwe:ZM": 1021, "zunyi:CN": 1022, "velikiy novgorod:RU": 1023, "nellore:IN": 1024, "camagueey:CU": 1025,
    "fort wayne:US": 1026, "sumy:UA": 1027, "cherepovets:RU": 1028, "irbid:JO": 1029, "st. petersburg:US": 1030,
    "vina del mar:CL": 1031, "longyan:CN": 1032, "mianyang:CN": 1033, "puerto montt:CL": 1034, "vientiane:LA": 1035,
    "yangjiang:CN": 1036, "kyzylorda:KZ": 1037, "manizales:CO": 1038, "arica:CL": 1039, "vantaa:FI": 1040,
    "greensboro:US": 1041, "hengyang:CN": 1042, "port sudan:SD": 1043, "durres:AL": 1044, "nis:RS": 1045,
    "jingzhou:CN": 1046, "barcelona:VE": 1047, "qingyuan:CN": 1048, "ueskuedar:TR": 1049, "jinhua:CN": 1050,
    "sokoto:NG": 1051, "piura:PE": 1052, "fergana:UZ": 1053, "xinyang:CN": 1054, "edirne:TR": 1055,
    "rangpur:BD": 1056, "algarve:PT": 1057, "atyrau:KZ": 1058, "siliguri:IN": 1059, "lu'an:CN": 1060,
    "imphal:IN": 1061, "yunfu:CN": 1062, "trondheim:NO": 1063, "sivas:TR": 1064, "wolverhampton:GB": 1065,
    "linz:AT": 1066, "ajman:AE": 1067, "mathura:IN": 1068, "freiburg:DE": 1069, "maturin:VE": 1070,
    "fukuyama:JP": 1071, "sanandaj:IR": 1072, "palma:ES": 1073, "little rock:US": 1074, "zhuzhou:CN": 1075,
    "zhangzhou:CN": 1076, "aomori:JP": 1077, "huaibei:CN": 1078, "zhenjiang:CN": 1079, "vinh:VN": 1080,
    "adapazari:TR": 1081, "temuco:CL": 1082, "muzaffarabad:PK": 1083, "zagazig:EG": 1084, "kenitra:MA": 1085,
    "xinxiang:CN": 1086, "rivne:UA": 1087, "liaocheng:CN": 1088, "tangier:MA": 1089, "kawaguchi:JP": 1090,
    "ust-kamenogorsk:KZ": 1091, "teni:IN": 1092, "surrey:CA": 1093, "maceio:BR": 1094, "wollongong:AU": 1095,
    "nanchong:CN": 1096, "campinas:BR": 1097, "kisumu:KE": 1098, "onitsha:NG": 1099, "makiivka:UA": 1100,
    "kosice:SK": 1101, "tallahassee:US": 1102, "zanjan:IR": 1103, "oaxaca:MX": 1104, "syktyvkar:RU": 1105,
    "henderson:US": 1106, "ca mau:VN": 1107, "adiyaman:TR": 1108, "rodos:GR": 1109, "cheongju-si:KR": 1110,
    "ivano-frankivsk:UA": 1111, "surgut:RU": 1112, "bucheon-si:KR": 1113, "kuantan:MY": 1114, "stoke-on-trent:GB": 1115,
    "otsu:JP": 1116, "czestochowa:PL": 1117, "nalchik:RU": 1118, "south tangerang:ID": 1119, "patiala:IN": 1120,
    "polokwane:ZA": 1121, "ha'il:SA": 1122, "novorossiysk:RU": 1123, "al hasakah:SY": 1124, "preston:GB": 1125,
    "khorramabad:IR": 1126, "shangqiu:CN": 1127, "sfax:TN": 1128, "semey:KZ": 1129, "komsomolsk-on-amur:RU": 1130,
    "novi sad:RS": 1131, "montgomery:US": 1132, "saharanpur:IN": 1133, "morogoro:TZ": 1134, "zamboanga:PH": 1135,
    "mudanjiang:CN": 1136, "xuchang:CN": 1137, "zhu cheng city:CN": 1138, "shivaji nagar:IN": 1139, "ternopil:UA": 1140,
    "ashdod:IL": 1141, "hakodate:JP": 1142, "antakya:TR": 1143, "mbeya:TZ": 1144, "takasaki:JP": 1145,
    "debrecen:HU": 1146, "sargodha:PK": 1147, "tiruppur:IN": 1148, "pskov:RU": 1149, "kurashiki:JP": 1150,
    "ahilyanagar:IN": 1151, "maracay:VE": 1152, "liupanshui:CN": 1153, "tamale:GH": 1154, "ciudad del este:PY": 1155,
    "morioka:JP": 1156, "norfolk:US": 1157, "corum:TR": 1158, "aberdeen:GB": 1159, "florence:IT": 1160,
    "huancayo:PE": 1161, "jalalabad:AF": 1162, "tacoma:US": 1163, "geelong:AU": 1164, "chandler:US": 1165,
    "dongying:CN": 1166, "portsmouth:GB": 1167, "kollam:IN": 1168, "bhagalpur:IN": 1169, "guatemala city:GT": 1170,
    "osogbo:NG": 1171, "makati city:PH": 1172, "yueyang:CN": 1173, "qujing:CN": 1174, "changzhi:CN": 1175,
    "pingdingshan:CN": 1176, "ciudad bolivar:VE": 1177, "managua:NI": 1178, "tripoli:LB": 1179, "burgas:BG": 1180,
    "blagoveshchensk:RU": 1181, "villahermosa:MX": 1182, "cagayan de oro:PH": 1183, "afyonkarahisar:TR": 1184, "ma'anshan:CN": 1185,
    "manisa:TR": 1186, "heze:CN": 1187, "asahikawa:JP": 1188, "al hillah:IQ": 1189, "reims:FR": 1190,
    "taguig:PH": 1191, "irvine:US": 1192, "wuwei:CN": 1193, "kropyvnytskyy:UA": 1194, "providence:US": 1195,
    "petaling jaya:MY": 1196, "gatineau:CA": 1197, "regina:CA": 1198, "luzhou:CN": 1199, "zigong:CN": 1200,
    "alor setar:MY": 1201, "potsdam:DE": 1202, "corrientes:AR": 1203, "sukkur:PK": 1204, "tacloban:PH": 1205,
    "banja luka:BA": 1206, "pachuca de soto:MX": 1207, "chuzhou:CN": 1208, "zhangjiajie:CN": 1209, "cebu city:PH": 1210,
    "bhiwandi:IN": 1211, "koeln:DE": 1212, "banda aceh:ID": 1213, "spokane:US": 1214, "durham:US": 1215,
    "xiangtan:CN": 1216, "huangshi:CN": 1217, "victoria:HK": 1218, "liaoyang:CN": 1219, "hsinchu:TW": 1220,
    "lubbock:US": 1221, "beihai:CN": 1222, "damietta:EG": 1223, "bozhou:CN": 1224, "setagaya:JP": 1225,
    "birmingham:US": 1226, "kashiwa:JP": 1227, "rochester:US": 1228, "laredo:US": 1229, "glendale:US": 1230,
    "akola:IN": 1231, "iskenderun:TR": 1232, "hanzhong:CN": 1233, "akure:NG": 1234, "mawlamyine:MM": 1235,
    "chula vista:US": 1236, "lutsk:UA": 1237, "zhoushan:CN": 1238, "kurnool:IN": 1239, "reynosa:MX": 1240,
    "sari:IR": 1241, "kassel:DE": 1242, "guigang:CN": 1243, "jiaozuo:CN": 1244, "neijiang:CN": 1245,
    "bratsk:RU": 1246, "erode:IN": 1247, "aksaray:TR": 1248, "tepic:MX": 1249, "ulhasnagar:IN": 1250,
    "chengde:CN": 1251, "sao luis:BR": 1252, "comilla:BD": 1253, "seongnam-si:KR": 1254, "huntsville:US": 1255,
    "podolsk:RU": 1256, "weinan:CN": 1257, "yongzhou:CN": 1258, "naples:IT": 1259, "toyohashi:JP": 1260,
    "huzhou:CN": 1261, "okazaki:JP": 1262, "rishon letsiyyon:IL": 1263, "wonsan:KP": 1264, "jinzhou:CN": 1265,
    "sanming:CN": 1266, "kolwezi:CD": 1267, "mbandaka:CD": 1268, "malanje:AO": 1269, "machida:JP": 1270,
    "touba:SN": 1271, "batumi:GE": 1272, "safi:MA": 1273, "kalaburagi:IN": 1274, "anshun:CN": 1275,
    "al mahallah al kubra:EG": 1276, "matsudo:JP": 1277, "toamasina:MG": 1278, "le havre:FR": 1279, "saarbruecken:DE": 1280,
    "bengkulu:ID": 1281, "qo'qon:UZ": 1282, "resistencia:AR": 1283, "hwaseong-si:KR": 1284, "hegang:CN": 1285,
    "baoshan:CN": 1286, "uppsala:SE": 1287, "nanping:CN": 1288, "sosnowiec:PL": 1289, "xochimilco:MX": 1290,
    "bamenda:CM": 1291, "antipolo:PH": 1292, "cork:IE": 1293, "warri:NG": 1294, "virar:IN": 1295,
    "neyshabur:IR": 1296, "campo grande:BR": 1297, "suqian:CN": 1298, "southend-on-sea:GB": 1299, "deir ez-zor:SY": 1300,
    "sterlitamak:RU": 1301, "ichinomiya:JP": 1302, "ambon:ID": 1303, "bishkek:KG": 1304, "sousse:TN": 1305,
    "najran:SA": 1306, "natal:BR": 1307, "chongjin:KP": 1308, "pingxiang:CN": 1309, "eldoret:KE": 1310,
    "zhaotong:CN": 1311, "bacolod city:PH": 1312, "winston-salem:US": 1313, "posadas:AR": 1314, "gujangbagh:CN": 1315,
    "lankaran:AZ": 1316, "wuzhou:CN": 1317, "hollywood:US": 1318, "jiamusi:CN": 1319, "fremont:US": 1320,
    "fuxin:CN": 1321, "mukalla:YE": 1322, "san bernardino:US": 1323, "zhangye:CN": 1324, "gebze:TR": 1325,
    "tshikapa:CD": 1326, "linfen:CN": 1327, "fujisawa:JP": 1328, "kawagoe:JP": 1329, "huludao:CN": 1330,
    "phuket:TH": 1331, "hoi an:VN": 1332, "amol:IR": 1333, "sanmenxia:CN": 1334, "yulin:CN": 1335,
    "petah tiqva:IL": 1336, "tanga:TZ": 1337, "northampton:GB": 1338, "torun:PL": 1339, "gorgan:IR": 1340,
    "rzeszow:PL": 1341, "blida:DZ": 1342, "ambato:EC": 1343, "windsor:CA": 1344, "iloilo:PH": 1345,
    "nyala:SD": 1346, "tlaquepaque:MX": 1347, "zaozhuang:CN": 1348, "lobito:AO": 1349, "ibb:YE": 1350,
    "parana:AR": 1351, "kakinada:IN": 1352, "khartoum north:SD": 1353, "vellore:IN": 1354, "teresina:BR": 1355,
    "odense:DK": 1356, "likasi:CD": 1357, "langfang:CN": 1358, "kunshan:CN": 1359, "iquique:CL": 1360,
    "rohini:IN": 1361, "wanxian:CN": 1362, "pasig city:PH": 1363, "kanayannur:IN": 1364, "dazhou:CN": 1365,
    "alwar:IN": 1366, "saint-etienne:FR": 1367, "khimki:RU": 1368, "qinzhou:CN": 1369, "luohe:CN": 1370,
    "rancagua:CL": 1371, "calabar:NG": 1372, "thanjavur:IN": 1373, "eslamshahr:IR": 1374, "tongshan:CN": 1375,
    "worcester:US": 1376, "subang jaya:MY": 1377, "fort lauderdale:US": 1378, "hurghada:EG": 1379, "shimonoseki:JP": 1380,
    "oxford:GB": 1381, "xiaogan:CN": 1382, "bahir dar:ET": 1383, "ciudad victoria:MX": 1384, "akron:US": 1385,
    "bauchi:NG": 1386, "nazret:ET": 1387, "radom:PL": 1388, "volzhsky:RU": 1389, "la plata:AR": 1390,
    "salem:US": 1391, "dihok:IQ": 1392, "durgapur:IN": 1393, "balikesir:TR": 1394, "yuncheng:CN": 1395,
    "dezhou:CN": 1396, "ankang:CN": 1397, "noida:IN": 1398, "jijiga:ET": 1399, "shaoyang:CN": 1400,
    "guadalupe:MX": 1401, "kitchener:CA": 1402, "angarsk:RU": 1403, "turin:IT": 1404, "milton keynes:GB": 1405,
    "ensenada:MX": 1406, "kuala terengganu:MY": 1407, "abakan:RU": 1408, "patan:NP": 1409, "takeo:KH": 1410,
    "cochabamba:BO": 1411, "zhabei:CN": 1412, "yibin:CN": 1413, "abbottabad:PK": 1414, "bukan:IR": 1415,
    "breda:NL": 1416, "kampung baru subang:MY": 1417, "luton:GB": 1418, "chesapeake:US": 1419, "junagadh:IN": 1420,
    "yiwu:CN": 1421, "siping:CN": 1422, "horlivka:UA": 1423, "barinas:VE": 1424, "angers:FR": 1425,
    "koriyama:JP": 1426, "heyuan:CN": 1427, "jiangyin:CN": 1428, "santiago del estero:AR": 1429, "setif:DZ": 1430,
    "jiuquan:CN": 1431, "kremenchuk:UA": 1432, "jalgaon:IN": 1433, "pohang:KR": 1434, "seremban:MY": 1435,
    "thrissur:IN": 1436, "malabo:GQ": 1437, "pilsen:CZ": 1438, "khorramshahr:IR": 1439, "turkmenabat:TM": 1440,
    "tsu:JP": 1441, "beersheba:IL": 1442, "irving:US": 1443, "orsk:RU": 1444, "chizhou:CN": 1445,
    "hezhou:CN": 1446, "tirupati:IN": 1447, "netanya:IL": 1448, "grenoble:FR": 1449, "katsina:NG": 1450,
    "mazatlan:MX": 1451, "toulon:FR": 1452, "fukui-shi:JP": 1453, "laiwu:CN": 1454, "port louis:MU": 1455,
    "bijie:CN": 1456, "leshan:CN": 1457, "montego bay:JM": 1458, "sharm el sheikh:EG": 1459, "deyang:CN": 1460,
    "serekunda:GM": 1461, "sikasso:ML": 1462, "garland:US": 1463, "thoothukudi:IN": 1464, "general santos:PH": 1465,
    "sakai:JP": 1466, "valencia:ES": 1467, "nova iguacu:BR": 1468, "batna city:DZ": 1469, "chenzhou:CN": 1470,
    "duque de caxias:BR": 1471, "joao pessoa:BR": 1472, "la paz:MX": 1473, "bukavu:CD": 1474, "buon ma thuot:VN": 1475,
    "cumana:VE": 1476, "saint-louis:SN": 1477, "grand rapids:US": 1478, "koshigaya:JP": 1479, "bahia blanca:AR": 1480,
    "dijon:FR": 1481, "kurume:JP": 1482, "yichun:CN": 1483, "hebi:CN": 1484, "knoxville:US": 1485,
    "esna:EG": 1486, "damanhur:EG": 1487, "jingmen:CN": 1488, "biysk:RU": 1489, "ordu:TR": 1490,
    "tacna:PE": 1491, "muzaffarpur:IN": 1492, "yonkers:US": 1493, "quzhou:CN": 1494, "panzhihua:CN": 1495,
    "petropavlovsk-kamchatsky:RU": 1496, "qarshi:UZ": 1497, "vijayapura:IN": 1498, "mobile:US": 1499, "suizhou:CN": 1500,
    "yuzhno-sakhalinsk:RU": 1501, "binzhou:CN": 1502, "keelung:TW": 1503, "awasa:ET": 1504, "gliwice:PL": 1505,
    "yan'an:CN": 1506, "nizhnevartovsk:RU": 1507, "dili:TL": 1508, "yangquan:CN": 1509, "sandakan:MY": 1510,
    "manama:BH": 1511, "ballari:IN": 1512, "amarillo:US": 1513, "yokkaichi:JP": 1514, "kielce:PL": 1515,
    "larkana:PK": 1516, "san pedro sula:HN": 1517, "narela:IN": 1518, "xingtai:CN": 1519, "niigata:JP": 1520,
    "laibin:CN": 1521, "hamamatsu:JP": 1522, "gujrat:PK": 1523, "arnhem:NL": 1524, "cucuta:CO": 1525,
    "staryy oskol:RU": 1526, "gilbert:US": 1527, "york:GB": 1528, "jinjiang:CN": 1529, "hengshui:CN": 1530,
    "huanggang:CN": 1531, "tampico:MX": 1532, "hialeah:US": 1533, "zinder:NE": 1534, "takatsuki:JP": 1535,
    "boma:CD": 1536, "darbhanga:IN": 1537, "nanded:IN": 1538, "shuangyashan:CN": 1539, "cirebon:ID": 1540,
    "maradi:NE": 1541, "riobamba:EC": 1542, "suining:CN": 1543, "xinyu:CN": 1544, "jackson:US": 1545,
    "north las vegas:US": 1546, "kikwit:CD": 1547, "rybinsk:RU": 1548, "kakamega:KE": 1549, "haarlem:NL": 1550,
    "rosetta:EG": 1551, "zhoukou:CN": 1552, "osmaniye:TR": 1553, "pingliang:CN": 1554, "iztapalapa:MX": 1555,
    "turkestan:KZ": 1556, "qa'em shahr:IR": 1557, "szeged:HU": 1558, "sylhet:BD": 1559, "baguio:PH": 1560,
    "burnaby:CA": 1561, "cixi:CN": 1562, "bafoussam:CM": 1563, "targu mures:RO": 1564, "abu ghurayb:IQ": 1565,
    "campeche:MX": 1566, "linkoeping:SE": 1567, "city of westminster:GB": 1568, "xuancheng:CN": 1569, "panipat:IN": 1570,
    "el obeid:SD": 1571, "shreveport:US": 1572, "nuevo laredo:MX": 1573, "ile-ife:NG": 1574, "ya'an:CN": 1575,
    "patra:GR": 1576, "pucallpa:PE": 1577, "kuetahya:TR": 1578, "khujand:TJ": 1579, "dzerzhinsk:RU": 1580,
    "sioux falls:US": 1581, "ningde:CN": 1582, "malegaon:IN": 1583, "kamyanske:UA": 1584, "cambridge:GB": 1585,
    "owerri:NG": 1586, "xinzhou:CN": 1587, "eugene:US": 1588, "machala:EC": 1589, "san salvador de jujuy:AR": 1590,
    "bila tserkva:UA": 1591, "rajamahendravaram:IN": 1592, "gjong hoi:VN": 1593, "aqsu:CN": 1594, "cankaya:TR": 1595,
    "markham:CA": 1596, "al-kut:IQ": 1597, "tiraspol:MD": 1598, "huntington beach:US": 1599, "armavir:RU": 1600,
    "ota:JP": 1601, "shimla:IN": 1602, "qui nhon:VN": 1603, "chattanooga:US": 1604, "sao bernardo do campo:BR": 1605,
    "'s-hertogenbosch:NL": 1606, "tasikmalaya:ID": 1607, "jixi:CN": 1608, "guang'an:CN": 1609, "shizuishan:CN": 1610,
    "huaihua:CN": 1611, "kassala:SD": 1612, "sinuiju:KP": 1613, "heidelberg:DE": 1614, "irapuato:MX": 1615,
    "bobruysk:BY": 1616, "zabrze:PL": 1617, "neuquen:AR": 1618, "kasur:PK": 1619, "oxnard:US": 1620,
    "nam gjinh:VN": 1621, "kostanay:KZ": 1622, "matsumoto:JP": 1623, "heroica matamoros:MX": 1624, "fontana:US": 1625,
    "santa cruz de tenerife:ES": 1626, "salzburg:AT": 1627, "split:HR": 1628, "puerto plata:DO": 1629, "lake como:IT": 1630,
    "essaouira:MA": 1631, "venice:IT": 1632, "saint-malo:FR": 1633, "ibiza:ES": 1634, "monaco:MC": 1635,
    "queenstown:NZ": 1636, "porto san giorgio:IT": 1637, "santorini:GR": 1638, "bora bora:PF": 1639, "interlaken:CH": 1640,
    "amalfi:IT": 1641, "hallstatt:AT": 1642, "olsztyn:PL": 1643, "rohtak:IN": 1644, "al 'amarah:IQ": 1645,
    "bytom:PL": 1646, "nizhnekamsk:RU": 1647, "shivamogga:IN": 1648, "akashi:JP": 1649, "uyo:NG": 1650,
    "hebron:PS": 1651, "ji'an:CN": 1652, "maragheh:IR": 1653, "longshan:CN": 1654, "hamilton:NZ": 1655,
    "swindon:GB": 1656, "miskolc:HU": 1657, "san cristobal:VE": 1658, "puri:IN": 1659, "chimoio:MZ": 1660,
    "vancouver:US": 1661, "bunia:CD": 1662, "thai nguyen:VN": 1663, "guangyuan:CN": 1664, "al hoceima:MA": 1665,
    "cheonan:KR": 1666, "praia:CV": 1667, "brent:GB": 1668, "kendari:ID": 1669, "oerebro:SE": 1670,
    "jincheng:CN": 1671, "sao jose dos campos:BR": 1672, "osasco:BR": 1673, "kadapa:IN": 1674, "piraeus:GR": 1675,
    "vereeniging:ZA": 1676, "talca:CL": 1677, "nimes:FR": 1678, "aihara:JP": 1679, "meishan:CN": 1680,
    "valenzuela:PH": 1681, "birkenhead:GB": 1682, "ipswich:GB": 1683, "okayama:JP": 1684, "saint-denis:RE": 1685,
    "shekhupura:PK": 1686, "zhumadian:CN": 1687, "cuito:AO": 1688, "sagamihara:JP": 1689, "mossamedes:AO": 1690,
    "zhangjiagang:CN": 1691, "vaughan:CA": 1692, "bani suwayf:EG": 1693, "ado-ekiti:NG": 1694, "newport news:US": 1695,
    "la serena:CL": 1696, "sidon:LB": 1697, "dhule:IN": 1698, "santo domingo de los colorados:EC": 1699, "engels:RU": 1700,
    "dera ismail khan:PK": 1701, "crete:GR": 1702, "gyeongju:KR": 1703, "townsville:AU": 1704, "minya:EG": 1705,
    "cox's bazar:BD": 1706, "daloa:CI": 1707, "anantapur:IN": 1708, "columbia:US": 1709, "korhogo:CI": 1710,
    "latur:IN": 1711, "newport:GB": 1712, "brest:FR": 1713, "hubballi:IN": 1714, "marikina city:PH": 1715,
    "davangere:IN": 1716, "alappuzha:IN": 1717, "bolu:TR": 1718, "ribeirao preto:BR": 1719, "hisar:IN": 1720,
    "oldham:GB": 1721, "chifeng:CN": 1722, "paranaque city:PH": 1723, "karamay:CN": 1724, "jaboatao:BR": 1725,
    "santo domingo oeste:DO": 1726, "santo domingo este:DO": 1727, "ziyang:CN": 1728, "darwin:AU": 1729, "brownsville:US": 1730,
    "kabwe:ZM": 1731, "tete:MZ": 1732, "rach gia:VN": 1733, "sohag:EG": 1734, "karnal:IN": 1735,
    "ica:PE": 1736, "djelfa:DZ": 1737, "coro:VE": 1738, "pecs:HU": 1739, "chuncheon:KR": 1740,
    "lijiang:CN": 1741, "ramadi:IQ": 1742, "bournemouth:GB": 1743, "benoni:ZA": 1744, "san-pedro:CI": 1745,
    "ulanqab:CN": 1746, "maui:US": 1747, "quelimane:MZ": 1748, "sangli:IN": 1749, "borama:SO": 1750,
    "oyo:NG": 1751, "amiens:FR": 1752, "karaman:TR": 1753, "parakou:BJ": 1754, "sunderland:GB": 1755,
    "san nicolas de los garza:MX": 1756, "samarra':IQ": 1757, "antsirabe:MG": 1758, "duezce:TR": 1759, "tours:FR": 1760,
    "gumi:KR": 1761, "peterborough:GB": 1762, "edogawe:JP": 1763, "adachi:JP": 1764, "huangshan:CN": 1765,
    "shizuoka:JP": 1766, "dera ghazi khan:PK": 1767, "borujerd:IR": 1768, "zhangjiakou:CN": 1769, "enschede:NL": 1770,
    "yola:NG": 1771, "bielsko-biala:PL": 1772, "fayetteville:US": 1773, "kanchipuram:IN": 1774, "aalborg:DK": 1775,
    "longueuil:CA": 1776, "puerto la cruz:VE": 1777, "hlaingthaya:MM": 1778, "sorocaba:BR": 1779, "zaragoza:ES": 1780,
    "maroua:CM": 1781, "gombe:NG": 1782, "springfield:US": 1783, "bannu:PK": 1784, "rahim yar khan:PK": 1785,
    "bagcilar:TR": 1786, "bridgeport:US": 1787, "portoviejo:EC": 1788, "petropavl:KZ": 1789, "sasebo:JP": 1790,
    "haridwar:IN": 1791, "bilaspur:IN": 1792, "wonju:KR": 1793, "wad medani:SD": 1794, "taicang:CN": 1795,
    "al diwaniyah:IQ": 1796, "marg'ilon:UZ": 1797, "hiratsuka:JP": 1798, "qina:EG": 1799, "severodvinsk:RU": 1800,
    "limassol:CY": 1801, "formosa:AR": 1802, "chimbote:PE": 1803, "etawah:IN": 1804, "chanda:IN": 1805,
    "dundee:GB": 1806, "kom ombo:EG": 1807, "fuji:JP": 1808, "aydin:TR": 1809, "isparta:TR": 1810,
    "loudi:CN": 1811, "bahcelievler:TR": 1812, "shangluo:CN": 1813, "limoges:FR": 1814, "kamakura:JP": 1815,
    "umraniye:TR": 1816, "sariwon-si:KP": 1817, "abha:SA": 1818, "kasukabe:JP": 1819, "sevilla:ES": 1820,
    "baise:CN": 1821, "situbondo:ID": 1822, "kalyan:IN": 1823, "dushanbe:TJ": 1824, "shakhty:RU": 1825,
    "norwich:GB": 1826, "saurimo:AO": 1827, "firozabad:IN": 1828, "e'zhou:CN": 1829, "loja:EC": 1830,
    "los teques:VE": 1831, "overland park:US": 1832, "maykop:RU": 1833, "tempe:US": 1834, "moreno valley:US": 1835,
    "tottori-shi:JP": 1836, "sukabumi:ID": 1837, "pasadena:US": 1838, "dindigul:IN": 1839, "balakovo:RU": 1840,
    "miri:MY": 1841, "kigoma:TZ": 1842, "puning:CN": 1843, "pangkalpinang:ID": 1844, "nizamabad:IN": 1845,
    "zenica:BA": 1846, "kure:JP": 1847, "holon:IL": 1848, "berbera:SO": 1849, "kirikkale:TR": 1850,
    "oruro:BO": 1851, "cajamarca:PE": 1852, "ramat gan:IL": 1853, "zlatoust:RU": 1854, "bharatpur:NP": 1855,
    "aracaju:BR": 1856, "prizren:XK": 1857, "santo andre:BR": 1858, "corlu:TR": 1859, "rizhao:CN": 1860,
    "yamaguchi:JP": 1861, "cilegon:ID": 1862, "banjarmasin:ID": 1863, "makurdi:NG": 1864, "luena:AO": 1865,
    "xichang:CN": 1866, "soacha:CO": 1867, "khamis mushait:SA": 1868, "barddhaman:IN": 1869, "istaravshan:TJ": 1870,
    "alexandria:US": 1871, "kunduz:AF": 1872, "foggia:IT": 1873, "syracuse:US": 1874, "al qadarif:SD": 1875,
    "korla:CN": 1876, "kerch:UA": 1877, "tirmiz:UZ": 1878, "kakogawacho-honmachi:JP": 1879, "nazran:RU": 1880,
    "santa clarita:US": 1881, "chillan:CL": 1882, "fort collins:US": 1883, "san miguel:SV": 1884, "atsugi:JP": 1885,
    "grand prairie:US": 1886, "tabora:TZ": 1887, "ogbomoso:NG": 1888, "ciudad apodaca:MX": 1889, "sahiwal:PK": 1890,
    "welkom:ZA": 1891, "birjand:IR": 1892, "chilpancingo:MX": 1893, "tlalpan:MX": 1894, "santa rosa:US": 1895,
    "tarlac city:PH": 1896, "biratnagar:NP": 1897, "oceanside:US": 1898, "ooty:IN": 1899, "qionghai:CN": 1900,
    "west jerusalem:IL": 1901, "chitungwiza:ZW": 1902, "dunhuang:CN": 1903, "besancon:FR": 1904, "peoria:US": 1905,
    "wenchang:CN": 1906, "ratlam:IN": 1907, "6th of october city:EG": 1908, "tlalnepantla:MX": 1909, "baicheng:CN": 1910,
    "mardan:PK": 1911, "palermo:IT": 1912, "dharavi:IN": 1913, "canakkale:TR": 1914, "sidi bel abbes:DZ": 1915,
    "jaboatao dos guararapes:BR": 1916, "new south memphis:US": 1917, "kaolack:SN": 1918, "klang:MY": 1919, "larisa:GR": 1920,
    "irakleion:GR": 1921, "kragujevac:RS": 1922, "bojnurd:IR": 1923, "tyre:LB": 1924, "cairns:AU": 1925,
    "bushehr:IR": 1926, "salinas:US": 1927, "kolomna:RU": 1928, "brahmapur:IN": 1929, "bejaia:DZ": 1930,
    "erzincan:TR": 1931, "lleida:ES": 1932, "kulob:TJ": 1933, "talcahuano:CL": 1934, "clarksville:US": 1935,
    "segou:ML": 1936, "minna:NG": 1937, "nowrangapur:IN": 1938, "moundou:TD": 1939, "heihe:CN": 1940,
    "topeka:US": 1941, "pekalongan:ID": 1942, "jaffna:LK": 1943, "gunpo:KR": 1944, "novocherkassk:RU": 1945,
    "bimbo:CF": 1946, "korba:IN": 1947, "imus:PH": 1948, "wanning:CN": 1949, "shillong:IN": 1950,
    "stuttgart:DE": 1951, "viet tri:VN": 1952, "mahajanga:MG": 1953, "contagem:BR": 1954, "ciudad obregon:MX": 1955,
    "zelenograd:RU": 1956, "panshan:CN": 1957, "chipata:ZM": 1958, "qitaihe:CN": 1959, "bago:MM": 1960,
    "el fasher:SD": 1961, "isfara:TJ": 1962, "okara:PK": 1963, "satna:IN": 1964, "baiyin:CN": 1965,
    "new haven:US": 1966, "syzran:RU": 1967, "bnei brak:IL": 1968, "ontario:US": 1969, "ar rayyan:QA": 1970,
    "puerto vallarta:MX": 1971, "kindu:CD": 1972, "manta:EC": 1973, "gangneung:KR": 1974, "ashkelon:IL": 1975,
    "la rioja:AR": 1976, "phan rang-thap cham:VN": 1977, "puerto princesa:PH": 1978, "tawau:MY": 1979, "al ahmadi:KW": 1980,
    "umuahia:NG": 1981, "yeosu:KR": 1982, "harar:ET": 1983, "blackpool:GB": 1984, "dumai:ID": 1985,
    "feira de santana:BR": 1986, "ramgundam:IN": 1987, "villa nueva:GT": 1988, "cuiaba:BR": 1989, "las pinas:PH": 1990,
    "balashikha:RU": 1991, "coyoacan:MX": 1992, "aktau:KZ": 1993, "biskra:DZ": 1994, "prokop'yevsk:RU": 1995,
    "hartford:US": 1996, "umea:SE": 1997, "bhilwara:IN": 1998, "los mochis:MX": 1999, "coatzacoalcos:MX": 2000
};

// Country-level tourism rank — top ~50 countries by international tourist arrivals.
// Used as fallback when a destination is not in DESTINATION_POPULARITY_RANK.
// Source: UNWTO World Tourism Barometer.
const COUNTRY_TOURISM_RANK = {
    FR: 1, ES: 2, US: 3, TR: 4, IT: 5,
    MX: 6, GB: 7, DE: 8, TH: 9, AE: 10,
    CN: 11, GR: 12, AT: 13, MY: 14, JP: 15,
    PT: 16, SA: 17, IN: 18, HR: 19, NL: 20,
    HU: 21, MA: 22, PL: 23, CZ: 24, SG: 25,
    ID: 26, AU: 27, KR: 28, VN: 29, EG: 30,
    IE: 31, DK: 32, HK: 33, IL: 34, SE: 35,
    CH: 36, BE: 37, CA: 38, ZA: 39, BR: 40,
    AR: 41, DO: 42, PE: 43, CO: 44, TW: 45,
    NZ: 46, PH: 47, KH: 48, LK: 49, NO: 50
};


/**
 * Score an airport's relevance for sorting within a multi-airport city group.
 * Lower score = more relevant. Uses passenger traffic rank as primary signal,
 * with alphabetical code as fallback for unranked airports.
 */
function getAirportTrafficScore(code) {
    return AIRPORT_TRAFFIC_RANK[code] ?? 9999;
}

/**
 * Normalize a destination name for popularity lookup.
 * Strips diacritics (accents), lowercases, and trims.
 */
function normalizeDestName(name) {
    if (!name) return '';
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Common English→local name aliases where GeoNames uses local-language asciinames
// but hotel APIs may return English names. Key: "english:CC", value: "local:CC"
const DEST_NAME_ALIASES = {
    "seville:ES": "sevilla:ES",
    "cologne:DE": "koeln:DE",
    "nuremberg:DE": "nuernberg:DE",
    "the hague:NL": "den haag:NL",
    "gothenburg:SE": "goeteborg:SE",
    "saragossa:ES": "zaragoza:ES",
    "majorca:ES": "palma:ES",
    "marrakesh:MA": "marrakech:MA",
};

// ─── Popular Destination Prefix Matching (supplementary API calls) ───────────

/** Only destinations ranked within this threshold trigger supplementary API calls */
const POPULAR_DEST_THRESHOLD = 200;
/** Max supplementary API calls per keystroke (caps overhead for prefixes like "San") */
const MAX_SUPPLEMENTARY_CALLS = 3;

/**
 * Find popular destinations whose name starts with the given query prefix.
 * Returns up to MAX_SUPPLEMENTARY_CALLS matches, sorted by rank (most popular first).
 * Only matches when the full destination name is LONGER than the query.
 */
function findPopularPrefixMatches(query) {
    const q = normalizeDestName(query);
    if (!q) return [];

    const matches = [];
    for (const [key, rank] of Object.entries(DESTINATION_POPULARITY_RANK)) {
        if (rank > POPULAR_DEST_THRESHOLD) continue;

        const colonIdx = key.lastIndexOf(':');
        const destName = key.substring(0, colonIdx);
        const country = key.substring(colonIdx + 1);

        // Skip if query IS the full name (no supplementary call needed)
        if (destName.length <= q.length) continue;

        if (destName.startsWith(q)) {
            matches.push({ name: destName, country, rank });
        }
    }

    matches.sort((a, b) => a.rank - b.rank);
    return matches.slice(0, MAX_SUPPLEMENTARY_CALLS);
}

/** Title-case a destination name for use as an API search query. */
function titleCaseDestName(name) {
    return name.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Score a destination's popularity for sorting.
 * Lower score = more popular. Uses a two-tier lookup:
 *   1-2000:    Direct city+country match in DESTINATION_POPULARITY_RANK
 *   2001-2050: Country-level fallback via COUNTRY_TOURISM_RANK
 *   9999:      Unknown destination
 */
function getDestinationPopularityScore(result) {
    const country = (result.country || '').toUpperCase();

    // Attempt 1: Use the `city` field (p.name from API — the short name, e.g. "London")
    const cityRaw = result.city || '';
    const cityKey = normalizeDestName(cityRaw) + ':' + country;
    if (DESTINATION_POPULARITY_RANK[cityKey] !== undefined) {
        return DESTINATION_POPULARITY_RANK[cityKey];
    }

    // Attempt 1b: Check name aliases (English→local name mapping)
    if (DEST_NAME_ALIASES[cityKey] !== undefined && DESTINATION_POPULARITY_RANK[DEST_NAME_ALIASES[cityKey]] !== undefined) {
        return DESTINATION_POPULARITY_RANK[DEST_NAME_ALIASES[cityKey]];
    }

    // Attempt 2: Try with/without " city" suffix (GeoNames uses "New York City", API may use "New York")
    const cityNorm = normalizeDestName(cityRaw);
    const withCity = cityNorm.endsWith(' city')
        ? cityNorm.slice(0, -5).trim() + ':' + country
        : (cityNorm + ' city:' + country);
    if (DESTINATION_POPULARITY_RANK[withCity] !== undefined) {
        return DESTINATION_POPULARITY_RANK[withCity];
    }

    // Attempt 3: Extract city name from display name (strips ", Country" suffix)
    const extracted = extractCityName(result.name || '');
    const extractedKey = normalizeDestName(extracted) + ':' + country;
    if (extractedKey !== cityKey && DESTINATION_POPULARITY_RANK[extractedKey] !== undefined) {
        return DESTINATION_POPULARITY_RANK[extractedKey];
    }

    // Attempt 3b: Check aliases for extracted name too
    if (DEST_NAME_ALIASES[extractedKey] !== undefined && DESTINATION_POPULARITY_RANK[DEST_NAME_ALIASES[extractedKey]] !== undefined) {
        return DESTINATION_POPULARITY_RANK[DEST_NAME_ALIASES[extractedKey]];
    }

    // Tier 2 fallback: country-level rank, offset to 2001+ so any city match wins
    if (COUNTRY_TOURISM_RANK[country] !== undefined) {
        return 2000 + COUNTRY_TOURISM_RANK[country];
    }

    return 9999;
}

function groupAirportResults(results, query) {
    const airports = results.filter(r => r.rawType === 'airport');
    const other = results.filter(r => r.rawType !== 'airport');

    // Group airports by cityCode (e.g. LON, PAR, NYC)
    const cityGroups = new Map();
    for (const airport of airports) {
        const key = airport.cityCode || airport.code;
        if (!cityGroups.has(key)) {
            cityGroups.set(key, []);
        }
        cityGroups.get(key).push(airport);
    }

    const sections = [];

    for (const [cityCode, group] of cityGroups) {
        if (group.length > 1) {
            // Multi-airport city: synthesize "All Airports" + indented individual airports
            // Use the shortest name among the group as the city label (e.g. "London" from "London (LHR-Heathrow)")
            const cityName = extractCityName(group[0].name);
            const allAirportsEntry = {
                name: `${cityName} — All Airports`,
                code: cityCode,
                type: 'airport_code',
                rawType: 'multi_city_vicinity',
                id: `all_${cityCode}`,
                city: cityName,
                cityCode: cityCode,
                country: group[0].country,
                ancestors: group[0].ancestors,
                isAllAirports: true,
                indent: 0,
                icon: '✈️'
            };

            // Sort by passenger traffic rank (busiest first), then alphabetically by code for unranked
            const sortedAirports = group.sort((a, b) => {
                const aRank = getAirportTrafficScore(a.code);
                const bRank = getAirportTrafficScore(b.code);
                if (aRank !== bRank) return aRank - bRank;
                return (a.code || '').localeCompare(b.code || '');
            });
            // Shorten names for grouped airports: strip the city name prefix since they're already grouped
            const airportItems = sortedAirports.map(a => ({
                ...a,
                indent: 1,
                shortName: extractAirportShortName(a.name, cityName)
            }));

            sections.push({
                label: null,
                items: [allAirportsEntry, ...airportItems]
            });
        } else {
            // Single-airport city: flat, no grouping
            sections.push({
                label: null,
                items: group.map(a => ({ ...a, indent: 0 }))
            });
        }
    }

    // Sort city groups so busiest airports surface first (e.g. Sydney AU before Sydney CA)
    sections.sort((a, b) => {
        const bestRank = (section) => Math.min(...section.items.map(i => getAirportTrafficScore(i.code)));
        return bestRank(a) - bestRank(b);
    });

    // Append any non-airport results at the end
    if (other.length > 0) {
        sections.push({
            label: 'Other Locations',
            items: other.map(r => ({ ...r, indent: 0 }))
        });
    }

    return sections;
}

function groupHotelDestResults(results, query) {
    // Separate destinations (places) from hotels (properties)
    const destinations = results.filter(r => r.type === 'place_id');
    const hotels = results.filter(r => r.type === 'hotel');
    const airports = results.filter(r => r.type === 'airport_code');

    const sections = [];

    // Destinations first, then Airports, then Hotels
    if (destinations.length > 0) {
        // Sort destinations: exact match → popularity rank → type hierarchy → alphabetical
        const typeOrder = { 'country': 0, 'administrative_area_level_3': 1, 'administrative_area_level_4': 2 };
        destinations.sort((a, b) => {
            // Step 1: Boost exact match first, then starts-with, then others
            const aName = (a.city || a.name || '').toLowerCase();
            const bName = (b.city || b.name || '').toLowerCase();
            const aExact = aName === query ? 0 : (aName.startsWith(query) ? 1 : 2);
            const bExact = bName === query ? 0 : (bName.startsWith(query) ? 1 : 2);
            if (aExact !== bExact) return aExact - bExact;

            // Step 2: Popularity rank — lower = more popular destination
            const aPop = getDestinationPopularityScore(a);
            const bPop = getDestinationPopularityScore(b);
            if (aPop !== bPop) return aPop - bPop;

            // Step 3: Type hierarchy (tiebreaker)
            const aOrder = typeOrder[a.rawType] ?? 3;
            const bOrder = typeOrder[b.rawType] ?? 3;
            if (aOrder !== bOrder) return aOrder - bOrder;

            // Step 4: Alphabetical (final tiebreaker)
            return (a.name || '').localeCompare(b.name || '');
        });
        sections.push({
            label: 'Destinations',
            items: destinations.map(r => ({ ...r, indent: 0 }))
        });
    }

    // Airports with city-grouping (reuse airport grouping logic)
    if (airports.length > 0) {
        const airportSections = groupAirportResults(airports, query);
        const allAirportItems = [];
        for (const sec of airportSections) {
            if (sec.label === 'Other Locations') continue;
            allAirportItems.push(...sec.items);
        }
        if (allAirportItems.length > 0) {
            sections.push({
                label: 'Airports',
                items: allAirportItems
            });
        }
    }

    if (hotels.length > 0) {
        // Sort hotels by star rating (desc), then by name
        hotels.sort((a, b) => (b.stars || 0) - (a.stars || 0) || (a.name || '').localeCompare(b.name || ''));
        sections.push({
            label: 'Hotels',
            items: hotels.map(r => ({ ...r, indent: 0 }))
        });
    }

    if (sections.length === 0) {
        return [{ label: null, items: results.map(r => ({ ...r, indent: 0 })) }];
    }

    return sections;
}

function groupTourResults(results, query) {
    // Tours: separate destinations (countries, regions, cities) from any other types
    const destinations = results.filter(r => r.type === 'place_id');
    const airports = results.filter(r => r.type === 'airport_code');
    const other = results.filter(r => r.type !== 'place_id' && r.type !== 'airport_code');

    const sections = [];

    if (destinations.length > 0) {
        // Sort: exact match → popularity rank → type hierarchy → alphabetical
        const typeOrder = { 'country': 0, 'administrative_area_level_3': 1, 'administrative_area_level_4': 2 };
        destinations.sort((a, b) => {
            const aName = (a.city || a.name || '').toLowerCase();
            const bName = (b.city || b.name || '').toLowerCase();
            const aExact = aName === query ? 0 : (aName.startsWith(query) ? 1 : 2);
            const bExact = bName === query ? 0 : (bName.startsWith(query) ? 1 : 2);
            if (aExact !== bExact) return aExact - bExact;

            // Popularity rank — lower = more popular destination
            const aPop = getDestinationPopularityScore(a);
            const bPop = getDestinationPopularityScore(b);
            if (aPop !== bPop) return aPop - bPop;

            const aOrder = typeOrder[a.rawType] ?? 3;
            const bOrder = typeOrder[b.rawType] ?? 3;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return (a.name || '').localeCompare(b.name || '');
        });
        sections.push({
            label: 'Destinations',
            items: destinations.map(r => ({ ...r, indent: 0 }))
        });
    }

    // Airports with city-grouping (reuse airport grouping logic)
    if (airports.length > 0) {
        const airportSections = groupAirportResults(airports, query);
        const allAirportItems = [];
        for (const sec of airportSections) {
            if (sec.label === 'Other Locations') continue;
            allAirportItems.push(...sec.items);
        }
        if (allAirportItems.length > 0) {
            sections.push({ label: 'Airports', items: allAirportItems });
        }
    }

    if (other.length > 0) {
        sections.push({
            label: 'Other',
            items: other.map(r => ({ ...r, indent: 0 }))
        });
    }

    if (sections.length === 0) {
        return [{ label: null, items: results.map(r => ({ ...r, indent: 0 })) }];
    }

    return sections;
}

function groupTransferHotelResults(results) {
    // Transfer dropoff: all hotels, sort by star rating desc
    const sorted = [...results].sort((a, b) => (b.stars || 0) - (a.stars || 0) || (a.name || '').localeCompare(b.name || ''));
    if (sorted.length === 0) {
        return [{ label: null, items: [] }];
    }
    return [{ label: 'Hotels', items: sorted.map(r => ({ ...r, indent: 0 })) }];
}

function extractCityName(airportLongName) {
    // Extract city name from formats like "London, United Kingdom (LHR-Heathrow)" or "London (LHR-Heathrow)"
    // Take everything before the first comma or opening paren
    const match = airportLongName.match(/^([^,(]+)/);
    return match ? match[1].trim() : airportLongName;
}

function extractAirportShortName(fullName, cityName) {
    // Extract just the airport identifier from names like "London, United Kingdom (LHR-Heathrow)"
    // Goal: "Heathrow" or "LHR-Heathrow" since city is already shown in the group header
    const parenMatch = fullName.match(/\(([^)]+)\)/);
    if (parenMatch) {
        // e.g. "LHR-Heathrow" → "Heathrow"
        const inner = parenMatch[1];
        const dashIdx = inner.indexOf('-');
        if (dashIdx !== -1) {
            return inner.substring(dashIdx + 1).trim();
        }
        return inner;
    }
    // Fallback: strip the city name from the beginning
    if (fullName.startsWith(cityName)) {
        let shortened = fullName.substring(cityName.length).replace(/^[\s,]+/, '');
        return shortened || fullName;
    }
    return fullName;
}

// ─── Grouped Autocomplete Rendering ────────────────────────────────────────

function renderGroupedResults(container, sections, input) {
    sections.forEach((section, sIdx) => {
        // Section header
        if (section.label) {
            const header = document.createElement('div');
            header.className = 'ac-section-header';
            header.textContent = section.label;
            container.appendChild(header);
        } else if (sIdx > 0) {
            // Divider between groups when no label
            const sep = document.createElement('div');
            sep.className = 'ac-section-divider';
            container.appendChild(sep);
        }

        section.items.forEach(res => {
            const item = document.createElement('div');

            // Build CSS classes
            let cls = 'ac-item';
            if (res.indent > 0) cls += ' ac-item-indented';
            if (res.isAllAirports) cls += ' ac-item-city';
            item.className = cls;

            let icon = res.icon || '📍';
            if (!res.icon) {
                if (res.type === 'airport_code') icon = '✈️';
                if (res.type === 'hotel') icon = '🏨';
                if (res.type === 'station') icon = '🚆';
            }

            // Determine display name and subtitle based on result type
            let displayName = res.name;
            let subtitle = '';

            if (res.shortName && res.indent > 0) {
                // Grouped airport: use shortened name (e.g. "Heathrow" instead of full long name)
                displayName = res.shortName;
                subtitle = '';  // No subtitle needed — city is in the group header
            } else if (res.type === 'airport_code' && !res.isAllAirports) {
                // Non-grouped airport: "City, Country" as primary, airport name as subtitle
                // Strip parenthesized code from city name (e.g. "London, KY (LOZ-London-Corbin)" → "London, KY")
                const cleanCity = (res.city || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
                let locParts = [];
                if (cleanCity) locParts.push(cleanCity);
                if (res.country) locParts.push(res.country);
                displayName = locParts.join(', ') || res.name;
                // Extract airport name from parentheses e.g. "(BKK-Suvarnabhumi)" → "Suvarnabhumi"
                const airportName = extractAirportShortName(res.name, cleanCity);
                subtitle = airportName && airportName !== displayName ? airportName : '';
            } else if (res.type === 'place_id' && res.city) {
                // For destinations: use short name as primary, long name as subtitle
                displayName = res.city;
                // Build subtitle from long name parts minus the short name
                const longParts = (res.name || '').split(', ').filter(p => p !== res.city);
                subtitle = longParts.length > 0 ? longParts.join(', ') : (res.country || '');
            } else {
                // For hotels/other: show location info
                let locParts = [];
                if (res.city && res.city !== res.name) locParts.push(res.city);
                if (res.country) locParts.push(res.country);
                subtitle = locParts.join(', ');
            }

            // Code badge (airports)
            let codeDisplay = '';
            if (res.code && res.type === 'airport_code') {
                codeDisplay = `<span class="ac-code">${res.code}</span>`;
            }

            // Star rating (hotels)
            let starsDisplay = '';
            if (res.stars && res.stars > 0) {
                const fullStars = Math.floor(res.stars);
                const halfStar = res.stars % 1 >= 0.5;
                starsDisplay = `<span class="ac-stars">${'★'.repeat(fullStars)}${halfStar ? '½' : ''}</span>`;
            }

            // Name styling
            const nameClass = res.isAllAirports
                ? 'font-semibold text-brand-primary'
                : 'font-medium text-slate-800';

            item.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="ac-icon">${icon}</span>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center flex-wrap gap-1">
                            <span class="${nameClass} truncate">${displayName}</span>
                            ${codeDisplay}
                            ${starsDisplay}
                        </div>
                        ${subtitle ? `<div class="ac-location">${subtitle}</div>` : ''}
                    </div>
                </div>
            `;

            item.onclick = () => {
                input.value = res.name;
                input.dataset.code = res.code;
                input.dataset.id = res.id;
                input.dataset.selType = res.type;
                input.dataset.rawType = res.rawType || '';
                if (res.country) {
                    input.dataset.country = res.country;
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
    });
}

function setupAutocomplete(input) {
    if (!input) return;

    // Disable browser's native autocomplete to avoid overlapping our custom dropdown
    input.setAttribute('autocomplete', 'off');

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
    let requestGeneration = 0; // Stale-request guard: discard results from superseded keystrokes

    input.addEventListener('input', () => {
        const query = input.value;
        const type = input.dataset.type || 'any'; // Dynamic type check

        if (query.length < 3) {
            container.classList.add('hidden');
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const thisGeneration = ++requestGeneration;

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

            // ─── Popular Destination Injection (parallel API calls) ──────────
            let results;
            const eligibleForInjection = (type === 'any' || type === 'tour_region');

            if (eligibleForInjection) {
                const popularMatches = findPopularPrefixMatches(query);

                if (popularMatches.length > 0) {
                    // Fire primary + supplementary calls in parallel — no added latency
                    const primaryPromise = fetchLocations(query, type, countryFilter, placeIdFilter);
                    const supplementaryPromises = popularMatches.map(match =>
                        fetchLocations(titleCaseDestName(match.name), type, null, null)
                            .catch(() => []) // Graceful fallback: ignore failed supplementary calls
                    );

                    const [primaryResults, ...supplementaryBatches] = await Promise.all([
                        primaryPromise,
                        ...supplementaryPromises
                    ]);

                    // Merge and deduplicate by id
                    const seenIds = new Set();
                    results = [];
                    for (const r of primaryResults) {
                        if (!seenIds.has(r.id)) {
                            seenIds.add(r.id);
                            results.push(r);
                        }
                    }
                    for (const batch of supplementaryBatches) {
                        for (const r of batch) {
                            if (!seenIds.has(r.id)) {
                                seenIds.add(r.id);
                                results.push(r);
                            }
                        }
                    }
                } else {
                    results = await fetchLocations(query, type, countryFilter, placeIdFilter);
                }
            } else {
                results = await fetchLocations(query, type, countryFilter, placeIdFilter);
            }

            // Stale-request guard: discard if user has typed more since this request fired
            if (thisGeneration !== requestGeneration) return;

            container.innerHTML = '';
            if (results.length === 0) {
                container.innerHTML = '<div class="p-3 text-sm text-gray-400">No results found</div>';
            } else {
                const sections = groupResults(results, type, query);
                renderGroupedResults(container, sections, input);
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

    // Mirror swap to the mobile-only swap button
    const trSwapMobile = document.getElementById('btn-swap-transfer-mobile');
    if (trSwapMobile && trSwap) {
        trSwapMobile.onclick = trSwap.onclick;
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
            if (!validateInputs(['modal-origin', 'modal-dates'])) return;

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
