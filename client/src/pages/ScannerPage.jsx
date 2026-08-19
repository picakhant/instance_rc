import { useState, useRef, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import PromptModal from "../components/PromptModal";
import SummaryView from "../components/SummaryView";

export default function ScannerPage() {
  const [scannedIds, setScannedIds] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  const [showSummary, setShowSummary] = useState(false);
  const [absentList, setAbsentList] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const scannedSet = useRef(new Set());

  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then((res) => res.json())
      .then((data) => setAllStudents(data))
      .catch((err) => console.error("Failed to load students:", err));
  }, []);

  const playBeep = () => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.4,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleScan = (result) => {
    if (showSummary || showPromptModal) return;

    if (result && result.length > 0) {
      const studentId = result[0].rawValue.trim();

      if (!scannedSet.current.has(studentId)) {
        scannedSet.current.add(studentId);
        playBeep();
        setScannedIds(Array.from(scannedSet.current));

        console.log(`✅ [SUCCESS] Added: ${studentId}`);
      }
    }
  };

  const handleEndClassClick = () => {
    if (scannedIds.length === 0) {
      setSaveStatus({ type: "error", message: "ERR: NO_DATA_FOUND" });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }
    setShowPromptModal(true);
  };

  const confirmSaveRollCall = async (sessionName) => {
    setShowPromptModal(false);
    setSaveStatus({ type: "loading", message: "executing_save..." });

    try {
      const res = await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentIds: scannedIds, sessionName }),
      });

      const data = await res.json();

      if (data.success) {
        const missing = allStudents.filter(
          (student) => !scannedIds.includes(student.id),
        );
        setAbsentList(missing);

        setScannedIds([]);
        scannedSet.current.clear();

        setShowSummary(true);
        setSaveStatus(null);
      } else {
        setSaveStatus({
          type: "error",
          message: data.error || "ERR: SAVE_FAILED",
        });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus({ type: "error", message: "ERR: CONNECTION_TIMEOUT" });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const startNewClass = () => {
    setShowSummary(false);
    setAbsentList([]);
    setScannedIds([]);
    scannedSet.current.clear();
  };

  if (showSummary) {
    return (
      <SummaryView absentList={absentList} onStartNewClass={startNewClass} />
    );
  }

  return (
    // font-mono သုံးပြီး Terminal Vibe ယူထားပါတယ်
    <div className="flex flex-col md:flex-row gap-6 font-mono">
      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onConfirm={confirmSaveRollCall}
      />

      {/* Scanner Card - Dark Theme */}
      <div className="flex-1 bg-gray-900 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.1)] border border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h2 className="text-xl font-bold text-green-400 ml-2 tracking-wider">~/scanner/init.sh</h2>
        </div>

        {/* Scanner ပတ်လည်မှာ Dashed Border နဲ့ Hacker ပုံစံ လုပ်ထားပါတယ် */}
        <div className="overflow-hidden rounded border-2 border-dashed border-green-500/50 relative bg-black p-1">
          <Scanner
            onScan={handleScan}
            formats={["qr_code"]}
            components={{ audio: false }}
          />
        </div>

        <p className="text-gray-400 text-sm mt-4 text-center">
          <span className="text-green-500">{'>_'}</span> Awaiting optical input...
        </p>
      </div>

      {/* List Card - Dark Theme */}
      <div className="w-full md:w-96 bg-gray-900 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.1)] border border-gray-700 flex flex-col h-fit">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
          <h2 className="text-lg font-bold text-green-400 tracking-wider">{'>_'} SYSTEM_LOGS</h2>
          <span className="bg-gray-800 text-green-400 border border-green-500/30 px-3 py-1 rounded text-sm">
            [{scannedIds.length}/{allStudents.length}]
          </span>
        </div>

        <div className="bg-black border border-gray-700 rounded p-4 min-h-[250px] max-h-[400px] overflow-y-auto mb-6 custom-scrollbar">
          {scannedIds.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 text-sm animate-pulse">
              {'>_'} awaiting_data...
            </div>
          ) : (
            <ul className="space-y-2">
              {scannedIds.map((id, index) => {
                const studentData = allStudents.find((s) => s.id === id);
                return (
                  <li
                    key={index}
                    className="flex flex-col bg-gray-800 p-2 rounded border border-gray-700 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm">~#</span>
                      <span className="font-bold text-gray-200">{id}</span>
                    </div>
                    {studentData && (
                      <span className="text-xs text-gray-400 ml-6">
                        {studentData.name}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {saveStatus && (
          <div
            className={`p-3 rounded mb-4 text-sm font-bold tracking-wide ${
              saveStatus.type === "success"
                ? "bg-green-900/50 text-green-400 border border-green-500/50"
                : saveStatus.type === "error"
                  ? "bg-red-900/50 text-red-400 border border-red-500/50"
                  : "bg-blue-900/50 text-blue-400 border border-blue-500/50"
            }`}
          >
            {'>_'} {saveStatus.message}
          </div>
        )}

        <button
          onClick={handleEndClassClick}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-4 rounded transition-colors uppercase tracking-widest"
        >
          [ EXECUTE_SAVE ]
        </button>
      </div>
    </div>
  );
}