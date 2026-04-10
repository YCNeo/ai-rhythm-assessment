# AI Rhythm Assessment

A Google Apps Script web application for collecting questionnaire responses and generating personalized AI-powered rhythm assessment reports.

This project is designed to support a structured questionnaire workflow: users submit their background information and assessment answers, the system generates a personalized report with Gemini, converts the result into PDF, and sends it to the user by email.

## Overview

AI Rhythm Assessment is a lightweight assessment platform built with Google Apps Script and HTML. It is intended for scenarios such as coaching programs, consulting workflows, learning diagnostics, or structured self-evaluation experiences.

The application currently supports:

- Collecting learner background information
- Running a personalized rhythm assessment questionnaire
- Generating AI-based personalized reports with Gemini
- Exporting reports as PDF
- Sending the generated report by email

## Features

- **Web-based questionnaire interface**  
  A browser-based form for collecting user profile data and questionnaire responses.

- **Personalized AI report generation**  
  Uses Gemini to generate customized assessment reports based on submitted answers.

- **PDF export**  
  Converts generated report content into a PDF file for easier delivery and archiving.

- **Email delivery**  
  Sends the generated PDF report directly to the respondent’s email.

- **Questionnaire versioning support**  
  Supports multiple questionnaire versions through separated version configuration logic.

## Tech Stack

- **Google Apps Script**
- **HTML / JavaScript**
- **Google Gemini API**
- **Google Drive API**
- **Google Sheets API**
- **Google MailApp**

## Project Structure

```text
.
├── appsscript.json        # Apps Script manifest and permissions
├── code.gs                # Main backend logic
├── index.html             # Web app UI
├── javascript.html        # Frontend interaction logic
├── prompt_context.gs      # Prompt context / report generation content
├── question_versions.gs   # Questionnaire version definitions
└── README.md
```

## How It Works

1. A user opens the web app and fills out the questionnaire.
2. The submitted answers are processed by the Apps Script backend.
3. The system builds a Gemini prompt from:

   * learner background information
   * questionnaire answers
   * report context template
4. Gemini generates a personalized report.
5. The report is converted into a PDF.
6. The PDF is sent to the user by email.

## Requirements

Before deploying this project, make sure you have:

* A Google account with access to Google Apps Script
* A valid Gemini API key
* Google Drive API enabled
* Google Sheets API enabled
* Permission to send email via Apps Script

## Setup

### 1. Clone this repository

```bash
git clone https://github.com/YCNeo/ai-rhythm-assessment.git
```

### 2. Create a new Apps Script project

Create a new Google Apps Script project and copy the repository files into it.

### 3. Configure `appsscript.json`

This project requires the following Apps Script configuration:

* V8 runtime
* Web App deployment
* Drive and Sheets advanced services
* External request permission
* Email sending permission

### 4. Add your Gemini API key

In `code.gs`, replace the placeholder API key:

```javascript
const API_KEY = "YOUR_API_KEY";
```

with your actual Gemini API key.

### 5. Enable Advanced Google Services

In the Apps Script editor, enable:

* **Google Sheets API**
* **Google Drive API**

You may also need to enable the corresponding APIs in the Google Cloud project linked to your Apps Script project.

### 6. Deploy as Web App

Deploy the project as a Web App.

Recommended settings:

* **Execute as:** User deploying the app
* **Who has access:** Anyone

## Configuration Notes

### Questionnaire Versions

Questionnaire content is versioned in:

* `question_versions.gs`

You can extend this file to support multiple diagnostic flows or audience-specific question sets.

### Prompt Context

Prompt-building logic and contextual report content are managed through:

* `prompt_context.gs`

You can customize the generated report style, structure, and tone there.

### PDF and Email Delivery

PDF generation and email sending are handled in the Apps Script backend.
Make sure the deployment account has permission to:

* create or access Drive files
* generate PDFs
* send emails through Apps Script

## Example Use Cases

* Coaching intake assessment
* Learning rhythm diagnostics
* Personal productivity evaluation
* AI-assisted consulting workflows
* Educational or workshop follow-up reports

## Security Notes

This project currently appears to be configured as an anonymously accessible web app. If you plan to use it in production, consider reviewing:

* authentication requirements
* API key storage strategy
* email sending limits
* access permissions for generated files
* personal data handling and privacy compliance

For better security, avoid hardcoding secrets directly in source files for production deployments. Consider using a more secure secret management approach where possible.

## Future Improvements

Possible improvements for this project:

* Save submissions to Google Sheets automatically
* Add admin dashboard for response review
* Support multilingual reports
* Add authentication and access control
* Improve UI/UX for mobile devices
* Store generated reports in structured Drive folders
* Add retry / logging / monitoring for report generation failures

## Repository Description Suggestion

You can use this as the GitHub repository description:

> Google Apps Script web app for personalized rhythm assessment, AI-generated reports, PDF export, and email delivery.

## License

Add your preferred license here, for example:

* MIT License
* Apache-2.0
* Proprietary / All rights reserved

If you do not want others to freely reuse the code, do not leave this section blank—explicitly state your intended license.

## Author

Created by Neo Pan.

---

If you find this project useful, consider adding documentation for:

* deployment screenshots
* questionnaire schema
* sample prompt design
* report output examples
