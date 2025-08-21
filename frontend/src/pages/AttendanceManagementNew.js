import React, { useState, useEffect, useMemo } from 'react';
import '../styles/AttendanceManagement.css';

const AttendanceManagement = () => {
  // State management with error handling
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch (err) {
      console.error('Error setting default date:', err);
      return '';
    }
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    rollNumber: ''
  });

  // Mock student data - in a real app, this would come from an API
  const [students] = useState(() => {
    try {
      return [
        { id: 1, name: 'John Smith', rollNumber: '001', class: '10', section: 'A' },
        { id: 2, name: 'Jane Doe', rollNumber: '002', class: '10', section: 'A' },
        { id: 3, name: 'Bob Johnson', rollNumber: '003', class: '10', section: 'B' },
        { id: 4, name: 'Alice Brown', rollNumber: '004', class: '11', section: 'A' },
        { id: 5, name: 'Charlie Wilson', rollNumber: '005', class: '11', section: 'B' },
        { id: 6, name: 'Diana Davis', rollNumber: '006', class: '12', section: 'A' },
      ];
    } catch (err) {
      console.error('Error initializing students:', err);
      return [];
    }
  });

  // Load attendance data
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Mock attendance data - in a real app, this would be an API call
        const mockData = [
          {
            id: 1,
            studentId: 1,
            studentName: 'John Smith',
            rollNumber: '001',
            class: '10',
            section: 'A',
            date: '2024-01-15',
            status: 'present',
            method: 'qr-scan',
            time: '09:15'
          },
          {
            id: 2,
            studentId: 2,
            studentName: 'Jane Doe',
            rollNumber: '002',
            class: '10',
            section: 'A',
            date: '2024-01-15',
            status: 'absent',
            method: 'not-scanned',
            time: null
          },
          {
            id: 3,
            studentId: 3,
            studentName: 'Bob Johnson',
            rollNumber: '003',
            class: '10',
            section: 'B',
            date: '2024-01-15',
            status: 'present',
            method: 'manual-entry',
            time: '09:20'
          }
        ];
        
        setAttendanceData(mockData);
      } catch (err) {
        console.error('Error loading attendance data:', err);
        setError('Failed to load attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, []);

  // Filter attendance data with error handling
  const filteredAttendance = useMemo(() => {
    try {
      if (!Array.isArray(attendanceData)) {
        console.warn('Attendance data is not an array:', attendanceData);
        return [];
      }

      return attendanceData.filter(record => {
        if (!record) return false;
        
        const matchesClass = !filters.class || (record.class && record.class.toString() === filters.class);
        const matchesSection = !filters.section || (record.section && record.section.toLowerCase() === filters.section.toLowerCase());
        const matchesRoll = !filters.rollNumber || (record.rollNumber && record.rollNumber.toLowerCase().includes(filters.rollNumber.toLowerCase()));
        
        return matchesClass && matchesSection && matchesRoll;
      });
    } catch (err) {
      console.error('Error filtering attendance data:', err);
      return [];
    }
  }, [attendanceData, filters]);

  // Handle filter changes with error handling
  const handleFilterChange = (key, value) => {
    try {
      setFilters(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error('Error updating filters:', err);
    }
  };

  // Clear filters with error handling
  const clearFilters = () => {
    try {
      setFilters({ class: '', section: '', rollNumber: '' });
    } catch (err) {
      console.error('Error clearing filters:', err);
    }
  };

  // Handle adding attendance with error handling
  const handleAddAttendance = () => {
    try {
      setShowAddModal(true);
      setSelectedStudents([]);
      setError(null);
    } catch (err) {
      console.error('Error opening add modal:', err);
      setError('Failed to open attendance form');
    }
  };

  // Handle student selection with error handling
  const handleStudentSelection = (studentId) => {
    try {
      setSelectedStudents(prev => {
        if (!Array.isArray(prev)) {
          console.warn('Selected students is not an array:', prev);
          return [studentId];
        }
        
        if (prev.includes(studentId)) {
          return prev.filter(id => id !== studentId);
        } else {
          return [...prev, studentId];
        }
      });
    } catch (err) {
      console.error('Error selecting student:', err);
    }
  };

  // Submit attendance with error handling
  const submitAttendance = async () => {
    try {
      if (!selectedDate) {
        setError('Please select a date');
        return;
      }
      
      if (!Array.isArray(selectedStudents) || selectedStudents.length === 0) {
        setError('Please select at least one student');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Mock API call - in a real app, this would be an actual API call
      const newRecords = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        if (!student) {
          console.warn('Student not found:', studentId);
          return null;
        }
        
        return {
          id: Date.now() + Math.random(),
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section,
          date: selectedDate,
          status: 'present',
          method: 'manual-entry',
          time: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      }).filter(Boolean);

      setAttendanceData(prev => [...prev, ...newRecords]);
      setShowAddModal(false);
      setSelectedStudents([]);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Failed to submit attendance');
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal with error handling
  const closeModal = () => {
    try {
      setShowAddModal(false);
      setSelectedStudents([]);
      setError(null);
    } catch (err) {
      console.error('Error closing modal:', err);
    }
  };

  // Error boundary fallback
  if (error && !showAddModal) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="attendance-management">
      <div className="page-header">
        <h1>📊 Attendance Management</h1>
        <p>Manage student attendance records and add manual entries</p>
      </div>

      <div className="action-bar">
        <button 
          className="add-attendance-btn" 
          onClick={handleAddAttendance}
          disabled={isLoading}
        >
          ➕ Add Manual Attendance
        </button>

        <div className="filter-section">
          <select 
            className="filter-select" 
            value={filters.class} 
            onChange={(e) => handleFilterChange('class', e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Classes</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>

          <select 
            className="filter-select" 
            value={filters.section} 
            onChange={(e) => handleFilterChange('section', e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <input 
            type="text" 
            className="filter-input" 
            placeholder="Search by Roll Number" 
            value={filters.rollNumber}
            onChange={(e) => handleFilterChange('rollNumber', e.target.value)}
            disabled={isLoading}
          />

          <button 
            className="clear-filters-btn" 
            onClick={clearFilters}
            disabled={isLoading}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="attendance-table-container">
        <div className="table-header">
          <h2>Recent Attendance Records</h2>
        </div>
        
        {isLoading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading...
          </div>
        )}

        {!isLoading && (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance && filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record) => (
                    <tr key={record.id}>
                      <td className="roll-number">{record.rollNumber || 'N/A'}</td>
                      <td className="student-name">{record.studentName || 'N/A'}</td>
                      <td>{record.class || 'N/A'}</td>
                      <td>{record.section || 'N/A'}</td>
                      <td>{record.date || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${record.status || 'unknown'}`}>
                          {record.status || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`method-badge ${record.method || 'unknown'}`}>
                          {record.method === 'qr-scan' ? 'QR Scan' : 
                           record.method === 'manual-entry' ? 'Manual Entry' : 
                           'Not Scanned'}
                        </span>
                      </td>
                      <td>{record.time || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      {isLoading ? 'Loading...' : 'No attendance records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Manual Attendance</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {error && (
                <div style={{ 
                  padding: '10px', 
                  marginBottom: '20px', 
                  backgroundColor: '#fed7d7', 
                  color: '#742a2a', 
                  borderRadius: '4px' 
                }}>
                  {error}
                </div>
              )}
              
              <div className="date-selection">
                <label>Select Date:</label>
                <input 
                  type="date" 
                  className="date-input" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="student-selection">
                <h3>Select Students:</h3>
                <div className="students-grid">
                  {students && students.length > 0 ? (
                    students.map((student) => (
                      <div key={student.id} className="student-card">
                        <input 
                          type="checkbox" 
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          disabled={isLoading}
                        />
                        <label htmlFor={`student-${student.id}`} className="student-info">
                          <div className="student-name">{student.name || 'N/A'}</div>
                          <div className="student-details">
                            Roll: {student.rollNumber || 'N/A'} | Class: {student.class || 'N/A'}{student.section || ''}
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div>No students available</div>
                  )}
                </div>

                {selectedStudents && selectedStudents.length > 0 && (
                  <div className="selected-count">
                    {selectedStudents.length} student(s) selected
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal} disabled={isLoading}>
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={submitAttendance}
                disabled={isLoading || !selectedStudents || selectedStudents.length === 0}
              >
                {isLoading ? 'Adding...' : 'Add Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
