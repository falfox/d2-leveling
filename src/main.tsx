import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { StoreProvider } from "easy-peasy";
import { DestinyStores } from "./stores/destiny";
import { AuthStore } from "./stores/auth";

ReactDOM.render(
  <React.StrictMode>
    <AuthStore.Provider>
      <DestinyStores.Provider>
        <App />
      </DestinyStores.Provider>
    </AuthStore.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
