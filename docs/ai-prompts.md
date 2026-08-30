# AI Prompts Log

**Goal: Authentication & Role Management**

*   **Prompt 1:** "Let's use the MERN stack and start with authentication."
    *   **Result:** The AI suggested setting up a standard User schema with JWT, a `requireAuth` middleware, and a `requireManager` middleware. 
*   **Prompt 2:** "Wait, if we have a normal signup, anyone could just assign themselves the manager role. How do we handle manager creation securely without letting anyone become a manager?"
    *   **Result (Wrong/Suboptimal Output):** The AI suggested writing a standalone `seed.js` CLI script to run on the server to inject a manager, or manually editing the MongoDB database using Compass.
    *   **What I changed:** I rejected the `seed.js` script idea because it adds unnecessary deployment complexity for a 12-hour project. I proposed a different solution.
*   **Prompt 3:** "Instead of a seed script, can we make a hidden admin route to create a manager? We can document it so evaluators know. We will require an admin password matched against the .env file for security."
    *   **Result:** The AI agreed this was a better, faster approach. It generated a `POST /api/auth/hidden-manager` endpoint that checks an `ADMIN_SECRET` environment variable before allowing the creation of a 'Manager' account. Regular signups will strictly default to 'Member'.