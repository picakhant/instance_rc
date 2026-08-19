import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

// ES Module မှာ __dirname ပြန်ဖန်တီးခြင်း
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// ~/RCsys လမ်းကြောင်း သတ်မှတ်ခြင်း
const RC_DIR = path.join(os.homedir(), "RCsys");
const STUDENT_FILE = path.join(RC_DIR, "student", "list.txt");
const DAILY_DIR = path.join(RC_DIR, "daily");

// Folder တွေနဲ့ ဖိုင် မရှိရင် Auto တည်ဆောက်ပေးမယ့် Function
const ensureDirectories = () => {
  if (!fs.existsSync(path.join(RC_DIR, "student"))) {
    fs.mkdirSync(path.join(RC_DIR, "student"), { recursive: true });
  }
  if (!fs.existsSync(DAILY_DIR)) {
    fs.mkdirSync(DAILY_DIR, { recursive: true });
  }

  // စမ်းသပ်ဖို့ list.txt အလွတ်ဖြစ်နေရင် Dummy Data လေး တစ်ခါတည်း ထည့်ပေးထားမယ်
  if (!fs.existsSync(STUDENT_FILE)) {
    fs.writeFileSync(
      STUDENT_FILE,
      "CS-001, Aung Aung\nCS-002, Mya Mya",
      "utf-8",
    );
  }
};

// GET: ကျောင်းသားစာရင်း ယူမယ့် Route
app.get("/api/students", (req, res) => {
  try {
    ensureDirectories();
    const data = fs.readFileSync(STUDENT_FILE, "utf-8");
    const students = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [id, name] = line.split(",");
        return { id: id?.trim(), name: name?.trim() };
      });

    res.status(200).json(students);
  } catch (err) {
    console.error("Error reading students:", err);
    res.status(500).json({ error: "Failed to read student list" });
  }
});

// POST: Roll Call စာရင်းနဲ့ Report သိမ်းမယ့် Route
app.post("/api/attendance", (req, res) => {
  try {
    ensureDirectories();
    // Frontend ကပို့လိုက်တဲ့ sessionName ကို လက်ခံမယ်
    const { presentIds, sessionName } = req.body;

    if (!presentIds || !Array.isArray(presentIds)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const studentData = fs.readFileSync(STUDENT_FILE, "utf-8");
    const allStudents = studentData
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [id, name] = line.split(",");
        return { id: id?.trim(), name: name?.trim() };
      });

    const presentStudents = allStudents.filter((s) =>
      presentIds.includes(s.id),
    );
    const absentStudents = allStudents.filter(
      (s) => !presentIds.includes(s.id),
    );

    const dateStr = new Date().toISOString().split("T")[0];

    // ဖိုင်နာမည်အတွက် လုံခြုံတဲ့ စာသားဖြစ်အောင် ပြင်မယ် (Space တွေကို Underscore ပြောင်းမယ်)
    const safeSessionName = sessionName
      ? sessionName.replace(/[^a-zA-Z0-9_\u1000-\u109F]/g, "_") // မြန်မာစာနဲ့ English လို့ရအောင်
      : "Class";

    // ဖိုင်နာမည် format အသစ်: JS_Section_A_2026-07-05.txt
    const targetPath = path.join(
      DAILY_DIR,
      `${safeSessionName}_${dateStr}.txt`,
    );

    let reportContent = `Attendance Report - ${sessionName}\n`;
    reportContent += `Date: ${dateStr}\n`;
    reportContent += `================================\n`;
    reportContent += `Total Present: ${presentStudents.length}\n`;
    reportContent += `Total Absent:  ${absentStudents.length}\n`;
    reportContent += `================================\n\n`;

    reportContent += `[ PRESENT STUDENTS ]\n`;
    if (presentStudents.length === 0) reportContent += `- None -\n`;
    presentStudents.forEach((s) => {
      reportContent += `✅ ${s.id} (${s.name})\n`;
    });

    reportContent += `\n[ ABSENT STUDENTS ]\n`;
    if (absentStudents.length === 0) reportContent += `- None -\n`;
    absentStudents.forEach((s) => {
      reportContent += `❌ ${s.id} (${s.name})\n`;
    });

    fs.writeFileSync(targetPath, reportContent, "utf-8");

    res.status(200).json({
      success: true,
      message: "Roll call saved successfully",
      path: targetPath,
    });
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).json({ error: "Failed to save attendance" });
  }
});

// React ရဲ့ dist folder ကို Static File တွေအနေနဲ့ ကြေညာမယ်
const distPath = path.join(__dirname, "client");
app.use(express.static(distPath));

// Catch-all Route: React Router (Client-side routing) သုံးထားလို့
// API မဟုတ်တဲ့ တခြား ဘယ် Route ကိုသွားသွား index.html ကိုပဲ ပြန်ချပေးမယ်
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Server စတင်ခြင်း
app.listen(PORT, () => {
  console.log(`RCsys Backend is running on http://localhost:${PORT}`);
});
