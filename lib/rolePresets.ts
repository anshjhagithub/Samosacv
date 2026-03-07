/**
 * Role presets for onboarding and the resume flow.
 * Each preset maps skills, summary templates, and suggested projects.
 */

export type RoleId =
  | "data-analyst"
  | "ai-engineer"
  | "software-developer"
  | "frontend-developer"
  | "backend-developer"
  | "fullstack-developer"
  | "mobile-developer"
  | "devops-engineer"
  | "cloud-engineer"
  | "data-scientist"
  | "ml-engineer"
  | "data-engineer"
  | "product-manager"
  | "project-manager"
  | "business-analyst"
  | "marketing-analyst"
  | "digital-marketer"
  | "content-writer"
  | "seo-specialist"
  | "social-media-manager"
  | "ux-designer"
  | "ui-designer"
  | "graphic-designer"
  | "product-designer"
  | "qa-engineer"
  | "security-engineer"
  | "network-engineer"
  | "systems-administrator"
  | "database-administrator"
  | "solutions-architect"
  | "technical-writer"
  | "scrum-master"
  | "sales-executive"
  | "account-manager"
  | "hr-manager"
  | "recruiter"
  | "financial-analyst"
  | "accountant"
  | "investment-banker"
  | "management-consultant"
  | "operations-manager"
  | "supply-chain-analyst"
  | "mechanical-engineer"
  | "electrical-engineer"
  | "civil-engineer"
  | "biomedical-engineer"
  | "research-scientist"
  | "pharmacist"
  | "nurse"
  | "teacher"
  | "lawyer"
  | "journalist"
  | "video-editor"
  | "photographer"
  | "customer-success"
  | "technical-support"
  | "blockchain-developer"
  | "game-developer"
  | "ar-vr-developer"
  | "ai-researcher"
  | "robotics-engineer"
  | "ecommerce-specialist"
  | "dotnet-developer"
  | "java-developer"
  | "python-developer"
  | "react-developer"
  | "sap-developer"
  | "sql-developer"
  | "etl-developer"
  | "web-designer"
  | "data-architect"
  | "cloud-architect"
  | "cybersecurity-analyst"
  | "healthcare-professional"
  | "chef"
  | "banking-professional"
  | "aviation-professional"
  | "architect"
  | "bpo-specialist"
  | "construction-manager"
  | "public-relations"
  | "business-development"
  | "other";

export interface RolePreset {
  id: RoleId;
  label: string;
  skills: string[];
  summaryTemplate: string;
  suggestedProjects: { title: string; oneLiner: string }[];
}

