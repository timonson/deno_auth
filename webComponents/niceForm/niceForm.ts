import {
  Attribute,
  customElement,
  isNotNull,
  property,
  ShadowBase,
} from "../deps.ts";

type Input = {
  label: string;
  type: string;
  id: string;
  attributes: [string, string][];
}[];

@customElement("nice-form")
export class NiceForm extends ShadowBase {
  @property({ wait: true, reflect: false })
  input: Input = [];
  @property({ reflect: false })
  form: [string, string][] = [];

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
    input:focus:not(#submit-container input) {
       box-shadow: 0 0 0 1.4pt var(--secondaryTeal);
    }
      #submit-container input {
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
      #submit-container input:hover {
        background:var(--niceFormSubmitBgOnHover);
        color:var(--niceFormSubmitColorOnHover);
      }
    `;
    this.html`
      <form @id="formId" 
        ${
      this.form.map(([attribute, val]) => `${attribute}="${val}"`).join(
        " ",
      )
    }>

        ${
      this.input.map(({ label, type, id, attributes }) =>
        type !== "submit"
          ? `
                  <label for="${label}"
                    >${label}<input
                      type="${type}"
                      name="${label}"
                      id="${id}"
                      ${
            attributes.map(([attribute, val]) => `${attribute}="${val}"`).join(
              " ",
            )
          }
                  /></label>
                `
          : `
        <div id="submit-container">
          <input
            name="${id}"
            type="submit"
            value="${label}"
                      ${
            attributes.map(([attr, val]) => `${attr}="${val}"`).join(
              " ",
            )
          }
            id="${id}"
          />
        </div>`
      )
    }
        </form>
    `;
    (this.root.querySelector("#submit-container input") as HTMLInputElement)
      .addEventListener(
        "click",
        (err) => this.handleButtonClick(err),
      );
  }

  handleButtonClick(event: MouseEvent) {
    event.preventDefault();
    if ((this.dom.id.formId as HTMLFormElement).reportValidity()) {
      const entries = this.input.map(({ id }) => ([
        id,
        (this.root.querySelector(`#${id}`) as null | HTMLInputElement)?.value,
      ]));
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
