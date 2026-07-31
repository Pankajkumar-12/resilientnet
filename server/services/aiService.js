const pool = require("../config/db");

const calculatePriorityScore = (severity, category) => {

    let score = 0;

    // Severity Score
    switch (severity) {
        case "HIGH":
            score += 70;
            break;

        case "MEDIUM":
            score += 40;
            break;

        case "LOW":
            score += 15;
            break;

        default:
            score += 0;
    }

    // Category Bonus
    switch (category) {
        case "Medical":
            score += 30;
            break;

        case "Fire":
            score += 25;
            break;

        case "Building Collapse":
            score += 25;
            break;

        case "Flood":
            score += 20;
            break;

        case "Road Block":
            score += 10;
            break;

        default:
            score += 5;
    }

    return Math.min(score, 100);

};

const recommendResource = async (category, sosId)  => {

    let resourceCategory;

    switch (category) {

        case "Medical":
            resourceCategory = "Medical";
            break;

        case "Flood":
            resourceCategory = "Rescue";
            break;

        case "Fire":
            resourceCategory = "Fire";
            break;

        case "Building Collapse":
            resourceCategory = "Rescue";
            break;

        case "Road Block":
            resourceCategory = "Transport";
            break;

        default:
            resourceCategory = category;

    }

    const result = await pool.query(
        `
        SELECT
            r.id,
            r.name,
            r.category,
            r.status,

            ST_Distance(
                s.location,
                ST_SetSRID(
                    ST_MakePoint(
                        r.longitude,
                        r.latitude
                    ),
                    4326
                )::geography
            ) AS distance

        FROM resources r
        CROSS JOIN sos_alerts s

        WHERE

            s.id = $1

        AND

            r.category = $2

        AND

            r.status = 'AVAILABLE'

        ORDER BY distance

        LIMIT 1
        `,
        [
            sosId,
            resourceCategory
        ]
    );

    if (result.rows.length === 0) {

        return {

            name: "No Available Resource",
            distance: null

        };

    }

    return {

        name: result.rows[0].name,

        distance:
            Number(result.rows[0].distance).toFixed(0)

    };

};

const estimateResponseTime = (priorityScore) => {

    if (priorityScore >= 90)
        return "5 minutes";

    if (priorityScore >= 70)
        return "10 minutes";

    if (priorityScore >= 50)
        return "15 minutes";

    return "20 minutes";

};

const generateRecommendation = (category, severity) => {

    return `Immediate ${category.toLowerCase()} response required. Severity level is ${severity}. Dispatch appropriate emergency resources without delay.`;

};

module.exports = {

    calculatePriorityScore,
    recommendResource,
    estimateResponseTime,
    generateRecommendation

};


