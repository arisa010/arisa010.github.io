(() => {
  // Create enough consecutive identical groups to fill the visible strip, then
  // move by exactly one group's measured width before repeating from zero.
  // Identical content at both boundaries makes the animation seamless.
  function loopTrack(viewportSelector, trackSelector, speedPxPerSecond) {
    const viewport = document.querySelector(viewportSelector);
    const track = viewport?.querySelector(trackSelector);
    if (!viewport || !track) return;
    const baseItems = Array.from(track.children).map(item => item.cloneNode(true));
    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation = null;
    let sizeCache = -1;

    function addCycle() {
      const group = document.createDocumentFragment();
      for (const original of baseItems) {
        const duplicate = original.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        duplicate.querySelectorAll('img').forEach(img => {
          img.alt = '';
          img.loading = 'eager';
        });
        group.appendChild(duplicate);
      }
      const start = track.children.length;
      track.appendChild(group);
      return track.children[start];
    }

    function refresh() {
      animation?.cancel();
      animation = null;
      track.replaceChildren(...baseItems.map(item => item.cloneNode(true)));
      if (motionReduced.matches) return;
      const first = track.firstElementChild;
      if (!first) return;
      const firstCopy = addCycle();
      const cycle = firstCopy.offsetLeft - first.offsetLeft;
      if (cycle <= 0) return;
      // Covers the entire viewport throughout every point of the cycle.
      while (track.scrollWidth < viewport.clientWidth + cycle + 4) addCycle();
      animation = track.animate(
        [{transform:'translate3d(0,0,0)'},{transform:`translate3d(-${cycle}px,0,0)`}],
        {duration:cycle / speedPxPerSecond * 1000, iterations:Infinity, easing:'linear', direction:'normal'}
      );
      sizeCache = viewport.clientWidth;
    }

    let scheduled = false;
    function scheduleRefresh() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        if (viewport.clientWidth !== sizeCache || motionReduced.matches) refresh();
      });
    }
    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('load', refresh, {once:true});
    motionReduced.addEventListener?.('change', refresh);
    document.fonts?.ready.then(refresh);
    refresh();
  }

  loopTrack('.strip-viewport', '.strip-track', 32);
  loopTrack('.footer-marquee', '.footer-marquee-track', 52);
})();
