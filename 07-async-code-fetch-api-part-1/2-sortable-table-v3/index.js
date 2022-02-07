import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  start = 0;
  step = 30;
  end = this.start + this.step;
  loading = false;

  handleClick = (event) => {
    const th = event.target.closest('[data-sortable="true"]');

    if(th) {
      const field = th.dataset.id;
      const newOrder = th.dataset.order === 'desc' ? 'asc' : 'desc';

      this.sorted = {
        id: field,
        order: newOrder
      };

      this.sort(field, newOrder);
    }
  }

  handleWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if(bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  }

  constructor(headerConfig = [], {
    url = '',
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = false;

    this.render();
    this.initEventListeners();
  }

  get template() {
    return `
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getTableHeader()}
          </div>

          <div data-element="body" class="sortable-table__body"></div>

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>

        </div>
    `;
  }

  render = async () => {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    const { id, order } = this.sorted;

    const data = await this.loadData(id, order, this.start, this.end);
    
    this.renderRows(data);

    if(this.data.length) {
      this.sort(id, order);
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for(const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
    window.addEventListener('scroll', this.handleWindowScroll);
  }

  loadData = async (id, order, start, end) => {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    const data = await fetchJson(this.url);
    
    return data;
  }

  getTableHeader() {
    return this.headerConfig
      .map(item => {
          return `
            <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
              <span>${item.title}</span>
              <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>
            </div>
          `;
        }).join('');
  }

  getTableBody(data) {
    return data.map(item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableBodyRows(item)}
          </a>
        `;
      }).join('');
  }

  getTableBodyRows(item) {
    return this.headerConfig.map(({id, template}) => {
      return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('')
  }

  renderRows(data) {
    if(data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.data = data;
      this.subElements.body.innerHTML = this.getTableBody(data);
    }
    else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  sort(field, order) {
    const currentHeadOfColumn = this.element.querySelector(`[data-id=${field}]`);

    const columns = this.element.querySelectorAll('[data-id]');

    columns.forEach((col) => {
      col.dataset.order = '';
    })

    currentHeadOfColumn.dataset.order = order;

    if(this.isSortLocally) {
      this.sortOnClient(field, order);
    } 

    else if(!this.isSortLocally) {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    const sortedData = [...this.data];

    const currentColumn = this.headerConfig.find(item => item.id === field);
    const sortType = currentColumn.sortType;

    const orderType = {
      asc: 1,
      desc: -1
    }
    const destination = orderType[order];

    if(sortType === 'number') {
      sortedData.sort((a, b) => destination * (a[field] - b[field]));
    }

    else if(sortType === 'string') {
      sortedData.sort((a, b) => destination * (a[field].localeCompare(b[field], 'ru-en-u-kf-upper')));
    }

    else {
      sortedData.sort((a, b) => destination * (a[field] - b[field]));
    }

    this.subElements.body.innerHTML = this.getTableBody(sortedData);
  }

  sortOnServer = async (field, order) => {
    const start = 0;
    const end = start + this.step;
    this.element.classList.add('sortable-table_loading');
    const data = await this.loadData(field, order, start, end);
    this.element.classList.remove('sortable-table_loading');
    this.renderRows(data);
  }

  update(data) {
    const rows = document.createElement('div');
    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableBody(data);
    this.subElements.body.append(...rows.childNodes);
  }

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElement = {};
  }
}
