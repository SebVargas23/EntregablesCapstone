// src/App.js

import React from 'react';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import TicketCRUD from './components/Tickets/TicketCRUD';

function App() {
    return (
        <div className="App">
            <h1>Sistema de Tickets</h1>
            <LoginPage />
            <RegisterPage />
            <TicketCRUD />
        </div>
    );
}

export default App;
