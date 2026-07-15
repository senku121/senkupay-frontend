/* ==========================================
   SENKU PAY
   Homepage Script
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("siteHeader");
    const menuButton = document.querySelector(".menu-btn");
    const menuIcon = menuButton?.querySelector("i");
    const navLinks = document.querySelector(".nav-links");
    const navButtons = document.querySelector(".nav-buttons");
    const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const internalAnchorLinks = document.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll("section[id]");
    const yearElement = document.getElementById("currentYear");
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterEmail = document.getElementById("newsletterEmail");
    const newsletterMessage = document.getElementById("newsletterMessage");

    let menuOpen = false;
    let counterAnimationStarted = false;
    let scrollFrameRequested = false;

    const setMenuState = (open) => {
        menuOpen = open;

        navLinks?.classList.toggle("mobile-active", open);
        navButtons?.classList.toggle("mobile-active", open);
        document.body.classList.toggle("menu-open", open);

        if (menuButton) {
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute(
                "aria-label",
                open ? "Close navigation menu" : "Open navigation menu"
            );
        }

        if (menuIcon) {
            menuIcon.classList.toggle("fa-bars", !open);
            menuIcon.classList.toggle("fa-xmark", open);
        }
    };

    menuButton?.addEventListener("click", () => {
        setMenuState(!menuOpen);
    });

    document.addEventListener("click", (event) => {
        if (!menuOpen) return;

        const clickedInsideNavigation =
            navLinks?.contains(event.target) ||
            navButtons?.contains(event.target) ||
            menuButton?.contains(event.target);

        if (!clickedInsideNavigation) {
            setMenuState(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuOpen) {
            setMenuState(false);
            menuButton?.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900 && menuOpen) {
            setMenuState(false);
        }
    });

    internalAnchorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            setMenuState(false);
        });
    });

    const updateHeader = () => {
        header?.classList.toggle("scrolled", window.scrollY > 40);
    };

    const updateActiveNavigation = () => {
        let currentSection = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 160;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.id;
            }
        });

        navigationLinks.forEach((link) => {
            link.classList.toggle(
                "active-link",
                link.getAttribute("href") === `#${currentSection}`
            );
        });
    };

    const handleScroll = () => {
        if (scrollFrameRequested) return;

        scrollFrameRequested = true;

        window.requestAnimationFrame(() => {
            updateHeader();
            updateActiveNavigation();
            scrollFrameRequested = false;
        });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    updateHeader();
    updateActiveNavigation();

    const revealElements = document.querySelectorAll(
        ".feature-card, .service-card, .testimonial-card, .stat-box"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.remove("reveal-hidden");
                    entry.target.classList.add("reveal-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.14,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        revealElements.forEach((element, index) => {
            element.classList.add("reveal-hidden");
            element.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("reveal-visible");
        });
    }

    const animateCounter = (element) => {
        if (element.dataset.static === "true") return;

        const target = Number(element.dataset.counter);
        const prefix = element.dataset.prefix || "";
        const suffix = element.dataset.suffix || "";

        if (!Number.isFinite(target)) return;

        const duration = 1800;
        const startTime = performance.now();
        const decimals = Number.isInteger(target) ? 0 : 2;

        const render = (time) => {
            const progress = Math.min((time - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = target * easedProgress;

            element.textContent =
                prefix +
                current.toFixed(decimals).replace(/\.00$/, "") +
                suffix;

            if (progress < 1) {
                window.requestAnimationFrame(render);
            }
        };

        window.requestAnimationFrame(render);
    };

    const statsSection = document.querySelector(".stats-section");

    if (statsSection && "IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || counterAnimationStarted) return;

                    counterAnimationStarted = true;
                    document
                        .querySelectorAll(".stat-box h2")
                        .forEach(animateCounter);

                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.25 }
        );

        counterObserver.observe(statsSection);
    }

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }

    newsletterForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = newsletterEmail?.value.trim() || "";

        newsletterMessage?.classList.remove("success", "error");

        if (!email || !newsletterEmail?.checkValidity()) {
            if (newsletterMessage) {
                newsletterMessage.textContent =
                    "Enter a valid email address.";
                newsletterMessage.classList.add("error");
            }

            newsletterEmail?.focus();
            return;
        }

        /*
         * Newsletter backend integration can be added later.
         * No request is sent until a real newsletter endpoint exists.
         */
        if (newsletterMessage) {
            newsletterMessage.textContent =
                "Newsletter registration will be available soon.";
            newsletterMessage.classList.add("success");
        }

        newsletterForm.reset();
    });
});
