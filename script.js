// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

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

// Experience page: keyword search over bullet points
const expSearch = document.getElementById('expSearch');
if (expSearch) {
  const items = document.querySelectorAll('.timeline-item');
  const resultCount = document.getElementById('expResultCount');
  const emptyState = document.getElementById('expEmpty');
  const emptyQuery = document.getElementById('expEmptyQuery');

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
  function highlight(html, query) {
    if (!query) return html;
    const re = new RegExp(escapeRegExp(query), 'gi');
    return html.replace(/(<[^>]+>)|([^<]+)/g, (whole, tag, text) => {
      if (tag) return tag;
      return text.replace(re, '<mark class="exp-highlight">$&</mark>');
    });
  }

  function runSearch() {
    const query = expSearch.value.trim().toLowerCase();
    let totalShown = 0;
    let anyVisible = false;

    bulletData.forEach(({ item, title, org, bullets }) => {
      const headerMatch =
        !query ||
        (title && title.textContent.toLowerCase().includes(query)) ||
        (org && org.textContent.toLowerCase().includes(query));

      let itemHasMatch = false;

      bullets.forEach(({ el, original, keywords }) => {
        const bulletMatch =
          headerMatch ||
          el.textContent.toLowerCase().includes(query) ||
          keywords.includes(query);
        if (bulletMatch) {
          el.innerHTML = highlight(original, query);
          el.style.display = '';
          itemHasMatch = true;
          totalShown += 1;
        } else {
          el.style.display = 'none';
        }
      });

      item.style.display = itemHasMatch ? '' : 'none';
      if (itemHasMatch) anyVisible = true;
    });

    if (resultCount) {
      resultCount.textContent = query
        ? `Showing ${totalShown} matching bullet point${totalShown === 1 ? '' : 's'} for “${expSearch.value.trim()}”`
        : 'Showing everything — type to filter.';
    }
    if (emptyState) {
      emptyState.style.display = query && !anyVisible ? 'block' : 'none';
      if (emptyQuery) emptyQuery.textContent = expSearch.value.trim();
    }
  }

  expSearch.addEventListener('input', runSearch);
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
