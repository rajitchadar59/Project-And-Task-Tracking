# Project Task Tracker

A comprehensive, full-stack internal coordination tool designed for services companies to manage multiple client projects. Built with strict server-side Role-Based Access Control (RBAC), immutable audit histories, and complex task dependency workflows.

**Live Application:** [View Live Site](https://project-task-tracker-ten.vercel.app/)  


---

## 1. Homepage & Authentication
Secure entry point powered by JWT authentication, routing users strictly to their role-based environments.

<p align="center">
  <img width="49%" src="https://github.com/user-attachments/assets/a31bc88d-1add-4b7c-aa2e-6323f5a9f24f" alt="Homepage" />
  <img width="49%" src="https://github.com/user-attachments/assets/f3222c20-9c0d-4162-bfb2-456bf09d931c" alt="Signup Page" />
</p>

---

## 2. Manager Experience (Portfolio-Wide Oversight)
Managers possess elevated privileges to oversee the entire portfolio, create projects, and monitor cross-team workloads without restrictions. 

**Manager Dashboard Overview**
<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/9149ae46-6636-4b10-8c24-e299e3c2013e" alt="Dashboard Manager" />
</p>

**Workload Breakdown & 8-Week Velocity Charts**
<p align="center">
  <img width="49%" src="https://github.com/user-attachments/assets/41cb6eab-2078-4214-8f61-06cfa8196463" alt="Charts Manager Dashboard" />
  <img width="49%" src="https://github.com/user-attachments/assets/cd1039fc-5496-4178-a2ae-17eb1116eec5" alt="Bottom Charts Manager Dashboard" />
</p>

**Global Task Search (Unrestricted)**
Managers can search, filter, and batch-update tasks across every project in the system.
<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/6447837d-bd74-4494-8589-617e219a84ba" alt="Global Task Search Manager" />
</p>

**Project Controls (Edit & Archive)**
Safely edit details or archive completed projects. Archiving hides a project from default views without destroying underlying data.
<p align="center">
  <img width="49%" src="https://github.com/user-attachments/assets/12000673-b954-40ca-95b8-36daf9bf8f03" alt="Edit Project" />
  <img width="49%" src="https://github.com/user-attachments/assets/79a1fbaa-dfe4-4b3c-9335-4c46d2b5ab81" alt="Archive Project" />
</p>

---

## 3. Member Experience (Strictly Scoped Privacy)
Members operate within a highly secure environment. The backend explicitly restricts their data access to assigned projects, preventing unauthorized data leakage of team workloads. Members only see their own metrics in the Assignee charts.

**Member Dashboard & Charts**
<p align="center">
  <img width="49%" src="https://github.com/user-attachments/assets/ffb664ef-a83c-4d69-af4f-ac820faed0d7" alt="Member Stats Dashboard" />
  <img width="49%" src="https://github.com/user-attachments/assets/3995386f-aa3e-4b86-a9f7-6338c869db9a" alt="Member Stats Last 8 Weeks Chart" />
</p>

**Global Task Search (Scoped)**
Search results and filter dropdowns are dynamically restricted on the server to only include data from the Member's authorized projects.
<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/8fb8232e-ae5a-4676-8a16-2842bb7012a5" alt="Global Task Search Member" />
</p>

---

## 4. Task Workflows, Alerts & Immutable Audit History
Tasks follow strict state machine rules (*Backlog → In Progress → In Review → Done*). Server-side validation rejects illegal jumps and enforces dependency blocking. 

**Create & Edit Task Forms**
<p align="center">
  <img width="49%" src="https://github.com/user-attachments/assets/0c676209-0bd9-463f-9bcf-3972c6063af7" alt="Create Task Form" />
  <img width="49%" src="https://github.com/user-attachments/assets/299b11de-664a-4828-bd6f-93653bf6720e" alt="Edit Task Form" />
</p>

**Immutable Audit History**
Every field change, status jump, and comment is permanently recorded in a timeline that cannot be rewritten or deleted.
<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/544c6451-9d74-49c2-8f7f-79f9239c3f35" alt="Audit History" />
</p>

**Overdue Alerts & Dismissals**
Tasks past their due date trigger system-wide alerts that can be individually dismissed per assignee.
<p align="center">
  <img width="100%" src="https://github.com/user-attachments/assets/ea53c6cf-989e-453f-8084-e30e4544ffd3" alt="Alerts Image" />
</p>

---

## 5. Technology Stack

* **Frontend:** React.js, React Router, Vite, Tailwind/CSS Modules
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose (Utilizing complex sub-document arrays and aggregation pipelines)
* **Authentication:** JWT (JSON Web Tokens) with strict middleware boundary checks

---

## 6. Local Setup Instructions

**1. Clone the repository**
```bash
git clone [https://github.com/rajitchadar59/Project-Task-Tracker.git](https://github.com/rajitchadar59/Project-Task-Tracker.git)
cd Project-Task-Tracker