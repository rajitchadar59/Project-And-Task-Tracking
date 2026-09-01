# Key Technical Decisions

**1. Manager Creation Strategy**
*   **Chose:** A hidden backend API route (`/api/auth/hidden-manager`) protected by a static `.env` secret.
*   **Rejected:** Building a full Admin UI or writing a standalone CLI seed script.
*   **Why:** A seed script introduces deployment complexity, and an Admin UI wastes development time. A hidden route allows instant Manager creation via Thunder Client/Postman while maintaining security.

**2. Frontend State Management**
*   **Chose:** React Context API (`AuthContext`).
*   **Rejected:** Redux or Zustand.
*   **Why:** The only global state required right now is the JWT token and user role. Redux introduces unnecessary boilerplate for this scale.

**3. Mongoose Pre-Save Hook (The Reversal)**
*   **Chose (Eventually):** A pure `async/await` function returning early if the password is unmodified.
*   **Rejected (Initially Chosen, then Reversed):** Using the traditional `next()` callback function inside the hook.
*   **Why:** Initial implementation caused the server to crash with `TypeError: next is not a function`. Modern Mongoose handles promises directly in async hooks, making the `next` parameter obsolete and crash-prone.

**4. CSS Architecture**
*   **Chose:** Custom CSS-per-component utilizing an Airbnb-inspired color palette (`#FF385C`).
*   **Rejected:** Heavy component libraries (Material UI, Ant Design) or utility-first frameworks (Tailwind).
*   **Why:** Clean, custom CSS prevents bundle bloat, isolates styles effectively, and prevents fighting with default library themes to achieve the specific visual layout desired.

**5. Global Request Security**
*   **Chose:** Axios Interceptors.
*   **Rejected:** Manually fetching and attaching the JWT token in every individual API call.
*   **Why:** Interceptors centralize the logic. If a token expires (401 response), the interceptor automatically wipes the local storage and kicks the user back to `/auth`, ensuring security without duplicating code.

**6. Iterative Schema Refactoring**
*   **Chose:** To commit the basic `Project` schema and UI first, before implementing the strict "members can only see their own projects" rule.
*   **Rejected:** Refactoring the schema and controller all at once in a single, massive commit.
*   **Why:** The assessment explicitly requires an incremental Git history that shows the design changing along the way. Committing the working baseline first, then refactoring to add a `members` array in the next commit, clearly demonstrates iterative development. 

**7. Project-User Relationship Strategy**
*   **Chose:** Adding a `members` array containing User ObjectIds directly to the `Project` schema.
*   **Rejected:** Creating a separate `ProjectMember` mapping/join collection (like in SQL).
*   **Why:** MongoDB handles document arrays efficiently. A simple `members` array makes the strict visibility query (`{ members: req.userId }`) incredibly fast and straightforward without requiring complex aggregation pipelines.

**8. Auto-Unassignment Logic Placement**
*   **Chose:** Implementing the strict task unassignment logic directly inside the `updateProject` controller using `Task.updateMany`.
*   **Rejected:** Using MongoDB database triggers or Mongoose `pre-save` middleware on the Project schema.
*   **Why:** Middleware can make debugging difficult and hide side effects. Keeping the `$unset` query explicitly in the controller makes the business logic highly visible, easier to test, and perfectly handles the specific requirement without over-engineering.

**9. Dependency Blocking Validation**
*   **Chose:** Server-side validation inside the `updateTask` controller (`PATCH /api/tasks/:id`).
*   **Rejected:** Relying purely on frontend UI blocking (disabling the dropdown) or using complex Mongoose pre-save hooks.
*   **Why:** Frontend validation is insecure and easily bypassed via API clients. Pre-save hooks make sending specific error messages (like the exact names of the blocking tasks) back to the client difficult. Controller-level validation ensures bulletproof security while allowing a clean error response containing the exact `blockingTasks` array.


**10. Task Visibility Architecture (Global vs. Project)**
*   **Chose:** Implementing a split-visibility model. In the "My Tasks" (Global) view, members only see explicitly assigned tasks. In the "Project" view, members see all tasks within that project.
*   **Why:** Global view is for personal focus (what *I* need to do). Project view requires transparency so developers can see unassigned tasks and track tasks that are blocking their own work (Dependency Blocking).


**11. Soft Deletion over Hard Deletion for Projects**
* **Chose:** Used an `isArchived: true` flag instead of deleting documents from the database.
* **Why:** Permanent deletion creates orphaned tasks and destroys historical data. Soft deletion gives Managers a safety net to restore projects.

**12. Iterative Batch Processing vs. Bulk Operations**
*   **Chose:** I processed batch task updates by looping through them one by one in the Node.js controller using a `for...of` loop, evaluating rules per task, and returning a detailed success/fail summary.
*   **Rejected:** Using Mongoose bulk operations like `Task.updateMany()`.
*   **Why:** The assignment explicitly required that illegal moves in a batch (like marking a blocked task as Done) must be rejected with a reason, but *valid* tasks in the same batch must still succeed. A single `updateMany` query would either bypass my JavaScript-level dependency checks or fail the entire operation at once if I tried to use database-level validation. Processing them iteratively ensured isolated validation.


**13. Dashboard Data Aggregation Strategy**
*   **Chose:** Aggregating all dashboard statistics (open counts, overdue, chart distributions) in a single backend controller (`/stats`) and passing a formatted JSON object to the frontend.
*   **Rejected:** Fetching all raw tasks to the frontend and calculating the stats using JavaScript array methods in React.
*   **Why:** Fetching all tasks just to count them is incredibly inefficient and slows down the client. Server-side calculation ensures the frontend remains fast and only receives the exact numbers needed for Chart.js.


## Decision 14: Audit Log Data Modeling
- **Chose:** Embedding the `history` log array directly inside the `Task` document.
- **Rejected:** Creating a separate `AuditLog` collection and linking it via ObjectIds.
- **Why:** The audit timeline is tightly coupled to the task. Embedding it avoids a costly database `$lookup` (join) on every read, keeping the task detail view extremely fast.

## Decision 15: Open Collaboration vs. Strict Assignment Locking
- **Chose:** Allowing any project member to comment on or update a task, even if it is not explicitly assigned to them, while automatically logging their name in the immutable history.
- **Rejected:** Strictly locking comments/updates so that only the `assignedTo` user can touch the task.
- **Why:** Real-world collaboration requires unassigned members to ask questions (e.g., "When will this blocking task be done?"). The immutable audit log naturally enforces accountability without breaking collaboration.