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

renderder("haha")