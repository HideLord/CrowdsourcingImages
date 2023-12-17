import React from "react";
import useOrderedUsers from "../../hooks/orderedUsersHook";
import CenteredSpinner from "../centeredSpinner/CenteredSpinner";

import "./StatisticsComponent.css";
import "../../App.css";

export default function Statistics() {
    const [isLoading, users] = useOrderedUsers();

    if (isLoading) {
        return <CenteredSpinner />;
    }

    const columns = [
        'username',
        'cash_spent',
        'description_count',
        'instruction_count',
    ];

    const columnNames = {
        'username': 'Username',
        'cash_spent': 'Cash Spent',
        'description_count': 'Descriptions',
        'instruction_count': 'Instructions',
    };

    const totals = users.reduce((acc, user) => {
        acc.cash_spent += parseFloat(user.cash_spent);
        acc.description_count += user.description_count? parseInt(user.description_count, 10) : 0;
        acc.instruction_count += user.instruction_count? parseInt(user.instruction_count, 10) : 0;
        return acc;
    }, {
        cash_spent: 0,
        description_count: 0,
        instruction_count: 0,
    });

    return (
        <div className="statistics-body">
            <div className="total-body">
                <div>
                    <span className="total-icon">💲</span>
                    <label className="total-label">Total Cash Spent:</label>
                    <b>${totals.cash_spent.toFixed(2)}</b>
                </div>
                <div>
                    <span className="total-icon">📝</span>
                    <label className="total-label">Total Descriptions:</label>
                    <b>{totals.description_count}</b></div>
                <div>
                    <span className="total-icon">🛠️</span>
                    <label className="total-label">Total Instructions:</label>
                    <b>{totals.instruction_count}</b></div>
            </div>

            <table className="statistics-table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index}>
                                {columnNames[column]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index} className="highlightable">
                            {columns.map((column, colIndex) => (
                                <td key={colIndex}>
                                    {column === 'cash_spent' ? `${parseFloat(user[column]).toFixed(2)} $` : user[column]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}