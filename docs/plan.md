# Plan

**How did you break the work into sessions?**
I broke the work into logical, feature-based sessions spanning 13 phases. 
*   **Session 1:** Covered infrastructure and base models (Phases 1-2). 
*   **Session 2:** Covered relationships and visibility rules (Phases 3-4). 
*   **Session 3:** Tackled complex logic like dependencies and global filtering (Phases 5-7). 
*   **Session 4:** Covered advanced operations and analytics (Phases 8-10). 
*   **Session 5:** Focused entirely on security auditing, strict server-side RBAC enforcement, and edge-case compliance (Phases 11-13).

**What order did you build in, and why that order?**
I built foundational elements like Authentication and base schemas first, because every subsequent feature relied on strict role-based access control (Manager vs. Member). Complex logic like Dependency Blocking and Batch Updates were built later because they required the base task infrastructure to be fully functional first. The strict server-side security sweep was done last to ensure no UI-only bypasses were missed after all features were active.

**What did you estimate versus what it actually took?**
Generally, standard CRUD operations took the estimated time, but complex validations (like returning exact blocking task names, isolating batch update errors, and debugging MongoDB ObjectId equality checks) took about 30-45 minutes longer than expected per feature. 

**What did you cut when you ran short?**
I cut "nice-to-have" features like email notifications, automated cron jobs for deleting old archives, server-side pagination, and complex inter-manager permission walls (e.g., owner-only project editing) to strictly meet the 12-hour deadline while avoiding scope creep.

---

# Execution Plan & Timeline

### Session 1: Infrastructure & Core Models
*Focus: Establishing the codebase, authentication boundary, and basic database schemas.*

**Phase 1: Infrastructure & Authentication (Completed)**
*   **Order of build:** 
    1.  Frontend React Router scaffolding & CSS architecture.
    2.  Express backend setup and MongoDB connection.
    3.  `User` Mongoose schema and JWT auth controllers.
    4.  React Context API integration and Protected Routes.
*   **Why this order:** Everything in this system relies on role-based access control. Establishing the 'Manager' vs 'Member' boundary first ensures all subsequent API routes can be secured immediately.
*   **Estimated vs Actual:** Estimated at 1 hour but took slightly longer due to debugging modern Mongoose async hooks (`next is not a function` error) and restructuring Vite import paths.
*   **What was cut:** Dropped complex email-verification flows for signups and bypassed building a dedicated "Admin Dashboard" UI in favor of a fast, secure hidden API route for Manager creation.

**Phase 2: Core Models & Initial UI (Completed)**
*   **Order of build:** 
    1. Scaffolding basic `Project` and `Task` schemas.
    2. Setting up CRUD controllers and React UI (Dashboard & ProjectView).
*   **Why this order:** A working baseline was needed to test the API routes and frontend data flow before implementing complex relationship filtering.
*   **Estimated vs Actual:** Estimated 1 hour; took exactly 1 hour.
*   **What was pivoted:** Realized during UI testing that the brief strictly requires Members to only see projects they belong to. Stopped to commit the baseline first to maintain a clear, incremental Git history before refactoring.

---

### Session 2: Visibility & Project Management
*Focus: Data isolation between roles and managing project team members.*

**Phase 3: Member Visibility & Assignment (Completed)**
*   **Action:** Added a `members` array to the `Project` schema and modified the `getProjects` controller to filter results strictly based on `req.userId` for 'Member' roles.
*   **UI Update:** Updated the Manager dashboard to fetch all users and assign them via checkboxes during project creation.
*   **Why this order:** Built after the baseline models so I had actual database records to test the strict visibility filters against.
*   **Estimated vs Actual:** Estimated 30 mins; took 45 mins to properly manage the React state for the UI checkboxes.
*   **What was cut:** Multi-role project assignments (kept it strictly to 'Manager' owner and 'Member' array).

**Phase 4: Project Editing, Archiving & Auto-Unassign (Completed)**
*   **Action:** Implemented the ability for Managers to edit project details and archive projects.
*   **Strict Rule Enforced:** Wrote logic inside the `updateProject` controller so that if a Manager removes a Member from a project, a database query automatically unassigns that user from all tasks within that specific project.
*   **Why this order:** Essential for data integrity. The unassigning logic must exist before users heavily interact with the system.
*   **Estimated vs Actual:** Estimated 1 hour; took 1 hour.
*   **What was cut:** Real-time WebSocket notifications that would alert a user immediately when they were removed.

---

