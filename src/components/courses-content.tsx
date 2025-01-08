"use client";

import { Typography } from "@material-tailwind/react";

import CoursesContentCard from "./card/home-course-card";

const COURSE_CONTENT = [
  {
    title: "Chess for Beginners",
    des: "This course covers the basics of chess, including rules, piece movements, strategies, and basic tactics. Whether you're a complete beginner or looking to refresh your knowledge, this course is the perfect starting point.",
    name: "John Doe",
    position: "International Chess Master",
    panel: "Beginner Course",
    img: "/image/avatar1.jpg",
  },
  {
    title: "Intermediate Chess Strategies",
    des: "Learn advanced strategies and techniques for playing chess at a higher level. This course covers tactics, opening principles, middle game strategies, and endgame techniques.",
    name: "Jane Smith",
    position: "Chess Grandmaster",
    panel: "Intermediate Course",
    img: "/image/avatar2.jpg",
  },
  {
    title: "Go: The Art of Strategy",
    des: "Explore the ancient game of Go. Learn the rules, basic strategies, and how to think ahead in this profound and deep game of strategy. Perfect for those who enjoy challenging and intellectual games.",
    name: "Alice Johnson",
    position: "Go Expert",
    panel: "Workshop",
    img: "/image/avatar3.jpg",
  },
];

export function CourseContent() {
  return (
    <section className="container mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h3" className="text-center" color="blue-gray">
        Learn and Master Chess Skills
      </Typography>
      <Typography
        variant="lead"
        className="mt-2 lg:max-w-4xl mb-8 w-full text-center font-normal !text-gray-500"
      >
        Join our expert-led classes to enhance your chess skills, whether you're
        a beginner or an advanced player. Courses available for Chess, Xiangqi,
        and Go
      </Typography>
      <div className="mx-auto container">
        {COURSE_CONTENT.map((props, idx) => (
          <CoursesContentCard key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

export default CourseContent;
