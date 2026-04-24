export const EXAMS = [
  { id: 1, title: "Midterm – Algorithms", course: "CS301", date: "2025-04-22", duration: 90, status: "upcoming", questions: 40, submissions: 0 },
  { id: 2, title: "Final – Linear Algebra", course: "MATH201", date: "2025-04-18", duration: 120, status: "completed", questions: 50, submissions: 34 },
  { id: 3, title: "Quiz 3 – OS Concepts", course: "CS402", date: "2025-04-25", duration: 45, status: "upcoming", questions: 20, submissions: 0 },
  { id: 4, title: "Midterm – Data Structures", course: "CS201", date: "2025-04-10", duration: 60, status: "completed", questions: 30, submissions: 28 },
  { id: 5, title: "Quiz 1 – Databases", course: "CS350", date: "2025-04-28", duration: 30, status: "draft", questions: 15, submissions: 0 },
];

export const SUBMISSIONS = [
  { id: 1, student: "Lena Fischer", score: 87, total: 100, status: "completed", time: "78 min", submitted: "2025-04-18 10:32" },
  { id: 2, student: "Omar Khalil", score: 72, total: 100, status: "completed", time: "112 min", submitted: "2025-04-18 11:05" },
  { id: 3, student: "Sara Petit", score: 94, total: 100, status: "completed", time: "95 min", submitted: "2025-04-18 10:48" },
  { id: 4, student: "James Obi", score: 61, total: 100, status: "completed", time: "120 min", submitted: "2025-04-18 11:15" },
  { id: 5, student: "Amina Traoré", score: null, total: 100, status: "in_progress", time: "—", submitted: "—" },
  { id: 6, student: "Liu Wei", score: 88, total: 100, status: "completed", time: "89 min", submitted: "2025-04-18 10:55" },
];

export const REVIEW_QA = [
  { q: "What is the time complexity of QuickSort in the average case?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 1, chosen: 1 },
  { q: "Which data structure uses LIFO ordering?", options: ["Queue", "Heap", "Stack", "Graph"], correct: 2, chosen: 2 },
  { q: "What does TCP stand for?", options: ["Transfer Control Protocol", "Transmission Control Protocol", "Technical Computing Process", "Terminal Control Packet"], correct: 1, chosen: 3 },
  { q: "Which sorting algorithm is stable?", options: ["QuickSort", "HeapSort", "Merge Sort", "Shell Sort"], correct: 2, chosen: 2 },
  { q: "What is a primary key in a relational database?", options: ["A foreign key reference", "A unique identifier for a record", "An indexed column", "A composite attribute"], correct: 1, chosen: 1 },
];

export const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
