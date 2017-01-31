# Literature Survey
## Security Issues
This section will describe the security issues related to web applications, how they are exploited and how they are prevented at an abstract level, independent of programming language or framework.

OWASP uses short codes to reference the vulnerability categories more succinctly, A1--A10. Many of the categories listed have some overlap with others. It is also worth noting that OWASP is not the only source for these vulnerability definitions. MITRE, the organisation that manages the Common Weakness Enumeration (CWE) database and Common Vulnerability Enumeration (CVE) database details the same issues, as well. This project uses OWASPs list as a general guide backed up by other organisations.

### Injection A1
Injection has a few types: **code injection**, **command injection** and **query injection**. They are similar in the potential vulnerabilities they allow and how they are exploited but differ in where or what is being exploited.

Query injections

: are executed on database driven applications where user input is allowed and a query string is constructed without first properly sanitising the input. This is most common on SQL based databases due to the string based nature of the queries as well as the built in logic statements. [@owasp2013sqlinjection; @owaspsqlinjection; @mitresqlinjection]

: With this attack vector is it possible to bypass authentication. A simple login check on a database simply asks the database if the given username and password match any of the rows in the database. By using an input that escapes the query string and adding in extra SQL commands like `' OR 1=1 ` the system evaluates the query to true and allows the login. Multiple SQL statements can be made in the same line by separating them with a semi-colon. So chaining commands with input like `'; DROP TABLE users; --` would, given the database user has permission to do do, completely delete the table causing catastrophic data loss. (Note: the double hyphen at the end of that query string is to cause the query interpreter to treat the rest of the line as a comment so that the encapsulating apostrophe is not interpreted as code which would, otherwise, cause a syntax error.)

: The solution is to properly sanitise input, making sure that any apostrophes, backslashes or control characters are escaped. In the examples above the problem has been the leading apostrophe allowing the input to escape the bounds of the query. Creating safe, sanitised queries can be achieved with query parameterisation functions present in most languages and frameworks rather than directly constructing queries via string concatenation.

Command injections

: are similar query injections but work in environments where sub-processes are spawned, often in the form of sub-shells, to retrieve data. This is less a problem with modern languages as it is rarely required to call another program to get data. However, this was certainly an issue during the CGI scripting era and can still be an issue in modern PHP code. The exception to this in modern programming is where file names are being provided by the user and retrieved from the file system. [@owaspcommandinjection; @mitrecommandinjection]

: In a system where sub-processes are spawned arguments passed to commands can be escaped or appended just as with SQL injection. On UNIX systems, multiple commands can be called on a single line with a semi-colon separator. So, for example, appending `; cat /etc/passwd` to the input would result in the entire user entry file (potentially including passwords) being returned and outputted. Even with systems that do not use sub-shells but still take file name input from the user (URLs, for example), it is possible to access unexpected file system locations using valid navigation syntax and no command escaping. Using `../` in a file path references the parent directory so not correctly handling a user-provided path including this syntax could allow access to files outside the scope of the application directory.

: Again, the solution is to properly escape any special characters (or combinations thereof) that could cause unexpected commands to be run or files to be accessed.

Code injections

: sound similar to to command injections but related more to the running code than to additional processes. For example, user input could be directly used as an object reference, giving access to private methods instance variables.

: It is also possible in languages such as JavaScript to parse an input string and execute it using the `eval()` function. It is strongly advised to forego using such dynamic code execution methods where user input is allowed.

: As is the case with injection prevention, the solution is once again to simply sanitise input before use. Injection attacks are high risk and are easy to exploit but with basic knowledge pertaining to each injection case, they are also easy to prevent.

### Broken Authentication and Session Management A2
I would argue that all of the examples given by OWASP of what constitutes "Broken Authentication and Session Management" can be rolled into other categories. So to avoid repetition, I will make it clear in any other categories where this one is also appropriate. [@owasp2013brokenauth; @owaspbrokenauth; @mitreauth]

