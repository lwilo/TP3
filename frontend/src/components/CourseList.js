import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import './CourseList.css';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load courses. Please check your permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="course-list">
      <h2>Available Courses</h2>
      {courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p className="description">{course.description}</p>
              <div className="course-details">
                <p><strong>Instructor:</strong> {course.instructor}</p>
                <p><strong>Duration:</strong> {course.duration} hours</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;
