import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const cardClass =
  'bg-gradient-to-br from-gray-800 via-gray-900 to-black/80 rounded-2xl shadow-lg p-6 flex-1 min-w-[260px] max-w-[400px] border border-gray-700';

export default function MainPageGraphs() {
  // Mock data
  const progressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Problems Solved',
        data: [2, 4, 3, 5, 6, 7, 8],
        fill: true,
        backgroundColor: 'rgba(99,102,241,0.2)',
        borderColor: '#6366f1',
        tension: 0.4,
        pointBackgroundColor: '#f472b6',
      },
    ],
  };
  const streakData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Streak',
        data: [1, 2, 3, 4, 5, 6, 7],
        backgroundColor: '#f472b6',
        borderRadius: 6,
      },
    ],
  };
  const topicData = {
    labels: ['Arrays', 'DP', 'Graphs', 'Strings', 'Math', 'Trees'],
    datasets: [
      {
        label: 'Problems Solved',
        data: [12, 9, 7, 15, 6, 10],
        backgroundColor: [
          '#6366f1',
          '#a78bfa',
          '#f472b6',
          '#fbbf24',
          '#34d399',
          '#60a5fa',
        ],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="flex flex-wrap gap-6 mb-8 mt-8">
      {/* Coding Progress Card */}
      <div className={cardClass}>
        <h3 className="text-lg font-bold text-indigo-200 mb-2">Coding Progress</h3>
        <Line data={progressData} options={{
          plugins: { legend: { display: false } },
          scales: { x: { grid: { color: '#222' } }, y: { grid: { color: '#222' } } },
        }} height={180} />
      </div>
      {/* Streak Card */}
      <div className={cardClass}>
        <h3 className="text-lg font-bold text-pink-200 mb-2">Days Streak</h3>
        <Bar data={streakData} options={{
          plugins: { legend: { display: false } },
          scales: { x: { grid: { color: '#222' } }, y: { grid: { color: '#222' } } },
        }} height={180} />
      </div>
      {/* Topic-wise Problems Card */}
      <div className={cardClass}>
        <h3 className="text-lg font-bold text-yellow-200 mb-2">Problems by Topic</h3>
        <Bar data={topicData} options={{
          plugins: { legend: { display: false } },
          indexAxis: 'y',
          scales: { x: { grid: { color: '#222' } }, y: { grid: { color: '#222' } } },
        }} height={180} />
      </div>
    </div>
  );
}
