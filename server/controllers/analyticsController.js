const pool = require("../config/db");

const getDashboardAnalytics = async (req, res) => {

    try {

        const [

            totalSOS,
            activeSOS,
            resolvedSOS,

            highPriority,

            resourcesAvailable,
            resourcesBusy,

            volunteersAvailable,
            volunteersBusy,

            categoryStats,

            severityStats,

            dailyTrend,

            resourceStats,

            volunteerStats,

            aiStats

        ] = await Promise.all([

            // Total SOS
            pool.query(`
                SELECT COUNT(*) AS count
                FROM sos_alerts
            `),

            // Active SOS
            pool.query(`
                SELECT COUNT(*) AS count
                FROM sos_alerts
                WHERE status<> 'RESOLVED'
            `),

            // Resolved SOS
            pool.query(`
                SELECT COUNT(*) AS count
                FROM sos_alerts
                WHERE status='RESOLVED'
            `),

            // High Priority
            pool.query(`
                SELECT COUNT(*) AS count
                FROM ai_analysis
                WHERE priority_score>=70
            `),

            // Resources Available
            pool.query(`
                SELECT COUNT(*) AS count
                FROM resources
                WHERE status='AVAILABLE'
            `),

            // Resources Busy
            pool.query(`
                SELECT COUNT(*) AS count
                FROM resources
                WHERE status='ASSIGNED'
            `),

            // Volunteers Available
            pool.query(`
                SELECT COUNT(*) AS count
                FROM volunteers
                WHERE availability=true
            `),

            // Volunteers Busy
            pool.query(`
                SELECT COUNT(*) AS count
                FROM volunteers
                WHERE availability=false
            `),

            // Category Statistics
            pool.query(`
                SELECT
                    category,
                    COUNT(*) AS count
                FROM sos_alerts
                GROUP BY category
                ORDER BY count DESC
            `),

            // Severity Statistics
            pool.query(`
                SELECT
                    severity,
                    COUNT(*) AS count
                FROM sos_alerts
                GROUP BY severity
                ORDER BY count DESC
            `),

            // Daily Trend
            pool.query(`
                SELECT

                    DATE(created_at) AS date,

                    COUNT(*) AS count

                FROM sos_alerts

                GROUP BY DATE(created_at)

                ORDER BY DATE(created_at)
            `),

            // Resource Status
            pool.query(`
                SELECT

                    status,

                    COUNT(*) AS count

                FROM resources

                GROUP BY status
            `),

            // Volunteer Availability
            pool.query(`
                SELECT

                    availability,

                    COUNT(*) AS count

                FROM volunteers

                GROUP BY availability
            `),

            // AI Statistics
            pool.query(`
                SELECT

                    ROUND(AVG(priority_score),2) AS average_priority,

                    MAX(priority_score) AS highest_priority,

                    COUNT(*) AS total_analysis

                FROM ai_analysis
            `)

        ]);

        res.json({

            summary: {

                totalSOS:
                    Number(totalSOS.rows[0].count),

                activeSOS:
                    Number(activeSOS.rows[0].count),

                resolvedSOS:
                    Number(resolvedSOS.rows[0].count),

                highPriority:
                    Number(highPriority.rows[0].count),

                resourcesAvailable:
                    Number(resourcesAvailable.rows[0].count),

                resourcesBusy:
                    Number(resourcesBusy.rows[0].count),

                volunteersAvailable:
                    Number(volunteersAvailable.rows[0].count),

                volunteersBusy:
                    Number(volunteersBusy.rows[0].count)

            },

            categoryStats:
                categoryStats.rows,

            severityStats:
                severityStats.rows,

            dailyTrend:
                dailyTrend.rows,

            resourceStats:
                resourceStats.rows,

            volunteerStats:
                volunteerStats.rows,

            aiStats:
                aiStats.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {

    getDashboardAnalytics

};