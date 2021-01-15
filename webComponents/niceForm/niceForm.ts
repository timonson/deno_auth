import {
  Attribute,
  customElement,
  isNotNull,
  property,
  ShadowBase,
} from "../deps.ts";

// Calculating Color: Dynamic Color Theming with Pure CSS
// https://una.im/css-color-theming/
@customElement("nice-form")
export class NiceForm extends ShadowBase {
  @property()
  items = [[""]];
  @property()
  primaryHsl: Attribute = null;
  @property()
  buttonValue: Attribute = "Submit";
  @property()
  buttonName: Attribute = null;
  @property()
  isRequired: Attribute = null;
  @property()
  action: Attribute = null;
  @property()
  method: Attribute = null;

  render() {
    this.css`
      :host {
        display: inline-block;
        box-sizing: border-box;
        cursor: default;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }
    
    label,
      #submit-container {
        display: flex;
        flex-direction: row;
        max-width: 100%;
        line-height: 25px;
      }
    label{
        justify-content: var(--niceFormLabelJustifyContent, var(--niceFormJustifyContent, flex-end));
      align-items: center;
      font-size:var(--niceFormLabelFontSize);
        margin-bottom: var(--niceFormLabelMarginBottom, 10px);
      white-space:nowrap;
    }
    #submit-container{
        justify-content: var(--niceFormSubmitJustifyContent, var(--niceFormJustifyContent, flex-end));
    }
      input {
        height: 28px;
        border:none;
        border-radius:6px;
        flex: 0 0 220px;
        margin-left: 10px;
        max-width: var(--niceFormInputWidth);
        outline: unset;
        text-align: center;
  font: var(--niceFormInputFont);

      }
    input:focus:not(#submit) {
       box-shadow: 0 0 0 1.4pt var(--secondaryTeal);
    }
      #submit {
        font:inherit;
        font-size:17px;
        font-weight: 500;
        height: 30px;
        background:var(--niceFormSubmitBg);
        color:var(--niceFormSubmitColor);
        border: var(--niceFormSubmitBorder, 1.7px solid var(--primaryDark));
        border-radius: 5px;
        margin: var(--niceFormSubmitMargin, 1em 1.5em 0 0);
        cursor: pointer;
        transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);
        transition-property: background-color, opacity;
        max-width: var(--niceFormSubmitMaxWidth);
      }
      #submit:hover {
        background:var(--niceFormSubmitBgOnHover);
        color:var(--niceFormSubmitColorOnHover);
      }
    `;
    return this.html`
      <form @id="formId" ${this.action &&
      `action="${this.action}"`} ${this.method && `method="${this.method}"`}">
        ${
      this.items[0].length > 0 && !!this.items[0][0]
        ? this.items.map(
          ([label, type, placeholder]) =>
            `
                  <label for="${label}"
                    >${label}<input
                      type="${type}"
                      name="${label}"
                      id="${label.toLowerCase().trim().slice(0, -1)}"
                      placeholder="${placeholder || ""}"
                      ${isNotNull(this.isRequired) ? "required" : ""}
                      spellcheck="false"
                  /></label>
                `,
        )
        : ""
    }
        <div id="submit-container">
          <input
            name="${this.buttonName}"
            type="submit"
            @id="submit onclick=${(e) => this.handleButtonClick(e)}"
            value="${this.buttonValue}"
          />
        </div>
      </form>
    `;
  }

  handleButtonClick(event: MouseEvent) {
    event.preventDefault();
    if ((this.dom.id.formId as HTMLFormElement).reportValidity()) {
      const entries = this.items.map(([label]) => {
        return [
          label.toLowerCase().trim().slice(0, -1),
          label
              .toLowerCase()
              .trim()
              .slice(0, -1)
              .match(/^[0-9a-zA-Z]+$/) &&
            this.root.querySelector(
              `#${label.toLowerCase().trim().slice(0, -1)}`,
            )
            ? (this.root.querySelector(
              `#${label.toLowerCase().trim().slice(0, -1)}`,
            ) as HTMLInputElement).value
            : "",
        ];
      });
      this.dispatchEvent(
        new CustomEvent("niceFormSubmit", {
          detail: Object.fromEntries(entries),
          bubbles: true,
          composed: true,
        }),
      );
      setTimeout(
        () => (this.dom.id["formId"] as HTMLFormElement).reset(),
        500,
      );
    }
  }
}
