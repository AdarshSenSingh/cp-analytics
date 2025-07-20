import React, { useEffect, useState } from 'react';

export const CSES_PROBLEMS = [
  {
    topic: 'Introductory Problems',
    problems: [
      { id: 'cses-1068', title: 'Weird Algorithm', url: 'https://cses.fi/problemset/task/1068/' },
      { id: 'cses-1083', title: 'Missing Number', url: 'https://cses.fi/problemset/task/1083/' },
      { id: 'cses-1069', title: 'Repetitions', url: 'https://cses.fi/problemset/task/1069/' },
      { id: 'cses-1094', title: 'Increasing Array', url: 'https://cses.fi/problemset/task/1094/' },
      { id: 'cses-1070', title: 'Permutations', url: 'https://cses.fi/problemset/task/1070/' },
      { id: 'cses-1071', title: 'Number Spiral', url: 'https://cses.fi/problemset/task/1071/' },
      { id: 'cses-1072', title: 'Two Knights', url: 'https://cses.fi/problemset/task/1072/' },
      { id: 'cses-1092', title: 'Two Sets', url: 'https://cses.fi/problemset/task/1092/' },
      { id: 'cses-1617', title: 'Bit Strings', url: 'https://cses.fi/problemset/task/1617/' },
      { id: 'cses-1618', title: 'Trailing Zeros', url: 'https://cses.fi/problemset/task/1618/' },
      { id: 'cses-1754', title: 'Coin Piles', url: 'https://cses.fi/problemset/task/1754/' },
      { id: 'cses-1755', title: 'Palindrome Reorder', url: 'https://cses.fi/problemset/task/1755/' },
      { id: 'cses-2205', title: 'Gray Code', url: 'https://cses.fi/problemset/task/2205/' },
      { id: 'cses-2165', title: 'Tower of Hanoi', url: 'https://cses.fi/problemset/task/2165/' },
      { id: 'cses-1622', title: 'Creating Strings', url: 'https://cses.fi/problemset/task/1622/' },
      { id: 'cses-1623', title: 'Apple Division', url: 'https://cses.fi/problemset/task/1623/' },
      { id: 'cses-1624', title: 'Chessboard and Queens', url: 'https://cses.fi/problemset/task/1624/' },
      { id: 'cses-2431', title: 'Digit Queries', url: 'https://cses.fi/problemset/task/2431/' },
    ]
  },
  {
    topic: 'Sorting and Searching',
    problems: [
      { id: 'cses-1621', title: 'Distinct Numbers', url: 'https://cses.fi/problemset/task/1621/' },
      { id: 'cses-1084', title: 'Apartments', url: 'https://cses.fi/problemset/task/1084/' },
      { id: 'cses-1090', title: 'Ferris Wheel', url: 'https://cses.fi/problemset/task/1090/' },
      { id: 'cses-1091', title: 'Concert Tickets', url: 'https://cses.fi/problemset/task/1091/' },
      { id: 'cses-1619', title: 'Restaurant Customers', url: 'https://cses.fi/problemset/task/1619/' },
      { id: 'cses-1629', title: 'Movie Festival', url: 'https://cses.fi/problemset/task/1629/' },
      { id: 'cses-1640', title: 'Sum of Two Values', url: 'https://cses.fi/problemset/task/1640/' },
      { id: 'cses-1643', title: 'Maximum Subarray Sum', url: 'https://cses.fi/problemset/task/1643/' },
      { id: 'cses-1074', title: 'Stick Lengths', url: 'https://cses.fi/problemset/task/1074/' },
      { id: 'cses-2183', title: 'Missing Coin Sum', url: 'https://cses.fi/problemset/task/2183/' },
      { id: 'cses-2216', title: 'Collecting Numbers', url: 'https://cses.fi/problemset/task/2216/' },
      { id: 'cses-2217', title: 'Collecting Numbers II', url: 'https://cses.fi/problemset/task/2217/' },
      { id: 'cses-1141', title: 'Playlist', url: 'https://cses.fi/problemset/task/1141/' },
      { id: 'cses-1073', title: 'Towers', url: 'https://cses.fi/problemset/task/1073/' },
      { id: 'cses-1163', title: 'Traffic Lights', url: 'https://cses.fi/problemset/task/1163/' },
      { id: 'cses-1085', title: 'Array Division', url: 'https://cses.fi/problemset/task/1085/' },
      { id: 'cses-1632', title: 'Movie Festival II', url: 'https://cses.fi/problemset/task/1632/' },
      { id: 'cses-1644', title: 'Maximum Subarray Sum II', url: 'https://cses.fi/problemset/task/1644/' },
    ]
  },
  {
    topic: 'Dynamic Programming',
    problems: [
      { id: 'cses-1633', title: 'Dice Combinations', url: 'https://cses.fi/problemset/task/1633/' },
      { id: 'cses-1634', title: 'Minimizing Coins', url: 'https://cses.fi/problemset/task/1634/' },
      { id: 'cses-1635', title: 'Coin Combinations I', url: 'https://cses.fi/problemset/task/1635/' },
      { id: 'cses-1636', title: 'Coin Combinations II', url: 'https://cses.fi/problemset/task/1636/' },
      { id: 'cses-1637', title: 'Removing Digits', url: 'https://cses.fi/problemset/task/1637/' },
      { id: 'cses-1638', title: 'Grid Paths', url: 'https://cses.fi/problemset/task/1638/' },
      { id: 'cses-1158', title: 'Book Shop', url: 'https://cses.fi/problemset/task/1158/' },
      { id: 'cses-1746', title: 'Array Description', url: 'https://cses.fi/problemset/task/1746/' },
      { id: 'cses-2413', title: 'Counting Towers', url: 'https://cses.fi/problemset/task/2413/' },
      { id: 'cses-1639', title: 'Edit Distance', url: 'https://cses.fi/problemset/task/1639/' },
      { id: 'cses-1744', title: 'Rectangle Cutting', url: 'https://cses.fi/problemset/task/1744/' },
      { id: 'cses-1745', title: 'Money Sums', url: 'https://cses.fi/problemset/task/1745/' },
      { id: 'cses-1097', title: 'Removal Game', url: 'https://cses.fi/problemset/task/1097/' },
      { id: 'cses-1093', title: 'Two Sets II', url: 'https://cses.fi/problemset/task/1093/' },
      { id: 'cses-1145', title: 'Increasing Subsequence', url: 'https://cses.fi/problemset/task/1145/' },
      { id: 'cses-1140', title: 'Projects', url: 'https://cses.fi/problemset/task/1140/' },
      { id: 'cses-1653', title: 'Elevator Rides', url: 'https://cses.fi/problemset/task/1653/' },
      { id: 'cses-2181', title: 'Counting Tilings', url: 'https://cses.fi/problemset/task/2181/' },
      { id: 'cses-2220', title: 'Counting Numbers', url: 'https://cses.fi/problemset/task/2220/' },
    ]
  },
  {
    topic: 'Graph Algorithms',
    problems: [
      { id: 'cses-1192', title: 'Counting Rooms', url: 'https://cses.fi/problemset/task/1192/' },
      { id: 'cses-1193', title: 'Labyrinth', url: 'https://cses.fi/problemset/task/1193/' },
      { id: 'cses-1666', title: 'Building Roads', url: 'https://cses.fi/problemset/task/1666/' },
      { id: 'cses-1667', title: 'Message Route', url: 'https://cses.fi/problemset/task/1667/' },
      { id: 'cses-1668', title: 'Building Teams', url: 'https://cses.fi/problemset/task/1668/' },
      { id: 'cses-1669', title: 'Round Trip', url: 'https://cses.fi/problemset/task/1669/' },
      { id: 'cses-1194', title: 'Monsters', url: 'https://cses.fi/problemset/task/1194/' },
      { id: 'cses-1671', title: 'Shortest Routes I', url: 'https://cses.fi/problemset/task/1671/' },
      { id: 'cses-1672', title: 'Shortest Routes II', url: 'https://cses.fi/problemset/task/1672/' },
      { id: 'cses-1673', title: 'High Score', url: 'https://cses.fi/problemset/task/1673/' },
      { id: 'cses-1195', title: 'Flight Discount', url: 'https://cses.fi/problemset/task/1195/' },
      { id: 'cses-1197', title: 'Cycle Finding', url: 'https://cses.fi/problemset/task/1197/' },
      { id: 'cses-1196', title: 'Flight Routes', url: 'https://cses.fi/problemset/task/1196/' },
      { id: 'cses-1678', title: 'Round Trip II', url: 'https://cses.fi/problemset/task/1678/' },
      { id: 'cses-1679', title: 'Course Schedule', url: 'https://cses.fi/problemset/task/1679/' },
      { id: 'cses-1680', title: 'Longest Flight Route', url: 'https://cses.fi/problemset/task/1680/' },
      { id: 'cses-1681', title: 'Game Routes', url: 'https://cses.fi/problemset/task/1681/' },
      { id: 'cses-1202', title: 'Investigation', url: 'https://cses.fi/problemset/task/1202/' },
      { id: 'cses-1750', title: 'Planets Queries I', url: 'https://cses.fi/problemset/task/1750/' },
      { id: 'cses-1160', title: 'Planets Queries II', url: 'https://cses.fi/problemset/task/1160/' },
      { id: 'cses-1751', title: 'Planets Cycles', url: 'https://cses.fi/problemset/task/1751/' },
      { id: 'cses-1675', title: 'Road Reparation', url: 'https://cses.fi/problemset/task/1675/' },
      { id: 'cses-1676', title: 'Road Construction', url: 'https://cses.fi/problemset/task/1676/' },
      { id: 'cses-1683', title: 'Planets and Kingdoms', url: 'https://cses.fi/problemset/task/1683/' },
      { id: 'cses-1684', title: 'Giant Pizza', url: 'https://cses.fi/problemset/task/1684/' },
      { id: 'cses-1685', title: 'Coin Collector', url: 'https://cses.fi/problemset/task/1685/' },
      { id: 'cses-1686', title: 'Mail Delivery', url: 'https://cses.fi/problemset/task/1686/' },
      { id: 'cses-1692', title: 'De Bruijn Sequence', url: 'https://cses.fi/problemset/task/1692/' },
      { id: 'cses-1693', title: 'Teleporters Path', url: 'https://cses.fi/problemset/task/1693/' },
      { id: 'cses-1694', title: 'Hamiltonian Flights', url: 'https://cses.fi/problemset/task/1694/' },
      { id: 'cses-1689', title: "Knight's Tour", url: 'https://cses.fi/problemset/task/1689/' },
      { id: 'cses-1690', title: 'Download Speed', url: 'https://cses.fi/problemset/task/1690/' },
      { id: 'cses-1691', title: 'Police Chase', url: 'https://cses.fi/problemset/task/1691/' },
      { id: 'cses-1695', title: 'School Dance', url: 'https://cses.fi/problemset/task/1695/' },
      { id: 'cses-1711', title: 'Distinct Routes', url: 'https://cses.fi/problemset/task/1711/' },
    ]
  },
  {
    topic: 'Range Queries',
    problems: [
      { id: 'cses-1646', title: 'Static Range Sum Queries', url: 'https://cses.fi/problemset/task/1646/' },
      { id: 'cses-1647', title: 'Static Range Minimum Queries', url: 'https://cses.fi/problemset/task/1647/' },
      { id: 'cses-1648', title: 'Dynamic Range Sum Queries', url: 'https://cses.fi/problemset/task/1648/' },
      { id: 'cses-1649', title: 'Dynamic Range Minimum Queries', url: 'https://cses.fi/problemset/task/1649/' },
      { id: 'cses-1650', title: 'Range Xor Queries', url: 'https://cses.fi/problemset/task/1650/' },
      { id: 'cses-1651', title: 'Forest Queries', url: 'https://cses.fi/problemset/task/1651/' },
      { id: 'cses-1652', title: 'Range Update Queries', url: 'https://cses.fi/problemset/task/1652/' },
      { id: 'cses-1143', title: 'Hotel Queries', url: 'https://cses.fi/problemset/task/1143/' },
      { id: 'cses-1749', title: 'List Removals', url: 'https://cses.fi/problemset/task/1749/' },
      { id: 'cses-1144', title: 'Salary Queries', url: 'https://cses.fi/problemset/task/1144/' },
      { id: 'cses-2166', title: 'Prefix Sum Queries', url: 'https://cses.fi/problemset/task/2166/' },
      { id: 'cses-2206', title: 'Pizzeria Queries', url: 'https://cses.fi/problemset/task/2206/' },
      { id: 'cses-1734', title: 'Distinct Values Queries', url: 'https://cses.fi/problemset/task/1734/' },
      { id: 'cses-1739', title: 'Forest Queries II', url: 'https://cses.fi/problemset/task/1739/' },
      { id: 'cses-1735', title: 'Range Updates and Sums', url: 'https://cses.fi/problemset/task/1735/' },
      { id: 'cses-1736', title: 'Polynomial Queries', url: 'https://cses.fi/problemset/task/1736/' },
      { id: 'cses-1737', title: 'Range Queries and Copies', url: 'https://cses.fi/problemset/task/1737/' },
    ]
  },
  {
    topic: 'Tree Algorithms',
    problems: [
      { id: 'cses-1674', title: 'Subordinates', url: 'https://cses.fi/problemset/task/1674/' },
      { id: 'cses-1130', title: 'Tree Matching', url: 'https://cses.fi/problemset/task/1130/' },
      { id: 'cses-1131', title: 'Tree Diameter', url: 'https://cses.fi/problemset/task/1131/' },
      { id: 'cses-1132', title: 'Tree Distances I', url: 'https://cses.fi/problemset/task/1132/' },
      { id: 'cses-1133', title: 'Tree Distances II', url: 'https://cses.fi/problemset/task/1133/' },
      { id: 'cses-1687', title: 'Company Queries I', url: 'https://cses.fi/problemset/task/1687/' },
      { id: 'cses-1688', title: 'Company Queries II', url: 'https://cses.fi/problemset/task/1688/' },
      { id: 'cses-1135', title: 'Distance Queries', url: 'https://cses.fi/problemset/task/1135/' },
      { id: 'cses-1136', title: 'Counting Paths', url: 'https://cses.fi/problemset/task/1136/' },
      { id: 'cses-1137', title: 'Subtree Queries', url: 'https://cses.fi/problemset/task/1137/' },
      { id: 'cses-1138', title: 'Path Queries', url: 'https://cses.fi/problemset/task/1138/' },
      { id: 'cses-1139', title: 'Path Queries II', url: 'https://cses.fi/problemset/task/1139/' },
      { id: 'cses-1134', title: 'Distinct Colors', url: 'https://cses.fi/problemset/task/1134/' },
      { id: 'cses-2079', title: 'Finding a Centroid', url: 'https://cses.fi/problemset/task/2079/' },
      { id: 'cses-2080', title: 'Fixed-Length Paths I', url: 'https://cses.fi/problemset/task/2080/' },
      { id: 'cses-2081', title: 'Fixed-Length Paths II', url: 'https://cses.fi/problemset/task/2081/' },
    ]
  },
  {
    topic: 'Mathematics',
    problems: [
      { id: 'cses-2164', title: 'Josephus Queries', url: 'https://cses.fi/problemset/task/2164/' },
      { id: 'cses-1095', title: 'Exponentiation', url: 'https://cses.fi/problemset/task/1095/' },
      { id: 'cses-1712', title: 'Exponentiation II', url: 'https://cses.fi/problemset/task/1712/' },
      { id: 'cses-1713', title: 'Counting Divisors', url: 'https://cses.fi/problemset/task/1713/' },
      { id: 'cses-1081', title: 'Common Divisors', url: 'https://cses.fi/problemset/task/1081/' },
      { id: 'cses-1082', title: 'Sum of Divisors', url: 'https://cses.fi/problemset/task/1082/' },
      { id: 'cses-2182', title: 'Divisor Analysis', url: 'https://cses.fi/problemset/task/2182/' },
      { id: 'cses-2185', title: 'Prime Multiples', url: 'https://cses.fi/problemset/task/2185/' },
      { id: 'cses-2417', title: 'Counting Coprime Pairs', url: 'https://cses.fi/problemset/task/2417/' },
      { id: 'cses-3396', title: 'Next Prime', url: 'https://cses.fi/problemset/task/3396/' },
      { id: 'cses-1079', title: 'Binomial Coefficients', url: 'https://cses.fi/problemset/task/1079/' },
      { id: 'cses-1715', title: 'Creating Strings II', url: 'https://cses.fi/problemset/task/1715/' },
      { id: 'cses-1716', title: 'Distributing Apples', url: 'https://cses.fi/problemset/task/1716/' },
      { id: 'cses-1717', title: 'Christmas Party', url: 'https://cses.fi/problemset/task/1717/' },
      { id: 'cses-2064', title: 'Bracket Sequences I', url: 'https://cses.fi/problemset/task/2064/' },
      { id: 'cses-2187', title: 'Bracket Sequences II', url: 'https://cses.fi/problemset/task/2187/' },
      { id: 'cses-2209', title: 'Counting Necklaces', url: 'https://cses.fi/problemset/task/2209/' },
      { id: 'cses-2210', title: 'Counting Grids', url: 'https://cses.fi/problemset/task/2210/' },
      { id: 'cses-1722', title: 'Fibonacci Numbers', url: 'https://cses.fi/problemset/task/1722/' },
      { id: 'cses-1096', title: 'Throwing Dice', url: 'https://cses.fi/problemset/task/1096/' },
      { id: 'cses-1723', title: 'Graph Paths I', url: 'https://cses.fi/problemset/task/1723/' },
      { id: 'cses-1724', title: 'Graph Paths II', url: 'https://cses.fi/problemset/task/1724/' },
      { id: 'cses-3154', title: 'System of Linear Equations', url: 'https://cses.fi/problemset/task/3154/' },
      { id: 'cses-3355', title: 'Sum of Four Squares', url: 'https://cses.fi/problemset/task/3355/' },
      { id: 'cses-3406', title: 'Triangle Number Sums', url: 'https://cses.fi/problemset/task/3406/' },
      { id: 'cses-1725', title: 'Dice Probability', url: 'https://cses.fi/problemset/task/1725/' },
      { id: 'cses-1726', title: 'Moving Robots', url: 'https://cses.fi/problemset/task/1726/' },
      { id: 'cses-1727', title: 'Candy Lottery', url: 'https://cses.fi/problemset/task/1727/' },
      { id: 'cses-1728', title: 'Inversion Probability', url: 'https://cses.fi/problemset/task/1728/' },
      { id: 'cses-1729', title: 'Stick Game', url: 'https://cses.fi/problemset/task/1729/' },
      { id: 'cses-1730', title: 'Nim Game I', url: 'https://cses.fi/problemset/task/1730/' },
      { id: 'cses-1098', title: 'Nim Game II', url: 'https://cses.fi/problemset/task/1098/' },
      { id: 'cses-1099', title: 'Stair Game', url: 'https://cses.fi/problemset/task/1099/' },
      { id: 'cses-2207', title: 'Grundy s Game', url: 'https://cses.fi/problemset/task/2207/' },
      { id: 'cses-2208', title: 'Another Game', url: 'https://cses.fi/problemset/task/2208/' },
    ]
  },
  {
    topic: 'String Algorithms',
    problems: [
      { id: 'cses-1731', title: 'Word Combinations', url: 'https://cses.fi/problemset/task/1731/' },
      { id: 'cses-1753', title: 'String Matching', url: 'https://cses.fi/problemset/task/1753/' },
      { id: 'cses-1732', title: 'Finding Borders', url: 'https://cses.fi/problemset/task/1732/' },
      { id: 'cses-1733', title: 'Finding Periods', url: 'https://cses.fi/problemset/task/1733/' },
      { id: 'cses-1110', title: 'Minimal Rotation', url: 'https://cses.fi/problemset/task/1110/' },
      { id: 'cses-1111', title: 'Longest Palindrome', url: 'https://cses.fi/problemset/task/1111/' },
      { id: 'cses-3138', title: 'All Palindromes', url: 'https://cses.fi/problemset/task/3138/' },
      { id: 'cses-1112', title: 'Required Substring', url: 'https://cses.fi/problemset/task/1112/' },
      { id: 'cses-2420', title: 'Palindrome Queries', url: 'https://cses.fi/problemset/task/2420/' },
      { id: 'cses-2102', title: 'Finding Patterns', url: 'https://cses.fi/problemset/task/2102/' },
      { id: 'cses-2103', title: 'Counting Patterns', url: 'https://cses.fi/problemset/task/2103/' },
      { id: 'cses-2104', title: 'Pattern Positions', url: 'https://cses.fi/problemset/task/2104/' },
      { id: 'cses-2105', title: 'Distinct Substrings', url: 'https://cses.fi/problemset/task/2105/' },
      { id: 'cses-1149', title: 'Distinct Subsequences', url: 'https://cses.fi/problemset/task/1149/' },
      { id: 'cses-2106', title: 'Repeating Substring', url: 'https://cses.fi/problemset/task/2106/' },
      { id: 'cses-2107', title: 'String Functions', url: 'https://cses.fi/problemset/task/2107/' },
      { id: 'cses-3225', title: 'Inverse Suffix Array', url: 'https://cses.fi/problemset/task/3225/' },
      { id: 'cses-1113', title: 'String Transform', url: 'https://cses.fi/problemset/task/1113/' },
      { id: 'cses-2108', title: 'Substring Order I', url: 'https://cses.fi/problemset/task/2108/' },
      { id: 'cses-2109', title: 'Substring Order II', url: 'https://cses.fi/problemset/task/2109/' },
      { id: 'cses-2110', title: 'Substring Distribution', url: 'https://cses.fi/problemset/task/2110/' },
    ]
  },
  {
    topic: 'Geometry',
    problems: [
      { id: 'cses-2189', title: 'Point Location Test', url: 'https://cses.fi/problemset/task/2189/' },
      { id: 'cses-2190', title: 'Line Segment Intersection', url: 'https://cses.fi/problemset/task/2190/' },
      { id: 'cses-2191', title: 'Polygon Area', url: 'https://cses.fi/problemset/task/2191/' },
      { id: 'cses-2192', title: 'Point in Polygon', url: 'https://cses.fi/problemset/task/2192/' },
      { id: 'cses-2193', title: 'Polygon Lattice Points', url: 'https://cses.fi/problemset/task/2193/' },
      { id: 'cses-2194', title: 'Minimum Euclidean Distance', url: 'https://cses.fi/problemset/task/2194/' },
      { id: 'cses-2195', title: 'Convex Hull', url: 'https://cses.fi/problemset/task/2195/' },
      { id: 'cses-3410', title: 'Maximum Manhattan Distances', url: 'https://cses.fi/problemset/task/3410/' },
      { id: 'cses-3411', title: 'All Manhattan Distances', url: 'https://cses.fi/problemset/task/3411/' },
      { id: 'cses-1740', title: 'Intersection Points', url: 'https://cses.fi/problemset/task/1740/' },
      { id: 'cses-3427', title: 'Line Segments Trace I', url: 'https://cses.fi/problemset/task/3427/' },
      { id: 'cses-3428', title: 'Line Segments Trace II', url: 'https://cses.fi/problemset/task/3428/' },
      { id: 'cses-3429', title: 'Lines and Queries I', url: 'https://cses.fi/problemset/task/3429/' },
      { id: 'cses-3430', title: 'Lines and Queries II', url: 'https://cses.fi/problemset/task/3430/' },
      { id: 'cses-1741', title: 'Area of Rectangles', url: 'https://cses.fi/problemset/task/1741/' },
      { id: 'cses-1742', title: 'Robot Path', url: 'https://cses.fi/problemset/task/1742/' },
    ]
  },
  {
    topic: 'Sliding Window Problems',
    problems: [
      { id: 'cses-3220', title: 'Sliding Window Sum', url: 'https://cses.fi/problemset/task/3220/' },
      { id: 'cses-3221', title: 'Sliding Window Minimum', url: 'https://cses.fi/problemset/task/3221/' },
      { id: 'cses-3426', title: 'Sliding Window Xor', url: 'https://cses.fi/problemset/task/3426/' },
      { id: 'cses-3405', title: 'Sliding Window Or', url: 'https://cses.fi/problemset/task/3405/' },
      { id: 'cses-3222', title: 'Sliding Window Distinct Values', url: 'https://cses.fi/problemset/task/3222/' },
      { id: 'cses-3224', title: 'Sliding Window Mode', url: 'https://cses.fi/problemset/task/3224/' },
      { id: 'cses-3219', title: 'Sliding Window Mex', url: 'https://cses.fi/problemset/task/3219/' },
      { id: 'cses-1076', title: 'Sliding Window Median', url: 'https://cses.fi/problemset/task/1076/' },
      { id: 'cses-1077', title: 'Sliding Window Cost', url: 'https://cses.fi/problemset/task/1077/' },
      { id: 'cses-3223', title: 'Sliding Window Inversions', url: 'https://cses.fi/problemset/task/3223/' },
      { id: 'cses-3227', title: 'Sliding Window Advertisement', url: 'https://cses.fi/problemset/task/3227/' },
    ]
  },
  {
    topic: 'Interactive Problems',
    problems: [
      { id: 'cses-3112', title: 'Hidden Integer', url: 'https://cses.fi/problemset/task/3112/' },
      { id: 'cses-3139', title: 'Hidden Permutation', url: 'https://cses.fi/problemset/task/3139/' },
      { id: 'cses-3305', title: 'K-th Highest Score', url: 'https://cses.fi/problemset/task/3305/' },
      { id: 'cses-3228', title: 'Permuted Binary Strings', url: 'https://cses.fi/problemset/task/3228/' },
      { id: 'cses-3273', title: 'Colored Chairs', url: 'https://cses.fi/problemset/task/3273/' },
      { id: 'cses-3140', title: 'Inversion Sorting', url: 'https://cses.fi/problemset/task/3140/' },
    ]
  },
  {
    topic: 'Bitwise Operations',
    problems: [
      { id: 'cses-1146', title: 'Counting Bits', url: 'https://cses.fi/problemset/task/1146/' },
      { id: 'cses-1655', title: 'Maximum Xor Subarray', url: 'https://cses.fi/problemset/task/1655/' },
      { id: 'cses-3191', title: 'Maximum Xor Subset', url: 'https://cses.fi/problemset/task/3191/' },
      { id: 'cses-3211', title: 'Number of Subset Xors', url: 'https://cses.fi/problemset/task/3211/' },
      { id: 'cses-3192', title: 'K Subset Xors', url: 'https://cses.fi/problemset/task/3192/' },
      { id: 'cses-3233', title: 'All Subarray Xors', url: 'https://cses.fi/problemset/task/3233/' },
      { id: 'cses-2419', title: 'Xor Pyramid Peak', url: 'https://cses.fi/problemset/task/2419/' },
      { id: 'cses-3194', title: 'Xor Pyramid Diagonal', url: 'https://cses.fi/problemset/task/3194/' },
      { id: 'cses-3195', title: 'Xor Pyramid Row', url: 'https://cses.fi/problemset/task/3195/' },
      { id: 'cses-1654', title: 'SOS Bit Problem', url: 'https://cses.fi/problemset/task/1654/' },
      { id: 'cses-3141', title: 'And Subset Count', url: 'https://cses.fi/problemset/task/3141/' },
    ]
  },
  {
    topic: 'Construction Problems',
    problems: [
      { id: 'cses-2214', title: 'Inverse Inversions', url: 'https://cses.fi/problemset/task/2214/' },
      { id: 'cses-2215', title: 'Monotone Subsequences', url: 'https://cses.fi/problemset/task/2215/' },
      { id: 'cses-3422', title: 'Third Permutation', url: 'https://cses.fi/problemset/task/3422/' },
      { id: 'cses-3423', title: 'Permutation Prime Sums', url: 'https://cses.fi/problemset/task/3423/' },
      { id: 'cses-1697', title: 'Chess Tournament', url: 'https://cses.fi/problemset/task/1697/' },
      { id: 'cses-3424', title: 'Distinct Sums Grid', url: 'https://cses.fi/problemset/task/3424/' },
      { id: 'cses-2423', title: 'Filling Trominos', url: 'https://cses.fi/problemset/task/2423/' },
      { id: 'cses-2418', title: 'Grid Path Construction', url: 'https://cses.fi/problemset/task/2418/' },
    ]
  },
  {
    topic: 'Advanced Graph Problems',
    problems: [
      { id: 'cses-3303', title: 'Nearest Shops', url: 'https://cses.fi/problemset/task/3303/' },
      { id: 'cses-1134', title: 'Prüfer Code', url: 'https://cses.fi/problemset/task/1134/' },
      { id: 'cses-1702', title: 'Tree Traversals', url: 'https://cses.fi/problemset/task/1702/' },
      { id: 'cses-1757', title: 'Course Schedule II', url: 'https://cses.fi/problemset/task/1757/' },
      { id: 'cses-1756', title: 'Acyclic Graph Edges', url: 'https://cses.fi/problemset/task/1756/' },
      { id: 'cses-2177', title: 'Strongly Connected Edges', url: 'https://cses.fi/problemset/task/2177/' },
      { id: 'cses-2179', title: 'Even Outdegree Edges', url: 'https://cses.fi/problemset/task/2179/' },
      { id: 'cses-1707', title: 'Graph Girth', url: 'https://cses.fi/problemset/task/1707/' },
      { id: 'cses-3357', title: 'Fixed Length Walk Queries', url: 'https://cses.fi/problemset/task/3357/' },
      { id: 'cses-3111', title: 'Transfer Speeds Sum', url: 'https://cses.fi/problemset/task/3111/' },
      { id: 'cses-3407', title: 'MST Edge Check', url: 'https://cses.fi/problemset/task/3407/' },
      { id: 'cses-3408', title: 'MST Edge Set Check', url: 'https://cses.fi/problemset/task/3408/' },
      { id: 'cses-3409', title: 'MST Edge Cost', url: 'https://cses.fi/problemset/task/3409/' },
      { id: 'cses-1677', title: 'Network Breakdown', url: 'https://cses.fi/problemset/task/1677/' },
      { id: 'cses-3114', title: 'Tree Coin Collecting I', url: 'https://cses.fi/problemset/task/3114/' },
      { id: 'cses-3149', title: 'Tree Coin Collecting II', url: 'https://cses.fi/problemset/task/3149/' },
      { id: 'cses-1700', title: 'Tree Isomorphism I', url: 'https://cses.fi/problemset/task/1700/' },
      { id: 'cses-1701', title: 'Tree Isomorphism II', url: 'https://cses.fi/problemset/task/1701/' },
      { id: 'cses-1699', title: 'Flight Route Requests', url: 'https://cses.fi/problemset/task/1699/' },
      { id: 'cses-1703', title: 'Critical Cities', url: 'https://cses.fi/problemset/task/1703/' },
      { id: 'cses-1203', title: 'Visiting Cities', url: 'https://cses.fi/problemset/task/1203/' },
      { id: 'cses-3308', title: 'Graph Coloring', url: 'https://cses.fi/problemset/task/3308/' },
      { id: 'cses-3158', title: 'Bus Companies', url: 'https://cses.fi/problemset/task/3158/' },
      { id: 'cses-3358', title: 'Split into Two Paths', url: 'https://cses.fi/problemset/task/3358/' },
      { id: 'cses-1704', title: 'Network Renovation', url: 'https://cses.fi/problemset/task/1704/' },
      { id: 'cses-1705', title: 'Forbidden Cities', url: 'https://cses.fi/problemset/task/1705/' },
      { id: 'cses-1752', title: 'Creating Offices', url: 'https://cses.fi/problemset/task/1752/' },
      { id: 'cses-1685', title: 'New Flight Routes', url: 'https://cses.fi/problemset/task/1685/' },
    ]
  },
  {
    topic: 'Counting Problems',
    problems: [
      { id: 'cses-3413', title: 'Filled Subgrid Count I', url: 'https://cses.fi/problemset/task/3413/' },
      { id: 'cses-3414', title: 'Filled Subgrid Count II', url: 'https://cses.fi/problemset/task/3414/' },
      { id: 'cses-3415', title: 'All Letter Subgrid Count I', url: 'https://cses.fi/problemset/task/3415/' },
      { id: 'cses-3416', title: 'All Letter Subgrid Count II', url: 'https://cses.fi/problemset/task/3416/' },
      { id: 'cses-3417', title: 'Border Subgrid Count I', url: 'https://cses.fi/problemset/task/3417/' },
      { id: 'cses-3418', title: 'Border Subgrid Count II', url: 'https://cses.fi/problemset/task/3418/' },
      { id: 'cses-3400', title: 'Raab Game II', url: 'https://cses.fi/problemset/task/3400/' },
      { id: 'cses-1080', title: 'Empty String', url: 'https://cses.fi/problemset/task/1080/' },
      { id: 'cses-2229', title: 'Permutation Inversions', url: 'https://cses.fi/problemset/task/2229/' },
      { id: 'cses-2176', title: 'Counting Bishops', url: 'https://cses.fi/problemset/task/2176/' },
      { id: 'cses-2228', title: 'Counting Sequences', url: 'https://cses.fi/problemset/task/2228/' },
      { id: 'cses-1078', title: 'Grid Paths II', url: 'https://cses.fi/problemset/task/1078/' },
      { id: 'cses-1075', title: 'Counting Permutations', url: 'https://cses.fi/problemset/task/1075/' },
      { id: 'cses-2429', title: 'Grid Completion', url: 'https://cses.fi/problemset/task/2429/' },
      { id: 'cses-2421', title: 'Counting Reorders', url: 'https://cses.fi/problemset/task/2421/' },
      { id: 'cses-3232', title: 'Tournament Graph Distribution', url: 'https://cses.fi/problemset/task/3232/' },
      { id: 'cses-3157', title: 'Collecting Numbers Distribution', url: 'https://cses.fi/problemset/task/3157/' },
      { id: 'cses-2415', title: 'Functional Graph Distribution', url: 'https://cses.fi/problemset/task/2415/' },
    ]
  },
  {
    topic: 'Additional Problems I',
    problems: [
      { id: 'cses-1087', title: 'Shortest Subsequence', url: 'https://cses.fi/problemset/task/1087/' },
      { id: 'cses-3150', title: 'Distinct Values Sum', url: 'https://cses.fi/problemset/task/3150/' },
      { id: 'cses-3190', title: 'Distinct Values Splits', url: 'https://cses.fi/problemset/task/3190/' },
      { id: 'cses-1670', title: 'Swap Game', url: 'https://cses.fi/problemset/task/1670/' },
      { id: 'cses-3175', title: 'Beautiful Permutation II', url: 'https://cses.fi/problemset/task/3175/' },
      { id: 'cses-2422', title: 'Multiplication Table', url: 'https://cses.fi/problemset/task/2422/' },
      { id: 'cses-3151', title: 'Bubble Sort Rounds I', url: 'https://cses.fi/problemset/task/3151/' },
      { id: 'cses-3152', title: 'Bubble Sort Rounds II', url: 'https://cses.fi/problemset/task/3152/' },
      { id: 'cses-3306', title: 'Nearest Campsites I', url: 'https://cses.fi/problemset/task/3306/' },
      { id: 'cses-3307', title: 'Nearest Campsites II', url: 'https://cses.fi/problemset/task/3307/' },
      { id: 'cses-1142', title: 'Advertisement', url: 'https://cses.fi/problemset/task/1142/' },
      { id: 'cses-2186', title: 'Special Substrings', url: 'https://cses.fi/problemset/task/2186/' },
      { id: 'cses-3169', title: 'Counting LCM Arrays', url: 'https://cses.fi/problemset/task/3169/' },
      { id: 'cses-3193', title: 'Square Subsets', url: 'https://cses.fi/problemset/task/3193/' },
      { id: 'cses-3294', title: 'Subarray Sum Constraints', url: 'https://cses.fi/problemset/task/3294/' },
      { id: 'cses-3213', title: 'Water Containers Moves', url: 'https://cses.fi/problemset/task/3213/' },
      { id: 'cses-3214', title: 'Water Containers Queries', url: 'https://cses.fi/problemset/task/3214/' },
      { id: 'cses-2425', title: 'Stack Weights', url: 'https://cses.fi/problemset/task/2425/' },
      { id: 'cses-3301', title: 'Maximum Average Subarrays', url: 'https://cses.fi/problemset/task/3301/' },
      { id: 'cses-3302', title: 'Subsets with Fixed Average', url: 'https://cses.fi/problemset/task/3302/' },
      { id: 'cses-3361', title: 'Two Array Average', url: 'https://cses.fi/problemset/task/3361/' },
      { id: 'cses-1747', title: 'Pyramid Array', url: 'https://cses.fi/problemset/task/1747/' },
      { id: 'cses-3404', title: 'Permutation Subsequence', url: 'https://cses.fi/problemset/task/3404/' },
      { id: 'cses-1188', title: 'Bit Inversions', url: 'https://cses.fi/problemset/task/1188/' },
      { id: 'cses-1086', title: 'Writing Numbers', url: 'https://cses.fi/problemset/task/1086/' },
      { id: 'cses-2427', title: 'Letter Pair Move Game', url: 'https://cses.fi/problemset/task/2427/' },
      { id: 'cses-1147', title: 'Maximum Building I', url: 'https://cses.fi/problemset/task/1147/' },
      { id: 'cses-1162', title: 'Sorting Methods', url: 'https://cses.fi/problemset/task/1162/' },
      { id: 'cses-1191', title: 'Cyclic Array', url: 'https://cses.fi/problemset/task/1191/' },
      { id: 'cses-2414', title: 'List of Sums', url: 'https://cses.fi/problemset/task/2414/' },
    ]
  },
  {
    topic: 'Additional Problems II',
    problems: [
      { id: 'cses-3215', title: 'Bouncing Ball Steps', url: 'https://cses.fi/problemset/task/3215/' },
      { id: 'cses-3216', title: 'Bouncing Ball Cycle', url: 'https://cses.fi/problemset/task/3216/' },
      { id: 'cses-3218', title: 'Knight Moves Queries', url: 'https://cses.fi/problemset/task/3218/' },
      { id: 'cses-3108', title: 'K Subset Sums I', url: 'https://cses.fi/problemset/task/3108/' },
      { id: 'cses-3109', title: 'K Subset Sums II', url: 'https://cses.fi/problemset/task/3109/' },
      { id: 'cses-2132', title: 'Increasing Array II', url: 'https://cses.fi/problemset/task/2132/' },
      { id: 'cses-1189', title: 'Food Division', url: 'https://cses.fi/problemset/task/1189/' },
      { id: 'cses-1698', title: 'Swap Round Sorting', url: 'https://cses.fi/problemset/task/1698/' },
      { id: 'cses-2430', title: 'Binary Subsequences', url: 'https://cses.fi/problemset/task/2430/' },
      { id: 'cses-1706', title: 'School Excursion', url: 'https://cses.fi/problemset/task/1706/' },
      { id: 'cses-1709', title: 'Coin Grid', url: 'https://cses.fi/problemset/task/1709/' },
      { id: 'cses-3312', title: 'Grid Coloring II', url: 'https://cses.fi/problemset/task/3312/' },
      { id: 'cses-2426', title: 'Programmers and Artists', url: 'https://cses.fi/problemset/task/2426/' },
      { id: 'cses-2174', title: 'Removing Digits II', url: 'https://cses.fi/problemset/task/2174/' },
      { id: 'cses-2180', title: 'Coin Arrangement', url: 'https://cses.fi/problemset/task/2180/' },
      { id: 'cses-3159', title: 'Replace with Difference', url: 'https://cses.fi/problemset/task/3159/' },
      { id: 'cses-2432', title: 'Grid Puzzle I', url: 'https://cses.fi/problemset/task/2432/' },
      { id: 'cses-2131', title: 'Grid Puzzle II', url: 'https://cses.fi/problemset/task/2131/' },
      { id: 'cses-2115', title: 'Bit Substrings', url: 'https://cses.fi/problemset/task/2115/' },
      { id: 'cses-2075', title: 'Reversal Sorting', url: 'https://cses.fi/problemset/task/2075/' },
      { id: 'cses-1159', title: 'Book Shop II', url: 'https://cses.fi/problemset/task/1159/' },
      { id: 'cses-3161', title: 'GCD Subsets', url: 'https://cses.fi/problemset/task/3161/' },
      { id: 'cses-3402', title: 'Minimum Cost Pairs', url: 'https://cses.fi/problemset/task/3402/' },
      { id: 'cses-3425', title: 'Same Sum Subsets', url: 'https://cses.fi/problemset/task/3425/' },
      { id: 'cses-1157', title: 'Mex Grid Queries', url: 'https://cses.fi/problemset/task/1157/' },
      { id: 'cses-1148', title: 'Maximum Building II', url: 'https://cses.fi/problemset/task/1148/' },
      { id: 'cses-1161', title: 'Stick Divisions', url: 'https://cses.fi/problemset/task/1161/' },
      { id: 'cses-3401', title: 'Stick Difference', url: 'https://cses.fi/problemset/task/3401/' },
      { id: 'cses-1665', title: 'Coding Company', url: 'https://cses.fi/problemset/task/1665/' },
      { id: 'cses-2402', title: 'Two Stacks Sorting', url: 'https://cses.fi/problemset/task/2402/' },
    ]
  },
  {
    topic: 'Advanced Techniques',
    problems: [
      { id: 'cses-1628', title: 'Meet in the Middle', url: 'https://cses.fi/problemset/task/1628/' },
      { id: 'cses-2136', title: 'Hamming Distance', url: 'https://cses.fi/problemset/task/2136/' },
      { id: 'cses-3360', title: 'Corner Subgrid Check', url: 'https://cses.fi/problemset/task/3360/' },
      { id: 'cses-2137', title: 'Corner Subgrid Count', url: 'https://cses.fi/problemset/task/2137/' },
      { id: 'cses-2138', title: 'Reachable Nodes', url: 'https://cses.fi/problemset/task/2138/' },
      { id: 'cses-2143', title: 'Reachability Queries', url: 'https://cses.fi/problemset/task/2143/' },
      { id: 'cses-2072', title: 'Cut and Paste', url: 'https://cses.fi/problemset/task/2072/' },
      { id: 'cses-2073', title: 'Substring Reversals', url: 'https://cses.fi/problemset/task/2073/' },
      { id: 'cses-2074', title: 'Reversals and Sums', url: 'https://cses.fi/problemset/task/2074/' },
      { id: 'cses-2076', title: 'Necessary Roads', url: 'https://cses.fi/problemset/task/2076/' },
      { id: 'cses-2077', title: 'Necessary Cities', url: 'https://cses.fi/problemset/task/2077/' },
      { id: 'cses-2078', title: 'Eulerian Subgraphs', url: 'https://cses.fi/problemset/task/2078/' },
      { id: 'cses-2084', title: 'Monster Game I', url: 'https://cses.fi/problemset/task/2084/' },
      { id: 'cses-2085', title: 'Monster Game II', url: 'https://cses.fi/problemset/task/2085/' },
      { id: 'cses-2086', title: 'Subarray Squares', url: 'https://cses.fi/problemset/task/2086/' },
      { id: 'cses-2087', title: 'Houses and Schools', url: 'https://cses.fi/problemset/task/2087/' },
      { id: 'cses-2088', title: 'Knuth Division', url: 'https://cses.fi/problemset/task/2088/' },
      { id: 'cses-2111', title: 'Apples and Bananas', url: 'https://cses.fi/problemset/task/2111/' },
      { id: 'cses-2112', title: 'One Bit Positions', url: 'https://cses.fi/problemset/task/2112/' },
      { id: 'cses-2113', title: 'Signal Processing', url: 'https://cses.fi/problemset/task/2113/' },
      { id: 'cses-2101', title: 'New Roads Queries', url: 'https://cses.fi/problemset/task/2101/' },
      { id: 'cses-2133', title: 'Dynamic Connectivity', url: 'https://cses.fi/problemset/task/2133/' },
      { id: 'cses-2121', title: 'Parcel Delivery', url: 'https://cses.fi/problemset/task/2121/' },
      { id: 'cses-2129', title: 'Task Assignment', url: 'https://cses.fi/problemset/task/2129/' },
      { id: 'cses-2130', title: 'Distinct Routes II', url: 'https://cses.fi/problemset/task/2130/' },
    ]
  },
];

