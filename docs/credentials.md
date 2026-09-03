# Demo Data Setup Guide

## 1. User Accounts

**Member Accounts**
| Name | Username | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| Amit Dev | amitdev | amit@demo.com | amit123 | Member |
| Priya QA | priyaqa | priya@demo.com | priya123 | Member |
| Rahul UI | rahului | rahul@demo.com | rahul123 | Member |
| Sneha API | snehaapi | sneha@demo.com | sneha123 | Member |
| Vikram Ops | vikramops | vikram@demo.com | vikram123 | Member |

**Manager Accounts**
| Name | Username | Email | Password | Admin Secret | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Manager One | man1 | man1@demo.com | 123456 | 111111 | Manager |
| Manager Two | man2 | man2@demo.com | 123456 | 111111 | Manager |
| Manager Three | man3 | man3@demo.com | 123456 | 111111 | Manager |


---

## 2. Projects & Tasks

### Manager One's Projects

**Project 1: Website Redesign**
*   **Description:** Complete visual overhaul of the main client portal.
*   **Owner:** Manager One
*   **Status:** Active
*   **Members:** Amit, Priya
*   **Tasks:**
    *   **Wireframe Design:** (Done | High | Amit) - Create Figma wireframes for the new homepage and dashboard.
    *   **Frontend Setup:** (In Progress | High | Amit) - Initialize React app, configure Tailwind CSS, and set up routing. *(Set Due Date: 3 days ago to trigger Overdue alert)*
    *   **Client Approval:** (In Review | Medium | Priya) - Get final sign-off on the completed wireframes from the client. *(Dependency: Blocked by Wireframe Design)*

**Project 2: Mobile App MVP**
*   **Description:** First version release for iOS and Android platforms.
*   **Owner:** Manager One
*   **Status:** Active
*   **Members:** Rahul, Sneha, Vikram
*   **Tasks:**
    *   **DB Schema:** (Done | High | Sneha) - Design MongoDB collections for user profiles and settings.
    *   **Auth Screens:** (In Progress | High | Rahul) - Build login, signup, and password reset UI in React Native. *(Set Due Date: 2 days ago to trigger Overdue alert)*
    *   **Push Notifications:** (Blocked | Medium | Vikram) - Integrate Firebase Cloud Messaging for instant alerts. *(Previous Status: In Review)*

---

### Manager Two's Projects

**Project 3: CRM Migration**
*   **Description:** Moving legacy customer data to Salesforce securely.
*   **Owner:** Manager Two
*   **Status:** Active
*   **Members:** Amit, Sneha
*   **Tasks:**
    *   **Data Export:** (Done | High | Amit) - Export 10 years of legacy customer data to secure CSV files.
    *   **Data Cleaning:** (In Progress | Medium | Sneha) - Format phone numbers and remove duplicate email entries.
    *   **API Integration:** (Backlog | High | Amit, Sneha) - Push the cleaned data to Salesforce via their REST API. *(Dependency: Blocked by Data Cleaning)*

**Project 4: Cloud Setup**
*   **Description:** AWS infrastructure provisioning for the new backend.
*   **Owner:** Manager Two
*   **Status:** **Archived** *(Do not show in default views)*
*   **Members:** Vikram
*   **Tasks:**
    *   **AWS VPC Config:** (Done | High | Vikram) - Set up private subnets, security groups, and NAT gateway.
    *   **EC2 Deployment:** (Done | Medium | Vikram) - Deploy the staging Node.js server on EC2 instances.

---

### Manager Three's Projects

**Project 5: Marketing Site**
*   **Description:** Promotional landing page for the upcoming Q4 campaign.
*   **Owner:** Manager Three
*   **Status:** Active
*   **Members:** Priya, Rahul
*   **Tasks:**
    *   **SEO Optimization:** (In Progress | Medium | Priya) - Add meta tags and optimize image alt text for fast loading. *(Set Due Date: 1 day ago to trigger Overdue alert)*
    *   **Landing Page Copy:** (In Review | High | Rahul) - Write engaging copy highlighting the main product features.
    *   **Analytics Setup:** (Backlog | Low | Priya) - Install Google Tag Manager and set up conversion events.

**Project 6: SEO Audit**
*   **Description:** Comprehensive analysis of current search rankings and backlinks.
*   **Owner:** Manager Three
*   **Status:** Active
*   **Members:** Amit
*   **Tasks:**
    *   **Keyword Research:** (Done | High | Amit) - Identify the top 50 performing keywords for our niche.
    *   **Competitor Analysis:** (In Progress | Medium | Amit) - Analyze the backlink profiles of our top 3 competitors.
    *   **Final Report:** (Backlog | High | Amit) - Compile all findings into a PDF presentation for the client. *(Dependency: Blocked by Competitor Analysis)*

---

