// App.jsx

import "./styles/App.css";
import "./styles/ui.css";
import "./styles/theme.css";
import "./Layout/Layout.css";
import AppRoutes from "./router/App.Routes";

function App() {
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;
