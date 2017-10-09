# react-lru
Least recently used (LRU) cache algorithm rendering of React roots

For more in depth discussion on why this is necessary, see my [medium post](https://medium.com/p/23d6a8624d45/edit).


## Installation

To install run

```shell
npm intall --save react-lru
```

Use this library by importing the two main components into your project

```javascript
import { renderReactCell, MemoizedReactDomContainers } from 'react-lru';
```

## Usage

This library allows you to render React elements into an HTML element that is never removed (or at least controlled by an upper bound and removed when reaching a set number of cached elements).

The most common place where this might be used is in an infinite scrollable table that does not do proper garbage collection of React components, such as Handsontable.

An example renderer might look like:

```javascript
function sampleRenderer(td, row, col, value) {
    ReactDom.render((<ReactCell
          row={row}
          col={col}
        >{value}</ReactCell>), td);
    return td;
}
```

This, in Handsontable, will mount React components on almost every render iteration while the user scrolls because React is not able to diff the root node, which changes all the time.

To use `react-lru`, create an instance of the memoized containers (the least recently used cache) and use the safe rendering function:

```javascript
const memoizedContainers = new MemoizedReactDomContainers(2000);

function sampleRenderer(td, row, col, value) {
    renderReactCell({
        memoizedContainers,
        td,
        row,
        col,
        jsx: (<ReactCell
          row={row}
          col={col}
        >{value}</ReactCell>),
    });
}
```

The table will now mount at most one `ReactCell` for each row and column combination (unless the data changes).

## Documentation

This library uses [`js-lru`](https://github.com/rsms/js-lru) for its Least Recently Used cache implementation. As such, all of those methods (which are almost identical to that of a JavaScript Map object) can be access through the `renderedContainers` attribute of your MemoizedReactDomContainers instance, ie.

To get the current size of your cache:

```javascript
const memoizedContainers = new MemoizedReactDomContainers(2000);
console.log(memoizedContainers.renderedContainers.size) // 0 at first
```

For a full list of API methods, see the [`js-lru` documentation](https://github.com/rsms/js-lru#api);

### `renderReactCell`

Passed in the form of an options object:

`memoizedContainers`: a cache instance. The minimum requirements are that it have a method for getting a memoized cell based on the row and column indeces. This library comes with `MemoizedReactDomContainers` which uses the LRU cache algorithm for an optimal solution.
`getContainer`: (optional) in the case that the `MemoizedReactDomContainers` class is not used, this is a function that takes `row` and `col` as its arguments and returns the memoized container per the user's own implementation of the cache.
`td`: the HTML element to render the memoized container into. Note that this element will get wiped on every call to `renderReactCell` and the memoized container will be added as a child using the `td.appendChild` method.
`row`: integer value of the row index
`col`: integer value of the column index
`jsx`: React JSX to render into a memoized container

### `MemoizedReactDomContainers`

Its only argument is the maximum size of the cache. Defaults to 5000.

### `SimpleMemoizedReactDomContainers`

An alternate version of the `MemoizedReactDomContainers` where LRU is not used but instead uses a "first in, first out" algorithm. May be used in place of the `MemoizedReactDomContainers`.
