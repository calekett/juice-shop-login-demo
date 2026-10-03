# Juice Shop Login Demo

A small login page inspired by [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/).
I built it for a web security assignment to practice writing a login form that
defends against the attacks Juice Shop is famous for: **SQL injection**,
**cross-site scripting (XSS)**, and **weak password storage**.

## What it does

- Shows a simple email + password login form.
- Checks the input **in the browser** (client-side) and **again on the server**,
  because client-side checks can be turned off or bypassed.
- Looks the user up in a SQLite database using a **parameterized query**, so
  user input is always treated as data and can never become SQL code.
- Stores passwords only as **bcrypt hashes**, never in plain text, and compares
  them with `bcrypt.compare`.

### Validation rules
Both the browser and the server require:
- Email and password are not empty.
- The email contains an `@`.
- The password is at least 8 characters long.

## Security features

| Threat | Defense in this project |
| --- | --- |
| SQL injection | Parameterized query (`WHERE email = ?`) binds input as data |
| Password theft | bcrypt hashing with a cost factor of 12 |
| Cross-site scripting (XSS) | Messages rendered with `textContent`; strict Content-Security-Policy blocks inline scripts |
| User enumeration | One generic "Invalid email or password" message |
| Common web attacks | Security headers added with [Helmet](https://helmetjs.github.io/) |

## How to run it

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Then open <http://localhost:3001> in your browser.

A test account is created automatically when the server starts:

```
Email:    admin@juice.test
Password: Password123
```

## Project structure

```
.
├── server.js          # Express server: validation, DB query, bcrypt check
├── public/
│   ├── index.html     # The login form
│   ├── app.js         # Client-side validation + submit handling
│   └── style.css      # Styling
├── package.json
└── README.md
```

## Notes

The database is in-memory, so it resets every time the server restarts. That
keeps the demo simple to run and means there is nothing sensitive to store.
