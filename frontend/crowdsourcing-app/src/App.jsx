import "./App.css";

import { Routes, Route } from "react-router-dom"

import Header from "./components/header/Header";
import Instruction from "./components/instruction/Instruction";
import Login from "./components/login/Login";
import Settings from "./components/settings/Settings";
import Description from "./components/description/Description";
import { DescriptionProvider } from "./contexts/DescriptionContext/DescriptionContext";
import { InstructionProvider } from "./contexts/InstructionContext/InstructionContext";
import { OptionsProvider } from "./contexts/OptionsContext/OptionsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Statistics from "./components/statistics/StatisticsComponent";

function App() {
    return (
        <div className="App hide-scrollbar">
            <ToastContainer/>
            <OptionsProvider>
            <InstructionProvider>   
            <DescriptionProvider>
                <Header />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/instruction" element={<Instruction />} />
                    <Route path="/description" element={<Description />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </DescriptionProvider>
            </InstructionProvider>
            </OptionsProvider>
        </div>
    );
}

export default App;
