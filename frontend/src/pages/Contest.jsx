import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import API functions from services/contest.js (to be created)
// import { fetchUserSubmissions, fetchCodeforcesVerdict } from '../services/contest';

const DURATION_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '1 hr 30 min', value: 90 },
  { label: '2 hr', value: 120 },
  { label: '2 hr 30 min', value: 150 },
  { label: '3 hr', value: 180 },
];

function getISTDateTimeLocal(dateObj = new Date()) {
  // Returns IST time in yyyy-MM-ddTHH:mm for input[type=datetime-local]
  // dateObj: JS Date in any timezone
  const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  // toISOString() gives UTC, so we need to manually format IST
  const yyyy = ist.getFullYear();
  const mm = String(ist.getMonth() + 1).padStart(2, '0');
  const dd = String(ist.getDate()).padStart(2, '0');
  const HH = String(ist.getHours()).padStart(2, '0');
  const MM = String(ist.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
}

// Parse a datetime-local string as IST and return a Date object in UTC
function parseISTDateTimeLocal(dtStr) {
  // dtStr: 'yyyy-MM-ddTHH:mm' (assumed IST)
  const [datePart, timePart] = dtStr.split('T');
  const [yyyy, mm, dd] = datePart.split('-').map(Number);
  const [HH, MM] = timePart.split(':').map(Number);
  // Create a Date object in UTC corresponding to IST time
  // IST = UTC+5:30, so subtract 5:30 to get UTC
  return new Date(Date.UTC(yyyy, mm - 1, dd, HH - 5, MM - 30));
}


const Contest = () => {
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState(getISTDateTimeLocal());
  const [scheduled, setScheduled] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [contestStarted, setContestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [verdicts, setVerdicts] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null); // seconds until contest start
  const [contestTimer, setContestTimer] = useState(0); // seconds elapsed since contest start
  const navigate = useNavigate();

  // Calculate number of questions
  const numQuestions = Math.ceil(duration / 30);

  // Schedule contest
  const handleSchedule = async (e) => {
    e.preventDefault();
    setScheduled(true);
    setAlertShown(false);
    setContestStarted(false);
    setQuestions([]);
    setVerdicts({});
    setError(null);
    // Calculate initial countdown in seconds
    const start = parseISTDateTimeLocal(startTime).getTime();
    const now = (() => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      return new Date(utc + (3600000 * 5.5)).getTime();
    })();
    setCountdown(Math.max(0, Math.floor((start - now) / 1000)));
    setContestTimer(0);
  };

  // Live countdown for the entire waiting period
  useEffect(() => {
    if (!scheduled || contestStarted) return;
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      // Show alert modal for last 5 seconds
      if (countdown <= 5) setAlertShown(true);
      else setAlertShown(false);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setContestStarted(true);
      setAlertShown(false);
    }
  }, [scheduled, countdown, contestStarted]);

  // Contest timer (elapsed time)
  useEffect(() => {
    let timer;
    if (contestStarted) {
      timer = setInterval(() => setContestTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [contestStarted]);

  // Fetch random questions from user submissions when contest starts
  useEffect(() => {
    if (contestStarted && questions.length === 0) {
      // TODO: Replace with API call
      // fetchUserSubmissions().then(subs => { ... });
      // For now, mock questions:
      const mockQuestions = Array.from({ length: numQuestions }, (_, i) => ({
        id: i + 1,
        title: `Your Past Problem #${i + 1}`,
        url: '#',
        codeforcesId: '',
      }));
      setQuestions(mockQuestions);
    }
  }, [contestStarted, numQuestions, questions.length]);

  // Handle verdict fetch
  const handleVerdictFetch = async (qid, submissionId) => {
    setSubmitting(true);
    setError(null);
    try {
      // const verdict = await fetchCodeforcesVerdict(submissionId);
      // For now, mock verdict:
      const verdict = Math.random() > 0.5 ? 'Accepted' : 'Wrong Answer';
      setVerdicts((prev) => ({ ...prev, [qid]: { submissionId, verdict } }));
    } catch (e) {
      setError('Failed to fetch verdict.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Contest</h1>
      {!scheduled && (
        <form onSubmit={handleSchedule} className="space-y-4 bg-white p-4 rounded shadow">
          <div>
            <label className="block font-medium mb-1">Duration</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Start Time (IST)</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              min={getISTDateTimeLocal()}
              required
            />
            <div className="text-xs text-gray-500 mt-1">Current IST: {getISTDateTimeLocal().replace('T', ' ')}</div>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Schedule Contest</button>
        </form>
      )}
      {scheduled && !contestStarted && (
        <div className="mt-8 text-center">
          <p className="text-lg">Contest scheduled for <b>{(() => {
            // Format startTime as IST
            const d = parseISTDateTimeLocal(startTime);
            return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          })()}</b> (IST)</p>
          <div className="mt-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-indigo-700">Contest starts in</span>
            <span className="text-4xl font-mono font-extrabold text-red-600 mt-2">
              {countdown !== null ?
                `${String(Math.floor(countdown/3600)).padStart(2,'0')}:${String(Math.floor((countdown%3600)/60)).padStart(2,'0')}:${String(countdown%60).padStart(2,'0')}`
                : '--:--:--'}
            </span>
            <button
              className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-semibold shadow"
              onClick={() => {
                setScheduled(false);
                setAlertShown(false);
                setContestStarted(false);
                setQuestions([]);
                setVerdicts({});
                setError(null);
                setCountdown(null);
                setContestTimer(0);
              }}
            >
              Exit Contest
            </button>
          </div>
        </div>
      )}
      {alertShown && !contestStarted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center border-4 border-indigo-600 animate-pulse">
            <h2 className="text-3xl font-extrabold mb-4 text-indigo-700">Contest is about to begin!</h2>
            <p className="text-lg mb-2">Get ready...</p>
            <div className="text-6xl font-mono font-bold text-red-600 mb-2">
              {countdown !== null ? countdown : ''}
            </div>
            <p className="text-gray-500">Starting soon</p>
          </div>
        </div>
      )}
      {contestStarted && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-indigo-700">Contest in Progress</h2>
            <div className="bg-gray-100 px-4 py-2 rounded-lg text-lg font-mono">
              Time Remaining: {(() => {
                const remaining = duration * 60 - contestTimer;
                const min = Math.floor(remaining / 60).toString().padStart(2, '0');
                const sec = (remaining % 60).toString().padStart(2, '0');
                return `${min}:${sec}`;
              })()}
              <span className="ml-2 text-gray-500 text-sm">/ {Math.floor(duration/60).toString().padStart(2, '0')}:{(duration%60).toString().padStart(2, '0')}</span>
            </div>
            <button className="ml-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-semibold" onClick={() => navigate('/dashboard')}>Exit Contest</button>
          </div>
          <div className="mb-4 text-gray-600">Answer the following questions. Submit your solution on Codeforces and paste your submission ID/link below to get the verdict.</div>
          <ol className="space-y-8">
            {questions.map((q, idx) => (
              <li key={q.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-400">
                <div className="flex items-center mb-2">
                  <span className="text-xl font-bold text-indigo-600 mr-2">Q{idx + 1}.</span>
                  <span className="font-semibold text-lg">{q.title}</span>
                </div>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-sm">View Problem</a>
                <div className="mt-4 flex items-center">
                  <label className="block text-sm mr-2">Codeforces Submission ID/Link:</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-64 focus:ring-2 focus:ring-indigo-400"
                    value={verdicts[q.id]?.submissionId || ''}
                    onChange={e => setVerdicts(v => ({ ...v, [q.id]: { ...v[q.id], submissionId: e.target.value } }))}
                    placeholder="e.g. 123456789"
                  />
                  <button
                    className={`ml-2 px-4 py-1 rounded font-semibold transition-colors duration-150 ${submitting && verdicts[q.id]?.submissionId ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    disabled={submitting || !verdicts[q.id]?.submissionId}
                    onClick={() => handleVerdictFetch(q.id, verdicts[q.id]?.submissionId)}
                  >
                    {submitting && verdicts[q.id]?.submissionId ? 'Checking...' : 'Get Verdict'}
                  </button>
                  {verdicts[q.id]?.verdict && (
                    <span className={`ml-4 font-bold ${verdicts[q.id].verdict === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{verdicts[q.id].verdict}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
};

export default Contest;
