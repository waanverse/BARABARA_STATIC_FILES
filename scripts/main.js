/**
 * UI.js
 * A lightweight, accessible drawer and accordion component
 */
class UI {
    constructor() {
        // Create singleton overlay for drawers
        this.overlay = this.createOverlay();

        // Initialize all drawers and accordions
        this.initializeDrawers();
        this.initializeAccordions();

        // Set up global event listeners
        this.setupDrawerEventListeners();
        this.setupAccordionEventListeners();
    }

    // --- Drawer Functionality ---

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

    setupDrawerEventListeners() {
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

    // --- Accordion Functionality ---

    initializeAccordions() {
        // Find all accordion containers
        document.querySelectorAll('[data-accordion="collapse"]').forEach((container) => {
            // Get all accordion items within this container
            const accordionItems = container.querySelectorAll("[data-accordion-item]");

            accordionItems.forEach((item) => {
                // Find the button and content section
                const button = item.querySelector("[data-accordion-target]");
                const target = document.querySelector(button?.getAttribute("data-accordion-target"));

                if (button && target) {
                    // Set proper accessibility attributes
                    const isExpanded = button.getAttribute("aria-expanded") === "true";
                    const targetId = target.getAttribute("id") || `accordion-content-${Math.floor(Math.random() * 10000)}`;

                    // Ensure target has an ID
                    target.setAttribute("id", targetId);

                    // Setup button attributes
                    button.setAttribute("aria-controls", targetId);
                    button.setAttribute("aria-expanded", isExpanded ? "true" : "false");

                    // Setup content section
                    target.setAttribute("aria-labelledby", button.getAttribute("id") || "");
                    target.setAttribute("role", "region");

                    // Set initial state
                    if (!isExpanded) {
                        target.classList.add("hidden");
                    }
                }
            });
        });
    }

    setupAccordionEventListeners() {
        // Toggle button clicks for accordions
        document.addEventListener("click", (e) => {
            const button = e.target.closest("[data-accordion-target]");
            if (button) {
                const targetSelector = button.getAttribute("data-accordion-target");
                const target = document.querySelector(targetSelector);

                if (target) {
                    const container = button.closest('[data-accordion="collapse"]');
                    const isExpanded = button.getAttribute("aria-expanded") === "true";

                    // If this is part of an accordion group, close other items first
                    if (container && container.hasAttribute("data-accordion-one-open")) {
                        container.querySelectorAll("[data-accordion-target]").forEach((otherButton) => {
                            if (otherButton !== button && otherButton.getAttribute("aria-expanded") === "true") {
                                const otherTarget = document.querySelector(otherButton.getAttribute("data-accordion-target"));
                                if (otherTarget) {
                                    // Close this accordion
                                    otherTarget.classList.add("hidden");
                                    otherButton.setAttribute("aria-expanded", "false");

                                    // Rotate icon if present
                                    const icon = otherButton.querySelector("[data-accordion-icon]");
                                    if (icon) {
                                        icon.classList.remove("rotate-180");
                                        icon.classList.add("rotate-0");
                                    }
                                }
                            }
                        });
                    }

                    // Toggle current accordion
                    if (isExpanded) {
                        // Close this accordion
                        target.classList.add("hidden");
                        button.setAttribute("aria-expanded", "false");

                        // Rotate icon if present
                        const icon = button.querySelector("[data-accordion-icon]");
                        if (icon) {
                            icon.classList.remove("rotate-180");
                            icon.classList.add("rotate-0");
                        }
                    } else {
                        // Open this accordion
                        target.classList.remove("hidden");
                        button.setAttribute("aria-expanded", "true");

                        // Rotate icon if present
                        const icon = button.querySelector("[data-accordion-icon]");
                        if (icon) {
                            icon.classList.remove("rotate-0");
                            icon.classList.add("rotate-180");
                        }
                    }
                }
            }
        });
    }
}

const ui = new UI();
