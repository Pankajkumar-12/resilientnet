import DashboardLayout from "../layouts/DashboardLayout";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import SOSList from "../components/SOSList";
import EmergencyMap from "../components/EmergencyMap";
import RecentActivity from "../components/RecentActivity";

import { Grid } from "@mui/material";

const Dashboard = () => {
    return (
        <DashboardLayout>
            <Sidebar />

                <div
                    style={{
                    flex: 1,
                    marginLeft: "25px",
                    width: "calc(100vw - 305px)",
                    overflowX: "hidden"
                    }}
                >
                <Navbar />

                <div
                    style={{
                        padding: "25px",
                        width: "100%",
                        boxSizing: "border-box"
                    }}
                >
                    <h1
                        style={{
                            color: "#222",
                            marginTop: "0px",
                            marginBottom: "30px",
                            
                            fontWeight: "700",
                        
                        }}
                    >
                        Welcome to ResilientNet
                    </h1>

                    
                    <StatsCards />

                    <EmergencyMap />

                    <Grid
                        container
                        spacing={3}
                        sx={{ mt: 1 }}
                        id="sos-list-section"
                    >
                        <Grid
                            size={{ xs: 12, md: 8 }}
                        >
                            <SOSList />
                        </Grid>

                        <Grid
                            size={{ xs: 12, md: 4 }}
                        >
                            <RecentActivity />
                        </Grid>
                    </Grid>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;