# Results
## Requirements Evaluation
The first requirement of this project was to create a system should "[demonstrate] clearly the potential security vulnerabilities of the application and allow them to be fixed and verified as secure". This application is proven to be vulnerable from it's extensive test suites covering a wide range of common and important vulnerabilities.

: Vulnerabilities Implemented

| Vulnerability                                     | Intent | Implemented |
|:--------------------------------------------------|:------:|:-----------:|
| A1 - Injection                                    |   M    |     Yes     |
| A2 - Broken Authentication and Session Management |   D    |     No      |
| A3 - Cross-Site Scripting (XSS)                   |   M    |     Yes     |
| A4 - Insecure Direct Object References            |   D    |     No      |
| A5 - Security Misconfiguration                    |   M    |   Via XSS   |
| A6 - Sensitive Data Exposure                      |   M    |   Via SQL   |
| A7 - Missing Function Level Access Control        |   D    |     Yes     |
| A8 - Cross-Site Request Forgery (CSRF)            |   M    |     Yes     |
| A9 - Using Components with Known Vulnerabilities  |   D    |     No      |
| A10 - Unvalidated Redirects and Forwards          |   X    |     No      |

Key --- M : Mandatory, D : Desired, X : Not Implementing

Table 2 shows the initial OWASP Top 10 table and the intentions to implement the vulnerabilities along with a new column showing wether they have been implemented. "Yes" there is a task dedicated to the topic. "No" means no exercises in this project test this topic. "Via" means that the topic is explored as part of another section.

All the mandatory implementation intents have been satisfied as well as one of the desired intents.

The second requirement of this project was to "be easy to use and educational for someone learning about web application security for the first time". This requirement has been satisfied by three things. The detailed guide to follow along with, the example solutions provided by the git branching structure and the well structured and easy to find/read codebase.

## Future Development
The blog application itself is not feature complete. Signing up for accounts, changing passwords, article tagging and profile photo uploading are all potential features that could be vulnerable to SQL injection, XSS and the like.

There could also have been more vulnerabilities explored in the top 10 list. Certainly with the Node ecosystem of packages, "Using Components with Known Vulnerabilities" could have been explored a lot more. This project has around 850 packages in its `node_modules` folder, there are bound to be some packages with security issues but it takes a significant amount of time to find these vulnerabilities if they are not known. A site like <https://snyk.io> could be of use in detecting some vulnerable packages, however.

This project could also be improved and made more useful when used with dynamic security testing tools (DAST) or static analysis tools.

## Conclusion
The goal of this project was create an vulnerable web application such that that a developer learning security best practices for the first time could take on a "hackveloper" role for them to exploit and then, with access to the source code, fix.

The application has been a success in that regard. The two major requirements were set out and have been fulfilled along with all of the sub-requirements and some extra desired functionality.

Personally, I'm happy with how the project turned out and how satisfying it feels to fix the issues and see those tests pass. I have enjoyed working on this project, it has really opened my eyes to the important of security testing and I hope this project can be used as a viable teaching tool.


```
_______________________
< Thank you for reading >
-----------------------
       \   ^__^
        \  (oo)\_______
           (__)\       )\/\
               ||----w |
               ||     ||
```

\pagebreak
