import { Attribute, customElement, property, ShadowBase } from "../deps.ts";

@customElement("")
export class MyGreeter extends ShadowBase {
  @property()
  beforeText = "";
  @property()
  betweenText = "";
  @property()
  afterText = "";
  @property()
  topic = "";
  @property()
  mood = "";
  render() {
    this.css`
 :host {
        display: block;
        text-align: center;
      }
      .colorful {
        color: var(--greeterThemeColor, pink);
      }
      .decorated {
        text-decoration: var(--greeterThemeColor, pink) wavy underline 2px;
      }
    `;
    return this.html`
<h1>
      ${this.beforeText}<span class="decorated">${this.topic}</span>${this.betweenText}<span class="colorful">${this.mood}</span>${this.afterText}
    </h1>
    `;
  }
}
