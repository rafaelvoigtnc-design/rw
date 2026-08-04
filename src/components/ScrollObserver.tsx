'use client';

import { useEffect, useRef } from 'react';

export default function ScrollObserver() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const observeElements = () => {
      const elements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale');
      elements.forEach((el) => observer.observe(el));
    };

    observeElements();

    // Re-observe after a short delay to catch dynamically loaded content
    setTimeout(observeElements, 100);

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
