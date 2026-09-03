# Project & Task Tracking System

A comprehensive, full-stack internal coordination tool designed for services companies to manage multiple client projects. Built with strict server-side Role-Based Access Control (RBAC), immutable audit histories, and complex task dependency workflows. 

**Live Application:** [View Live Site](https://project-task-tracker-ten.vercel.app/)  
**Backend API:** `https://project-task-tracker-backend-36mn.onrender.com`

---

## 1. Homepage & Authentication

The secure entry point of the application. Authentication is handled via JWT, routing users to their specific, role-based environments.

**Homepage**
![Homepage](https://github.com/user-attachments/assets/20151b5a-4dfb-443a-b7c1-73020208789b)

**Signup / Authentication**
![Signup Page](https://github.com/user-attachments/assets/a31bc88d-1add-4b7c-aa2e-6323f5a9f24f)

---

## 2. Manager Experience (Portfolio View)

Managers possess elevated privileges to oversee the entire portfolio, create and archive projects, and monitor cross-team workloads without restrictions.

**Manager Dashboard Overview**
Displays headline numbers, overdue tasks, and portfolio-wide metrics at a glance.
![Manager Dashboard](https://github.com/user-attachments/assets/f3222c20-9c0d-4162-bfb2-456bf09d931c)

**Workload & Status Breakdown**
Breaks down tasks by status and displays workloads across *all* staff members to quickly identify bottlenecks.
![Charts Manager Dashboard](https://github.com/user-attachments/assets/9149ae46-6636-4b10-8c24-e299e3c2013e)

**8-Week Completion Velocity**
![Bottom Charts Manager Dashboard](https://github.com/user-attachments/assets/41cb6eab-2078-4214-8f61-06cfa8196463)

**Global Task Search (Unrestricted)**
Managers can search, filter, and apply batch-updates to tasks across every project in the system.
![Global Task Search Manager](https://github.com/user-attachments/assets/ea53c6cf-989e-453f-8084-e30e4544ffd3)

**Project Controls (Edit & Archive)**
Safely edit details or archive completed projects. Archiving hides a project from default views without destroying underlying data.
![Edit Project](https://github.com/user-attachments/assets/12000673-b954-40ca-95b8-36daf9bf8f03)
![Archive Project](https://github.com/user-attachments/assets/79a1fbaa-dfe4-4b3c-9335-4c46d2b5ab81)

---

## 3. Member Experience (Strictly Scoped Data)

Members operate within a highly secure, scoped environment. The backend explicitly restricts their data access to projects they are officially assigned to, strictly preventing unauthorized data leakage.

**Member Dashboard**
Displays metrics relevant only to the Member's assigned projects and their personal workload.
![Member Stats Dashboard](https://github.com/user-attachments/assets/ffb664ef-a83c-4d69-af4f-ac820faed0d7)

**Member Charts (Privacy Enforced)**
The assignee breakdown is strictly limited to the logged-in Member. They cannot view the private workloads of other teammates.
![Member Stats Last 8 Weeks Chart](https://github.com/user-attachments/assets/3995386f-aa3e-4b86-a9f7-6338c869db9a)

**Global Task Search (Scoped)**
Search results and filter dropdowns are dynamically restricted on the server to only include data from the Member's authorized projects.
![Global Task Search Member](https://github.com/user-attachments/assets/6447837d-bd74-4494-8589-617e219a84ba)

---

## 4. Task Workflows, Rules & Audit History

Tasks follow strict state machine rules (*Backlog → In Progress → In Review → Done*). Server-side validation rejects illegal jumps and enforces dependency blocking.

**Create & Edit Tasks**
![Create Task Form](https://github.com/user-attachments/assets/0c676209-0bd9-463f-9bcf-3972c6063af7)
![Edit Task Form](https://github.com/user-attachments/assets/299b11de-664a-4828-bd6f-93653bf6720e)

**Immutable Audit History**
Every field change, status jump, and comment is permanently recorded in a timeline that cannot be rewritten or deleted—even by Managers.
![Audit History](https://github.com/user-attachments/assets/544c6451-9d74-49c2-8f7f-79f9239c3f35)

**Overdue Alerts & Dismissals**
Tasks past their due date trigger alerts. Members can dismiss alerts for their own tasks. If a manager updates the due date, the dismissal is cleared and the alert instantly returns.
![Alerts](https://github.com/user-attachments/assets/cd1039fc-5496-4178-a2ae-17eb1116eec5)

---

## 5. Technology Stack

* **Frontend:** React.js, React Router, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose (Utilizing complex sub-document arrays and aggregation pipelines)
* **Authentication:** JWT (JSON Web Tokens) with strict middleware boundary checks

---

## 6. Local Setup Instructions

**1. Clone the repository**
```bash
git clone [https://github.com/rajitchadar59/Project-Task-Tracker.git](https://github.com/rajitchadar59/Project-Task-Tracker.git)
cd Project-Task-Tracker