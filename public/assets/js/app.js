const filterContainer = document.getElementById('categoryFilter');
const productCards = Array.from(document.querySelectorAll('.product-card'));

if (filterContainer && productCards.length) {
  const categories = Array.from(
    new Set(productCards.map(card => card.dataset.category))
  );

  const allButton = createButton('Todos', true);
  filterContainer.appendChild(allButton);

  categories.forEach(category => {
    filterContainer.appendChild(createButton(category));
  });

  filterContainer.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    const selected = button.dataset.category;
    filterContainer.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn === button);
    });

    productCards.forEach(card => {
      const matches = selected === 'Todos' || card.dataset.category === selected;
      card.style.display = matches ? 'flex' : 'none';
    });
  });
}

const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));

if (revealTargets.length) {
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(index * 0.05, 0.4)}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach(el => observer.observe(el));
}

function createButton(label, isActive = false) {
  const button = document.createElement('button');
  button.textContent = label;
  button.dataset.category = label;
  button.className = `filter-btn${isActive ? ' active' : ''}`;
  return button;
}
