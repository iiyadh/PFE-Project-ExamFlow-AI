import { Card, Row, Col, Progress, Tag, message , Input ,Button, Modal, Form, Select } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

const CoursesComp = () => {
  const [CoursesData, setCoursesData] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState(CoursesData);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const { cid } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();



  const handleSearch = (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term.trim() === '') {
          setFilteredCourses(CoursesData);
      }
      else {
          const filtered = CoursesData.filter(
              course => course.title.toLowerCase().includes(term.toLowerCase())|| course.description.toLowerCase().includes(term.toLowerCase())
          );
          setFilteredCourses(filtered);
      }
  };

  const getLevelColor = (level) => {
    const colorMap = {
      Beginner: 'green',
      Intermediate: 'blue',
      Advanced: 'orange',
    };
    return colorMap[level] || 'default';
  };


  const fetchCourses = async () => {
    try {
      const response = await api.get(`/course/${cid}`);
      const fetchedCourses = Array.isArray(response.data) ? response.data : [];

      if (role === 'student' && fetchedCourses.length > 0) {
        const coursesWithProgress = await Promise.all(
          fetchedCourses.map(async (course) => {
            try {
              const progressResponse = await api.get(`/progress/${course._id}`);
              return {
                ...course,
                progress: progressResponse.data?.progress ?? 0,
                status: progressResponse.data?.status ?? 'Not Started',
              };
            } catch (progressError) {
              console.error(`Error fetching progress for course ${course._id}:`, progressError);
              return {
                ...course,
                progress: 0,
                status: 'Not Started',
              };
            }
          })
        );

        setCoursesData(coursesWithProgress);
        setFilteredCourses(coursesWithProgress);
      } else {
        setCoursesData(fetchedCourses);
        setFilteredCourses(fetchedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      messageApi.error('Failed to fetch courses. Please try again later.');
    }
  };

  const savEeditCourse = async (courseId, updatedData) => {
    try {
      const response = await api.put(`/course/${courseId}`, updatedData);
      const updatedCourse = response.data;
      setCoursesData(prevCourses =>
        prevCourses.map(course => (course.id === courseId ? updatedCourse : course))
      );
      setFilteredCourses(prevCourses =>
        prevCourses.map(course => (course.id === courseId ? updatedCourse : course))
      );
      messageApi.success('Course updated successfully!');
      setIsEditModalVisible(false);
      form.resetFields();
    }
      catch (error) {
        console.error('Error editing course:', error);
        messageApi.error('Failed to edit course. Please try again later.');
      }
  };

  const EditCourse = (course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      title: course.title,
      description: course.description,
      level: course.level,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await savEeditCourse(editingCourse.id, values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    form.resetFields();
    setEditingCourse(null);
  };

  useEffect(() => {
    fetchCourses();
  }, [cid, role]);


  return (
    <>
      {contextHolder}
      <main className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="w-full md:w-auto">
                    <h1 className="w-75 text-2xl sm:text-3xl font-bold text-text mb-2">Courses</h1>
                    <p className="text-text-secondary">Explore courses</p>
                </div>
                <Input
                    placeholder="Search courses..."
                    allowClear
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-[50%] md:w-75 lg:w-100 xl:w-125 px-5! py-2.5!"
                />
            </div>

          {/* Course Grid */}
          <Row gutter={[24, 24]}>
            {filteredCourses.map((course) => (
              <Col key={course._id} xs={24} sm={24} md={12} lg={8}>
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
                  onClick={()=>navigate(`/${role}/modules/${course._id}`)}
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
                  {role == 'student' && 
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
                        {
                          course.progress <= 0 ? <RightOutlined /> : course.progress >= 100 ? null : <RightOutlined />
                        }
                      </a>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <Progress
                        percent={course.progress}
                        strokeColor={course.progress == 100 ? "#3b82f6" : "#5b21b6"}
                        format={(percent) => `${percent}%`}
                        className='text-text!'
                        size="small"
                      />
                    </div>
                  </div>}

                  {role == 'teacher' &&
                    <div className="mt-auto">
                      <Button
                        type="primary"
                        className="w-full"
                        icon={<RightOutlined />}
                        onClick={(e)=>{
                          e.stopPropagation();
                          EditCourse(course);
                        }}
                        >
                        Edit Course
                      </Button>
                    </div>
                  }
                </Card>
              </Col>
            ))}
            {filteredCourses.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center py-24 text-center">
                
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 mb-6">
                  <BookOpen className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-semibold text-text-primary mb-2">
                  No Courses Found
                </h3>

                <p className="text-text-secondary text-sm max-w-md mb-6">
                  We couldn’t find any courses matching{" "}
                  <span className="font-medium text-text-primary">
                    "{searchTerm}"
                  </span>.
                </p>

                <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-200">
                  Clear Search
                </button>

              </div>
            )}
          </Row>
        </div>
      </main>

      {/* Edit Course Modal */}
      <Modal
        title="Edit Course"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        okText="Save Changes"
        cancelText="Cancel"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            label="Course Title"
            name="title"
            rules={[{ required: true, message: 'Please enter course title' }]}
          >
            <Input placeholder="Enter course title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter course description' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter course description" 
            />
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[{ required: true, message: 'Please select course level' }]}
          >
            <Select placeholder="Select course level">
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default CoursesComp;