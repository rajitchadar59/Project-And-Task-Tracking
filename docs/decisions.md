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