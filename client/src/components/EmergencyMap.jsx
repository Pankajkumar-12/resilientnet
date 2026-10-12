import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import api from "../services/api";

import {
    Box,
    Button,
    Chip,
    Stack
} from "@mui/material";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "leaflet/dist/leaflet.css";
import { useRef } from "react";

import { useEffect , useState} from "react";
import L from "leaflet";

import { useEmergency } from "../context/EmergencyContext";

function FitBounds({ alerts }) {

    const map = useMap();

    useEffect(() => {

        if (alerts.length === 0) return;

        const validAlerts = alerts.filter(
            alert =>
                alert.latitude != null &&
                alert.longitude != null
        );

        if (validAlerts.length === 0) return;

        const bounds = L.latLngBounds(
            validAlerts.map(alert => [
                Number(alert.latitude),
                Number(alert.longitude)
            ])
        );

        map.fitBounds(bounds, {
            padding: [50, 50]
        });

    }, [alerts, map]);

    return null;
}
const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const orangeIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

function MapController({ alerts,incidents, onReady }) {

    const map = useMap();

    useEffect(() => {

        onReady(map);

    }, [map, onReady]);

   useEffect(() => {

    const alertLocations = alerts
        .filter(
            alert =>
                alert.latitude != null &&
                alert.longitude != null
        )
        .map(alert => [
            Number(alert.latitude),
            Number(alert.longitude)
        ]);

    const incidentLocations = incidents
        .map(incident => {
            if (!incident.location) return null;

            const match = incident.location.match(
                /POINT\(([-\d.]+) ([-\d.]+)\)/
            );

            if (!match) return null;

            return [
                Number(match[2]), // latitude
                Number(match[1])  // longitude
            ];
        })
        .filter(Boolean);

    const allLocations = [
        ...alertLocations,
        ...incidentLocations
    ];

    if (allLocations.length === 0) return;

    const bounds = L.latLngBounds(allLocations);

    map.fitBounds(bounds, {
        padding: [50, 50]
    });

}, [alerts, incidents, map]);

    return null;
}
const getIncidentPosition = (incident, index, allIncidents) => {
    if (!incident.location) return null;

    const match = incident.location.match(
        /POINT\(([-\d.]+) ([-\d.]+)\)/
    );

    if (!match) return null;

    const longitude = Number(match[1]);
    const latitude = Number(match[2]);

    // Find incidents having the same coordinates
    const sameLocation = allIncidents.filter(
        (item) => item.location === incident.location
    );

    if (sameLocation.length <= 1) {
        return [latitude, longitude];
    }

    // Position within the group
    const position = sameLocation.findIndex(
        (item) => item.id === incident.id
    );

    // Small visual offset in degrees
    const radius = 0.00035;

    const angle = (2 * Math.PI * position) / sameLocation.length;

    return [
        latitude + Math.sin(angle) * radius,
        longitude + Math.cos(angle) * radius
    ];
};

