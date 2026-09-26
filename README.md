# Trimester — MBA Organiser

A live calendar + attendance tracker for your last two MBA trimesters. Static front end (host free on GitHub Pages) with a Google Sheet as the database, via Apps Script. Built for **two people to use separately** — S and K each get their own courses, timetable and attendance, while still seeing a quick preview of each other's schedule.

- Day / Week / Month / Trimester calendar views
- Add a course's weekly timetable in one go (pick the days it meets, it creates every session for the term)
- Every session is auto-numbered ("Session 4") purely from the current data — cancel one and everything after it renumbers itself, nothing to fix by hand
- Log cancellations and reschedules (a reschedule cancels the original and creates a new, linked session at the new time), room changes, and deadlines — types are: Session, Test, Individual assignment, Individual project, Group assignment, Group project, Term-end exam, Extra-curricular, Other. Case studies, presentations and flip-classroom activities are just Sessions. Assignment/project types are visually distinct (dashed accents) from Sessions everywhere they appear
- Attendance defaults to Present for every held session — you only need to tap in to flag an Absence
- The **Today** tab shows today and tomorrow in full detail (with tomorrow's day-start/day-end times), the rest of the week as a grouped agenda, and — since this is shared by two people — the other person's tomorrow in the same detail and their coming week in brief
- Apple-style UI, dark mode by default, light mode toggle, accent `#e1abf5`
- Works offline-ish: last sync is cached in the browser, so the calendar still shows something without a connection

## 1. Set up the Google Sheet + Apps Script backend

One deployment serves both people — their data just lives in separate sheet tabs (`S_Trimesters`, `K_Trimesters`, `S_Courses`, `K_Courses`, and so on).

1. Create a new Google Sheet (any name, e.g. "MBA Organiser DB").
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete anything in the default `Code.gs` and paste in the contents of this repo's `Code.gs`.
4. In the Apps Script editor toolbar, select the `setup` function from the dropdown and click **Run** once. This creates **eight** tabs — `Trimesters`/`Courses`/`Events`/`Attendance`, each prefixed `S_` and `K_` — with headers. The first run will ask you to authorize the script; approve it (it only touches this one Sheet).
5. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone with the link** (this keeps it simple for a personal tool since the URL itself is your secret; you can restrict further if you prefer, but that requires signing in with Google on every request)
6. Click **Deploy**, authorize again if asked, and copy the **Web app URL** (ends in `/exec`).

**You likely don't need to do anything with that URL** — `js/api.js` already has a working deployment baked in as the default, so the app functions out of the box. Only paste your own URL into Settings if you deploy your own copy of `Code.gs` (e.g. after editing it) and want the app to use that instead.

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

## 3. Set up each profile

1. Open the deployed site. On first open it lands on **Settings** and asks which profile this device is — tap **S** or **K**. This is stored on that device/browser only (so S's phone stays on S, K's laptop stays on K — each just picks their own the first time they open it there).
2. Still in Settings, click **+ New trimester**, enter its name and start date (and end date if your school gave you one).
3. Go to **Courses → + New course** for each course this trimester: name, half/full credit (sets the 10/20 minimum automatically), professor, colour.
4. Go to **Calendar → + Add**, set Type = **Session**, pick the course, room, start time (end time defaults to +1h20m — change it if your school's slot length differs), and tick the day(s) of the week it recurs on, with "repeat until" set to the end of term. This creates the whole term's worth of that course's sessions in one go. Repeat for each course/slot in your timetable.

From then on:
- When a cancellation/reschedule email arrives, open that session on the calendar and use **Reschedule…** (creates the linked make-up session and cancels the original) or set Status → Cancelled if it isn't being made up.
- When a test/assignment/project/exam/extra-curricular event is announced, tap **+ Add** on the calendar, pick the right Type, and fill in date/time/room (leave time/room blank for a pure submission deadline).
- Use the description field on any event for your own notes.
- Mark attendance from the **Attendance** tab — every held session defaults to Present, so you only need to tap in when someone was Absent.
- To switch which profile a device is showing (e.g. testing both, or a shared family tablet), go to **Settings → Profile** and tap the other letter — it'll confirm before reloading, since it's a full swap to that person's data.

## Notes on the data model

- Each profile's data lives in its own four sheet tabs (`S_Trimesters`/`S_Courses`/`S_Events`/`S_Attendance` and the `K_` equivalents) in the same spreadsheet. You can always open the Sheet directly to bulk-edit or fix something — the app always recomputes session numbers and attendance percentages from whatever it finds there, so hand-edits are safe.
- Every request to Apps Script carries a `user: 'S'|'K'` field (added automatically by `js/api.js` based on the profile chosen in Settings) that says which set of tabs to read/write. The **Today** tab additionally does one read-only `getAll` for the *other* profile, purely to populate the "their tomorrow / their week" panels — it never writes anything to the other person's tabs.
- `Events.type` is one of: `session`, `test`, `individual_assignment`, `individual_project`, `group_assignment`, `group_project`, `exam`, `extracurricular`, `other`.
- `Events.status` is one of just `scheduled` or `cancelled`.
- A reschedule cancels the original row (status `cancelled`) and points at the new one via `linkedTo`; the new session also carries `linkedTo` back to the original, so history isn't lost, and the cancelled original no longer counts toward the session number or the course total.
- "Session N" is never stored — it's calculated fresh every time from the non-cancelled `session`-type events for that course, in date order. Cancel one and the rest renumber automatically.
- Extra sessions beyond a course's minimum (e.g. remedial classes) aren't a separate type — the Courses/Attendance views just flag when the count exceeds the minimum.
- `Attendance` rows only ever need to exist for absences. A session with no attendance row is treated as Present; marking someone Absent (or back to Present) is what creates/updates the row.

## Other things worth knowing

- **Short calendar events**: a card never shrinks below the height its own text needs, even for a 10-minute event — so the title, course name and time always stay readable rather than getting clipped. Timeline cards also show the end time next to the start time now, not just the start.
- **Mobile month view**: a day packed with chips no longer stretches its entire grid row tall on narrow screens (that's a CSS grid quirk — a row sizes to its tallest cell); those cells now scroll internally instead, capped to a fixed height. Desktop's month view is untouched.
- There's no floating "+" button anymore — add an event from the **+ Add** button in the Calendar or Today tab's top bar instead.

## Performance notes

Two things made earlier versions slow, both fixed in this version:
- **Time fields were getting corrupted.** Google Sheets silently converts a typed value like `"09:00"` into a real Time value; the old reader collapsed every date-shaped cell down to a plain calendar date, which quietly discarded the actual time and broke the calendar's layout math. The reader is now column-aware (`readAll` in `Code.gs`) and reconstructs `HH:mm` correctly regardless of how Sheets stored it — this also repairs any sessions already corrupted by the old version, no re-entry needed.
- **Every save re-fetched the whole sheet.** The front end now merges the single row the API call returns straight into local state instead of re-requesting everything, and bulk session creation writes all rows in one batch call instead of one-row-at-a-time — both cut a full timetable's worth of sessions from many slow round trips down to one fast one.

## Customising

- Accent colour and all design tokens are CSS variables at the top of `css/styles.css` (`--accent` etc.) — change `#e1abf5` there if you want a different shade later.
- Default session length (1h20m) and the calendar's visible hour range (7:00–22:00) are constants near the top of `js/ui.js` (`applyDefaultDuration`) and `js/calendar.js` (`CAL_START_MIN`, `CAL_END_MIN`, `MIN_EVENT_PX`).
