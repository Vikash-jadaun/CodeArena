const axios = require("axios");

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

const getLanguageById = (lang) => {
    const languages = {
        "c": 50,
        "c++": 54,
        "java": 62,
        "javascript": 102,
        "python": 71
    };

    return languages[lang.toLowerCase()];
};

const waiting = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const submitBatch = async (submissions) => {
    try {

        console.log("Submitting:");
        console.log(JSON.stringify(submissions, null, 2));

        const response = await axios.post(
            `${JUDGE0_URL}/submissions/batch`,
            {
                submissions
            },
            {
                params: {
                    base64_encoded: false
                }
            }
        );

        return response.data;

    } catch (error) {

        console.log("Submission Error");
        console.log(error.response?.status);
        console.log(error.response?.data);
        console.log(error.message);

        return null;
    }
};

const submitToken = async (tokens) => {

    const results = [];
    for (const token of tokens) {
        while (true) {
            try {
                const response = await axios.get(
                    `${JUDGE0_URL}/submissions/${token}`,
                    {
                        params: {
                            base64_encoded: true,
                            fields:"stdout,stderr,compile_output,status,status_id,time,memory"
                        }
                    }
                );

                const submission = response.data;

                console.log(submission);

                if (submission.status_id <= 2) {
                    await waiting(1000);
                    continue;
                }
                results.push(submission);
                break;

            } catch (error) {

                console.log("Polling Error");
                console.log(error.response?.status);
                console.log(error.response?.data);
                 console.log(error.message);
                return null;
            }

        }

    }

    return results;
};

module.exports = {
    getLanguageById,
    submitBatch,
    submitToken
};
