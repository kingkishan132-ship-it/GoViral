import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase.js";
import AuthScreen from "./components/AuthScreen.jsx";
import Upload from "./components/Upload.jsx";
import AutoEdit from "./components/AutoEdit.jsx";
import Processing from "./components/Processing.jsx";
import Results from "./components/Results.jsx";
import Header from "./components/Header.jsx";

const STAGES = ["upload", "auto", "processing", "results"];

export default function App() {
const [session, setSession] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [stage, setStage] = useState("upload");
const [file, setFile] = useState(null);
const [videoUrl, setVideoUrl] = useState("");
const [autoEdit, setAutoEdit] = useState(true);
const [progress, setProgress] = useState(0);
const inputRef = useRef(null);
const timerRef = useRef(null);

useEffect(() => {
let mounted = true;

supabase.auth.getSession().then(({ data, error }) => {
  if (!mounted) return;
  if (error) console.error("Session check failed:", error);
  setSession(data?.session ?? null);
  setAuthLoading(false);
});

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, nextSession) => {
  setSession(nextSession);
  setAuthLoading(false);
});

return () => {
  mounted = false;
  subscription.unsubscribe();
};

}, []);

useEffect(() => {
return () => {
if (videoUrl) URL.revokeObjectURL(videoUrl);
if (timerRef.current) clearInterval(timerRef.current);
};
}, [videoUrl]);

function selectFile(nextFile) {
if (!nextFile) return;

if (!nextFile.type.startsWith("video/")) {
  alert("Please select a valid video file.");
  return;
}

if (videoUrl) URL.revokeObjectURL(videoUrl);

setFile(nextFile);
setVideoUrl(URL.createObjectURL(nextFile));
setProgress(0);
setStage("auto");

}

function handleFileChange(event) {
const nextFile = event.target.files?.[0];
if (nextFile) selectFile(nextFile);
event.target.value = "";
}

function createClips() {
if (!file) {
inputRef.current?.click();
return;
}

if (timerRef.current) clearInterval(timerRef.current);

setStage("processing");
setProgress(4);

let value = 4;

timerRef.current = setInterval(() => {
  value = Math.min(value + 7, 100);
  setProgress(value);

  if (value >= 100) {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeout(() => setStage("results"), 350);
  }
}, 250);

}

function startOver() {
if (timerRef.current) clearInterval(timerRef.current);
timerRef.current = null;

setFile(null);
setVideoUrl("");
setProgress(0);
setStage("upload");

}

async function handleLogout() {
const { error } = await supabase.auth.signOut();
if (error) {
alert("Could not sign out. Please try again.");
} else {
startOver();
}
}

if (authLoading) {
return (
<main className="auth-page">
<div className="auth-card">
<div className="auth-brand">GoViral</div>
Checking your session...
</div>
</main>
);
}

if (!session) {
return <AuthScreen />;
}

return (
<div className="app-shell">
<Header stage={stage} onStartOver={startOver} />

  <div className="account-bar">
    <span>
      {session.user.user_metadata?.display_name ||
        session.user.email}
    </span>
    <button type="button" onClick={handleLogout}>
      Log out
    </button>
  </div>

  <main>
    <div
      className="stage-progress"
      aria-label="GoViral workflow progress"
    >
      {STAGES.map((item, index) => (
        <span
          key={item}
          className={
            STAGES.indexOf(stage) >= index
              ? "stage-dot active"
              : "stage-dot"
          }
        />
      ))}
    </div>

    <section className="page-wrap">
      {stage === "upload" && (
        <Upload
          onSelect={selectFile}
          inputRef={inputRef}
          onChooseFile={handleFileChange}
        />
      )}

      {stage === "auto" && (
        <AutoEdit
          file={file}
          videoUrl={videoUrl}
          enabled={autoEdit}
          setEnabled={setAutoEdit}
          onCreate={createClips}
          onChangeVideo={() => inputRef.current?.click()}
        />
      )}

      {stage === "processing" && (
        <Processing file={file} progress={progress} />
      )}

      {stage === "results" && (
        <Results
          file={file}
          videoUrl={videoUrl}
          onStartOver={startOver}
        />
      )}
    </section>
  </main>

  <input
    ref={inputRef}
    hidden
    type="file"
    accept="video/*"
    onChange={handleFileChange}
  />
</div>

);
}