if (!customElements.get("custom-hotspot")) {
  class CustomHotspot extends HTMLElement {
    constructor() {
      super();
      this.popupContainer = this.querySelector('.custom-hotspot__popup-container');
      this.popupWrapper = this.querySelector('.custom-hotspot__popup-wrapper');
      this.closeButton = this.querySelector('.close-button-container');
      this.productCardWrapper = this.querySelector('.product-card-main-wrapper');
      this.loadingSpinner = this.popupContainer?.querySelector('.loading-spinner-container .loading__spinner');

      this.activeHotspot = null;
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
      this.handleHotspotClick = this.handleHotspotClick.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
    }

    connectedCallback() {
      this.addEventListener("click", this.handleHotspotClick);

      if (this.closeButton) {
        this.closeButton.addEventListener("click", this.closePopup.bind(this));
      }

      this.popupContainer?.addEventListener("click", this.handleOutsideClick);
      document.addEventListener("keydown", this.handleKeydown);
    }

    disconnectedCallback() {
      this.removeEventListener("click", this.handleHotspotClick);
      this.popupContainer?.removeEventListener("click", this.handleOutsideClick);
      document.removeEventListener("keydown", this.handleKeydown);
    }

    handleOutsideClick(event) {
      const isPopupVisible = !this.popupContainer.classList.contains("hidden");
      const isClickInsidePopup = this.popupWrapper?.contains(event.target);

      if (isPopupVisible && !isClickInsidePopup) {
        this.closePopup();
      }
    }

    handleKeydown(event) {
      if (event.key === "Escape") {
        this.closePopup();
      }
    }

    closePopup() {
      this.popupContainer?.classList.add("hidden");
      if (this.productCardWrapper) this.productCardWrapper.innerHTML = "";
      document.body.style.overflow = "auto";

      if (this.activeHotspot) {
        this.activeHotspot.focus();
        this.activeHotspot = null;
      }
    }

    handleHotspotClick(event) {
      const clickedHotspot = event.target.closest('.hotspot-icon-container');
      if (!clickedHotspot) return;

      this.activeHotspot = clickedHotspot;
      const productHandle = clickedHotspot.getAttribute("data-product-handle");
      if (!productHandle) return;

      this.loadProductCardContent(productHandle);
    }

    async loadProductCardContent(productHandle) {
      if (!this.popupContainer || !this.productCardWrapper) return;

      this.popupContainer.classList.remove("hidden");
      this.loadingSpinner?.classList.remove('hidden');
      document.body.style.overflow = "hidden";
      this.popupWrapper.focus();

      try {
        const response = await fetch(`/products/${productHandle}?view=popup-product-card`);
        if (!response.ok) throw new Error('Failed to load product data');

        const htmlText = await response.text();
        const parser = new DOMParser();
        const parsedDocument = parser.parseFromString(htmlText, 'text/html');
        const productContent = parsedDocument.querySelector("body");

        if (productContent) {
          this.loadingSpinner?.classList.add('hidden');
          this.productCardWrapper.innerHTML = productContent.innerHTML;
        } else {
          this.productCardWrapper.innerHTML = "<p>Product content not found.</p>";
        }
      } catch (error) {
        console.error("Error loading product card:", error);
        this.productCardWrapper.innerHTML = "<p>Something went wrong. Please try again.</p>";
      }
    }
  }

  customElements.define("custom-hotspot", CustomHotspot);
}
