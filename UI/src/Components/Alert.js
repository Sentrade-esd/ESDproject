import React, { useState } from 'react';
import { AlertContext } from './AlertContext'; 

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    return (
        <AlertContext.Provider value={{ alert, setAlert }}>
            {children}
        </AlertContext.Provider>
    );
};