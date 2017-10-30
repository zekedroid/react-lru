'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = renderReactCell;

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

var _join = require('lodash/join');

var _join2 = _interopRequireDefault(_join);

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
        val = _ref.val,
        jsx = _ref.jsx;

    if ((0, _isObject2.default)(val)) {
        val = (0, _join2.default)((0, _values2.default)(val), '');
    }
    var getMemoizedContainer = getContainer || function (rowX, colX, val) {
        return memoizedContainers.getContainer(rowX, colX, val);
    };

    var container = getMemoizedContainer(row, col, val);

    _reactDom2.default.render(jsx, container);

    while (td.firstChild) {
        td.removeChild(td.firstChild);
    }

    td.appendChild(container);
}