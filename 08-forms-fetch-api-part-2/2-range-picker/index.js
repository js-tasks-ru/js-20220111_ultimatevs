export default class RangePicker {
    element;
    subElements = {};
    toggle = true;
    selectingFrom = true;

    onDocumentClick = (event) => {
        const isOpen = this.element.classList.contains('rangepicker_open');
        const isRangePicker = this.element.contains(event.target);
        if(isOpen && !isRangePicker) {
            this.closeRangePicker();
        }
    }

    onInputClick = (event) => {
        const input = event.target.closest('[data-element="input"]');
        if(input) {
            this.element.classList.toggle('rangepicker_open', this.toggle);
            this.toggle = !this.toggle;
        }
        this.getSelector();
    }

    onDayClick = (event) => {
        const day = event.target.classList.contains('rangepicker__cell');
        if(day) {
            this.onRangePickerDayClick(event.target.dataset.value);
        }
    }

    constructor({
        from = new Date(),
        to = new Date()
      } = {}) {
        this.showDateFrom = new Date(from);
        this.from = from;
        this.to = to;

        this.render();

        this.initEventListeners();
    }

    get template() {
        const from = this.formatDate(this.from);
        const to = this.formatDate(this.to);
        return `
            <div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                    <span data-element="from">${from}</span> -
                    <span data-element="to">${to}</span>
                </div>
                <div class="rangepicker__selector" data-element="selector"></div>
            </div>
        `;
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);
    }

    getSubElements(element) {
        const result = {};
        const elements = element.querySelectorAll('[data-element]');

        for(const subElement of elements) {
            const name = subElement.dataset.element;
            result[name] = subElement;
        }
        
        return result;
    }

    initEventListeners() {
        document.addEventListener('click', this.onDocumentClick, true);
        this.subElements.input.addEventListener('click', this.onInputClick);
        this.subElements.selector.addEventListener('click', this.onDayClick);
    }

    formatDate(date) {
        return date.toLocaleString('ru', { dateStyle: 'short' });
    }

    getWeekDay(date) {
        let day = date.getDay();

        if(day === 0) {
            day = 7;
        }

        return day - 1;
    }

    getLastDayOfMonth(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        let newDate = new Date(year, month + 1, 0);
        return newDate.getDate();
    }

    getSelector() {
        const showDate1 = new Date(this.showDateFrom);
        const showDate2 = new Date(this.showDateFrom);
        const selector = this.subElements.selector;

        showDate2.setMonth(showDate2.getMonth() + 1);

        selector.innerHTML = `
                <div class="rangepicker__selector-arrow"></div>
                <div class="rangepicker__selector-control-left"></div>
                <div class="rangepicker__selector-control-right"></div>
                ${this.getCalendar(showDate1)}
                ${this.getCalendar(showDate2)}
        `;

        const leftArrow = selector.querySelector('.rangepicker__selector-control-left');
        const rigthArrow = selector.querySelector('.rangepicker__selector-control-right');

        leftArrow.addEventListener('click', this.prevMonth);
        rigthArrow.addEventListener('click', this.nextMonth);

        this.selectDate();
    }

    prevMonth = () => {
        this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
        this.getSelector();
    }

    nextMonth = () => {
        this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
        this.getSelector();
    }

    getCalendar(showDate) {
        const date = new Date(showDate);
        const month = date.toLocaleString('ru', { month: 'long' });
        const monthAndYear = date.toLocaleString('ru', { month: 'long', year: 'numeric' });
        return `
            <div class="rangepicker__calendar">
                <div class="rangepicker__month-indicator">
                    <time datetime="${month}">${monthAndYear}</time>
                </div>
                <div class="rangepicker__day-of-week">
                    <div>Пн</div>
                    <div>Вт</div>
                    <div>Ср</div>
                    <div>Чт</div>
                    <div>Пт</div>
                    <div>Сб</div>
                    <div>Вс</div>
                </div>
                <div class="rangepicker__date-grid">
                    ${this.getDaysOfMonth(date)}
                </div>
            </div>
        `;
    }

    getDaysOfMonth(date) {
        const firstDayOfMonth = this.getWeekDay(date);
        const lastDayOfMonth = this.getLastDayOfMonth(date);
        const arrayOfDayNumbers = [];
        let index = 0;
        
        for(let day = 1; day <= lastDayOfMonth; day++) {
            arrayOfDayNumbers[index] = day;
            index += 1;
        }

        date.setDate(1);

        return arrayOfDayNumbers.map((numberOfDay, index) => {
            if(index === 0) {
                return `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" style="--start-from: ${firstDayOfMonth}">1</button>`;
            }
            else {
                date.setDate(date.getDate() + 1);
                return `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}">${numberOfDay}</button>`;
            }
        }).join('');
    }

    selectDate() {
        const allDays = this.element.querySelectorAll('.rangepicker__cell');

        for(const day of allDays) {
            const value = day.dataset.value;
            const date = new Date(value);

            day.classList.remove('rangepicker__selected-from');
            day.classList.remove('rangepicker__selected-between');
            day.classList.remove('rangepicker__selected-to');

            if(this.from && value === this.from.toISOString()) {
                day.classList.add('rangepicker__selected-from');
            }
            else if (this.from && this.to && date > this.from && date < this.to) {
                day.classList.add('rangepicker__selected-between');
            }
            else if (this.to && value === this.to.toISOString()) {
                day.classList.add('rangepicker__selected-to');
            }
        }
    }

    onRangePickerDayClick(day) {
        if(day) {
            const dateValue = new Date(day);
            if(this.selectingFrom) {
                this.from = dateValue;
                this.to = null;
                this.selectingFrom = false;
                this.selectDate();
            }
            else {
                if(dateValue > this.from) {
                    this.to = dateValue;
                }
                else if (dateValue < this.from) {
                    this.to = this.from;
                    this.from = dateValue;
                }
                this.selectingFrom = true;
                this.selectDate();
            }
        }

        if(this.from && this.to) {
            this.dispatchEvent();
            this.closeRangePicker();
            this.subElements.from.innerHTML = this.formatDate(this.from);
            this.subElements.to.innerHTML = this.formatDate(this.to);
        }
    }

    closeRangePicker() {
        this.element.classList.remove('rangepicker_open');
        this.toggle = !this.toggle;
    }

    dispatchEvent() {
        this.element.dispatchEvent(new CustomEvent('data-select', {
            bubbles: true,
            detail: {
                from: this.from,
                to: this.to
            }
        }));
    }

    remove() {
        this.element.remove();
        document.removeEventListener('click', this.onDocumentClick);
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}
