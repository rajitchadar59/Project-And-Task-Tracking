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
*   **What was pivoted:** Realized during UI testing that the brief strictly requires Members to only see projects they belong to. Instead of rushing the fix, I stopped to commit the baseline first to maintain a clear, incremental Git history. The next step is refactoring the `Project` schema to include a `members` array.

**Phase 3: Member Visibility & Assignment (Completed)**
*   **Action:** Added a `members` array to the `Project` schema and modified the `getProjects` controller to filter results strictly based on `req.userId` for 'Member' roles.
*   **UI Update:** Updated the Manager dashboard to fetch all users and assign them via checkboxes during project creation.

**Phase 4: Project Editing, Archiving & Auto-Unassign (Completed)**
*   **Action:** Implemented the ability for Managers to edit project details and archive projects. Archiving successfully hides them from the default active view.
*   **Strict Rule Enforced:** Wrote logic inside the `updateProject` controller so that if a Manager removes a Member from a project, a database query automatically unassigns that user from all tasks within that specific project.

**Phase 5: Task Dependencies & Blocking (Completed)**
*   **Action:** Created the `Task` schema with a self-referencing `dependencies` array. Built the frontend `ProjectView` to allow users to create tasks and assign blocking dependencies.
*   **Strict Rule Enforced:** Implemented logic in the `updateTask` controller. When a user tries to change a task status to 'Done', the server maps through its dependencies. If any dependency is not 'Done', the server rejects the request and returns an array of blocking task names to display in the UI.

**Phase 6: Global Task Search & Filter (Completed)**
*   **Action:** Created a global task retrieval controller (`getGlobalTasks`) supporting query parameters for text search (`$regex`), status, priority, and sorting. Built a dedicated `GlobalTasks` frontend page for users to apply these filters.
*   **Strict Rule Enforced:** Enforced role-based access control inside the global query. In the Global View, Members are strictly limited to seeing tasks where their ID matches the `assignedTo` field. Managers bypass this and see all tasks.

**Phase 7: Overdue Tasks Filter (Completed)**
* **Action:** Added a `dueDate` field for tasks and an `isOverdue` query parameter in the global task search.
* **Strict Rule Enforced:** Overdue queries explicitly filter out tasks with a "Done" status.

**Phase 8: Archived Projects View (Completed)**
* **Action:** Implemented soft deletion (`isArchived`) for projects and created a dedicated manager dashboard for restoring them.
* **Strict Rule Enforced:** Both the `/archived` GET route and `/restore` PATCH route are strictly protected by the `authorizeRole('Manager')` middleware.