const EmergencyMap = () => {
    const [map, setMap] = useState(null);
    const [incidents, setIncidents] = useState([]);

    const { alerts } = useEmergency();

    const getSavedSettings = () => {
        try {
            const saved = localStorage.getItem("resilientnet_dashboard_settings");
            if (saved) return JSON.parse(saved);
        } catch {
            return null;
        }
        return null;
    };

    const dashboardSettings = getSavedSettings();
    const mapZoom = dashboardSettings?.mapZoom ? parseInt(dashboardSettings.mapZoom, 10) : 11;

    useEffect(() => {
        let isMounted = true;
        const loadIncidents = () => {
            api.get("/incidents")
                .then((response) => {
                    if (isMounted && response?.data) {
                        setIncidents(response.data);
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch incidents:", error);
                });
        };

        loadIncidents();

        const intervalSec = dashboardSettings?.refreshInterval ? parseInt(dashboardSettings.refreshInterval, 10) : 30;
        const interval = setInterval(loadIncidents, (intervalSec || 30) * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);
    const mapRef = useRef(null);
    return (
        <Card
            sx={{
                mt: 3,
                width: "100%",
                borderRadius: 3,
                boxShadow: 3
            }}
        >
            <CardContent>

<Box mb={2}>

    {/* Title */}

    <Typography
        variant="h5"
        fontWeight="bold"
        mb={2}
    >
        🌍 Live Emergency Operations Map
    </Typography>

    {/* Status + Actions */}

    <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
    >

        <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
        >

            <Chip
                color="success"
                label="Connected"
            />

            <Chip
                color="primary"
                label={`Incidents : ${alerts.length}`}
            />

            <Chip
                color="error"
                label={`Critical : ${
                    alerts.filter(
                        alert => alert.severity === "HIGH"
                    ).length
                }`}
            />

            <Chip
                label={`Updated : ${new Date().toLocaleTimeString()}`}
            />

        </Stack>
        <Stack
    direction="row"
    spacing={1}
    sx={{
        marginLeft: "auto"
    }}
>
<Button
                variant="outlined"
                size="small"
                sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0
                }}
                onClick={() => {
                    /* Filters */
                }}
            >
                <FilterListIcon sx={{ fontSize: 20 }} />
            </Button>
        

        

            

            <Button
                variant="outlined"
                size="small"
                sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0
                }}
                onClick={() => {
                    /* Legend */
                }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 20 }} />
            </Button>

            <Button
                variant="contained"
                size="small"
                sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0
                }}
                onClick={() => {

                    if (!map) return;

                    const validAlerts = alerts.filter(
                        alert =>
                            alert.latitude != null &&
                            alert.longitude != null
                    );

                    if (validAlerts.length === 0) return;

                    const bounds = L.latLngBounds(
                        validAlerts.map(alert => [
                            Number(alert.latitude),
                            Number(alert.longitude)
                        ])
                    );

                    map.fitBounds(bounds, {
                        padding: [50, 50]
                    });

                }}
            >
                <RestartAltIcon sx={{ fontSize: 24 }} />
            </Button>

        </Stack>

    </Box>

</Box>
                <MapContainer
                    whenCreated={(map) => {
                        mapRef.current = map;
                    }}
                    center={[12.9716, 77.5946]}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    style={{
                        width: "100%",
                        height: "420px",
                        borderRadius: "12px"
                    }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
<MapController
    alerts={alerts}
        incidents={incidents}
    onReady={setMap}
/>


                    <FitBounds alerts={alerts} />
                    {alerts.map((alert) => {

                        if (
                            alert.latitude == null ||
                            alert.longitude == null
                        ) {
                            return null;
                        }

                        return (
                            <Marker
    key={alert.id}
    position={[
        Number(alert.latitude),
        Number(alert.longitude)
    ]}
    icon={
        alert.severity === "HIGH"
            ? redIcon
            : alert.severity === "MEDIUM"
            ? orangeIcon
            : greenIcon
    }
>
                                <Popup>

                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        {alert.category}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1 }}
                                    >
                                        {alert.message}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1 }}
                                    >
                                        <strong>Severity:</strong> {alert.severity}
                                    </Typography>

                                    <Typography variant="body2">
                                        <strong>Status:</strong> {alert.status}
                                    </Typography>

                                    <Typography variant="body2">
                                        <strong>Reporter:</strong> {alert.sender_name}
                                    </Typography>

                                    <Typography variant="body2">
                                        <strong>Time:</strong>{" "}
                                        {new Date(alert.created_at).toLocaleString()}
                                    </Typography>

                                </Popup>
                            </Marker>
                        );

                    })}
{incidents.map((incident) => {
    const position = getIncidentPosition(
        incident,
        0,
        incidents
    );

    if (!position) return null;

    return (
        <Marker
            key={`incident-${incident.id}`}
            position={position}
            icon={
                incident.severity === "HIGH"
                    ? redIcon
                    : incident.severity === "MEDIUM"
                    ? orangeIcon
                    : greenIcon
            }
        >
            <Popup>
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                >
                    {incident.title}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                    {incident.description}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Incident:</strong>{" "}
                    {incident.incident_number}
                </Typography>

                <Typography variant="body2">
                    <strong>Category:</strong>{" "}
                    {incident.category}
                </Typography>

                <Typography variant="body2">
                    <strong>Severity:</strong>{" "}
                    {incident.severity}
                </Typography>

                <Typography variant="body2">
                    <strong>Status:</strong>{" "}
                    {incident.status}
                </Typography>

                <Typography variant="body2">
                    <strong>Reports:</strong>{" "}
                    {incident.report_count}
                </Typography>

                <Typography variant="body2">
                    <strong>Time:</strong>{" "}
                    {new Date(
                        incident.created_at
                    ).toLocaleString()}
                </Typography>
            </Popup>
        </Marker>
    );
})}
                </MapContainer>

            </CardContent>
        </Card>
    );
};

export default EmergencyMap;