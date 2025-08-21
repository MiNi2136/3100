import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Reports.css";

// Simple emoji replacements for icons
const FaSearch = () => <span>🔍</span>;
const FaFilter = () => <span>🔧</span>;
const FaDownload = () => <span>⬇️</span>;
const FaCalendarAlt = () => <span>📅</span>;
const FaChartBar = () => <span>📊</span>;
const FaUserGraduate = () => <span>🎓</span>;
const FaBook = () => <span>📚</span>;
const FaChartLine = () => <span>📈</span>;
const FaFileExport = () => <span>📤</span>;
const FaPrint = () => <span>🖨️</span>;

const Reports = ({ teacherData }) => {
  const [reportType, setReportType] = useState("attendance");
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState("bar");
  
  const reportTypes = [
    { id: "attendance", name: "Attendance Report", icon: <FaUserGraduate /> },
    { id: "performance", name: "Performance Report", icon: <FaChartLine /> },
    { id: "course", name: "Course Report", icon: <FaBook /> },
  ];

  useEffect(() => {
    // Fetch courses taught by the teacher
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.post("/teachers/courses", { token });
        setCourses(response.data.courses || mockCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses(mockCourses);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    // Fetch sections for the selected course
    if (selectedCourse) {
      const fetchSections = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await api.post("/teachers/sections", {
            token,
            courseId: selectedCourse,
          });
          setSections(response.data.sections || mockSections);
        } catch (err) {
          console.error("Error fetching sections:", err);
          setSections(mockSections);
        }
      };

      fetchSections();
    } else {
      setSections([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    // Fetch students when both course and section are selected
    if (selectedCourse && selectedSection) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await api.post("/teachers/students", {
            token,
            courseId: selectedCourse,
            sectionId: selectedSection,
          });
          setStudents(response.data.students || mockStudents);
        } catch (err) {
          console.error("Error fetching students:", err);
          setStudents(mockStudents);
        }
      };

      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedCourse, selectedSection]);

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const generateReport = async () => {
    if (!selectedCourse) {
      alert("Please select a course to generate a report.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to fetch report data
      // For now, we'll simulate a delay and generate mock data
      setTimeout(() => {
        switch (reportType) {
          case "attendance":
            setReportData(mockAttendanceReport);
            break;
          case "performance":
            setReportData(mockPerformanceReport);
            break;
          case "course":
            setReportData(mockCourseReport);
            break;
          default:
            setReportData(null);
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error generating report:", err);
      setIsLoading(false);
      alert("Failed to generate report. Please try again.");
    }
  };

  const exportReport = (format) => {
    if (!reportData) return;
    
    // In a real app, this would make an API call to generate and download the report
    // For now, we'll simulate downloading a file
    const fileName = `${reportType}-report-${selectedCourse}${
      selectedSection ? "-" + selectedSection : ""
    }.${format}`;
    
    alert(`Exporting ${fileName}...`);
    
    // In a real implementation, we would create and download the actual file
  };

  const printReport = () => {
    window.print();
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data
  const mockCourses = [
    { id: "CS101", name: "Introduction to Computer Science" },
    { id: "CS201", name: "Data Structures" },
    { id: "CS301", name: "Algorithm Design" },
  ];

  const mockSections = [
    { id: "A", name: "Section A" },
    { id: "B", name: "Section B" },
    { id: "C", name: "Section C" },
  ];

  const mockStudents = [
    {
      id: "ST001",
      name: "John Doe",
      email: "john.doe@example.com",
      attendance: {
        total: 20,
        present: 18,
        percentage: 90,
      },
      performance: {
        assignments: [
          { name: "Assignment 1", marks: 8, maxMarks: 10 },
          { name: "Assignment 2", marks: 9, maxMarks: 10 },
        ],
        quizzes: [
          { name: "Quiz 1", marks: 18, maxMarks: 20 },
          { name: "Quiz 2", marks: 17, maxMarks: 20 },
        ],
        overall: 87,
      },
    },
    {
      id: "ST002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      attendance: {
        total: 20,
        present: 16,
        percentage: 80,
      },
      performance: {
        assignments: [
          { name: "Assignment 1", marks: 7, maxMarks: 10 },
          { name: "Assignment 2", marks: 8, maxMarks: 10 },
        ],
        quizzes: [
          { name: "Quiz 1", marks: 16, maxMarks: 20 },
          { name: "Quiz 2", marks: 15, maxMarks: 20 },
        ],
        overall: 77,
      },
    },
    {
      id: "ST003",
      name: "Robert Johnson",
      email: "robert@example.com",
      attendance: {
        total: 20,
        present: 14,
        percentage: 70,
      },
      performance: {
        assignments: [
          { name: "Assignment 1", marks: 9, maxMarks: 10 },
          { name: "Assignment 2", marks: 6, maxMarks: 10 },
        ],
        quizzes: [
          { name: "Quiz 1", marks: 14, maxMarks: 20 },
          { name: "Quiz 2", marks: 16, maxMarks: 20 },
        ],
        overall: 75,
      },
    },
    {
      id: "ST004",
      name: "Emily Davis",
      email: "emily@example.com",
      attendance: {
        total: 20,
        present: 20,
        percentage: 100,
      },
      performance: {
        assignments: [
          { name: "Assignment 1", marks: 10, maxMarks: 10 },
          { name: "Assignment 2", marks: 10, maxMarks: 10 },
        ],
        quizzes: [
          { name: "Quiz 1", marks: 19, maxMarks: 20 },
          { name: "Quiz 2", marks: 20, maxMarks: 20 },
        ],
        overall: 98,
      },
    },
    {
      id: "ST005",
      name: "Michael Wilson",
      email: "michael@example.com",
      attendance: {
        total: 20,
        present: 12,
        percentage: 60,
      },
      performance: {
        assignments: [
          { name: "Assignment 1", marks: 6, maxMarks: 10 },
          { name: "Assignment 2", marks: 7, maxMarks: 10 },
        ],
        quizzes: [
          { name: "Quiz 1", marks: 13, maxMarks: 20 },
          { name: "Quiz 2", marks: 12, maxMarks: 20 },
        ],
        overall: 63,
      },
    },
  ];

  const mockAttendanceReport = {
    title: "Attendance Report",
    course: mockCourses.find((c) => c.id === selectedCourse)?.name || "",
    section: selectedSection
      ? mockSections.find((s) => s.id === selectedSection)?.name
      : "All Sections",
    dateRange: `${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(
      dateRange.endDate
    ).toLocaleDateString()}`,
    averageAttendance: 80,
    students: filteredStudents.map((student) => ({
      id: student.id,
      name: student.name,
      attendancePercentage: student.attendance.percentage,
      totalClasses: student.attendance.total,
      presentClasses: student.attendance.present,
    })),
    classesByDay: [
      { day: "Monday", attendance: 85 },
      { day: "Tuesday", attendance: 78 },
      { day: "Wednesday", attendance: 82 },
      { day: "Thursday", attendance: 75 },
      { day: "Friday", attendance: 80 },
    ],
    trendsOverTime: [
      { week: "Week 1", attendance: 90 },
      { week: "Week 2", attendance: 85 },
      { week: "Week 3", attendance: 82 },
      { week: "Week 4", attendance: 78 },
    ],
  };

  const mockPerformanceReport = {
    title: "Performance Report",
    course: mockCourses.find((c) => c.id === selectedCourse)?.name || "",
    section: selectedSection
      ? mockSections.find((s) => s.id === selectedSection)?.name
      : "All Sections",
    dateRange: `${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(
      dateRange.endDate
    ).toLocaleDateString()}`,
    averagePerformance: 80,
    students: filteredStudents.map((student) => ({
      id: student.id,
      name: student.name,
      overallPerformance: student.performance.overall,
      assignments: student.performance.assignments.reduce(
        (acc, curr) => acc + (curr.marks / curr.maxMarks) * 100,
        0
      ) / student.performance.assignments.length,
      quizzes: student.performance.quizzes.reduce(
        (acc, curr) => acc + (curr.marks / curr.maxMarks) * 100,
        0
      ) / student.performance.quizzes.length,
    })),
    assessments: [
      { name: "Assignment 1", average: 78 },
      { name: "Assignment 2", average: 82 },
      { name: "Quiz 1", average: 75 },
      { name: "Quiz 2", average: 80 },
    ],
    distributionByGrade: [
      { grade: "A", count: 5 },
      { grade: "B", count: 8 },
      { grade: "C", count: 6 },
      { grade: "D", count: 3 },
      { grade: "F", count: 1 },
    ],
  };

  const mockCourseReport = {
    title: "Course Report",
    course: mockCourses.find((c) => c.id === selectedCourse)?.name || "",
    section: selectedSection
      ? mockSections.find((s) => s.id === selectedSection)?.name
      : "All Sections",
    dateRange: `${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(
      dateRange.endDate
    ).toLocaleDateString()}`,
    overallProgress: 75,
    topicsCompleted: [
      { topic: "Introduction", completion: 100 },
      { topic: "Basic Concepts", completion: 100 },
      { topic: "Advanced Topics", completion: 80 },
      { topic: "Practical Applications", completion: 60 },
      { topic: "Final Project", completion: 30 },
    ],
    studentEngagement: [
      { metric: "Class Participation", score: 85 },
      { metric: "Assignment Submission", score: 90 },
      { metric: "Quiz Performance", score: 75 },
      { metric: "Project Work", score: 80 },
    ],
    feedbackSummary: {
      positive: 75,
      negative: 10,
      neutral: 15,
      comments: [
        "Great teaching style and content",
        "More practical examples would be helpful",
        "Assignments are challenging but valuable",
      ],
    },
  };

  return (
    <div className="reports">
      <div className="section-header">
        <h1>Reports</h1>
      </div>

      <div className="report-types">
        {reportTypes.map((type) => (
          <div
            key={type.id}
            className={`report-type ${reportType === type.id ? "active" : ""}`}
            onClick={() => setReportType(type.id)}
          >
            <div className="report-type-icon">{type.icon}</div>
            <span>{type.name}</span>
          </div>
        ))}
      </div>

      <div className="report-controls">
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            <span>Filter</span>
          </button>
          
          <button
            className="generate-button"
            onClick={generateReport}
            disabled={!selectedCourse}
          >
            <FaChartBar />
            <span>Generate Report</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="filter-options">
            <div className="filter-group">
              <label>Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedSection("");
                }}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedCourse}
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
              />
            </div>
            
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                min={dateRange.startDate}
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      ) : reportData ? (
        <div className="report-container">
          <div className="report-header">
            <div className="report-title">
              <h2>{reportData.title}</h2>
              <p className="report-subtitle">
                <span>
                  <strong>Course:</strong> {reportData.course}
                </span>
                <span>
                  <strong>Section:</strong> {reportData.section}
                </span>
                <span>
                  <strong>Date Range:</strong> {reportData.dateRange}
                </span>
              </p>
            </div>
            
            <div className="report-actions">
              <div className="chart-toggle">
                <button
                  className={chartType === "bar" ? "active" : ""}
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </button>
                <button
                  className={chartType === "pie" ? "active" : ""}
                  onClick={() => setChartType("pie")}
                >
                  Pie
                </button>
              </div>
              
              <div className="export-options">
                <button
                  className="export-btn"
                  onClick={() => exportReport("pdf")}
                >
                  <FaFileExport /> PDF
                </button>
                <button
                  className="export-btn"
                  onClick={() => exportReport("excel")}
                >
                  <FaDownload /> Excel
                </button>
                <button className="print-btn" onClick={printReport}>
                  <FaPrint /> Print
                </button>
              </div>
            </div>
          </div>

          <div className="report-content">
            {reportType === "attendance" && (
              <div className="attendance-report">
                <div className="report-summary">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <FaUserGraduate />
                    </div>
                    <div className="summary-data">
                      <h3>Average Attendance</h3>
                      <p className="summary-value">{reportData.averageAttendance}%</p>
                    </div>
                  </div>
                  
                  <div className="summary-chart">
                    <h3>Attendance Trends</h3>
                    <div className={`chart ${chartType}`}>
                      {chartType === "bar" ? (
                        <div className="bar-chart">
                          {reportData.trendsOverTime.map((week, index) => (
                            <div className="bar-column" key={index}>
                              <div
                                className="bar"
                                style={{ height: `${week.attendance}%` }}
                              >
                                <span className="bar-value">{week.attendance}%</span>
                              </div>
                              <span className="bar-label">{week.week}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pie-chart-placeholder">
                          <div className="pie-chart">
                            <div
                              className="pie-segment"
                              style={{
                                transform: "rotate(0deg)",
                                backgroundColor: "#4361ee",
                                clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)",
                              }}
                            ></div>
                            <div
                              className="pie-segment"
                              style={{
                                transform: `rotate(${reportData.averageAttendance * 3.6}deg)`,
                                backgroundColor: "#e5e5e5",
                                clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)",
                              }}
                            ></div>
                          </div>
                          <div className="pie-legend">
                            <div className="legend-item">
                              <div
                                className="legend-color"
                                style={{ backgroundColor: "#4361ee" }}
                              ></div>
                              <span>Present ({reportData.averageAttendance}%)</span>
                            </div>
                            <div className="legend-item">
                              <div
                                className="legend-color"
                                style={{ backgroundColor: "#e5e5e5" }}
                              ></div>
                              <span>Absent ({100 - reportData.averageAttendance}%)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="report-table-container">
                  <h3>Student Attendance Details</h3>
                  <div className="table-responsive">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Attendance %</th>
                          <th>Classes Present</th>
                          <th>Total Classes</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.students.map((student) => (
                          <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.name}</td>
                            <td>{student.attendancePercentage}%</td>
                            <td>{student.presentClasses}</td>
                            <td>{student.totalClasses}</td>
                            <td>
                              <span
                                className={`status ${
                                  student.attendancePercentage >= 90
                                    ? "excellent"
                                    : student.attendancePercentage >= 75
                                    ? "good"
                                    : student.attendancePercentage >= 60
                                    ? "average"
                                    : "poor"
                                }`}
                              >
                                {student.attendancePercentage >= 90
                                  ? "Excellent"
                                  : student.attendancePercentage >= 75
                                  ? "Good"
                                  : student.attendancePercentage >= 60
                                  ? "Average"
                                  : "Poor"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {reportType === "performance" && (
              <div className="performance-report">
                <div className="report-summary">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <FaChartLine />
                    </div>
                    <div className="summary-data">
                      <h3>Average Performance</h3>
                      <p className="summary-value">{reportData.averagePerformance}%</p>
                    </div>
                  </div>
                  
                  <div className="summary-chart">
                    <h3>Grade Distribution</h3>
                    <div className={`chart ${chartType}`}>
                      {chartType === "bar" ? (
                        <div className="bar-chart">
                          {reportData.distributionByGrade.map((item, index) => (
                            <div className="bar-column" key={index}>
                              <div
                                className="bar"
                                style={{
                                  height: `${
                                    (item.count /
                                      Math.max(
                                        ...reportData.distributionByGrade.map(
                                          (i) => i.count
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              >
                                <span className="bar-value">{item.count}</span>
                              </div>
                              <span className="bar-label">{item.grade}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pie-chart-placeholder">
                          <div className="pie-chart-grades">
                            {/* In a real implementation, this would be a proper pie chart */}
                            <div className="pie-placeholder">
                              Grade distribution visualization
                            </div>
                          </div>
                          <div className="pie-legend">
                            {reportData.distributionByGrade.map((grade, index) => (
                              <div className="legend-item" key={index}>
                                <div
                                  className="legend-color"
                                  style={{
                                    backgroundColor: [
                                      "#4361ee",
                                      "#3a0ca3",
                                      "#7209b7",
                                      "#f72585",
                                      "#4cc9f0",
                                    ][index % 5],
                                  }}
                                ></div>
                                <span>
                                  {grade.grade} ({grade.count} students)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="report-table-container">
                  <h3>Student Performance Details</h3>
                  <div className="table-responsive">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Overall</th>
                          <th>Assignments</th>
                          <th>Quizzes</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.students.map((student) => {
                          const getGrade = (score) => {
                            if (score >= 90) return "A";
                            if (score >= 80) return "B";
                            if (score >= 70) return "C";
                            if (score >= 60) return "D";
                            return "F";
                          };

                          return (
                            <tr key={student.id}>
                              <td>{student.id}</td>
                              <td>{student.name}</td>
                              <td>{student.overallPerformance}%</td>
                              <td>{student.assignments.toFixed(1)}%</td>
                              <td>{student.quizzes.toFixed(1)}%</td>
                              <td>
                                <span
                                  className={`grade ${getGrade(
                                    student.overallPerformance
                                  ).toLowerCase()}`}
                                >
                                  {getGrade(student.overallPerformance)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {reportType === "course" && (
              <div className="course-report">
                <div className="report-summary">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <FaBook />
                    </div>
                    <div className="summary-data">
                      <h3>Course Progress</h3>
                      <p className="summary-value">{reportData.overallProgress}%</p>
                    </div>
                  </div>
                  
                  <div className="summary-chart">
                    <h3>Topic Completion</h3>
                    <div className="topic-progress">
                      {reportData.topicsCompleted.map((topic, index) => (
                        <div className="topic" key={index}>
                          <div className="topic-info">
                            <span className="topic-name">{topic.topic}</span>
                            <span className="topic-percentage">
                              {topic.completion}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress"
                              style={{ width: `${topic.completion}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="engagement-section">
                  <h3>Student Engagement Metrics</h3>
                  <div className="engagement-chart">
                    {reportData.studentEngagement.map((item, index) => (
                      <div className="engagement-item" key={index}>
                        <div className="engagement-info">
                          <span className="engagement-name">{item.metric}</span>
                          <span className="engagement-score">{item.score}%</span>
                        </div>
                        <div className="engagement-bar">
                          <div
                            className="engagement-progress"
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="feedback-section">
                  <h3>Feedback Summary</h3>
                  <div className="feedback-chart">
                    <div className="feedback-distribution">
                      <div
                        className="feedback-positive"
                        style={{ width: `${reportData.feedbackSummary.positive}%` }}
                      >
                        Positive: {reportData.feedbackSummary.positive}%
                      </div>
                      <div
                        className="feedback-neutral"
                        style={{ width: `${reportData.feedbackSummary.neutral}%` }}
                      >
                        Neutral: {reportData.feedbackSummary.neutral}%
                      </div>
                      <div
                        className="feedback-negative"
                        style={{ width: `${reportData.feedbackSummary.negative}%` }}
                      >
                        Negative: {reportData.feedbackSummary.negative}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="feedback-comments">
                    <h4>Selected Comments:</h4>
                    <ul>
                      {reportData.feedbackSummary.comments.map((comment, index) => (
                        <li key={index}>{comment}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="no-report">
          <div className="no-report-icon">
            <FaChartBar />
          </div>
          <h3>No Report Generated</h3>
          <p>
            Select a course and date range, then click "Generate Report" to view
            analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
