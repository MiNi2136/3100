import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/ProjectManagement.css";

// Simple emoji replacements for icons
const FaPlus = () => <span>➕</span>;
const FaSearch = () => <span>🔍</span>;
const FaEdit = () => <span>✏️</span>;
const FaTrash = () => <span>🗑️</span>;
const FaCalendarAlt = () => <span>📅</span>;
const FaInfoCircle = () => <span>ℹ️</span>;
const FaClipboardList = () => <span>📋</span>;
const FaFilter = () => <span>🔧</span>;
const FaSortAmountDown = () => <span>⬇️</span>;
const FaSortAmountUp = () => <span>⬆️</span>;

const ProjectManagement = ({ teacherData }) => {
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    id: "",
    title: "",
    description: "",
    deadline: "",
    courseId: "",
    sectionId: "",
    status: "active",
  });
  const [modalMode, setModalMode] = useState("add");
  const [sortConfig, setSortConfig] = useState({
    key: "deadline",
    direction: "ascending",
  });
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    // Fetch courses taught by the teacher
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No authentication token found, using mock data");
          setCourses(mockCourses);
          return;
        }
        const response = await api.post("/teachers/courses", { token });
        setCourses(response.data.courses || mockCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        if (err.code === 'ERR_NETWORK' || err.message.includes('ERR_CONNECTION_REFUSED')) {
          console.log("Backend server is not running, using mock data");
        }
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
          if (!token) {
            console.log("No authentication token found, using mock sections");
            setSections(mockSections);
            return;
          }
          const response = await api.post("/teachers/sections", {
            token,
            courseId: selectedCourse,
          });
          setSections(response.data.sections || mockSections);
        } catch (err) {
          console.error("Error fetching sections:", err);
          if (err.code === 'ERR_NETWORK' || err.message.includes('ERR_CONNECTION_REFUSED')) {
            console.log("Backend server is not running, using mock sections");
          }
          setSections(mockSections);
        }
      };

      fetchSections();
    } else {
      setSections([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    // Fetch projects for selected course and section
    if (selectedCourse) {
      const fetchProjects = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await api.post("/teachers/projects", {
            token,
            courseId: selectedCourse,
            sectionId: selectedSection,
          });
          setProjects(response.data.projects || mockProjects);
        } catch (err) {
          console.error("Error fetching projects:", err);
          setProjects(mockProjects);
        }
      };

      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [selectedCourse, selectedSection]);

  useEffect(() => {
    // Filter and sort projects
    const sortProjects = () => {
      const sortedProjects = [...projects].sort((a, b) => {
        if (sortConfig.key === "deadline") {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === "ascending"
            ? dateA - dateB
            : dateB - dateA;
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });

      return sortedProjects;
    };

    const sortedProjects = sortProjects();
    setProjects(sortedProjects);
  }, [sortConfig]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openProjectModal = (mode, project = null) => {
    if (mode === "add") {
      setCurrentProject({
        id: "",
        title: "",
        description: "",
        deadline: new Date().toISOString().split("T")[0],
        courseId: selectedCourse,
        sectionId: selectedSection,
        status: "active",
      });
    } else {
      setCurrentProject({ ...project });
    }
    setModalMode(mode);
    setShowProjectModal(true);
  };

  const handleProjectInputChange = (e) => {
    setCurrentProject({
      ...currentProject,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;
      
      if (modalMode === "add") {
        response = await api.post("/teachers/add-project", {
          token,
          ...currentProject,
        });
        
        // Update projects list with new project
        setProjects([...projects, { ...currentProject, id: Date.now().toString() }]);
      } else {
        response = await api.post("/teachers/update-project", {
          token,
          ...currentProject,
        });
        
        // Update projects list with edited project
        setProjects(
          projects.map((project) =>
            project.id === currentProject.id ? currentProject : project
          )
        );
      }
      
      setShowProjectModal(false);
      alert(modalMode === "add" ? "Project added successfully!" : "Project updated successfully!");
    } catch (err) {
      console.error("Error submitting project:", err);
      alert("Failed to save project. Please try again.");
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const token = localStorage.getItem("token");
        await api.post("/teachers/delete-project", {
          token,
          projectId,
        });
        
        // Remove project from list
        setProjects(projects.filter((project) => project.id !== projectId));
        alert("Project deleted successfully!");
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  const getStatusClass = (deadline) => {
    const now = new Date();
    const projectDeadline = new Date(deadline);
    const daysRemaining = Math.ceil((projectDeadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return "overdue";
    } else if (daysRemaining <= 2) {
      return "urgent";
    } else if (daysRemaining <= 7) {
      return "upcoming";
    } else {
      return "future";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const projectDeadline = new Date(deadline);
    const daysRemaining = Math.ceil((projectDeadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`;
    } else if (daysRemaining === 0) {
      return "Due today";
    } else if (daysRemaining === 1) {
      return "Due tomorrow";
    } else {
      return `${daysRemaining} days remaining`;
    }
  };

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

  const mockProjects = [
    {
      id: "1",
      title: "Database Design Project",
      description: "Design and implement a normalized database schema for a university management system.",
      deadline: "2025-09-15",
      courseId: "CS201",
      sectionId: "A",
      status: "active",
      submissions: 12,
      totalStudents: 25,
    },
    {
      id: "2",
      title: "Sorting Algorithm Implementation",
      description: "Implement and compare the performance of three different sorting algorithms.",
      deadline: "2025-08-30",
      courseId: "CS201",
      sectionId: "A",
      status: "active",
      submissions: 18,
      totalStudents: 25,
    },
    {
      id: "3",
      title: "Web Calculator",
      description: "Build a calculator web application using HTML, CSS and JavaScript.",
      deadline: "2025-08-25",
      courseId: "CS101",
      sectionId: "B",
      status: "active",
      submissions: 22,
      totalStudents: 30,
    },
    {
      id: "4",
      title: "Graph Algorithm Project",
      description: "Implement Dijkstra's algorithm to find the shortest path in a graph.",
      deadline: "2025-10-10",
      courseId: "CS301",
      sectionId: "C",
      status: "active",
      submissions: 5,
      totalStudents: 20,
    },
  ];

  return (
    <div className="project-management">
      <div className="section-header">
        <h1>Project Management</h1>
        <button
          className="add-project-btn"
          onClick={() => openProjectModal("add")}
          disabled={!selectedCourse || !selectedSection}
        >
          <FaPlus /> New Project
        </button>
      </div>

      <div className="project-controls">
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects by title or description..."
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
          </div>
        )}
      </div>

      <div className="projects-list">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`project-card ${getStatusClass(project.deadline)}`}
            >
              <div className="project-header">
                <h3>{project.title}</h3>
                <div className="project-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => openProjectModal("edit", project)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => deleteProject(project.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="project-details">
                <div className="project-info">
                  <div className="deadline-info">
                    <FaCalendarAlt className="icon" />
                    <div>
                      <p className="label">Deadline</p>
                      <p className="value">{formatDate(project.deadline)}</p>
                      <p className="remaining">{getTimeRemaining(project.deadline)}</p>
                    </div>
                  </div>
                  
                  <div className="submissions-info">
                    <FaClipboardList className="icon" />
                    <div>
                      <p className="label">Submissions</p>
                      <p className="value">
                        {project.submissions} / {project.totalStudents}
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{
                            width: `${(project.submissions / project.totalStudents) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="description">
                  {project.description.length > 100 && !showDetails === project.id
                    ? `${project.description.slice(0, 100)}...`
                    : project.description}
                </p>
                
                {project.description.length > 100 && (
                  <button
                    className="toggle-details"
                    onClick={() =>
                      setShowDetails(showDetails === project.id ? null : project.id)
                    }
                  >
                    {showDetails === project.id ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            {selectedCourse && selectedSection ? (
              <p>No projects found. Create a new project to get started.</p>
            ) : (
              <p>Please select a course and section to view or add projects.</p>
            )}
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{modalMode === "add" ? "Add New Project" : "Edit Project"}</h2>
              <button
                className="close-modal"
                onClick={() => setShowProjectModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={currentProject.title}
                  onChange={handleProjectInputChange}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={currentProject.description}
                  onChange={handleProjectInputChange}
                  placeholder="Enter project description"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={currentProject.deadline}
                  onChange={handleProjectInputChange}
                  required
                />
              </div>
              
              {modalMode === "add" && (
                <>
                  <div className="form-group">
                    <label>Course</label>
                    <select
                      name="courseId"
                      value={currentProject.courseId}
                      onChange={handleProjectInputChange}
                      required
                      disabled={modalMode === "add" && selectedCourse}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Section</label>
                    <select
                      name="sectionId"
                      value={currentProject.sectionId}
                      onChange={handleProjectInputChange}
                      required
                      disabled={modalMode === "add" && selectedSection}
                    >
                      <option value="">Select Section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={currentProject.status}
                  onChange={handleProjectInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowProjectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleProjectSubmit}
                disabled={!currentProject.title || !currentProject.description || !currentProject.deadline}
              >
                {modalMode === "add" ? "Create Project" : "Update Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
