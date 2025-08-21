import React, { useState, useEffect } from 'react';
import '../styles/AttendanceManagement.css';

const AttendanceManagement = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [rollNumberFilter, setRollNumberFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sessionDate, setSessionDate] = useState('2025-08-20');

  // Mock data initialization
  useEffect(() => {
    try {
      // Mock students data
      const mockStudents = [
        { id: 1, name: 'John Doe', rollNumber: 'CS001', class: 'Computer Science', section: 'A' },
        { id: 2, name: 'Jane Smith', rollNumber: 'CS002', class: 'Computer Science', section: 'A' },
        { id: 3, name: 'Mike Johnson', rollNumber: 'CS003', class: 'Computer Science', section: 'B' },
        { id: 4, name: 'Sarah Wilson', rollNumber: 'CS004', class: 'Computer Science', section: 'B' }
      ];

      // Mock attendance records
      const mockAttendanceRecords = [
        { 
          id: 1, 
          studentId: 1, 
          studentName: 'John Doe', 
          rollNumber: 'CS001', 
          class: 'Computer Science', 
          section: 'A', 
          date: '2025-08-20', 
          time: '09:00', 
          status: 'Present', 
          method: 'QR Scan' 
        },
        { 
          id: 2, 
          studentId: 2, 
          studentName: 'Jane Smith', 
          rollNumber: 'CS002', 
          class: 'Computer Science', 
          section: 'A', 
          date: '2025-08-20', 
          time: '09:00', 
          status: 'Present', 
          method: 'QR Scan' 
        }
      ];

      setStudents(mockStudents);
      setAttendanceRecords(mockAttendanceRecords);
      setFilteredRecords(mockAttendanceRecords);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, []);

  // Filter attendance records
  useEffect(() => {
    try {
      let filtered = attendanceRecords;

      if (selectedClass) {
        filtered = filtered.filter(record => record.class === selectedClass);
      }

      if (selectedSection) {
        filtered = filtered.filter(record => record.section === selectedSection);
      }

      if (rollNumberFilter) {
        filtered = filtered.filter(record => 
          record.rollNumber && record.rollNumber.toLowerCase().includes(rollNumberFilter.toLowerCase())
        );
      }

      setFilteredRecords(filtered);
    } catch (error) {
      console.error('Error filtering records:', error);
      setFilteredRecords([]);
    }
  }, [attendanceRecords, selectedClass, selectedSection, rollNumberFilter]);

  // Get unique classes and sections for filter dropdowns
  const uniqueClasses = React.useMemo(() => {
    try {
      return [...new Set(students.map(student => student.class))];
    } catch (error) {
      console.error('Error getting unique classes:', error);
      return [];
    }
  }, [students]);

  const uniqueSections = React.useMemo(() => {
    try {
      return [...new Set(students.map(student => student.section))];
    } catch (error) {
      console.error('Error getting unique sections:', error);
      return [];
    }
  }, [students]);

  // Handle adding manual attendance
  const handleAddManualAttendance = () => {
    try {
      if (selectedStudents.length === 0) {
        alert('Please select at least one student');
        return;
      }

      const newRecords = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        if (!student) return null;
        
        return {
          id: Date.now() + Math.random(),
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section,
          date: sessionDate,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          status: 'Present',
          method: 'Manual Entry'
        };
      }).filter(record => record !== null);

      setAttendanceRecords(prev => [...prev, ...newRecords]);
      setSelectedStudents([]);
      setShowAddModal(false);
      alert(`Added attendance for ${newRecords.length} student(s)`);
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert('Error adding attendance. Please try again.');
    }
  };

  // Handle student selection for manual attendance
  const handleStudentSelection = (studentId) => {
    try {
      setSelectedStudents(prev => {
        if (prev.includes(studentId)) {
          return prev.filter(id => id !== studentId);
        } else {
          return [...prev, studentId];
        }
      });
    } catch (error) {
      console.error('Error selecting student:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    try {
      setSelectedClass('');
      setSelectedSection('');
      setRollNumberFilter('');
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  return (
    <div className="attendance-management">
      <div className="page-header">
        <h1>📊 Attendance Management</h1>
        <p>Manage student attendance records and add manual entries</p>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button 
          className="add-attendance-btn"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add Manual Attendance
        </button>
        
        <div className="filter-section">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
            className="filter-select"
          >
            <option value="">All Sections</option>
            {uniqueSections.map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by Roll Number"
            value={rollNumberFilter}
            onChange={(e) => setRollNumberFilter(e.target.value)}
            className="filter-input"
          />

          <button onClick={clearFilters} className="clear-filters-btn">
            🗑️ Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="attendance-table-container">
        <div className="table-header">
          <h2>Recent Attendance Records ({filteredRecords.length})</h2>
        </div>
        
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Status</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.date || 'N/A'}</td>
                    <td>{record.time || 'N/A'}</td>
                    <td className="roll-number">{record.rollNumber || 'N/A'}</td>
                    <td className="student-name">{record.studentName || 'N/A'}</td>
                    <td>{record.class || 'N/A'}</td>
                    <td>Section {record.section || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${(record.status || '').toLowerCase()}`}>
                        {record.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`method-badge ${(record.method || '').replace(' ', '-').toLowerCase()}`}>
                        {record.method || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <button className="edit-btn">✏️</button>
                      <button className="delete-btn">🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No attendance records found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Attendance Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>➕ Add Manual Attendance</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="date-selection">
                <label>Session Date:</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="student-selection">
                <h3>Select Students to Mark Present:</h3>
                <div className="students-grid">
                  {students.map(student => (
                    <div key={student.id} className="student-card">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                      />
                      <label htmlFor={`student-${student.id}`}>
                        <div className="student-info">
                          <div className="student-name">{student.name}</div>
                          <div className="student-details">
                            {student.rollNumber} - {student.class} (Section {student.section})
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="selected-count">
                Selected: {selectedStudents.length} student(s)
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleAddManualAttendance}
                disabled={selectedStudents.length === 0}
              >
                Add Attendance ({selectedStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;


