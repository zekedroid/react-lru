/* global describe, beforeEach, afterEach, it */
/* eslint max-len: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { sandbox as sinonSandbox } from 'sinon';

import MemoizedReactDomContainers from '../MemoizedReactDomContainers';
import renderReactCell from '../renderReactCell';

class TestLabel extends React.Component {
    static propTypes = {
        row: PropTypes.number.isRequired,
        col: PropTypes.number.isRequired,
        content: PropTypes.string,
        onContentChange: PropTypes.func,
    }

    componentWillMount() {
    }

    componentWillReceiveProps({ content }) {
        this.props.onContentChange && content !== this.props.content && this.props.onContentChange(content);
    }

    componentWillUnmount() {
    }

    render() {
        return (<span>ROW: {this.props.row}, COL: {this.props.col}</span>);
    }
}

describe('MemoizedReactDomContainers test suite', () => {
    it('should initialize with default MAX_CACHE', () => {
        const memoizedContainers = new MemoizedReactDomContainers();
        expect(memoizedContainers.MAX_CACHE).to.equal(5000);
    });

    it('should initialize with passed MAX_CACHE', () => {
        const MAX_CACHE = 100;
        const memoizedContainers = new MemoizedReactDomContainers(MAX_CACHE);
        expect(memoizedContainers.MAX_CACHE).to.equal(MAX_CACHE);
    });
});

describe('renderReactCell test suite', () => {
    let tdContainers;
    let sandbox;

    beforeEach(() => {
        sandbox = sinonSandbox.create();

        tdContainers = document.createElement('div');
        tdContainers.setAttribute('id', 'td-containers');

        document.body.appendChild(tdContainers);
    });

    afterEach(() => {
        sandbox.restore();

        tdContainers = document.getElementById('td-containers');
        document.body.removeChild(tdContainers);
    });

    it('should render at cell 0, 0 and get memoized', () => {
        const memoizedContainers = new MemoizedReactDomContainers();

        const td = tdContainers.appendChild(document.createElement('td'));

        renderReactCell({
            memoizedContainers,
            td,
            row: 0,
            col: 0,
            jsx: <h1>Hello, world!</h1>,
        });

        const container = memoizedContainers.renderedContainers.get([0, 0]);
        expect(container).to.be.ok;
        expect(container.className).to.equal(`hot-renderers-0-0-${memoizedContainers._instanceId}`);
    });

    it('should render at cell 0, 0 and use memoized value when rendering a second time', () => {
        const memoizedContainers = new MemoizedReactDomContainers();

        const td = tdContainers.appendChild(document.createElement('td'));

        renderReactCell({
            memoizedContainers,
            td,
            row: 0,
            col: 0,
            jsx: <h1>Hello, world!</h1>,
        });
        renderReactCell({
            memoizedContainers,
            td,
            row: 0,
            col: 0,
            jsx: <h1>Hello, world!</h1>,
        });

        const container = memoizedContainers.renderedContainers.get([0, 0]);
        expect(container).to.be.ok;

        const elems = document.getElementsByClassName(`hot-renderers-0-0-${memoizedContainers._instanceId}`);
        expect(elems.length).to.equal(1);
    });

    it('should only mount the React component once per cell, and call the lifecycle methods on following render calls', () => {
        sandbox.spy(TestLabel.prototype, 'componentWillMount');
        const onContentChangeSpy = sandbox.spy();

        const memoizedContainers = new MemoizedReactDomContainers();

        const td0 = tdContainers.appendChild(document.createElement('td'));

        renderReactCell({
            memoizedContainers,
            td: td0,
            row: 0,
            col: 0,
            jsx: <TestLabel row={0} col={0} content="test" onContentChange={onContentChangeSpy} />,
        });

        const newContentValue = 'other';

        renderReactCell({
            memoizedContainers,
            td: td0,
            row: 0,
            col: 0,
            jsx: <TestLabel row={0} col={0} content={newContentValue} onContentChange={onContentChangeSpy} />,
        });

        expect(TestLabel.prototype.componentWillMount.callCount).to.equal(1);
        expect(onContentChangeSpy.args[0]).to.deep.equal([newContentValue]);
    });

    it('should remove cells once the MAX_CACHE is reached and unmount the React component and garbage collect the td element', () => {
        sandbox.spy(TestLabel.prototype, 'componentWillUnmount');

        const memoizedContainers = new MemoizedReactDomContainers(2);

        const td0 = tdContainers.appendChild(document.createElement('td'));
        const td1 = tdContainers.appendChild(document.createElement('td'));
        const td2 = tdContainers.appendChild(document.createElement('td'));

        renderReactCell({
            memoizedContainers,
            td: td0,
            row: 0,
            col: 0,
            jsx: <TestLabel row={0} col={0} />,
        });
        const container0 = memoizedContainers.renderedContainers.get([0, 0]);
        expect(container0).to.be.ok;

        renderReactCell({
            memoizedContainers,
            td: td1,
            row: 0,
            col: 1,
            jsx: <TestLabel row={0} col={1} />,
        });
        renderReactCell({
            memoizedContainers,
            td: td2,
            row: 1,
            col: 1,
            jsx: <TestLabel row={1} col={1} />,
        });

        expect(memoizedContainers.renderedContainers.get([0, 0])).to.not.be.ok;
        expect(memoizedContainers.renderedContainers.size).to.equal(2);

        expect(TestLabel.prototype.componentWillUnmount.callCount).to.equal(1);

        expect(td0.children.length).to.equal(0);
    });
});
