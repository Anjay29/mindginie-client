import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import ChatBot from './Components/ChatBot.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatBot />}/>
      </Routes>
    </Router>
  );
}

export default App;