const getSolved = () => {
  try {
    return JSON.parse(localStorage.getItem('csesSolved') || '{}');
  } catch {
    return {};
  }
};

const setSolved = (solved) => {
  localStorage.setItem('csesSolved', JSON.stringify(solved));
};

const CSESProblemset = () => {
  const [solved, setSolvedState] = useState(getSolved());

  useEffect(() => {
    setSolvedState(getSolved());
  }, []);

  const handleMarkSolved = (id) => {
    const updated = { ...solved, [id]: true };
    setSolved(updated);
    setSolvedState(updated);
  };

  // Overall stats
  const allProblems = CSES_PROBLEMS.flatMap(section => section.problems);
  const totalProblems = allProblems.length;
  const totalSolved = allProblems.filter(p => solved[p.id]).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-indigo-800 mb-2 text-center">CSES Problemset</h1>
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg px-6 py-2 text-lg font-semibold text-gray-800 shadow">
          Overall: <span className="text-green-700">{totalSolved}</span> / {totalProblems} solved
        </div>
      </div>
      {CSES_PROBLEMS.map(section => {
        const sectionSolved = section.problems.filter(p => solved[p.id]).length;
        const sectionTotal = section.problems.length;
        return (
          <div key={section.topic} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{section.topic}</h2>
              <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                {sectionSolved} / {sectionTotal} solved
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.problems.map(problem => (
                <div
                  key={problem.id}
                  className={`rounded-lg shadow flex flex-col items-start p-3 border transition-all duration-150 min-h-[110px] ${
                    solved[problem.id]
                      ? 'bg-green-100 border-green-400'
                      : 'bg-white border-gray-200 hover:shadow-lg'
                  }`}
                  style={{ minHeight: 110 }}
                >
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-700 text-base mb-1 hover:underline truncate w-full"
                    title={problem.title}
                  >
                    {problem.title}
                  </a>
                  <div className="flex-1" />
                  {solved[problem.id] ? (
                    <span className="mt-2 px-2 py-0.5 bg-green-600 text-white rounded text-xs font-medium">Solved</span>
                  ) : (
                    <button
                      className="mt-2 px-2 py-0.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                      onClick={() => handleMarkSolved(problem.id)}
                    >
                      Mark as Solved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CSESProblemset;
