import "./Header.css";
import { Link } from "react-router-dom"

export default function Header() {
    return (
        <header className="App-header">
            <Link to="/instruction" className="link">Instruction 🛠️</Link>
            <Link to="/description" className="link">Description 📝</Link>
            <Link to="/statistics" className="link">Statistics 📊</Link>
        </header>
    )
} 