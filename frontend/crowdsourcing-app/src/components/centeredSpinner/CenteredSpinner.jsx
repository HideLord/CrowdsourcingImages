import React from "react";
import ReactLoading from 'react-loading';
import "../../App.css";

export default function CenteredSpinner() {
    return (
        <div className="center-spinner">
            <ReactLoading type={'spin'} color={'#000'} height={50} width={50} />
        </div>
    );
}