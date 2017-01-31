\pagebreak

# Introduction
## Introduction
Ever since the world wide web started allowing developers to create script executing, server-side web pages through technologies such as the Common Gateway Interface (CGI) in 1993[@serverscripts], websites were allowed to become extremely rich and powerful applications. However, where an application exists that can run code on a remote machine there will also be a potential opportunity for bad actors to exercise their hacking skills; especially where user input is allowed.

Basic security concepts like failing to escape input passed to a login page may allow raw database access and/or catastrophic data loss. Security concerns have been required knowledge for anyone wanting to build even simple dynamic websites for more than 20 years. Anyone failing to observe fundamental security practices will leave their application open for infiltration.

The top 10 attacks types[@owasp2013top10] as defined by the Open Web Application Security Project (OWASP) in 2013 are as follows:

1.  Injection
1.  Broken Authentication and Session Management
1.  Cross Site Scripting (XSS)
1.  Insecure Direct Object References
1.  Security Misconfiguration
1.  Sensitive Data Exposure
1.  Missing Function Level Access Control
1.  Cross-Site Request Forgery
1.  Using Components with Known Vulnerabilities
1.  Unvalidated Redirects and Forwards

Modern languages and frameworks like PHP or Ruby on Rails provide lots of security features and functions, often built in, for many of the attack vectors listed  but it can still be easy to misconfigure these systems, program the preventions incorrectly or overlook some of the potential security issues.

### Project Goal
The aim of this project is to take a "hackveloper" approach to teaching developers security best-practices by developing a vulnerable web application that the developer will exploit and then, with access to the source code, fix. The application focuses primarily on the issues outlined in the OWASP top 10 list but includes some other vulnerabilities as well.


\pagebreak