export const rolePresets: Record<RoleId, RolePreset> = {
  "data-analyst": {
    id: "data-analyst",
    label: "Data Analyst",
    skills: ["Python", "SQL", "Power BI", "Excel", "Tableau", "Statistics", "Data Visualization", "Pandas"],
    summaryTemplate: "Detail-oriented Data Analyst with experience turning complex datasets into actionable insights. Skilled in SQL, Python, and visualization tools to drive data-driven decision-making.",
    suggestedProjects: [
      { title: "Sales Dashboard with Power BI", oneLiner: "Built interactive dashboard tracking $2M+ quarterly sales across 5 regions" },
      { title: "Customer Churn Prediction", oneLiner: "Analyzed 50K customer records to predict churn with 85% accuracy using Python" },
      { title: "Marketing Campaign Analysis", oneLiner: "Evaluated ROI of 12 campaigns, identifying top performers and saving 20% budget" },
    ],
  },
  "ai-engineer": {
    id: "ai-engineer",
    label: "AI Engineer",
    skills: ["Python", "PyTorch", "TensorFlow", "LLMs", "MLOps", "NLP", "Hugging Face", "LangChain"],
    summaryTemplate: "AI Engineer with experience building and deploying machine learning systems. Proficient in deep learning frameworks, LLMs, and production ML pipelines.",
    suggestedProjects: [
      { title: "RAG-powered Q&A System", oneLiner: "Built retrieval-augmented generation system over 10K docs using LangChain and GPT-4" },
      { title: "Real-time Object Detection", oneLiner: "Deployed YOLOv8 model achieving 92% mAP for warehouse automation" },
      { title: "Fine-tuned LLM for Code Review", oneLiner: "Fine-tuned Llama 2 on 50K code reviews, reducing manual review time by 40%" },
    ],
  },
  "software-developer": {
    id: "software-developer",
    label: "Software Developer",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Git", "REST APIs", "Python", "SQL"],
    summaryTemplate: "Software Developer focused on building scalable, maintainable applications. Strong foundation in modern web technologies and clean architecture.",
    suggestedProjects: [
      { title: "E-commerce Platform", oneLiner: "Built full-stack marketplace with React, Node.js, and Stripe payments" },
      { title: "Task Management App", oneLiner: "Developed real-time task board with drag-and-drop using WebSockets" },
      { title: "REST API Microservice", oneLiner: "Designed and deployed microservice handling 10K+ requests/min on AWS" },
    ],
  },
  "frontend-developer": {
    id: "frontend-developer",
    label: "Frontend Developer",
    skills: ["React", "TypeScript", "Next.js", "CSS/Tailwind", "JavaScript", "HTML5", "Redux", "Figma"],
    summaryTemplate: "Frontend Developer passionate about creating fast, accessible, and beautiful user interfaces. Expert in React ecosystem and modern CSS.",
    suggestedProjects: [
      { title: "Design System Library", oneLiner: "Built reusable component library with Storybook, adopted by 4 teams" },
      { title: "Progressive Web App", oneLiner: "Created offline-first PWA with 95+ Lighthouse score and push notifications" },
      { title: "Data Visualization Dashboard", oneLiner: "Built interactive charts with D3.js rendering 100K+ data points smoothly" },
    ],
  },
  "backend-developer": {
    id: "backend-developer",
    label: "Backend Developer",
    skills: ["Node.js", "Python", "Java", "PostgreSQL", "Redis", "Docker", "REST APIs", "GraphQL"],
    summaryTemplate: "Backend Developer specializing in high-performance APIs and distributed systems. Experienced with microservices architecture and database optimization.",
    suggestedProjects: [
      { title: "Payment Processing Service", oneLiner: "Built PCI-compliant payment microservice handling $5M+ monthly transactions" },
      { title: "Real-time Chat System", oneLiner: "Designed WebSocket-based chat supporting 50K concurrent users" },
      { title: "ETL Data Pipeline", oneLiner: "Built automated pipeline processing 2M records/day with 99.9% uptime" },
    ],
  },
  "fullstack-developer": {
    id: "fullstack-developer",
    label: "Full Stack Developer",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "GraphQL", "MongoDB"],
    summaryTemplate: "Full Stack Developer building end-to-end solutions from database to UI. Equally comfortable with frontend polish and backend performance.",
    suggestedProjects: [
      { title: "SaaS Platform", oneLiner: "Built multi-tenant SaaS app with React, Node.js, Stripe, and role-based auth" },
      { title: "Social Media Dashboard", oneLiner: "Created analytics platform integrating 5 social APIs with real-time metrics" },
      { title: "Booking System", oneLiner: "Developed appointment scheduling system with calendar sync and notifications" },
    ],
  },
  "mobile-developer": {
    id: "mobile-developer",
    label: "Mobile Developer",
    skills: ["React Native", "Swift", "Kotlin", "Flutter", "Firebase", "REST APIs", "UI/UX", "App Store"],
    summaryTemplate: "Mobile Developer creating polished, performant apps for iOS and Android. Experienced in cross-platform and native development.",
    suggestedProjects: [
      { title: "Fitness Tracking App", oneLiner: "Built cross-platform fitness app with React Native, 50K+ downloads" },
      { title: "E-wallet Application", oneLiner: "Developed secure mobile wallet with biometric auth and UPI integration" },
      { title: "Food Delivery App", oneLiner: "Created real-time delivery tracking app with maps and push notifications" },
    ],
  },
  "devops-engineer": {
    id: "devops-engineer",
    label: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Jenkins", "Linux", "Monitoring"],
    summaryTemplate: "DevOps Engineer automating infrastructure and deployment pipelines. Focused on reliability, scalability, and developer productivity.",
    suggestedProjects: [
      { title: "CI/CD Pipeline Automation", oneLiner: "Built GitLab CI pipeline reducing deployment time from 2 hours to 15 minutes" },
      { title: "Kubernetes Migration", oneLiner: "Migrated 20+ services to K8s, achieving 99.99% uptime" },
      { title: "Infrastructure as Code", oneLiner: "Managed 50+ AWS resources with Terraform, reducing manual ops by 80%" },
    ],
  },
  "cloud-engineer": {
    id: "cloud-engineer",
    label: "Cloud Engineer",
    skills: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation", "Networking", "Security", "Serverless"],
    summaryTemplate: "Cloud Engineer designing and managing scalable cloud infrastructure. Deep expertise in AWS/Azure with focus on cost optimization and security.",
    suggestedProjects: [
      { title: "Multi-region Cloud Architecture", oneLiner: "Designed AWS multi-region setup with auto-failover and 99.99% availability" },
      { title: "Serverless API Platform", oneLiner: "Built event-driven platform using Lambda, API Gateway, and DynamoDB" },
      { title: "Cloud Cost Optimization", oneLiner: "Reduced monthly cloud spend by 40% through right-sizing and reserved instances" },
    ],
  },
  "data-scientist": {
    id: "data-scientist",
    label: "Data Scientist",
    skills: ["Python", "R", "Machine Learning", "Statistics", "SQL", "Scikit-learn", "Pandas", "Deep Learning"],
    summaryTemplate: "Data Scientist combining statistical rigor with machine learning to solve complex business problems. Published researcher with industry experience.",
    suggestedProjects: [
      { title: "Recommendation Engine", oneLiner: "Built collaborative filtering system increasing engagement by 25%" },
      { title: "Fraud Detection Model", oneLiner: "Developed ML pipeline detecting 95% of fraudulent transactions in real-time" },
      { title: "A/B Testing Framework", oneLiner: "Created statistical testing platform used by 10+ product teams" },
    ],
  },
  "ml-engineer": {
    id: "ml-engineer",
    label: "ML Engineer",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "Kubernetes", "Feature Engineering", "AWS SageMaker"],
    summaryTemplate: "ML Engineer bridging research and production. Expert at deploying, monitoring, and scaling machine learning models in production.",
    suggestedProjects: [
      { title: "ML Model Serving Platform", oneLiner: "Built model serving infrastructure handling 1M+ predictions/day" },
      { title: "Feature Store", oneLiner: "Designed centralized feature store reducing feature engineering time by 60%" },
      { title: "Automated Model Retraining", oneLiner: "Built MLOps pipeline with drift detection and automated retraining" },
    ],
  },
  "data-engineer": {
    id: "data-engineer",
    label: "Data Engineer",
    skills: ["Python", "SQL", "Spark", "Airflow", "AWS/GCP", "Kafka", "dbt", "Data Modeling"],
    summaryTemplate: "Data Engineer building reliable, scalable data pipelines and warehouses. Expert in ETL/ELT processes and modern data stack.",
    suggestedProjects: [
      { title: "Real-time Data Pipeline", oneLiner: "Built Kafka + Spark streaming pipeline processing 500K events/hour" },
      { title: "Data Warehouse Migration", oneLiner: "Migrated legacy warehouse to Snowflake, reducing query times by 10x" },
      { title: "ETL Orchestration with Airflow", oneLiner: "Designed 50+ DAGs processing data from 15 sources daily" },
    ],
  },
  "product-manager": {
    id: "product-manager",
    label: "Product Manager",
    skills: ["Roadmapping", "Agile", "User Research", "Stakeholder Management", "Metrics", "Prioritization", "Jira", "Analytics"],
    summaryTemplate: "Product Manager with a track record of shipping products users love. Combines user research, data, and cross-functional collaboration to deliver impact.",
    suggestedProjects: [
      { title: "Feature Launch — Onboarding Redesign", oneLiner: "Led redesign increasing activation by 35% and reducing drop-off by 20%" },
      { title: "Product Strategy for B2B SaaS", oneLiner: "Defined 12-month roadmap resulting in 50% revenue growth" },
      { title: "User Research Program", oneLiner: "Established interview program with 200+ users, driving 5 key features" },
    ],
  },
  "project-manager": {
    id: "project-manager",
    label: "Project Manager",
    skills: ["Agile/Scrum", "Jira", "Stakeholder Communication", "Risk Management", "Budgeting", "MS Project", "Resource Planning"],
    summaryTemplate: "Project Manager delivering complex projects on time and within budget. PMP-certified with expertise in agile methodologies and cross-functional team leadership.",
    suggestedProjects: [
      { title: "Enterprise Software Implementation", oneLiner: "Led 15-person team delivering ERP migration on time and 10% under budget" },
      { title: "Office Relocation Project", oneLiner: "Managed $2M office move for 500 employees with zero business disruption" },
      { title: "Product Launch Coordination", oneLiner: "Coordinated 8-team product launch hitting all 25 milestones on schedule" },
    ],
  },
  "business-analyst": {
    id: "business-analyst",
    label: "Business Analyst",
    skills: ["Requirements Gathering", "SQL", "Excel", "Tableau", "Process Mapping", "JIRA", "Stakeholder Management", "Agile"],
    summaryTemplate: "Business Analyst bridging business needs and technology solutions. Expert at requirements analysis, process improvement, and data-driven recommendations.",
    suggestedProjects: [
      { title: "Process Automation Analysis", oneLiner: "Identified 15 automation opportunities saving 2,000 hours/year" },
      { title: "CRM Requirements Documentation", oneLiner: "Gathered requirements from 50+ stakeholders for Salesforce implementation" },
      { title: "KPI Dashboard Development", oneLiner: "Designed executive dashboard tracking 20 KPIs across 4 business units" },
    ],
  },
  "marketing-analyst": {
    id: "marketing-analyst",
    label: "Marketing Analyst",
    skills: ["Google Analytics", "SEO", "A/B Testing", "Campaign Analysis", "Excel", "Data Storytelling", "SQL", "HubSpot"],
    summaryTemplate: "Marketing Analyst skilled in turning campaign and funnel data into clear narratives. Experience with analytics platforms, experimentation, and growth metrics.",
    suggestedProjects: [
      { title: "Marketing Attribution Model", oneLiner: "Built multi-touch attribution model improving ROAS by 30%" },
      { title: "Email Campaign Optimization", oneLiner: "A/B tested 50+ email variants, increasing open rates from 18% to 32%" },
      { title: "SEO Traffic Analysis", oneLiner: "Analyzed 10K keywords to prioritize content strategy, growing organic traffic 45%" },
    ],
  },
  "digital-marketer": {
    id: "digital-marketer",
    label: "Digital Marketer",
    skills: ["Google Ads", "Meta Ads", "SEO", "Content Marketing", "Email Marketing", "Analytics", "Social Media", "CRM"],
    summaryTemplate: "Digital Marketer driving growth through data-driven campaigns across paid, organic, and email channels.",
    suggestedProjects: [
      { title: "PPC Campaign Management", oneLiner: "Managed $500K annual ad spend with 3.5x ROAS across Google and Meta" },
      { title: "Lead Generation Funnel", oneLiner: "Built multi-channel funnel generating 2,000+ qualified leads/month" },
      { title: "Brand Awareness Campaign", oneLiner: "Launched awareness campaign reaching 5M impressions with 2% engagement rate" },
    ],
  },
  "content-writer": {
    id: "content-writer",
    label: "Content Writer",
    skills: ["Copywriting", "SEO Writing", "Blog Writing", "Content Strategy", "Research", "Editing", "WordPress", "Analytics"],
    summaryTemplate: "Content Writer creating compelling, SEO-optimized content that drives traffic and conversions. Versatile across blog posts, landing pages, and technical documentation.",
    suggestedProjects: [
      { title: "Blog Content Strategy", oneLiner: "Wrote 100+ articles driving 200K monthly organic visits" },
      { title: "Product Launch Copy", oneLiner: "Created launch copy for SaaS product, contributing to 500 sign-ups in week one" },
      { title: "Technical Documentation", oneLiner: "Wrote developer docs for API platform used by 10K+ developers" },
    ],
  },
  "seo-specialist": {
    id: "seo-specialist",
    label: "SEO Specialist",
    skills: ["SEO", "Google Search Console", "Ahrefs", "Technical SEO", "Content Strategy", "Link Building", "Analytics", "Schema Markup"],
    summaryTemplate: "SEO Specialist growing organic traffic through technical optimization, content strategy, and link building. Data-driven approach to search visibility.",
    suggestedProjects: [
      { title: "Technical SEO Audit", oneLiner: "Audited 5K-page site, fixing critical issues and improving crawl efficiency 40%" },
      { title: "Organic Traffic Growth", oneLiner: "Grew organic traffic from 50K to 200K monthly visits in 8 months" },
      { title: "Local SEO Campaign", oneLiner: "Optimized GMB profiles for 25 locations, increasing local leads by 60%" },
    ],
  },
  "social-media-manager": {
    id: "social-media-manager",
    label: "Social Media Manager",
    skills: ["Instagram", "LinkedIn", "Twitter/X", "Content Creation", "Community Management", "Analytics", "Canva", "Scheduling Tools"],
    summaryTemplate: "Social Media Manager building engaged communities and driving brand awareness across platforms. Creative storyteller with a data-driven approach.",
    suggestedProjects: [
      { title: "Instagram Growth Strategy", oneLiner: "Grew brand account from 5K to 100K followers in 6 months organically" },
      { title: "Viral Content Campaign", oneLiner: "Created campaign reaching 2M+ impressions with 5% engagement rate" },
      { title: "Community Management", oneLiner: "Managed 50K-member community with 95% positive sentiment score" },
    ],
  },
  "ux-designer": {
    id: "ux-designer",
    label: "UX Designer",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing", "Information Architecture", "Design Systems"],
    summaryTemplate: "UX Designer creating intuitive, user-centered digital experiences. Expert in research-driven design that improves usability and business metrics.",
    suggestedProjects: [
      { title: "App Onboarding Redesign", oneLiner: "Redesigned onboarding flow increasing completion rate from 40% to 75%" },
      { title: "Design System", oneLiner: "Built comprehensive design system adopted across 3 product teams" },
      { title: "User Research Study", oneLiner: "Conducted 30+ user interviews uncovering 5 critical usability issues" },
    ],
  },
  "ui-designer": {
    id: "ui-designer",
    label: "UI Designer",
    skills: ["Figma", "Adobe XD", "Design Systems", "Typography", "Color Theory", "Responsive Design", "Interaction Design"],
    summaryTemplate: "UI Designer crafting pixel-perfect, accessible interfaces. Passionate about visual hierarchy, micro-interactions, and brand-consistent design.",
    suggestedProjects: [
      { title: "Mobile App UI Kit", oneLiner: "Designed 200+ component UI kit used across iOS and Android apps" },
      { title: "Website Redesign", oneLiner: "Led visual redesign increasing time-on-site by 40% and reducing bounce rate" },
      { title: "Dark Mode Implementation", oneLiner: "Designed and implemented dark mode across product, improving accessibility scores" },
    ],
  },
  "graphic-designer": {
    id: "graphic-designer",
    label: "Graphic Designer",
    skills: ["Photoshop", "Illustrator", "InDesign", "Brand Identity", "Typography", "Print Design", "Canva", "Motion Graphics"],
    summaryTemplate: "Graphic Designer with a strong eye for visual storytelling and brand identity. Experienced across digital, print, and motion design.",
    suggestedProjects: [
      { title: "Brand Identity Package", oneLiner: "Created complete brand identity for startup — logo, typography, color system" },
      { title: "Marketing Collateral Suite", oneLiner: "Designed 50+ pieces for product launch including brochures, banners, social assets" },
      { title: "Packaging Design", oneLiner: "Designed product packaging increasing shelf appeal and 20% sales lift" },
    ],
  },
  "product-designer": {
    id: "product-designer",
    label: "Product Designer",
    skills: ["Figma", "Design Thinking", "Prototyping", "User Research", "Systems Design", "Interaction Design", "Analytics"],
    summaryTemplate: "Product Designer combining strategy, research, and craft to ship products that delight users and drive business outcomes.",
    suggestedProjects: [
      { title: "End-to-End Feature Design", oneLiner: "Designed checkout flow reducing cart abandonment by 25%" },
      { title: "Cross-platform Design System", oneLiner: "Created design system serving web, iOS, and Android with 300+ tokens" },
      { title: "0-to-1 Product Design", oneLiner: "Designed MVP for fintech product from concept to launch in 3 months" },
    ],
  },
  "qa-engineer": {
    id: "qa-engineer",
    label: "QA Engineer",
    skills: ["Selenium", "Cypress", "API Testing", "Test Automation", "JIRA", "CI/CD", "Performance Testing", "Python/Java"],
    summaryTemplate: "QA Engineer ensuring software quality through comprehensive test strategies. Expert in automation frameworks and CI/CD integration.",
    suggestedProjects: [
      { title: "Test Automation Framework", oneLiner: "Built Selenium framework with 500+ test cases reducing manual testing 70%" },
      { title: "Performance Testing Suite", oneLiner: "Created JMeter suite identifying bottlenecks, improving response times 50%" },
      { title: "CI/CD Test Integration", oneLiner: "Integrated automated tests into pipeline catching 95% of regressions pre-deploy" },
    ],
  },
  "security-engineer": {
    id: "security-engineer",
    label: "Security Engineer",
    skills: ["Penetration Testing", "OWASP", "Security Audits", "SIEM", "Compliance", "Cloud Security", "Python", "Network Security"],
    summaryTemplate: "Security Engineer protecting systems and data through proactive security measures. Expert in vulnerability assessment, incident response, and compliance.",
    suggestedProjects: [
      { title: "Security Audit Program", oneLiner: "Led quarterly security audits across 30+ applications, remediating 200+ vulnerabilities" },
      { title: "SIEM Implementation", oneLiner: "Deployed SIEM solution monitoring 50+ systems with automated alerting" },
      { title: "Zero Trust Architecture", oneLiner: "Designed zero-trust network architecture reducing attack surface by 60%" },
    ],
  },
  "network-engineer": {
    id: "network-engineer",
    label: "Network Engineer",
    skills: ["Cisco", "Routing/Switching", "Firewalls", "VPN", "Network Monitoring", "TCP/IP", "Cloud Networking", "Troubleshooting"],
    summaryTemplate: "Network Engineer designing and maintaining robust network infrastructure. Certified in Cisco technologies with expertise in cloud networking.",
    suggestedProjects: [
      { title: "Network Redesign", oneLiner: "Redesigned campus network for 2,000 users with 99.99% uptime" },
      { title: "SD-WAN Migration", oneLiner: "Migrated 15 branch offices to SD-WAN, reducing costs by 35%" },
      { title: "Network Monitoring System", oneLiner: "Implemented monitoring for 500+ devices with automated alerting" },
    ],
  },
  "systems-administrator": {
    id: "systems-administrator",
    label: "Systems Administrator",
    skills: ["Linux", "Windows Server", "Active Directory", "VMware", "Scripting", "Backup/Recovery", "Monitoring", "Security"],
    summaryTemplate: "Systems Administrator managing enterprise infrastructure with focus on reliability, security, and automation.",
    suggestedProjects: [
      { title: "Server Migration", oneLiner: "Migrated 100+ servers to virtualized environment with zero downtime" },
      { title: "Backup Automation", oneLiner: "Automated backup processes achieving RPO of 1 hour and RTO of 4 hours" },
      { title: "Monitoring Dashboard", oneLiner: "Built Grafana dashboard monitoring 200+ servers and services" },
    ],
  },
  "database-administrator": {
    id: "database-administrator",
    label: "Database Administrator",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Performance Tuning", "Backup/Recovery", "Replication", "SQL", "Cloud Databases"],
    summaryTemplate: "Database Administrator ensuring data availability, performance, and security. Expert in query optimization and database architecture.",
    suggestedProjects: [
      { title: "Database Performance Optimization", oneLiner: "Tuned queries reducing average response time from 2s to 100ms" },
      { title: "High Availability Setup", oneLiner: "Configured master-slave replication with automatic failover for 99.99% uptime" },
      { title: "Database Migration", oneLiner: "Migrated 5TB database from Oracle to PostgreSQL with zero data loss" },
    ],
  },
  "solutions-architect": {
    id: "solutions-architect",
    label: "Solutions Architect",
    skills: ["AWS", "System Design", "Microservices", "API Design", "Cloud Architecture", "Security", "Cost Optimization", "Technical Leadership"],
    summaryTemplate: "Solutions Architect designing scalable, cost-effective cloud architectures. Bridges business requirements with technical solutions across complex environments.",
    suggestedProjects: [
      { title: "Microservices Architecture", oneLiner: "Designed microservices architecture supporting 10M+ daily active users" },
      { title: "Cloud Migration Strategy", oneLiner: "Led cloud migration of 50+ applications to AWS, reducing costs by 40%" },
      { title: "API Gateway Design", oneLiner: "Architected centralized API gateway handling 100K+ requests/second" },
    ],
  },
  "technical-writer": {
    id: "technical-writer",
    label: "Technical Writer",
    skills: ["Documentation", "API Docs", "Markdown", "Git", "Developer Experience", "Diagrams", "Style Guides", "Content Management"],
    summaryTemplate: "Technical Writer creating clear, developer-friendly documentation. Expert at translating complex technical concepts into accessible content.",
    suggestedProjects: [
      { title: "API Documentation Portal", oneLiner: "Created comprehensive API docs adopted by 5K+ developers" },
      { title: "Knowledge Base", oneLiner: "Built internal knowledge base reducing support tickets by 30%" },
      { title: "Developer Onboarding Guide", oneLiner: "Wrote onboarding docs cutting new developer ramp-up time from 4 weeks to 1" },
    ],
  },
  "scrum-master": {
    id: "scrum-master",
    label: "Scrum Master",
    skills: ["Scrum", "Kanban", "Agile Coaching", "JIRA", "Facilitation", "Retrospectives", "Metrics", "Team Building"],
    summaryTemplate: "Scrum Master fostering high-performing agile teams. Certified practitioner focused on removing impediments and continuous improvement.",
    suggestedProjects: [
      { title: "Agile Transformation", oneLiner: "Led 3-team agile transformation increasing velocity by 40%" },
      { title: "Sprint Optimization", oneLiner: "Improved sprint completion rate from 60% to 90% through better estimation" },
      { title: "Cross-team Coordination", oneLiner: "Facilitated PI planning for 8 teams delivering integrated product releases" },
    ],
  },
  "sales-executive": {
    id: "sales-executive",
    label: "Sales Executive",
    skills: ["Salesforce", "Lead Generation", "Negotiation", "CRM", "Pipeline Management", "Cold Outreach", "Presentations", "Closing"],
    summaryTemplate: "Sales Executive consistently exceeding targets through strategic prospecting and relationship building. Expert at enterprise and B2B sales cycles.",
    suggestedProjects: [
      { title: "Enterprise Account Win", oneLiner: "Closed $500K annual contract with Fortune 500 company through 6-month sales cycle" },
      { title: "Sales Process Optimization", oneLiner: "Redesigned sales playbook increasing close rate from 15% to 28%" },
      { title: "Partnership Development", oneLiner: "Built strategic partnership channel generating 30% of quarterly revenue" },
    ],
  },
  "account-manager": {
    id: "account-manager",
    label: "Account Manager",
    skills: ["Client Relations", "Upselling", "CRM", "Contract Negotiation", "Strategic Planning", "Communication", "Problem Solving"],
    summaryTemplate: "Account Manager building long-term client relationships and driving account growth. Focused on client satisfaction and revenue expansion.",
    suggestedProjects: [
      { title: "Account Retention Program", oneLiner: "Achieved 95% retention rate across $5M portfolio of enterprise accounts" },
      { title: "Upsell Campaign", oneLiner: "Identified and closed $200K in upsell opportunities within existing accounts" },
      { title: "Client Success Framework", oneLiner: "Built QBR framework improving client satisfaction scores by 25%" },
    ],
  },
  "hr-manager": {
    id: "hr-manager",
    label: "HR Manager",
    skills: ["Recruitment", "Employee Relations", "HRIS", "Compliance", "Performance Management", "Training", "Policy Development", "Culture"],
    summaryTemplate: "HR Manager creating positive workplace culture and streamlined people operations. Expert in talent management, compliance, and organizational development.",
    suggestedProjects: [
      { title: "Hiring Process Redesign", oneLiner: "Reduced time-to-hire from 45 to 20 days while improving quality of hires" },
      { title: "Employee Engagement Program", oneLiner: "Launched engagement initiative increasing eNPS from 30 to 65" },
      { title: "HRIS Implementation", oneLiner: "Led BambooHR implementation for 500-person company, digitizing all HR processes" },
    ],
  },
  "recruiter": {
    id: "recruiter",
    label: "Recruiter",
    skills: ["Sourcing", "LinkedIn Recruiting", "ATS", "Interviewing", "Employer Branding", "Negotiation", "Pipeline Management", "Diversity Hiring"],
    summaryTemplate: "Recruiter with a talent for identifying and attracting top candidates. Data-driven approach to sourcing, screening, and closing talent.",
    suggestedProjects: [
      { title: "Tech Hiring Sprint", oneLiner: "Hired 25 engineers in 3 months for Series B startup with 90% retention" },
      { title: "Employer Brand Campaign", oneLiner: "Built employer branding content increasing inbound applications by 60%" },
      { title: "Diversity Hiring Initiative", oneLiner: "Launched D&I recruiting program increasing diverse hires by 40%" },
    ],
  },
  "financial-analyst": {
    id: "financial-analyst",
    label: "Financial Analyst",
    skills: ["Financial Modeling", "Excel", "Valuation", "Forecasting", "Bloomberg", "SQL", "Power BI", "Accounting"],
    summaryTemplate: "Financial Analyst providing data-driven insights for strategic decision-making. Expert in financial modeling, forecasting, and variance analysis.",
    suggestedProjects: [
      { title: "Financial Model — M&A", oneLiner: "Built DCF and comparable analysis model for $50M acquisition target" },
      { title: "Budget Forecasting System", oneLiner: "Developed rolling forecast model improving budget accuracy from 80% to 95%" },
      { title: "Cost Reduction Analysis", oneLiner: "Identified $2M in annual savings through operational cost analysis" },
    ],
  },
  accountant: {
    id: "accountant",
    label: "Accountant",
    skills: ["Tally", "SAP", "Tax Filing", "Audit", "GST", "Financial Reporting", "Excel", "Compliance"],
    summaryTemplate: "Accountant ensuring accurate financial reporting and regulatory compliance. Experienced in tax planning, auditing, and ERP systems.",
    suggestedProjects: [
      { title: "GST Compliance Automation", oneLiner: "Automated GST filing process reducing errors by 90% and saving 20 hours/month" },
      { title: "Annual Audit Management", oneLiner: "Managed audit for $10M company achieving clean audit opinion" },
      { title: "Financial Reporting Dashboard", oneLiner: "Built automated P&L and BS reporting with month-end close in 3 days" },
    ],
  },
  "investment-banker": {
    id: "investment-banker",
    label: "Investment Banker",
    skills: ["Financial Modeling", "Valuation", "M&A", "Due Diligence", "Pitch Books", "Bloomberg", "Capital Markets", "Excel"],
    summaryTemplate: "Investment Banking professional with deal execution experience across M&A, IPOs, and debt raising. Strong financial modeling and client management skills.",
    suggestedProjects: [
      { title: "M&A Advisory — Tech Sector", oneLiner: "Advised on $200M acquisition in SaaS space from due diligence to close" },
      { title: "IPO Preparation", oneLiner: "Prepared IPO documentation and investor presentations for $500M listing" },
      { title: "Debt Restructuring", oneLiner: "Led financial restructuring for distressed company, saving 500 jobs" },
    ],
  },
  "management-consultant": {
    id: "management-consultant",
    label: "Management Consultant",
    skills: ["Strategy", "Business Analysis", "PowerPoint", "Excel", "Client Management", "Market Research", "Process Improvement", "Frameworks"],
    summaryTemplate: "Management Consultant solving complex business problems for Fortune 500 clients. Expert in strategy, operations, and organizational transformation.",
    suggestedProjects: [
      { title: "Digital Transformation Strategy", oneLiner: "Developed 3-year digital strategy for $5B manufacturing company" },
      { title: "Market Entry Analysis", oneLiner: "Assessed 10 markets for client expansion, recommending 3 priority entries" },
      { title: "Cost Optimization Program", oneLiner: "Identified $15M annual savings through supply chain optimization" },
    ],
  },
  "operations-manager": {
    id: "operations-manager",
    label: "Operations Manager",
    skills: ["Process Improvement", "Lean/Six Sigma", "Supply Chain", "Budgeting", "Team Management", "KPIs", "ERP", "Vendor Management"],
    summaryTemplate: "Operations Manager optimizing processes and driving efficiency across teams. Lean Six Sigma practitioner focused on continuous improvement.",
    suggestedProjects: [
      { title: "Process Optimization", oneLiner: "Streamlined operations reducing processing time by 35% and costs by 20%" },
      { title: "Warehouse Automation", oneLiner: "Implemented automated picking system increasing throughput by 50%" },
      { title: "Vendor Consolidation", oneLiner: "Consolidated 50 vendors to 15, negotiating 25% better terms" },
    ],
  },
  "supply-chain-analyst": {
    id: "supply-chain-analyst",
    label: "Supply Chain Analyst",
    skills: ["Supply Chain Planning", "SAP", "Forecasting", "Inventory Management", "Excel", "Data Analysis", "Logistics", "Procurement"],
    summaryTemplate: "Supply Chain Analyst optimizing end-to-end supply chain operations. Expert in demand forecasting, inventory optimization, and logistics analytics.",
    suggestedProjects: [
      { title: "Demand Forecasting Model", oneLiner: "Built ML-based forecast model reducing stockouts by 40%" },
      { title: "Inventory Optimization", oneLiner: "Reduced inventory holding costs by 25% while maintaining 98% fill rate" },
      { title: "Logistics Route Optimization", oneLiner: "Optimized delivery routes saving $500K annually in transportation costs" },
    ],
  },
  "mechanical-engineer": {
    id: "mechanical-engineer",
    label: "Mechanical Engineer",
    skills: ["AutoCAD", "SolidWorks", "ANSYS", "Manufacturing", "GD&T", "Materials Science", "3D Printing", "FEA"],
    summaryTemplate: "Mechanical Engineer designing innovative mechanical systems and products. Expert in CAD/CAE tools, manufacturing processes, and structural analysis.",
    suggestedProjects: [
      { title: "Product Design Optimization", oneLiner: "Redesigned component reducing weight by 30% while maintaining strength" },
      { title: "Manufacturing Process Improvement", oneLiner: "Optimized CNC machining process reducing cycle time by 25%" },
      { title: "Thermal Management System", oneLiner: "Designed cooling system for electronic enclosure meeting IP67 requirements" },
    ],
  },
  "electrical-engineer": {
    id: "electrical-engineer",
    label: "Electrical Engineer",
    skills: ["Circuit Design", "PCB Layout", "MATLAB", "Embedded Systems", "Power Systems", "Control Systems", "PLC", "VHDL/Verilog"],
    summaryTemplate: "Electrical Engineer designing reliable electronic systems and circuits. Expert in embedded systems, power electronics, and control systems.",
    suggestedProjects: [
      { title: "IoT Sensor System", oneLiner: "Designed IoT sensor network monitoring 100+ industrial assets in real-time" },
      { title: "Power Supply Design", oneLiner: "Designed switched-mode PSU with 95% efficiency for medical device" },
      { title: "Embedded Control System", oneLiner: "Developed ARM-based controller for industrial automation with 1ms response time" },
    ],
  },
  "civil-engineer": {
    id: "civil-engineer",
    label: "Civil Engineer",
    skills: ["AutoCAD", "STAAD Pro", "Structural Analysis", "Project Management", "Surveying", "Estimation", "BIM", "Site Management"],
    summaryTemplate: "Civil Engineer managing construction projects from design to completion. Expert in structural analysis, project management, and building codes.",
    suggestedProjects: [
      { title: "Residential Complex Design", oneLiner: "Designed structural plans for 200-unit residential complex" },
      { title: "Bridge Rehabilitation", oneLiner: "Led assessment and rehabilitation of 30-year-old bridge structure" },
      { title: "Road Construction Project", oneLiner: "Managed 5km highway construction project worth $10M on schedule" },
    ],
  },
  "biomedical-engineer": {
    id: "biomedical-engineer",
    label: "Biomedical Engineer",
    skills: ["Medical Devices", "MATLAB", "Signal Processing", "Regulatory (FDA/CE)", "CAD", "Biomechanics", "Python", "Clinical Trials"],
    summaryTemplate: "Biomedical Engineer developing innovative medical technologies. Expert in device design, regulatory compliance, and clinical validation.",
    suggestedProjects: [
      { title: "Wearable Health Monitor", oneLiner: "Designed wearable device tracking vital signs with FDA 510(k) clearance path" },
      { title: "Medical Image Analysis", oneLiner: "Built ML-based diagnostic tool analyzing medical images with 93% accuracy" },
      { title: "Prosthetic Design", oneLiner: "Designed 3D-printed prosthetic reducing cost by 70% vs traditional methods" },
    ],
  },
  "research-scientist": {
    id: "research-scientist",
    label: "Research Scientist",
    skills: ["Research Methodology", "Scientific Writing", "Python/R", "Statistics", "Literature Review", "Grant Writing", "Lab Management", "Peer Review"],
    summaryTemplate: "Research Scientist conducting rigorous investigations that advance knowledge in the field. Published author with expertise in experimental design and data analysis.",
    suggestedProjects: [
      { title: "Published Research Paper", oneLiner: "First-authored paper in Nature-indexed journal with 50+ citations" },
      { title: "Research Grant", oneLiner: "Secured $200K research funding through competitive grant application" },
      { title: "Clinical Study", oneLiner: "Led multi-site clinical study with 500 participants over 2 years" },
    ],
  },
  pharmacist: {
    id: "pharmacist",
    label: "Pharmacist",
    skills: ["Drug Dispensing", "Clinical Pharmacy", "Patient Counseling", "Inventory Management", "Regulatory Compliance", "Pharmacology", "EHR Systems"],
    summaryTemplate: "Licensed Pharmacist ensuring safe, effective medication therapy. Expert in patient counseling, drug interactions, and pharmacy operations.",
    suggestedProjects: [
      { title: "Medication Safety Program", oneLiner: "Implemented safety checks reducing medication errors by 50%" },
      { title: "Inventory Optimization", oneLiner: "Redesigned inventory system reducing expired drug waste by 40%" },
      { title: "Patient Education Initiative", oneLiner: "Created diabetes management program improving patient adherence by 30%" },
    ],
  },
  nurse: {
    id: "nurse",
    label: "Nurse",
    skills: ["Patient Care", "Clinical Assessment", "EMR/EHR", "Medication Administration", "Team Coordination", "Critical Thinking", "Patient Education"],
    summaryTemplate: "Registered Nurse providing compassionate, evidence-based patient care. Experienced in critical care, patient education, and multidisciplinary coordination.",
    suggestedProjects: [
      { title: "Patient Care Protocol", oneLiner: "Developed wound care protocol reducing infection rates by 35%" },
      { title: "Staff Training Program", oneLiner: "Created training program for 20 new nurses reducing onboarding time by 40%" },
      { title: "Quality Improvement Initiative", oneLiner: "Led falls prevention initiative reducing patient falls by 50%" },
    ],
  },
  teacher: {
    id: "teacher",
    label: "Teacher / Educator",
    skills: ["Curriculum Design", "Classroom Management", "Assessment", "EdTech", "Differentiated Instruction", "Parent Communication", "Special Needs", "Google Classroom"],
    summaryTemplate: "Educator passionate about student growth and innovative teaching methods. Expert in curriculum design, differentiated instruction, and technology integration.",
    suggestedProjects: [
      { title: "Curriculum Redesign", oneLiner: "Redesigned math curriculum improving test scores by 20% across 200 students" },
      { title: "EdTech Implementation", oneLiner: "Integrated Google Classroom and Khan Academy, increasing engagement by 40%" },
      { title: "After-school STEM Program", oneLiner: "Founded coding club with 50 students, 10 winning district competitions" },
    ],
  },
  lawyer: {
    id: "lawyer",
    label: "Lawyer / Legal Counsel",
    skills: ["Legal Research", "Contract Drafting", "Litigation", "Compliance", "Negotiation", "Due Diligence", "Corporate Law", "IP Law"],
    summaryTemplate: "Legal professional providing strategic counsel on corporate, contractual, and regulatory matters. Expert in risk mitigation and compliance.",
    suggestedProjects: [
      { title: "M&A Due Diligence", oneLiner: "Led legal due diligence for $100M acquisition identifying 15 key risks" },
      { title: "Compliance Framework", oneLiner: "Built GDPR compliance framework for multinational company across 5 jurisdictions" },
      { title: "Contract Template Library", oneLiner: "Created standardized contract templates reducing legal review time by 60%" },
    ],
  },
  journalist: {
    id: "journalist",
    label: "Journalist",
    skills: ["Investigative Reporting", "Writing", "Research", "Interviewing", "Editing", "Fact-checking", "Deadline Management", "CMS"],
    summaryTemplate: "Journalist breaking important stories through thorough research and compelling writing. Experienced across digital, print, and broadcast media.",
    suggestedProjects: [
      { title: "Investigative Series", oneLiner: "Published 5-part investigative series reaching 500K+ readers" },
      { title: "Breaking News Coverage", oneLiner: "Led breaking news coverage generating 1M+ page views in 24 hours" },
      { title: "Podcast Launch", oneLiner: "Launched weekly news podcast growing to 10K subscribers in 3 months" },
    ],
  },
  "video-editor": {
    id: "video-editor",
    label: "Video Editor",
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Color Grading", "Motion Graphics", "Sound Design", "Storytelling", "YouTube"],
    summaryTemplate: "Video Editor crafting compelling visual stories through expert editing, color grading, and motion design. Experienced with YouTube, ads, and corporate content.",
    suggestedProjects: [
      { title: "YouTube Channel Growth", oneLiner: "Edited 200+ videos for channel growing from 0 to 100K subscribers" },
      { title: "Brand Video Campaign", oneLiner: "Edited product launch video achieving 2M+ views across platforms" },
      { title: "Documentary Short", oneLiner: "Edited 20-minute documentary selected for 3 film festivals" },
    ],
  },
  photographer: {
    id: "photographer",
    label: "Photographer",
    skills: ["Lightroom", "Photoshop", "Composition", "Lighting", "Portrait", "Product Photography", "Post-processing", "Client Management"],
    summaryTemplate: "Professional Photographer capturing compelling images for brands, events, and editorial. Expert in lighting, composition, and post-production.",
    suggestedProjects: [
      { title: "Brand Photography Campaign", oneLiner: "Shot product campaign for D2C brand used across web, social, and print" },
      { title: "Event Photography", oneLiner: "Covered 50+ corporate and wedding events with 100% client satisfaction" },
      { title: "Photo Exhibition", oneLiner: "Curated solo exhibition with 30 prints, featured in local arts magazine" },
    ],
  },
  "customer-success": {
    id: "customer-success",
    label: "Customer Success Manager",
    skills: ["Account Management", "Onboarding", "Churn Prevention", "CRM", "Data Analysis", "Communication", "Product Knowledge", "Renewals"],
    summaryTemplate: "Customer Success Manager driving retention and expansion through proactive account management. Focused on customer outcomes and long-term value.",
    suggestedProjects: [
      { title: "Onboarding Playbook", oneLiner: "Created onboarding program reducing time-to-value from 30 to 7 days" },
      { title: "Churn Reduction Initiative", oneLiner: "Implemented early warning system reducing churn by 25%" },
      { title: "Customer Health Score", oneLiner: "Built health scoring model tracking 15 engagement metrics for 500 accounts" },
    ],
  },
  "technical-support": {
    id: "technical-support",
    label: "Technical Support Engineer",
    skills: ["Troubleshooting", "Linux", "Networking", "Ticketing Systems", "Customer Communication", "Documentation", "Scripting", "Cloud Platforms"],
    summaryTemplate: "Technical Support Engineer resolving complex issues with empathy and expertise. Skilled in troubleshooting across hardware, software, and cloud environments.",
    suggestedProjects: [
      { title: "Knowledge Base Creation", oneLiner: "Built 200+ article knowledge base reducing repeat tickets by 40%" },
      { title: "Support Automation", oneLiner: "Automated 15 common issue resolutions, cutting average resolution time by 50%" },
      { title: "Escalation Process", oneLiner: "Redesigned escalation process improving P1 resolution from 4 hours to 1 hour" },
    ],
  },
  "blockchain-developer": {
    id: "blockchain-developer",
    label: "Blockchain Developer",
    skills: ["Solidity", "Ethereum", "Web3.js", "JavaScript", "Python", "Truffle", "Ganache", "Smart Contracts"],
    summaryTemplate: "Blockchain Developer building decentralized applications and smart contracts. Experienced in Ethereum ecosystem, DeFi protocols, and Web3 architecture.",
    suggestedProjects: [
      { title: "DeFi Lending Protocol", oneLiner: "Built Solidity smart contracts for lending platform handling $2M+ TVL" },
      { title: "NFT Marketplace", oneLiner: "Developed full-stack NFT marketplace with minting, trading, and royalty distribution" },
      { title: "DAO Governance System", oneLiner: "Implemented on-chain governance with token-weighted voting and proposal execution" },
    ],
  },
  "game-developer": {
    id: "game-developer",
    label: "Game Developer",
    skills: ["Unity", "C#", "C++", "Unreal Engine", "Blender", "3D Modeling", "Game Physics", "Shader Programming"],
    summaryTemplate: "Game Developer creating engaging interactive experiences. Proficient in Unity and Unreal Engine with strong skills in gameplay programming and 3D development.",
    suggestedProjects: [
      { title: "Multiplayer Mobile Game", oneLiner: "Built real-time multiplayer game with Unity, reaching 100K+ downloads" },
      { title: "3D Puzzle Platformer", oneLiner: "Developed 3D platformer with custom physics and procedural level generation" },
      { title: "VR Training Simulation", oneLiner: "Created VR training app for industrial safety with realistic physics interactions" },
    ],
  },
  "ar-vr-developer": {
    id: "ar-vr-developer",
    label: "AR/VR Developer",
    skills: ["Unity", "C#", "ARKit/ARCore", "Blender", "3D Modeling", "Oculus SDK", "Shader Programming", "Spatial Computing"],
    summaryTemplate: "AR/VR Developer building immersive spatial computing experiences. Expert in Unity XR, 3D interaction design, and cross-platform deployment.",
    suggestedProjects: [
      { title: "AR Product Visualizer", oneLiner: "Built AR app letting users place 3D furniture in their space, 50K+ downloads" },
      { title: "VR Architecture Walkthrough", oneLiner: "Created VR experience for real estate tours with interactive room customization" },
      { title: "Mixed Reality Training Platform", oneLiner: "Developed MR training system reducing onboarding time by 40% for manufacturing" },
    ],
  },
  "ai-researcher": {
    id: "ai-researcher",
    label: "AI Researcher",
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Computer Vision", "Research Methods", "Scientific Writing", "Deep Learning"],
    summaryTemplate: "AI Researcher advancing the state of the art in machine learning. Published author with expertise in deep learning, NLP, and experimental design.",
    suggestedProjects: [
      { title: "Published NLP Paper", oneLiner: "First-authored paper on transformer efficiency at ACL, 100+ citations" },
      { title: "Novel Architecture Design", oneLiner: "Proposed lightweight attention mechanism reducing inference cost by 60%" },
      { title: "Open-source ML Library", oneLiner: "Created research toolkit with 2K+ GitHub stars used by 50+ labs worldwide" },
    ],
  },
  "robotics-engineer": {
    id: "robotics-engineer",
    label: "Robotics Engineer",
    skills: ["ROS", "Python", "C++", "MATLAB", "Simulink", "Computer Vision", "Embedded Systems", "Control Systems"],
    summaryTemplate: "Robotics Engineer designing intelligent autonomous systems. Expert in ROS, sensor fusion, and motion planning for industrial and research applications.",
    suggestedProjects: [
      { title: "Autonomous Navigation System", oneLiner: "Built SLAM-based navigation for warehouse robot with 99.5% accuracy" },
      { title: "Robotic Arm Controller", oneLiner: "Designed 6-DOF arm control system with sub-millimeter precision for assembly tasks" },
      { title: "Drone Delivery Prototype", oneLiner: "Developed autonomous drone with obstacle avoidance and 5km delivery range" },
    ],
  },
  "ecommerce-specialist": {
    id: "ecommerce-specialist",
    label: "E-commerce Specialist",
    skills: ["Shopify", "WooCommerce", "Google Analytics", "SEO", "Inventory Management", "Facebook Ads", "Email Marketing", "A/B Testing"],
    summaryTemplate: "E-commerce Specialist driving online sales growth through data-driven strategies. Expert in platform management, conversion optimization, and multi-channel retail.",
    suggestedProjects: [
      { title: "Shopify Store Launch", oneLiner: "Launched D2C store generating ₹50L revenue in first 6 months" },
      { title: "Conversion Rate Optimization", oneLiner: "Improved checkout conversion by 35% through A/B testing and UX improvements" },
      { title: "Multi-channel Integration", oneLiner: "Unified inventory across Amazon, Flipkart, and own store reducing stockouts by 40%" },
    ],
  },
  "dotnet-developer": {
    id: "dotnet-developer",
    label: ".NET Developer",
    skills: ["C#", "ASP.NET", ".NET Core", "SQL Server", "Entity Framework", "Azure", "JavaScript", "REST APIs"],
    summaryTemplate: ".NET Developer building enterprise-grade applications with Microsoft technologies. Expert in C#, ASP.NET Core, and Azure cloud services.",
    suggestedProjects: [
      { title: "Enterprise CRM System", oneLiner: "Built CRM with ASP.NET Core and Angular serving 500+ daily users" },
      { title: "Microservices Migration", oneLiner: "Migrated monolith to .NET Core microservices reducing deployment time by 70%" },
      { title: "Real-time Dashboard", oneLiner: "Developed SignalR-based real-time dashboard for operations monitoring" },
    ],
  },
  "java-developer": {
    id: "java-developer",
    label: "Java Developer",
    skills: ["Java", "Spring Boot", "Hibernate", "SQL", "Microservices", "REST APIs", "Maven", "JUnit"],
    summaryTemplate: "Java Developer building robust, scalable enterprise applications. Expert in Spring ecosystem, microservices architecture, and performance optimization.",
    suggestedProjects: [
      { title: "Banking Microservices", oneLiner: "Built Spring Boot microservices handling 500K+ daily transactions" },
      { title: "Real-time Event Processing", oneLiner: "Developed Kafka-based event processor handling 1M+ events/hour" },
      { title: "REST API Platform", oneLiner: "Designed API gateway with OAuth2 authentication serving 100+ client apps" },
    ],
  },
  "python-developer": {
    id: "python-developer",
    label: "Python Developer",
    skills: ["Python", "Django", "Flask", "FastAPI", "PostgreSQL", "Redis", "Docker", "REST APIs"],
    summaryTemplate: "Python Developer building efficient backend systems and automation tools. Proficient in Django, FastAPI, and data processing pipelines.",
    suggestedProjects: [
      { title: "REST API with FastAPI", oneLiner: "Built high-performance API handling 10K+ requests/sec with async Python" },
      { title: "Data Pipeline Automation", oneLiner: "Automated ETL pipeline processing 5M records daily with 99.9% reliability" },
      { title: "Django SaaS Platform", oneLiner: "Developed multi-tenant SaaS app with Stripe billing and role-based access" },
    ],
  },
  "react-developer": {
    id: "react-developer",
    label: "React Developer",
    skills: ["React", "TypeScript", "Next.js", "Redux", "JavaScript", "HTML5", "CSS3", "REST APIs"],
    summaryTemplate: "React Developer building performant, accessible web applications. Expert in React ecosystem, state management, and modern frontend tooling.",
    suggestedProjects: [
      { title: "Real-time Collaboration App", oneLiner: "Built collaborative editor with React, WebSockets, and operational transforms" },
      { title: "Component Library", oneLiner: "Created React component library with 100+ components and 95% test coverage" },
      { title: "E-commerce Frontend", oneLiner: "Built Next.js storefront with SSR achieving 98 Lighthouse performance score" },
    ],
  },
  "sap-developer": {
    id: "sap-developer",
    label: "SAP Developer",
    skills: ["SAP ABAP", "SAP HANA", "SAP Fiori", "LSMW", "BDC", "BAPI", "RFC", "SAP MM/SD"],
    summaryTemplate: "SAP Developer customizing and extending SAP solutions for enterprise needs. Expert in ABAP, Fiori, and cross-module integration.",
    suggestedProjects: [
      { title: "SAP S/4HANA Migration", oneLiner: "Led technical migration of 200+ custom programs from ECC to S/4HANA" },
      { title: "Fiori App Development", oneLiner: "Built 10+ custom Fiori apps improving user productivity by 30%" },
      { title: "Integration Middleware", oneLiner: "Developed SAP PI/PO interfaces connecting SAP with 5 external systems" },
    ],
  },
  "sql-developer": {
    id: "sql-developer",
    label: "SQL Developer",
    skills: ["SQL", "T-SQL", "PL/SQL", "SSIS", "SSRS", "Power BI", "Database Design", "Performance Tuning"],
    summaryTemplate: "SQL Developer designing efficient databases and data solutions. Expert in query optimization, ETL processes, and business intelligence reporting.",
    suggestedProjects: [
      { title: "Data Warehouse Design", oneLiner: "Designed star schema warehouse supporting 50+ reports with sub-second queries" },
      { title: "Query Optimization Project", oneLiner: "Optimized 100+ slow queries reducing average execution time by 80%" },
      { title: "Automated Reporting System", oneLiner: "Built SSRS reporting suite replacing 20 manual Excel reports" },
    ],
  },
  "etl-developer": {
    id: "etl-developer",
    label: "ETL Developer",
    skills: ["SSIS", "Informatica", "SQL", "Python", "Data Warehousing", "Airflow", "PL/SQL", "Data Modeling"],
    summaryTemplate: "ETL Developer building robust data integration pipelines. Expert in Informatica, SSIS, and modern ELT architectures for enterprise data warehousing.",
    suggestedProjects: [
      { title: "Enterprise ETL Pipeline", oneLiner: "Built Informatica pipelines integrating 15 source systems into Snowflake warehouse" },
      { title: "Real-time Data Integration", oneLiner: "Implemented CDC-based real-time ETL reducing data latency from hours to minutes" },
      { title: "Data Quality Framework", oneLiner: "Designed validation framework catching 99.5% of data quality issues before load" },
    ],
  },
  "web-designer": {
    id: "web-designer",
    label: "Web Designer",
    skills: ["HTML5", "CSS3", "JavaScript", "Figma", "Photoshop", "Bootstrap", "WordPress", "Responsive Design"],
    summaryTemplate: "Web Designer creating visually stunning, responsive websites. Expert in modern CSS, design tools, and user-centered web experiences.",
    suggestedProjects: [
      { title: "Corporate Website Redesign", oneLiner: "Redesigned company website increasing session duration by 45% and leads by 30%" },
      { title: "WordPress Theme Development", oneLiner: "Built custom WordPress theme powering 50+ client websites" },
      { title: "Landing Page Optimization", oneLiner: "Designed 20+ landing pages with average 8% conversion rate" },
    ],
  },
  "data-architect": {
    id: "data-architect",
    label: "Data Architect",
    skills: ["Data Modeling", "SQL", "AWS", "Snowflake", "Data Governance", "ETL", "Python", "Data Warehousing"],
    summaryTemplate: "Data Architect designing enterprise data platforms and governance frameworks. Expert in cloud data architecture, modeling, and scalable analytics infrastructure.",
    suggestedProjects: [
      { title: "Enterprise Data Platform", oneLiner: "Architected lakehouse platform on AWS serving 500+ analysts with petabyte-scale data" },
      { title: "Data Governance Program", oneLiner: "Established data catalog and quality framework across 200+ datasets" },
      { title: "Cloud Migration Architecture", oneLiner: "Designed migration strategy for 50TB on-prem warehouse to Snowflake" },
    ],
  },
  "cloud-architect": {
    id: "cloud-architect",
    label: "Cloud Architect",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Security", "Networking", "Cost Optimization"],
    summaryTemplate: "Cloud Architect designing resilient, cost-effective cloud infrastructure at scale. Expert in multi-cloud strategy, security, and enterprise migrations.",
    suggestedProjects: [
      { title: "Multi-cloud Strategy", oneLiner: "Designed multi-cloud architecture across AWS and Azure for Fortune 500 client" },
      { title: "Zero-downtime Migration", oneLiner: "Architected migration of 100+ services to cloud with zero customer impact" },
      { title: "Cloud Cost Governance", oneLiner: "Implemented FinOps practices reducing annual cloud spend by $2M" },
    ],
  },
  "cybersecurity-analyst": {
    id: "cybersecurity-analyst",
    label: "Cybersecurity Analyst",
    skills: ["SIEM", "Penetration Testing", "Python", "Nmap", "Burp Suite", "Metasploit", "Linux", "Incident Response"],
    summaryTemplate: "Cybersecurity Analyst protecting organizations through proactive threat detection and incident response. Expert in vulnerability assessment, SIEM, and compliance frameworks.",
    suggestedProjects: [
      { title: "SOC Implementation", oneLiner: "Built 24/7 Security Operations Center monitoring 500+ endpoints" },
      { title: "Penetration Testing Program", oneLiner: "Conducted 30+ pen tests identifying and remediating 500+ vulnerabilities" },
      { title: "Incident Response Playbook", oneLiner: "Created IR playbooks reducing mean time to respond from 4 hours to 30 minutes" },
    ],
  },
  "healthcare-professional": {
    id: "healthcare-professional",
    label: "Healthcare Professional",
    skills: ["Patient Care", "EMR/EHR", "HIPAA Compliance", "Clinical Research", "Medical Terminology", "Team Coordination", "Quality Improvement", "Data Analysis"],
    summaryTemplate: "Healthcare Professional delivering high-quality patient care and driving clinical improvements. Experienced in evidence-based practice, compliance, and interdisciplinary collaboration.",
    suggestedProjects: [
      { title: "Quality Improvement Initiative", oneLiner: "Led QI program reducing hospital readmissions by 25% across 3 departments" },
      { title: "EHR Optimization", oneLiner: "Streamlined EHR workflows saving 2 hours/day for clinical staff" },
      { title: "Patient Safety Program", oneLiner: "Implemented medication safety checks reducing adverse events by 40%" },
    ],
  },
  chef: {
    id: "chef",
    label: "Chef / Culinary Professional",
    skills: ["Menu Development", "Kitchen Management", "Food Safety", "Cost Control", "Team Leadership", "Inventory Management", "Recipe Development", "Catering"],
    summaryTemplate: "Culinary Professional with expertise in menu development, kitchen operations, and team management. Passionate about creating exceptional dining experiences while optimizing food costs.",
    suggestedProjects: [
      { title: "Restaurant Menu Overhaul", oneLiner: "Redesigned menu increasing average check by 20% and reducing food waste by 30%" },
      { title: "Catering Operations", oneLiner: "Managed catering for 50+ events serving 200-500 guests with 100% satisfaction" },
      { title: "Kitchen Efficiency Program", oneLiner: "Streamlined kitchen operations reducing prep time by 25% and food cost by 15%" },
    ],
  },
  "banking-professional": {
    id: "banking-professional",
    label: "Banking Professional",
    skills: ["Financial Analysis", "Risk Management", "SQL", "Compliance", "Loan Processing", "CRM", "Investment Products", "Customer Service"],
    summaryTemplate: "Banking Professional with expertise in financial services, risk management, and regulatory compliance. Strong client relationship skills with focus on revenue growth.",
    suggestedProjects: [
      { title: "Risk Assessment Framework", oneLiner: "Built credit risk scoring model reducing default rates by 18%" },
      { title: "Digital Banking Initiative", oneLiner: "Led mobile banking rollout increasing digital transactions by 60%" },
      { title: "Compliance Automation", oneLiner: "Automated KYC/AML checks reducing processing time from 5 days to 4 hours" },
    ],
  },
  "aviation-professional": {
    id: "aviation-professional",
    label: "Aviation Professional",
    skills: ["Aviation Safety", "Inspection", "Maintenance", "Compliance", "Logistics", "Quality Assurance", "Inventory Management", "FAA Regulations"],
    summaryTemplate: "Aviation Professional ensuring operational excellence and safety in aerospace environments. Experienced in maintenance, compliance, and logistics management.",
    suggestedProjects: [
      { title: "Safety Compliance Program", oneLiner: "Implemented safety protocols achieving zero incidents over 24-month period" },
      { title: "Maintenance Optimization", oneLiner: "Redesigned maintenance scheduling reducing aircraft downtime by 20%" },
      { title: "Inventory Management System", oneLiner: "Streamlined parts inventory tracking 10K+ items with 99% accuracy" },
    ],
  },
  architect: {
    id: "architect",
    label: "Architect",
    skills: ["AutoCAD", "Revit", "SketchUp", "Rhino", "3D Visualization", "Building Codes", "Project Management", "Sustainable Design"],
    summaryTemplate: "Architect designing innovative, sustainable structures from concept to completion. Expert in BIM tools, building codes, and client-focused design solutions.",
    suggestedProjects: [
      { title: "Commercial Complex Design", oneLiner: "Designed 50K sq ft mixed-use development achieving LEED Gold certification" },
      { title: "Residential Master Plan", oneLiner: "Created master plan for 200-unit residential community with shared amenities" },
      { title: "Heritage Renovation", oneLiner: "Led renovation of historic building preserving character while modernizing systems" },
    ],
  },
  "bpo-specialist": {
    id: "bpo-specialist",
    label: "BPO Specialist",
    skills: ["Customer Service", "Process Management", "Data Entry", "CRM Tools", "Communication", "Quality Assurance", "Team Management", "SLA Management"],
    summaryTemplate: "BPO Specialist delivering efficient outsourced operations with focus on quality and client satisfaction. Expert in process optimization and team management.",
    suggestedProjects: [
      { title: "Process Automation", oneLiner: "Automated 30% of manual processes reducing handling time by 40%" },
      { title: "Quality Improvement Program", oneLiner: "Raised CSAT scores from 78% to 94% through training and monitoring" },
      { title: "Team Scaling Project", oneLiner: "Scaled operations from 20 to 80 agents while maintaining 98% SLA compliance" },
    ],
  },
  "construction-manager": {
    id: "construction-manager",
    label: "Construction Manager",
    skills: ["Project Management", "Budgeting", "Safety Compliance", "MS Project", "Procurement", "Contract Management", "AutoCAD", "Site Management"],
    summaryTemplate: "Construction Manager delivering projects on time and within budget. Expert in site operations, safety compliance, and multi-stakeholder coordination.",
    suggestedProjects: [
      { title: "Commercial Building Project", oneLiner: "Managed $15M commercial construction project delivered 2 weeks early" },
      { title: "Safety Program Implementation", oneLiner: "Implemented safety program achieving 500+ days without lost-time incidents" },
      { title: "Cost Control System", oneLiner: "Established cost tracking system saving 12% on material procurement" },
    ],
  },
  "public-relations": {
    id: "public-relations",
    label: "Public Relations Specialist",
    skills: ["Media Relations", "Press Releases", "Crisis Communication", "Social Media", "Content Creation", "Event Management", "Brand Strategy", "Analytics"],
    summaryTemplate: "Public Relations Specialist building and protecting brand reputation through strategic communications. Expert in media relations, crisis management, and storytelling.",
    suggestedProjects: [
      { title: "Product Launch PR Campaign", oneLiner: "Secured 50+ media placements for product launch reaching 10M+ audience" },
      { title: "Crisis Communication Plan", oneLiner: "Developed crisis playbook and trained 20 executives on media handling" },
      { title: "Brand Awareness Campaign", oneLiner: "Led PR campaign increasing brand awareness by 40% in target market" },
    ],
  },
  "business-development": {
    id: "business-development",
    label: "Business Development Manager",
    skills: ["Sales Strategy", "Lead Generation", "Negotiation", "CRM", "Partnership Management", "Market Research", "Presentations", "Revenue Growth"],
    summaryTemplate: "Business Development Manager driving revenue growth through strategic partnerships and market expansion. Expert in B2B sales, deal structuring, and relationship management.",
    suggestedProjects: [
      { title: "Enterprise Partnership Program", oneLiner: "Built partner ecosystem generating 35% of annual revenue through channel sales" },
      { title: "Market Expansion Strategy", oneLiner: "Led expansion into 3 new markets generating $5M in first-year revenue" },
      { title: "Sales Pipeline Optimization", oneLiner: "Redesigned lead qualification process increasing win rate from 20% to 35%" },
    ],
  },
  other: {
    id: "other",
    label: "Other",
    skills: [],
    summaryTemplate: "Results-driven professional with diverse experience. Adaptable and focused on delivering impact.",
    suggestedProjects: [
      { title: "Key Initiative", oneLiner: "Led a cross-functional project that delivered measurable business impact" },
      { title: "Process Improvement", oneLiner: "Identified and implemented improvements that increased team efficiency" },
      { title: "Team Project", oneLiner: "Collaborated on a team project with successful delivery on time and within scope" },
    ],
  },
};

