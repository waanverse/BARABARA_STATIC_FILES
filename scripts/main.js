/**
 * Drawer.js
 * A lightweight, accessible drawer component
 */
class Drawer {
    constructor() {
        // Create singleton overlay
        this.overlay = this.createOverlay();

        // Initialize all drawers
        this.initializeDrawers();

        // Set up global event listeners
        this.setupEventListeners();
    }

    createOverlay() {
        const overlay = document.createElement("div");
        overlay.className = "waanui_drawer-overlay";
        document.body.appendChild(overlay);
        return overlay;
    }

    initializeDrawers() {
        document.querySelectorAll(".drawer").forEach((drawer) => {
            drawer.setAttribute("role", "dialog");
            drawer.setAttribute("aria-modal", "true");
            drawer.setAttribute("aria-hidden", "true");

            const drawerId = drawer.dataset.drawer;
            document.querySelectorAll(`[data-drawer-toggle="${drawerId}"]`).forEach((toggle) => {
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-controls", drawerId);
            });
        });
    }

    setupEventListeners() {
        // Toggle button clicks
        document.addEventListener("click", (e) => {
            const toggle = e.target.closest("[data-drawer-toggle]");
            if (toggle) {
                const drawerId = toggle.dataset.drawerToggle;
                this.toggleDrawer(drawerId);
            }
        });

        // Overlay clicks
        this.overlay.addEventListener("click", () => {
            this.closeAllDrawers();
        });

        // Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeAllDrawers();
            }
        });
    }

    toggleDrawer(drawerId) {
        const drawer = document.querySelector(`[data-drawer="${drawerId}"]`);
        if (!drawer) return;

        const isOpen = drawer.classList.contains("open");

        if (isOpen) {
            this.closeDrawer(drawer);
        } else {
            this.openDrawer(drawer);
        }
    }

    openDrawer(drawer) {
        // Close any open drawers first
        this.closeAllDrawers();

        // Store the element that had focus
        this.lastFocusedElement = document.activeElement;

        // Open the drawer
        drawer.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");

        // Show overlay
        this.overlay.classList.add("open");

        // Update ARIA
        const drawerId = drawer.dataset.drawer;
        document.querySelectorAll(`[data-drawer-toggle="${drawerId}"]`).forEach((toggle) => {
            toggle.setAttribute("aria-expanded", "true");
        });

        // Focus first focusable element
        this.trapFocus(drawer);

        // Dispatch event
        drawer.dispatchEvent(new CustomEvent("drawer:opened"));
    }

    closeDrawer(drawer) {
        // Close the drawer
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");

        // Hide overlay if no other drawers are open
        if (!document.querySelector(".drawer.open")) {
            this.overlay.classList.remove("open");
        }

        // Update ARIA
        const drawerId = drawer.dataset.drawer;
        document.querySelectorAll(`[data-drawer-toggle="${drawerId}"]`).forEach((toggle) => {
            toggle.setAttribute("aria-expanded", "false");
        });

        // Restore focus
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }

        // Dispatch event
        drawer.dispatchEvent(new CustomEvent("drawer:closed"));
    }

    closeAllDrawers() {
        document.querySelectorAll(".drawer.open").forEach((drawer) => {
            this.closeDrawer(drawer);
        });
    }

    trapFocus(drawer) {
        const focusable = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

        if (focusable.length) {
            focusable[0].focus();
        }

        drawer.addEventListener("keydown", function (e) {
            if (e.key === "Tab") {
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
}

// Initialize drawer system
const drawer = new Drawer();
