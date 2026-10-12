/**
 * SkillPath AI — Comprehensive 50-Course Curriculum Registry
 * Categorized into Technology (15), AI & Data (12), Cybersecurity (10), and Business & Career (13).
 */

export const COURSE_CATEGORIES = {
  TECH: 'Technology',
  AI_DATA: 'AI & Data',
  CYBER: 'Cybersecurity',
  BUSINESS: 'Business & Career'
};

export const COURSES = [
  // ==========================================
  // 1. Technology — 15 Courses
  // ==========================================
  {
    id: 1,
    title: 'Python Programming',
    category: COURSE_CATEGORIES.TECH,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Master core Python syntax, OOP principles, data structures, file handling, and automated scripting.',
    tags: ['Python', 'OOP', 'Scripting', 'Backend']
  },
  {
    id: 2,
    title: 'Java Programming',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Object-oriented programming with Java, JVM internals, Collections Framework, multithreading, and Spring basics.',
    tags: ['Java', 'OOP', 'Collections', 'Enterprise']
  },
  {
    id: 3,
    title: 'C Programming Fundamentals',
    category: COURSE_CATEGORIES.TECH,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Foundations of computer systems, memory management, pointers, structs, and low-level algorithmic logic.',
    tags: ['C', 'Pointers', 'Memory', 'Algorithms']
  },
  {
    id: 4,
    title: 'C++ Programming',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Modern C++ (C++17/20), STL containers, memory allocation, operator overloading, and high-performance engineering.',
    tags: ['C++', 'STL', 'Systems', 'Performance']
  },
  {
    id: 5,
    title: 'Full Stack Web Development',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 8,
    minutes: 60,
    description: 'End-to-end web engineering covering HTML5, CSS3, modern JavaScript, Node.js, REST APIs, and databases.',
    tags: ['HTML/CSS', 'JavaScript', 'Node.js', 'Full Stack']
  },
  {
    id: 6,
    title: 'Frontend Web Development',
    category: COURSE_CATEGORIES.TECH,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Build responsive, accessible, and interactive user interfaces using CSS Flexbox/Grid, semantic HTML, and DOM manipulation.',
    tags: ['Frontend', 'CSS', 'UI/UX', 'Responsive']
  },
  {
    id: 7,
    title: 'Backend Development with Node.js',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Server-side microservices, Express.js middleware, JWT authentication, rate limiting, and database connectivity.',
    tags: ['Node.js', 'Express', 'API', 'Backend']
  },
  {
    id: 8,
    title: 'React.js Development',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Component architecture, React Hooks (useState, useEffect, useMemo), state management, routing, and SPA performance.',
    tags: ['React', 'JavaScript', 'SPA', 'Frontend']
  },
  {
    id: 9,
    title: 'Android App Development',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 8,
    minutes: 60,
    description: 'Native Android apps using Kotlin, Jetpack Compose, Material Design 3, Coroutines, and Room database.',
    tags: ['Android', 'Kotlin', 'Jetpack', 'Mobile']
  },
  {
    id: 10,
    title: 'Flutter App Development',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Cross-platform mobile apps for iOS and Android using Dart, widget tree layouts, Provider/Bloc state management.',
    tags: ['Flutter', 'Dart', 'Cross-Platform', 'Mobile']
  },
  {
    id: 11,
    title: 'SQL and Database Management',
    category: COURSE_CATEGORIES.TECH,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Relational database modeling, complex SQL queries, JOINs, indexing, normalization, and ACID transactions.',
    tags: ['SQL', 'PostgreSQL', 'MySQL', 'Database']
  },
  {
    id: 12,
    title: 'Git and GitHub',
    category: COURSE_CATEGORIES.TECH,
    level: 'Beginner',
    weeks: 2,
    minutes: 30,
    description: 'Version control fundamentals, branching strategies, merge conflicts, pull requests, and collaborative open-source workflows.',
    tags: ['Git', 'GitHub', 'CI/CD', 'Collaboration']
  },
  {
    id: 13,
    title: 'Cloud Computing Fundamentals',
    category: COURSE_CATEGORIES.TECH,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'IaaS, PaaS, SaaS architectural models, cloud virtualization, IAM policies, networking, and serverless compute.',
    tags: ['Cloud', 'Infrastructure', 'Networking', 'Security']
  },
  {
    id: 14,
    title: 'AWS Cloud Practitioner',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Preparation for AWS Certified Cloud Practitioner covering EC2, S3, RDS, Lambda, VPC, and CloudWatch.',
    tags: ['AWS', 'Cloud', 'Certification', 'DevOps']
  },
  {
    id: 15,
    title: 'Software Testing and Automation',
    category: COURSE_CATEGORIES.TECH,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Unit testing, integration testing, end-to-end automation with Playwright/Selenium, test assertions, and TDD patterns.',
    tags: ['Testing', 'QA', 'Automation', 'Playwright']
  },

  // ==========================================
  // 2. AI & Data — 12 Courses
  // ==========================================
  {
    id: 16,
    title: 'Artificial Intelligence Fundamentals',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Core concepts of intelligence agents, search algorithms, heuristic evaluation, knowledge graphs, and AI ethics.',
    tags: ['AI', 'Search', 'Agents', 'Ethics']
  },
  {
    id: 17,
    title: 'Machine Learning with Python',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Intermediate',
    weeks: 8,
    minutes: 60,
    description: 'Supervised and unsupervised learning, regression, classification, clustering, scikit-learn, and model evaluation.',
    tags: ['ML', 'Python', 'Scikit-Learn', 'Data']
  },
  {
    id: 18,
    title: 'Deep Learning Fundamentals',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Advanced',
    weeks: 8,
    minutes: 60,
    description: 'Artificial neural networks, backpropagation, CNNs for images, RNNs, and model training using PyTorch/TensorFlow.',
    tags: ['Deep Learning', 'PyTorch', 'Neural Networks']
  },
  {
    id: 19,
    title: 'Generative AI Fundamentals',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Architecture of Large Language Models (LLMs), attention mechanisms, transformers, diffusion models, and APIs.',
    tags: ['GenAI', 'LLM', 'Transformers', 'Gemini']
  },
  {
    id: 20,
    title: 'Prompt Engineering',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Beginner',
    weeks: 2,
    minutes: 30,
    description: 'Few-shot prompting, chain-of-thought, system role definition, structured JSON prompting, and guardrail design.',
    tags: ['Prompt Engineering', 'AI', 'Productivity']
  },
  {
    id: 21,
    title: 'Data Analytics with Excel',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Beginner',
    weeks: 3,
    minutes: 45,
    description: 'Pivot tables, VLOOKUP/XLOOKUP, conditional formatting, statistical formulas, and clean executive summaries.',
    tags: ['Excel', 'Analytics', 'Formulas', 'Reporting']
  },
  {
    id: 22,
    title: 'Data Analysis with Python',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Data wrangling with Pandas, numerical array operations with NumPy, data visualization with Matplotlib and Seaborn.',
    tags: ['Pandas', 'NumPy', 'Data Analysis', 'Python']
  },
  {
    id: 23,
    title: 'Data Science Fundamentals',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Intermediate',
    weeks: 8,
    minutes: 60,
    description: 'End-to-end data lifecycle: exploratory data analysis (EDA), hypothesis testing, feature engineering, and storytelling.',
    tags: ['Data Science', 'Statistics', 'EDA', 'Modeling']
  },
  {
    id: 24,
    title: 'Power BI Dashboard Development',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Power Query ETL, DAX calculated measures, data modeling relationships, and interactive business dashboards.',
    tags: ['Power BI', 'DAX', 'BI', 'Dashboards']
  },
  {
    id: 25,
    title: 'Tableau Data Visualization',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Visual analytics, calculated fields, parameters, interactive filters, storyboards, and KPI executive dashboards.',
    tags: ['Tableau', 'Visualization', 'BI', 'Storytelling']
  },
  {
    id: 26,
    title: 'Natural Language Processing',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Advanced',
    weeks: 6,
    minutes: 60,
    description: 'Tokenization, TF-IDF, sentiment analysis, word embeddings (Word2Vec), and transformer fine-tuning for text.',
    tags: ['NLP', 'Text Analytics', 'Transformers', 'Python']
  },
  {
    id: 27,
    title: 'Computer Vision with OpenCV',
    category: COURSE_CATEGORIES.AI_DATA,
    level: 'Advanced',
    weeks: 6,
    minutes: 60,
    description: 'Image processing, thresholding, edge detection, object tracking, face recognition, and OpenCV with Python.',
    tags: ['Computer Vision', 'OpenCV', 'Image Processing']
  },

  // ==========================================
  // 3. Cybersecurity — 10 Courses
  // ==========================================
  {
    id: 28,
    title: 'Cybersecurity Fundamentals',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'The CIA triad, threat landscape, malware classifications, defense-in-depth, and security hygiene standards.',
    tags: ['Security', 'CIA Triad', 'Malware', 'Basics']
  },
  {
    id: 29,
    title: 'Ethical Hacking Fundamentals',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Reconnaissance, port scanning with Nmap, vulnerability assessment, exploitation basics, and ethical disclosure.',
    tags: ['Ethical Hacking', 'Nmap', 'PenTest', 'Security']
  },
  {
    id: 30,
    title: 'Network Security',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'TCP/IP architecture, firewalls, IDS/IPS, Wireshark packet analysis, VPN protocols, and network segmentation.',
    tags: ['Networking', 'Wireshark', 'Firewalls', 'Protocols']
  },
  {
    id: 31,
    title: 'Penetration Testing Fundamentals',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Methodology-driven penetration testing, Kali Linux tools, Metasploit, privilege escalation, and remediation reporting.',
    tags: ['PenTesting', 'Kali Linux', 'Metasploit']
  },
  {
    id: 32,
    title: 'Linux for Cybersecurity',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Linux shell command mastery, user permissions, process management, log analysis, and automated bash scripting.',
    tags: ['Linux', 'Bash', 'SysAdmin', 'Security']
  },
  {
    id: 33,
    title: 'Digital Forensics',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Evidence preservation, disk imaging, memory forensics, chain of custody, file carving, and forensic reporting.',
    tags: ['Forensics', 'Evidence', 'Investigation', 'Security']
  },
  {
    id: 34,
    title: 'Security Operations Center (SOC) Fundamentals',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'SIEM platforms (Splunk), alert triage, log correlation, threat intelligence feeds, and incident escalation protocols.',
    tags: ['SOC', 'SIEM', 'Splunk', 'Monitoring']
  },
  {
    id: 35,
    title: 'Web Application Security',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'OWASP Top 10 vulnerabilities: SQL Injection, XSS, CSRF, insecure deserialization, and secure coding defenses.',
    tags: ['OWASP', 'Web Security', 'XSS', 'SQLi']
  },
  {
    id: 36,
    title: 'Cryptography Fundamentals',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Symmetric vs asymmetric ciphers (AES, RSA), hashing algorithms (SHA-256), PKI certificates, and SSL/TLS handshakes.',
    tags: ['Cryptography', 'Encryption', 'PKI', 'TLS']
  },
  {
    id: 37,
    title: 'Incident Response and Threat Analysis',
    category: COURSE_CATEGORIES.CYBER,
    level: 'Advanced',
    weeks: 6,
    minutes: 60,
    description: 'NIST incident response framework, root cause analysis, containment strategies, threat hunting, and post-mortem review.',
    tags: ['Incident Response', 'Threat Hunting', 'NIST']
  },

  // ==========================================
  // 4. Business & Career — 13 Courses
  // ==========================================
  {
    id: 38,
    title: 'Microsoft Excel for Professionals',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 3,
    minutes: 30,
    description: 'Worksheet mastery, data cleaning, automated calculations, lookup functions, formatting, and productivity shortcuts.',
    tags: ['Excel', 'Productivity', 'Office', 'Business']
  },
  {
    id: 39,
    title: 'Advanced Excel and Data Reporting',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Dynamic arrays, XLOOKUP, INDEX/MATCH, Power Query automation, macro introductions, and executive financial models.',
    tags: ['Excel', 'Financial Modeling', 'Power Query']
  },
  {
    id: 40,
    title: 'Office Administration',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 3,
    minutes: 30,
    description: 'Executive document workflow, calendar management, professional correspondence, and workplace operational efficiency.',
    tags: ['Admin', 'Operations', 'Management', 'Workplace']
  },
  {
    id: 41,
    title: 'Business Communication Skills',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 3,
    minutes: 30,
    description: 'Persuasive executive writing, clear email etiquette, presentation skills, cross-cultural collaboration, and negotiation.',
    tags: ['Communication', 'Writing', 'Etiquette', 'Soft Skills']
  },
  {
    id: 42,
    title: 'Digital Marketing Fundamentals',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Search Engine Optimization (SEO), Google Analytics, Social Media Marketing (SMM), email campaigns, and conversion funnels.',
    tags: ['Marketing', 'SEO', 'Analytics', 'Growth']
  },
  {
    id: 43,
    title: 'Human Resource Management',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Talent recruitment, onboarding, employee engagement, performance appraisals, labor standards, and HR analytics.',
    tags: ['HR', 'Recruitment', 'Management', 'Talent']
  },
  {
    id: 44,
    title: 'Project Management Fundamentals',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Intermediate',
    weeks: 4,
    minutes: 45,
    description: 'Agile & Scrum frameworks, Sprint planning, Kanban boards, risk registers, scope management, and stakeholder alignment.',
    tags: ['Project Management', 'Agile', 'Scrum', 'Leadership']
  },
  {
    id: 45,
    title: 'Business Analytics',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Intermediate',
    weeks: 6,
    minutes: 60,
    description: 'Data-driven decision making, KPI metric frameworks, customer churn modeling, and market basket analysis.',
    tags: ['Analytics', 'Business', 'Strategy', 'KPIs']
  },
  {
    id: 46,
    title: 'Resume Building and ATS Optimization',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 2,
    minutes: 30,
    description: 'Crafting ATS-friendly resumes, action-oriented bullet points, LinkedIn profile branding, and portfolio positioning.',
    tags: ['Resume', 'Career', 'ATS', 'LinkedIn']
  },
  {
    id: 47,
    title: 'Interview Preparation for Freshers',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 2,
    minutes: 30,
    description: 'STAR methodology for behavioral questions, technical round strategy, salary negotiation basics, and mock practice.',
    tags: ['Interview', 'Career', 'Freshers', 'HR Round']
  },
  {
    id: 48,
    title: 'Spoken English and Communication',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 4,
    minutes: 30,
    description: 'Fluency development, professional vocabulary, conversational confidence, pronunciation, and meeting dialogue.',
    tags: ['English', 'Communication', 'Fluency', 'Soft Skills']
  },
  {
    id: 49,
    title: 'Aptitude and Logical Reasoning',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 4,
    minutes: 45,
    description: 'Quantitative aptitude, pattern recognition, syllogisms, data interpretation, and placement test preparation.',
    tags: ['Aptitude', 'Reasoning', 'Placement', 'Logic']
  },
  {
    id: 50,
    title: 'Leadership and Time Management',
    category: COURSE_CATEGORIES.BUSINESS,
    level: 'Beginner',
    weeks: 2,
    minutes: 30,
    description: 'Eisenhower matrix prioritization, team motivation, conflict resolution, emotional intelligence, and goal setting.',
    tags: ['Leadership', 'Time Management', 'Productivity']
  }
];
