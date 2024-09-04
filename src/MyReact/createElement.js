// construct the virtual dom tree
export default function createElement(type, props, ...children) {
    return {
        type,
        // combine the children and props into an array
        props: {
            // props: field value
            ...props,
            children: children.map(child => typeof child === 'object'
                ? child : createTextElement(child))
        }
    }
}

// text: string -> text node
function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}