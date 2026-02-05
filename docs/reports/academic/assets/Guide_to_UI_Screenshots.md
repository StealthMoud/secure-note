# Appendix Guide: UI Screenshots Checklist

Use this checklist to take screenshots of your running application. Save them with the **exact filenames** provided below to make inserting them into your report easier.

## 1. Public Pages
*   [ ] **Landing Page** -> Save as: `ui_01_landing.png`
    *   *Capture the main homepage showing "SecureNote" branding.*
*   [ ] **Login Page** -> Save as: `ui_02_login.png`
    *   *Capture the `/login` screen showing the form.*
*   [ ] **Registration Page** -> Save as: `ui_03_register.png`
    *   *Capture with some dummy data type in.*

## 2. User Dashboard (The Core App)
*   [ ] **Main Dashboard (Empty)** -> Save as: `ui_04_dashboard_empty.png`
    *   *Capture the view when a user first logs in.*
*   [ ] **Note Creation** -> Save as: `ui_05_create_note.png`
    *   *Capture the "New Note" modal with text typed in.*
*   [ ] **Viewing a Note** -> Save as: `ui_06_view_note.png`
    *   *Capture an open note showing Title, Content, and Markdown formatting.*
*   [ ] **Search Results** -> Save as: `ui_07_search.png`
    *   *Type "secret" in the search bar and capture the results.*
*   [ ] **Profile Settings** -> Save as: `ui_08_settings.png`
    *   *Capture the "Change Password" or "MFA" settings page.*

## 3. Social Features
*   [ ] **Friendship Manager** -> Save as: `ui_09_friends.png`
    *   *Capture the screen showing "Add Friend" and requests.*
*   [ ] **Share Modal** -> Save as: `ui_10_share_modal.png`
    *   *Capture the popup for selecting a friend.*

## 4. Admin Panel (Critical)
*   [ ] **Admin Dashboard Overview** -> Save as: `admin_01_stats.png`
    *   *Capture the charts (CPU/RAM/Users).*
*   [ ] **User Management Table** -> Save as: `admin_02_users.png`
    *   *Capture the list of users showing Roles and Verification status.*
*   [ ] **Verification Review** -> Save as: `admin_03_verification.png`
    *   *Capture the screen for approving/rejecting users.*
*   [ ] **Security Audit Logs** -> Save as: `admin_04_audit_logs.png`
    *   *Capture the table of system events.*

---

### Instructions for Insertion
Once you have saved these files, append "Appendix B" to your `Agile_Process.md` like this:

```markdown
## Appendix B: Application Visuals

### User Interface
![Landing Page](ui_01_landing.png)
*Figure 4: SecureNote Public Landing Page*

![User Dashboard](ui_06_view_note.png)
*Figure 5: Encrypted Note View*

### Admin Interface
![Admin Panel](admin_01_stats.png)
*Figure 6: Real-time System Monitoring*
```
