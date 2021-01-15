import { Attribute, customElement, property, ShadowBase } from "../deps.ts";
import { wcCssReset } from "https://cdn.jsdelivr.net/gh/timonson/salad@latest/wcCssReset.ts";

@customElement("")
export class ModalWindow extends ShadowBase {
  promiseForModalClose: Promise<
    unknown
  > = Promise.resolve();
  @property()
  isVisible: Attribute = null;
  connectedCallback() {
    super.connectedCallback();
    this.dom.id.slot = this.querySelector(
      '*[slot="modal-content"]',
    ) as HTMLElement;
    this.dom.id.modal = this.root.querySelector(".modal") as HTMLDivElement;
    this.dom.id.modalClose = this.root.querySelector(
      ".modal-close",
    ) as HTMLButtonElement;
    this.dom.id.slot = this.querySelector(
      '*[slot="modal-content"]',
    ) as HTMLElement;
    if (this.isVisible !== null) {
      this.promiseForModalClose = this.showModalAndWaitForClose();
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: Attribute,
    newValue: Attribute,
  ) {
    if (newValue === oldValue) return;
    if (this.connected) {
      switch (name) {
        case "is-visible":
          if (newValue === null) {
            if (this.dom.id.modal.classList.contains("show-modal")) {
              this.dispatchEvent(new CustomEvent("modalClose"));
            }
          } else {
            this.promiseForModalClose = this.showModalAndWaitForClose();
          }
          break;
        default:
          return this.update(name, newValue);
      }
    }
    this.update(name, newValue, false);
  }

  showModalAndWaitForClose() {
    return new Promise((resolve) => {
      const toggleModal = () => {
        if (!this.dom.id.modal.classList.contains("show-modal")) {
          this.dom.id.modal.classList.add("show-modal");
          (this.root.querySelector(".modal-body")! as HTMLElement).focus();
          return;
        } else {
          this.dom.id.modal.classList.remove("show-modal");
          this.removeAttribute("is-visible");
          this.dom.id.modalClose.removeEventListener("click", toggleModal);
          this.removeEventListener("keydown", toggleModal);
          this.removeEventListener("modalClose", toggleModal);
          this.dom.id.modal.removeEventListener(
            "click",
            handleClickOnModalWindow,
          );
          resolve(void 0);
        }
      };
      const handleClickOnModalWindow = (event: Event) => {
        if (event.target === this.dom.id.modal) {
          toggleModal();
        }
      };
      this.dom.id.modalClose.addEventListener("click", toggleModal);
      this.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          toggleModal();
        }
      });
      this.addEventListener("modalClose", toggleModal);
      this.dom.id.modal.addEventListener("click", handleClickOnModalWindow);
      toggleModal();
    });
  }

  render() {
    this.css`
      ${wcCssReset}
      :host {
        display: block;
      }
      .modal {
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: scale(1.2);
        transition: visibility 0s linear 0.25s, opacity 0.25s 0s,
          transform 0.25s;
      }
      .show-modal {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: scale(1);
        transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;
      }
      .modal-body {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 32px;
        background: var(--modalWindowBg, white);
        max-height: 90%;
        max-width: 95%;
        border-radius: 0.5rem;
        overflow: auto;
        outline: unset;
      }
      .modal-close {
        position: absolute;
        top: 0.3em;
        right: 0.3em;
        padding: 0.3em;
        cursor: pointer;
        font-size: 38px;
        height: 0.8em;
        width: 0.8em;
        text-indent: 20em;
        overflow: hidden;
        border: 0;
        background-color: inherit;
        transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);
        transition-property: opacity;
      }
      .modal-close::after {
        position: absolute;
        line-height: 0.5;
        top: 0.14em;
        left: 0.12em;
        text-indent: 0;
        content: "\\00D7";
        color: var(--modalWindowCloseButtonColor);
      }
      .modal-close:hover {
        opacity: var(--buttonHoverOpacity, 0.6);
      }
      ::slotted(*) {
        color: var(--modalWindowColor);
      }
      @media (min-width: 420px) {
        .modal-body {
          padding: var(--modalWindowPaddingSmall, 32px);
        }
      .modal-close {
        font-size: 45px;
      }        
      }
      @media (min-width: 670px) {
        .modal-body {
          padding: var(--modalWindowPaddingMid, 3em);
        }
      }
    `;
    return this.html`
      <div class="modal">
  <div tabindex="0" class="modal-body">
    <button class="modal-close">close</button>
    <slot name="modal-content"></slot>
  </div>
</div>
    `;
  }
}
