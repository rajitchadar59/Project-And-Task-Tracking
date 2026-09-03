# Schema

**Table by table: what columns and types does each one have?**

*   **User**
    *   `name`: String (Required)
    *   `username`: String (Required, Unique, Trimmed)
    *   `email`: String (Required, Unique, Lowercase)
    *   `password`: String (Required, hashed via bcrypt)
    *   `role`: String (Enum: 'Manager', 'Member', Default: 'Member')
    *   `timestamps`: Date (Auto-generated `createdAt`, `updatedAt`)
*   **Project**
    *   `name`: String (Required, Trimmed)
    *   `description`: String (Required)
    *   `owner`: ObjectId (Ref: 'User', Required)
    *   `members`: Array of ObjectIds (Ref: 'User')
    *   `isArchived`: Boolean (Default: false)
    *   `timestamps`: Date (Auto-generated `createdAt`, `updatedAt`)
*   **Task**
    *   `title`: String (Required)
    *   `description`: String (Required)
    *   `status`: String (Enum: 'Backlog', 'In Progress', 'In Review', 'Done', 'Blocked', Default: 'Backlog')
    *   `previousStatus`: String (Enum: 'Backlog', 'In Progress', 'In Review', null, Default: null)
    *   `priority`: String (Enum: 'Low', 'Medium', 'High', Default: 'Medium')
    *   `dueDate`: Date (Optional)
    *   `project`: ObjectId (Ref: 'Project', Required)
    *   `assignedTo`: Array of ObjectIds (Ref: 'User')
    *   `dependencies`: Array of ObjectIds (Ref: 'Task')
    *   `dismissedBy`: Array of ObjectIds (Ref: 'User')
    *   `history`: Array of embedded objects (`action`: String, `details`: String, `user`: ObjectId, `date`: Date)
    *   `timestamps`: Date (Auto-generated `createdAt`, `updatedAt`)

**Which relationships are one-to-many, and which are many-to-many?**

*   **One-to-Many:**
    *   *User to Owned Projects:* A manager (`owner`) can own many projects, but a project has exactly one owner.
    *   *Project to Tasks:* A project contains multiple tasks, but a task belongs to exactly one project.
*   **Many-to-Many:**
    *   *Users to Projects (Members):* Users can be members of multiple projects, and projects can have multiple users (via the `members` array).
    *   *Users to Tasks (Assignments):* Users can be assigned multiple tasks, and a task can have multiple assignees (via the `assignedTo` array).
    *   *Tasks to Tasks (Dependencies):* A task can block multiple tasks and depend on multiple tasks (via the `dependencies` self-referencing array).

**Which constraints are enforced by the database, and which by application code — and why did you draw the line there?**

*   **Database Constraints:** Structural integrity (String, Date, Boolean), required flags, unique constraints (`email`, `username`), and state limits (`enum` arrays for status, priority, and role). The line is drawn here because the database is the final source of truth; enforcing these guarantees dirty data cannot enter the system even if API checks fail.
*   **Application Code Constraints:** The 5-stage task lifecycle rules, dependency blocking checks (preventing completion if blocking tasks aren't 'Done'), and strict role-based access control. The line is drawn here because these checks require reading external context (querying other tasks or user roles) which is handled efficiently in business logic to return exact, human-readable error messages.

**What did you deliberately denormalise?**

*   **`previousStatus` on Task:** I denormalized the previous status directly onto the Task document. Instead of running an expensive query through the embedded `history` array to figure out the state before a task was 'Blocked', this allows instant reversion.
*   **Embedded `history` Array:** Rather than creating a separate `AuditLog` collection and joining it, I embedded the history directly into the Task document. Task history is almost exclusively read *with* the task, saving a costly `$lookup` operation on every read.

**What would break first if this had 100x the data?**

1.  **The Embedded `history` Array:** MongoDB has a hard 16MB limit per document. For long-running tasks accumulating thousands of automated updates and comments, the document will eventually hit this limit and crash updates.
2.  **Global Task Search (`$regex`):** The application relies on `$regex` for text search across titles and descriptions. At 100x data, running regex scans without a dedicated Text Index or Elasticsearch will result in full-collection scans, spiking CPU usage.
3.  **Unbounded Arrays:** Massive enterprise teams adding thousands of ObjectIds to `members` or `assignedTo` arrays will degrade read/write performance for those specific documents.