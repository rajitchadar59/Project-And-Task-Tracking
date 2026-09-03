# Architecture

**What are the moving pieces, and how do they talk to each other?**
The application is built using a decoupled Client-Server architecture (MERN stack). 
*   **Frontend (Client):** A React.js application that handles the UI, routing, and conditional rendering based on user roles (Manager vs. Member). It manages global state via the Context API and uses native DOM events for lightweight cross-component syncing (e.g., instantly updating the overdue alerts badge).
*   **Backend (Server):** A Node.js and Express server that contains the core business logic, strict Role-Based Access Control (RBAC) middleware, and complex dependency-blocking validations.
*   **Communication:** The frontend communicates with the backend via RESTful API calls using Axios. All protected requests are secured using JSON Web Tokens (JWT) attached via Axios interceptors, ensuring seamless token management and secure data transmission.

**Where does each piece run?**
*   **Frontend:** Hosted and served via Vercel.
*   **Backend:** Deployed as a web service on Render.
*   **Database:** A managed MongoDB cluster hosted on MongoDB Atlas.

**What is the request path for one representative user action, end to end?**
*Action: A Manager archiving a project.*
1.  The Manager clicks the "Archive" button on the React frontend.
2.  Axios intercepts the request, attaches the user's JWT token, and sends a `PATCH /api/projects/:id/archive` request to the backend.
3.  The Express router routes this to the `requireAuth` middleware, which verifies the token and attaches `req.userId` and `req.role` to the request object.
4.  The request reaches the `archiveProject` controller. The controller first strictly checks `if (req.role !== 'Manager')`. If the user is a Member, it immediately returns a 403 Forbidden error.
5.  Since the user is a Manager, the controller updates the project's `isArchived` flag to `true` in MongoDB.
6.  MongoDB confirms the write operation, and the Express server responds with a `200 OK` status and the updated project JSON.
7.  The React frontend receives the response and updates its local state to remove the archived project from the active view without requiring a full page refresh.

**What did you decide *not* to build, and why?**
1.  **Inter-Manager Permission Walls:** I deliberately did not restrict project editing or archiving strictly to the project's original "owner". The brief simply required Managers to manage projects. Building complex access-control walls between managers would over-complicate the MVP for a shared portfolio (applying the YAGNI principle).
2.  **Redux for State Management:** I chose not to implement Redux or Zustand. The only global state required was the authentication token and user role, which is easily handled by React's native Context API. For cross-component updates (like the Overdue Alert badge), I used lightweight native `window.dispatchEvent` instead of heavy state libraries.
3.  **WebSockets for Real-Time Updates:** I relied on standard RESTful calls rather than implementing Socket.io for real-time live-syncing across different browsers. Implementing WebSocket servers adds deployment complexity and overhead that falls outside the strict 12-hour time budget for this assignment.