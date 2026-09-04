/**
 * Member Carousel Module
 * Handles infinite scrolling, touch/mouse dragging, and controllable autoplay.
 */
(function (global) {
  "use strict";

  function initCarousel(wrapperEl, carouselEl) {
    if (!wrapperEl || !carouselEl) return null;

    const firstCard = carouselEl.querySelector(".card");
    if (!firstCard) return null;

    const firstCardWidth = firstCard.offsetWidth || 280;
    const arrowBtns = wrapperEl.querySelectorAll("i");
    const carouselChildren = [...carouselEl.children];

    let isDragging = false;
    let isAutoPlay = true;
    let startX = 0;
    let startScrollLeft = 0;
    let timeoutId = null;

    // Get number of cards visible at once
    let cardPerView = Math.max(1, Math.round(carouselEl.offsetWidth / (firstCardWidth || 1)));

    // Duplicate end items to start for infinite scroll
    carouselChildren
      .slice(-cardPerView)
      .reverse()
      .forEach((card) => {
        carouselEl.insertAdjacentHTML("afterbegin", card.outerHTML);
      });

    // Duplicate start items to end for infinite scroll
    carouselChildren.slice(0, cardPerView).forEach((card) => {
      carouselEl.insertAdjacentHTML("beforeend", card.outerHTML);
    });

    // Initial scroll position
    carouselEl.classList.add("no-transition");
    carouselEl.scrollLeft = carouselEl.offsetWidth;
    carouselEl.classList.remove("no-transition");

    // Arrow navigation
    arrowBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = btn.id === "left" ? -firstCardWidth : firstCardWidth;
        carouselEl.scrollLeft += step;
      });
    });

    const dragStart = (e) => {
      isDragging = true;
      carouselEl.classList.add("dragging");
      startX = e.pageX;
      startScrollLeft = carouselEl.scrollLeft;
    };

    const dragging = (e) => {
      if (!isDragging) return;
      carouselEl.scrollLeft = startScrollLeft - (e.pageX - startX);
    };

    const dragStop = () => {
      isDragging = false;
      carouselEl.classList.remove("dragging");
    };

    const infiniteScroll = () => {
      if (carouselEl.scrollLeft === 0) {
        carouselEl.classList.add("no-transition");
        carouselEl.scrollLeft = carouselEl.scrollWidth - 2 * carouselEl.offsetWidth;
        carouselEl.classList.remove("no-transition");
      } else if (
        Math.ceil(carouselEl.scrollLeft) >=
        carouselEl.scrollWidth - carouselEl.offsetWidth - 1
      ) {
        carouselEl.classList.add("no-transition");
        carouselEl.scrollLeft = carouselEl.offsetWidth;
        carouselEl.classList.remove("no-transition");
      }

      clearTimeout(timeoutId);
      if (!wrapperEl.matches(":hover") && isAutoPlay) {
        startAutoplay();
      }
    };

    function startAutoplay() {
      if (window.innerWidth < 800 || !isAutoPlay) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        carouselEl.scrollLeft += firstCardWidth;
      }, 2500);
    }

    function pause() {
      isAutoPlay = false;
      clearTimeout(timeoutId);
    }

    function resume() {
      isAutoPlay = true;
      startAutoplay();
    }

    carouselEl.addEventListener("mousedown", dragStart);
    carouselEl.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);
    carouselEl.addEventListener("scroll", infiniteScroll);
    wrapperEl.addEventListener("mouseenter", pause);
    wrapperEl.addEventListener("mouseleave", resume);

    // Initial start
    startAutoplay();

    return {
      pause,
      resume,
    };
  }

  const CarouselModule = {
    init: initCarousel,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = CarouselModule;
  } else {
    global.CarouselModule = CarouselModule;
  }
})(typeof window !== "undefined" ? window : globalThis);
