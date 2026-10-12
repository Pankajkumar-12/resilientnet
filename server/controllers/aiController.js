const pool = require("../config/db");

const {
    calculatePriorityScore,
    recommendResource,
    estimateResponseTime,
    generateRecommendation
} = require("../services/aiService");

const performAIAnalysis = async (sosId) => {

    const sosResult = await pool.query(
        `
        SELECT *
        FROM sos_alerts
        WHERE id = $1
        `,
        [sosId]
    );

    if (sosResult.rows.length === 0) {
        throw new Error("SOS not found");
    }

    const sos = sosResult.rows[0];

    const priorityScore =
        calculatePriorityScore(
            sos.severity,
            sos.category
        );

    const recommendedResource =
        await recommendResource(
            sos.category,
            sos.id
        );

    const estimatedResponseTime =
        estimateResponseTime(priorityScore);

    const recommendation =
        generateRecommendation(
            sos.category,
            sos.severity
        );

    const result = await pool.query(
        `
        INSERT INTO ai_analysis
        (
            sos_id,
            priority_score,
            predicted_category,
            confidence,
            recommendation,
            recommended_resource,
            estimated_response_time
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7
        )
        ON CONFLICT (sos_id)
        DO UPDATE
        SET

            priority_score = EXCLUDED.priority_score,

            predicted_category = EXCLUDED.predicted_category,

            confidence = EXCLUDED.confidence,

            recommendation = EXCLUDED.recommendation,

            recommended_resource = EXCLUDED.recommended_resource,

            estimated_response_time = EXCLUDED.estimated_response_time

        RETURNING *;
        `,
        [
            sos.id,
            priorityScore,
            sos.category,
            100,
            recommendation,
            recommendedResource.name,
            estimatedResponseTime
        ]
    );

    return result.rows[0];

};

const analyzeSOS = async (req, res) => {

    try {

        const { sosId } = req.params;

        const analysis =
            await performAIAnalysis(sosId);

        res.json(analysis);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const getAllAnalysis = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                a.*,
                COALESCE(a.predicted_category, s.category) AS category,
                s.severity,
                s.message
            FROM ai_analysis a
            LEFT JOIN sos_reports s
            ON (a.sos_id = s.id OR (a.incident_id IS NOT NULL AND a.incident_id = s.incident_id))
            ORDER BY a.analyzed_at DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


module.exports = {
    analyzeSOS,
    getAllAnalysis,
    performAIAnalysis
};