let IS_PROD=true;

const server= IS_PROD ?"https://task-manager.com/api" : "http://localhost:5000/api"

export default server;