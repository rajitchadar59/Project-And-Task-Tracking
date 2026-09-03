# AI Prompts Log

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

## Goal: Authentication & Role Management
*   **Prompt 1:** "Let's use the MERN stack and start with authentication."
    *   **Result:** The AI suggested setting up a standard User schema with JWT, a `requireAuth` middleware, and a `requireManager` middleware. 
*   **Prompt 2:** "Wait, if we have a normal signup, anyone could just assign themselves the manager role. How do we handle manager creation securely without letting anyone become a manager?"
    *   **Result (Wrong/Suboptimal Output):** The AI suggested writing a standalone `seed.js` CLI script to run on the server to inject a manager, or manually editing the MongoDB database using Compass.
    *   **What I corrected:** I rejected the `seed.js` script idea because it adds unnecessary deployment complexity for a 12-hour project.
*   **Prompt 3:** "Instead of a seed script, can we make a hidden admin route to create a manager? We can document it so evaluators know. We will require an admin password matched against the .env file for security."
    *   **Result:** The AI agreed this was a better, faster approach. It generated a `POST /api/auth/hidden-manager` endpoint that checks an `ADMIN_SECRET` environment variable before allowing the creation of a 'Manager' account. Regular signups will strictly default to 'Member'.

## Goal: Core Entities & Task Dependencies
*   **Prompt 4:** "I am designing the Mongoose schemas for Projects and Tasks. What fields are essential for a task management app where tasks need to block each other?"
    *   **Result (Over-engineered Output):** The AI suggested a massive schema that included unnecessary fields like `estimatedHours`, `tags`, `attachments`, and `storyPoints`. However, it did correctly suggest using a self-referencing array (`[{ type: ObjectId, ref: 'Task' }]`) to handle dependencies.
    *   **What I corrected:** I rejected the bloated schema because it went way beyond the assessment's strict 12-hour scope. I manually stripped it down to just the required fields. While I used the AI's structural idea for dependencies, I wrote the actual status-blocking controller logic myself.

## Goal: Member Visibility Rules
*   **Prompt 5:** "How should I structure the database in MongoDB to ensure that Members can only see projects they belong to, while Managers can see everything?"
    *   **Result:** The AI suggested adding a `members` array of ObjectIds to the Project schema and provided the Mongoose query `Project.find({ members: req.userId })`.
    *   **What I corrected:** The AI's code applied the filter globally. I modified the controller logic to wrap this query strictly inside an `if (req.role === 'Member')` block, ensuring Managers bypass the restriction and see the whole portfolio.

## Goal: Strict Unassignment Rule
*   **Prompt 6:** "When a manager edits a project and removes a member, how can I automatically unassign that member from all tasks in that project in MongoDB?"
    *   **Result:** The AI suggested writing a Mongoose `post` hook that listens for project updates and fires a separate task cleanup function.
    *   **What I corrected:** I rejected the `post` hook approach because hooks can become unpredictable during complex updates. Instead, I manually wrote a precise `Task.updateMany` query using the `$unset` operator directly inside my `updateProject` controller.

## Goal: Preventing Tasks from Completing Prematurely
*   **Prompt 7:** "How do I return a clear error message showing exactly which blocking tasks are preventing a task from being marked as Done?"
    *   **Result:** The AI suggested using `populate` to get the dependency details and then mapping over the incomplete ones to extract their titles into a `blockingTasks` array.
    *   **What I corrected:** I integrated this directly into my existing error-handling block so the frontend explicitly intercepts `err.response.data.blockingTasks` and shows a browser alert listing the exact tasks.

## Goal: Server-Side Search & Filtering
*   **Prompt 8:** "How to implement a server-side text search and status filter for tasks in MongoDB/Express?"
    *   **Result:** The AI provided a standard Mongoose query using `$regex` with `$options: 'i'` for text search, combined with direct matches for status and priority.
    *   **What I corrected:** I intercepted the AI's base query and injected a strict role-based filter (`if (req.role === 'Member') query.assignedTo = req.userId;`) *before* applying any user-selected filters, ensuring data isolation rules are never bypassed.

## Goal: Identifying Past-Due Tasks
* **Prompt 9:** "How to filter overdue tasks in Mongoose where the due date is in the past?"
    * **Result:** AI suggested `{ dueDate: { $lt: new Date() } }`.
    * **What I corrected:** Added `{ status: { $ne: 'Done' } }` to ensure completed tasks are ignored, even if their deadline has passed.