export const ROLE_IDS: RoleId[] = [
  "software-developer",
  "frontend-developer",
  "backend-developer",
  "fullstack-developer",
  "mobile-developer",
  "react-developer",
  "java-developer",
  "python-developer",
  "dotnet-developer",
  "data-analyst",
  "data-scientist",
  "data-engineer",
  "data-architect",
  "ai-engineer",
  "ai-researcher",
  "ml-engineer",
  "devops-engineer",
  "cloud-engineer",
  "cloud-architect",
  "blockchain-developer",
  "game-developer",
  "ar-vr-developer",
  "robotics-engineer",
  "qa-engineer",
  "security-engineer",
  "cybersecurity-analyst",
  "network-engineer",
  "systems-administrator",
  "database-administrator",
  "sql-developer",
  "etl-developer",
  "sap-developer",
  "solutions-architect",
  "product-manager",
  "project-manager",
  "scrum-master",
  "business-analyst",
  "business-development",
  "ux-designer",
  "ui-designer",
  "graphic-designer",
  "product-designer",
  "web-designer",
  "marketing-analyst",
  "digital-marketer",
  "ecommerce-specialist",
  "content-writer",
  "seo-specialist",
  "social-media-manager",
  "public-relations",
  "sales-executive",
  "account-manager",
  "customer-success",
  "technical-support",
  "technical-writer",
  "hr-manager",
  "recruiter",
  "financial-analyst",
  "accountant",
  "banking-professional",
  "investment-banker",
  "management-consultant",
  "operations-manager",
  "supply-chain-analyst",
  "construction-manager",
  "bpo-specialist",
  "mechanical-engineer",
  "electrical-engineer",
  "civil-engineer",
  "biomedical-engineer",
  "architect",
  "research-scientist",
  "pharmacist",
  "nurse",
  "healthcare-professional",
  "teacher",
  "chef",
  "aviation-professional",
  "lawyer",
  "journalist",
  "video-editor",
  "photographer",
  "other",
];

export function getPreset(id: RoleId): RolePreset {
  return rolePresets[id];
}

export function getSummaryFromPreset(roleId: RoleId): string {
  return rolePresets[roleId].summaryTemplate;
}