### Cross Site Scripting (XSS) A3
Cross Site Scripting (henceforth know only as XSS) is one of the oldest known web application vulnerabilities. It refers to simply the ability to inserting arbitrary JavaScript into a page. The reason this is OWASP’s number 3 vulnerability is that there are so many ways of doing so. [@owasp2013xss; @owaspxss; @mitrexss]

There are a couple of well-known examples of this:

Samy (or JS.Spacehero) was a relatively harmless XSS worm created in 2005 and designed to propagate itself across the MySpace social network website using unescaped HTML output. In less than 24 hours, it had affected over 1 million users, posting a message and a copy of the worm to their profile page and sending the creator (whose home was later raided by the US Secret Service) a friend request. [@guardianajax]

A similar worm propagated across Twitter’s Tweetdeck in 2014 where unescaped HTML output coupled with the inclusion of the jQuery library allowed the XSS worm to be less than 140 characters (Twitter’s max post length) and spread whenever a new user viewed the infected page, exactly as the MySpace worm did.

As is evident from the examples, XSS attacks rely on server-rendered HTML containing untrusted scripts.  This includes script tags containing code, script tags pointing to external scripts, HTML tag event-triggered scripts, XHR requests returning malicious code. OWASP has categorised the types of XSS based on the data persistence.

**Stored XSS**
: (Type 1) is the type described in the examples above. The injected script is stored on the server (e.g. in a database) and rendered into the page when the browser requests the page. This could be the case for comments of a blog system, forum posts or, indeed, tweets.

**Reflected XSS**
: (Type 2) differs in that the injected script is not stored on the server but rather uses part or all of the input sent to the server and it "reflected" into the output stream. This type can be exploited using specially crafted malicious links or forms. For example, a search page that isn’t escaping the given query string.

**DOM-Based XSS**
: (sometimes called Type 0, a subset of Client XSS) is an even more indirect kind of attack. It does not modify the output stream sent by the server in any malicious way but uses the existing, trusted JavaScript code to inject the script. A trusted script using data directly from the URL like query parameters or hash and outputting it to the page is just vulnerable as the Server XSS attacks.

XSS is a dangerous vulnerability to be affected by; it enable attackers to perform actions on behalf of the user to an almost unlimited degree. It can allow anything from annoying pop-overs right up to site-wide key-press logging, sending all the information back to remote servers. It can, for this reason bypass CSRF protections (see A8) given full scripting access to a page. And due to the huge number of attack vectors possible it is a very widespread vulnerability according to OWASP.

All scripts, server or client side, should escape untrusted user input to prevent these attacks. However, in situations where dynamically generated content/scripts are desired, whitelists should be used to prevent unintended functions from being run. The Content Security Policy (CSP) specification created by W3C (the Worldwide Web Consortium), defines an HTTP header or meta tag that tells browsers what sources of scripts (in addition to other things) to trust. It can even deny inline scripts from being run. [@csp]

### Insecure Direct Object References A4
Insecure Direct Object References relates to the retrieval of some data using a key that user controlled. These types of attacks are usually exploitable due to bad authorisation (not necessarily authentication) checks. This can also be thought of as "horizontal authorisation" where two users of the same authentication level can access each others’ data. [@owasp2013insecuredor; @mitreinsecuredor]

Such user controlled keys could be a URL parameter where changing the value gives access to another’s profile or a session key which is generated sequentially or in an otherwise guessable manner which would enable user impersonation.

These kind of attacks can be inconsequential all the way to very harmful and are often difficult to detect. Such attacks should be accounted for in the architecture planning stage of application development as retrofitting any fixes for this type of vulnerability would be more difficult to put into an already running production system.

Strict and accurate access control can prevent the authorisation issues. Object references should be indirect (have direct yet strict mappings on the server side that are invisible to an attacker). Non-sequential, unguessable identifiers or access codes should be used wherever possible.

