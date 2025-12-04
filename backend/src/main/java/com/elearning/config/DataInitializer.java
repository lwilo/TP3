package com.elearning.config;

import com.elearning.model.Course;
import com.elearning.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize some sample courses
        courseRepository.save(new Course(
            "Introduction to Spring Boot",
            "Learn the basics of Spring Boot framework",
            "John Doe",
            20
        ));
        
        courseRepository.save(new Course(
            "React for Beginners",
            "Master React fundamentals and hooks",
            "Jane Smith",
            30
        ));
        
        courseRepository.save(new Course(
            "OAuth2 and OpenID Connect",
            "Understanding modern authentication and authorization",
            "Bob Johnson",
            15
        ));
        
        courseRepository.save(new Course(
            "Microservices Architecture",
            "Design and implement microservices",
            "Alice Brown",
            25
        ));
        
        System.out.println("Sample courses initialized!");
    }
}
