import React, { useState, useEffect } from 'react';
import { getCVData, updateCVData, signInWithGoogle, signOutUser, isAuthenticated, isAdmin, getCurrentUser } from '../services/api';
import { defaultCVData } from '../data/defaultCVData';
import { MdSave } from 'react-icons/md';
import './AdminDashboard.modern.css';

function AdminDashboard() {
  const [cvData, setCVData] = useState(defaultCVData);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [userEmail, setUserEmail] = useState(null);
  const [authError, setAuthError] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(!isAuthenticated());

  useEffect(() => {
    const loadCV = async () => {
      try {
        const data = await getCVData();
        if (data) {
          setCVData(data);
        }
      } catch (error) {
        console.log('Using default CV data');
      }
    };
    
    loadCV();
    
    // Update auth state
    const user = getCurrentUser();
    if (user) {
      setUserEmail(user.email);
      setAuthenticated(isAuthenticated() && isAdmin());
      setShowAuthPrompt(!isAdmin());
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const result = await signInWithGoogle();
      console.log('Sign-in successful:', result);
      setAuthenticated(true);
      setUserEmail(result.user.email);
      setShowAuthPrompt(false);
    } catch (error) {
      console.error('Sign-in error:', error);
      setAuthError(error.message || 'Sign-in failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setAuthenticated(false);
      setUserEmail(null);
      setShowAuthPrompt(true);
      setAuthError('');
    } catch (error) {
      console.error('Sign-out error:', error);
      setAuthError(error.message || 'Sign-out failed.');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('Saving...');
    try {
      console.log('Starting save...');
      await updateCVData(cvData);
      console.log('Save completed successfully');
      setMessage('✓ CV data saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      const errorMsg = error.message || 'Error saving CV data. Please try again.';
      setMessage(`✗ ${errorMsg}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const updateNestedField = (path, value) => {
    const keys = path.split('.');
    setCVData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let obj = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path, item) => {
    const keys = path.split('.');
    setCVData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let obj = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      if (!Array.isArray(obj[keys[keys.length - 1]])) {
        obj[keys[keys.length - 1]] = [];
      }
      obj[keys[keys.length - 1]].push(item);
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    const keys = path.split('.');
    setCVData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let obj = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]].splice(index, 1);
      return newData;
    });
  };

  return (
    <div className="admin-container">
      {/* Authentication Modal */}
      {showAuthPrompt && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <div className="auth-icon">🔐</div>
            <h2>Admin Access Required</h2>
            <p>Sign in with your Google account to edit your CV</p>
            {authError && <div className="auth-error">{authError}</div>}
            <button 
              type="button" 
              className="google-signin-btn"
              onClick={handleGoogleSignIn}
            >
              Sign in with Google
            </button>
            <p className="auth-note">
              Your email must be marked as admin in Firestore to access editing
            </p>
          </div>
        </div>
      )}

      <div className="admin-wrapper">
        {/* Header */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <h1>📊 Dashboard</h1>
            {authenticated && <span className="user-badge">👤 {userEmail}</span>}
          </div>
          <div className="topbar-actions">
            <a href="/" className="icon-btn" title="View CV">📄</a>
            <a href="/analytics" className="icon-btn" title="Analytics">📈</a>
            {authenticated && (
              <button className="icon-btn logout-icon" onClick={handleLogout} title="Logout">🚪</button>
            )}
          </div>
        </div>

        <div className="admin-layout">
          {/* Sidebar Navigation */}
          <div className="admin-sidebar">
            <div className="sidebar-header">
              <h3>Sections</h3>
            </div>
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-label">Personal</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                <span className="nav-icon">📞</span>
                <span className="nav-label">Contact</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                <span className="nav-icon">⚡</span>
                <span className="nav-label">Skills</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'experience' ? 'active' : ''}`}
                onClick={() => setActiveTab('experience')}
              >
                <span className="nav-icon">💼</span>
                <span className="nav-label">Experience</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
              >
                <span className="nav-icon">🎓</span>
                <span className="nav-label">Education</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <span className="nav-icon">🚀</span>
                <span className="nav-label">Projects</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'extracurriculars' ? 'active' : ''}`}
                onClick={() => setActiveTab('extracurriculars')}
              >
                <span className="nav-icon">🎯</span>
                <span className="nav-label">Activities</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'styling' ? 'active' : ''}`}
                onClick={() => setActiveTab('styling')}
              >
                <span className="nav-icon">🎨</span>
                <span className="nav-label">Style</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="admin-main">
            {/* Status Message */}
            {message && (
              <div className={`status-banner ${message.includes('✓') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {/* Content Area */}
            <div className="content-card">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>👤 Personal Information</h2>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={cvData.personalInfo.name}
                        onChange={(e) => updateNestedField('personalInfo.name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Professional Title</label>
                      <input 
                        type="text" 
                        value={cvData.personalInfo.title}
                        onChange={(e) => updateNestedField('personalInfo.title', e.target.value)}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>📞 Contact Information</h2>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={cvData.contact.email}
                        onChange={(e) => updateNestedField('contact.email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input 
                        type="text" 
                        value={cvData.contact.location}
                        onChange={(e) => updateNestedField('contact.location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <input 
                        type="text" 
                        value={cvData.contact.website}
                        onChange={(e) => updateNestedField('contact.website', e.target.value)}
                        placeholder="yourwebsite.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        type="tel" 
                        value={cvData.contact.phone || ''}
                        onChange={(e) => updateNestedField('contact.phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>GitHub</label>
                      <input 
                        type="text" 
                        value={cvData.contact.github}
                        onChange={(e) => updateNestedField('contact.github', e.target.value)}
                        placeholder="github.com/username"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>LinkedIn</label>
                      <input 
                        type="text" 
                        value={cvData.contact.linkedin}
                        onChange={(e) => updateNestedField('contact.linkedin', e.target.value)}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
              )}
                    <div key={i} className="array-item skill-item-edit">
                      <div className="skill-input-group">
                        <input 
                          type="text" 
                          value={typeof skill === 'string' ? skill : skill.name}
                          onChange={(e) => {
                            const newSkills = [...cvData.skills.programming];
                            if (typeof newSkills[i] === 'string') {
                              newSkills[i] = { name: e.target.value, proficiency: 75 };
                            } else {
                              newSkills[i].name = e.target.value;
                            }
                            updateNestedField('skills.programming', newSkills);
                          }}
                          placeholder="Skill name"
                        />
                        <div className="proficiency-control">
                          <label>Proficiency: {typeof skill === 'string' ? 75 : skill.proficiency}%</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={typeof skill === 'string' ? 75 : skill.proficiency}
                            onChange={(e) => {
                              const newSkills = [...cvData.skills.programming];
                              if (typeof newSkills[i] === 'string') {
                                newSkills[i] = { name: newSkills[i], proficiency: parseInt(e.target.value) };
                              } else {
                                newSkills[i].proficiency = parseInt(e.target.value);
                              }
                              updateNestedField('skills.programming', newSkills);
                            }}
                            className="proficiency-slider"
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeArrayItem('skills.programming', i)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  className="add-btn"
                  onClick={() => addArrayItem('skills.programming', { name: 'New Skill', proficiency: 50 })}
                >
                  ➕ Add Skill
                </button>
              </div>

              <div className="skills-section">
                <h3>Operating Systems</h3>
                <div className="array-list">
                  {cvData.skills.operatingSystems.map((skill, i) => (
                    <div key={i} className="array-item skill-item-edit">
                      <div className="skill-input-group">
                        <input 
                          type="text" 
                          value={typeof skill === 'string' ? skill : skill.name}
                          onChange={(e) => {
                            const newSkills = [...cvData.skills.operatingSystems];
                            if (typeof newSkills[i] === 'string') {
                              newSkills[i] = { name: e.target.value, proficiency: 75 };
                            } else {
                              newSkills[i].name = e.target.value;
                            }
                            updateNestedField('skills.operatingSystems', newSkills);
                          }}
                          placeholder="OS name"
                        />
                        <div className="proficiency-control">
                          <label>Proficiency: {typeof skill === 'string' ? 75 : skill.proficiency}%</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={typeof skill === 'string' ? 75 : skill.proficiency}
                            onChange={(e) => {
                              const newSkills = [...cvData.skills.operatingSystems];
                              if (typeof newSkills[i] === 'string') {
                                newSkills[i] = { name: newSkills[i], proficiency: parseInt(e.target.value) };
                              } else {
                                newSkills[i].proficiency = parseInt(e.target.value);
                              }
                              updateNestedField('skills.operatingSystems', newSkills);
                            }}
                            className="proficiency-slider"
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeArrayItem('skills.operatingSystems', i)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  className="add-btn"
                  onClick={() => addArrayItem('skills.operatingSystems', { name: 'New OS', proficiency: 50 })}
                >
                  ➕ Add OS
                </button>
              </div>

              <div className="skills-section">
                <h3>Tools</h3>
                <div className="array-list">
                  {cvData.skills.tools.map((skill, i) => (
                    <div key={i} className="array-item skill-item-edit">
                      <div className="skill-input-group">
                        <input 
                          type="text" 
                          value={typeof skill === 'string' ? skill : skill.name}
                          onChange={(e) => {
                            const newSkills = [...cvData.skills.tools];
                            if (typeof newSkills[i] === 'string') {
                              newSkills[i] = { name: e.target.value, proficiency: 75 };
                            } else {
                              newSkills[i].name = e.target.value;
                            }
                            updateNestedField('skills.tools', newSkills);
                          }}
                          placeholder="Tool name"
                        />
                        <div className="proficiency-control">
                          <label>Proficiency: {typeof skill === 'string' ? 75 : skill.proficiency}%</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={typeof skill === 'string' ? 75 : skill.proficiency}
                            onChange={(e) => {
                              const newSkills = [...cvData.skills.tools];
                              if (typeof newSkills[i] === 'string') {
                                newSkills[i] = { name: newSkills[i], proficiency: parseInt(e.target.value) };
                              } else {
                                newSkills[i].proficiency = parseInt(e.target.value);
                              }
                              updateNestedField('skills.tools', newSkills);
                            }}
                            className="proficiency-slider"
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeArrayItem('skills.tools', i)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  className="add-btn"
                  onClick={() => addArrayItem('skills.tools', { name: 'New Tool', proficiency: 50 })}
                >
                  ➕ Add Tool
                </button>
              </div>

              <div className="skills-section">
                <h3>Languages</h3>
                <div className="array-list">
                  {cvData.skills.languages.map((skill, i) => (
                    <div key={i} className="array-item">
                      <input 
                        type="text" 
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...cvData.skills.languages];
                          newSkills[i] = e.target.value;
                          updateNestedField('skills.languages', newSkills);
                        }}
                      />
                      <button 
                        className="remove-btn"
                        onClick={() => removeArrayItem('skills.languages', i)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  className="add-btn"
                  onClick={() => addArrayItem('skills.languages', 'New Language')}
                >
                  ➕ Add Language
                </button>
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="form-section">
              <h2>Education</h2>
              {cvData.education.map((edu, i) => (
                <div key={i} className="item-card">
                  <h3>Education #{i + 1}</h3>
                  <div className="form-group">
                    <label>Period</label>
                    <input 
                      type="text" 
                      value={edu.period}
                      onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[i].period = e.target.value;
                        updateNestedField('education', newEdu);
                      }}
                      placeholder="e.g., 2020 - 2023"
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input 
                      type="text" 
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[i].degree = e.target.value;
                        updateNestedField('education', newEdu);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>School</label>
                    <input 
                      type="text" 
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[i].school = e.target.value;
                        updateNestedField('education', newEdu);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Highlights (one per line)</label>
                    <textarea 
                      value={edu.highlights.join('\n')}
                      onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[i].highlights = e.target.value.split('\n').filter(h => h.trim());
                        updateNestedField('education', newEdu);
                      }}
                      rows="5"
                    />
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeArrayItem('education', i)}
                  >
                    ❌ Remove Education
                  </button>
                </div>
              ))}
              <button 
                className="add-btn"
                onClick={() => addArrayItem('education', {
                  period: 'Year - Year',
                  degree: 'Degree Name',
                  school: 'School Name',
                  highlights: []
                })}
              >
                ➕ Add Education
              </button>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="form-section">
              <h2>Professional Experience</h2>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="item-card">
                  <h3>Experience #{i + 1}</h3>
                  <div className="form-group">
                    <label>Period</label>
                    <input 
                      type="text" 
                      value={exp.period}
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[i].period = e.target.value;
                        updateNestedField('experience', newExp);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[i].title = e.target.value;
                        updateNestedField('experience', newExp);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input 
                      type="text" 
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[i].company = e.target.value;
                        updateNestedField('experience', newExp);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[i].description = e.target.value;
                        updateNestedField('experience', newExp);
                      }}
                      rows="5"
                    />
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeArrayItem('experience', i)}
                  >
                    ❌ Remove Experience
                  </button>
                </div>
              ))}
              <button 
                className="add-btn"
                onClick={() => addArrayItem('experience', {
                  period: 'Month Year - Month Year',
                  title: 'Job Title',
                  company: 'Company Name',
                  description: 'Description'
                })}
              >
                ➕ Add Experience
              </button>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="form-section">
              <h2>Projects</h2>
              {cvData.projects.map((project, i) => (
                <div key={i} className="item-card">
                  <h3>Project #{i + 1}</h3>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input 
                      type="text" 
                      value={project.name}
                      onChange={(e) => {
                        const newProjects = [...cvData.projects];
                        newProjects[i].name = e.target.value;
                        updateNestedField('projects', newProjects);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Link (Optional)</label>
                    <input 
                      type="text" 
                      value={project.link || ''}
                      onChange={(e) => {
                        const newProjects = [...cvData.projects];
                        newProjects[i].link = e.target.value;
                        updateNestedField('projects', newProjects);
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Period</label>
                    <input 
                      type="text" 
                      value={project.period}
                      onChange={(e) => {
                        const newProjects = [...cvData.projects];
                        newProjects[i].period = e.target.value;
                        updateNestedField('projects', newProjects);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={project.tags.join(', ')}
                      onChange={(e) => {
                        const newProjects = [...cvData.projects];
                        newProjects[i].tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        updateNestedField('projects', newProjects);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={project.description}
                      onChange={(e) => {
                        const newProjects = [...cvData.projects];
                        newProjects[i].description = e.target.value;
                        updateNestedField('projects', newProjects);
                      }}
                      rows="5"
                    />
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeArrayItem('projects', i)}
                  >
                    ❌ Remove Project
                  </button>
                </div>
              ))}
              <button 
                className="add-btn"
                onClick={() => addArrayItem('projects', {
                  name: 'Project Name',
                  link: '',
                  period: 'Year - Present',
                  tags: ['Tag1', 'Tag2'],
                  description: 'Project description'
                })}
              >
                ➕ Add Project
              </button>
            </div>
          )}

          {/* Extracurriculars Tab */}
          {activeTab === 'extracurriculars' && (
            <div className="form-section">
              <h2>Extracurricular Activities</h2>
              <div className="array-list">
                {cvData.extracurriculars.map((item, i) => (
                  <div key={i} className="array-item">
                    <input 
                      type="text" 
                      value={item}
                      onChange={(e) => {
                        const newItems = [...cvData.extracurriculars];
                        newItems[i] = e.target.value;
                        updateNestedField('extracurriculars', newItems);
                      }}
                    />
                    <button 
                      className="remove-btn"
                      onClick={() => removeArrayItem('extracurriculars', i)}
                    >
                      ❌ Remove
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="add-btn"
                onClick={() => addArrayItem('extracurriculars', 'New Activity')}
              >
                ➕ Add Activity
              </button>
            </div>
          )}

          {/* Styling Tab */}
          {activeTab === 'styling' && (
            <div className="form-section">
              <h2>Text Styling & Formatting</h2>
              
              <div className="styling-group">
                <h3>Name (Header)</h3>
                <div className="styling-controls">
                  <div className="form-group">
                    <label>Color</label>
                    <input 
                      type="color" 
                      value={cvData.styling?.name?.color || '#ffffff'}
                      onChange={(e) => updateNestedField('styling.name.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Size (px)</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={parseInt(cvData.styling?.name?.fontSize) || 32}
                      onChange={(e) => updateNestedField('styling.name.fontSize', e.target.value + 'px')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select 
                      value={cvData.styling?.name?.fontWeight || '700'}
                      onChange={(e) => updateNestedField('styling.name.fontWeight', e.target.value)}
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Font Family</label>
                    <select 
                      value={cvData.styling?.name?.fontFamily || 'Arial, sans-serif'}
                      onChange={(e) => updateNestedField('styling.name.fontFamily', e.target.value)}
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="styling-group">
                <h3>Title</h3>
                <div className="styling-controls">
                  <div className="form-group">
                    <label>Color</label>
                    <input 
                      type="color" 
                      value={cvData.styling?.title?.color || '#f0f0f0'}
                      onChange={(e) => updateNestedField('styling.title.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Size (px)</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={parseInt(cvData.styling?.title?.fontSize) || 14}
                      onChange={(e) => updateNestedField('styling.title.fontSize', e.target.value + 'px')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select 
                      value={cvData.styling?.title?.fontWeight || '400'}
                      onChange={(e) => updateNestedField('styling.title.fontWeight', e.target.value)}
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="styling-group">
                <h3>Section Titles</h3>
                <div className="styling-controls">
                  <div className="form-group">
                    <label>Color</label>
                    <input 
                      type="color" 
                      value={cvData.styling?.sectionTitle?.color || '#1a3a52'}
                      onChange={(e) => updateNestedField('styling.sectionTitle.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Size (px)</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={parseInt(cvData.styling?.sectionTitle?.fontSize) || 13}
                      onChange={(e) => updateNestedField('styling.sectionTitle.fontSize', e.target.value + 'px')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select 
                      value={cvData.styling?.sectionTitle?.fontWeight || '700'}
                      onChange={(e) => updateNestedField('styling.sectionTitle.fontWeight', e.target.value)}
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="styling-group">
                <h3>Item Titles (Education, Experience, Projects)</h3>
                <div className="styling-controls">
                  <div className="form-group">
                    <label>Color</label>
                    <input 
                      type="color" 
                      value={cvData.styling?.itemTitle?.color || '#1a3a52'}
                      onChange={(e) => updateNestedField('styling.itemTitle.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Size (px)</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={parseInt(cvData.styling?.itemTitle?.fontSize) || 15}
                      onChange={(e) => updateNestedField('styling.itemTitle.fontSize', e.target.value + 'px')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select 
                      value={cvData.styling?.itemTitle?.fontWeight || '700'}
                      onChange={(e) => updateNestedField('styling.itemTitle.fontWeight', e.target.value)}
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="styling-group">
                <h3>Locations & Organizations</h3>
                <div className="styling-controls">
                  <div className="form-group">
                    <label>Color</label>
                    <input 
                      type="color" 
                      value={cvData.styling?.location?.color || '#666'}
                      onChange={(e) => updateNestedField('styling.location.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Size (px)</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={parseInt(cvData.styling?.location?.fontSize) || 12}
                      onChange={(e) => updateNestedField('styling.location.fontSize', e.target.value + 'px')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select 
                      value={cvData.styling?.location?.fontWeight || '500'}
                      onChange={(e) => updateNestedField('styling.location.fontWeight', e.target.value)}
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="styling-group">
                <h3>Description Text</h3>
                <div className="styling-controls">
                  <div className="form-group">
                    <label>Color</label>
                    <input 
                      type="color" 
                      value={cvData.styling?.description?.color || '#444'}
                      onChange={(e) => updateNestedField('styling.description.color', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Size (px)</label>
                    <input 
                      type="number" 
                      min="8"
                      max="72"
                      value={parseInt(cvData.styling?.description?.fontSize) || 12}
                      onChange={(e) => updateNestedField('styling.description.fontSize', e.target.value + 'px')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select 
                      value={cvData.styling?.description?.fontWeight || '400'}
                      onChange={(e) => updateNestedField('styling.description.fontWeight', e.target.value)}
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>

            {/* Action Footer */}
            {authenticated && (
              <div className="content-footer">
                <button 
                  className="save-btn" 
                  onClick={handleSave} 
                  disabled={loading}
                >
                  <MdSave /> {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
