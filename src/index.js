import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
export const getResizeEventListener = (standardWidth, standardHeight) => {
    return () => {
        const root = document.querySelector('#root');
        const app = document.querySelector("#App");

        // 원하는 해상도로 width, height 고정
        app.style.width = `${standardWidth}px`;
        app.style.height = `${standardHeight}px`;

        let width = root.clientWidth;
        let height = width * (standardHeight / standardWidth);

        // style.zoom을 이용하여, 화면을 크기를 조정
        app.style.zoom = height / standardHeight;

        if (height > root.clientHeight) {
            height = root.clientHeight;
            width = height * (standardWidth / standardHeight);

            // style.zoom을 이용하여, 화면을 크기를 조정
            app.style.zoom = width / standardWidth;
        }
    };
};