### Session 3: Complex Task Logic & Filtering
*Focus: Task dependencies, status blocking, and global search mechanisms.*

**Phase 5: Task Dependencies & Blocking (Completed)**
*   **Action:** Created a self-referencing `dependencies` array in the `Task` schema. Built the frontend UI to assign blocking dependencies.
*   **Strict Rule Enforced:** When a user tries to change a task status to 'Done', the server maps through its dependencies. If any dependency is not 'Done', the server rejects the request and returns an array of blocking task names.
*   **Why this order:** A core requirement that needed basic tasks to exist first.
*   **Estimated vs Actual:** Estimated 1.5 hours; took 2 hours to properly extract and display blocking task names in the frontend error alert.
*   **What was cut:** Deep circular dependency validation to save time.

**Phase 6: Global Task Search & Filter (Completed)**
*   **Action:** Created a global task retrieval controller supporting query parameters for text search (`$regex`), status, priority, and sorting.
*   **Strict Rule Enforced:** In the Global View, Members are strictly limited to seeing tasks where their ID matches the `assignedTo` field. Managers bypass this and see all tasks.
*   **Estimated vs Actual:** Estimated 45 mins; took 45 mins.
*   **What was cut:** Server-side pagination.

**Phase 7: Overdue Tasks Filter (Completed)**
*   **Action:** Added a `dueDate` field for tasks and an `isOverdue` query parameter.
*   **Strict Rule Enforced:** Overdue queries explicitly filter out tasks with a "Done" status.
*   **Estimated vs Actual:** Estimated 20 mins; took 20 mins.

---

### Session 4: Advanced Operations & Analytics
*Focus: Batch processing, data visualization, and soft-deleted data recovery.*

**Phase 8: Archived Projects View (Completed)**
*   **Action:** Implemented soft deletion (`isArchived`) for projects and created a dedicated manager dashboard for restoring them.
*   **Strict Rule Enforced:** Protected by the `authorizeRole('Manager')` middleware.
*   **Estimated vs Actual:** Estimated 30 mins; took 30 mins.
*   **What was cut:** A cron job to permanently hard-delete archived projects after 30 days.

**Phase 9: Strict Role Deletions & Batch Operations (Completed)**
*   **Action:** Restricted task deletion strictly to Managers. Implemented Batch Update UI panel and backend logic to process tasks iteratively, isolating failures (like dependencies) while allowing successful updates to pass through. Added native CSV export.
*   **Estimated vs Actual:** Estimated 1.5 hours; took 2 hours to isolate errors in the `for...of` loop correctly without failing the entire batch.

**Phase 10: Dashboard Analytics (Completed)**
*   **Action:** Built a `/stats` API to aggregate task metrics based on user role. Integrated `chart.js` for visualization.
*   **Estimated vs Actual:** Estimated 1 hour; took 1.5 hours to properly format the 8-week timeline array logic.

---

### Session 5: Auditing, UI Sync & Security Sweep
*Focus: Immutable logging, fixing edge cases, and finalizing server-side enforcement.*

**Phase 11: Immutable Audit History & Comments (Completed)**
*   **Action:** Added a `history` array to the `Task` schema. Intercepted updates in the `updateTask` controller to push automatic, read-only logs. Built a `/comments` route.
*   **Estimated vs Actual:** Estimated 45 mins; took 1 hour to format the frontend timeline UI and ensure chronological sorting.

**Phase 12: Real-time UI Sync & Bug Fixing (Completed)**
*   **Action:** Built an inline editing form for tasks. Fixed backend `.populate()` queries so the Audit Log correctly displays user names instead of IDs. Implemented real-time badge syncing for overdue alert dismissals via native browser events.
*   **Estimated vs Actual:** Estimated 1 hour; took 1.5 hours due to debugging MongoDB ObjectId string-matching bugs inside React arrays.

**Phase 13: Final Security Audit & Strict Compliance (Completed)**
*   **Action:** Removed UI-only role hiding and enforced strict `req.role === 'Manager'` checks on all Express controllers (create/edit/archive). Reversed a flawed alert dismissal logic to strictly lock dismissals to the `isAssignedToMe` condition.
*   **Why this order:** A final security sweep is best done after all features are functionally complete to catch any UI-only bypasses.
*   **Estimated vs Actual:** Estimated 1 hour; took 1.5 hours due to re-evaluating the business logic around project archiving permissions (applying the YAGNI principle).
*   **What was cut:** Building complex inter-manager permission walls (owner-only editing), as it was not strictly required by the brief.