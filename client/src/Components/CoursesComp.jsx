import { Card, Row, Col, Progress, Tag, message } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const mockCourses = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    description:
      'Master advanced React patterns including custom hooks, render props, compound components, and performance optimization techniques. Perfect for intermediate developers looking to level up.',

    progress: 100,
    status: 'In Progress',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    level: 'Advanced',
  },
  {
    id: '2',
    title: 'Web Design Fundamentals',
    description:
      'Learn the principles of modern web design including layout, typography, color theory, and user experience. Create beautiful interfaces that users love with practical design exercises.',

    progress: 45,
    status: 'In Progress',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    level: 'Beginner',
  },
  {
    id: '3',
    title: 'Node.js & Express Mastery',
    description:
      'Build scalable backend applications with Node.js and Express. Cover RESTful APIs, database integration, authentication, and deployment strategies for production applications.',

    progress: 60,
    status: 'In Progress',
    image: 'linear-gradient(135deg, #1a237e 0%, #00897b 100%)',
    level: 'Intermediate',
  },
  {
    id: '4',
    title: 'Python Data Science',
    description:
      'Dive into data analysis and visualization using Python. Learn pandas, numpy, matplotlib, and machine learning basics. Perfect for aspiring data scientists and analysts.',

    progress: 30,
    status: 'In Progress',
    image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    level: 'Intermediate',
  },
  {
    id: '5',
    title: 'AWS Cloud Architecture',
    description:
      'Master AWS services for building cloud-native applications. Learn about EC2, S3, Lambda, RDS, and serverless architecture. Essential for modern backend development.',

    progress: 0,
    status: 'Not Started',
    image: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
    level: 'Advanced',
  },
  {
    id: '6',
    title: 'Mobile App Development',
    description:
      'Create cross-platform mobile applications using React Native. Learn navigation, state management, and native modules. Deploy your apps to iOS and Android.',

    progress: 55,
    status: 'In Progress',
    image: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    level: 'Intermediate',
  },
];

const CoursesComp = () => {
  const [courseBookmarks, setCourseBookmarks] = useState(new Set());
  const [messageApi, contextHolder] = message.useMessage();
  const { cid } = useParams();

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    messageApi.success('Code copied to clipboard!');
  };

  const handleBookmark = (courseId) => {
    const newBookmarks = new Set(courseBookmarks);
    if (newBookmarks.has(courseId)) {
      newBookmarks.delete(courseId);
      messageApi.info('Removed from bookmarks');
    } else {
      newBookmarks.add(courseId);
      messageApi.success('Added to bookmarks');
    }
    setCourseBookmarks(newBookmarks);
  };

  const getLevelColor = (level) => {
    const colorMap = {
      Beginner: 'green',
      Intermediate: 'blue',
      Advanced: 'orange',
    };
    return colorMap[level] || 'default';
  };

  return (
    <>
      {contextHolder}
      <main className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg text-text-muted">Hi</span>
              <h1 className="text-5xl font-bold text-primary m-0">
                Alex
              </h1>
            </div>
            <p className="text-lg text-text-secondary m-0">
              Welcome back! Continue your learning journey.
            </p>
          </div>

          {/* Course Grid */}
          <Row gutter={[24, 24]}>
            {mockCourses.map((course) => (
              <Col key={course.id} xs={24} sm={24} md={12} lg={8}>
                <Card
                  hoverable
                  className="rounded-2xl overflow-hidden h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 bg-surface border-border"
                  styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
                  cover={
                    <div
                      className="h-48 relative flex items-center justify-center text-white"
                      style={{ background: course.image }}
                    >
                    </div>
                  }
                >
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 text-text">
                    {course.title}
                  </h3>

                  {/* Level Tag */}
                  <div className="mb-3">
                    <Tag color={getLevelColor(course.level)}>{course.level}</Tag>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary mb-4 flex-1 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Progress Section */}
                  <div className="mt-auto">
                    {/* Status */}
                    <div className="flex justify-between items-center mb-3">
                      <Tag
                        color={course.progress > 0 ? 'blue' : 'default'}
                        className="m-0"
                      >
                        {course.status}
                      </Tag>
                      <a
                        href="#"
                        className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:text-primary-hover transition-colors"
                      >
                        {course.progress <= 0 ? "Start Cours": course.progress >= 100 ?   "Finished" : "Continue"}
                        <RightOutlined className="text-xs" />
                      </a>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <Progress
                        percent={course.progress}
                        strokeColor="#5b21b6"
                        format={(percent) => `${percent}%`}
                        className='text-text!'
                        size="small"
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </main>
    </>
  );
}

export default CoursesComp;