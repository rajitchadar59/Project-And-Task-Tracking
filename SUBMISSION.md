# Submission

## Links

- **GitHub repository:** https://github.com/rajitchadar59/Project-Task-Tracker
- **Live application:** https://project-task-tracker-ten.vercel.app/

## Notes for the reviewer

The backend API is hosted on Render's free tier at `https://project-task-tracker-backend-36mn.onrender.com`. Because it is on a free tier, the server automatically spins down after a period of inactivity. Please keep the following in mind during testing:

* **Initial Spin-up:** Please allow **up to 45 seconds** for the initial login or first dashboard load while the backend wakes up from its sleep state.
* **Database Operations:** For write actions like "Create Project" or "Create Task", the request may occasionally take **up to 10 seconds** to process. Please click the submit button only once and wait for the success notification.

Demo data is pre-seeded. I highly recommend testing the batch update and alert dismissal features to see the strict server-side validation in action.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Manager** | man1@demo.com | 123456 |
| **Manager** | man2@demo.com | 123456 |
| **Manager** | man3@demo.com | 123456 |
| **Member** | amit@demo.com | amit123 |
| **Member** | priya@demo.com | priya123 |
| **Member** | rahul@demo.com | rahul123 |

*(Note: Test logging in as a Manager to see the full portfolio, then login as a specific Member (e.g., Amit) to verify that only their assigned tasks and scoped projects are visible.)*

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React (Vite), React Router | Fast development cycle, component-based structure perfect for complex, interactive dashboards and dynamic routing. |
| Backend | Node.js, Express | Lightweight, non-blocking I/O that is ideal for building RESTful APIs and handling JSON objects seamlessly. |
| Database | MongoDB, Mongoose | Flexible schema design allowed for easy implementation of embedded arrays (like immutable history timelines and dismissals) and rapid iteration. |
| Hosting | Vercel (Frontend), Render (Backend) | Reliable free tiers with continuous deployment from GitHub, fitting perfectly with the prompt's suggestions. |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Role-based access control (RBAC) is strictly enforced via server-side middleware. Members cannot hit Manager endpoints, and Member queries are strictly scoped to their assigned projects. |
| 2 | Projects | Done | Managers can create, edit, and archive. Archived projects are filtered out of default global views but retain data integrity. |
| 3 | Tasks inside projects | Done | Full CRUD. Tasks carry all required fields, including dependencies. Deleting a task safely pulls its ID from any other task's dependency array. |
| 4 | A task lifecycle with rules | Done | Server-side validation rejects illegal state jumps. Unfinished dependencies block completion. Unblocking correctly restores the exact `previousStatus`. |
| 5 | Assignment | Done | Restricted to project members only. Members have a dedicated "My Tasks" view, and Member-level queries cannot leak outside their project scopes. |
| 6 | Finding things | Done | Global search, multi-variable filtering, sorting, and pagination are executed entirely on the server using MongoDB queries, never in the browser. |
| 7 | Acting on many tasks at once | Done | Batch API endpoint iteratively attempts updates, running full validation per task. Returns a detailed array of successful updates and specific rejection reasons (e.g., "Dependencies not met") for failures. Export to CSV is implemented. |
| 8 | A dashboard | Done | Calculates 8-week completion charts, overdue metrics, and breakdowns. **Crucially**, the `byAssignee` breakdown for Members is strictly scoped on the backend to only show their personal data, preventing team workload leakage. |
| 9 | History you cannot rewrite | Done | Implemented via a `history` subdocument array. Pushes immutable records (action, details, user, timestamp) on every field update, assignment change, and comment. |
| 10 | Overdue alerts | Done | Alerts are filtered server-side based on assignment and role. Dismissals append the user's ID to a `dismissedBy` array. Any update to the `dueDate` clears this array, instantly re-triggering the alert for all assignees. |

## How much time did you actually spend?

Roughly 22 hours. While the initial UI setup and basic CRUD operations were relatively quick, I significantly underestimated the time required to build and bulletproof the strict server-side business logic. A large portion of this time was dedicated to:
* **Strict Data Scoping:** Ensuring that Members cannot access portfolio-wide data. This required deep iteration on the dashboard stats API and global search to guarantee zero data leakage (e.g., ensuring a Member only sees their own name in the assignee chart and only sees assignees from their shared projects in dropdowns).
* **State Machine & Batch Operations:** Building the robust task lifecycle (handling blocking/unblocking states and dependency validations) and making sure it worked flawlessly within a batch update loop that reports partial successes and specific rejection reasons.
* **Edge Case Testing:** Making sure features interconnected properly—like ensuring that updating a task's due date accurately resets the `dismissedBy` array for overdue alerts without breaking the frontend state.

## What would you do next, with another 12 hours?

1. **Strict Manager-Level Isolation:** Currently, the assignment states "Managers can create and archive projects...". While Member roles are strictly scoped, any Manager can technically edit or delete tasks in *another* Manager's project. With more time, I would implement strict owner-level boundaries so Manager A cannot interfere with Manager B's portfolio, which is vital for a real enterprise environment.
2. **Real-time Synchronization (WebSockets):** Replace the current manual/event-driven refresh strategies with Socket.io. This would allow task updates, comments, and alerts to sync instantly across multiple users viewing the same project without page reloads.
3. **Deep Cycle Detection:** Currently, the app prevents tasks from being completed if direct dependencies are open. I would implement a recursive graph check to prevent circular dependencies entirely (e.g., preventing Task A from blocking Task B if Task B already blocks Task A).
4. **Drag-and-Drop Board View:** Build a visual Kanban board for projects using a library like `dnd-kit`, mapping the UI columns directly to the strict lifecycle states.

## What are you least happy with in this codebase, and why?

I am least happy with how global UI state updates are handled across isolated components (e.g., updating the nav-bar alert badge when a task due date is changed inside a project view). Currently, I rely on dispatching custom window events (`window.dispatchEvent`) and re-fetching data. While functional and lightweight, it feels brittle compared to utilizing a robust state management library like React Query or a WebSocket connection to keep the UI perfectly synchronized with the server state. Additionally, error handling on the frontend could be more granular—mapping specific backend validation failures directly to form field highlights rather than relying on global toast notifications.