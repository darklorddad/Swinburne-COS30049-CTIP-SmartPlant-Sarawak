# COS30049 Computing Technology Innovation Project
## Learning Summary Report

**STUDENT NAME:** [Your Name]
**STUDENT ID:** [Your ID]

---

### Declaration
I declare that this portfolio is my individual work. I have not copied from any other students work or from any other source except where due acknowledgment is made explicitly in the text, nor has any part of this submission been written for me by another person.

**Signature:** ____________________

---

### 1. Introduction
This report outlines my individual contributions to the Computing Technology Innovation Project. My primary focus was the end-to-end development of the Artificial Intelligence component, specifically regarding dataset curation and model training, as well as the construction of the Admin Dashboard using React Native and Firebase to visualise data and manage system parameters.

### 2. Self-Assessments

**2.1 List the roles/responsibilities you have undertaken and briefly state the expectation (what you are expected to do) for each.**
*   **AI/ML Engineer:** My responsibility was to source, clean, and label the datasets required for the project. The expectation was to train and validate a machine learning model capable of accurate predictions and expose this functionality via an API.
*   **Full-Stack Developer (Admin Dashboard):** I was responsible for building the administrative interface. The expectation was to create a secure, user-friendly dashboard that allows stakeholders to view analytics, manage user data, and monitor model performance.

**2.2 What grade are you trying to achieve? - A brief description of what you expect you will need to do to achieve that grade**
*   **Target:** High Distinction (HD).
*   **Requirement:** To achieve this, I must demonstrate a sophisticated integration of the AI model with the frontend dashboard. The code must be modular, well-documented, and the model must achieve a high accuracy score through rigorous testing and validation.

**2.3 How well do you think you are doing/progressing? (Reflect is there a gap? What is it?)**
*   The AI model training is complete with satisfactory accuracy metrics. The dashboard UI is functional and responsive. However, there is a slight latency issue when rendering real-time data fetched from the AI backend, which constitutes a small gap in performance optimisation.

**2.4 What are your plans to close the gap? (Note: Between desired grade and current progress)**
*   I plan to optimise the API response times by implementing caching strategies and refining the database queries. I will also conduct final integration testing to ensure the dashboard handles edge cases from the AI model gracefully before the final submission.

### 3. Learning Outcome Assessment
**State what I have done to achieve the learning outcomes below in your learning process:**

**ULO1 Apply a systematic approach to computing technology innovation.**
I applied the Software Development Life Cycle (SDLC) to the AI workflow. I established a pipeline starting with raw data ingestion, followed by pre-processing (normalisation/cleaning), model training, and finally deployment. For the dashboard, I utilised an Agile approach, iterating on the UI based on weekly team feedback and utilising Git branches for feature isolation to maintain a stable codebase.

**ULO2 Apply knowledge of innovation fundamentals to computing technology challenges.**
I addressed the challenge of manual data processing by implementing an automated AI solution. I researched current state-of-the-art architectures to select the most appropriate algorithm for our specific dataset, ensuring the solution was innovative and efficient rather than relying on legacy manual methods.

**ULO3 Find, organise, and make decisions on a range of topics related to computing technology innovation.**
I had to make critical decisions regarding the technology stack. For the AI, I evaluated frameworks like PyTorch versus TensorFlow and selected PyTorch combined with Hugging Face Transformers, as it offered robust pre-trained models suitable for our image classification needs. For the dashboard, I organised the React Native component structure to ensure reusability and maintainability, deciding on a modular architecture.

**ULO4 Use technology to develop and present innovation solutions.**
I utilised Python libraries (Pandas, NumPy, Scikit-Learn, PyTorch) for data manipulation and model training. For the dashboard, I used React Native to create a responsive mobile interface. I used Git for version control to manage the codebase and integrated Firebase services to allow the dashboard to communicate seamlessly with the backend and AI model.

**ULO5 Demonstrate reflective practice, and use self and peer evaluation.**
I regularly reviewed my code against industry standards (such as PEP8 for Python). I actively sought feedback on the dashboard UX from teammates, which led to a redesign of the `AdminBottomNavBar` component to improve accessibility and usability on mobile devices.

**ULO6 Communicate within teams and stakeholders using appropriate verbal, written and technological approaches.**
I documented the system architecture and data flows using standard documentation tools so teammates could understand how the admin dashboard interacts with Firebase. During stand-ups, I communicated technical challenges regarding the dashboard's data visualisation and user management features, translating them into clear progress updates for non-technical stakeholders.

### 4. Peer Review
*Provide specific, balanced, and actionable feedback on team members' deliverables, highlighting strengths and areas for improvement with constructive suggestions.*

*   **[Team Member 1 Name]:** Demonstrated strong backend skills in setting up the database schema. However, could improve on code commenting to make handovers easier.
*   **[Team Member 2 Name]:** Excellent at project management and keeping the team on track. I suggest they become more familiar with the Git workflow to avoid merge conflicts in the future.
*   **[Team Member 3 Name]:** Great work on the frontend design. A suggestion for improvement would be to focus on mobile responsiveness earlier in the development cycle.

### 5. Reflection

**I found the following topics particularly challenging:**
Data cleaning and normalisation were significantly more time-consuming than anticipated. Handling inconsistent data formats and missing values required writing complex pre-processing scripts to prevent the model from learning incorrect patterns. Additionally, the dataset was highly imbalanced, which made training difficult and required implementing techniques like oversampling and class weighting to ensure the model didn't bias towards the majority class.

**I found the following topics particularly interesting:**
The process of hyperparameter tuning. It was fascinating to observe how tweaking learning rates or batch sizes directly impacted the model's convergence and final accuracy. Additionally, developing the admin dashboard was engaging, particularly designing the user management system and ensuring real-time data updates from Firebase were reflected instantly in the UI.

**I feel I learnt these topics, concepts, and/or tools really well:**
I have gained a strong command of Python for data science (specifically Pandas and NumPy) and the integration of Firebase Firestore backend logic with React Native frontend dashboards. My understanding of asynchronous data handling has improved significantly through connecting these components.

**I still need to work on the following areas:**
I need to improve my understanding of frontend state management for complex dashboards, specifically optimising React Context to prevent unnecessary re-renders. While the AI logic is sound, the frontend performance could be further improved.

**My progress in this unit was:**
Consistent, though front-loaded. I spent the early weeks heavily focused on dataset accumulation, which felt slow, but this investment allowed for rapid model training in the later weeks. Time management was challenged by long model training times, which I managed by working on the dashboard while the model trained in the background.

**This unit will help me in the future:**
The ability to build full-stack applications that leverage AI is highly sought after in the industry. Understanding the friction points between data science (AI) and application development (Dashboard) prepares me for roles such as an ML Engineer or Full-Stack Developer.

**If I did this unit again I would do the following things differently:**
I would implement an automated data validation pipeline earlier. I spent too much time manually checking data quality mid-project. Automating this at the start would have saved significant debugging time during the training phase.

**Other:**
Working on the admin dashboard gave me a better appreciation for User Experience (UX) design, highlighting that a powerful AI model is useless if the interface to control it is unintuitive. This reinforced the importance of a holistic approach to innovation, where backend complexity must be matched with frontend simplicity.
