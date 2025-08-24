if (!customElements.get("custom-product-card")) {
  class CustomProductCard extends HTMLElement {
    constructor() {
      super();
      this.variantInputs = this.querySelectorAll(".variant-container input[type='radio']");
      this.colorVariantInputs = this.querySelectorAll(".color-variants input[type='radio']");
      this.sizeVariantInputs = this.querySelectorAll(".size-variants input[type='radio']");
      this.sizeDropdownDetails = this.querySelector(".size-variants details");
      this.variantIdField = this.querySelector("form input[name='id']");
      this.productForm = this.querySelector("form");
      this.addToCartBtn = this.productForm.querySelector("button[type='submit']");
      this.loadingIndicator = this.querySelector(".loading__spinner");
      this.errorContainer = this.querySelector(".product-card-error-message-container");
      this.soldOutMsg = this.querySelector(".sold-out-message");
      this.variantsData = JSON.parse(this.getAttribute("data-variant-details"));
      this.colorHighlightElement = this.querySelector(".color-variant-active");

      this.closestHotspot = this.closest("custom-hotspot");
      this.addOnSizeVariant = this.closestHotspot?.getAttribute("data-size-variant");
      this.addOnColorVariant = this.closestHotspot?.getAttribute("data-color-variant");
      this.addOnProductId = this.closestHotspot?.getAttribute("data-add-on-product-id");
      
      this.onVariantChangeBound = this.onVariantChange.bind(this);
      this.onFormSubmitBound = this.onFormSubmit.bind(this);
    }

    connectedCallback() {
      this.variantInputs.forEach(input => input.addEventListener("change", this.onVariantChangeBound));
      this.productForm.addEventListener("submit", this.onFormSubmitBound);
    }

    disconnectedCallback() {
      this.variantInputs.forEach(input => input.removeEventListener("change", this.onVariantChangeBound));
      this.productForm.removeEventListener("submit", this.onFormSubmitBound);
    }

    onVariantChange(event) {
      const targetInput = event.target;

      if (targetInput.closest(".color-variants")) {
        this.colorVariantInputs.forEach(input => input.closest("label")?.classList.remove("active"));
        targetInput.closest("label")?.classList.add("active");
        this.updateColorHighlight();
      }

      if (targetInput.closest(".size-variants")) {
        const sizeValue = targetInput.value;
        const summaryText = this.querySelector(".details-summary-text");
        if (summaryText) summaryText.textContent = sizeValue;
        this.sizeDropdownDetails.removeAttribute("open");
      }

      const selectedColor = this.querySelector(".color-variants input:checked")?.value;
      const selectedSize = this.querySelector(".size-variants input:checked")?.value;

      if (selectedColor && selectedSize) {
        const matchedVariant = this.variantsData.find(
          variant => variant.option1 === selectedSize && variant.option2 === selectedColor
        );

        if (matchedVariant) {
          this.variantIdField.value = matchedVariant.id;

          if (matchedVariant.available) {
            this.addToCartBtn.disabled = false;
            this.soldOutMsg?.classList.add("hidden");
            this.soldOutMsg?.setAttribute("aria-hidden", "true");
          } else {
            this.addToCartBtn.disabled = true;
            this.soldOutMsg?.classList.remove("hidden");
            this.soldOutMsg?.setAttribute("aria-hidden", "false");
          }
        } else {
          this.variantIdField.value = "";
          this.addToCartBtn.disabled = true;
          this.soldOutMsg?.classList.remove("hidden");
          this.soldOutMsg?.setAttribute("aria-hidden", "false");
        }
      }
    }

    updateColorHighlight() {
      const checkedInput = this.querySelector(".color-variants input:checked");
      const checkedLabel = checkedInput?.closest("label");
      if (!checkedLabel) return;

      const swatch = checkedLabel.querySelector(".swatch-display");
      if (!swatch) return;

      const swatchWidth = swatch.offsetWidth;
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = checkedLabel;

      this.colorHighlightElement.style.width = `${offsetWidth - swatchWidth}px`;
      this.colorHighlightElement.style.height = `${offsetHeight}px`;
      this.colorHighlightElement.style.left = `${offsetLeft + swatchWidth}px`;
      this.colorHighlightElement.style.top = `${offsetTop}px`;
    }

    showErrorMessage(message) {
      const errorText = this.errorContainer.querySelector(".error-message-text");
      errorText.textContent = message;
      this.errorContainer.classList.remove("visibility-hidden");
      this.errorContainer.setAttribute("aria-hidden", "false");

      setTimeout(() => {
        this.errorContainer.classList.add("visibility-hidden");
        this.errorContainer.setAttribute("aria-hidden", "true");
      }, 3000);
    }

    onFormSubmit(event) {
      event.preventDefault();

      const selectedColor = this.querySelector(".color-variants input:checked")?.value;
      const selectedSize = this.querySelector(".size-variants input:checked")?.value;

      if (!selectedColor && !selectedSize) {
        this.showErrorMessage("Please select product variants");
        return;
      }

      if (!selectedColor) {
        this.showErrorMessage("Please select color variant");
        return;
      }

      if (!selectedSize) {
        this.showErrorMessage("Please select size variant");
        return;
      }

      this.addToCartBtn.classList.add("loading");
      this.loadingIndicator?.classList.remove("hidden");

      const config = fetchConfig("javascript");
      config.headers["X-Requested-With"] = "XMLHttpRequest";
      delete config.headers["Content-Type"];

      const formData = new FormData(this.productForm);

      if (
        this.addOnSizeVariant &&
        this.addOnColorVariant &&
        selectedSize === this.addOnSizeVariant &&
        selectedColor === this.addOnColorVariant &&
        this.addOnProductId
      ) {
        formData.append("items[1][id]", this.addOnProductId);
        formData.append("items[1][quantity]", 1);
      }

      const mainVariantId = this.variantIdField.value;
      if (mainVariantId) {
        formData.delete("id");
        formData.append("items[0][id]", mainVariantId);
        formData.append("items[0][quantity]", 1);
      }

      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then(response => response.json())
        .then(response => {
          if (response.status && response.message) {
            this.showErrorMessage(response.message);
          } else {
            window.location.href = "/cart";
          }
        })
        .catch(error => {
          console.error(error);
          this.showErrorMessage("Something went wrong. Please try again.");
        })
        .finally(() => {
          this.addToCartBtn.classList.remove("loading");
          this.loadingIndicator?.classList.add("hidden");
        });
    }
  }

  customElements.define("custom-product-card", CustomProductCard);
}
