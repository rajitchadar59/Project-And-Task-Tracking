const IS_PROD = false; // Toggle to true before Render deployment

const server = IS_PROD ? "https://task-project-tracking.com/api" : "http://localhost:5000/api";

export default server;