const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Program = require('../models/Program');

const programs = [
    {
        title: 'Full-Stack Web Development Bootcamp',
        shortDescription: 'Master modern web development with React, Node.js, and MongoDB in this intensive bootcamp.',
        description: 'This comprehensive bootcamp covers everything from HTML/CSS fundamentals to advanced full-stack development. You will learn React for frontend, Node.js/Express for backend, and MongoDB for databases. Build real-world projects including e-commerce platforms, social media apps, and more. Includes job preparation and portfolio building.',
        category: 'Computer Science',
        duration: '16 weeks',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-08-15'),
        tuitionFee: 4999,
        instructor: 'Dr. Sarah Chen',
        image: '/images/web-dev.jpg',
        syllabus: [
            { week: 1, topic: 'HTML & CSS Fundamentals', description: 'Semantic HTML, CSS Grid, Flexbox, Responsive Design' },
            { week: 2, topic: 'JavaScript Essentials', description: 'ES6+, DOM Manipulation, Async Programming' },
            { week: 4, topic: 'React Deep Dive', description: 'Components, Hooks, State Management, React Router' },
            { week: 8, topic: 'Node.js & Express', description: 'REST APIs, Authentication, Middleware' },
            { week: 12, topic: 'MongoDB & Mongoose', description: 'Schema Design, Aggregation, Performance' },
            { week: 16, topic: 'Capstone Project', description: 'Full-stack application with deployment' }
        ],
        requirements: ['Basic computer literacy', 'Logical thinking ability', 'Commitment to 20+ hours/week'],
        learningOutcomes: ['Build production-ready web applications', 'Design and implement RESTful APIs', 'Deploy applications to cloud platforms'],
        tags: ['web development', 'react', 'nodejs', 'mongodb', 'javascript', 'fullstack'],
        maxEnrollment: 40,
        status: 'active'
    },
    {
        title: 'Data Science & Machine Learning',
        shortDescription: 'Learn data science fundamentals, machine learning algorithms, and AI applications with Python.',
        description: 'Dive deep into the world of data science and machine learning. This program covers statistical analysis, data visualization, supervised and unsupervised learning, deep learning, and natural language processing. Work with real datasets from domains like healthcare, finance, and social media.',
        category: 'Data Science',
        duration: '24 weeks',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-10-15'),
        tuitionFee: 6999,
        instructor: 'Prof. James Rodriguez',
        image: '/images/data-science.jpg',
        syllabus: [
            { week: 1, topic: 'Python for Data Science', description: 'NumPy, Pandas, Data Wrangling' },
            { week: 4, topic: 'Statistical Analysis', description: 'Probability, Hypothesis Testing, Regression' },
            { week: 8, topic: 'Machine Learning', description: 'Classification, Clustering, Model Evaluation' },
            { week: 16, topic: 'Deep Learning', description: 'Neural Networks, CNNs, RNNs with TensorFlow' },
            { week: 20, topic: 'NLP & Computer Vision', description: 'Text Processing, Image Recognition' },
            { week: 24, topic: 'Capstone Project', description: 'End-to-end ML pipeline deployment' }
        ],
        requirements: ['Basic Python knowledge', 'High school mathematics', 'Analytical mindset'],
        learningOutcomes: ['Build and deploy ML models', 'Perform statistical analysis', 'Create data visualizations'],
        tags: ['data science', 'machine learning', 'python', 'ai', 'deep learning', 'statistics'],
        maxEnrollment: 35,
        status: 'active'
    },
    {
        title: 'UI/UX Design Masterclass',
        shortDescription: 'Create stunning user interfaces and seamless user experiences with industry-standard tools.',
        description: 'Master the art and science of UI/UX design. Learn design thinking, user research, wireframing, prototyping, and visual design. Work with tools like Figma, Adobe XD, and more. Create a professional portfolio that showcases your design skills to potential employers.',
        category: 'Design',
        duration: '12 weeks',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-06-30'),
        tuitionFee: 3499,
        instructor: 'Maria Gonzalez',
        image: '/images/uiux.jpg',
        syllabus: [
            { week: 1, topic: 'Design Thinking', description: 'Empathize, Define, Ideate, Prototype, Test' },
            { week: 3, topic: 'User Research', description: 'Interviews, Surveys, Personas, Journey Maps' },
            { week: 6, topic: 'Visual Design', description: 'Typography, Color Theory, Layout, Composition' },
            { week: 9, topic: 'Prototyping', description: 'Figma, Interactive Prototypes, Design Systems' },
            { week: 12, topic: 'Portfolio Project', description: 'Complete case study from research to final design' }
        ],
        requirements: ['Creative mindset', 'Basic computer skills', 'Interest in visual design'],
        learningOutcomes: ['Design intuitive user interfaces', 'Conduct user research', 'Create interactive prototypes'],
        tags: ['ui', 'ux', 'design', 'figma', 'user experience', 'visual design'],
        maxEnrollment: 30,
        status: 'active'
    },
    {
        title: 'Cloud Computing & DevOps Engineering',
        shortDescription: 'Master AWS, Docker, Kubernetes, and CI/CD pipelines for modern cloud infrastructure.',
        description: 'Become a cloud and DevOps expert. This program covers major cloud platforms (AWS, GCP), containerization with Docker, orchestration with Kubernetes, infrastructure as code with Terraform, and CI/CD pipeline implementation. Prepare for AWS Solutions Architect certification.',
        category: 'Engineering',
        duration: '16 weeks',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-09-30'),
        tuitionFee: 5499,
        instructor: 'Alex Thompson',
        image: '/images/cloud.jpg',
        syllabus: [
            { week: 1, topic: 'Cloud Fundamentals', description: 'AWS Core Services, Networking, Security' },
            { week: 4, topic: 'Docker & Containers', description: 'Containerization, Docker Compose, Registry' },
            { week: 8, topic: 'Kubernetes', description: 'Orchestration, Deployments, Services, Ingress' },
            { week: 12, topic: 'Infrastructure as Code', description: 'Terraform, CloudFormation, Ansible' },
            { week: 16, topic: 'CI/CD & Monitoring', description: 'Jenkins, GitHub Actions, Prometheus, Grafana' }
        ],
        requirements: ['Linux command line basics', 'Basic networking knowledge', 'Programming experience in any language'],
        learningOutcomes: ['Architect cloud solutions', 'Implement CI/CD pipelines', 'Manage containerized applications'],
        tags: ['cloud', 'devops', 'aws', 'docker', 'kubernetes', 'ci/cd'],
        maxEnrollment: 35,
        status: 'upcoming'
    },
    {
        title: 'Digital Marketing & Analytics',
        shortDescription: 'Learn SEO, social media marketing, PPC, content strategy, and data-driven marketing.',
        description: 'Transform your marketing career with digital expertise. Cover search engine optimization, paid advertising (Google Ads, Facebook Ads), social media strategy, content marketing, email marketing, and marketing analytics. Learn to create data-driven marketing campaigns that deliver results.',
        category: 'Business',
        duration: '8 weeks',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-06-15'),
        tuitionFee: 2499,
        instructor: 'Emily Watson',
        image: '/images/marketing.jpg',
        syllabus: [
            { week: 1, topic: 'Digital Marketing Landscape', description: 'Channels, Funnels, Customer Journey' },
            { week: 3, topic: 'SEO & Content Strategy', description: 'Keyword Research, On-page, Off-page SEO' },
            { week: 5, topic: 'Paid Advertising', description: 'Google Ads, Social Media Ads, Retargeting' },
            { week: 7, topic: 'Analytics & Optimization', description: 'Google Analytics, A/B Testing, ROI' },
            { week: 8, topic: 'Campaign Project', description: 'Plan and execute a complete marketing campaign' }
        ],
        requirements: ['Basic internet skills', 'Interest in marketing', 'Analytical thinking'],
        learningOutcomes: ['Create digital marketing strategies', 'Run paid advertising campaigns', 'Analyze marketing data for insights'],
        tags: ['marketing', 'seo', 'analytics', 'social media', 'advertising', 'business'],
        maxEnrollment: 50,
        status: 'active'
    },
    {
        title: 'Cybersecurity Fundamentals',
        shortDescription: 'Learn ethical hacking, network security, and cybersecurity frameworks to protect digital assets.',
        description: 'Build a solid foundation in cybersecurity. Cover network security, vulnerability assessment, penetration testing, security operations, incident response, and compliance frameworks. Prepare for CompTIA Security+ certification with hands-on labs and real-world scenarios.',
        category: 'Computer Science',
        duration: '12 weeks',
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-08-15'),
        tuitionFee: 4299,
        instructor: 'Dr. Michael Park',
        image: '/images/cybersecurity.jpg',
        syllabus: [
            { week: 1, topic: 'Security Fundamentals', description: 'CIA Triad, Threats, Vulnerabilities' },
            { week: 3, topic: 'Network Security', description: 'Firewalls, IDS/IPS, VPN, Encryption' },
            { week: 6, topic: 'Ethical Hacking', description: 'Penetration Testing, Vulnerability Assessment' },
            { week: 9, topic: 'Incident Response', description: 'SIEM, Forensics, Recovery Procedures' },
            { week: 12, topic: 'Compliance & Governance', description: 'NIST, ISO 27001, GDPR, SOC 2' }
        ],
        requirements: ['Basic networking knowledge', 'Linux familiarity', 'Problem-solving skills'],
        learningOutcomes: ['Identify and mitigate security threats', 'Perform penetration testing', 'Implement security frameworks'],
        tags: ['cybersecurity', 'security', 'ethical hacking', 'network security', 'pentesting'],
        maxEnrollment: 30,
        status: 'active'
    },
    {
        title: 'Healthcare Data Analytics',
        shortDescription: 'Apply data analytics to healthcare with EHR systems, clinical data, and health informatics.',
        description: 'Bridge the gap between healthcare and technology. Learn to analyze electronic health records, clinical trial data, and public health datasets. Understand HIPAA compliance, health informatics standards (HL7, FHIR), and apply machine learning to healthcare challenges.',
        category: 'Health Sciences',
        duration: '16 weeks',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-10-30'),
        tuitionFee: 5299,
        instructor: 'Dr. Lisa Patel',
        image: '/images/health-analytics.jpg',
        syllabus: [
            { week: 1, topic: 'Health Informatics Basics', description: 'EHR Systems, HL7, FHIR Standards' },
            { week: 4, topic: 'Healthcare Data Management', description: 'Clinical Data, HIPAA, Data Quality' },
            { week: 8, topic: 'Statistical Methods in Healthcare', description: 'Biostatistics, Clinical Trials Analysis' },
            { week: 12, topic: 'ML in Healthcare', description: 'Predictive Modeling, Image Analysis' },
            { week: 16, topic: 'Capstone', description: 'Healthcare analytics project with real data' }
        ],
        requirements: ['Basic statistics knowledge', 'Interest in healthcare', 'Basic Python or R'],
        learningOutcomes: ['Analyze clinical and healthcare data', 'Build predictive models for health outcomes', 'Navigate HIPAA and health data regulations'],
        tags: ['healthcare', 'data analytics', 'health informatics', 'clinical data', 'HIPAA'],
        maxEnrollment: 25,
        status: 'upcoming'
    },
    {
        title: 'Creative Writing & Digital Storytelling',
        shortDescription: 'Master the craft of writing for digital platforms including blogs, scripts, and content creation.',
        description: 'Develop your voice as a digital storyteller. Learn narrative techniques, content strategy, scriptwriting, blogging, and multimedia storytelling. Create compelling content for websites, social media, podcasts, and video platforms. Build a professional writing portfolio.',
        category: 'Arts & Humanities',
        duration: '8 weeks',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-05-30'),
        tuitionFee: 1999,
        instructor: 'Rachel Adams',
        image: '/images/writing.jpg',
        syllabus: [
            { week: 1, topic: 'Narrative Foundations', description: 'Story Structure, Voice, Audience Analysis' },
            { week: 3, topic: 'Digital Content Writing', description: 'SEO Writing, Blogging, Social Media Copy' },
            { week: 5, topic: 'Scriptwriting', description: 'Video Scripts, Podcast Scripts, Storyboarding' },
            { week: 7, topic: 'Multimedia Storytelling', description: 'Interactive Content, Visual Narratives' },
            { week: 8, topic: 'Portfolio Workshop', description: 'Curate and present your best work' }
        ],
        requirements: ['Strong interest in writing', 'Basic computer skills', 'English proficiency'],
        learningOutcomes: ['Write compelling digital content', 'Create multimedia stories', 'Build a professional writing portfolio'],
        tags: ['writing', 'storytelling', 'content creation', 'digital media', 'creative'],
        maxEnrollment: 40,
        status: 'active'
    },
    {
        title: 'Online Teaching & Instructional Design',
        shortDescription: 'Learn to design and deliver engaging online courses with modern pedagogical approaches.',
        description: 'Prepare to be an effective online educator. Master learning theories, instructional design models (ADDIE, SAM), e-learning tools, assessment strategies, and accessibility standards. Create your own online course as a capstone project.',
        category: 'Education',
        duration: '12 weeks',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-09-15'),
        tuitionFee: 2999,
        instructor: 'Dr. Thomas Brown',
        image: '/images/education.jpg',
        syllabus: [
            { week: 1, topic: 'Learning Science', description: 'How People Learn, Learning Theories' },
            { week: 3, topic: 'Instructional Design', description: 'ADDIE Model, SAM, Backward Design' },
            { week: 6, topic: 'E-Learning Tools', description: 'LMS, Video Production, Interactive Content' },
            { week: 9, topic: 'Assessment & Analytics', description: 'Formative, Summative, Learning Analytics' },
            { week: 12, topic: 'Course Development', description: 'Create and pilot your own online course' }
        ],
        requirements: ['Teaching or training experience (preferred)', 'Interest in education technology', 'Basic digital skills'],
        learningOutcomes: ['Design effective online courses', 'Apply learning theories to course design', 'Use modern e-learning tools'],
        tags: ['education', 'instructional design', 'online teaching', 'e-learning', 'pedagogy'],
        maxEnrollment: 30,
        status: 'upcoming'
    },
    {
        title: 'Artificial Intelligence & Generative AI',
        shortDescription: 'Explore cutting-edge AI including large language models, generative AI, and prompt engineering.',
        description: 'Get ahead in the AI revolution. Learn about transformer architectures, large language models, generative AI applications, prompt engineering, RAG systems, and AI ethics. Build AI-powered applications using OpenAI, Google Gemini, and open-source models.',
        category: 'Computer Science',
        duration: '12 weeks',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-07-30'),
        tuitionFee: 5999,
        instructor: 'Dr. Aisha Kumar',
        image: '/images/ai.jpg',
        syllabus: [
            { week: 1, topic: 'AI Foundations', description: 'History, Types of AI, Current Landscape' },
            { week: 3, topic: 'Deep Learning', description: 'Neural Networks, Training, Fine-tuning' },
            { week: 6, topic: 'LLMs & Transformers', description: 'Attention, GPT, BERT, Prompt Engineering' },
            { week: 9, topic: 'Generative AI Applications', description: 'Text, Image, Code Generation, RAG' },
            { week: 12, topic: 'AI Project', description: 'Build and deploy an AI-powered application' }
        ],
        requirements: ['Python programming', 'Basic ML knowledge (recommended)', 'Linear algebra basics'],
        learningOutcomes: ['Build AI-powered applications', 'Design effective prompts', 'Understand LLM architectures'],
        tags: ['artificial intelligence', 'generative ai', 'llm', 'machine learning', 'prompt engineering', 'deep learning'],
        maxEnrollment: 30,
        status: 'active'
    },
    {
        title: 'Business Analytics & Strategy',
        shortDescription: 'Learn to drive business decisions with data analytics, visualization, and strategic frameworks.',
        description: 'Combine business acumen with data skills. Learn financial modeling, business intelligence tools (Tableau, Power BI), strategic analysis frameworks, project management, and data-driven decision making. Perfect for aspiring business analysts and consultants.',
        category: 'Business',
        duration: '12 weeks',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-30'),
        tuitionFee: 3999,
        instructor: 'Prof. David Kim',
        image: '/images/business.jpg',
        syllabus: [
            { week: 1, topic: 'Business Fundamentals', description: 'Strategy, Markets, Competitive Analysis' },
            { week: 3, topic: 'Data Analytics for Business', description: 'Excel, SQL, Data Modeling' },
            { week: 6, topic: 'Business Intelligence', description: 'Tableau, Power BI, Dashboard Design' },
            { week: 9, topic: 'Strategic Analysis', description: 'SWOT, Porter\'s Five Forces, BCG Matrix' },
            { week: 12, topic: 'Consulting Project', description: 'Analyze and present a business case' }
        ],
        requirements: ['Basic Excel skills', 'Interest in business', 'Analytical mindset'],
        learningOutcomes: ['Create business intelligence dashboards', 'Perform strategic analysis', 'Make data-driven business recommendations'],
        tags: ['business analytics', 'strategy', 'tableau', 'power bi', 'consulting', 'data analysis'],
        maxEnrollment: 40,
        status: 'active'
    },
    {
        title: 'Mobile App Development with React Native',
        shortDescription: 'Build cross-platform mobile apps for iOS and Android using React Native and Expo.',
        description: 'Create professional mobile applications. This program covers React Native fundamentals, native device features, state management, navigation, API integration, push notifications, and app store deployment. Build multiple real-world apps throughout the course.',
        category: 'Computer Science',
        duration: '12 weeks',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-07-15'),
        tuitionFee: 4499,
        instructor: 'Kevin Zhang',
        image: '/images/mobile.jpg',
        syllabus: [
            { week: 1, topic: 'React Native Basics', description: 'Components, Styling, Expo Setup' },
            { week: 3, topic: 'Navigation & State', description: 'React Navigation, Context, Redux' },
            { week: 6, topic: 'Native Features', description: 'Camera, Location, Push Notifications' },
            { week: 9, topic: 'Backend Integration', description: 'REST APIs, Firebase, Real-time Data' },
            { week: 12, topic: 'App Store Deployment', description: 'Testing, Building, Publishing' }
        ],
        requirements: ['JavaScript proficiency', 'React basics (recommended)', 'Mac for iOS development (optional)'],
        learningOutcomes: ['Build cross-platform mobile apps', 'Integrate native device features', 'Deploy to app stores'],
        tags: ['mobile development', 'react native', 'ios', 'android', 'app development', 'expo'],
        maxEnrollment: 35,
        status: 'active'
    }
];

const users = [
    {
        name: 'Admin Counselor',
        email: 'counselor@learnflow.com',
        password: 'counselor123',
        role: 'counselor',
        phone: '+1-555-0100'
    },
    {
        name: 'Jane Student',
        email: 'student@learnflow.com',
        password: 'student123',
        role: 'student',
        phone: '+1-555-0200'
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Program.deleteMany({});
        console.log('Cleared existing data');

        // Seed users
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${user.name} (${user.role}) - ${user.email}`);
        }

        // Seed programs
        for (const programData of programs) {
            const program = new Program(programData);
            await program.save();
            console.log(`Created program: ${program.title}`);
        }

        console.log('\n✅ Seed completed successfully!');
        console.log('\nTest Accounts:');
        console.log('Counselor: counselor@learnflow.com / counselor123');
        console.log('Student:   student@learnflow.com / student123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
