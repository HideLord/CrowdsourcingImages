import React, { useState } from "react";
import useOrderedUsers from "../../hooks/orderedUsersHook";
import CenteredSpinner from "../centeredSpinner/CenteredSpinner";

import "../../App.css";
import "./Statistics.css";

function OrderChoice({ column, order, setOrder, users, setUsers }) {
    const sortUsers = (users, column, dir) => {
        const sortedUsers = [...users];

        sortedUsers.sort((a, b) => {
            if (a[column] < b[column]) {
                return dir === 'asc' ? -1 : 1;
            }
            if (a[column] > b[column]) {
                return dir === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sortedUsers;
    };

    return (
        <span 
            className="order-arrows"
            onClick={(e) => {
                const newOrder = {
                    column,
                    dir: order.dir,
                };
                
                if (column === order.column) {
                    newOrder.dir = (order.dir === 'desc' ? 'asc' : 'desc')
                }

                setOrder(newOrder);
                setUsers(sortUsers(users, column, newOrder.dir));
            }}
        >
            ↑↓
        </span>
    );
}

export default function Statistics() {
    const [isLoading, users, setUsers] = useOrderedUsers();
    const [order, setOrder] = useState({
        column: 'cash_spent',
        dir: 'desc',
    });

    if (isLoading) {
        return (<CenteredSpinner />);
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
                                <OrderChoice 
                                    column={column}
                                    order={order}
                                    setOrder={setOrder}
                                    users={users}
                                    setUsers={setUsers}
                                />
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