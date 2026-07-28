(() => {
    "use strict";

    const header = document.getElementById("siteHeader");
    const floatingControls = document.getElementById("floatingControls");
    const floatingNavButton = document.getElementById("floatingNavButton");
    const floatingNavMenu = document.getElementById("floatingNavMenu");
    const backToTop = document.getElementById("backToTop");
    const solarStage = document.getElementById("solarStage");
    const phoneWrap = document.getElementById("phoneWrap");
    const mobileNavigation = document.querySelector(".mobile-navigation");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const setScrolledState = () => {
        const isScrolled = window.scrollY > 36;
        header?.classList.toggle("scrolled", isScrolled);
        floatingControls?.classList.toggle("visible", window.scrollY > 420);
    };

    const closeFloatingNavigation = () => {
        if (!floatingNavMenu || !floatingNavButton) return;
        floatingNavMenu.classList.remove("open");
        floatingNavButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("floating-nav-open");
    };

    floatingNavButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        const willOpen = !floatingNavMenu?.classList.contains("open");
        floatingNavMenu?.classList.toggle("open", willOpen);
        floatingNavButton.setAttribute("aria-expanded", String(willOpen));
        document.body.classList.toggle("floating-nav-open", willOpen && window.innerWidth < 681);
    });

    floatingNavMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeFloatingNavigation);
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".floating-nav-wrap")) {
            closeFloatingNavigation();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeFloatingNavigation();
            if (mobileNavigation?.open) mobileNavigation.open = false;
        }
    });

    backToTop?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });

    mobileNavigation?.querySelectorAll("a[href^='#']").forEach((link) => {
        link.addEventListener("click", () => {
            mobileNavigation.open = false;
        });
    });

    window.addEventListener("scroll", setScrolledState, { passive: true });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 680) document.body.classList.remove("floating-nav-open");
    });
    setScrolledState();

    // Reveal elements without changing or depending on existing application logic.
    const revealItems = document.querySelectorAll(".reveal-item");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("revealed"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px" });

        revealItems.forEach((item) => revealObserver.observe(item));
    }

    // Counter animation. Values remain identical to the HTML when motion is reduced.
    const counters = document.querySelectorAll("[data-counter]");
    const animateCounter = (element) => {
        if (element.dataset.counted === "true") return;
        element.dataset.counted = "true";

        const target = Number.parseFloat(element.dataset.counter || "0");
        const prefix = element.dataset.prefix || "";
        const suffix = element.dataset.suffix || "";
        const decimalPlaces = String(target).includes(".") ? String(target).split(".")[1].length : 0;

        if (reduceMotion.matches) {
            element.textContent = `${prefix}${target.toFixed(decimalPlaces)}${suffix}`;
            return;
        }

        const duration = 1150;
        const startedAt = performance.now();

        const frame = (now) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            element.textContent = `${prefix}${value.toFixed(decimalPlaces)}${suffix}`;
            if (progress < 1) requestAnimationFrame(frame);
        };

        requestAnimationFrame(frame);
    };

    if ("IntersectionObserver" in window && !reduceMotion.matches) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.45 });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach(animateCounter);
    }

    // Noticeable but controlled phone + sun pointer movement on devices with a fine pointer.
    const finePointer = window.matchMedia("(pointer: fine)");
    if (solarStage && phoneWrap && finePointer.matches && !reduceMotion.matches) {
        const resetPhone = () => {
            solarStage.style.setProperty("--pointer-x", "0px");
            solarStage.style.setProperty("--pointer-y", "0px");
            phoneWrap.style.setProperty("--pointer-x", "0px");
            phoneWrap.style.setProperty("--pointer-y", "0px");
            phoneWrap.style.setProperty("--tilt-x", "7deg");
            phoneWrap.style.setProperty("--tilt-y", "-13deg");
        };

        solarStage.addEventListener("pointermove", (event) => {
            const rect = solarStage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            solarStage.style.setProperty("--pointer-x", `${x * 22}px`);
            solarStage.style.setProperty("--pointer-y", `${y * 18}px`);
            phoneWrap.style.setProperty("--pointer-x", `${x * 20}px`);
            phoneWrap.style.setProperty("--pointer-y", `${y * 14}px`);
            phoneWrap.style.setProperty("--tilt-x", `${7 - y * 8}deg`);
            phoneWrap.style.setProperty("--tilt-y", `${-13 + x * 11}deg`);
        });

        solarStage.addEventListener("pointerleave", resetPhone);
    }

    // Highlight the visible section in both navigation systems.
    const sectionLinks = document.querySelectorAll("a[href^='#']");
    const trackedSections = [...new Set(
        [...sectionLinks]
            .map((link) => link.getAttribute("href"))
            .filter((href) => href && href.length > 1)
    )]
        .map((selector) => document.querySelector(selector))
        .filter(Boolean);

    if ("IntersectionObserver" in window && trackedSections.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const targetSelector = `#${entry.target.id}`;
                sectionLinks.forEach((link) => {
                    link.classList.toggle("active-link", link.getAttribute("href") === targetSelector);
                });
            });
        }, { rootMargin: "-35% 0px -55%", threshold: 0 });

        trackedSections.forEach((section) => sectionObserver.observe(section));
    }

    const currentYear = document.getElementById("currentYear");
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());

    // Only provide a lightweight fallback when the existing script does not handle this form.
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterEmail = document.getElementById("newsletterEmail");
    const newsletterMessage = document.getElementById("newsletterMessage");

    newsletterForm?.addEventListener("submit", (event) => {
        if (event.defaultPrevented) return;
        event.preventDefault();

        const email = newsletterEmail?.value.trim() || "";
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!newsletterMessage) return;
        newsletterMessage.classList.remove("success", "error");

        if (!isValid) {
            newsletterMessage.textContent = "Enter a valid email address.";
            newsletterMessage.classList.add("error");
            newsletterEmail?.focus();
            return;
        }

        newsletterMessage.textContent = "Thanks — you are on the update list.";
        newsletterMessage.classList.add("success");
        newsletterForm.reset();
    });
})();
