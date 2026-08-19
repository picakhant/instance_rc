import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function AdminPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAllAsZip = async () => {
    setIsDownloading(true);
    const zip = new JSZip();

    for (const student of students) {
      const qrCanvas = document.getElementById(`qr-${student.id}`);
      if (!qrCanvas) continue;

      const cardCanvas = document.createElement("canvas");
      const ctx = cardCanvas.getContext("2d");
      const padding = 20;
      const textSpace = 70;
      cardCanvas.width = qrCanvas.width + padding * 2;
      cardCanvas.height = qrCanvas.height + padding * 2 + textSpace;

      // Download ချမယ့် ပုံကိုတော့ Print ထုတ်လို့ကောင်းအောင် အဖြူရောင်ပဲ ထားပါတယ်
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
      ctx.drawImage(qrCanvas, padding, padding);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px monospace"; // Terminal font လေး ပြောင်းထားတယ်
      ctx.textAlign = "center";
      ctx.fillText(
        student.id,
        cardCanvas.width / 2,
        qrCanvas.height + padding + 35,
      );

      ctx.fillStyle = "#333333";
      ctx.font = "16px monospace";
      ctx.fillText(
        student.name,
        cardCanvas.width / 2,
        qrCanvas.height + padding + 60,
      );

      const base64Data = cardCanvas.toDataURL("image/png").split(",")[1];
      zip.file(`${student.id}_Card.png`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "All_Student_Cards.zip");
    setIsDownloading(false);
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        setLoading(false);
      });
  }, []);

  const downloadCard = (student) => {
    const qrCanvas = document.getElementById(`qr-${student.id}`);
    if (!qrCanvas) return;

    const cardCanvas = document.createElement("canvas");
    const ctx = cardCanvas.getContext("2d");

    const padding = 20;
    const textSpace = 70;
    cardCanvas.width = qrCanvas.width + padding * 2;
    cardCanvas.height = qrCanvas.height + padding * 2 + textSpace;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
    ctx.drawImage(qrCanvas, padding, padding);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      student.id,
      cardCanvas.width / 2,
      qrCanvas.height + padding + 35,
    );

    ctx.fillStyle = "#333333";
    ctx.font = "16px monospace";
    ctx.fillText(
      student.name,
      cardCanvas.width / 2,
      qrCanvas.height + padding + 60,
    );

    const pngUrl = cardCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${student.id}_Card.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-green-500 font-mono text-lg animate-pulse">
        {">_"} fetching_database...
      </div>
    );
  }

  return (
    // font-mono နဲ့ Dark Theme Container
    <div className="bg-gray-900 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.1)] border border-gray-700 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-green-400 tracking-wider">
            ~/admin/qr_generator.sh
          </h2>
          <p className="text-gray-500 mt-1">
            <span className="text-green-500">{">_"}</span> Total Records: {students.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadAllAsZip}
            disabled={isDownloading || students.length === 0}
            className={`px-5 py-2 rounded transition-colors print:hidden text-black font-bold uppercase tracking-widest flex items-center gap-2
              ${isDownloading ? 'bg-green-800 cursor-wait text-gray-400' : 'bg-green-600 hover:bg-green-500'}
            `}
          >
            {isDownloading ? '[ COMPRESSING... ]' : '[ DOWNLOAD_ALL ]'}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <p className="text-red-400 text-center py-10 bg-black/50 border border-red-500/30 rounded">
          {">_"} ERR: NO_STUDENT_RECORDS_FOUND
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col items-center p-4 bg-black border border-gray-700 rounded hover:border-green-500/50 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all"
            >
              {/* QR Code ကို ရှင်းလင်းစွာ ဖတ်နိုင်အောင် အဖြူရောင်ဘောင်လေး ခတ်ပေးထားတယ် */}
              <div className="bg-white p-2 rounded mb-4">
                <QRCodeCanvas
                  id={`qr-${student.id}`}
                  value={student.id}
                  size={130}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              
              <p className="font-bold text-green-400 text-lg tracking-tight mb-1">
                {student.id}
              </p>
              <p className="text-gray-400 text-sm mb-4 text-center">
                {student.name}
              </p>

              <button
                onClick={() => downloadCard(student)}
                className="w-full bg-gray-800 text-green-400 border border-green-500/30 hover:bg-green-900/40 py-2 rounded text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                GET_CARD
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}