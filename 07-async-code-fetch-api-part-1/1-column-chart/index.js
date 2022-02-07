import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    element;
    subElements = {};
    chartHeight = 50;

    constructor({
        url = '',
        range = {
            from: new Date(),
            to: new Date()
        },
        label = '',
        link = '',
        formatHeading = (data) => data,
    } = {}) {

        this.url = new URL(url, BACKEND_URL);
        this.range = range;
        this.label = label;
        this.link = link;
        this.formatHeading = formatHeading;

        this.render();
        this.update(this.range.from, this.range.to);
    }

    get template() {
        return `
            <div class="column-chart" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    ${this.label}
                    <a href="${this.link}" class="column-chart__link">View all</a>
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header"></div>
                    <div data-element="body" class="column-chart__chart"></div>
                </div>
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

    setRange(from, to) {
        this.range.from = from;
        this.range.to = to;
    }

    async loadData(from, to) {
        this.url.searchParams.set('from', from.toISOString());
        this.url.searchParams.set('to', to.toISOString());

        const data = await fetchJson(this.url);

        return data;
    }

    async update(from, to) {
        this.element.classList.add('column-chart_loading');

        const data = await this.loadData(from, to);

        this.setRange(from, to);

        if(data && Object.values(data).length) {
            this.subElements.header.textContent = this.getValue(data);
            this.subElements.body.innerHTML = this.getHistogram(data);

            this.element.classList.remove('column-chart_loading');
        }

        this.data = data;
        
        return this.data;
    }

    getValue(data) {
        const values = Object.values(data);
        const sum = values.reduce((val, acc) => (acc += val), 0);
        return this.formatHeading(sum);
    }

    getColumnProps(values) {
        const maxValue = Math.max(...values);
        const scale = this.chartHeight / maxValue;
      
        return values.map(val => {
          return {
            percent: (val / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(val * scale))
          };
        });
    }

    getHistogram(data) {
        const values = Object.values(data);
        const arr = this.getColumnProps(values);
        return arr.map((item) => {
            return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`
        }).join('');
    }

    destroy() {
        this.element.remove();
        this.subElements = {};
    }
}
