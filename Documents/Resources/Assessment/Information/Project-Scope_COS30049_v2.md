# Project Title
SmartPlant Sarawak: A Community-Driven Mobile App for Plant Species Identification and Conservation

**Industry partner**
NeuonAl – Commercialization Partner with Sarawak Forest Corporation (SFC)

**Introduction**
SmartPlant Sarawak is a mobile-first solution designed to empower the public, researchers, and conservationists to identify, map, and protect plant biodiversity in Sarawak's national parks, nature reserves, and community areas. Inspired by platforms like Pl@ntNet, the app allows users to photograph plants, receive AI-assisted species identification, and contribute valuable biodiversity data.

The platform integrates community collaboration where both users and administrators can validate species labels, and offers feedback mechanisms to refine accuracy over time. It also features a visualization map to display plant locations, distributions, and conservation statuses.

To protect endangered species, IoT-based monitoring systems for real-time tracking and alerts should be integrated into the framework. Strong cybersecurity measures ensure the protection of sensitive biodiversity data and user privacy.

By combining AI, community science, and IoT technologies, SmartPlant Sarawak will strengthen local biodiversity monitoring, support research, and raise environmental awareness among the public.

**Problem Statements:**
Sarawak's rich plant biodiversity is under threat from habitat loss, poaching, and limited real-time monitoring. Current plant identification methods are fragmented, often inaccessible to the public, and lack mechanisms for collaborative verification, leading to inaccuracies in biodiversity data. Without a unified, accessible, and secure platform to identify species, collect geotagged data, engage communities, and protect endangered plants, conservation efforts remain reactive and fragmented.

**Objectives:**
To design and implement a secure, AI-powered mobile application that enables community-driven plant species identification, collaborative label verification, and interactive mapping of plant occurrences, integrated with IoT-based monitoring to protect endangered species—thereby improving biodiversity data accuracy, enhancing public engagement, and strengthening conservation management in Sarawak.

**Areas of Focus (Must Implement ALL):**
**1) AI-Powered Mobile Plant Identification**

**Features**
*   AI-based image recognition to suggest possible plant species from user-submitted photos.
*   Confidence score displayed for each identification result.
*   "Flag as Unsure" function to send entries for expert/admin review.
*   Continuous AI model improvement through expert-verified training data.

**User Roles**
*   **Public:**
    *   Capture and upload plant images via the app.
    *   View AI-generated species suggestions with confidence percentages.
    *   Flag uncertain results for further verification.
*   **Admin:**
    *   Review and validate flagged identifications.
    *   Correct or update plant species labels as necessary.
    *   Upload verified reference images to improve AI accuracy.

**Expected Outcomes**
*   Accurate and user-friendly plant identification for both experts and the general public.
*   A growing, high-quality reference database of verified plant images.
*   Improved AI model performance over time through validated contributions.

**2) Visualization & Mapping Tools**

**Features**
*   Interactive geospatial map showing plant sightings, species labels, photos, and conservation status.
*   Filters for species type, rarity, and date of observation.
*   Heatmap functionality to visualize species distribution trends.

**User Roles**
*   **Public:**
    *   View plant observation points and associated details (photos, basic species info).
    *   Apply filters for targeted browsing.
*   **Admin:**
    *   Mask or hide exact GPS coordinates of rare/endangered plants.
    *   Edit or remove inaccurate geotag information.
    *   Apply filters for targeted browsing.

**Expected Outcomes**
*   Increased public awareness of plant biodiversity distribution.
*   Accurate, location-based biodiversity insights for research and conservation planning.
*   Protection of sensitive species through controlled location disclosure.

**3) IoT-Enabled Plant Protection**

**Features**
*   GPS and environmental sensors deployed near rare/endangered plant species.
*   Real-time data collection on location, temperature, humidity, and movement.
*   Automated alerts for unusual activity (e.g., potential poaching, habitat disturbance).
*   Centralized monitoring dashboard for administrators.

**User Roles**
*   **Admin:**
    *   Monitor live IoT sensor data.
    *   Receive and respond to alerts triggered by abnormal activity.
    *   Review historical sensor data for threat pattern analysis.

**Expected Outcomes**
*   Enhanced protection of endangered plant species through continuous monitoring.
*   Rapid response capability to environmental or security threats.
*   Long-term data records for habitat condition analysis.

**4) Cybersecurity & Data Privacy**

**Features**
*   Encryption of sensitive biodiversity and location data.
*   Role-based access controls to restrict sensitive species location information.
*   Multi-factor authentication for administrator accounts.

**User Roles**
*   **Public:**
    *   Secure login to the platform.
    *   Access only to non-sensitive plant data.
*   **Admin:**
    *   Manage user roles and access permissions.
    *   Ensure encryption of all stored plant data.
    *   Use two-factor authentication for secure system access.

**Expected Outcomes**
*   Secure storage and sharing of biodiversity data.
*   Compliance with data protection regulations.
*   Reduced risk of data misuse, especially for endangered species locations.

**Application Security Aspect**
*   Project planning and execution based on Secure Software Development Lifecycle (SSDLC).
*   Application vulnerability assessment details, such as the tools to be used and the scope of the testing to be defined in the testing plan.
*   Application vulnerability assessment results with the verification of the vulnerabilities.
*   Recommendations and implementation of the recommendations to address the vulnerabilities.
*   Evidence of application vulnerability reassessment to verify that the vulnerabilities have been addressed successfully.

**[Optional] Additional Innovation**

**1) Automated AI Retraining Module**

**Features:**
*   AI model automatically retrains when a certain confidence threshold is reached from combined expert and public voting.
*   Integrates validated images into the training dataset without manual intervention.
*   Performance monitoring dashboard to track AI accuracy improvement over time.

**Expected Outcomes:**
*   Continuous and autonomous AI learning.
*   Reduced model drift and improved species recognition accuracy.

**2) Agentic AI for IoT Plant Monitoring**

**Features:**
*   Connects to IoT sensors measuring plant conditions (humidity, temperature, soil moisture, etc.).
*   Allows users to query sensor data in natural language, e.g., "What's the temperature?", "Get me the soil moisture".

**Expected Outcomes:**
*   Easy, natural-language access to real-time environmental data.