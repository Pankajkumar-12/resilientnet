import {
    Drawer,
    Toolbar,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WarningIcon from "@mui/icons-material/Warning";
import InventoryIcon from "@mui/icons-material/Inventory";
import GroupsIcon from "@mui/icons-material/Groups";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AssessmentIcon from "@mui/icons-material/Assessment";

const drawerWidth = 250;

const Sidebar = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    backgroundColor: "#1E293B",
                    color: "#ffffff"
                }
            }}
        >
            <Toolbar>
                <Typography variant="h5" fontWeight="bold">
                    ResilientNet
                </Typography>
            </Toolbar>

            <List>

                <ListItemButton>
                    <ListItemIcon sx={{ color: "white" }}>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon sx={{ color: "white" }}>
                        <WarningIcon />
                    </ListItemIcon>
                    <ListItemText primary="SOS Alerts" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon sx={{ color: "white" }}>
                        <InventoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Resources" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon sx={{ color: "white" }}>
                        <GroupsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Volunteers" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon sx={{ color: "white" }}>
                        <PsychologyIcon />
                    </ListItemIcon>
                    <ListItemText primary="AI Analysis" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon sx={{ color: "white" }}>
                        <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton>

            </List>
        </Drawer>
    );
};

export default Sidebar;