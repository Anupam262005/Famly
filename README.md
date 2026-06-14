<h1>Famly — Connecting All the Generations </h1>
<h2><i>Because every story deserves to be remembered.</i></h2>

<h2>Created by Team Diamond</h2>

<ul>
  <li><strong>Desh Deepak</strong> – Reg. No: 20243089, Branch: CSE</li>
  <li><strong>Vansh Saini</strong> – Reg. No: 20243310, Branch: CSE</li>
  <li><strong>Anupam</strong> – Reg. No: 20243042, Branch: CSE</li>
</ul>


<h3>📘 Overview</h3>
<p>
<em>Famly</em> is a comprehensive full-stack web application built to preserve and celebrate family stories, traditions, and memories across generations. It offers a secure and collaborative platform where families can record, organize, and relive their stories in the form of text, photos, videos, and audio clips.
</p>
<p>
Interactive timelines, and dynamic family trees, Famly makes storytelling engaging and meaningful. Its <strong>dual-database architecture</strong> (PostgreSQL + MongoDB) ensures seamless management of both structured relational data and unstructured media, making the platform highly scalable and robust.
</p>


<h2>🧩 Problem Statement</h2>
<ul>
  <li>Family stories and traditions often fade with time due to:</li>
  <ul>
    <li>Lost oral storytelling and unorganized digital memories</li>
    <li>Lack of a centralized, secure, and engaging platform</li>
    <li>Difficulty in connecting younger generations with family history</li>
  </ul>
</ul>


<section>
  <h2>🧱 Technology Stack</h2>

  <h3>Frontend</h3>
  <ul>
    <li><strong>Framework:</strong> React.js – For building dynamic user interfaces.</li>
    <li><strong>Styling:</strong> Tailwind CSS – For modern, responsive design.</li>
    <li><strong>Routing:</strong> React Router – For client-side routing.</li>
    <li><strong>Build Tool:</strong> Vite – Fast bundling and development.</li>
  </ul>

  <h3>Backend</h3>
  <ul>
    <li><strong>Runtime:</strong> Node.js – JavaScript runtime for server-side code.</li>
    <li><strong>Framework:</strong> Express.js – Web framework for building RESTful APIs and handling server logic.</li>
    <li><strong>Databases:</strong>
      <ul>
        <li>MongoDB – Stores unstructured data such as notifications, chat messages, and content.</li>
        <li>PostgreSQL – Stores structured relational data such as users, families, and memberships.</li>
      </ul>
    </li>
    <li><strong>Authentication:</strong> JWT (JSON Web Tokens) – Secure authentication and role-based access control.</li>
  </ul>
</section>



<h2>🚀 Highlights</h2>
<ul>
  <li>✅ Complete <b>Frontend + Backend</b> integration</li>
  <li>✅ <b>Dual-database design</b> (PostgreSQL + MongoDB)</li>
  <li>✅ Secure <b>JWT Authentication</b> & Role-based Access</li>
  <li>✅  <b>tagging, prompts, and search</b></li>
  <li>✅ Interactive <b>Timeline + Family Tree</b> visualization</li>
  <li>✅ <b>Notifications, celebrations</b>, and media exports</li>
  <li>✅ <b>Cloud-based</b> image/video storage</li>
  <li>✅ Fully tested <b>API endpoints</b> and modular architecture</li>
</ul>


<h2>🧩 Core Features</h2>

<h3>👨‍👩‍👧 Family Circles</h3>
<ul>
  <li>Create private family circles with role-based permissions (<b>Admin, Contributor, Viewer</b>)</li>
  <li>Manage members, invitations, and relationships using <b>PostgreSQL</b></li>
  <li>Private data separation per family</li>
</ul>

<h3>🖼️ Story Recording & Uploading</h3>
<ul>
  <li>Upload <b>text, audio, video, or photos</b></li>
  <li>Metadata (date, uploader, tags) stored in <b>MongoDB</b></li>
  <li>Secure file uploads using <b>Multer + Cloudinary</b></li>
  <li>AI auto-tagging of faces, objects, and locations</li>
</ul>

<h3>🕰️ Interactive Timeline & Family Tree</h3>
<ul>
  <li>Scrollable, visual timeline of family stories</li>
  <li>Dynamic family tree built from relationships in <b>PostgreSQL</b></li>
  <li>Each story linked to relevant members and timeframes</li>
</ul>

<h3>🔔 Notifications & Celebrations</h3>
<ul>
  <li>Automated birthday & anniversary alerts</li>
  <li>Push, email, and in-app notifications</li>
  <li>Real-time updates via <b>WebSockets</b></li>
</ul>

<h3>🔎 Smart Search</h3>
<ul>
  <li>Search by title or tag</li>
  <li><b>MongoDB Atlas Search</b> + AI-driven semantic results</li>
</ul>

<h3>📤 Export & Sharing</h3>
<ul>
  <li>Generate PDFs or e-books of family stories using <b>Puppeteer</b></li>
  <li>Offline download or share via private links</li>
</ul>

<h3>🔒 Security & Privacy</h3>
<ul>
  <li><b>JWT + bcrypt</b> for encrypted authentication</li>
  <li>Role-based access control across family circles</li>
  <li>Private routes and secure API endpoints</li>
</ul>


<h2>⚙️ Installation & Setup</h2>
<ol>
  <li>Clone the repository: <code>git clone https://github.com/Guddan-Deepak/Famly.git</code></li>
  <li>Navigate to the backend folder and install dependencies: <code>npm install</code></li>
  <li>Navigate to the frontend folder and install dependencies: <code>npm install</code></li>
  <li>Set up environment variables (<code>.env</code>) for database URLs, JWT secret, and cloud storage keys</li>
  <li>Run backend: <code>npm run dev</code></li>
  <li>Run frontend: <code>npm run dev</code></li>
</ol>
<h2>📡 API Endpoints</h2>
<ul>
  <li><code>POST /auth/register</code> – Register a new user</li>
  <li><code>POST /auth/login</code> – Login</li>
  <li><code>GET /content/user-recent-stories</code> – Fetch recent stories with pagination</li>
  <li><code>POST /content/upload</code> – Upload a story (text, image, audio, video)</li>
</ul>
<img width="1896" height="870" alt="Screenshot 2025-10-11 045327" src="https://github.com/user-attachments/assets/f2364b39-36bb-4894-b019-af513797a153" />
<img width="1884" height="853" alt="Screenshot 2025-10-11 045340" src="https://github.com/user-attachments/assets/2c1faa44-bf36-4a46-a91e-d9fa8254fff4" />
<img width="1722" height="864" alt="Screenshot 2025-10-11 045356" src="https://github.com/user-attachments/assets/d18f399e-b219-4ee3-888b-c90f1239d68a" />
<img width="1513" height="857" alt="Screenshot 2025-10-11 045414" src="https://github.com/user-attachments/assets/68e90fe0-16ef-42cd-98a1-d5aab8d6c6fa" />
<img width="1853" height="855" alt="image" src="https://github.com/user-attachments/assets/d7ab18b5-b30f-40c4-b963-dac5ebfa2673" />

<h2>📄 License</h2>
<p>This project is licensed under the MIT License. See the <code>LICENSE</code> file for details.</p>

