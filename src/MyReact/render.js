export default function render(element, container) {
    const dom =
        element.type === 'TEXT_ELEMENT' ?
            document.createTextNode('') :
            document.createElement(element.type)

    const isProperty = key => key != 'children'
    Object.keys(element?.props)
        // filter the children field
        .filter(isProperty)
        // set the value of the dom's attribute
        .forEach(name => dom[name] = element.props[name] )


    element?.props?.children?.forEach(child => render(child, dom))

    container.appendChild(dom)
}