## Goal: Soft Deletion & Archiving Projects
*   **Prompt 10:** "How to implement an archive feature for projects instead of permanently deleting them in MongoDB?"
    *   **Result:** The AI suggested adding an `isArchived: { type: Boolean, default: false }` field to the schema and using `findOneAndUpdate` to toggle this status.
    *   **What I corrected:** I separated the retrieval logic. I updated `getProjects` to strictly filter out archived projects, then built a separate, strictly protected Manager-only route (`/archived`) to fetch and restore hidden projects securely.

## Goal: Strict Role Enforcement & Batch Operations
*   **Prompt 11:** "According to the assignment, only Managers can delete tasks. How do I enforce this?"
    *   **Result:** The AI suggested applying the existing `authorizeRole('Manager')` middleware directly to the `router.delete('/:id')` route and conditionally rendering the Delete button in React.
*   **Prompt 12:** "How to implement batch updates for tasks where if one task fails (e.g., due to a dependency), the rest still succeed, and it reports the exact failures back to the user?"
    *   **Result:** The AI provided a backend controller that iterates through `taskIds` using a `for...of` loop, capturing successful IDs in one array and failure objects in another.
*   **Prompt 13:** "How to export the filtered tasks to a CSV file in React without using heavy external libraries?"
    *   **Result:** The AI generated a custom `handleExportCSV` function using a native browser `Blob`, manually mapping the task fields and escaping quotes before triggering a hidden download link.

## Goal: Dashboard Analytics & Charts
*   **Prompt 14:** "How to build a dashboard with headline stats and visual charts for task distribution and 8-week completion trends?"
    *   **Result:** The AI provided a backend `/stats` controller to aggregate data using standard date manipulation, and a frontend integration using `react-chartjs-2`.
    *   **What I corrected:** The AI's base code aggregated all tasks globally. I explicitly injected a role-based security filter (`if (req.role === 'Member') query.assignedTo = req.userId;`) so members only see stats for tasks assigned to them.

## Goal: Task Audit History & Immutable Timelines
*   **Prompt 15:** "How to implement an immutable audit history timeline for tasks that tracks status changes, assignments, and allows users to add comments?"
    *   **Result:** The AI provided a schema update using a `history` sub-document array and updated the main `updateTask` controller to push an object whenever a field difference was detected.
    *   **What I corrected:** The AI applied strict authorization checks that prevented unassigned members from leaving comments. I corrected this by intentionally keeping the comment route open to all project members to allow team collaboration.

## Goal: Real-Time UI Sync & Overdue Alerts
*   **Prompt 16:** "The dismiss overdue alert feature is not working properly. When I click dismiss, the button disappears from the task, but the alert badge in the navbar doesn't update or go away."
    *   **Result:** The AI suggested using `window.dispatchEvent(new Event('alertsUpdated'))` to trigger an instant update across the app.
    *   **What I corrected:** I integrated this, but had to manually fix a bug where MongoDB `ObjectId` types were strictly failing equality checks against JavaScript strings by explicitly casting them to `String()`.

## Goal: Role Permissions for Task Editing
*   **Prompt 17:** "Should a regular member be able to edit a task? Is that mentioned in the assignment?"
    *   **Result:** The AI and I analyzed the brief. Goal 1 explicitly forbids members from *deleting* tasks, but does not explicitly forbid editing. 
    *   **What I corrected:** I chose to keep the 'Edit' functionality open to members so they can "move work forward", but heavily reinforced the backend controller to strictly log the user's name in the Immutable Audit Log for every field change.

## Goal: Server-Side Enforcement & Future Scope 
*   **Prompt 18:** "The brief says managers can archive projects. Should I restrict it so only the manager who created the project (the owner) can edit or archive it? What about the future?"
    *   **Result (Wrong/Suboptimal Output):** The AI initially suggested restricting updates to `{ _id: id, owner: req.userId }` so managers couldn't touch each other's projects.
    *   **What I corrected:** I realized this was scope creep. The brief just says "Managers can archive projects." I removed the owner restriction entirely to keep the MVP simple for a shared portfolio. However, I heavily reinforced the backend with `if (req.role !== 'Manager')` checks inside the controllers to ensure the rule is enforced on the server, not just hidden in the UI.

## Goal: Strict Alert Dismissal Logic
*   **Prompt 19:** "The brief strictly states 'A person can dismiss an alert for a task they are assigned to'. My current code lets Managers dismiss any alert globally. How do I fix this?"
    *   **Result:** The AI recognized the flaw and provided updated code.
    *   **What I corrected:** I removed the `role === 'Manager'` bypass on both the frontend `canDismiss` variable and the backend `dismissAlert` controller. The dismissal is now strictly locked to the `isAssignedToMe` condition for all users, perfectly aligning with Goal 10.