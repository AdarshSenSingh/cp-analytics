// contest.js - API stubs for contest page
// Replace with real API calls as backend is implemented

// Fetch user submissions (mock)
export async function fetchUserSubmissions() {
  // TODO: Replace with real API call
  return [
    { id: 1, title: 'Mock Problem 1', url: '#', codeforcesId: '123A' },
    { id: 2, title: 'Mock Problem 2', url: '#', codeforcesId: '456B' },
    { id: 3, title: 'Mock Problem 3', url: '#', codeforcesId: '789C' },
    // ...
  ];
}

// Fetch Codeforces verdict for a submission (mock)
export async function fetchCodeforcesVerdict(submissionId) {
  // TODO: Replace with real API call
  // Simulate verdict
  return Math.random() > 0.5 ? 'Accepted' : 'Wrong Answer';
}
