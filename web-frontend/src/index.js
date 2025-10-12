import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import axios from "axios";

// axios.defaults.baseURL = 'https://06b3bc75-d854-4571-bb84-c1a13edb9a23.mock.pstmn.io'; //mock server postman
// axios.defaults.baseURL = 'http://localhost:8080'; //local
// axios.defaults.headers.post['Content-Type'] = 'application/json';
// axios.defaults.headers.get['Content-Type'] = 'application/json';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
