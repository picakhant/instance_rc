---
title: "My first post"
date: 2026-08-13
description: "A short summary shown on the blog card."
tags: [nextjs, javascript]
---

# How I Built a QR Roll Call System to Fix a Problem I Hated Every Class

*By Aster Julian Ray · Senior Mentor, UCS-Pyay · @picakhant*

Last week I stood in front of my class at the **University of Computer Studies, Pyay (UCS-Pyay)**,
teaching the students how to build a **React + Express CRUD application**. That part was great.
But at the end of the class came the part I dreaded: **roll call**.

I shouted each name, waited for a "here!", ticked a mark on paper, and repeated that for every
student. Then, after class, I'd retype everything into a report. It was slow, noisy, tiring, and
it ate into time I'd rather spend teaching.

That night I decided: **I'm a developer. I can fix this.**

---

## The Idea

What if each student had a **QR code** that encoded their student ID, and I could scan all of
them with my laptop's webcam in under a minute? The system would:

1. read each QR as it flashes in front of the camera,
2. ignore duplicates,
3. compare against the full class list,
4. save a clean, dated attendance report — and show me exactly who's missing.

No extra hardware. No internet needed. No database to configure. Just my laptop, a webcam,
and a printed piece of paper per student.

That became **RCsys**.

![CS-001](assets/qr/CS-001_Card.png)
![CS-002](assets/qr/CS-002_Card.png)
![CS-003](assets/qr/CS-003_Card.png)

> These are the actual QR cards the system generates — one per student.

---

## The Tech I Chose

### Frontend — React + Vite + Tailwind

The class was literally learning React and Express that day, so this was a natural fit.

- **Vite** for a fast, modern dev experience.
- **React Router** for two routes: `/` (scanner) and `/admin` (QR card generator).
- **Tailwind CSS** — I went with a **dark "hacker terminal" theme** because, well, I'm a CS
  mentor and it looks awesome. The UI reads like a terminal: `root@404SNF:~# RCsys`,
  `[ EXECUTE_SAVE ]`, `SYSTEM_LOGS`, `>_` prompts. It makes the tool feel like a tiny piece
  of software a developer built for themselves.

Two libraries make the magic happen:

- **[qrcode.react](https://github.com/zpao/qrcode.react)** — renders a QR canvas per student
  on the admin page. Each card encodes the student's ID (e.g. `CS-001`), drawn on a white
  background with the ID and name underneath so it's print-friendly.
- **[@yudiel/react-qr-scanner](https://github.com/yudielcurbelo/react-qr-scanner)** — opens the
  webcam and decodes QR codes in real time. It's what turns my camera into a roll-call machine.

Downloading cards is handled with **JSZip + FileSaver** — one click gives me a ZIP with every
student's card, ready to print.

### Backend — Express 5, no database

The backend is deliberately minimal: an **Express** server that reads and writes plain text
files under `~/RCsys/`.

```
~/RCsys/
├── student/list.txt            # "CS-001, Aung Aung" — one line per student
└── daily/JS_Section_A_2026-07-05.txt   # dated attendance reports
```

Two endpoints:

- `GET /api/students` — returns the class list.
- `POST /api/attendance` — receives the scanned IDs + session name, computes present/absent,
  and writes a human-readable report.

No MongoDB, no Postgres, no ORM. For a single classroom tool that runs on my own machine, a
text file is more reliable, simpler to back up, and easier to explain to students than a
full database stack. Sometimes the simplest tool is the right tool.

The server also serves the built React app, so the whole system is one process on
**http://localhost:5000**.

---

## Building It — Step by Step

### 1. Student list first

The data starts as a plain text file — `~/RCsys/student/list.txt`. The server auto-creates
the folders on first run and even seeds a dummy list so you can test before entering real names.

### 2. The Admin page (QR generator)

Fetch the list from the API, map over the students, and render a QR canvas for each one:

```jsx
<QRCodeCanvas id={`qr-${student.id}`} value={student.id} size={130} />
```

Each card is composited onto a white canvas with the ID and name below, then exported as PNG —
individually or packed into one ZIP.

### 3. The Scanner page (the fun part)

This is the heart of the app. A `Scanner` component decodes codes continuously. My scan handler:

- trims the decoded value,
- checks a `Set` so the same student can't be counted twice (people always scan twice by accident!),
- plays a short **beep** so both me and the student get instant confirmation,
- appends the ID to the on-screen `SYSTEM_LOGS`.

```jsx
if (!scannedSet.current.has(studentId)) {
  scannedSet.current.add(studentId);
  playBeep();
  setScannedIds(Array.from(scannedSet.current));
}
```

### 4. Saving the roll call

When the scanning is done, I hit `[ EXECUTE_SAVE ]`. A modal asks for a **session name**
(e.g. `JS_Section_A`), and the frontend POSTs the present IDs. The server:

- marks everyone in the list who isn't in the scanned set as **absent**,
- writes a dated report to `~/RCsys/daily/`,
- returns the result.

The UI then shows a summary with the full **missing list** — so I immediately know who to chase
up, before the students even leave the room.

---

## Challenges I Hit Along the Way

1. **Duplicate scans** — The same card inevitably gets scanned twice. Solved with a `Set` and
   instant beep feedback.

2. **Report filenames** — Session names contain spaces and (in my case) Burmese characters.
   I sanitize the name to `[A-Za-z0-9_\u1000-\u109F]` so filenames stay safe while still
   supporting Myanmar text.

3. **Client-side routing on the server** — React Router needs the server to fall back to
   `index.html` for any non-API route, otherwise refreshing `/admin` 404s:

   ```js
   app.get(/.*/, (req, res) => res.sendFile(path.join(distPath, "index.html")));
   ```

4. **CORS between dev servers** — In development the Vite dev server (:5173) talks to the
   Express API (:5000), so the backend enables `cors()`.

5. **The beep** — I used the Web Audio API to synthesize a quick sine beep instead of shipping
   an audio file. Tiny touch, but it makes scanning feel responsive.

---

## The Result

Roll call went from **5+ minutes of shouting** to **about 30 seconds of scanning**.

- Students love the "high-tech" card scanning — it feels like boarding a plane.
- I get an accurate present/absent list with zero manual tallying.
- Reports are saved as dated text files, ready to paste into records.
- No database, no internet, no deployment — it just runs on my laptop.

---

## What I Learned

- **Build tools for your own friction.** The pain I felt at the end of every class became the
  perfect spec for this project.
- **A QR code is just a string.** Once I realized the code can encode any ID, the whole system
  is really just *string → camera → lookup → save*.
- **Simple storage wins.** My instinct was to add a database; the honest answer was a text file.
- **Good UX is small details.** The beep, the dedup, the terminal aesthetic, the ZIP download —
  none were "required," but together they make the tool feel great to use.
- **Teach by example.** I used the exact same stack (React + Express) I was mentoring that week —
  now my students have a real, working example of the CRUD concepts I explained on the board.

---

## Try It

The project is open — grab the code, add your own `~/RCsys/student/list.txt`, and take your
next roll call in seconds.

- **Author:** Aster Julian Ray — Senior Mentor, UCS-Pyay
- **GitHub:** [@picakhant](https://github.com/picakhant)

*No more shouting roll call. Ever.*

---

## မြန်မာဘာသာဖြင့် (Myanmar Version)

*(ဤနေရာတွင် သင့်မြန်မာဘာသာစာသားကို ရေးသားနိုင်ပါသည် — This section is for the Myanmar translation of the blog.)*

- **Author:** Aster Julian Ray — Senior Mentor, UCS-Pyay
- **GitHub:** [@picakhant](https://github.com/picakhant)