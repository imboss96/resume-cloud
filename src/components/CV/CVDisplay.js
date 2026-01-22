import React, { useState, useEffect, useRef } from 'react';
import { getCVData } from '../../services/api';
import { defaultCVData } from '../../data/defaultCVData';
import { MdPrint, MdDownload, MdSettings, MdEmail, MdLocationOn, MdLanguage, MdCalendarToday, MdLink, MdSchool, MdWorkHistory, MdLightbulb, MdEmojiEvents } from 'react-icons/md';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './CVDisplay.css';

function CVDisplay() {
  const [cvData, setCVData] = useState(defaultCVData);
  const cvRef = useRef();

  useEffect(() => {
    // Try to load CV data from API
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
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = cvRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${cvData.personalInfo.name.replace(/\s+/g, '_')}_CV.pdf`);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error generating PDF. Using print to PDF instead.');
      handlePrint();
    }
  };

  return (
    <div className="cv-container">
      <div className="cv-actions">
        <button className="btn btn-download" onClick={handleDownloadPDF} title="Download as PDF">
          <MdDownload /> Download PDF
        </button>
        <a href="/admin" className="btn btn-admin" title="Edit CV">
          <MdSettings /> Edit CV
        </a>
      </div>

      <div ref={cvRef} className="cv-content">
        <div className="cv-page">
          {/* Header */}
          <header className="cv-header">
            <h1 style={{
              color: cvData.styling?.name?.color,
              fontSize: cvData.styling?.name?.fontSize,
              fontFamily: cvData.styling?.name?.fontFamily,
              fontWeight: cvData.styling?.name?.fontWeight
            }}>{cvData.personalInfo.name}</h1>
            <p className="cv-title" style={{
              color: cvData.styling?.title?.color,
              fontSize: cvData.styling?.title?.fontSize,
              fontFamily: cvData.styling?.title?.fontFamily,
              fontWeight: cvData.styling?.title?.fontWeight
            }}>{cvData.personalInfo.title}</p>
          </header>

          <div className="cv-body">
            {/* Left Sidebar */}
            <aside className="cv-sidebar">
              {/* Contact */}
              <section className="cv-section">
                <h3 className="section-title" style={{
                  color: cvData.styling?.sectionTitle?.color,
                  fontSize: cvData.styling?.sectionTitle?.fontSize,
                  fontFamily: cvData.styling?.sectionTitle?.fontFamily,
                  fontWeight: cvData.styling?.sectionTitle?.fontWeight
                }}>CONTACT</h3>
                <div className="contact-info">
                  <p><MdEmail /> {cvData.contact.email}</p>
                  <p><MdLocationOn /> {cvData.contact.location}</p>
                  <p><MdLanguage /> {cvData.contact.website}</p>
                  <p><FaGithub /> {cvData.contact.github}</p>
                  <p><FaLinkedin /> {cvData.contact.linkedin}</p>
                </div>
              </section>

              {/* Skills */}
              <section className="cv-section">
                <h3 className="section-title">SKILLS</h3>
                
                <div className="skills-category">
                  <h4>Programming</h4>
                  <div className="skills-list">
                    {(cvData.skills?.programming || []).map((skill, i) => (
                      <div key={i} className="skill-item">
                        <span>{typeof skill === 'string' ? skill : skill.name}</span>
                        <div className="skill-bar">
                          <div className="skill-fill" style={{ width: `${typeof skill === 'string' ? 75 : skill.proficiency}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="skills-category">
                  <h4>Operating Systems</h4>
                  <div className="skills-list">
                    {(cvData.skills?.operatingSystems || []).map((skill, i) => (
                      <div key={i} className="skill-item">
                        <span>{typeof skill === 'string' ? skill : skill.name}</span>
                        <div className="skill-bar">
                          <div className="skill-fill" style={{ width: `${typeof skill === 'string' ? 75 : skill.proficiency}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="skills-category">
                  <h4>Tools</h4>
                  <div className="skills-list">
                    {(cvData.skills?.tools || []).map((skill, i) => (
                      <div key={i} className="skill-item">
                        <span>{typeof skill === 'string' ? skill : skill.name}</span>
                        <div className="skill-bar">
                          <div className="skill-fill" style={{ width: `${typeof skill === 'string' ? 75 : skill.proficiency}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="skills-category">
                  <h4>Languages</h4>
                  <div className="skills-list">
                    {(cvData.skills?.languages || []).map((skill, i) => (
                      <div key={i} className="skill-item">
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Open Source */}
              <section className="cv-section">
                <h3 className="section-title">OPEN SOURCE</h3>
                <div className="opensource-list">
                  <p>Contributions in the following projects:</p>
                  <ul>
                    <li>Strapi (Small Enhancements, Bug Fixes, Security Vulnerability Patching, Translations)</li>
                    <li>Nixpkgs (Packaging, Bug Fixes, Security Vulnerability)</li>
                    <li>STAVE COVID-19 (Dark Mode)</li>
                    <li>Vuepress (Bug Fixes)</li>
                    <li>Litroom (Translations)</li>
                    <li>vendor_hardware_overlay (Android Device Overlay)</li>
                    <li>Firefly-III (Bug Fixes)</li>
                    <li>BungeeCord (Bug Fixes)</li>
                    <li>automatic_timezoomed (New Features)</li>
                  </ul>
                </div>
              </section>
            </aside>

            {/* Main Content */}
            <main className="cv-main">
              {/* Education */}
              <section className="cv-section">
                <h3 className="section-title" style={{
                  color: cvData.styling?.sectionTitle?.color,
                  fontSize: cvData.styling?.sectionTitle?.fontSize,
                  fontFamily: cvData.styling?.sectionTitle?.fontFamily,
                  fontWeight: cvData.styling?.sectionTitle?.fontWeight
                }}><MdSchool /> EDUCATION</h3>
                <div className="education-list">
                  {(cvData.education || []).map((edu, i) => (
                    <div key={i} className="education-item">
                      <div className="item-header">
                        <span className="period"><MdCalendarToday /> {edu.period}</span>
                        <h4 className="item-title" style={{
                          color: cvData.styling?.itemTitle?.color,
                          fontSize: cvData.styling?.itemTitle?.fontSize,
                          fontFamily: cvData.styling?.itemTitle?.fontFamily,
                          fontWeight: cvData.styling?.itemTitle?.fontWeight
                        }}>{edu.degree}</h4>
                      </div>
                      <p className="location" style={{
                        color: cvData.styling?.location?.color,
                        fontSize: cvData.styling?.location?.fontSize,
                        fontFamily: cvData.styling?.location?.fontFamily,
                        fontWeight: cvData.styling?.location?.fontWeight
                      }}><MdLocationOn /> {edu.school}</p>
                      {edu.highlights && edu.highlights.length > 0 && (
                        <ul className="highlights">
                          {edu.highlights.map((highlight, j) => (
                            <li key={j}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Experience */}
              <section className="cv-section">
                <h3 className="section-title" style={{
                  color: cvData.styling?.sectionTitle?.color,
                  fontSize: cvData.styling?.sectionTitle?.fontSize,
                  fontFamily: cvData.styling?.sectionTitle?.fontFamily,
                  fontWeight: cvData.styling?.sectionTitle?.fontWeight
                }}><MdWorkHistory /> PROFESSIONAL EXPERIENCE</h3>
                <div className="experience-list">
                  {(cvData.experience || []).map((exp, i) => (
                    <div key={i} className="experience-item">
                      <div className="item-header">
                        <span className="period"><MdCalendarToday /> {exp.period}</span>
                        <h4 className="item-title" style={{
                          color: cvData.styling?.itemTitle?.color,
                          fontSize: cvData.styling?.itemTitle?.fontSize,
                          fontFamily: cvData.styling?.itemTitle?.fontFamily,
                          fontWeight: cvData.styling?.itemTitle?.fontWeight
                        }}>{exp.title}</h4>
                      </div>
                      <p className="location" style={{
                        color: cvData.styling?.location?.color,
                        fontSize: cvData.styling?.location?.fontSize,
                        fontFamily: cvData.styling?.location?.fontFamily,
                        fontWeight: cvData.styling?.location?.fontWeight
                      }}><MdLocationOn /> {exp.company}</p>
                      <p className="description" style={{
                        color: cvData.styling?.description?.color,
                        fontSize: cvData.styling?.description?.fontSize,
                        fontFamily: cvData.styling?.description?.fontFamily,
                        fontWeight: cvData.styling?.description?.fontWeight
                      }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Projects */}
              <section className="cv-section">
                <h3 className="section-title" style={{
                  color: cvData.styling?.sectionTitle?.color,
                  fontSize: cvData.styling?.sectionTitle?.fontSize,
                  fontFamily: cvData.styling?.sectionTitle?.fontFamily,
                  fontWeight: cvData.styling?.sectionTitle?.fontWeight
                }}><MdLightbulb /> PROJECTS</h3>
                <div className="projects-list">
                  {(cvData.projects || []).map((project, i) => (
                    <div key={i} className="project-item">
                      <div className="project-header">
                        {project.link ? (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-name" style={{
                            color: cvData.styling?.itemTitle?.color,
                            fontSize: cvData.styling?.itemTitle?.fontSize,
                            fontFamily: cvData.styling?.itemTitle?.fontFamily,
                            fontWeight: cvData.styling?.itemTitle?.fontWeight
                          }}>
                            {project.name} <MdLink />
                          </a>
                        ) : (
                          <h4 className="project-name" style={{
                            color: cvData.styling?.itemTitle?.color,
                            fontSize: cvData.styling?.itemTitle?.fontSize,
                            fontFamily: cvData.styling?.itemTitle?.fontFamily,
                            fontWeight: cvData.styling?.itemTitle?.fontWeight
                          }}>{project.name}</h4>
                        )}
                        <span className="period"><MdCalendarToday /> {project.period}</span>
                      </div>
                      <div className="project-tags">
                        {(project.tags || []).map((tag, j) => (
                          <span key={j} className="tag">{tag}</span>
                        ))}
                      </div>
                      <p className="project-description">{project.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Extracurriculars */}
              <section className="cv-section">
                <h3 className="section-title"><MdEmojiEvents /> EXTRA CURRICULARS</h3>
                <ul className="extracurriculars-list">
                  {(cvData.extracurriculars || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CVDisplay;
