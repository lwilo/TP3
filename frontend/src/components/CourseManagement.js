import React, { useState } from 'react';
import apiService from '../services/apiService';
import './CourseManagement.css';

function CourseManagement({ isAdmin }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: ''
  });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You must be an administrator to access this section.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        duration: parseInt(formData.duration)
      };
      await apiService.createCourse(courseData);
      setMessage('Course created successfully!');
      setMessageType('success');
      setFormData({
        title: '',
        description: '',
        instructor: '',
        duration: ''
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('Failed to create course. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="course-management">
      <h2>Course Management</h2>
      <p className="admin-note">Administrator Section</p>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="title">Course Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="instructor">Instructor:</label>
          <input
            type="text"
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duration (hours):</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <button type="submit" className="submit-button">
          Create Course
        </button>
      </form>
    </div>
  );
}

export default CourseManagement;
