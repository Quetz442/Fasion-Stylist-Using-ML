📘 StyleAura: ML-Powered Fashion Stylist for Women
StyleAura is an AI-powered fashion recommendation system tailored for women. It provides personalized outfit suggestions based on body shape, seasonal color palette, and occasion, using a combination of ML, vision APIs, and web technologies.

🧩 Features
1. Body Shape-Based Fashion Recommendations
   - Input: Full-body image, manual body measurements, or known shape  
   - Tech: Google Gemini API for body shape detection  
   - ML: Random Forest model with 9.2/10 accuracy  

2. Seasonal Color Palette Analysis  
   - Input: Facial image, Colour Input or known palette type  
   - Output: Suggested seasonal color palette (summer, winter, autumn, spring)  
   - API: Gemini for skin tone detection  

3. Occasion-Based Styling Suggestions  
   - Contextual outfit curation aligned with user body shape and event type  

4. Image Recommendations  
   - Visual outfit examples sourced in real-time using Pexels API

🧠 Tech Stack
- Frontend: React.js, TailwindCSS, JavaScript  
- Backend: Django (Python)  
- Database: MongoDB  
- APIs: Google Gemini API, Pexels API  
- ML Model: Random Forest (Scikit-learn)  

🛠️ ML Pipeline
1. Data Collection from curated fashion sources  
2. Feature Extraction: Measurements, skin tone, image embeddings  
3. Model: Trained Random Forest classifier  
4. Evaluation: 92% accuracy based on test inputs

⚙️ Setup Instructions
Uses concurrently to start both front end and backend servers

Command: npm run start

🔐 Ethics & Privacy
- User images are not stored permanently  
- Body-positive and inclusive design  
- AI used only for enhancing personal expression

📌 Future Scope
- Personalized wardrobe assistant  
- Outfit drag-and-drop builder  
- Marketplace integration  
- Live style assistant chatbot  

📨 Contact
Harsh Koladkar  
- LinkedIn: https://linkedin.com/in/harshkoladkar  
- GitHub: https://github.com/Quetz442
