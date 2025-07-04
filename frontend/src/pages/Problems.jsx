
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon, TagIcon } from '@heroicons/react/24/outline';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    platform: '',
    status: '',
    topics: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/problems', {
        headers: { 'x-auth-token': token }
      });
      
      // Using mock data for now
      const mockProblems = [
        {
          _id: '1',
          title: 'Two Sum',
          platform: 'leetcode',
          difficulty: 'easy',
          topics: ['arrays', 'hash-table'],
          url: 'https://leetcode.com/problems/two-sum/',
          status: 'solved',
          acceptanceRate: 47.5
        },
        {
          _id: '2',
          title: 'Valid Parentheses',
          platform: 'leetcode',
          difficulty: 'easy',
          topics: ['stack', 'string'],
          url: 'https://leetcode.com/problems/valid-parentheses/',
          status: 'attempted',
          acceptanceRate: 40.2
        },
        {
          _id: '3',
          title: 'Merge Two Sorted Lists',
          platform: 'leetcode',
          difficulty: 'easy',
          topics: ['linked-list', 'recursion'],
          url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
          status: 'unsolved',
          acceptanceRate: 58.3
        },
        {
          _id: '4',
          title: 'Maximum Subarray',
          platform: 'leetcode',
          difficulty: 'medium',
          topics: ['array', 'divide-and-conquer', 'dynamic-programming'],
          url: 'https://leetcode.com/problems/maximum-subarray/',
          status: 'solved',
          acceptanceRate: 49.1
        },
        {
          _id: '5',
          title: 'Binary Tree Level Order Traversal',
          platform: 'leetcode',
          difficulty: 'medium',
          topics: ['tree', 'breadth-first-search', 'binary-tree'],
          url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
          status: 'unsolved',
          acceptanceRate: 60.8
        },
        {
          _id: '6',
          title: 'Trapping Rain Water',
          platform: 'leetcode',
          difficulty: 'hard',
          topics: ['array', 'two-pointers', 'dynamic-programming', 'stack'],
          url: 'https://leetcode.com/problems/trapping-rain-water/',
          status: 'attempted',
          acceptanceRate: 55.3
        },
        {
          _id: '7',
          title: 'Watermelon',
          platform: 'codeforces',
          difficulty: 'easy',
          topics: ['math', 'brute-force'],
          url: 'https://codeforces.com/problemset/problem/4/A',
          status: 'solved',
          acceptanceRate: 62.4
        },
        {
          _id: '8',
          title: 'Theatre Square',
          platform: 'codeforces',
          difficulty: 'medium',
          topics: ['math'],
          url: 'https://codeforces.com/problemset/problem/1/A',
          status: 'unsolved',
          acceptanceRate: 41.7
        }
      ];
      
      setProblems(mockProblems);
      setError(null);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTopicFilter = (topic) => {
    setFilters(prev => {
      const updatedTopics = prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic];
      return { ...prev, topics: updatedTopics };
    });
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredProblems = problems
    .filter(problem => {
      // Search filter
      if (searchTerm && !problem.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Difficulty filter
      if (filters.difficulty && problem.difficulty !== filters.difficulty) {
        return false;
      }
      
      // Platform filter
      if (filters.platform && problem.platform !== filters.platform) {
        return false;
      }
      
      // Status filter
      if (filters.status && problem.status !== filters.status) {
        return false;
      }
      
      // Topics filter
      if (filters.topics.length > 0 && !filters.topics.some(topic => problem.topics.includes(topic))) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        return sortOrder === 'asc'
          ? difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          : difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
      } else if (sortBy === 'acceptanceRate') {
        return sortOrder === 'asc'
          ? a.acceptanceRate - b.acceptanceRate
          : b.acceptanceRate - a.acceptanceRate;
      }
      return 0;
    });

  // Get unique topics from all problems
  const allTopics = [...new Set(problems.flatMap(problem => problem.topics))];
  
  // Get unique platforms
  const platforms = [...new Set(problems.map(problem => problem.platform))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Coding Problems</h1>
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.open('https://leetcode.com', '_blank')}
        >
          Explore More Problems
        </button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search problems by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="title">Sort by Title</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="acceptanceRate">Sort by Acceptance Rate</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                Platform
              </label>
              <select
                id="platform"
                name="platform"
                value={filters.platform}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="solved">Solved</option>
                <option value="attempted">Attempted</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {allTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleTopicFilter(topic)}
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                      filters.topics.includes(topic)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Problems List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading problems...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No problems match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('title')}
                  >
                    Title
                    {sortBy === 'title' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('difficulty')}
                  >
                    Difficulty
                    {sortBy === 'difficulty' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('acceptanceRate')}
                  >
                    Acceptance
                    {sortBy === 'acceptanceRate' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topics
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProblems.map((problem) => (
                  <tr key={problem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        problem.status === 'solved' 
                          ? 'bg-green-100 text-green-800' 
                          : problem.status === 'attempted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        <Link to={`/problems/${problem._id}`}>
                          {problem.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{problem.platform}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        problem.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800' 
                          : problem.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{problem.acceptanceRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {problem.topics.slice(0, 2).map(topic => (
                          <span 
                            key={topic} 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {topic}
                          </span>
                        ))}
                        {problem.topics.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{problem.topics.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={problem.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Solve
                      </a>
                      <Link 
                        to={`/problems/${problem._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Problem Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Problem Difficulty</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-green-700">Easy</span>
                <span className="text-sm font-medium text-gray-500">
                  {problems.filter(p => p.difficulty === 'easy').length} problems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(problems.filter(p => p.difficulty === 'easy').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-yellow-700">Medium</span>
                <span className="text-sm font-medium text-gray-500">
                  {problems.filter(p => p.difficulty === 'medium').length} problems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${(problems.filter(p => p.difficulty === 'medium').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-red-700">Hard</span>
                <span className="text-sm font-medium text-gray-500">
                  {problems.filter(p => p.difficulty === 'hard').length} problems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${(problems.filter(p => p.difficulty === 'hard').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-green-700">Solved</span>
                <span className="text-sm font-medium text-gray-500">
                  {problems.filter(p => p.status === 'solved').length} problems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(problems.filter(p => p.status === 'solved').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-yellow-700">Attempted</span>
                <span className="text-sm font-medium text-gray-500">
                  {problems.filter(p => p.status === 'attempted').length} problems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${(problems.filter(p => p.status === 'attempted').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Unsolved</span>
                <span className="text-sm font-medium text-gray-500">
                  {problems.filter(p => p.status === 'unsolved').length} problems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gray-500 h-2.5 rounded-full" 
                  style={{ width: `${(problems.filter(p => p.status === 'unsolved').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Topics</h3>
          <div className="flex flex-wrap gap-2">
            {allTopics
              .map(topic => ({
                name: topic,
                count: problems.filter(p => p.topics.includes(topic)).length
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map(topic => (
                <button
                  key={topic.name}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, topics: [topic.name] }));
                    setShowFilters(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                >
                  {topic.name}
                  <span className="ml-1.5 bg-indigo-200 text-indigo-800 py-0.5 px-1.5 rounded-full text-xs">
                    {topic.count}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;