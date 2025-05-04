import React, { Suspense } from "react";
import ReactDOM from 'react-dom';
import { App } from "./app/App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);