Note: The OWASP definition of Insecure Direct Object References also includes insecure path traversal, a topic already covered in the command injection section.

### Security Misconfiguration A5
This category overlaps with a few of the others. The vulnerabilities unique to this category are as follows. Privileged default or test accounts left enabled in production with unchanged passwords provide one of the easiest to exploit attack vectors but also has the easiest solution. Unfortunately, it’s on the developer to disable these accounts and use secure passwords for any privileged users when deployed. More generally, any software features enabled by default (e.g. admin panels) should be disabled if not required. [@owasp2013misconfig]

This overlaps with A6 when talking about misconfiguration revealing information about the system such as stack traces on error pages or server framework information contained by default in HTTP headers which could let attackers search for known vulnerabilities of the specific web server or framework version (see A9). OWASP also cites enabled directory listings as an issue in this category, most modern frameworks don’t allow this by default but having it enabled should be carefully controlled.

### Sensitive Data Exposure A6
This category has overlap with A5 and A2. OWASP focuses this category on encryption practices when storing passwords and not allowing sensitive data to be logged in plain text. Sensitive (if not all) data should be transferred securely using HTTP over SSL/TLS (HTTPS) with strong ciphers and HTTP Strict Transport Security (HSTS) enabled to avoid packet sniffing and man-in-the-middle phishing attacks. Such transport layer security and it’s exploitation, is out of the scope of the project, however. [@owasp2013dataexposure; @mitredataexposure]

Passwords should be stored using a strong encryption or hashing algorithm and salted with a per-user cryptographically suitable random data source. bcrypt is a popular solution available as a package or library in many applications. Weak hashing algorithms like MD5 and SHA1 are quick to compute and many online rainbow table lookup sites exist for quickly reversing the hashes if not salted. [@mitrecleartext] [@mitrecrypto]

Another thing to consider is not allowing passwords, session IDs or the like to be sent using GET parameters as they will be stored both in the clients’ browser history and in server logs in plain text and could allow unintended access.

### Missing Function Level Access Control A7
This category of vulnerability encompasses everything regarding correct and strict authorisation checks at all stages throughout all users’ navigation through a website. Server side checks should never rely solely on information provided by the user. Interface elements should be hidden to users without proper access. [@owasp2013accesscontrol; @owaspaccesscontrol]

Using the deny-by-default approach when developing an application is a good way to prevent this kind of vulnerability right from the offset. In most cases, there will be reputable, third-party authorisation and access control libraries that should be used instead of creating one.

### Cross-Site Request Forgery A8
Cross Site Request Forgery (CSRF) attacks allow malicious URLs or code to perform actions on behalf of an authenticated user. Most tags with href or src are loaded by default when a web page loads, e.g. an img tag loads the src image without asking the user every time. [@owasp2013csrf; @owaspcsrf; @mitrecsrf]

This can be exploited by sending a GET request from a malicious page to an actionable URL (one where visiting it has a state changing effect) on a site the user is logged in to. This also means that CSRF attacks cannot be used for data theft since the attacker has no way to see the response of the request.

Session cookies, source IPs and other information a browser provides to verify a users identity don’t defend against this type of attack since this information is included in the forged request. Only allowing POST requests also not adequate as it’s not much harder to trick a user into submitting a malicious form as to open a malicious page. Multi-step transactions are also not good enough if the attacker can still predict each step and forge request for each in sequence.

OWASP’s example is a (poorly designed) bank website with the /app/transferFunds endpoint where GET parameters provide the amount and account information to transfer to. An attacker would only need to include the following HTML on a webpage in order to be transferred money without the user’s knowledge:

```html
<img
  src="http://demo.com/app/transferFunds?
    amount=15000&
    destinationAccount=attackersAcct"
  width="0"
  height="0"
/>
```

