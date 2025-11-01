const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- ROUTE 1: Default Page ---
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Sending API - By Siam</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; color: #333; line-height: 1.6; }
        header { background-color: #4a90e2; color: #fff; padding: 40px 20px; text-align: center; }
        header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        header p { font-size: 1.1rem; opacity: 0.9; }
        main { max-width: 950px; margin: 40px auto; padding: 0 20px; }
        section { background: #fff; padding: 25px 30px; margin-bottom: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h2 { color: #4a90e2; margin-bottom: 15px; }
        p { margin-bottom: 15px; }
        ul { margin-left: 20px; }
        pre { background-color: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 0.95rem; }
        code { font-family: monospace; }
        footer { text-align: center; padding: 25px 20px; font-size: 0.9rem; color: #777; }
        footer a { color: #4a90e2; text-decoration: none; margin: 0 8px; }
        footer a:hover { text-decoration: underline; }
        @media (max-width: 600px) { header h1 { font-size: 2rem; } }
      </style>
    </head>
    <body>
      <header>
        <h1>Email Sending API</h1>
        <p>Send emails easily via any SMTP server — powered by Node.js & Nodemailer</p>
      </header>
      <main>
        <section>
          <h2>Overview</h2>
          <p>This API allows you to send emails via any SMTP server. You can provide all the required SMTP and email details either through the JSON request body or query parameters. It’s simple, fast, and public.</p>
          <p><strong>Perfect for:</strong></p>
          <ul>
            <li>Serverless websites (like Vercel, Netlify, or Cloudflare Workers)</li>
            <li>Frontend apps where you don't want to expose your SMTP credentials</li>
            <li>Quick email testing without setting up a backend</li>
            <li>Contact forms on static sites</li>
          </ul>
        </section>
        <section>
          <h2>Endpoint</h2>
          <p><strong>POST /send-email</strong></p>
          <p>Accepts both JSON body and query parameters. You can also use GET requests for testing.</p>
        </section>
        <section>
          <h2>Request Example (JSON Body)</h2>
          <pre><code>{
  "smtp_host": "smtp.example.com",
  "smtp_port": 587,
  "smtp_secure": false,
  "smtp_user": "your_email@example.com",
  "smtp_pass": "your_password",
  "from": "your_email@example.com",
  "to": "receiver@example.com",
  "subject": "Hello",
  "html": "<h1>Hi there!</h1><p>This is a test email.</p>"
}</code></pre>
        </section>
        <section>
          <h2>Query Parameters Example</h2>
          <pre><code>GET /send-email?smtp_host=smtp.example.com&amp;smtp_port=587&amp;smtp_secure=false&amp;smtp_user=your_email@example.com&amp;smtp_pass=your_password&amp;from=your_email@example.com&amp;to=receiver@example.com&amp;subject=Hello&amp;html=&lt;h1&gt;Hi there!&lt;/h1&gt;</code></pre>
        </section>
        <section>
          <h2>Response Example</h2>
          <pre><code>{
  "success": true,
  "message": "Email has been sent successfully!"
}</code></pre>
        </section>
        <section>
          <h2>Notes & Tips</h2>
          <ul>
            <li>If using Gmail, create an <strong>App Password</strong> for SMTP.</li>
            <li>Supports both POST JSON body and query parameters.</li>
            <li>Great for <strong>frontend-only projects</strong> or static websites that need a quick email solution.</li>
            <li>No database or authentication required — just call the API.</li>
            <li>Works globally — you just need internet access.</li>
          </ul>
        </section>
      </main>
      <footer>
        &copy; 2025 Email Sending API by <strong>Abu Sayed al Siam</strong><br>
        <a href="https://www.facebook.com/codeWithSiam" target="_blank">Facebook</a> |
        <a href="https://github.com/codewithsiam" target="_blank">GitHub</a> |
        <a href="https://www.linkedin.com/in/abu-sayed-al-siam-411017277/" target="_blank">LinkedIn</a>
      </footer>
    </body>
    </html>
  `);
});

// --- ROUTE 2: Send Email ---
app.all("/send-email", async (req, res) => {
  // Use body first, fallback to query

  const smtp_host = req.body?.smtp_host || req.query?.smtp_host;
  const smtp_port = req.body?.smtp_port || req.query?.smtp_port;
  const smtp_user = req.body?.smtp_user || req.query?.smtp_user;
  const smtp_pass = req.body?.smtp_pass || req.query?.smtp_pass;
  const from = req.body?.from || req.query?.from;
  const to = req.body?.to || req.query?.to;
  const subject = req.body?.subject || req.query?.subject;
  const html = req.body?.html || req.query?.html;
  const smtp_secure = req.body?.smtp_secure || req.query?.smtp_secure;

  // --- Validate required fields individually ---
  const missingFields = [];
  if (!smtp_host) missingFields.push("smtp_host");
  if (!smtp_port) missingFields.push("smtp_port");
  if (!smtp_user) missingFields.push("smtp_user");
  if (!smtp_pass) missingFields.push("smtp_pass");
  if (!from) missingFields.push("from");
  if (!to) missingFields.push("to");
  if (!subject) missingFields.push("subject");
  if (!html) missingFields.push("html");

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: parseInt(smtp_port),
      secure:
        smtp_secure === true || smtp_secure === "true" || smtp_port == 465,
      auth: {
        user: smtp_user,
        pass: smtp_pass,
      },
      tls: { rejectUnauthorized: false },
    });

    // Send email
    const info = await transporter.sendMail({
      from, // only email
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.response);

    res.json({
      success: true,
      message: "Email has been sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

// --- START SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
