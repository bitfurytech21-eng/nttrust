import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ListTodo,
  ExternalLink,
  Tag
} from 'lucide-react';
import {
  signInWithGoogleTasks,
  getCachedTasksAccessToken,
  listTaskLists,
  listTasks,
  createTask,
  toggleTaskStatus,
  deleteTask,
  GoogleTaskList,
  GoogleTaskItem
} from '../../services/googleTasks';
import { useBanking } from '../../context/BankingContext';

interface GoogleTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleTasksModal: React.FC<GoogleTasksModalProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useBanking();

  const [accessToken, setAccessToken] = useState<string | null>(getCachedTasksAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Task Lists State
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('Review Q3 Form 1099-INT Tax Filing & Audit Checklist');
  const [newTaskNotes, setNewTaskNotes] = useState('Verify interest income breakdown for sovereign accounts with PwC CPA team.');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-15');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    if (isOpen && accessToken) {
      handleLoadTaskLists();
    }
  }, [isOpen, accessToken]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const token = await signInWithGoogleTasks();
      setAccessToken(token);
      handleLoadTaskLists(token);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Tasks Sign-In failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLoadTaskLists = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;

    setIsLoadingLists(true);
    setErrorMessage(null);
    try {
      const lists = await listTaskLists(token);
      setTaskLists(lists);
      const defaultId = lists[0]?.id || '@default';
      setSelectedListId(defaultId);
      handleLoadTasks(defaultId, token);
    } catch (err: any) {
      console.warn('Unable to load Google Task lists:', err);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleLoadTasks = async (listId: string, tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;

    setIsLoadingTasks(true);
    setErrorMessage(null);
    try {
      const items = await listTasks(listId, token);
      setTasks(items);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to fetch tasks from Google Tasks.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setErrorMessage('Please sign in with Google Tasks first.');
      return;
    }

    if (!newTaskTitle.trim()) {
      setErrorMessage('Please enter a task title.');
      return;
    }

    setIsCreatingTask(true);
    setErrorMessage(null);

    try {
      const formattedDueDate = newTaskDueDate ? `${newTaskDueDate}T00:00:00.000Z` : undefined;

      const createdItem = await createTask(
        selectedListId,
        {
          title: newTaskTitle,
          notes: newTaskNotes,
          due: formattedDueDate,
        },
        accessToken
      );

      addNotification({
        type: 'security',
        title: 'Google Task Created',
        message: `Added task "${createdItem.title}" to Google Tasks.`,
        category: 'system'
      });

      setShowAddTask(false);
      setNewTaskTitle('');
      setNewTaskNotes('');
      handleLoadTasks(selectedListId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create task in Google Tasks.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (task: GoogleTaskItem) => {
    if (!accessToken) return;

    const isCompleted = task.status === 'completed';
    const newStatus = !isCompleted;

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: newStatus ? 'completed' : 'needsAction' } : t))
    );

    try {
      await toggleTaskStatus(selectedListId, task.id, newStatus, accessToken);
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      // Revert on error
      handleLoadTasks(selectedListId);
    }
  };

  const handleDeleteTask = async (task: GoogleTaskItem) => {
    if (!accessToken) return;

    const confirmed = window.confirm(
      `Delete Task?\n\nAre you sure you want to permanently delete "${task.title}" from Google Tasks?`
    );

    if (!confirmed) return;

    setTasks(prev => prev.filter(t => t.id !== task.id));

    try {
      await deleteTask(selectedListId, task.id, accessToken);
      addNotification({
        type: 'security',
        title: 'Task Deleted',
        message: `Deleted "${task.title}" from Google Tasks.`,
        category: 'system'
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete task.');
      handleLoadTasks(selectedListId);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-xl w-full border-2 border-[#D8DEE8] p-5 sm:p-6 space-y-4 shadow-2xl text-xs text-[#20242A] max-h-[92vh] overflow-y-auto animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
            <div className="flex items-center gap-2.5 text-[#0B1F6A]">
              <div className="w-9 h-9 rounded-xl bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] flex items-center justify-center shadow-2xs">
                <ListTodo className="w-5 h-5 stroke-[2.25]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#20242A] leading-none">
                  Google Tasks Wealth &amp; Compliance Center
                </h3>
                <span className="text-[11px] text-[#5F6670] font-medium mt-0.5 block">
                  Synchronize banking action items, wire approvals &amp; audit checklists directly with Google Tasks
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Authentication Card */}
          {!accessToken ? (
            <div className="p-6 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1F6A]/10 text-[#0B1F6A] flex items-center justify-center mx-auto border-2 border-[#0B1F6A]/20 shadow-2xs">
                <ListTodo className="w-6 h-6 stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#0B1F6A]">Connect Google Workspace Account</h4>
                <p className="text-xs text-[#5F6670] max-w-md mx-auto leading-relaxed">
                  Authorize Northern Trust to create, sync, and manage your banking and compliance action items directly inside Google Tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-extrabold text-xs inline-flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer border border-[#0B1F6A]"
              >
                {isSigningIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3.03.56 4.15 1.48l3.1-3.1C17.37 1.7 14.85 1 12 1 7.42 1 3.51 3.6 1.63 7.37l3.65 2.83C6.16 7.22 8.82 5 12 5z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.64 2.83c2.13-1.97 3.78-4.88 3.78-8.65z"/>
                    <path fill="#FBBC05" d="M5.28 14.8c-.25-.76-.4-1.56-.4-2.8s.15-2.04.4-2.8L1.63 6.37C.59 8.47 0 10.67 0 13s.59 4.53 1.63 6.63l3.65-2.83z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.95-1.07 7.94-2.91l-3.64-2.83c-1.07.72-2.44 1.15-4.3 1.15-3.18 0-5.84-2.22-6.72-5.2L1.63 16.2C3.51 19.97 7.42 23 12 23z"/>
                  </svg>
                )}
                <span>Sign in with Google Tasks</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active OAuth Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] font-extrabold text-xs">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.25]" /> Google Tasks Sync Active
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                  tasks &amp; tasks.readonly
                </span>
              </div>

              {/* Task List Selector & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F7FA] p-3 rounded-2xl border-2 border-[#D8DEE8]">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-bold text-xs text-[#0B1F6A] shrink-0">Select List:</span>
                  <select
                    value={selectedListId}
                    onChange={(e) => {
                      setSelectedListId(e.target.value);
                      handleLoadTasks(e.target.value);
                    }}
                    className="p-2 border-2 border-[#D8DEE8] rounded-xl text-xs font-extrabold bg-white text-[#20242A] focus:border-[#0B1F6A] focus:outline-none w-full sm:w-auto"
                  >
                    {taskLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadTasks(selectedListId)}
                    disabled={isLoadingTasks}
                    className="p-2 rounded-xl bg-white border-2 border-[#D8DEE8] hover:bg-slate-50 text-[#0B1F6A] transition-all cursor-pointer shadow-2xs"
                    title="Refresh Tasks"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingTasks ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="px-3.5 py-2 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>New Banking Task</span>
                  </button>
                </div>
              </div>

              {/* Add New Task Form */}
              {showAddTask && (
                <form onSubmit={handleCreateTask} className="p-4 rounded-2xl bg-slate-50 border-2 border-emerald-300 space-y-3 animate-fade-in text-xs shadow-2xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-black text-xs text-[#147A52] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Create Task in Google Tasks
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="text-[#5F6670] hover:text-[#20242A]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="font-black text-[11px] text-[#20242A] block mb-1">Task Title</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Confirm Wire Transfer #8841-NYC"
                      className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-semibold bg-white focus:border-[#147A52] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-black text-[11px] text-[#20242A] block mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full p-2 border-2 border-[#D8DEE8] rounded-xl text-xs font-semibold bg-white focus:border-[#147A52] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-black text-[11px] text-[#20242A] block mb-1">Task Details / Notes</label>
                      <input
                        type="text"
                        value={newTaskNotes}
                        onChange={(e) => setNewTaskNotes(e.target.value)}
                        placeholder="Additional details..."
                        className="w-full p-2 border-2 border-[#D8DEE8] rounded-xl text-xs font-medium bg-white focus:border-[#147A52] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-[#D8DEE8] text-[#20242A] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingTask}
                      className="px-5 py-1.5 rounded-lg bg-[#147A52] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      {isCreatingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Save Task</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {isLoadingTasks ? (
                  <div className="p-8 text-center text-[#5F6670] space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0B1F6A]" />
                    <p className="text-xs font-bold">Synchronizing with Google Tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-center space-y-2">
                    <ListTodo className="w-8 h-8 text-[#5F6670] mx-auto" />
                    <p className="font-bold text-xs text-[#20242A]">No tasks found in this list</p>
                    <p className="text-[11px] text-[#5F6670]">
                      Click "New Banking Task" above to add your first task to Google Tasks!
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 ${
                          isCompleted
                            ? 'bg-slate-50/80 border-slate-200 text-slate-400 opacity-75'
                            : 'bg-white border-[#D8DEE8] text-[#20242A] hover:border-[#0B1F6A] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            className="mt-0.5 text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isCompleted ? (
                              <CheckSquare className="w-5 h-5 text-[#147A52] stroke-[2.5]" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400 stroke-[2]" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <h5 className={`font-extrabold text-xs ${isCompleted ? 'line-through text-slate-400' : 'text-[#20242A]'}`}>
                              {task.title}
                            </h5>
                            {task.notes && (
                              <p className={`text-[11px] font-medium leading-relaxed ${isCompleted ? 'line-through text-slate-300' : 'text-[#5F6670]'}`}>
                                {task.notes}
                              </p>
                            )}
                            {task.due && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold">
                                <Calendar className="w-3 h-3 text-amber-700" />
                                <span>Due: {new Date(task.due).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