The most widely used safeguard against this attack is to include CSRF tokens in any requests to sensitive state-changing endpoints either as part of the URL for GET requests or as a hidden field in forms. The tokens are long, unguessable strings and are unique to at least the user’s session; if not each request. The tokens are rendered into the HTML by the server during page load and must be sent and match the other authorisation information when performing requests. For more important state-changing events re-authentication is also a valid strategy for mitigation against CSRF attacks and can prevent XSS attacks (see A3) that would otherwise bypass the CSRF token verification.

### Using Components with Known Vulnerabilities A9
This is self-explanatory and can overlap with A5 in some cases. Any components at any level of the stack, from transport to application, can expose vulnerabilities that could allow attackers to gain access or information. [@owasp2013components]

A well known example is the Heartbleed vulnerability [@mitreheartbleed] exposed in April 2014 affecting OpenSSL, a very widely used transport layer security tool. It exploited a default feature with a bug that allowed unrestricted memory access. Using the vulnerable versions of OpenSSL now would be a big concern.

This category is especially concerning for this project which intends to use NodeJS as the server technology. Node is a platform that comes with Node package manager (npm) with over 300,000 packages available to use as dependencies. A weakness in any of these packages could exist that allows any of the other attack methods. It is important, when using these kind of open source packages, to keep them updated and test them thoroughly before deploying.

### Unvalidated Redirects and Forwards A10
An uncommon attack method that relies on applications using untrusted input as a data source for redirects. A malicious redirect could take a user to a page that looks similar but is, in fact, a phishing site. This kind of social engineering attack method is out of the scope of this project. [@owasp2013redirects; @mitreopenredirect]


## Similar Projects
This section will outline any existing related works, their features, flaws and what this project aims to do better.

### Hack This Site
Hack This Site (<https://hackthissite.org>) includes basic exploitation training with focussed goals as well as scenarios that emulate real sites, providing only an end goal, requiring intuition to solve the problems. This site does not cover all the points on OWASP’s list and focusses mainly on injection, sensitive data exposure and security misconfiguration. It also doesn’t provide information on how to defend the attacks. [@hackthissite]

### Hack.Me
Hack.Me (<https://hack.me>) is a site where user-submitted vulnerabilities are run inside virtual machines (VMs) for other users to exploit. There are a good number of challenges available but many of them have the same focus. There is, again, no information on application defence. [@hackme]

### Game of Hacks
Game of Hacks (<http://www.gameofhacks.com>) demonstrates security from the scripting side. The site has a few difficulties of multiple choice quiz that display several snippets of code and asks which of the exploits the code is vulnerable to. There are a good amount of languages covered and a lot more of the vulnerabilities from OWASP’s list are shown off. However, once again, code is not shown demonstrating how to fix the issues. [@gameofhacks]

### DVWA
The Damn Vulnerable Web Application (DVWA) (<http://www.dvwa.co.uk>) is a PHP based self-hosted application. It’s aims are to provide a safe and legal environment for security professionals to test their skills and web developers to learn about application security. Its scope appears to go further than the remote websites listed above but still falls short of the teaching aspect. However, the source code is provided for analysis. [@dvwa]

### Hackademic
Hackademic (<https://github.com/Hackademic/hackademic>) is a project created by OWASP and is very similar in aims and scope to DVWA. It is, again, PHP based with a MySQL database. The teaching aspect is, once again, overlooked. [@hackademic]

### BREW
BREW (Breakable Web Application) is the project that most closely resembles what this application aims to achieve. It uses the same "Hackdeveloper" approach teaching secure programming concepts. It was designed to be flexible in its black box and white box testing uses by providing configurable and modular vulnerabilities. Not only can the vulnerabilities be fixed but new ones can be added easily by lecturers in a teaching environment. It is written in Java so can be used standalone or in a virtual machine. [@brewpaper; @brewgithub]

Java, however, is not a language nor framework being widely used in web development today. Even though Java is a common language to be taught first in University and, as such, has a large potential user base, it is important to have more up-to-date knowledge languages and frameworks with these same goals in mind.


\pagebreak
