import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

export default function ResumeBuilder() {



    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
        linkedin: '',
        github: '',
        portfolio: ''
    });

    const [education, setEducation] = useState([
        { id: 1, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
    ]);

    const [experience, setExperience] = useState([
        { id: 1, company: '', position: '', startDate: '', endDate: '', description: '' }
    ]);

    const [projects, setProjects] = useState([
        { id: 1, title: '', description: '', link: '', technologies: '' }
    ]);

    const [achievements, setAchievements] = useState([
        { id: 1, title: '', organization: '', date: '', description: '' }
    ]);

    const [skills, setSkills] = useState([
        { id: 1, skill: '' }
    ]);

    const [otherSection, setOtherSection] = useState({
        title: 'Other Information',
        items: [{ id: 1, content: '' }]
    });

    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEducationChange = (id, field, value) => {
        setEducation(prevState => prevState.map(
            edu => edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    const handleExperienceChange = (id, field, value) => {
        setExperience(prevState => prevState.map(
            exp => exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const handleProjectChange = (id, field, value) => {
        setProjects(prevState => prevState.map(
            proj => proj.id === id ? { ...proj, [field]: value } : proj
        ));
    };

    const handleAchievementChange = (id, field, value) => {
        setAchievements(prevState => prevState.map(
            ach => ach.id === id ? { ...ach, [field]: value } : ach
        ));
    };

    const handleSkillChange = (id, value) => {
        setSkills(prevState => prevState.map(
            skill => skill.id === id ? { ...skill, skill: value } : skill
        ));
    };

    const handleOtherSectionTitleChange = (value) => {
        setOtherSection(prev => ({ ...prev, title: value }));
    };

    const handleOtherItemChange = (id, value) => {
        setOtherSection(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, content: value } : item)
        }));
    };

    const addEducation = () => {
        const newId = education.length > 0 ? Math.max(...education.map(e => e.id)) + 1 : 1;
        setEducation([...education, { id: newId, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]);
    };

    const removeEducation = (id) => {
        if (education.length > 1) {
            setEducation(education.filter(edu => edu.id !== id));
        }
    };

    const addExperience = () => {
        const newId = experience.length > 0 ? Math.max(...experience.map(e => e.id)) + 1 : 1;
        setExperience([...experience, { id: newId, company: '', position: '', startDate: '', endDate: '', description: '' }]);
    };

    const removeExperience = (id) => {
        if (experience.length > 1) {
            setExperience(experience.filter(exp => exp.id !== id));
        }
    };

    const addProject = () => {
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        setProjects([...projects, { id: newId, title: '', description: '', link: '', technologies: '' }]);
    };

    const removeProject = (id) => {
        if (projects.length > 1) {
            setProjects(projects.filter(proj => proj.id !== id));
        }
    };

    const addAchievement = () => {
        const newId = achievements.length > 0 ? Math.max(...achievements.map(a => a.id)) + 1 : 1;
        setAchievements([...achievements, { id: newId, title: '', organization: '', date: '', description: '' }]);
    };

    const removeAchievement = (id) => {
        if (achievements.length > 1) {
            setAchievements(achievements.filter(ach => ach.id !== id));
        }
    };

    const addSkill = () => {
        const newId = skills.length > 0 ? Math.max(...skills.map(s => s.id)) + 1 : 1;
        setSkills([...skills, { id: newId, skill: '' }]);
    };

    const removeSkill = (id) => {
        if (skills.length > 1) {
            setSkills(skills.filter(skill => skill.id !== id));
        }
    };

    const addOtherItem = () => {
        const newId = otherSection.items.length > 0
            ? Math.max(...otherSection.items.map(item => item.id)) + 1
            : 1;
        setOtherSection(prev => ({
            ...prev,
            items: [...prev.items, { id: newId, content: '' }]
        }));
    };

    const removeOtherItem = (id) => {
        if (otherSection.items.length > 1) {
            setOtherSection(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== id)
            }));
        }
    };

    const generatePDF = async () => {
        // Enhanced styles for PDF to better match the preview
        const styles = StyleSheet.create({
            page: {
                padding: 30,
                fontFamily: 'Helvetica',
                fontSize: 12,
                color: '#333',
            },
            section: {
                marginBottom: 14,
            },
            header: {
                fontSize: 26,
                fontWeight: 'bold',
                marginBottom: 5,
                color: '#111',
            },
            contactSection: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 15,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd',
                borderBottomStyle: 'solid',
            },
            contactInfo: {
                fontSize: 10,
                color: '#666',
                marginRight: 15,
            },
            sectionTitle: {
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#333',
            },
            itemContainer: {
                marginBottom: 10,
            },
            itemHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 2,
            },
            itemTitle: {
                fontWeight: 'bold',
                fontSize: 12,
            },
            itemSubtitle: {
                fontSize: 12,
                marginBottom: 2,
                color: '#444',
            },
            dateText: {
                fontSize: 10,
                color: '#666',
            },
            description: {
                fontSize: 10,
                color: '#555',
                marginTop: 2,
            },
            gpaText: {
                fontSize: 10,
                color: '#666',
                marginTop: 1,
            },
            skillsContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 5,
            },
            skill: {
                backgroundColor: '#f0f0f0',
                paddingVertical: 3,
                paddingHorizontal: 8,
                borderRadius: 10,
                fontSize: 10,
                color: '#444',
                marginRight: 5,
                marginBottom: 5,
            }
        });

        // Create PDF Document component
        const MyDocument = () => (
            <Document>
                <Page size="A4" style={styles.page}>
                    {/* Header with Name */}
                    <View>
                        <Text style={styles.header}>{personalInfo.name || 'Your Name'}</Text>
                    </View>

                    {/* Contact Info with bottom border */}
                    <View style={styles.contactSection}>
                        {personalInfo.email && <Text style={styles.contactInfo}>{personalInfo.email}</Text>}
                        {personalInfo.phone && <Text style={styles.contactInfo}>{personalInfo.phone}</Text>}
                        {personalInfo.address && <Text style={styles.contactInfo}>{personalInfo.address}</Text>}
                        {personalInfo.linkedin && <Text style={styles.contactInfo}>{personalInfo.linkedin}</Text>}
                        {personalInfo.github && <Text style={styles.contactInfo}>{personalInfo.github}</Text>}
                        {personalInfo.portfolio && <Text style={styles.contactInfo}>{personalInfo.portfolio}</Text>}
                    </View>

                    {/* Summary Section */}
                    {personalInfo.summary && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Professional Summary</Text>
                            <Text>{personalInfo.summary}</Text>
                        </View>
                    )}

                    {/* Education Section */}
                    {education.some(edu => edu.institution || edu.degree) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Education</Text>
                            {education
                                .filter(edu => edu.institution || edu.degree)
                                .map((edu, index) => (
                                    <View key={index} style={styles.itemContainer}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemTitle}>{edu.institution}</Text>
                                            <Text style={styles.dateText}>
                                                {edu.startDate && edu.endDate
                                                    ? `${edu.startDate} - ${edu.endDate}`
                                                    : edu.startDate
                                                        ? `${edu.startDate} - Present`
                                                        : edu.endDate
                                                            ? `Until ${edu.endDate}`
                                                            : ''}
                                            </Text>
                                        </View>
                                        <Text style={styles.itemSubtitle}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</Text>
                                        {edu.gpa && <Text style={styles.gpaText}>GPA: {edu.gpa}</Text>}
                                    </View>
                                ))}
                        </View>
                    )}

                    {/* Experience Section */}
                    {experience.some(exp => exp.company || exp.position) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Work Experience</Text>
                            {experience
                                .filter(exp => exp.company || exp.position)
                                .map((exp, index) => (
                                    <View key={index} style={styles.itemContainer}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemTitle}>{exp.position}</Text>
                                            <Text style={styles.dateText}>
                                                {exp.startDate && exp.endDate
                                                    ? `${exp.startDate} - ${exp.endDate}`
                                                    : exp.startDate
                                                        ? `${exp.startDate} - Present`
                                                        : exp.endDate
                                                            ? `Until ${exp.endDate}`
                                                            : ''}
                                            </Text>
                                        </View>
                                        <Text style={styles.itemSubtitle}>{exp.company}</Text>
                                        {exp.description && <Text style={styles.description}>{exp.description}</Text>}
                                    </View>
                                ))}
                        </View>
                    )}

                    {/* Projects Section in PDF */}
                    {projects.some(proj => proj.title || proj.description) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Projects</Text>
                            {projects
                                .filter(proj => proj.title || proj.description)
                                .map((proj, index) => (
                                    <View key={index} style={styles.itemContainer}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemTitle}>{proj.title}</Text>
                                            {proj.link && <Text style={styles.dateText}>{proj.link}</Text>}
                                        </View>
                                        {proj.technologies && (
                                            <Text style={styles.itemSubtitle}>{proj.technologies}</Text>
                                        )}
                                        {proj.description && <Text style={styles.description}>{proj.description}</Text>}
                                    </View>
                                ))}
                        </View>
                    )}

                    {/* Achievements Section in PDF */}
                    {achievements.some(ach => ach.title || ach.description) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Achievements</Text>
                            {achievements
                                .filter(ach => ach.title || ach.description)
                                .map((ach, index) => (
                                    <View key={index} style={styles.itemContainer}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemTitle}>{ach.title}</Text>
                                            {ach.date && <Text style={styles.dateText}>{ach.date}</Text>}
                                        </View>
                                        {ach.organization && (
                                            <Text style={styles.itemSubtitle}>{ach.organization}</Text>
                                        )}
                                        {ach.description && <Text style={styles.description}>{ach.description}</Text>}
                                    </View>
                                ))}
                        </View>
                    )}


                    {/* Skills Section */}
                    {skills.some(s => s.skill) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            <View style={styles.skillsContainer}>
                                {skills
                                    .filter(s => s.skill)
                                    .map((s, index) => (
                                        <Text key={index} style={styles.skill}>{s.skill}</Text>
                                    ))}
                            </View>
                        </View>
                    )}

                    {/* Custom "Others" Section in PDF */}
                    {otherSection.items.some(item => item.content) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{otherSection.title}</Text>
                            {otherSection.items
                                .filter(item => item.content)
                                .map((item, index) => (
                                    <Text key={index} style={styles.description}>{item.content}</Text>
                                ))}
                        </View>
                    )}

                </Page>
            </Document>
        );

        try {
            // Generate PDF blob
            const blob = await pdf(<MyDocument />).toBlob();

            // Get the user's name for the filename, or use a default
            const fileName = personalInfo.name
                ? `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
                : 'My_Professional_Resume.pdf';

            // Save the file using FileSaver.js
            saveAs(blob, fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('There was an error generating your PDF. Please try again.');
        }
    };

    const fillSampleData = () => {
        // Sample personal info
        setPersonalInfo({
            name: 'Alex Johnson',
            email: 'alex.johnson@email.com',
            phone: '(555) 123-4567',
            address: 'San Francisco, CA',
            summary: 'Dedicated software engineer with 3+ years of experience in full-stack development. Passionate about creating intuitive user interfaces and optimizing backend performance. Committed to writing clean, maintainable code and staying current with emerging technologies.',
            linkedin: 'linkedin.com/in/alexjohnson',
            github: 'github.com/alexjohnson',
            portfolio: 'alexjohnson.dev'
        });

        // Sample education
        setEducation([
            {
                id: 1,
                institution: 'University of California, Berkeley',
                degree: 'Bachelor of Science',
                field: 'Computer Science',
                startDate: '08/2017',
                endDate: '05/2021',
                gpa: '3.8'
            },
            {
                id: 2,
                institution: 'Tech Bootcamp',
                degree: 'Certificate',
                field: 'Full Stack Web Development',
                startDate: '06/2021',
                endDate: '12/2021',
                gpa: ''
            }
        ]);

        // Sample experience
        setExperience([
            {
                id: 1,
                company: 'InnovateTech Solutions',
                position: 'Senior Software Engineer',
                startDate: '01/2023',
                endDate: 'Present',
                description: 'Leading frontend development for client projects using React and TypeScript. Improved application performance by 40% through code optimization and implementing best practices. Mentoring junior developers and conducting code reviews.'
            },
            {
                id: 2,
                company: 'DataViz Corp',
                position: 'Software Developer',
                startDate: '01/2022',
                endDate: '12/2022',
                description: 'Developed and maintained web applications using JavaScript, React, and Node.js. Created RESTful APIs and implemented database solutions with MongoDB. Collaborated with UX designers to implement responsive frontend features.'
            }
        ]);

        // Sample skills
        setSkills([
            { id: 1, skill: 'JavaScript' },
            { id: 2, skill: 'React' },
            { id: 3, skill: 'Node.js' },
            { id: 4, skill: 'TypeScript' },
            { id: 5, skill: 'MongoDB' },
            { id: 6, skill: 'CSS/SASS' },
            { id: 7, skill: 'Git' },
            { id: 8, skill: 'REST APIs' }
        ]);

        // Sample projects
        setProjects([
            {
                id: 1,
                title: 'E-commerce Platform',
                link: 'github.com/alexjohnson/ecommerce',
                technologies: 'React, Node.js, MongoDB, Stripe API',
                description: 'Built a full-stack e-commerce application with user authentication, product catalog, shopping cart, and secure payment processing. Implemented responsive design and admin dashboard for inventory management.'
            },
            {
                id: 2,
                title: 'Weather Dashboard',
                link: 'weather-dashboard.alexjohnson.dev',
                technologies: 'JavaScript, OpenWeather API, Chart.js',
                description: 'Created an interactive weather application that displays current weather and 5-day forecast for any location. Features include geolocation, interactive charts, and save favorite locations.'
            }
        ]);

        // Sample achievements
        setAchievements([
            {
                id: 1,
                title: 'Hackathon Winner',
                organization: 'TechInnovate Conference',
                date: 'October 2023',
                description: 'Won first place in the annual hackathon by developing an innovative accessibility solution for visually impaired users navigating web content.'
            },
            {
                id: 2,
                title: 'Outstanding Project Award',
                organization: 'UC Berkeley Computer Science Department',
                date: 'May 2021',
                description: 'Received recognition for senior project implementing machine learning algorithms to analyze and predict user behavior patterns.'
            }
        ]);

        // Sample other sections
        setOtherSection({
            title: 'Certifications',
            items: [
                { id: 1, content: 'AWS Certified Developer - Associate (2023)' },
                { id: 2, content: 'Google Professional Cloud Developer (2022)' },
                { id: 3, content: 'MongoDB Certified Developer (2022)' }
            ]
        });
    };

    const clearFields = () => {
        // Reset personal information
        setPersonalInfo({
            name: '',
            email: '',
            phone: '',
            address: '',
            summary: '',
            linkedin: '',
            github: '',
            portfolio: ''
        });

        // Reset education to have one empty entry
        setEducation([
            { id: 1, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
        ]);

        // Reset experience to have one empty entry
        setExperience([
            { id: 1, company: '', position: '', startDate: '', endDate: '', description: '' }
        ]);

        // Reset projects to have one empty entry
        setProjects([
            { id: 1, title: '', description: '', link: '', technologies: '' }
        ]);

        // Reset achievements to have one empty entry
        setAchievements([
            { id: 1, title: '', organization: '', date: '', description: '' }
        ]);

        // Reset skills to have one empty entry
        setSkills([
            { id: 1, skill: '' }
        ]);

        // Reset other section
        setOtherSection({
            title: 'Other Information',
            items: [{ id: 1, content: '' }]
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-50">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Professional Resume Builder</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Form Section */}
                <div className="lg:w-1/2 space-y-6 h-full">
                    {/* Personal Information */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={personalInfo.name}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={personalInfo.email}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={personalInfo.phone}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={personalInfo.address}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={personalInfo.linkedin}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                                <input
                                    type="text"
                                    name="github"
                                    value={personalInfo.github}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                                <input
                                    type="text"
                                    name="portfolio"
                                    value={personalInfo.portfolio}
                                    onChange={handlePersonalInfoChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                                <textarea
                                    name="summary"
                                    value={personalInfo.summary}
                                    onChange={handlePersonalInfoChange}
                                    rows="4"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Education</h2>
                            <button
                                onClick={addEducation}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Add Education
                            </button>
                        </div>

                        {education.map((edu) => (
                            <div key={edu.id} className="mb-6 p-4 border border-gray-200 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Institution</label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Degree</label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                                        <input
                                            type="text"
                                            value={edu.field}
                                            onChange={(e) => handleEducationChange(edu.id, 'field', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">GPA (Optional)</label>
                                        <input
                                            type="text"
                                            value={edu.gpa}
                                            onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="text"
                                            value={edu.startDate}
                                            placeholder="MM/YYYY"
                                            onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">End Date (or Expected)</label>
                                        <input
                                            type="text"
                                            value={edu.endDate}
                                            placeholder="MM/YYYY or Present"
                                            onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                </div>
                                {education.length > 1 && (
                                    <button
                                        onClick={() => removeEducation(edu.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove this entry
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Work Experience */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Work Experience</h2>
                            <button
                                onClick={addExperience}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Add Experience
                            </button>
                        </div>

                        {experience.map((exp) => (
                            <div key={exp.id} className="mb-6 p-4 border border-gray-200 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company/Organization</label>
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Position</label>
                                        <input
                                            type="text"
                                            value={exp.position}
                                            onChange={(e) => handleExperienceChange(exp.id, 'position', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="text"
                                            value={exp.startDate}
                                            placeholder="MM/YYYY"
                                            onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                                        <input
                                            type="text"
                                            value={exp.endDate}
                                            placeholder="MM/YYYY or Present"
                                            onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            rows="3"
                                            value={exp.description}
                                            onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                            placeholder="Describe your responsibilities and achievements"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                </div>
                                {experience.length > 1 && (
                                    <button
                                        onClick={() => removeExperience(exp.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove this entry
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Projects</h2>
                            <button
                                onClick={addProject}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Add Project
                            </button>
                        </div>

                        {projects.map((proj) => (
                            <div key={proj.id} className="mb-6 p-4 border border-gray-200 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Project Title</label>
                                        <input
                                            type="text"
                                            value={proj.title}
                                            onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Project Link</label>
                                        <input
                                            type="text"
                                            value={proj.link}
                                            onChange={(e) => handleProjectChange(proj.id, 'link', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
                                        <input
                                            type="text"
                                            value={proj.technologies}
                                            onChange={(e) => handleProjectChange(proj.id, 'technologies', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            placeholder="e.g. React, Node.js, MongoDB"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            rows="3"
                                            value={proj.description}
                                            onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                </div>
                                {projects.length > 1 && (
                                    <button
                                        onClick={() => removeProject(proj.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove this project
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Achievements Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Achievements</h2>
                            <button
                                onClick={addAchievement}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Add Achievement
                            </button>
                        </div>

                        {achievements.map((ach) => (
                            <div key={ach.id} className="mb-6 p-4 border border-gray-200 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Achievement Title</label>
                                        <input
                                            type="text"
                                            value={ach.title}
                                            onChange={(e) => handleAchievementChange(ach.id, 'title', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                                        <input
                                            type="text"
                                            value={ach.organization}
                                            onChange={(e) => handleAchievementChange(ach.id, 'organization', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <input
                                            type="text"
                                            value={ach.date}
                                            onChange={(e) => handleAchievementChange(ach.id, 'date', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            placeholder="e.g. June 2023"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            rows="2"
                                            value={ach.description}
                                            onChange={(e) => handleAchievementChange(ach.id, 'description', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        />
                                    </div>
                                </div>
                                {achievements.length > 1 && (
                                    <button
                                        onClick={() => removeAchievement(ach.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove this achievement
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Skills */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
                            <button
                                onClick={addSkill}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Add Skill
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={skill.skill}
                                        onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        placeholder="e.g. Project Management, JavaScript, etc."
                                    />
                                    {skills.length > 1 && (
                                        <button
                                            onClick={() => removeSkill(skill.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Custom "Others" Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex-grow">
                                <input
                                    type="text"
                                    value={otherSection.title}
                                    onChange={(e) => handleOtherSectionTitleChange(e.target.value)}
                                    className="text-xl font-semibold text-gray-700 border-none focus:ring-0 w-full bg-transparent"
                                    placeholder="Custom Section Title"
                                />
                            </div>
                            <button
                                onClick={addOtherItem}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Add Item
                            </button>
                        </div>

                        {otherSection.items.map((item) => (
                            <div key={item.id} className="mb-4 flex items-start gap-2">
                                <textarea
                                    rows="2"
                                    value={item.content}
                                    onChange={(e) => handleOtherItemChange(item.id, e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                    placeholder="Add information here..."
                                />
                                {otherSection.items.length > 1 && (
                                    <button
                                        onClick={() => removeOtherItem(item.id)}
                                        className="text-red-600 hover:text-red-800 mt-2"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Section - Fixed position on large screens */}
                <div className="lg:w-1/2 print:w-full">
                    <div className="sticky top-4">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 print:shadow-none print:p-0" id="resume-preview">
                            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700 hidden print:hidden">Live Preview</h3>

                            <div className="mb-6 pb-4 border-b-2 border-gray-300">
                                <h1 className="text-3xl font-bold text-gray-800 mb-1">{personalInfo.name || 'Your Name'}</h1>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                    {personalInfo.email && <div>{personalInfo.email}</div>}
                                    {personalInfo.phone && <div>{personalInfo.phone}</div>}
                                    {personalInfo.address && <div>{personalInfo.address}</div>}
                                    {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
                                    {personalInfo.github && <div>{personalInfo.github}</div>}
                                    {personalInfo.portfolio && <div>{personalInfo.portfolio}</div>}
                                </div>
                            </div>

                            {/* Personal Information Preview Section */}
                            {personalInfo.summary && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Professional Summary</h2>
                                    <p className="text-gray-600">{personalInfo.summary}</p>
                                </div>
                            )}

                            {/* Education Preview Section */}
                            {education.some(edu => edu.institution || edu.degree) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Education</h2>
                                    {education.filter(edu => edu.institution || edu.degree).map((edu, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <div className="font-medium">{edu.institution}</div>
                                                <div className="text-gray-600 text-sm">
                                                    {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` :
                                                        edu.startDate ? `${edu.startDate} - Present` :
                                                            edu.endDate ? `Until ${edu.endDate}` : ''}
                                                </div>
                                            </div>
                                            <div>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
                                            {edu.gpa && <div className="text-sm text-gray-600">GPA: {edu.gpa}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Experience Preview Section */}
                            {experience.some(exp => exp.company || exp.position) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Work Experience</h2>
                                    {experience.filter(exp => exp.company || exp.position).map((exp, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <div className="font-medium">{exp.position}</div>
                                                <div className="text-gray-600 text-sm">
                                                    {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` :
                                                        exp.startDate ? `${exp.startDate} - Present` :
                                                            exp.endDate ? `Until ${exp.endDate}` : ''}
                                                </div>
                                            </div>
                                            <div className="text-gray-700 mb-1">{exp.company}</div>
                                            {exp.description && <p className="text-sm text-gray-600">{exp.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects Preview Section */}
                            {projects.some(proj => proj.title || proj.description) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Projects</h2>
                                    {projects.filter(proj => proj.title || proj.description).map((proj, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <div className="font-medium">{proj.title}</div>
                                                {proj.link && (
                                                    <div className="text-sm text-blue-600">{proj.link}</div>
                                                )}
                                            </div>
                                            {proj.technologies && (
                                                <div className="text-sm text-gray-700">{proj.technologies}</div>
                                            )}
                                            {proj.description && <p className="text-sm text-gray-600">{proj.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Achievements Preview Section */}
                            {achievements.some(ach => ach.title || ach.description) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Achievements</h2>
                                    {achievements.filter(ach => ach.title || ach.description).map((ach, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <div className="font-medium">{ach.title}</div>
                                                {ach.date && <div className="text-gray-600 text-sm">{ach.date}</div>}
                                            </div>
                                            {ach.organization && (
                                                <div className="text-gray-700 mb-1">{ach.organization}</div>
                                            )}
                                            {ach.description && <p className="text-sm text-gray-600">{ach.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills Preview Section */}
                            {skills.some(s => s.skill) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Skills</h2>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {skills.filter(s => s.skill).map((s, index) => (
                                            <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm inline-block mb-1">{s.skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* Custom "Others" Preview Section */}
                            {otherSection.items.some(item => item.content) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-3">{otherSection.title}</h2>
                                    <div className="space-y-2">
                                        {otherSection.items
                                            .filter(item => item.content)
                                            .map((item, index) => (
                                                <div key={index} className="text-gray-600">{item.content}</div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-around">
                            <button
                                onClick={generatePDF}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm print:hidden"
                            >
                                Download Resume
                            </button>
                            <button
                                onClick={fillSampleData}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-green-700 shadow-sm print:hidden"
                            >
                                Fill Sample Data
                            </button>
                            <button
                                onClick={clearFields}
                                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-green-700 shadow-sm print:hidden"
                            >
                                Clear Fields
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}