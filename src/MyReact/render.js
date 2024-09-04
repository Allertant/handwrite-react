let nextUnitOfWork = null;

// execute and return task unit
function performUnitOfWork(fiber) {
    // execute task unit
    // transform a reactDom to a real dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    // add to parent
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // creating its children fiber node for current fiber node
    // parent \ child \ sibling
    const element = fiber?.props?.children
    let preSibling = null;
    element.forEach(((child, index) => {
        const newFiber = {
            type: child?.type,
            props: child?.props,
            parent: fiber,
            dom: null
        }

        // the first sibling
        if (index === 0) {
            // add newFiber to the parent fiber node
            fiber.child = newFiber
        } else {
            preSibling.sibling = newFiber;
        }

        preSibling = newFiber;
    }))

    // return next task unit
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while(nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }

        nextFiber = nextFiber.parent
    }
}

function workLoop(deadLine) {
    let shouldVield = true;

    while (nextUnitOfWork && shouldVield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldVield = deadLine.timeRemaining() > 1; // get current frame's remaining time
    }

    // register
    requestIdleCallback(workLoop)
}

// start a work loop
requestIdleCallback(workLoop)

function createDom(element) {
    const dom =
        element.type === 'TEXT_ELEMENT' ?
            document.createTextNode('') :
            document.createElement(element.type)

    const isProperty = key => key != 'children'
    Object.keys(element?.props)
        // filter the children field
        .filter(isProperty)
        // set the value of the dom's attribute
        .forEach(name => dom[name] = element.props[name])
    return dom
}

export default function render(element, container) {

    // create a root node
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element]
        }
    }
}