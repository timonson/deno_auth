import { Attribute, customElement, property, ShadowBase } from "../deps.ts";

@customElement("stylish-anchor")
export class StylishAnchor extends ShadowBase {
  @property()
  anchorHref: Attribute = null;
  @property()
  innerContent: Attribute = this.innerHTML;
  connectedCallback() {
    super.connectedCallback();
  }
  attributeChangedCallback(
    name: string,
    oldValue: Attribute,
    newValue: Attribute,
  ) {
    if (newValue === oldValue) return;
    switch (name) {
      case "inner-content":
        if (this.connected) this.dom.id["aId"].innerHTML = newValue || "";
        break;
      case "anchor-href":
        if (this.connected) {
          this.dom.id["aId"].setAttribute("href", newValue || "");
        }
        break;
      default:
        this.update(name, newValue);
    }
    this.update(name, newValue, false);
  }
  render() {
    this.css`
      :host {
        display: inline-block;
        font-weight: 500;
        border-radius: 16.5px;
      padding: 4px 11.5px 4px 15.5px;
        align-items: center;
        cursor:pointer;
    white-space: nowrap;
        transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);
        transition-property: background-color, opacity;
        background:var(--stylishAnchorBg);
        color:var(--stylishAnchorColor);
      }
      :host(:hover){
        background:var(--stylishAnchorBgOnHover);
        opacity: var(--stylishAnchorOpacityOnHover, 1);
      }
      :host(:hover) a{
color:var(--stylishAnchorColorOnHover);
      }        


.rootLink {
    display: block;
    font-family: inherit;
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    text-decoration: none;
    transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-property: background-color, opacity;
    white-space: inherit;
    user-select: none;
    font-size: var(--stylishAnchorFontSize, 15px);
    line-height: 25px;
    font-weight: inherit;
    color: inherit;
  }

 a.rootLink    {
letter-spacing:-0.5px;
font-weight:600;
    }

      .HoverArrow {
        --arrowHoverTransition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);
        --arrowHoverOffset: translateX(3px);
        position: relative;
        top: 1px;
        margin-left: 8px;
        stroke-width: 2;
        fill: none;
        stroke: currentColor;
      }
      .HoverArrow__linePath {
        opacity: 0;
        transition: opacity var(--hoverTransition, var(--arrowHoverTransition));
      }
      .HoverArrow__tipPath {
        transition: transform
          var(--hoverTransition, var(--arrowHoverTransition));
      }
      :host(:hover) .HoverArrow__linePath {
        opacity: 1;
      }
      :host(:hover) .HoverArrow__tipPath {
        transform: var(--arrowHoverOffset);
      }
    `;
    return this.html`<a 
        @id="aId"
        class="rootLink"
        href="${this.anchorHref}"
        >${this.innerContent}<svg
          class="HoverArrow"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <g fill-rule="evenodd">
            <path class="HoverArrow__linePath" d="M0 5h7"></path>
            <path class="HoverArrow__tipPath" d="M1 1l4 4-4 4"></path>
          </g>
        </svg>
      </a>`;
  }
}
