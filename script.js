// Theme toggle (light/dark)
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function setToggleLabel() {
  const isDark = root.getAttribute('data-theme') === 'dark';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}
setToggleLabel();

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setToggleLabel();
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// World map: fetch + inject inline so it can be styled with the page's
// own CSS variables (an <img> would render it as an isolated document).
const mapContainer = document.getElementById('worldMap');
if (mapContainer) {
  fetch(mapContainer.dataset.src)
    .then((res) => res.text())
    .then((svg) => {
      mapContainer.innerHTML = svg;
    })
    .catch(() => {
      // Leave the noscript fallback's sibling <img> in place if the fetch fails
      const img = document.createElement('img');
      img.src = mapContainer.dataset.src;
      img.alt = 'World map with Japan, Vietnam, Canada, and the United States highlighted';
      mapContainer.appendChild(img);
    });
}

// World map: marker hover/tap tooltips showing visited cities per country
const mapMarkers = document.querySelectorAll('.map-marker');
const mapTooltip = document.getElementById('mapTooltip');

if (mapMarkers.length && mapTooltip) {
  const tooltipCountry = mapTooltip.querySelector('.map-tooltip-country');
  const tooltipCities = mapTooltip.querySelector('.map-tooltip-cities');

  function showMapTooltip(marker) {
    tooltipCountry.textContent = marker.dataset.country;
    tooltipCities.textContent = marker.dataset.cities;
    mapTooltip.style.left = marker.style.left;
    mapTooltip.style.top = marker.style.top;
    mapTooltip.classList.add('visible');
  }

  function hideMapTooltip() {
    mapTooltip.classList.remove('visible');
  }

  mapMarkers.forEach((marker) => {
    marker.addEventListener('mouseenter', () => showMapTooltip(marker));
    marker.addEventListener('mouseleave', hideMapTooltip);
    marker.addEventListener('focus', () => showMapTooltip(marker));
    marker.addEventListener('blur', hideMapTooltip);
    // Tap-to-toggle for touch devices, where hover doesn't apply
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShowingThis = mapTooltip.classList.contains('visible') && tooltipCountry.textContent === marker.dataset.country;
      isShowingThis ? hideMapTooltip() : showMapTooltip(marker);
    });
  });

  document.addEventListener('click', hideMapTooltip);

  // First-time demo: auto-show Japan's tooltip when the map scrolls into
  // view, so visitors learn the dots are hoverable without being told.
  const japanMarker = document.querySelector('.map-marker[data-country="Japan"]');
  const mapSection = document.querySelector('.map-section');
  if (japanMarker && mapSection) {
    const demoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          demoObserver.disconnect();
          setTimeout(() => {
            japanMarker.classList.add('demo-pulse');
            showMapTooltip(japanMarker);
            setTimeout(() => {
              hideMapTooltip();
              japanMarker.classList.remove('demo-pulse');
            }, 2600);
          }, 600);
        });
      },
      { threshold: 0.4 }
    );
    demoObserver.observe(mapSection);
  }
}

