import MyReact from "./MyReact";
import './index.css';


const element = MyReact.createElement(
    'div',
    {
        title: 'shiyixi'
    },
    'xiaoxi'
);

MyReact.render(element, document.getElementById('root'));