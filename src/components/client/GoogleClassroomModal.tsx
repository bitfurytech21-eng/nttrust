import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Plus,
  BookOpen,
  Award,
  Users,
  Calendar,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';
import {
  signInWithGoogleClassroom,
  getCachedClassroomAccessToken,
  listCourses,
  listCourseWork,
  createFinancialCourse,
  createAssignmentInCourse,
  ClassroomCourse,
  CourseWorkItem
} from '../../services/googleClassroom';
import { useBanking } from '../../context/BankingContext';

interface GoogleClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleClassroomModal: React.FC<GoogleClassroomModalProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useBanking();

  const [accessToken, setAccessToken] = useState<string | null>(getCachedClassroomAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'create_course'>('courses');

  // Courses & CourseWork State
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseWorkMap, setCourseWorkMap] = useState<Record<string, CourseWorkItem[]>>({});
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingWork, setIsLoadingWork] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create Course Form State
  const [newCourseName, setNewCourseName] = useState('Northern Trust Wealth Academy: Sovereign Asset Allocation 101');
  const [newCourseSection, setNewCourseSection] = useState('Private Wealth Training Series');
  const [newCourseDesc, setNewCourseDesc] = useState('Advanced curriculum on multi-asset diversification, liquidity sweeps, and tax-efficient wealth preservation.');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [createdCourseSuccess, setCreatedCourseSuccess] = useState<ClassroomCourse | null>(null);

  // New Assignment Form State
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('Case Study: Global Treasury FX Hedging Strategy');
  const [assignmentDesc, setAssignmentDesc] = useState('Analyze the quarterly spot FX conversion model and submit portfolio rebalancing proposal.');
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  useEffect(() => {
    if (isOpen && accessToken) {
      handleLoadCourses();
    }
  }, [isOpen, accessToken]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const token = await signInWithGoogleClassroom();
      setAccessToken(token);
      handleLoadCourses(token);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Classroom Sign-In failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLoadCourses = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;

    setIsLoadingCourses(true);
    setErrorMessage(null);
    try {
      const courseList = await listCourses(token);
      setCourses(courseList);
      if (courseList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courseList[0].id);
        handleLoadCourseWork(courseList[0].id, token);
      }
    } catch (err: any) {
      console.warn('Unable to load courses from Google Classroom:', err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleLoadCourseWork = async (courseId: string, tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;

    setIsLoadingWork(true);
    try {
      const items = await listCourseWork(courseId, token);
      setCourseWorkMap(prev => ({ ...prev, [courseId]: items }));
    } catch (err: any) {
      console.warn(`Unable to fetch coursework for course ${courseId}:`, err);
    } finally {
      setIsLoadingWork(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google Classroom first.');
      return;
    }

    if (!newCourseName.trim()) {
      setErrorMessage('Please provide a course name.');
      return;
    }

    const confirmCreate = window.confirm(
      `Confirm Course Creation?\n\nThis will publish "${newCourseName}" as a active course in your Google Classroom account.`
    );

    if (!confirmCreate) return;

    setIsCreatingCourse(true);
    setErrorMessage(null);
    setCreatedCourseSuccess(null);

    try {
      const newCourse = await createFinancialCourse({
        name: newCourseName,
        section: newCourseSection,
        description: newCourseDesc,
      }, accessToken);

      setCreatedCourseSuccess(newCourse);
      addNotification({
        type: 'security',
        title: 'Google Classroom Course Created',
        message: `Published "${newCourse.name}" in your Google Classroom account.`,
        category: 'system'
      });

      handleLoadCourses();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create course in Google Classroom.');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedCourseId) {
      setErrorMessage('Please select a course first.');
      return;
    }

    if (!assignmentTitle.trim()) {
      setErrorMessage('Please enter assignment title.');
      return;
    }

    const confirmAssignment = window.confirm(
      `Confirm Adding Assignment?\n\nThis will add assignment "${assignmentTitle}" to the selected Google Classroom course.`
    );

    if (!confirmAssignment) return;

    setIsCreatingAssignment(true);
    setErrorMessage(null);

    try {
      await createAssignmentInCourse(selectedCourseId, {
        title: assignmentTitle,
        description: assignmentDesc,
      }, accessToken!);

      addNotification({
        type: 'security',
        title: 'Classroom Assignment Added',
        message: `Successfully posted "${assignmentTitle}" assignment.`,
        category: 'system'
      });

      setShowAddAssignment(false);
      handleLoadCourseWork(selectedCourseId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to add assignment to course.');
    } finally {
      setIsCreatingAssignment(false);
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
          className="bg-white rounded-2xl max-w-2xl w-full border-2 border-[#D8DEE8] p-5 sm:p-6 space-y-4 shadow-2xl text-xs text-[#20242A] max-h-[92vh] overflow-y-auto animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
            <div className="flex items-center gap-2.5 text-[#0B1F6A]">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 flex items-center justify-center shadow-2xs">
                <GraduationCap className="w-5 h-5 stroke-[2.25]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#20242A] leading-none">
                  Google Classroom Wealth Academy Sync
                </h3>
                <span className="text-[11px] text-[#5F6670] font-medium mt-0.5 block">
                  Manage wealth management courses, coursework &amp; financial literacy assignments
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-2xs">
                <GraduationCap className="w-6 h-6 stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#0B1F6A]">Connect Google Workspace Account</h4>
                <p className="text-xs text-[#5F6670] max-w-md mx-auto leading-relaxed">
                  Authorize Northern Trust to connect with your Google Classroom to publish courses, sync class rosters, and manage wealth coursework.
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
                <span>Sign in with Google Classroom</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Active Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] font-extrabold text-xs">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.25]" /> Google Classroom OAuth Active
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                  classroom.courses &amp; coursework.me
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b-2 border-[#F5F7FA] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'courses'
                      ? 'bg-[#0B1F6A] text-white shadow-xs'
                      : 'bg-slate-100 text-[#5F6670] hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4 stroke-[2.25]" />
                  <span>Your Courses ({courses.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create_course')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'create_course'
                      ? 'bg-[#0B1F6A] text-white shadow-xs'
                      : 'bg-slate-100 text-[#5F6670] hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[2.25]" />
                  <span>Publish New Wealth Course</span>
                </button>
              </div>

              {/* TAB 1: COURSES & ASSIGNMENTS */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  {isLoadingCourses ? (
                    <div className="p-8 text-center text-[#5F6670] space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0B1F6A]" />
                      <p className="text-xs font-bold">Loading Google Classroom courses...</p>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-center space-y-2">
                      <BookOpen className="w-8 h-8 text-[#5F6670] mx-auto" />
                      <p className="font-bold text-xs text-[#20242A]">No active courses found</p>
                      <p className="text-[11px] text-[#5F6670]">
                        Click "Publish New Wealth Course" above to create your first Northern Trust course directly in Google Classroom!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Course Selection List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        <span className="font-black text-xs text-[#0B1F6A] block">Select Classroom Course:</span>
                        {courses.map((course) => {
                          const isSelected = selectedCourseId === course.id;
                          return (
                            <div
                              key={course.id}
                              onClick={() => {
                                setSelectedCourseId(course.id);
                                handleLoadCourseWork(course.id);
                              }}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all space-y-1 ${
                                isSelected
                                  ? 'bg-emerald-50/90 border-emerald-400 text-[#147A52]'
                                  : 'bg-white border-[#D8DEE8] text-[#20242A] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-extrabold text-xs truncate max-w-[200px]">{course.name}</h5>
                                {course.alternateLink && (
                                  <a
                                    href={course.alternateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded text-[#0B1F6A] hover:bg-slate-200"
                                    title="Open in Google Classroom"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[10px] text-[#5F6670] font-mono">
                                {course.section || 'General'} • ID: {course.id}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Coursework / Assignments Panel */}
                      <div className="p-3.5 bg-[#F5F7FA] rounded-2xl border-2 border-[#D8DEE8] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
                          <span className="font-black text-xs text-[#0B1F6A]">Course Work &amp; Assignments</span>
                          <button
                            type="button"
                            onClick={() => setShowAddAssignment(!showAddAssignment)}
                            className="px-2.5 py-1 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Task</span>
                          </button>
                        </div>

                        {showAddAssignment && (
                          <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-2 animate-fade-in text-xs">
                            <h6 className="font-bold text-[#147A52]">Post Assignment to Course</h6>
                            <div>
                              <label className="text-[10px] font-bold text-[#5F6670] block">Title</label>
                              <input
                                type="text"
                                value={assignmentTitle}
                                onChange={(e) => setAssignmentTitle(e.target.value)}
                                className="w-full p-2 border border-[#D8DEE8] rounded-lg text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#5F6670] block">Instructions</label>
                              <textarea
                                rows={2}
                                value={assignmentDesc}
                                onChange={(e) => setAssignmentDesc(e.target.value)}
                                className="w-full p-2 border border-[#D8DEE8] rounded-lg text-xs font-medium"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleCreateAssignment}
                              disabled={isCreatingAssignment}
                              className="w-full py-1.5 rounded-lg bg-[#147A52] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {isCreatingAssignment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Publish Assignment</span>
                            </button>
                          </div>
                        )}

                        {isLoadingWork ? (
                          <div className="p-4 text-center text-[#5F6670]">
                            <RefreshCw className="w-4 h-4 animate-spin mx-auto text-[#0B1F6A]" />
                            <span className="text-[11px]">Fetching assignments...</span>
                          </div>
                        ) : selectedCourseId && courseWorkMap[selectedCourseId]?.length ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {courseWorkMap[selectedCourseId].map((work) => (
                              <div key={work.id} className="p-2.5 bg-white rounded-xl border border-[#D8DEE8] space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <h6 className="font-extrabold text-[#20242A] truncate">{work.title}</h6>
                                  {work.alternateLink && (
                                    <a
                                      href={work.alternateLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#0B1F6A] hover:underline"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                {work.description && (
                                  <p className="text-[11px] text-[#5F6670] line-clamp-2">{work.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#5F6670] italic text-center py-4">
                            No assignments posted for this course yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PUBLISH NEW COURSE */}
              {activeTab === 'create_course' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-3">
                    <div>
                      <label className="font-black text-xs text-[#0B1F6A] block mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-semibold bg-white focus:border-[#0B1F6A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-black text-xs text-[#0B1F6A] block mb-1">
                        Section / Department
                      </label>
                      <input
                        type="text"
                        value={newCourseSection}
                        onChange={(e) => setNewCourseSection(e.target.value)}
                        className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-semibold bg-white focus:border-[#0B1F6A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-black text-xs text-[#0B1F6A] block mb-1">
                        Course Overview / Syllabus Summary
                      </label>
                      <textarea
                        rows={3}
                        value={newCourseDesc}
                        onChange={(e) => setNewCourseDesc(e.target.value)}
                        className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-medium bg-white focus:border-[#0B1F6A] focus:outline-none"
                      />
                    </div>
                  </div>

                  {createdCourseSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2 font-black text-sm">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        <span>Course Published to Google Classroom!</span>
                      </div>
                      <p className="text-xs text-[#5F6670] font-medium">
                        "{createdCourseSuccess.name}" is now live. Students and trainees can enroll directly using code or Google Classroom link.
                      </p>
                      {createdCourseSuccess.alternateLink && (
                        <a
                          href={createdCourseSuccess.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#147A52] hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                        >
                          <span>Open Course in Google Classroom</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#D8DEE8] hover:bg-slate-50 text-[#20242A] font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCourse}
                      disabled={isCreatingCourse}
                      className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#0B1F6A]"
                    >
                      {isCreatingCourse ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing Course...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>Publish Course to Google Classroom</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
