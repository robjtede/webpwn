# Requirements and Analysis
## Project Aims
The aim of this project is ultimately, to teach people how to protect their own web applications from bad actors using the "Hackveloper" approach. The OWASP list of top 10 attack vectors (Table 1) provides the basis for the intended implemented vulnerabilities for this project. Below is a table of vulnerabilities and whether this project intends to implement them along with the priorities of each.

: OWASP (2010) Top 10 Vulnerabilities List

| Vulnerability                                     | Intend To Implement |
|:--------------------------------------------------|:-------------------:|
| A1 - Injection                                    |          M          |
| A2 - Broken Authentication and Session Management |          D          |
| A3 - Cross-Site Scripting (XSS)                   |          M          |
| A4 - Insecure Direct Object References            |          D          |
| A5 - Security Misconfiguration                    |          M          |
| A6 - Sensitive Data Exposure                      |          M          |
| A7 - Missing Function Level Access Control        |          D          |
| A8 - Cross-Site Request Forgery (CSRF)            |          M          |
| A9 - Using Components with Known Vulnerabilities  |          D          |
| A10 - Unvalidated Redirects and Forwards          |          X          |

Key --- M : Mandatory, D : Desired, X : Not Implementing

## Testing & Evaluation Methods
Testing this application will require both technical and teaching aspects. As a result, the system primarily needs to demonstrate potential vulnerabilities of the application and allow the user to fix and verify it as secure. In addition, it also needs to be easy to use and be an overall educating experience, especially considering a target audience of someone learning about web application security for the first time. If it succeeds in both areas, the application will be a success.

If the application succeeds in both of these areas it will be a success.

## Conclusions
Reading about web application security and looking at projects like BREW and OWASP Hackademic provided a clearer idea of what this project should look like in its final form.

Initially, the project description stated the application should be able to detect and prevent expected attacks from running, while still reporting them as successful. However, this seemed to overcomplicate the system---especially given that this is being run as a self hosted web app. Since Git provides a easily applied method for rolling back changes if exploits break the application or database, this was deemed a suitable alternative.  

The goal of this project is to create a vulnerable web app, like those seen with BREW and Hackademic, but offer a more relevant “real-world” approach, using language and framework more likely to be seen in the industry, rather than Java.

\pagebreak
