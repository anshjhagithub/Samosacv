import type { ResumeData } from "@/types/resume";

export const generateDocFile = async (resumeData: ResumeData) => {
  try {
    const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = await import('docx');
    
    // Create editable text-based DOCX
    const children: any[] = [];
    
    // Header - Name and Title
    if (resumeData.personal?.fullName) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.personal.fullName,
              bold: true,
              size: 48, // 24pt
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }
    
    if (resumeData.personal?.title) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.personal.title,
              size: 28, // 14pt
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }
    
    // Contact Info
    const contactParts = [
      resumeData.personal?.email,
      resumeData.personal?.phone,
      resumeData.personal?.location,
    ].filter(Boolean);
    
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join(' • '),
              size: 20, // 10pt
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }
    
    // Horizontal line
    children.push(
      new Paragraph({
        border: {
          bottom: {
            color: "374151",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        spacing: { after: 300 },
      })
    );
    
    // Summary
    if (resumeData.summary) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "PROFESSIONAL SUMMARY",
              bold: true,
              size: 24, // 12pt
              color: "374151",
            }),
          ],
          spacing: { before: 200, after: 150 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.summary,
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 300 },
        })
      );
    }
    
    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "EXPERIENCE",
              bold: true,
              size: 24,
              color: "374151",
            }),
          ],
          spacing: { before: 200, after: 150 },
        })
      );
      
      resumeData.experience.forEach((exp) => {
        if (exp.jobTitle) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.jobTitle,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 150, after: 50 },
            })
          );
        }
        
        if (exp.company) {
          const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company,
                  size: 22,
                }),
                new TextRun({
                  text: dateRange ? ` | ${dateRange}` : '',
                  size: 20,
                  color: "666666",
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
        
        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.filter(Boolean).forEach((bullet) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${bullet}`,
                    size: 22,
                  }),
                ],
                spacing: { after: 50 },
                indent: { left: 360 }, // 0.25 inch
              })
            );
          });
        }
        
        children.push(new Paragraph({ spacing: { after: 150 } }));
      });
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "EDUCATION",
              bold: true,
              size: 24,
              color: "374151",
            }),
          ],
          spacing: { before: 200, after: 150 },
        })
      );
      
      resumeData.education.forEach((edu) => {
        const degreeText = [edu.degree, edu.field].filter(Boolean).join(' in ');
        if (degreeText) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: degreeText,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            })
          );
        }
        
        if (edu.school) {
          const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.school,
                  size: 22,
                }),
                new TextRun({
                  text: dateRange ? ` | ${dateRange}` : '',
                  size: 20,
                  color: "666666",
                }),
              ],
              spacing: { after: 150 },
            })
          );
        }
      });
    }
    
    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "SKILLS",
              bold: true,
              size: 24,
              color: "374151",
            }),
          ],
          spacing: { before: 200, after: 150 },
        })
      );
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.skills.join(' • '),
              size: 22,
            }),
          ],
          spacing: { after: 300 },
        })
      );
    }
    
    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      const validProjects = resumeData.projects.filter(p => p.title || p.description);
      if (validProjects.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "PROJECTS",
                bold: true,
                size: 24,
                color: "374151",
              }),
            ],
            spacing: { before: 200, after: 150 },
          })
        );
        
        validProjects.forEach((proj) => {
          if (proj.title) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.title,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 100, after: 50 },
              })
            );
          }
          
          if (proj.description) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.description,
                    size: 22,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
          
          // Project bullets
          if (proj.bullets && proj.bullets.length > 0) {
            proj.bullets.filter(Boolean).forEach((bullet) => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${bullet}`,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 50 },
                  indent: { left: 360 },
                })
              );
            });
          }
          
          children.push(new Paragraph({ spacing: { after: 150 } }));
        });
      }
    }
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }, // 0.5 inch in twips
          },
        },
        children,
      }],
    });
    
    const docxBlob = await Packer.toBlob(doc);
    
    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-${resumeData.personal?.fullName || 'resume'}-${Date.now()}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('DOC generation error:', error);
    // Fallback if DOCX fails
    const textContent = `
Resume - ${resumeData.personal?.fullName || 'Document'}
=====================================

${resumeData.personal?.fullName || ''}
${resumeData.personal?.title || ''}
${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}

SUMMARY
${resumeData.summary || ''}

EXPERIENCE
${resumeData.experience.map(exp => `
${exp.jobTitle} at ${exp.company}
${exp.startDate} - ${exp.endDate}
${exp.bullets.map(bullet => `• ${bullet}`).join('\n')}
`).join('\n')}

EDUCATION
${resumeData.education.map(edu => `
${edu.degree} in ${edu.field}
${edu.school}
${edu.startDate} - ${edu.endDate}
`).join('\n')}

SKILLS
${resumeData.skills?.join(', ') || ''}
    `;
    const textBlob = new Blob([textContent], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = `resume-${resumeData.personal?.fullName || 'resume'}-${Date.now()}.txt`;
    document.body.appendChild(textLink);
    textLink.click();
    document.body.removeChild(textLink);
    URL.revokeObjectURL(textUrl);
  }
};
