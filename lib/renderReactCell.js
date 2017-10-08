'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = renderReactCell;

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Renders React JSX into a given DOM element.
 * @param  {Object} options.memoizedContainers Object with containers
 * @param  {func} options.getContainer takes `row, col` as args and returns the container
 * @param  {HTML elem} options.td           element passed through the Handsontable custom renderer
 * @param  {int} options.row                current row number
 * @param  {int} options.col                current column number
 * @param  {JSX} options.jsx                React node to render safely
 */
function renderReactCell(_ref) {
    var memoizedContainers = _ref.memoizedContainers,
        getContainer = _ref.getContainer,
        td = _ref.td,
        row = _ref.row,
        col = _ref.col,
        jsx = _ref.jsx;

    var getMemoizedContainer = getContainer || function (rowX, colX) {
        return memoizedContainers.getContainer(rowX, colX);
    };

    var container = getMemoizedContainer(row, col);

    _reactDom2.default.render(jsx, container);

    while (td.firstChild) {
        td.removeChild(td.firstChild);
    }

    td.appendChild(container);
}