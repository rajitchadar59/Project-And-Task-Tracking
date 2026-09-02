import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

import CreateTaskForm from '../components/CreateTaskForm';
import TaskCard from '../components/TaskCard';
import BatchUpdateBar from '../components/BatchUpdateBar';
import './ProjectView.css';

const ProjectView = () => {
  const { id: projectId } = useParams();
  const { role, userId } = useAuth(); 

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState([]); 
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: [], dependencies: []
  });

  const [selectedBatchTasks, setSelectedBatchTasks] = useState([]);
  const [batchStatus, setBatchStatus] = useState('');
  const [batchAssignees, setBatchAssignees] = useState([]); 

  const [openTimelines, setOpenTimelines] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await axios.get(`/projects/${projectId}`);
      setProject(data);
    } catch {
      toast.error("Failed to load project details");
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`/tasks/project/${projectId}`);
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tasks', {
        title, description, priority, dueDate: dueDate || null,
        project: projectId, assignedTo, dependencies: selectedDependencies
      });
      setTitle(''); setDescription(''); setDueDate('');
      setAssignedTo([]); setSelectedDependencies([]);
      fetchTasks();
      toast.success("Task created");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo ? task.assignedTo.map(u => u._id || u) : [],
      dependencies: task.dependencies ? task.dependencies.map(d => d._id || d) : []
    });
  };

  const submitEdit = async (taskId) => {
    try {
      await axios.patch(`/tasks/${taskId}`, editForm);
      setEditingTaskId(null);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated'));
      toast.success("Task updated");
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      if(newStatus === 'Done') window.dispatchEvent(new Event('alertsUpdated'));
    } catch (err) {
      if (err.response?.data?.blockingTasks) {
        toast.error(`Cannot complete! Blocking Tasks: ${err.response.data.blockingTasks.join(', ')}`, { duration: 5000 });
      } else {
        toast.error(err.response?.data?.error || 'Failed to update status');
      }
      fetchTasks(); 
    }
  };

  const handleDeleteTask = async (taskId) => {
    if(!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/tasks/${taskId}`);
      fetchTasks();
      setSelectedBatchTasks(prev => prev.filter(id => id !== taskId));
      window.dispatchEvent(new Event('alertsUpdated'));
      toast.success("Task deleted");
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const toggleBatchTask = (taskId) => {
    setSelectedBatchTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleBatchUpdate = async () => {
    if (selectedBatchTasks.length === 0) return;
    const updates = {};
    if (batchStatus) updates.status = batchStatus;
    if (batchAssignees.length > 0) updates.assignedTo = batchAssignees;

    try {
      const { data } = await axios.patch('/tasks/batch', { taskIds: selectedBatchTasks, updates });
      toast.success(`Updated: ${data.successful.length}, Failed: ${data.failed.length}`);
      setSelectedBatchTasks([]); setBatchStatus(''); setBatchAssignees([]);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated'));
    } catch (err) {
      toast.error('Failed to process batch update.');
    }
  };

  const toggleTimeline = (taskId) => {
    setOpenTimelines(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleCommentChange = (taskId, text) => {
    setComments(prev => ({ ...prev, [taskId]: text }));
  };

  const handleAddComment = async (taskId) => {
    if (!comments[taskId]?.trim()) return;
    try {
      await axios.post(`/tasks/${taskId}/comments`, { comment: comments[taskId] });
      setComments(prev => ({ ...prev, [taskId]: '' }));
      fetchTasks();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDismissAlert = async (taskId) => {
    try {
      await axios.post(`/tasks/${taskId}/dismiss-alert`);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated'));
    } catch (err) {
      toast.error('Failed to dismiss alert');
    }
  };

  if (!project) return <div className="page-loader">Loading project...</div>;

  return (
    <div className="project-view-container" style={{ paddingBottom: selectedBatchTasks.length > 0 ? '100px' : '40px' }}>
      
      <div className="project-view-header">
        <div>
          <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
          <h2 className="project-view-title">{project.name}</h2>
        </div>
      </div>

      {role === 'Manager' && (
        <CreateTaskForm 
          onSubmit={handleCreateTask}
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          priority={priority} setPriority={setPriority}
          dueDate={dueDate} setDueDate={setDueDate}
          projectMembers={project.members} tasks={tasks}
          assignedTo={assignedTo} setAssignedTo={setAssignedTo}
          selectedDependencies={selectedDependencies} setSelectedDependencies={setSelectedDependencies}
        />
      )}

      <div className="section-title">
        <h3>Project Tasks</h3>
      </div>

      <div className="tasks-grid">
        {tasks.map(task => (
          <TaskCard 
            key={task._id}
            task={task} role={role} userId={userId}
            isEditing={editingTaskId === task._id}
            editForm={editForm} setEditForm={setEditForm}
            onSaveEdit={submitEdit} onCancelEdit={() => setEditingTaskId(null)} onStartEdit={startEditing}
            onDelete={handleDeleteTask} onStatusChange={handleStatusChange} onDismissAlert={handleDismissAlert}
            projectMembers={project.members} allTasks={tasks}
            isSelectedForBatch={selectedBatchTasks.includes(task._id)}
            onToggleBatchTask={toggleBatchTask}
            isTimelineOpen={openTimelines.includes(task._id)}
            onToggleTimeline={toggleTimeline}
            commentText={comments[task._id]}
            onCommentChange={handleCommentChange}
            onAddComment={handleAddComment}
          />
        ))}
        {tasks.length === 0 && (
          <div className="tasks-empty">No tasks have been created in this project yet.</div>
        )}
      </div>

      <BatchUpdateBar 
        selectedCount={selectedBatchTasks.length}
        batchStatus={batchStatus} setBatchStatus={setBatchStatus}
        batchAssignees={batchAssignees} setBatchAssignees={setBatchAssignees}
        projectMembers={project.members} role={role}
        onApply={handleBatchUpdate}
        onClear={() => { setSelectedBatchTasks([]); setBatchAssignees([]); setBatchStatus(''); }}
      />
    </div>
  );
};

export default ProjectView;