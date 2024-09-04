/** @jsxRuntime classic */

import MyReact from "./MyReact";
import {jsx} from "react";
import './index.css';


/** @jsx MyReact.createElement */

const updateValue = event => {
    renderder(event.target.value)
}
const renderder = value => {
    const element = (
        <div>
            <input onInput={updateValue} value={value}/>
            <h3>you input is: {value}</h3>
        </div>
    )
    MyReact.render(element, document.getElementById('root'));
}

// renderder("haha")

function App() {
    const [number, setNumber] = MyReact.useState(1)
    const [visiable, setVisiable] = MyReact.useState(true)

    return (
        <div>
            <button onClick={() => {
                setNumber(number + 1)
                setVisiable(!visiable)
            }}> click me
            </button>
            <h1>
                {number}
            </h1>
            {
                visiable ? <h1>can you see me?</h1> : null
            }
        </div>
    )
}

MyReact.render(<App/>, document.getElementById('root'))