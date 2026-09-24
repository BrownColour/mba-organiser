# Trimester — MBA Organiser

A live calendar + attendance tracker for your last two MBA trimesters. Static front end (host free on GitHub Pages) with a Google Sheet as the database, via Apps Script.

- Day / Week / Month / Trimester calendar views
- Add a course's weekly timetable in one go (pick the days it meets, it creates every session for the term)
- Log cancellations, reschedules (linked to the original), room changes, deadlines (tests, submissions, assignments, presentations, case studies, group projects, exams, extra-curricular/placement events)
- Per-session attendance, with a running count against each course's minimum session requirement (10 for half credit, 20 for full credit)
- Apple-style UI, dark mode by default, light mode toggle, accent `#e1abf5`
- Works offline-ish: last sync is cached in the browser, so the calendar still shows something without a connection

## 1. Set up the Google Sheet + Apps Script backend

1. Create a new Google Sheet (any name, e.g. "MBA Organiser DB").
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete anything in the default `Code.gs` and paste in the contents of this repo's `Code.gs`.
4. In the Apps Script editor toolbar, select the `setup` function from the dropdown and click **Run** once. This creates four tabs — `Trimesters`, `Courses`, `Events`, `Attendance` — with headers. The first run will ask you to authorize the script; approve it (it only touches this one Sheet).
5. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone with the link** (this keeps it simple for a personal tool since the URL itself is your secret; you can restrict further if you prefer, but that requires signing in with Google on every request)
6. Click **Deploy**, authorize again if asked, and copy the **Web app URL** (ends in `/exec`). Keep this handy.

> If you ever edit `Code.gs` again, you need to **Deploy → Manage deployments → Edit (pencil) → New version** for changes to go live on the same URL.

## 2. Deploy the front end to GitHub Pages

1. Create a new GitHub repository (e.g. `mba-organiser`).
2. Upload these files, keeping the folder structure:
   ```
   index.html
   css/styles.css
   js/api.js
   js/state.js
   js/calendar.js
   js/ui.js
   js/main.js
   ```
   (`Code.gs` and this `README.md` can sit in the repo too, for reference — they aren't served to the browser.)
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
5. GitHub gives you a URL like `https://<your-username>.github.io/mba-organiser/`. Open it.

## 3. Connect the app to your Sheet

1. Open the deployed site → **Settings** (left sidebar, or bottom nav on mobile).
2. Paste the Apps Script **Web app URL** from step 1.6 into "Apps Script Web App URL" and click **Save & sync**.
3. Still in Settings, click **+ New trimester**, enter its name and start date (and end date if your school gave you one).
4. Go to **Courses → + New course** for each course this trimester: name, half/full credit (sets the 10/20 minimum automatically), professor, colour.
5. Go to **Calendar → + Add**, set Type = **Session**, pick the course, room, start time (end time defaults to +1h20m — change it if your school's slot length differs), and tick the day(s) of the week it recurs on, with "repeat until" set to the end of term. This creates the whole term's worth of that course's sessions in one go. Repeat for each course/slot in your timetable.

From then on:
- When a cancellation/reschedule email arrives, open that session on the calendar and use **Cancel** (set Status → Cancelled) and/or **Reschedule…** to create the linked make-up session.
- When a test/submission/assignment/presentation/case study/group project/exam/extra-curricular event is announced, tap **+ Add** on the calendar, pick the right Type, and fill in date/time/room (leave time/room blank for a pure submission deadline).
- Use the description field on any event for your own notes.
- Mark attendance from the **Attendance** tab, tapping a session to log Present/Absent/N/A.

## Notes on the data model

- Everything lives in four sheet tabs: `Trimesters`, `Courses`, `Events`, `Attendance`. You can always open the Sheet directly to bulk-edit or fix something.
- `Events.type` is one of: `session`, `test`, `submission`, `assignment`, `presentation`, `flip`, `case`, `group_project`, `exam`, `extracurricular`, `other`.
- `Events.status` is one of: `scheduled`, `completed`, `cancelled`, `rescheduled`.
- A rescheduled session keeps its row (status `rescheduled`) and points at the new one via `linkedTo`; the new session also carries `linkedTo` back to the original, so history isn't lost.
- Extra sessions beyond a course's minimum (e.g. remedial classes) aren't a separate type — the Courses view just flags when the scheduled count exceeds the minimum.

## Customising

- Accent colour and all design tokens are CSS variables at the top of `css/styles.css` (`--accent` etc.) — change `#e1abf5` there if you want a different shade later.
- Default session length (1h20m) and the calendar's visible hour range (7:00–22:00) are constants near the top of `js/ui.js` (`applyDefaultDuration`) and `js/calendar.js` (`CAL_START_MIN`, `CAL_END_MIN`).
