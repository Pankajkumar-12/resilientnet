import React from "react";

const DashboardLayout = ({ children }) => {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f5f7fa"
            }}
        >
            {children}
        </div>
    );
};

export default DashboardLayout;