import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import '../styles/StudentProfileForm.css';

const StudentProfileForm = () => {
  const [formData, setFormData] = useState({
    studentRoll: '',
    fullName: '',
    section: '',
    registrationNumber: '',
    phoneNumber: '',
    gender: '',
    department: '',
    year: '',
    semester: '',
    classSection: '',
    coursesEnrolled: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = [
        'studentRoll', 'fullName', 'registrationNumber', 
        'phoneNumber', 'gender', 'department', 'year', 
        'semester', 'classSection', 'coursesEnrolled'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Save profile data to localStorage
      Object.keys(formData).forEach(key => {
        localStorage.setItem(key, formData[key]);
      });
      
      // Mark profile as complete
      localStorage.setItem('profileComplete', 'true');
      
      // Update the name in localStorage if different
      localStorage.setItem('name', formData.fullName);
      
      // In a real app, you would send this to your API
      // const response = await api.post('/users/complete-profile', formData);
      
      alert('Profile completed successfully!');
      navigate('/student-dashboard');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-form-page">
      <Nav pageTitle="Complete Profile" userType="student" />
      
      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="form-header">
            <h1>Complete Your Student Profile</h1>
            <p>Please fill in all the required information to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="form-section">
              <h3>Academic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentRoll">Student Roll Number *</label>
                  <input
                    type="text"
                    id="studentRoll"
                    name="studentRoll"
                    value={formData.studentRoll}
                    onChange={handleChange}
                    placeholder="Enter your roll number"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="registrationNumber">Registration Number *</label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Enter your registration number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department / Program *</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="electrical-engineering">Electrical Engineering</option>
                    <option value="mechanical-engineering">Mechanical Engineering</option>
                    <option value="civil-engineering">Civil Engineering</option>
                    <option value="business-administration">Business Administration</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="classSection">Class Section *</label>
                  <select
                    id="classSection"
                    name="classSection"
                    value={formData.classSection}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="coursesEnrolled">Courses Enrolled *</label>
                  <textarea
                    id="coursesEnrolled"
                    name="coursesEnrolled"
                    value={formData.coursesEnrolled}
                    onChange={handleChange}
                    placeholder="Enter your enrolled courses (separated by commas)"
                    rows="3"
                    required
                  />
                  <small>Example: Mathematics, Physics, Computer Programming, Data Structures</small>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Profile...' : 'Complete Profile'}
              </button>
              
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate('/student-dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileForm;