// Experience page: keyword search over bullet points
const expSearch = document.getElementById('expSearch');
if (expSearch) {
  const items = document.querySelectorAll('.timeline-item');
  const resultCount = document.getElementById('expResultCount');
  const emptyState = document.getElementById('expEmpty');

  // Cache each bullet's original markup so highlights can be reapplied cleanly on every keystroke
  const bulletData = [];
  items.forEach((item) => {
    const title = item.querySelector('h3');
    const org = item.querySelector('.timeline-org');
    const bullets = Array.from(item.querySelectorAll('li')).map((li) => ({
      el: li,
      original: li.innerHTML,
      // Hidden synonyms/related terms — let a bullet surface for concepts it
      // describes but doesn't literally say (e.g. "project management").
      keywords: (li.dataset.keywords || '').toLowerCase(),
    }));
    bulletData.push({ item, title, org, bullets });
  });

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Wrap matches in <mark>, but only inside text runs (skips existing tags like <strong>)
  function highlight(html, terms) {
    if (!terms.length) return html;
    const re = new RegExp(terms.map(escapeRegExp).join('|'), 'gi');
    return html.replace(/(<[^>]+>)|([^<]+)/g, (whole, tag, text) => {
      if (tag) return tag;
      return text.replace(re, '<mark class="exp-highlight">$&</mark>');
    });
  }

  function runSearch() {
    const query = expSearch.value.trim().toLowerCase();
    // Match each word independently (AND across words) rather than requiring the whole
    // phrase verbatim — "data analytics" should find anything with both words, in any
    // order or position, not just the exact contiguous phrase "data analytics".
    const terms = query.split(/\s+/).filter(Boolean);
    let anyVisible = false;

    bulletData.forEach(({ item, title, org, bullets }) => {
      const headerText = ((title ? title.textContent : '') + ' ' + (org ? org.textContent : '')).toLowerCase();
      const headerMatch = terms.every((t) => headerText.includes(t));

      let itemHasMatch = false;

      bullets.forEach(({ el, original, keywords }) => {
        const haystack = el.textContent.toLowerCase() + ' ' + keywords;
        const bulletMatch = headerMatch || terms.every((t) => haystack.includes(t));
        if (bulletMatch) {
          el.innerHTML = highlight(original, terms);
          el.style.display = '';
          itemHasMatch = true;
        } else {
          el.style.display = 'none';
        }
      });

      item.style.display = itemHasMatch ? '' : 'none';
      if (itemHasMatch) anyVisible = true;
    });

    if (resultCount) {
      resultCount.textContent = query
        ? `Showing results for “${expSearch.value.trim()}”`
        : 'Showing everything — type to filter.';
    }
    if (emptyState) {
      emptyState.style.display = query && !anyVisible ? 'block' : 'none';
    }
  }

  const quickTagButtons = document.querySelectorAll('.tag-btn');

  function setActiveTag(query) {
    quickTagButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.keyword.toLowerCase() === query.toLowerCase());
    });
  }

  expSearch.addEventListener('input', () => {
    setActiveTag(expSearch.value.trim());
    runSearch();
  });

  quickTagButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const keyword = btn.dataset.keyword;
      // Clicking the already-active tag clears the filter; otherwise apply it
      const isActive = btn.classList.contains('active');
      expSearch.value = isActive ? '' : keyword;
      setActiveTag(expSearch.value);
      runSearch();
      expSearch.focus();
    });
  });

  // Pre-fill and run the search if arriving via a link like experience.html?q=product+ownership
  const presetQuery = new URLSearchParams(window.location.search).get('q');
  if (presetQuery) {
    expSearch.value = presetQuery;
    setActiveTag(presetQuery);
    runSearch();
  }
}

// Beyond Work page: "Two truths and a lie" mini game
const truthGame = document.getElementById('truthGame');
if (truthGame) {
  const truthCards = Array.from(truthGame.querySelectorAll('.truth-card'));
  const truthReveal = document.getElementById('truthReveal');
  const truthHeadline = document.getElementById('truthRevealHeadline');
  const truthReplay = document.getElementById('truthReplay');
  const lieCard = truthCards.find((card) => card.dataset.lie === 'true');

  function revealTruths(pickedCard) {
    truthGame.classList.add('revealed');
    truthCards.forEach((card) => card.disabled = true);
    pickedCard.classList.add('truth-picked');

    const guessedLie = pickedCard === lieCard;
    truthHeadline.textContent = guessedLie
      ? '🎯 Correct — that’s the lie.'
      : `Not quite — the lie was #${lieCard.querySelector('.truth-num').textContent}.`;
    truthReveal.classList.add('visible');
  }

  truthCards.forEach((card) => {
    card.addEventListener('click', () => revealTruths(card));
  });

  truthReplay.addEventListener('click', () => {
    truthGame.classList.remove('revealed');
    truthCards.forEach((card) => {
      card.disabled = false;
      card.classList.remove('truth-picked');
    });
    truthReveal.classList.remove('visible');
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}
