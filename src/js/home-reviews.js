(() => {
  const section = document.getElementById('reviews');
  if (!section) return;
  const realReviews = (window.BUDGETGO_REVIEWS || []).filter(review => review && review.quote && review.name);
  const localPreview = ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
  const reviews = realReviews.length ? realReviews : localPreview ? window.BUDGETGO_REVIEW_PREVIEW || [] : [];
  if (!reviews.length) return;
  const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  /** Create an accessible review card from supplied content without interpreting it as HTML. */
  function renderReview(review) {
    const card = document.createElement('article');
    card.className = 'review-card';
    if (Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) {
      const rating = document.createElement('p');
      rating.className = 'review-stars';
      rating.textContent = review.rating + ' / 5 · ' + review.source;
      card.appendChild(rating);
    }
    const quote = document.createElement('blockquote');
    quote.textContent = '“' + review.quote + '”';
    const footer = document.createElement('footer');
    const identity = document.createElement('div');
    identity.className = 'review-identity';
    const name = document.createElement('span');
    name.className = 'review-name';
    name.textContent = review.name;
    identity.appendChild(name);
    const date = review.date ? new Date(review.date + 'T00:00:00') : null;
    const metadata = [review.source, date && !isNaN(date) ? dateFormat.format(date) : ''].filter(Boolean).join(' · ');
    if (metadata) {
      const meta = document.createElement('span');
      meta.className = 'review-meta';
      meta.textContent = metadata;
      identity.appendChild(meta);
    }
    if (review.avatar) {
      const avatar = document.createElement('img');
      avatar.className = 'review-avatar';
      avatar.src = review.avatar;
      avatar.alt = '';
      avatar.width = 48;
      avatar.height = 48;
      avatar.loading = 'lazy';
      footer.appendChild(avatar);
    }
    footer.appendChild(identity);
    card.append(quote, footer);
    return card;
  }

  const viewport = section.querySelector('.reviews-rows');
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Reviews. Focus here to pause scrolling.');
  const track = document.createElement('div');
  track.className = 'review-track';
  const group = document.createElement('div');
  group.className = 'reviews-grid';
  reviews.forEach(review => group.appendChild(renderReview(review)));
  track.appendChild(group);
  if (reviews.length > 1) {
    // A second identical group closes the visual loop without repeating content for screen readers.
    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.inert = true;
    duplicate.classList.add('reviews-grid--duplicate');
    track.appendChild(duplicate);
    section.dataset.scrollingReviews = '';
  }
  viewport.appendChild(track);
  section.hidden = false;
})();
