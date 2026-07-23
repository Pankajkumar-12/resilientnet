import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

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
    useMap,
    useMapEvents
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

function MapController({ alerts, onReady }) {

    const map = useMap();

    useEffect(() => {

        onReady(map);

    }, [map, onReady]);

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


const EmergencyMap = () => {
    const [map, setMap] = useState(null);
    const { alerts } = useEmergency();
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
                    zoom={13}
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

                </MapContainer>

            </CardContent>
        </Card>
    );
};

export default EmergencyMap;