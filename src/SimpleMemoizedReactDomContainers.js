import ReactDom from 'react-dom';
import uuid from 'uuid';

import get from 'lodash/get';
import setWith from 'lodash/setWith';
import unset from 'lodash/unset';

export default class SimpleMemoizedReactDomContainers {

    renderedContainers = {};
    renderedContainersIds = [];

    constructor(maxCache = 5000) {
        this.MAX_CACHE = maxCache;
        this._instanceId = uuid.v1();
    }

    getContainer(row, col) {
        return this.getMemoizedContainerRef(row, col) ||
            this.createNewCellContainer(row, col);
    }

    /**
     * Garbage collect node by executing the following:
     *   - remove the id from the ids array
     *   - get the container from the containers object and
     *     unmount any react nodes
     *   - delete the entry from the containers object
     *   - delete the DOM node
     */
    removeFirstContainer() {
        const poppedContainerId = this.renderedContainersIds.shift(0);
        const poppedContainer = get(this.renderedContainers, [
            poppedContainerId.row,
            poppedContainerId.col,
            'container',
        ]);
        ReactDom.unmountComponentAtNode(poppedContainer);
        unset(this.renderedContainers, [[poppedContainerId.row], [poppedContainerId.col]]);
        poppedContainer.remove();
    }

    /**
     * Get the memoized container if it exists, otherwise return
     * null. At the same time, bump the priority of the
     * container to the bottom of the list (highest priority)
     */
    getMemoizedContainerRef(row, col) {
        const container = get(this.renderedContainers, [row, col, 'container'], null);

        if (!container) {
            return null;
        }

        return container;
    }

    /**
     * Create the HTML element but don't attach it to the body.
     * Memoize it using the row, col combination.
     */
    createNewCellContainer(row, col) {
        const container = document.createElement('div');
        container.setAttribute('id', `hot-renderers-${row}-${col}-${this._instanceId}`);
        this.memoizeContainer(container, row, col);
        return container;
    }

    /**
     * Memoize the given container into the `renderedContainers`
     * attribute, then append the `{ row, col }` object to the
     * list of ids used for releasing cached containers.
     */
    memoizeContainer(container, row, col) {
        const {
            renderedContainers,
            renderedContainersIds,
        } = this;
        setWith(renderedContainers, [row, col, 'container'], container, Object);

        if (renderedContainersIds.length >= this.MAX_CACHE) {
            this.removeFirstContainer();
        }

        renderedContainersIds.push({ row, col });
    }
}
