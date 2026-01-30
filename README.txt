Course Material Distribution App (Static Version)
===================================================

A web application for sharing course materials (PDFs, etc.) running locally.

Prerequisites
-------------
- Node.js (v16 or higher)

Setup & Installation
--------------------
1. Open a terminal in the project folder.
2. Install dependencies:
   npm install

Running Locally
---------------
1. Start the development server:
   npm run dev
2. Open http://localhost:5173 in your browser.
3. To test Admin Config Helper, go to "Admin" and use passcode: admin123

Adding New Courses & Files
--------------------------
Since this is a static site, you cannot upload files via the browser. You must add them to the repository.

1. **Add Files**:
   - Create a folder for your course in `public/materials/`.
     Example: `public/materials/cs101/`
   - Paste your PDF files there.

2. **Update Configuration**:
   - Open `src/data/courses.js`.
   - Add a new course object to the `courses` array.
   - You can use the "Admin Config Helper" on the website to generate the code snippet for you.

   Example structure:
   ```javascript
   {
     id: "cs101",
     name: "CS101 - Intro to CS",
     instructor: "Prof. Smith",
     files: [
       { 
         id: "lec1", 
         name: "Lecture 1.pdf", 
         path: "/materials/cs101/lecture1.pdf" 
       }
     ]
   }
   ```


