export default class SortableList {
    element;

    onPointerDown = (event) => {
        const element = event.target.closest('.sortable-list__item');
        if(element) {
            if(event.target.closest('[data-grab-handle]')) {
                event.preventDefault();
                this.dragging(element, event);
            }
            else if(event.target.closest('[data-delete-handle]')) {
                event.preventDefault();
                element.remove();
            }
        }
    }

    onPointerMove = ({ clientX, clientY }) => {
        this.positionOfDraggingElement(clientX, clientY);

        const prevElement = this.placeholder.previousElementSibling;
        const nextElement = this.placeholder.nextElementSibling;

        this.swapElements(clientY, prevElement, nextElement);
    }

    onPointerUp = () => {
        this.draggingElement.style.cssText = '';
        this.draggingElement.classList.remove('sortable-list__item_dragging');
        this.placeholder.replaceWith(this.draggingElement);
        this.draggingElement = null;

        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerup', this.onPointerUp);
    }

    constructor(data = { items = [] } = {}) {
        this.items = data.items;
        this.render();
        this.initEventListeners();
    }

    render() {
        this.element = document.createElement('ul');
        this.element.classList.add('sortable-list');
        this.items.forEach(item => {
            item.classList.add('sortable-list__item');
            this.element.append(item);
        });
    }

    initEventListeners() {
        this.element.addEventListener('pointerdown', this.onPointerDown);
    }

    dragging(element, { clientX, clientY }) {
        this.draggingElement = element;
        const { x, y } = element.getBoundingClientRect();
        const { offsetWidth, offsetHeight } = element;

        this.shiftX = clientX - x;
        this.shiftY = clientY - y;

        this.draggingElement.style.width = `${offsetWidth}px`;
        this.draggingElement.style.height = `${offsetHeight}px`;
        this.draggingElement.classList.add('sortable-list__item_dragging');

        this.placeholder = this.createPlaceholder(offsetWidth, offsetHeight);

        this.draggingElement.after(this.placeholder);
        this.element.append(this.draggingElement);
        this.positionOfDraggingElement(clientX, clientY);

        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerup', this.onPointerUp);
    }

    createPlaceholder(width, height) {
        const element = document.createElement('li');
        element.classList.add('sortable-list__placeholder');
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;

        return element;
    }

    swapElements(clientY, prevElement = null, nextElement = null) {
        const { firstElementChild, lastElementChild } = this.element;

        const firstElementTop = firstElementChild.getBoundingClientRect().top;
        const lastElementBottom = lastElementChild.getBoundingClientRect().bottom;

        if(clientY < firstElementTop) {
            return firstElementChild.before(this.placeholder);
        }

        if(clientY > lastElementBottom) {
            return lastElementChild.after(this.placeholder);
        }

        if(prevElement) {
            const { top, height } = prevElement.getBoundingClientRect();
            const center = top + (height / 2);

            if(clientY < center) {
                return prevElement.before(this.placeholder);
            }
        }

        if(nextElement) {
            const {top, height} = nextElement.getBoundingClientRect();
            const center = top + (height / 2);

            if(clientY > center) {
                return nextElement.after(this.placeholder);
            }
        }
    }

    positionOfDraggingElement(clientX, clientY) {
        this.draggingElement.style.left = `${clientX - this.shiftX}px`;
        this.draggingElement.style.top = `${clientY - this.shiftY}px`;
    }

    remove() {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
        this.element = null;
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerup', this.onPointerUp);
    }
}
