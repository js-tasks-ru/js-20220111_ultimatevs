export default class SortableTable {
  element;
  subElements = {};
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
      
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getTableHeader()}
          </div>
      
          <div data-element="body" class="sortable-table__body">
            ${this.getTableBody(this.data)}
          </div>
      
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
      
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
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
          ${this.getTableBodyRow(item)}
        </a>
      `;
      }).join('');
  }

  getTableBodyRow(item) {
    return this.headerConfig.map(({id, template}) => {
      return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  sort(field, order) {
    const sortedData = [...this.data];
    const currentHeadOfColumn = this.element.querySelector(`[data-id=${field}]`);

    const columns = this.element.querySelectorAll('[data-id]');
    columns.forEach((col) => {
      col.dataset.order = '';
    })

    currentHeadOfColumn.dataset.order = order; 

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

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
