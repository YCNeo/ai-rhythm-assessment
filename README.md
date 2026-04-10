# AI Rhythm Assessment

An AI-powered follow-up questionnaire platform built around the book **《節奏工作法》**.  
This project is designed for post-course reflection, helping participants review their recent work rhythm, complete a structured questionnaire, and receive a personalized AI-generated response report.

## Overview

**AI Rhythm Assessment** is a Google Apps Script web application created for courses and public sessions centered on **《節奏工作法》**.

Instead of serving as a generic survey tool, this project is specifically designed as a **post-session questionnaire and feedback experience**. After attending a course or public lecture related to the book, participants can fill out a structured rhythm assessment form, and the system will generate a personalized AI response based on their answers.

The application combines:

- a course follow-up questionnaire
- structured self-reflection
- AI-generated personalized feedback
- PDF report generation
- email delivery

## Purpose

This project was built to extend the learning experience of **《節奏工作法》** beyond the course itself.

Through the questionnaire, participants can:

- reflect on their recent work and life rhythm
- identify patterns across multiple dimensions
- receive AI-organized feedback and interpretation
- turn abstract self-observation into more actionable insights

## Features

- **Post-course questionnaire interface**  
  A web-based form for collecting participant background information and rhythm assessment answers.

- **Book-centered assessment design**  
  The questionnaire is designed around the ideas and context of **《節奏工作法》**, rather than being a generic productivity form.

- **AI-generated personalized response**  
  After submission, the system uses Gemini to generate a personalized analysis report based on the participant’s answers.

- **PDF report generation**  
  The AI response can be exported as a PDF file for archiving and sharing.

- **Email delivery**  
  Participants can receive the generated report directly in their inbox.

- **Versioned questionnaire support**  
  The app supports questionnaire version control, making it easier to iterate and update course content over time.

## How It Works

1. A participant opens the web app.
2. The participant fills in basic background information and completes the questionnaire.
3. The submitted answers are processed by the Apps Script backend.
4. The system builds a prompt using:
   - participant information
   - questionnaire answers
   - predefined prompt context
5. Gemini generates a personalized response report.
6. The report is saved, converted into PDF, and can be sent by email.

## Tech Stack

- **Google Apps Script**
- **HTML / JavaScript**
- **Google Gemini API**
- **Google Drive API**
- **Google Sheets API**
- **MailApp**

## Project Structure

```text
.
├── README.md              # Project documentation
├── appsscript.json        # Apps Script manifest and permissions
├── code.gs                # Main backend logic
├── index.html             # Main questionnaire page
├── javascript.html        # Frontend interaction logic
├── prompt_context.gs      # AI prompt context and response template logic
└── question_versions.gs   # Questionnaire version definitions
```

## Core Workflow

The backend currently supports the following flow:

* load questionnaire content by version `.../exec?v=v1`
* collect participant responses
* generate AI report with Gemini
* create a PDF copy of the report
* save the generated file to Google Drive
* record submission data
* send the PDF report by email

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YCNeo/ai-rhythm-assessment.git
```

### 2. Create an Apps Script project

Create a new Google Apps Script project and copy the project files into it.

### 3. Configure required services

This project relies on:

* Google Apps Script V8 runtime
* Google Drive advanced service
* Google Sheets advanced service
* external HTTP requests
* MailApp permission

### 4. Add your Gemini API key

Update the API key setting in `code.gs`.

Example:

```javascript
const API_KEY = "YOUR_API_KEY";
```

### 5. Enable Advanced Google Services

In the Apps Script editor, enable:

* Google Drive API
* Google Sheets API

You may also need to enable the corresponding APIs in the linked Google Cloud project.

### 6. Deploy as a Web App

Deploy the script as a Web App.

Recommended deployment settings:

* **Execute as:** Me
* **Who has access:** Anyone / Anyone with the link
  (depending on your actual usage scenario)

## Configuration Notes

### Questionnaire Versions

Questionnaire content is managed through:

* `question_versions.gs`

This makes it possible to maintain different versions for future courses, workshops, or revised question flows.

### Prompt Context

AI response logic is managed through:

* `prompt_context.gs`

You can adjust:

* response tone
* report structure
* prompt instructions
* interpretation style

### Storage and Delivery

The application currently uses Google services to support:

* response record storage
* generated PDF storage
* email delivery to participants

## Use Cases

This project is suitable for scenarios such as:

* post-course questionnaires
* public talk follow-up forms
* reflection-based workshop feedback
* book-centered learning experiences
* AI-assisted self-review tools

## Security Notes

Because this project is deployed as a web app and handles participant data, you should review the following before using it in production or public-facing scenarios:

* API key management
* access permissions
* Google Drive file visibility
* email sending quota
* personal data handling and privacy practices

For long-term maintenance, avoid hardcoding secrets directly in source files if possible.

## Author

Created by **Neo Pan**.
