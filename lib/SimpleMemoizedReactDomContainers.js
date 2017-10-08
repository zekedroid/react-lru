'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _setWith = require('lodash/setWith');

var _setWith2 = _interopRequireDefault(_setWith);

var _unset = require('lodash/unset');

var _unset2 = _interopRequireDefault(_unset);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleMemoizedReactDomContainers = function () {
    function SimpleMemoizedReactDomContainers() {
        var maxCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;

        _classCallCheck(this, SimpleMemoizedReactDomContainers);

        this.renderedContainers = {};
        this.renderedContainersIds = [];

        this.MAX_CACHE = maxCache;
        this._instanceId = _uuid2.default.v1();
    }

    _createClass(SimpleMemoizedReactDomContainers, [{
        key: 'getContainer',
        value: function getContainer(row, col) {
            return this.getMemoizedContainerRef(row, col) || this.createNewCellContainer(row, col);
        }

        /**
         * Garbage collect node by executing the following:
         *   - remove the id from the ids array
         *   - get the container from the containers object and
         *     unmount any react nodes
         *   - delete the entry from the containers object
         *   - delete the DOM node
         */

    }, {
        key: 'removeFirstContainer',
        value: function removeFirstContainer() {
            var poppedContainerId = this.renderedContainersIds.shift(0);
            var poppedContainer = (0, _get2.default)(this.renderedContainers, [poppedContainerId.row, poppedContainerId.col, 'container']);
            _reactDom2.default.unmountComponentAtNode(poppedContainer);
            (0, _unset2.default)(this.renderedContainers, [[poppedContainerId.row], [poppedContainerId.col]]);
            poppedContainer.remove();
        }

        /**
         * Get the memoized container if it exists, otherwise return
         * null. At the same time, bump the priority of the
         * container to the bottom of the list (highest priority)
         */

    }, {
        key: 'getMemoizedContainerRef',
        value: function getMemoizedContainerRef(row, col) {
            var container = (0, _get2.default)(this.renderedContainers, [row, col, 'container'], null);

            if (!container) {
                return null;
            }

            return container;
        }

        /**
         * Create the HTML element but don't attach it to the body.
         * Memoize it using the row, col combination.
         */

    }, {
        key: 'createNewCellContainer',
        value: function createNewCellContainer(row, col) {
            var container = document.createElement('div');
            container.setAttribute('id', 'hot-renderers-' + row + '-' + col + '-' + this._instanceId);
            this.memoizeContainer(container, row, col);
            return container;
        }

        /**
         * Memoize the given container into the `renderedContainers`
         * attribute, then append the `{ row, col }` object to the
         * list of ids used for releasing cached containers.
         */

    }, {
        key: 'memoizeContainer',
        value: function memoizeContainer(container, row, col) {
            var renderedContainers = this.renderedContainers,
                renderedContainersIds = this.renderedContainersIds;

            (0, _setWith2.default)(renderedContainers, [row, col, 'container'], container, Object);

            if (renderedContainersIds.length >= this.MAX_CACHE) {
                this.removeFirstContainer();
            }

            renderedContainersIds.push({ row: row, col: col });
        }
    }]);

    return SimpleMemoizedReactDomContainers;
}();

exports.default = SimpleMemoizedReactDomContainers;