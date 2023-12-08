import './App.css';

import {Routes, Route} from 'react-router-dom'

import Header from './components/header/Header';
import Instruction from './components/instruction/Instruction';
import Login from './components/login/Login';
import Settings from './components/settings/Settings';

function App() {
    return (
        <div className="App">
            <Header/>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/instruction" element={<Instruction/>}/>
                <Route path="/description" element={<Instruction/>}/>
                <Route path="/statistics" element={<Instruction/>}/>
                <Route path="/settings" element={<Settings/>}/>
            </Routes>
        </div>
    );
}

export default App;
