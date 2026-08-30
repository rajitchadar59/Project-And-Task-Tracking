# Execution Plan & Timeline

**Phase 1: Infrastructure & Authentication (Completed)**
*   **Order of build:** 
    1.  Frontend React Router scaffolding & CSS architecture.
    2.  Express backend setup and MongoDB connection.
    3.  `User` Mongoose schema and JWT auth controllers.
    4.  React Context API integration and Protected Routes.
*   **Why this order:** Everything in this system (Projects, Tasks, Dependencies) relies on role-based access control. Establishing the 'Manager' vs 'Member' boundary first ensures all subsequent API routes can be secured immediately.
*   **What was cut:** Dropped complex email-verification flows for signups and bypassed building a dedicated "Admin Dashboard" UI in favor of a fast, secure hidden API route for Manager creation.