'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _jsLru = require('js-lru');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MemoizedReactDomContainers = function () {
    function MemoizedReactDomContainers() {
        var maxCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;

        _classCallCheck(this, MemoizedReactDomContainers);

        this.MAX_CACHE = maxCache;
        this._instanceId = _uuid2.default.v1();

        this.renderedContainers = new _jsLru.LRUCache(maxCache);
    }

    _createClass(MemoizedReactDomContainers, [{
        key: 'getContainer',
        value: function getContainer(row, col) {
            return this.getMemoizedContainerRef(row, col) || this.createNewCellContainer(row, col);
        }

        /**
         * Garbage collect node by executing the following:
         *   - get the container from the containers object and
         *     unmount any react nodes
         *   - delete the DOM node
         */

    }, {
        key: 'removeFirstContainer',
        value: function removeFirstContainer(poppedContainer) {
            _reactDom2.default.unmountComponentAtNode(poppedContainer);
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
            var container = this.renderedContainers.get([row, col]);

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
            container.setAttribute('class', 'hot-renderers-' + row + '-' + col + '-' + this._instanceId);
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
            if (this.renderedContainers.size >= this.MAX_CACHE) {
                var oldContainer = this.renderedContainers.shift().value;
                this.removeFirstContainer(oldContainer);
            }

            this.renderedContainers.set([row, col], container);
        }
    }]);

    return MemoizedReactDomContainers;
}();

exports.default = MemoizedReactDomContainers;