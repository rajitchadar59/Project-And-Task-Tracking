# Plan

**How did you break the work into sessions?**
I broke the work into logical, feature-based sessions spanning 10 phases. Session 1 covered infrastructure and base models (Phases 1-2). Session 2 covered relationships and visibility rules (Phases 3-4). Session 3 tackled complex logic like dependencies and global filtering (Phases 5-7). Session 4 concluded with advanced operations and analytics (Phases 8-10).

**What order did you build in, and why that order?**
I built foundational elements like Authentication and base schemas first, because every subsequent feature relied on strict role-based access control (Manager vs. Member). Complex logic like Dependency Blocking and Batch Updates were built later because they required the base task infrastructure to be fully functional first.

**What did you estimate versus what it actually took?**
Generally, standard CRUD operations took the estimated time, but complex validations (like returning exact blocking task names or isolating batch update errors) took about 30-45 minutes longer than expected per feature. 

**What did you cut when you ran short?**
I cut "nice-to-have" features like email notifications, automated cron jobs for deleting old archives, complex multi-role systems, and server-side pagination to strictly meet the 12-hour deadline.

---

# Execution Plan & Timeline

**Phase 1: Infrastructure & Authentication (Completed)**
*   **Order of build:** 
    1.  Frontend React Router scaffolding & CSS architecture.
    2.  Express backend setup and MongoDB connection.
    3.  `User` Mongoose schema and JWT auth controllers.
    4.  React Context API integration and Protected Routes.
*   **Why this order:** Everything in this system (Projects, Tasks, Dependencies) relies on role-based access control. Establishing the 'Manager' vs 'Member' boundary first ensures all subsequent API routes can be secured immediately.
*   **Estimated vs Actual:** Auth was estimated at 1 hour but took slightly longer due to debugging modern Mongoose async hooks (`next is not a function` error) and restructuring Vite import paths.
*   **What was cut:** Dropped complex email-verification flows for signups and bypassed building a dedicated "Admin Dashboard" UI in favor of a fast, secure hidden API route for Manager creation.

**Phase 2: Core Models & Initial UI (Completed)**
*   **Order of build:** 
    1. Scaffolding basic `Project` and `Task` schemas.
    2. Setting up CRUD controllers and React UI (Dashboard & ProjectView).
*   **Why this order:** A working baseline was needed to test the API routes and frontend data flow before implementing complex relationship filtering.
*   **Estimated vs Actual:** Estimated 1 hour; took exactly 1 hour.
*   **What was pivoted:** Realized during UI testing that the brief strictly requires Members to only see projects they belong to. Instead of rushing the fix, I stopped to commit the baseline first to maintain a clear, incremental Git history. The next step is refactoring the `Project` schema to include a `members` array.

**Phase 3: Member Visibility & Assignment (Completed)**
*   **Action:** Added a `members` array to the `Project` schema and modified the `getProjects` controller to filter results strictly based on `req.userId` for 'Member' roles.
*   **UI Update:** Updated the Manager dashboard to fetch all users and assign them via checkboxes during project creation.
*   **Why this order:** Built after the baseline models so I had actual database records to test the strict visibility filters against.
*   **Estimated vs Actual:** Estimated 30 mins; took 45 mins to properly manage the React state for the UI checkboxes.
*   **What was cut:** Cut multi-role project assignments (kept it strictly to 'Manager' owner and 'Member' array).

**Phase 4: Project Editing, Archiving & Auto-Unassign (Completed)**
*   **Action:** Implemented the ability for Managers to edit project details and archive projects. Archiving successfully hides them from the default active view.
*   **Strict Rule Enforced:** Wrote logic inside the `updateProject` controller so that if a Manager removes a Member from a project, a database query automatically unassigns that user from all tasks within that specific project.
*   **Why this order:** Essential for data integrity. The unassigning logic must exist before users heavily interact with the system.
*   **Estimated vs Actual:** Estimated 1 hour; took 1 hour.
*   **What was cut:** Real-time WebSocket notifications that would alert a user immediately when they were removed.

**Phase 5: Task Dependencies & Blocking (Completed)**
*   **Action:** Created the `Task` schema with a self-referencing `dependencies` array. Built the frontend `ProjectView` to allow users to create tasks and assign blocking dependencies.
*   **Strict Rule Enforced:** Implemented logic in the `updateTask` controller. When a user tries to change a task status to 'Done', the server maps through its dependencies. If any dependency is not 'Done', the server rejects the request and returns an array of blocking task names to display in the UI.
*   **Why this order:** A core requirement. I needed basic tasks to exist (Phase 2) before I could link them as dependencies.
*   **Estimated vs Actual:** Estimated 1.5 hours; took 2 hours to properly extract and display blocking task names in the frontend error alert.
*   **What was cut:** Deep circular dependency validation (e.g., Task A blocks B, B blocks A) to save time.

