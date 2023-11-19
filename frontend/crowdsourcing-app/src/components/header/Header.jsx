import "./Header.css";
import { Link } from "react-router-dom"

export default function Header() {
    return (
        <header className="App-header">
            <Link className="link">Instruction 🛠️</Link>
            <Link className="link">Description 📝</Link>
            <Link className="link">Statistics 📊</Link>
        </header>
    )
} 