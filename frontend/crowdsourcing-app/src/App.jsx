import './App.css';

import {Routes, Route} from 'react-router-dom'

import Header from './components/header/Header';
import Instruction from './components/instruction/Instruction';

function App() {
    return (
        <div className="App">
            <Header/>
            <Routes>
                <Route path="/" element={<Instruction/>}/>
            </Routes>
        </div>
    );
}

export default App;