**Phase 6: Global Task Search & Filter (Completed)**
*   **Action:** Created a global task retrieval controller (`getGlobalTasks`) supporting query parameters for text search (`$regex`), status, priority, and sorting. Built a dedicated `GlobalTasks` frontend page for users to apply these filters.
*   **Strict Rule Enforced:** Enforced role-based access control inside the global query. In the Global View, Members are strictly limited to seeing tasks where their ID matches the `assignedTo` field. Managers bypass this and see all tasks.
*   **Why this order:** Required so users have a centralized way to find specific work across isolated projects.
*   **Estimated vs Actual:** Estimated 45 mins; took 45 mins.
*   **What was cut:** Server-side pagination.

**Phase 7: Overdue Tasks Filter (Completed)**
*   **Action:** Added a `dueDate` field for tasks and an `isOverdue` query parameter in the global task search.
*   **Strict Rule Enforced:** Overdue queries explicitly filter out tasks with a "Done" status.
*   **Why this order:** A logical extension to the global search panel built in Phase 6.
*   **Estimated vs Actual:** Estimated 20 mins; took 20 mins.
*   **What was cut:** Automated email reminders for overdue tasks.

**Phase 8: Archived Projects View (Completed)**
*   **Action:** Implemented soft deletion (`isArchived`) for projects and created a dedicated manager dashboard for restoring them.
*   **Strict Rule Enforced:** Both the `/archived` GET route and `/restore` PATCH route are strictly protected by the `authorizeRole('Manager')` middleware.
*   **Why this order:** Archiving was built in Phase 4, but the restore UI was deferred until the core task logic was stable.
*   **Estimated vs Actual:** Estimated 30 mins; took 30 mins.
*   **What was cut:** A cron job to permanently hard-delete archived projects after 30 days.

**Phase 9: Strict Role Deletions & Batch Operations (Completed)**
*   **Action:** Restricted task deletion strictly to Managers at the route level. Implemented Batch Update UI panel and backend logic to process tasks iteratively, isolating failures (like dependencies) while allowing successful updates to pass through. Added a native CSV export function.
*   **Why this order:** Batch operations must respect the dependency logic from Phase 5, so it had to be built after.
*   **Estimated vs Actual:** Estimated 1.5 hours; took 2 hours to isolate errors in the `for...of` loop correctly without failing the entire batch.
*   **What was cut:** PDF exports; kept it strictly to a native CSV export.

**Phase 10: Dashboard Analytics (Completed)**
*   **Action:** Built a `/stats` API to aggregate task metrics based on user role. Integrated `chart.js` to visualize task status, assignee distribution, and an 8-week completion timeline.
*   **Why this order:** Analytics require existing tasks, due dates, and completion statuses to render meaningful charts.
*   **Estimated vs Actual:** Estimated 1 hour; took 1.5 hours to properly format the 8-week timeline array logic.
*   **What was cut:** Interactive chart drill-downs (e.g., clicking a pie slice to filter a list).


**Phase 11: Immutable Audit History & Comments (Completed)**
*   **Action:** Added a `history` array to the `Task` schema. Intercepted updates in the `updateTask` controller to push automatic, read-only logs (e.g., status changes). Built a `/comments` route for user notes.
*   **Why this order:** Built last because it requires all other task fields, status states, and user roles to be fully functional so changes can be tracked accurately.
*   **Estimated vs Actual:** Estimated 45 mins; took 1 hour to properly format the frontend timeline UI and ensure chronological sorting.
*   **What was cut:** At-mentions (@user) in comments to keep the scope realistic.



**Phase 12: Real-time UI Sync & Audit Completeness (Completed)**
*   **Action:** Built an inline editing form for tasks allowing updates to all fields including dependencies. Fixed backend `.populate()` queries so the Audit Log correctly displays user names instead of IDs. Implemented real-time badge syncing for overdue alert dismissals.
*   **Why this order:** UI polishing and edge-case bug fixing can only happen after the core CRUD, Batch, and Dashboard logic is fully finalized.
*   **Estimated vs Actual:** Estimated 1 hour; took 1.5 hours due to debugging tricky string-matching bugs with MongoDB ObjectIds inside React's `includes()` arrays.
*   **What was cut:** Complete server-side pagination for the global list to ensure all core 10 goals were rock-solid within the time budget.