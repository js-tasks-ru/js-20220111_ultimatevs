import RangePicker from './components/range-picker/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    subElements = {};
    element;

    constructor() {
        this.components = {};
        this.url = new URL('api/dashboard/bestsellers', BACKEND_URL);
    }

    get template() {
        return (        
        `<div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>
            <h3 class="block-title">Best sellers</h3>
            <div data-element="sortableTable"></div>
        </div>`);
    }

    async render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);

        this.createComponents();
        this.renderComponents(this.components);
        this.initEventListeners();

        return this.element;
    }

    getSubElements(element) {
        const result = {};
        const subElements = element.querySelectorAll('[data-element]');

        for(const subElement of subElements) {
            const name = subElement.dataset.element;
            result[name] = subElement;
        }

        return result;
    }

    initEventListeners() {
        this.components.rangePicker.element.addEventListener('date-select', event => {
            const from = event.detail.from;
            const to = event.detail.to;
            this.updateComponents(from, to);
        });
    }

    createComponents() {
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));

        const rangePicker = new RangePicker({ 
            from: from, 
            to: to
        });

        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range: {
              from: from,
              to: to,
            },
            label: 'orders',
            link: '#'
        });
    
        const salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            range: {
                from: from,
                to: to,
            },
            label: 'sales',
            formatHeading: data => `$${data}`
        });
    
        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            range: {
                from: from,
                to: to,
            },
            label: 'customers',
        });

        const sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?start=1&end=21&from=${from.toISOString()}&to=${to.toISOString()}`,
            isSortLocally: true
        });

        this.components = {
            rangePicker: rangePicker,
            ordersChart: ordersChart,
            salesChart: salesChart,
            customersChart: customersChart,
            sortableTable: sortableTable,
        }
    }

    renderComponents(components) {
        const keys = Object.keys(components);
        keys.forEach(key => {
            const root = this.subElements[key];
            root.append(components[key].element);
        });
    }

    async updateComponents(from, to) {
        const data = await this.loadData(from, to);
        this.components.sortableTable.update(data);

        this.components.ordersChart.update(from, to);
        this.components.salesChart.update(from, to);
        this.components.customersChart.update(from, to);
    }

    async loadData(from, to) {
        this.url.searchParams.set('_start', '1');
        this.url.searchParams.set('_end', '21');
        this.url.searchParams.set('_sort', 'title');
        this.url.searchParams.set('from', from.toISOString());
        this.url.searchParams.set('to', to.toISOString());

        return fetchJson(this.url);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
        for(const component of this.components) {
            component.destroy();
        }
    }
}
