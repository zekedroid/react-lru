import ReactDom from 'react-dom';
import uuid from 'uuid';
import { LRUCache } from 'js-lru';

export default class MemoizedReactDomContainers {

    constructor(maxCache = 5000) {
        this.MAX_CACHE = maxCache;
        this._instanceId = uuid.v1();

        this.renderedContainers = new LRUCache(maxCache);
    }

    getContainer(row, col, val) {
        return this.getMemoizedContainerRef(row, col, val) ||
            this.createNewCellContainer(row, col, val);
    }

    /**
     * Garbage collect node by executing the following:
     *   - get the container from the containers object and
     *     unmount any react nodes
     *   - delete the DOM node
     */
    removeFirstContainer(poppedContainer) {
        ReactDom.unmountComponentAtNode(poppedContainer);
        poppedContainer.remove();
    }

    /**
     * Get the memoized container if it exists, otherwise return
     * null. At the same time, bump the priority of the
     * container to the bottom of the list (highest priority)
     */
    getMemoizedContainerRef(row, col, val) {
        const container = this.renderedContainers.get([row, col, val]);

        if (!container) {
            return null;
        }

        return container;
    }

    /**
     * Create the HTML element but don't attach it to the body.
     * Memoize it using the row, col, val combination.
     */
    createNewCellContainer(row, col, val) {
        const container = document.createElement('div');
        container.setAttribute('class', `hot-renderers-${row}-${col}-${this._instanceId}`);
        this.memoizeContainer(container, row, col, val);
        return container;
    }

    /**
     * Memoize the given container into the `renderedContainers`
     * attribute, then append the `{ row, col, val }` object to the
     * list of ids used for releasing cached containers.
     */
    memoizeContainer(container, row, col, val) {
        if (this.renderedContainers.size >= this.MAX_CACHE) {
            const oldContainer = this.renderedContainers.shift().value;
            this.removeFirstContainer(oldContainer);
        }

        this.renderedContainers.set([row, col, val], container);
    }
}
