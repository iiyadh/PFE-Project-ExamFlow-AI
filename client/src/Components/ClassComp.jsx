import { Avatar, Button, Input ,Dropdown, Tooltip} from 'antd';
import { FolderOutlined, EllipsisOutlined, PlusOutlined ,EditOutlined  ,DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import ClassModal from './ClassModal';
import DriveFilesModal from "../Components/DriveFilesModal";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import api from '../lib/api';

const classes = [
  {
    _id: '1',
    title: 'Développement Mobile',
    subtitle: 'abdelkader maatallah',
    color: 'bg-emerald-500',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    _id: '2',
    title: 'Big Data',
    subtitle: 'abdelkader maatallah',
    color: 'bg-emerald-500',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    _id: '3',
    title: 'Architecture orientée services',
    subtitle: 'abdelkader maatallah',
    color: 'bg-blue-600',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    _id: '4',
    title: 'DSI 3 Promo 2025-2026',
    subtitle: 'Hathem Hafsi',
    color: 'bg-teal-500',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    _id: '5',
    title: "TEST D'APPLICATION",
    subtitle: 'DSI 21-22-23',
    color: 'bg-emerald-500',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    initial: 'M',
  },
  {
    _id: '6',
    title: 'Python avancé',
    subtitle: 'DSI21 - 2024/2025',
    color: 'bg-slate-600',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    _id: '7',
    title: 'Atelier JEE',
    subtitle: 'DSI21 - 2024/2025',
    color: 'bg-orange-500',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    _id: '8',
    title: 'Solutions Lab Club',
    subtitle: 'Problem solving & Competitive programming',
    color: 'bg-purple-600',
    description : 'Explore the world of mobile app development with our comprehensive course.',
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
];

const ClassComp = () => {
    const [classesData, setClassesData] = useState(classes);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredClasses, setFilteredClasses] = useState(classes);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedClass, setSelectedClass] = useState(null);
    const [driveModalOpen, setDriveModalOpen] = useState(false);
    const [driveClass, setDriveClass] = useState(null);
    const { role } = useAuthStore();
    const { pfpUrl } = useUserStore();
    const navigate = useNavigate();
    
    const fetchTeacherClasses = async () =>{
      try{
        const res = await api.get('/class/teacher');
        const data = res.data;
        const classesWithAvatar = data.map(clas => ({
          ...clas,
          avatar: pfpUrl,
          initial: clas.title.charAt(0).toUpperCase(),
        }));
        setClassesData(classesWithAvatar);
        setFilteredClasses(classesWithAvatar);
      }catch(err){
        console.error('Error fetching classes:', err);
      }
    }

    useEffect(() => {
      if(role === 'teacher') {
        fetchTeacherClasses();
      }
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.trim() === '') {
            setFilteredClasses(classesData);
        }
        else {
            const filtered = classesData.filter(clas =>
                clas.title.toLowerCase().includes(term.toLowerCase()) || clas.subtitle.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredClasses(filtered);
        }
    };

    const handleSubmit = async (data) => {
        if (modalMode === 'create') {
            const newClass = {
                title: data.title,
                subtitle: data.subtitle,
                color: data.color || 'bg-emerald-500',
                description: data.description,
            };
            const res = await api.post('/class', newClass); 
            const createdClass = {...res.data, avatar: pfpUrl};
            const updated = [...classesData, createdClass];
            setClassesData(updated);
            setFilteredClasses(updated);
        }
        else if (modalMode === 'edit' && selectedClass) {
            await api.put(`/class/${selectedClass._id}`, data);
            const updatedClasses = classesData.map(clas =>
                clas._id === selectedClass._id ? { ...clas, ...data } : clas
            );
            setClassesData(updatedClasses);
            setFilteredClasses(updatedClasses);
        }
        setModalOpen(false);
    };

    const handleDelete = async (id) => {
      try{
          await api.delete(`/class/${id}`);
          const updatedClasses = classesData.filter(clas => clas._id !== id);
          setClassesData(updatedClasses);
          setFilteredClasses(updatedClasses);
          setModalOpen(false);
      }catch(err){
        console.error('Error deleting class:', err);
      }
    };



  return (
    <div className="bg-bg p-8">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="w-full md:w-auto">
                        <h1 className="w-75 text-2xl sm:text-3xl font-bold text-text mb-2">My Classes</h1>
                        <p className="text-text-secondary">Explore your classes</p>
                    </div>
                    <Input
                            placeholder="Search classes..."
                            allowClear
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-[50%] md:w-75 lg:w-100 xl:w-125 px-5! py-2.5!"
                    />

                    {role === 'teacher' &&
                    <Button
                            type="primary"
                            size="large"
                            className="flex items-center justify-center gap-2 w-full md:w-auto"
                            icon={<PlusOutlined />}
                            onClick={() => { setModalMode('create'); setSelectedClass(null); setModalOpen(true) }}
                    >
                            Create New Class
                    </Button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredClasses.map((clas) => (
                    <div
                        key={clas._id}
                        className="bg-surface rounded-lg shadow-sm hover:shadow-md hover:scale-105 hover:cursor-pointer transition-all duration-300 overflow-hidden border border-border"
                        onClick={()=>navigate(`/${role}/courses/${clas._id}`)}
                    >
                        {/* Card Header */}
                        <div className={`${clas.color} p-6 relative min-h-40 flex items-start justify-between`}>
                            <div className="pr-12 flex-1">
                                <h2 className="text-white font-semibold text-lg leading-tight mb-1">
                                    {clas.title}
                                </h2>
                                <p className="text-white text-sm opacity-90">{clas.subtitle}</p>
                            </div>

                {/* Avatar */}
                <div className="absolute top-4 right-4">
                  {clas.avatar ? (
                    <Avatar
                      size={56}
                      src={clas.avatar}
                      style={{
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    />
                  ) : (
                    <Avatar
                      size={56}
                      style={{
                        backgroundColor: '#fff',
                        color: clas.color.replace('bg-', ''),
                        fontSize: 24,
                        fontWeight: 'bold',
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      {clas.initial}
                    </Avatar>
                  )}
                </div>
              </div>

              {/* Card Body - Empty space */}
              <div className="h-24 bg-surface">
                {clas.description && (
                    <p className="p-4 text-sm text-text-secondary line-clamp-3">
                        {clas.description}
                    </p>
                )}
                {!clas.description && (
                    <div className="p-4 text-sm text-text-secondary italic">
                        No description provided.
                    </div>
                )}
              </div>
            {
              role === 'teacher' && (
                <div className="border-t border-border p-4 flex items-center justify-center gap-6" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="text-text-muted hover:text-text-secondary transition-colors"
                    onClick={() => { setDriveClass(clas); setDriveModalOpen(true); }}
                  >
                    <Tooltip title="Explore Google Drive Files" placement="top">
                      <FolderOutlined className="text-lg" />
                    </Tooltip>
                  </button>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: '2',
                          label: 'Edit Class',
                          icon: <EditOutlined />,
                          onClick: () => { setModalMode('edit'); setSelectedClass(clas); setModalOpen(true) }
                        },
                        {
                          key: '3',
                          label: 'Delete Class',
                          danger: true,
                          icon: <DeleteOutlined />,
                          onClick: () => { setModalMode('delete'); setSelectedClass(clas); setModalOpen(true) }
                        },
                      ],
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                    arrow
                    className="cursor-pointer"
                  >
                    <div className="text-text-muted hover:text-text-secondary transition-colors">
                      <EllipsisOutlined className="text-lg text-text-muted hover:text-text-secondary transition-colors" />
                    </div>
                  </Dropdown>
                </div>)
            }
          </div>
          ))}
          {filteredClasses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-surface rounded-2xl shadow-sm px-10 py-12 flex flex-col items-center max-w-md">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-6">
                  <FolderOutlined className="text-3xl text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  No Classes Found
                </h3>
                <p className="text-text-secondary text-sm mb-6">
                  You don’t have any classes yet. Create one to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    <ClassModal
        mode={modalMode}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classData={selectedClass}
        onSubmit={(data) => handleSubmit(data)}
        onDelete={(id) => handleDelete(id)}
    />
    <DriveFilesModal
        open={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        classData={driveClass}
    />
    </div>
  );
}

export default ClassComp;