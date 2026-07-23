import { createContext, useContext, useState } from "react";

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {

    const [alerts, setAlerts] = useState([]);

    const [notifications, setNotifications] = useState([]);

    const [stats, setStats] = useState({
        activeSOS: 0,
        volunteers: 0,
        resources: 0,
        highPriority: 0
    });

    return (
        <EmergencyContext.Provider
            value={{
                alerts,
                setAlerts,
                notifications,
                setNotifications,
                stats,
                setStats
            }}
        >
            {children}
        </EmergencyContext.Provider>
    );
};

export const useEmergency = () => useContext(EmergencyContext);