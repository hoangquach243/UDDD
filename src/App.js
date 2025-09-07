import React, { useState, useEffect } from 'react';
import { Plus,   User, Calendar,  Search,  Trash2, MessageSquare, Bell, Users, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

const HotelTaskManager = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeDetailModal, setShowEmployeeDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = [
    { id: 'reception', name: 'Lễ tân', color: 'bg-blue-100 text-blue-800' },
    { id: 'housekeeping', name: 'Buồng phòng', color: 'bg-green-100 text-green-800' },
    { id: 'management', name: 'Quản gia', color: 'bg-purple-100 text-purple-800' },
    { id: 'maintenance', name: 'Kỹ thuật', color: 'bg-orange-100 text-orange-800' },
    { id: 'restaurant', name: 'Nhà hàng', color: 'bg-red-100 text-red-800' }
  ];

  const priorities = [
    { id: 'low', name: 'Thấp', color: 'bg-gray-100 text-gray-800' },
    { id: 'medium', name: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: 'Cao', color: 'bg-red-100 text-red-800' },
    { id: 'urgent', name: 'Khẩn cấp', color: 'bg-red-200 text-red-900' }
  ];

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: 'housekeeping',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: 'housekeeping',
    phone: '',
    shift: 'morning'
  });

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('hotelTasks');
    const savedEmployees = localStorage.getItem('hotelEmployees');
    const savedNotifications = localStorage.getItem('hotelNotifications');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      // Sample employees
      const sampleEmployees = [
        { id: 1, name: 'Nguyễn Thị Lan', department: 'housekeeping', phone: '0123456789', shift: 'morning', isOnline: true },
        { id: 2, name: 'Trần Văn Nam', department: 'housekeeping', phone: '0987654321', shift: 'afternoon', isOnline: false },
        { id: 3, name: 'Lê Thị Hoa', department: 'housekeeping', phone: '0456789123', shift: 'morning', isOnline: true },
        { id: 4, name: 'Phạm Văn Đức', department: 'reception', phone: '0789123456', shift: 'evening', isOnline: true }
      ];
      setEmployees(sampleEmployees);
      localStorage.setItem('hotelEmployees', JSON.stringify(sampleEmployees));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('hotelTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('hotelEmployees', JSON.stringify(employees));
    }
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hotelNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const login = (role, employeeName = null) => {
    const user = {
      role: role,
      name: role === 'manager' ? 'Quản lý' : employeeName,
      employeeId: role === 'employee' ? employees.find(emp => emp.name === employeeName)?.id : null
    };
    setCurrentUser(user);
    setShowLogin(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setShowLogin(true);
  };

  const addNotification = (type, message, targetRole, targetEmployeeId = null) => {
    const notification = {
      id: Date.now(),
      type: type,
      message: message,
      targetRole: targetRole,
      targetEmployeeId: targetEmployeeId,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const assignedEmployee = employees.find(emp => emp.name === newTask.assignedTo);
    
    const task = {
      ...newTask,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      notes: []
    };
    
    setTasks([...tasks, task]);
    
    // Thông báo cho nhân viên được giao việc
    if (assignedEmployee) {
      addNotification(
        'new_task',
        `Bạn có công việc mới: "${newTask.title}"`,
        'employee',
        assignedEmployee.id
      );
    }
    
    setNewTask({
      title: '',
      description: '',
      department: 'housekeeping',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    });
    setShowAddTask(false);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
    ));

    // Thông báo cho quản lý khi nhân viên hoàn thành công việc
    if (newStatus === 'completed' && currentUser.role === 'employee') {
      addNotification(
        'task_completed',
        `Nhân viên ${currentUser.name} đã hoàn thành: "${task.title}"`,
        'manager'
      );
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addEmployee = () => {
    if (!newEmployee.name.trim()) return;
    
    const employee = {
      ...newEmployee,
      id: Date.now(),
      isOnline: false
    };
    
    setEmployees([...employees, employee]);
    setNewEmployee({
      name: '',
      department: 'housekeeping',
      phone: '',
      shift: 'morning'
    });
    setShowEmployeeModal(false);
  };

  const addNote = (taskId, note) => {
    if (!note.trim()) return;
    
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            notes: [...(task.notes || []), {
              id: Date.now(),
              text: note,
              timestamp: new Date().toISOString(),
              author: currentUser.name
            }]
          }
        : task
    ));
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Lọc theo vai trò
    if (currentUser.role === 'employee') {
      const employeeName = currentUser.name;
      filtered = filtered.filter(task => task.assignedTo === employeeName);
    }

    return filtered.filter(task => {
      const deptMatch = selectedDepartment === 'all' || task.department === selectedDepartment;
      const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
      const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      return deptMatch && statusMatch && searchMatch;
    });
  };

  const getUserNotifications = () => {
    return notifications.filter(notif => {
      if (currentUser.role === 'manager') {
        return notif.targetRole === 'manager';
      } else {
        return notif.targetRole === 'employee' && notif.targetEmployeeId === currentUser.employeeId;
      }
    });
  };

  const getUnreadCount = () => {
    return getUserNotifications().filter(notif => !notif.isRead).length;
  };

  if (showLogin) {
    return <LoginScreen employees={employees} onLogin={login} />;
  }

  const filteredTasks = getFilteredTasks();
  const userNotifications = getUserNotifications();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentUser.role === 'manager' ? 'Quản lý khách sạn' : 'Công việc của tôi'}
            </h1>
            <p className="text-gray-600">Chào {currentUser.name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <Bell size={24} />
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getUnreadCount()}
                  </span>
                )}
              </button>
              
              {/* Notification dropdown */}
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                <div className="p-3 border-b">
                  <h3 className="font-semibold">Thông báo</h3>
                </div>
                {userNotifications.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">Không có thông báo</div>
                ) : (
                  userNotifications.slice(0, 5).map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1 rounded-full ${notif.type === 'new_task' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          {notif.type === 'new_task' ? <AlertCircle size={16} className="text-blue-600" /> : <CheckCircle size={16} className="text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-500">{new Date(notif.timestamp).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Manager View */}
      {currentUser.role === 'manager' && (
        <>
          {/* Manager Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                onClick={() => {
                  setShowAddTask(true);
                  setSelectedEmployee(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={20} />
                Thêm công việc
              </button>
              
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Users size={20} />
                Quản lý nhân viên
              </button>
            </div>

            {/* Employee List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.filter(emp => emp.department === 'housekeeping').map(employee => (
                <EmployeeCard 
                  key={employee.id} 
                  employee={employee} 
                  tasks={tasks.filter(task => task.assignedTo === employee.name)}
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowEmployeeDetailModal(true);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên công việc..."
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bộ phận</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="form-select"
            >
              <option value="all">Tất cả bộ phận</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Tổng: {filteredTasks.length} công việc
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && currentUser.role === 'manager' && (
        <AddTaskForm 
          newTask={newTask}
          setNewTask={setNewTask}
          employees={employees}
          departments={departments}
          priorities={priorities}
          onAdd={addTask}
          onCancel={() => setShowAddTask(false)}
        />
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <EmployeeModal 
          newEmployee={newEmployee}
          setNewEmployee={setNewEmployee}
          departments={departments}
          onAdd={addEmployee}
          onCancel={() => setShowEmployeeModal(false)}
        />
      )}

      {/* Employee Detail Modal */}
      {showEmployeeDetailModal && selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          tasks={tasks.filter(task => task.assignedTo === selectedEmployee.name)}
          onClose={() => {
            setShowEmployeeDetailModal(false);
            setSelectedEmployee(null);
          }}
          onAddTask={(taskData) => {
            const task = {
              ...taskData,
              id: Date.now(),
              createdAt: new Date().toISOString(),
              createdBy: currentUser.name,
              notes: [],
              assignedTo: selectedEmployee.name,
              department: selectedEmployee.department
            };
            
            setTasks([...tasks, task]);
            
            // Thông báo cho nhân viên được giao việc
            addNotification(
              'new_task',
              `Bạn có công việc mới: "${taskData.title}"`,
              'employee',
              selectedEmployee.id
            );
          }}
          onDeleteTask={deleteTask}
          onUpdateTaskStatus={updateTaskStatus}
          priorities={priorities}
          currentUser={currentUser}
        />
      )}

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            currentUser={currentUser}
            updateTaskStatus={updateTaskStatus}
            deleteTask={deleteTask}
            addNote={addNote}
            departments={departments}
            priorities={priorities}
          />
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-lg">Không có công việc nào</div>
            <div className="text-gray-500 text-sm mt-1">
              {currentUser.role === 'employee' 
                ? 'Bạn chưa có công việc nào được giao'
                : 'Bắt đầu bằng cách tạo công việc mới'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ employees, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('manager');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const handleLogin = () => {
    if (selectedRole === 'manager') {
      onLogin('manager');
    } else if (selectedEmployee) {
      onLogin('employee', selectedEmployee);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập hệ thống</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Vai trò</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-select"
          >
            <option value="manager">Quản lý</option>
            <option value="employee">Nhân viên</option>
          </select>
        </div>

        {selectedRole === 'employee' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chọn nhân viên</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="form-select"
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.filter(emp => emp.department === 'housekeeping').map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={selectedRole === 'employee' && !selectedEmployee}
          className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

// Employee Card Component
const EmployeeCard = ({ employee, tasks, onClick }) => {
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  return (
    <div 
      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all card-hover"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{employee.name}</h4>
        <div className={`w-3 h-3 rounded-full ${employee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        <div>Ca: {employee.shift === 'morning' ? 'Sáng' : employee.shift === 'afternoon' ? 'Chiều' : 'Tối'}</div>
        <div>SĐT: {employee.phone}</div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-yellow-600 font-semibold">{pendingTasks}</div>
          <div>Chờ</div>
        </div>
        <div className="text-center">
          <div className="text-blue-600 font-semibold">{inProgressTasks}</div>
          <div>Đang làm</div>
        </div>
        <div className="text-center">
          <div className="text-green-600 font-semibold">{completedTasks}</div>
          <div>Xong</div>
        </div>
      </div>
    </div>
  );
};

// Add Task Form Component
const AddTaskForm = ({ newTask, setNewTask, employees, departments, priorities, onAdd, onCancel }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Thêm công việc mới</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên công việc *</label>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            placeholder="Nhập tên công việc..."
            className="form-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Nhân viên</label>
          <select
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
            className="form-select"
          >
            <option value="">-- Chọn nhân viên --</option>
            {employees.filter(emp => emp.department === 'housekeeping').map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Độ ưu tiên</label>
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            className="form-select"
          >
            {priorities.map(priority => (
              <option key={priority.id} value={priority.id}>{priority.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Ngày hết hạn</label>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
            className="form-input"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            placeholder="Chi tiết công việc..."
            rows="3"
            className="form-textarea"
          />
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button onClick={onAdd} className="btn-success">
          Thêm công việc
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
      </div>
    </div>
  );
};

// Employee Modal Component
const EmployeeModal = ({ newEmployee, setNewEmployee, departments, onAdd, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Thêm nhân viên mới</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên *</label>
            <input
              type="text"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              placeholder="Nhập họ tên..."
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              placeholder="Nhập số điện thoại..."
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ca làm việc</label>
            <select
              value={newEmployee.shift}
              onChange={(e) => setNewEmployee({...newEmployee, shift: e.target.value})}
              className="form-select"
            >
              <option value="morning">Ca sáng</option>
              <option value="afternoon">Ca chiều</option>
              <option value="evening">Ca tối</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button onClick={onAdd} className="btn-success">
            Thêm nhân viên
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Employee Detail Modal Component
const EmployeeDetailModal = ({ employee, tasks, onClose, onAddTask, onDeleteTask, onUpdateTaskStatus, priorities, currentUser }) => {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    onAddTask(newTask);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    });
    setShowAddTaskForm(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xử lý';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  };

  const getPriorityInfo = (priorityId) => {
    return priorities.find(p => p.id === priorityId) || { name: priorityId, color: 'bg-gray-100 text-gray-800' };
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chi tiết nhân viên: {employee.name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div>Bộ phận: <span className="font-medium">Buồng phòng</span></div>
                  <div>Ca làm việc: <span className="font-medium">
                    {employee.shift === 'morning' ? 'Sáng' : employee.shift === 'afternoon' ? 'Chiều' : 'Tối'}
                  </span></div>
                </div>
                <div>
                  <div>SĐT: <span className="font-medium">{employee.phone}</span></div>
                  <div className="flex items-center gap-2">
                    Trạng thái: 
                    <div className={`w-2 h-2 rounded-full ${employee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="font-medium">{employee.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
              <div className="text-sm text-yellow-700">Chờ xử lý</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
              <div className="text-sm text-blue-700">Đang thực hiện</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-sm text-green-700">Hoàn thành</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 200px)'}}>
          {/* Add Task Button */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Danh sách công việc ({tasks.length})</h4>
            <button
              onClick={() => setShowAddTaskForm(!showAddTaskForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm công việc
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTaskForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h5 className="font-semibold mb-3">Thêm công việc mới cho {employee.name}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên công việc *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Nhập tên công việc..."
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Độ ưu tiên</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="form-select"
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>{priority.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Chi tiết công việc..."
                    rows="3"
                    className="form-textarea"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddTask} className="btn-success">
                  Thêm công việc
                </button>
                <button onClick={() => setShowAddTaskForm(false)} className="btn-secondary">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg">Chưa có công việc nào</div>
                <div className="text-sm">Thêm công việc đầu tiên cho nhân viên này</div>
              </div>
            ) : (
              tasks.map(task => {
                const priorityInfo = getPriorityInfo(task.priority);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                
                return (
                  <div key={task.id} className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h6 className="font-semibold text-gray-800">{task.title}</h6>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                        title="Xóa công việc"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                          Quá hạn
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'in-progress')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Bắt đầu
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {task.status !== 'cancelled' && task.status !== 'completed' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'cancelled')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, currentUser, updateTaskStatus, deleteTask, addNote, departments, priorities }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');

  const getDepartmentInfo = (deptId) => {
    return departments.find(d => d.id === deptId) || { name: deptId, color: 'bg-gray-100 text-gray-800' };
  };

  const getPriorityInfo = (priorityId) => {
    return priorities.find(p => p.id === priorityId) || { name: priorityId, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xử lý';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  };

  const departmentInfo = getDepartmentInfo(task.department);
  const priorityInfo = getPriorityInfo(task.priority);

  const handleAddNote = () => {
    addNote(task.id, newNote);
    setNewNote('');
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${departmentInfo.color}`}>
              {departmentInfo.name}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
              {priorityInfo.name}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                Quá hạn
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User size={14} />
                {task.assignedTo}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(task.dueDate).toLocaleDateString('vi-VN')}
              </div>
            )}
            {task.notes && task.notes.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                {task.notes.length} ghi chú
              </div>
            )}
          </div>
        </div>
        
        {currentUser.role === 'manager' && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-600 hover:text-red-800"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {currentUser.role === 'employee' && task.assignedTo === currentUser.name && (
          <>
            {task.status === 'pending' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'in-progress')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Bắt đầu
              </button>
            )}
            {task.status === 'in-progress' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'completed')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Hoàn thành
              </button>
            )}
          </>
        )}
        
        {currentUser.role === 'manager' && (
          <>
            {task.status === 'pending' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'in-progress')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Bắt đầu
              </button>
            )}
            {task.status === 'in-progress' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'completed')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Hoàn thành
              </button>
            )}
            {task.status !== 'cancelled' && task.status !== 'completed' && (
              <button
                onClick={() => updateTaskStatus(task.id, 'cancelled')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Hủy
              </button>
            )}
          </>
        )}
        
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
        >
          {showNotes ? 'Ẩn ghi chú' : 'Ghi chú'}
        </button>
      </div>
      
      {showNotes && (
        <div className="border-t pt-3">
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Thêm ghi chú..."
                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
          
          {task.notes && task.notes.length > 0 && (
            <div className="space-y-2">
              {task.notes.map(note => (
                <div key={note.id} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="text-gray-800">{note.text}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {note.author} - {new Date(note.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <HotelTaskManager />
    </div>
  );
}

export default App;