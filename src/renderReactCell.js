import ReactDom from 'react-dom';

/**
 * Renders React JSX into a given DOM element.
 * @param  {Object} options.memoizedContainers Object with containers
 * @param  {func} options.getContainer takes `row, col` as args and returns the container
 * @param  {HTML elem} options.td           element passed through the Handsontable custom renderer
 * @param  {int} options.row                current row number
 * @param  {int} options.col                current column number
 * @param  {JSX} options.jsx                React node to render safely
 */
export default function renderReactCell({ memoizedContainers, getContainer, td, row, col, jsx }) {
    const getMemoizedContainer = getContainer || ((rowX, colX) => memoizedContainers.getContainer(rowX, colX));

    const container = getMemoizedContainer(row, col);

    ReactDom.render(jsx, container);

    while (td.firstChild) {
        td.removeChild(td.firstChild);
    }

    td.appendChild(container);
}
