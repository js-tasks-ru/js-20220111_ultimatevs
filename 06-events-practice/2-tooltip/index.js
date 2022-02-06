class Tooltip {
  element;
  static init;

  constructor() {
    if(Tooltip.init) {
      return Tooltip.init;
    }
    Tooltip.init = this;
  }

  onPointerOver = (event) => {
    const element = event.target.closest('[data-tooltip]');
    if(element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = (event) => {
    const margin = 10;
    const left = event.clientX + margin;
    const top = event.clientY + margin;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  onPointerOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  initialize () {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  render(text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = text;

    document.body.append(this.element);
  }

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerout', this.onPointerOut);
    this.element = null;
  }
}

export default Tooltip;
