# Letterly: AI Prototyping Example


> [!IMPORTANT]
> **TODO List for Author:**
> - [ ] Create separate video tutorials for Git and Node.js installation.
> - [ ] Create guide for getting OpenRouter and Google API keys.
> - [ ] Improve the Mermaid workflow diagram (make it less cluttered).
> - [ ] Add more "Style Match" examples for testing.

**Welcome, Students!** 👋

Letterly is an example project designed to teach you about **AI Prototyping**. It demonstrates how to build a real-world application that uses Artificial Intelligence to help people write better letters.

Think of Letterly as a **smart writing assistant** that sits next to you. You give it your messy, unorganized thoughts (bullet points), and it turns them into a polished, professional letter.

### The "Writers' Room" Concept
Instead of one single AI doing everything, Letterly uses a **Writers' Room** approach. Imagine a team of specialized agents working together:

1.  **Draft Generator:** Writes and rewrites the draft letter based on your rough notes and settings.
2.  **Refinement Editor:** Updates your rough notes based on your feedback so the Draft Generator can improve the letter.
3.  **Suggestions:** Reviews the draft letter against your rough notes to propose specific improvements.
4.  **Length Analyst:** Analyzes your rough notes to recommend the optimal length for the draft letter.
5.  **Line Art Generator:** Draws a custom illustration if your rough notes explicitly request a drawing or image.
6.  **Notes Sync:** Updates your rough notes to match any manual edits you make to the draft letter.
7.  **Similarity Scorer:** Calculates how accurately the draft letter matches your rough notes.

### How They Collaborate
Not all agents work the same way:
-   **In Series:** The **Refinement Editor** and **Draft Generator** work as a tag team. When you ask for changes, the Editor updates the plan first, and then the Writer rewrites the letter.
-   **In the Background:** The **Suggestions**, **Length Analyst**, and **Similarity Scorer** agents work independently to analyze your work without interrupting you.
-   **On Demand:** The **Line Art Generator** only steps in when specifically invited.



This team works together to give you the best result!

---

## 📖 How to Read This Code

If you are new to coding or web development, looking at a project like this can be overwhelming. Don't worry! Here is a simple guide to help you navigate:

### 1. The Structure (The House)
Think of this project like a house. different folders are like different rooms, each with a specific purpose.

- **`src/app` (The Skeleton):** This is the main structure. It decides what pages exist (like Home) and how they look generally (Layout).
- **`src/components` (The Furniture):** These are the reusable pieces we put inside the rooms. Things like buttons, text boxes, and icons are defined here.
- **`src/lib` (The Brains):** This is where the logic lives. It stores the "rules" for the AI agents and helper functions that don't need to be seen on screen.

### 2. Key Terms (Glossary)
Here are some words you will see often in the code:

- **Component:** A reusable building block. Imagine a Lego brick. `LetterApp.tsx` is a big brick made of smaller bricks like buttons and inputs.
- **Prop:** Short for "Property". It's how we pass information to a component. Like telling a "Button" component to be "Blue".
- **State:** The application's short-term memory. It remembers what you typed in the text box or which options you selected *right now*.
- **API (Application Programming Interface):** Think of this as a waiter. You (the frontend) give the waiter an order (data), the waiter takes it to the kitchen (server/AI), and brings back your food (the generated letter).
- **Interface:** A contract or checklist. It defines exactly what shape data must have. For example, a "User" interface might require a `name` and `email`.

---

## 🗺️ Project Tour (File Map)

Here is a quick tour of the most important files you should look at:

### The Visuals (Frontend)
- **`src/components/LetterApp.tsx`**: The heart of the app. This single file contains almost all the logic for the user interface. It handles what happens when you click "Generate".
- **`src/components/AgentModelSettings.tsx`**: A menu that lets you choose which AI "brain" controls which part of the app.
- **`src/app/page.tsx`**: The entry point. When you visit the website, this file tells the browser to load `LetterApp`.

### The Intelligence (Backend/API)
These files mostly live in `src/app/api/`. They are the "kitchen" where the work happens.
- **`api/generate/route.ts`**: The main writer. It takes your notes and writes the letter.
- **`api/refine/route.ts`**: The editor. It takes your feedback (e.g., "Make it shorter") and updates the notes.
- **`api/suggest/route.ts`**: The critic. It looks at your draft and suggests improvements.
- **`api/detect-tone/route.ts`**: A detective. It acts invisibly to figure out if you asked for a specific tone (like "Sarcastic").

### The Configuration (The Brains)
- **`src/lib/agent-constants.ts`**: This is the "character sheet" for our AI agents. It defines who they are (e.g., "You are an expert editor") and what they should do. **This is the most important file for prompt engineering.**

---

## 🚀 Getting Started

Want to run this on your own machine? Follow these steps:

### Prerequisites
- **Node.js**: You need to have Node.js installed. **This includes `npm` (the tool we use to install other things).** (See separate tutorial for installation steps).
    - [Download Node.js here](https://nodejs.org/) (Choose the "LTS" version).
- **Git**: You need Git to clone the repository.
    - [Download Git here](https://git-scm.com/downloads).
    - **Note:** VS Code requires this to be installed to handle your code versions. (See separate tutorial for installation steps).
- **API Keys**: You will need keys for **OpenRouter** (to access AI models) and optional **Google** keys for images. (See separate tutorial for obtaining these keys).

### Installation

1.  **Open VS Code**: Open Visual Studio Code on your computer.

2.  **Open the Terminal**:
    -   Look at the top menu bar.
    -   Click **Terminal** -> **New Terminal**.
    -   A box should appear at the bottom of your screen. This is where you talk to the computer.

3.  **Choose a Location**:
    It is best practice to keep your code in a dedicated folder (not on your Desktop!).
    
    Type these commands one by one and hit `Enter` after each:
    ```sh
    # Go to your home user folder
    cd ~

    # Create a 'repos' folder (if you don't have one)
    mkdir repos

    # Enter the folder
    cd repos
    ```

4.  **Clone the Repository**:
    Copy and paste this command into the terminal and hit `Enter`:
    ```sh
    git clone https://github.com/tj60647/Letterly.git
    ```

5.  **Go into the Folder**:
    Now tell the terminal to go inside the folder we just downloaded:
    ```sh
    cd Letterly
    ```

6.  **Install Dependencies**:
    Run this command to download all the "furniture" and tools we need:
    ```sh
    npm install
    ```

3.  **Set Up Keys**:
    Create a file named `.env.local` in the main folder and add your keys like this:
    ```env
    OPENROUTER_API_KEY=sk-or-v1-...
    GOOGLE_API_KEY=AIzaSy...
    ```

4.  **Run the App**:
    Type this command to start the server:
    ```bash
    npm run dev
    ```

5.  **Open It**: Go to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ⚖️ License
This project is open-source and available under the **MIT License**.
Author: **Thomas J McLeish** (c) 2026.


