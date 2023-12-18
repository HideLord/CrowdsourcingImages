import React, { useState } from "react"
import { Link } from "react-router-dom"
import "./About.css"
import "../../App.css"
import updateDataset from "../../utils/datasetUtil";
import { toast } from "react-toastify";

export default function About() {
    const [isUpdateDisabled, setIsUpdateDisabled] = useState(false);
    return (
        <div className="about-body">
            <img src="/logo.svg" alt="Logo" className="about-logo" />
            <section>
                <h2>What We Do</h2>
                <p>Welcome to our crowdsourcing platform where we combine human creativity with the power of GPT-4 Vision to create a rich,
                    centralized dataset of image-text pairs.</p>
            </section>

            <section>
                <h2>Contributing</h2>
                <p>Our platform offers two main ways for users to contribute and enrich our dataset:</p>
                <ol>
                    <li>
                        <strong>Instruction Submissions:</strong> Users can visit the "Instruction" page to submit an image along with corresponding instructions. To do this, they need to provide the image URL and their OpenAI API key, which enables the use of GPT-4 Vision to generate text based on the provided instructions.
                        <br />
                        <Link to="/instruction" className="about-link">Instruction Page 🛠️</Link>
                    </li>
                    <li>
                        <strong>Image Captioning:</strong> On the "Description" page, contributors can caption images to create text descriptions. Users have the option to provide their own list of image URLs or work with a selection of auto-curated images from our existing collection.
                        <br />
                        <Link to="/description" className="about-link">Description Page 📝</Link>
                    </li>
                </ol>
            </section>

            <section>
                <h2>Spending Limits</h2>
                <p>Users have the ability to manage their spending by setting a preferred spending limit in the settings page. This ensures that you stay within your budget when using the GPT-4 Vision API.</p>
                <p>Once your specified spending limit is reached, the application will automatically block any further API calls. This feature is designed to protect you from any unintended or excessive charges.</p>
                <p>In addition, when using the "Description" page, you can set a maximum cost for the current batch of images you wish to process. If it becomes apparent that the cost to caption all images in the batch would exceed this maximum, the operation will be halted to prevent surpassing your budget.</p>
                <Link to="/settings" className="about-link">Manage Spending Limits ⚙️</Link>
            </section>

            <section>
                <h2>Update Dataset</h2>
                <p>Contributors can request the dataset to be updated with the latest additions to ensure the most recent data is included.</p>
                <button 
                    className="blue-button"
                    disabled={isUpdateDisabled}
                    onClick={async () => {
                        try {
                            setIsUpdateDisabled(true);
                            const response = await updateDataset();
                            toast.info(response);
                            setIsUpdateDisabled(false);
                        } catch(error) {
                            toast.error(`Could not update dataset: ${error}`);
                            setIsUpdateDisabled(false);
                        }
                    }}
                >Update Dataset</button>
                <a to="/settings" className="about-link" href="https://huggingface.co/datasets/hidelord/crowdsource_images">Dataset <img className="database-icon" src="/database.svg"/></a>
            </section>
        </div>
    );
}