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