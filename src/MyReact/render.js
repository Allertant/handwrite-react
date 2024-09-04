let nextUnitOfWork = null;
// work in progress root
let wipRoot = null;
// second commit fiber root
let currentRoot = null;

let deletion = []


function reconcileChildren(wipFiber, element) {
    let index = 0;
    let preSibling = null;
    // same layer
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    while (index < element.length || !!oldFiber) {
        let child = element[index]
        let newFiber = null;
        const sameType =
            oldFiber &&
            child &&
            child.type === oldFiber.type;

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: child.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                // add a tag
                effectTag: 'UPDATE'
            }
        }

        if (!sameType && child) {
            newFiber = {
                type: child.type,
                props: child.props,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT'
            }
        }

        // delete the old fiber
        if (!sameType && oldFiber) {
            oldFiber.effectTag = 'DELETION'
            deletion.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        // the first sibling
        if (index === 0) {
            // add newFiber to the parent fiber node
            wipFiber.child = newFiber
        } else {
            preSibling.sibling = newFiber;
        }

        preSibling = newFiber;

        index++
    }
}

// execute and return task unit
function performUnitOfWork(fiber) {
    // execute task unit
    // transform a reactDom to a real dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    // creating its children fiber node for current fiber node
    // parent \ child \ sibling
    const element = fiber?.props?.children
    reconcileChildren(fiber, element)

    // return next task unit
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }

        nextFiber = nextFiber.parent
    }
}

// get event (the filed starts with 'on')
const isEvent = key => key.startsWith('on')
// filter children fields
const isProperty = key => key !== 'children' && !isEvent(key)
// get the fields to be removed
const isGone = (prev, next) => key => !(key in next)
// get the new fields
const isNew = (prev, next) => key => prev[key] !== next[key]

function updateDom(dom, prevProps, nextProps) {
    // remove old listen event
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(key =>
            // to be removed
            isGone(prevProps, nextProps)(key) ||
            // to be replaced, so it should be removed
            isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2)
            dom.removeEventListener(eventType, prevProps[name])
        })

    // remove nonexistent dom fields
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => dom[name] = '')
    // add fields
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => dom[name] = nextProps[name])

    // add events
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2)
            dom.addEventListener(eventType, nextProps[name])
        })
}

// real link the virtual dom to real dom
function commitWork(fiber) {
    // commit real dom
    if (!fiber) return

    const domParent = fiber.parent.dom
    // domParent.appendChild(fiber.dom)

    // operation depends on fiber's effectTag
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    } else if (fiber.effectTag === 'DELETION') {
        domParent.removeChild(fiber.dom)
    }


    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

// commit all dom in one time when all task unit are done f
function commitRoot() {
    // render real dom
    commitWork(wipRoot.child)

    deletion.forEach(commitWork)

    // record the last render fiber root
    currentRoot = wipRoot

    wipRoot = null;
}


function workLoop(deadLine) {
    let shouldVield = true;

    while (nextUnitOfWork && shouldVield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldVield = deadLine.timeRemaining() > 1; // get current frame's remaining time
        // debugger
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    // register
    requestIdleCallback(workLoop)
}

// start a work loop
requestIdleCallback(workLoop)

function createDom(fiber) {
    const dom =
        fiber.type === 'TEXT_ELEMENT' ?
            document.createTextNode('') :
            document.createElement(fiber.type)

    // const isProperty = key => key !== 'children'
    // Object.keys(element?.props)
    //     // filter the children field
    //     .filter(isProperty)
    //     // set the value of the dom's attribute
    //     .forEach(name => dom[name] = element.props[name])

    updateDom(dom, {}, fiber.props)
    return dom
}

export default function render(element, container) {

    // create a root node
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }
    nextUnitOfWork = wipRoot

    // set null to old fiber
    deletion = []
}