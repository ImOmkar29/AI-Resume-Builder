import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const ResumePreview = forwardRef(({ resumeData, isDark, activeTemplate }, ref) => {

  const templates = {
    professional: ({ resumeData, ref }) => (
      <div 
        ref={ref} 
        className="a4-template"
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: 'white',
          color: '#1a1a1a',
          fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
          fontSize: '10pt',
          lineHeight: '1.5',
          padding: '20mm',
          margin: '0 auto',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
      >
        {/* Header Section */}
        <header style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #2563eb', paddingBottom: '16px' }}>
          <h1 style={{ 
            fontSize: '28pt', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: '#1a1a1a',
            letterSpacing: '-0.5px'
          }}>
            {resumeData.fullName || 'Your Full Name'}
          </h1>
          <p style={{ 
            fontSize: '13pt', 
            color: '#4b5563',
            margin: '0 0 12px 0',
            fontWeight: '500'
          }}>
            {resumeData.jobTitle || 'Professional Title'}
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px',
            flexWrap: 'wrap',
            fontSize: '9pt',
            color: '#6b7280'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> {resumeData.email || 'email@example.com'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {resumeData.phone || '+1 (555) 000-0000'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {resumeData.location || 'City, Country'}
            </span>
          </div>
        </header>

        {/* Professional Summary */}
        {resumeData.summary && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: '700',
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              Professional Summary
            </h2>
            <p style={{ 
              textAlign: 'justify',
              lineHeight: '1.6',
              color: '#374151',
              margin: 0
            }}>
              {resumeData.summary}
            </p>
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: '700',
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resumeData.skills.map((skill, index) => (
                <span key={index} style={{
                  padding: '4px 12px',
                  background: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  fontWeight: '500'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {resumeData.experiences && resumeData.experiences.filter(e => e.jobTitle).length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: '700',
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              Work Experience
            </h2>
            {resumeData.experiences.map((exp, index) => exp.jobTitle && (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h3 style={{ 
                    fontSize: '11pt', 
                    fontWeight: '600',
                    color: '#1a1a1a',
                    margin: 0
                  }}>
                    {exp.jobTitle} <span style={{ fontWeight: '500', color: '#4b5563' }}>at {exp.company}</span>
                  </h3>
                  <span style={{ 
                    fontSize: '9pt',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px'
                  }}>
                    {exp.duration}
                  </span>
                </div>
                <p style={{ 
                  margin: '6px 0 0 0',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  textAlign: 'justify'
                }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.filter(p => p.title).length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: '700',
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              Projects
            </h2>
            {resumeData.projects.map((proj, index) => proj.title && (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h3 style={{ 
                    fontSize: '11pt', 
                    fontWeight: '600',
                    color: '#1a1a1a',
                    margin: 0
                  }}>
                    {proj.title}
                  </h3>
                  {proj.link && (
                    <a href={proj.link} style={{ 
                      fontSize: '9pt',
                      color: '#2563eb',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      marginLeft: '12px'
                    }}>
                      View Project →
                    </a>
                  )}
                </div>
                <p style={{ 
                  margin: '6px 0 0 0',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  textAlign: 'justify'
                }}>
                  {proj.description}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {resumeData.educations && resumeData.educations.filter(e => e.degree).length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: '700',
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              Education
            </h2>
            {resumeData.educations.map((edu, index) => edu.degree && (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '11pt', 
                      fontWeight: '600',
                      color: '#1a1a1a',
                      margin: '0 0 2px 0'
                    }}>
                      {edu.degree}
                    </h3>
                    <p style={{ 
                      margin: 0,
                      fontSize: '10pt',
                      color: '#4b5563'
                    }}>
                      {edu.university}
                    </p>
                  </div>
                  <span style={{ 
                    fontSize: '9pt',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px'
                  }}>
                    {edu.year}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.filter(c => c.title).length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: '700',
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              Certifications
            </h2>
            {resumeData.certifications.map((cert, index) => cert.title && (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '11pt', 
                      fontWeight: '600',
                      color: '#1a1a1a',
                      margin: '0 0 2px 0'
                    }}>
                      {cert.title}
                    </h3>
                    <p style={{ 
                      margin: 0,
                      fontSize: '10pt',
                      color: '#4b5563'
                    }}>
                      {cert.authority}
                    </p>
                  </div>
                  <span style={{ 
                    fontSize: '9pt',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px'
                  }}>
                    {cert.year}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    ),
  };

  // Sample data for preview
  const defaultResumeData = {
    fullName: 'John Doe',
    jobTitle: 'Senior Software Engineer',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable applications and leading cross-functional teams.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Git'],
    experiences: [
      {
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        duration: '2021 - Present',
        description: 'Led development of microservices architecture serving 1M+ users. Reduced API response time by 40% through optimization. Mentored 3 junior developers and conducted code reviews.'
      },
      {
        jobTitle: 'Software Engineer',
        company: 'StartupXYZ',
        duration: '2019 - 2021',
        description: 'Built full-stack web applications using React and Node.js. Implemented CI/CD pipelines reducing deployment time by 60%. Collaborated with product team on feature development.'
      }
    ],
    projects: [
      {
        title: 'E-Commerce Platform',
        link: 'github.com/project',
        description: 'Developed a scalable e-commerce platform with payment integration, inventory management, and real-time analytics. Technologies: React, Node.js, PostgreSQL, Redis.'
      }
    ],
    educations: [
      {
        degree: 'Bachelor of Science in Computer Science',
        university: 'University of California',
        year: '2019'
      }
    ],
    certifications: [
      {
        title: 'AWS Certified Solutions Architect',
        authority: 'Amazon Web Services',
        year: '2022'
      }
    ]
  };

  const ActiveTemplateComponent = templates[activeTemplate || 'professional'];
  const dataToUse = resumeData || defaultResumeData;

  return (
    <div style={{ background: '#f3f4f6', padding: '40px 20px', minHeight: '100vh' }}>
      {ActiveTemplateComponent ? (
        <ActiveTemplateComponent resumeData={dataToUse} ref={ref} />
      ) : (
        <div>Template not found.</div>
      )}
    </div>
  );
});

export default ResumePreview;