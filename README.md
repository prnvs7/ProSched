# 🏭 Factory Management System

A full-stack web application designed to streamline production planning and scheduling workflows.
Built with a focus on performance, scalability, and a clean user experience.

🔗 **Live Demo:** https://prnvs7.github.io/ProSched/

---

## 🧠 Overview

This project was developed to simulate real-world ProSched operations — handling task scheduling, production flow, and basic workflow management through a responsive web interface.

It integrates a modern frontend with a backend-as-a-service approach, making it both lightweight and scalable.

---

## 🚀 What it does

* Helps manage and visualize production workflows
* Organizes tasks and scheduling logic
* Provides a structured interface for planning operations
* Integrates authentication and database via Supabase
* Runs entirely in the browser with fast load times

---

## ⚙️ Tech Stack

**Frontend**

* React (component-based architecture)
* Vite (fast bundling and dev server)

**Backend / Services**

* Supabase (PostgreSQL + Auth + APIs)

**Styling**

* Tailwind CSS / custom styling

**Deployment**

* GitHub Pages (CI/CD using GitHub Actions)

---

## 📁 Project Structure

```id="x8k3la"
ProSched/
├── src/
│   ├── components/     # reusable UI components
│   ├── pages/          # application views
│   ├── lib/            # utility + API logic
│   └── main.jsx        # entry point
│
├── public/
├── vite.config.js
├── package.json
└── .env
```

---

## 🛠️ Getting Started

### Clone the repo

```bash id="0z2hh4"
git clone https://github.com/prnvs7/ProSched.git
cd ProSched
```

---

### Install dependencies

```bash id="y92v8j"
npm install react react-dom
npm install @supabase/supabase-js
npm install -D vite
npm install -D eslint
npm install
```

---

### Setup environment variables

Create a `.env` file:

```id="sc1t7w"
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

### Run locally

```bash id="y5pdst"
npm run dev
```

---

### Build for production

```bash id="z8jgj6"
npm run build
```

---

## 🌐 Deployment

The project is deployed using GitHub Pages with an automated CI/CD pipeline:

* Push to `main` branch triggers build
* Vite compiles the app into `/dist`
* GitHub Actions deploys it automatically

---

## ⚠️ Notes / Gotchas

* GitHub Pages requires this in `vite.config.js`:

```js id="m6rmh3"
base: "/ProSched/"
```

* If routing is used, prefer:

```jsx id="wd5h1o"
HashRouter
```

over `BrowserRouter` to avoid 404 issues.

---

## 📌 Future Improvements

* Better scheduling algorithms
* Role-based access control
* Real-time updates using Supabase subscriptions
* UI/UX refinements

---

## 🤝 Contributing

Feel free to fork the repo and open a PR.
Any improvements, optimizations, or suggestions are welcome.

---

## 👨‍💻 Author

**Pranav Singh**
GitHub: https://github.com/prnvs7
**Ritesh Kumar**
GitHub: https://github.com/RiteshVerma1102
**Mehakdeep Kaur**
GitHub: https://github.com/mehakdeepkaurkhosa

---
