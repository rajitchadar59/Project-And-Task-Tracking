# AI Prompts Log

**Goal: Authentication & Role Management**

*   **Prompt 1:** "Let's use the MERN stack and start with authentication."
    *   **Result:** The AI suggested setting up a standard User schema with JWT, a `requireAuth` middleware, and a `requireManager` middleware. 
*   **Prompt 2:** "Wait, if we have a normal signup, anyone could just assign themselves the manager role. How do we handle manager creation securely without letting anyone become a manager?"
    *   **Result (Wrong/Suboptimal Output):** The AI suggested writing a standalone `seed.js` CLI script to run on the server to inject a manager, or manually editing the MongoDB database using Compass.
    *   **What I changed:** I rejected the `seed.js` script idea because it adds unnecessary deployment complexity for a 12-hour project. I proposed a different solution.
*   **Prompt 3:** "Instead of a seed script, can we make a hidden admin route to create a manager? We can document it so evaluators know. We will require an admin password matched against the .env file for security."
    *   **Result:** The AI agreed this was a better, faster approach. It generated a `POST /api/auth/hidden-manager` endpoint that checks an `ADMIN_SECRET` environment variable before allowing the creation of a 'Manager' account. Regular signups will strictly default to 'Member'.

**Goal: Core Entities & Task Dependencies**

*   **Prompt 4:** "I am designing the Mongoose schemas for Projects and Tasks. What fields are essential for a task management app where tasks need to block each other?"
*   **Result (Over-engineered Output):** The AI suggested a massive schema that included unnecessary fields like `estimatedHours`, `tags`, `attachments`, and `storyPoints`. However, it did correctly suggest using a self-referencing array (`[{ type: ObjectId, ref: 'Task' }]`) to handle dependencies.
*   **What I changed:** I rejected the bloated schema because it went way beyond the assessment's strict 12-hour scope. I manually stripped it down to just the required fields (title, description, status, project, assignedTo, dependencies, dueDate). While I used the AI's structural idea for dependencies, I wrote the actual status-blocking controller logic myself so it would perfectly integrate with my existing `authMiddleware` and `req.userId` context.

**Goal: Member Visibility Rules**
*   **Prompt 5:** "How should I structure the database in MongoDB to ensure that Members can only see projects they belong to, while Managers can see everything?"
*   **Result:** The AI suggested adding a `members` array of ObjectIds to the Project schema and provided the Mongoose query `Project.find({ members: req.userId })`.
*   **What I changed:** The AI's code applied the filter globally. I modified the controller logic to wrap this query strictly inside an `if (req.role === 'Member')` block, ensuring Managers automatically bypass the restriction and see all active projects as required by the assessment.

**Goal: Strict Unassignment Rule**
*   **Prompt 6:** "When a manager edits a project and removes a member, how can I automatically unassign that member from all tasks in that project in MongoDB?"
*   **Result:** The AI suggested writing a Mongoose `post` hook that listens for project updates and fires a separate task cleanup function.
*   **What I changed:** I rejected the `post` hook approach because hooks can become unpredictable during complex updates. Instead, I manually wrote a precise `Task.updateMany` query using the `$unset` operator directly inside my `updateProject` controller. This ensures the cleanup runs synchronously and only when the member list actually changes.


**Goal: Preventing Tasks from Completing Prematurely**
*   **Prompt 7:** "How do I return a clear error message showing exactly which blocking tasks are preventing a task from being marked as Done?"
*   **Result:** The AI suggested using `populate` to get the dependency details and then mapping over the incomplete ones to extract their titles into a `blockingTasks` array.
*   **What I changed:** I integrated this directly into my existing error-handling block. Instead of just throwing a generic 400 error, the frontend now explicitly intercepts `err.response.data.blockingTasks` and shows a native browser alert listing the exact tasks the user needs to finish first.


**Goal: Server-Side Search & Filtering**
*   **Prompt 8:** "How to implement a server-side text search and status filter for tasks in MongoDB/Express?"
*   **Result:** The AI provided a standard Mongoose query using `$regex` with `$options: 'i'` for text search, combined with direct matches for status and priority.
*   **What I changed:** I intercepted the AI's base query and injected a strict role-based filter (`if (req.role === 'Member') query.assignedTo = req.userId;`) *before* applying any user-selected filters, ensuring data isolation rules are never bypassed by search parameters.


**Goal: Identifying Past-Due Tasks**
* **Prompt 9:** "How to filter overdue tasks in Mongoose where the due date is in the past?"
* **Result:** AI suggested `{ dueDate: { $lt: new Date() } }`.
* **What I changed:** Added `{ status: { $ne: 'Done' } }` to ensure completed tasks are ignored, even if their deadline has passed.



**Goal: Soft Deletion & Archiving Projects**
*   **Prompt 10:** "How to implement an archive feature for projects instead of permanently deleting them in MongoDB?"
*   **Result:** The AI suggested adding an `isArchived: { type: Boolean, default: false }` field to the Mongoose schema and using `findOneAndUpdate` to toggle this status.
*   **What I changed:** I explicitly separated the retrieval logic. I updated the main `getProjects` controller to strictly filter out archived projects (`{ isArchived: false }`) for the main dashboard. Then, I built a completely separate, strictly protected Manager-only route (`/archived`) to fetch and restore hidden projects securely.


**Goal: Strict Role Enforcement & Batch Operations**
*   **Prompt 11:** "According to the assignment, only Managers can delete tasks. How do I enforce this?"
    *   **Result:** The AI suggested applying the existing `authorizeRole('Manager')` middleware directly to the `router.delete('/:id')` route and conditionally rendering the Delete button in React using `role === 'Manager'`.
*   **Prompt 12:** "How to implement batch updates for tasks where if one task fails (e.g., due to a dependency), the rest still succeed, and it reports the exact failures back to the user?"
    *   **Result:** The AI provided a backend controller that iterates through `taskIds` using a `for...of` loop. It applies the same blocking-task logic used in single updates, capturing successful IDs in one array and failure objects (with reasons) in another, returning a combined status object to the frontend alert.
*   **Prompt 13:** "How to export the filtered tasks to a CSV file in React without using heavy external libraries?"
    *   **Result:** The AI generated a custom `handleExportCSV` function using a native browser `Blob`, manually mapping the task fields and escaping quotes before triggering a hidden download link.


**Goal: Dashboard Analytics & Charts**
*   **Prompt 14:** "How to build a dashboard with headline stats and visual charts for task distribution and 8-week completion trends?"
    *   **Result:** The AI provided a backend `/stats` controller to aggregate data using standard date manipulation, and a frontend integration using `react-chartjs-2` to render Doughnut, Bar, and Line charts.
    *   **What I changed:** The AI's base code aggregated all tasks globally. I explicitly intercepted the database query at the top of the controller and injected a role-based security filter (`if (req.role === 'Member') query.assignedTo = req.userId;`). This ensures that standard members only see charts and statistics for tasks assigned to them, maintaining strict data isolation.