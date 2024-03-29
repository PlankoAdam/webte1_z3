class ComboSlider extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.inputTypeNumber = document.createElement("input");
    this.inputTypeNumber.type = "number";
    this.inputTypeNumber.className = "custom-number";

    this.inputTypeRange = document.createElement("input");
    this.inputTypeRange.type = "range";
    this.inputTypeRange.className = "custom-range";

    this.container = document.createElement("div");
    this.container.id = "container";

    this.thumbContainer = document.createElement("div");
    this.thumbContainer.id = "thumb-container";
    this.thumb = document.createElement("div");
    this.thumb.id = "thumb";

    this.container.appendChild(this.inputTypeRange);
    this.container.appendChild(this.thumbContainer);
    this.thumbContainer.appendChild(this.thumb);
    this.container.appendChild(this.inputTypeNumber);

    this.thumbHeight = 18;

    const style = document.createElement("style");
    style.innerHTML = `
                #container {
                  display: flex;
                  flex-direction: column;
                  width: 10rem;
                }

                .custom-range {
                  margin: 0;
                }

                .custom-range::-webkit-slider-runnable-track, .custom-range::-moz-range-track {
                  width: 100%;
                  height: 8px;
                  cursor: pointer;
                  animate: 0.2s;
                  background: #ffffff;
                  border-radius: 3px;
                  border: 1px solid #aaaaaa;
                }

                .custom-range::-webkit-slider-thumb, .custom-range::-moz-range-thumb {
                  width: 35px;
                  height: ${this.thumbHeight}px;
                  background: #000000;
                  opacity: 0;
                  cursor: pointer;
                }

                .custom-range:focus {
                  outline: none;
                }

                .custom-number {
                  margin-top: 0.3rem;
                }
                
                #thumb-container {
                  width: 35px;
                  height: ${this.thumbHeight}px;
                  border: 2px #aaaaaa solid;
                  border-radius: 3px;
                  background: #ffffff;
                  box-sizing: border-box;
                  position: relative;
                  pointer-events: none;
                  text-align: center;
                  margin-top: ${-this.thumbHeight}px;
                  cursor: pointer;
                }

                #thumb {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -55%);
                  pointer-events: none;
                  font-size: 10pt;
                }
          `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.container);

    this.inputTypeNumber.addEventListener("keypress", function (evt) {
      if (
        (evt.key.charCodeAt() < 48 || evt.key.charCodeAt() > 57) &&
        evt.key !== "Enter"
      ) {
        evt.preventDefault();
      }
    });

    this.inputTypeNumber.addEventListener("change", () => {
      if (this.inputTypeNumber.value > this.max)
        this.inputTypeNumber.value = this.max;
      else if (this.inputTypeNumber.value < this.min)
        this.inputTypeNumber.value = this.min;
      this.value = this.inputTypeNumber.value;
      this.inputTypeRange.value = this.value;
      this.updateThumb();
      this.dispatchEvent(new Event("change"));
    });

    this.inputTypeRange.addEventListener("input", () => {
      this.value = this.inputTypeRange.value;
      this.inputTypeNumber.value = this.value;
      this.updateThumb();
      this.dispatchEvent(new Event("change"));
    });
  }

  static get observedAttributes() {
    return ["minimum", "maximum"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == "minimum") {
      this.min = Number(newValue);
      this.inputTypeNumber.setAttribute("min", this.min);
      this.inputTypeRange.setAttribute("min", this.min);
    } else if (name == "maximum") {
      this.max = Number(newValue);
      this.inputTypeNumber.setAttribute("max", this.max);
      this.inputTypeRange.setAttribute("max", this.max);
    }
    const middle = Math.round((this.max + this.min) / 2);
    this.inputTypeNumber.value = middle;
    this.inputTypeRange.value = middle;
    this.thumb.innerText = middle;
    this.value = this.inputTypeNumber.value;
    this.updateThumb();
  }

  updateThumb() {
    const ratio = Math.round(
      ((this.value - this.min) / (this.max - this.min)) * 100
    );
    this.thumbContainer.style.left = ratio + "%";
    this.thumbContainer.style.transform = `translate(${-ratio}%, 0%)`;
    this.thumb.innerText = this.value;
  }
}

customElements.define("combo-slider", ComboSlider);
