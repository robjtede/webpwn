# Design Choices
It is crucial to have the overall design in place early on. While specifics can change during development, the target product should remain a constant throughout the design process. Features, such as additional intended vulnerabilities, can be added and removed as required, but the end product should still satisfy the requirements previously outlined.

## Development Method
There a multiple software life cycle methods that could potentially be used while developing this project. Each of them has there own merits and drawbacks; this section will outline a few of them.

### Waterfall Model
The Waterfall Model (Figure 1) [@softwarelifecycle p.1] is an old model and is often used in very large companies and governments because it emphasises rigorous early planning and target completion dates for each of its development phases. Phases are organised sequentially and have defined objectives set out at the beginning of the project. Some overlap is acceptable between phases but scheduling is, usually, tightly controlled by a manager.

![The Waterfall Model [@figwaterfall, ch.1]](./assets/design/waterfall.png)

### V-Shaped Model
The V-Shaped Model (Figure 2) [@softwarelifecycle p.2] is similar to the waterfall model in that it follows a sequential path of execution. This model, however, emphasises testing at each stage. Testing procedures are developed early in the lifecycle and validated from the most granular (unit tests) though integration testing, systems testing to the most broad (user acceptance testing) throughout the life of the project.

![The V-Shaped Model [@figvshaped]](./assets/design/vshaped.png)

### Iterative Model
Unlike the waterfall and v-shape model, the Iterative Model (Figure 3) [@softwarelifecycle p.2] does not need a fully formed plan to be produced at the beginning of the project. Each stage of the project can be thought of as mini-waterfall projects, where a small goal is set out, implemented, tested and brought to the user for acceptance. When that iteration is complete, new goals and requirements can be added or refined for the next iteration.

![The Iterative Model [@figwaterfall]](./assets/design/incremental.jpg)

### Spiral Model
The Spiral Model (Figure 4) [@softwarelifecycle p.2] builds upon the iteration model by imposing that the end of each iteration (called spiral traversals), there should be a deliverable. It is not defined what the deliverable should be (it will almost certainly not be a prototype or product at the end of each traversal) but there should be something to present to the client. As such the project will naturally mature as traversals are completed.

![The Spiral Model [@figspiral]](./assets/design/spiral.png)

### Agile Model
The Agile Model (Figure 5) [@softwarelifecycle p.3] emphasises customer satisfaction above all else by the way of continuous delivery of a functional product. The agile process follows this pattern:

- There is a kick-off meeting where the client's requirements of the system are defined and understood by the developers. These are called user stories. User stories that can be broken down further are called epics.
- The relative complexity of each story/epic is estimated.
- Design mock-ups are created for the client's approval.
- A "sprint" begins. This defines a time period between the start date and the date for the next iteration's delivery.
- During a sprint, each developer or group of developers are given a set of user stories to test and implement. Test-driven Development is usually used since testing and implementation are done by the same developer.
- At the end of a sprint the client will review the progress and give feedback. A new sprint will begin based on this feedback.

![Agile Methodology [@figagile]](./assets/design/agile.jpg)

Given the nature of this project, the iterative model is most suitable due to it's non-specific client aspect.

## Project Structure
This project has been designed to be composed of a printable guide and 2 separate web servers: a vulnerable server and a malicious server.

### Guide
The included guide will be the first thing a user should see and follow throughout their time with the system. It will explain how to run the servers from the command line and discuss the effect of various security vulnerabilities with exploitation examples specific to this implementation, thus teaching the user how to manually test them. It will also describe, in a general sense, where security issues can arise in the code and display, side-by-side, good vs bad code. This should be enough to teach the user how to spot the vulnerable code when attempting to fix the issues.

The guide will ask the user to start the vulnerable server and navigating to the website in their browser. They will be asked to familiarise themselves with the nature of the website and then run the included test suite via the console. The guide will walk the user through a number of the sites' vulnerabilities and point out which file the vulnerability is being created in.

It will then be up to the user to fix the vulnerabilities in the server's code and re-run the tests until they all pass. It will also show how to review and merge the provided solutions into the main code branch.

This guide should be detailed and easy enough to follow to serve as a lesson plan/handout for teachers. Ideally, it should be in PDF form so as to be printable or viewable on monitors.

### Vulnerable Server
This server is the primary focus of this project. It will be the main source of interaction for the user. The source code of this server should be well documented since the user will be modifying it in order to fix the vulnerabilities. This server will expose a website that will be presented as an open blogging system. Users will be able to sign up, post articles, comment on others' articles etc.

![Site Article Page Mock-up](./assets/design/site-mockup.png){width=80%}

The blog navigational structure (Figure 7) shows a complete flow of the interactions a user can make with the site. Each shape represents a visitable URL (except the database object): white rectangles are always-accessible pages, orange rectangles are conditionally-accessible pages (the condition is written in brackets), the red rectangle is the catch-all error page and the green ellipses are API endpoints which perform an action and immediately redirect to somewhere else.

Arrows represent links between pages and data flow: black arrows show which pages are accessible from which other pages by way of user navigation and following links, blue arrows show automatic an action's redirect if it was successful, red arrows show an actions automatic redirect if an error occurred (the arrow's label shows which error code produces the redirect) and green arrows show data flow to/from the database (arrows coming out from the database signify `SELECT` statements and arrows going in to the database signify `CREATE`, `UPDATE` or `DELETE` statements).

![Blog Navigational Structure](./assets/design/site-structure.png)

An extensive test suite should be available to test this server and give feedback to the user as to wether their code modifications have had the desired effect.

Solutions will be available through the Git branching system. Each branch will represent an example fix for each individual vulnerability type. Git patch files will also be made available in the case that the `.git` directory is lost. The branch system is preferred, however, as it will allow combinations of fixes to be applied and, eventually, all the fixes applied so the entire system is made secure _(or at least as secure as the scope of this project is attempting to teach.)_.

### Malicious Server
This server will only be used during the Cross-site Request Forgery (CSRF) exercise. It will expose a web site with a single page styled as a prize draw for free iPhone. This emulates the kind of malicious yet enticing sites that attempt to take advantage of CSRF vulnerabilities. The malicious page will actually submit a `POST` request to the article creation endpoint using hidden fields (shown in Figure 8).

![Malicious Site Attack Flow](./assets/design/malicious-site-structure.png){width=70%}

The user will be asked to verify they are logged in on the blog site, open the website from the malicious server and complete the simple form whereupon they will be taken, as per the spec an, to the newly formed article which has been posted by the malicious site.

For clarity sake, the form is being submitted directly to the blog server and the user is being redirected straight to the new, unwanted article page. In practice, there's nothing stopping the malicious site from submitting a form invisibly via JavaScript; that way it would not be so obvious that a vulnerability was being exploited.

## Implementation Choices
This section will discuss the decisions that have to be made and what will be used to implement the system.

### Programming Language
The primary programming language that will be used for this project is JavaScript (JS); a high-level, type-less and interpreted language that was originally designed by Brendan Eich in 1995 for use in web browsers as a scripting tool to make web pages more dynamic. [@w3cjshistory] JS, due to it's interpreted nature, needs an interpreter or runtime compiler.

The V8 engine, open source JS execution engine built by Google in 2008. Written in C++, V8 compiles JS source code to native machine code instead of interpreting it in real time. In 2009, Ryan Dahl developed NodeJS (Node), JS run time environment using the V8 engine which meant there was now a high performance JS runtime outside of the browser (similar to how python is used) and provided access to many lower-level functions via built-in C++ bindings. [@trainingdotcomnodejs; @nodejsorg] There are several built-in modules that provide access to native OS functions and enable other actions including file I/O, process spawning and, most notably for this project, HTTP methods for creating a web server.

Node has matured very quickly since it's public release to be one of the most used tools for creating web servers today compared to Python/Django or Ruby/Rails. [@stackoverflowsurvey2017] One of the reasons for its fast adoption is that developers who are already familiar with JS do not have to learn a new language to start taking advantage of Node's functionality.

JS will be used to create the web servers required for this project as well as provide any required functions on the web pages themselves. JS was chosen for this project over Ruby or Python because it is easy to read, quick to learn and is the most widely used programming language today, making it the most useful language to know security measures in. People using this project to learn web application security will be able to use the knowledge and skills they learn to a workplace in the future.

### Framework
Node itself is not exclusively for developing web servers, it provides lots of built-in modules for use with any kind of program. However, the `http` module provides only _very_ low level functions. So, a few web frameworks have emerged to provide abstractions on top of the built-in module that allow developers to start creating web servers quickly.

Express.JS (Express) is a fast, minimalist framework that provides a robust set of features including server-side template/markup rendering which enables data insertion into generated HTML pages, a URL routing system to allow different actions for the home page, profile page etcetera, a static file server for sending images and the like, and a powerful middleware system for optional add-ons such as request logging and cookie/session storage. [@whatisexpressjs; @expressjs]

Although Express is the most popular Node web framework, this project will use a framework called KoaJS (Koa). It was built by the same team who originally developed Express and has a similar structure, using middleware, and methodology for HTTP request/response handling. [@whatiskoajs] [@koajs] Koa has several advantages over Express, however:

- It is a smaller framework with fewer default modules which makes it faster and simpler. This means, however, that Koa provides very few features by itself. Most things need to be imported and set as middleware.
- It uses and allows newer JS features to be used in middleware definitions. The flagship feature being async/await support. This makes the asynchronous code look more like synchronous code and completely removes the need for messy callback pyramids such as one would find in any moderately sized Express app.
- This also makes it more flexible in it's use. E.g. there is no built-in router or static file server so developers can create their own or choose any other module easily. The Koa team does, however, maintain several repositories on GitHub for these common additions.

### Database
Since this project will be presented as an open blog application, it will need a data store. A few viable options exist for this purpose.

MySQL and PostgreSQL

: are both relational database management systems (RDBMS) and would be used in an identical fashion for this project, and so will be discussed together. These systems are powerful databases supporting a multitude of data types, cross-referencing between tables using JOIN commands and custom functions to be triggered on insertion, update etc.

: For this relatively simple application, however, most of the features of such systems will not be used. These systems also require a server to be hosted on the user's machine and will unnecessarily complicate the setup process. [@dodbcompare]

MongoDB

: is a popular NoSQL solution which means that the tables (called collections in MongoDB) are not linkable in the same way that is possible in MySQL with constraints. Data is stored as a binary encoded form of JSON which means that JS objects can be stored as-is and so not need to be converted back and forth to a different format. [@dadbcompare]

: One downside to mongo is that any complexity of database operations needs to be included in the code. Trying to retrieve objects with stored IDs will require two calls to the database. MongoDB also, again, requires the user to host a database server so will not be used in this project.

SQLite

: takes a different approach to RDBMS in that it does not use a server to store data. Instead all tables and data are stored in a single file and can be accessed from programs without a user or password like MySQL/PostgreSQL/MongoDB require. Despite this, SQLite version 3 retains most of the power of a full RDBMS solution, implementing all of the JOIN operations that will be required for this project.

: The simplicity of setup is why this project will use SQLite, the database file can be created and populated with the required data with a simple bash script or just included in the git history for easy version rollback.

Figure 9 shows the expected table structure with data types and references.

![Database Structure](./assets/design/database-structure.png){width=60%}

### Templating / Views
For the templating engine, this project will use PugJS (Pug), an indent based engine inspired highly by HAML. Like most JS templating engines, Pug has some built-in control flow mechanisms like if statements and for-each loops to enable decisions to be made on the data passed in when rendering. Arbitrary JS code can also be inserted by prefixing a line with a hyphen, but this is not recommended according to the separation-of-concerns best practices. [@pugjs]

Pug has some other features that make it a good fit for this project. Namely string escaping by default. Creating a paragraph element with some passing in data can be done with `p= data`. If data contains any HTML code it will be converted to HTML entities so it does not break out of the element. This is particularly useful for preventing stored XSS injection. If raw HTML insertion is desired, it can be achieved by doing the following: `p!= data`. This will need to be used for markdown rendering and makes preventing XSS injection somewhat more difficult.

It also supports layout files and blocks which allow layouts to be "extended" in an object oriented fashion. When used correctly, blocks and layouts can make files easier to read than plain HTML. This will certainly reduce the search scope of users looking for the vulnerable code.

### Testing
One of the main elements of this project will be it's comprehensive test suite. The user should be able to run tests specific to each vulnerability or run all the tests together. Most of the testing should be possible via headless HTTP GET or POST request with raw database access which is both faster and allows assertions to be made on database content.

Some types of vulnerabilities, however, are detected more reliable when performed in a real browser environment. XSS testing is an example of this; retrieving HTML text and performing static analysis of the code is not always sufficient to detect possible stored or reflected script execution.

#### API testing
The Ava test runner will be used for the headless "API" testing in combination with the supertest-session package. [@avajs] [@supertestsession] Ava allows tests to be run asynchronously, has a simple usage pattern, async/await support and a powerful assertion library built-in.

This will be used to test SQL injection vulnerabilities, CSRF vulnerabilities, authorisation and authentication issues as well as password storage issues. Despite Ava's asynchronous nature most of the tests will need to be run in synchronous mode due to a limitation of the SQLite database that only allows one write operation at a time even though a theoretically unlimited number of read operations are allowed concurrently.

#### Browser testing
Selenium tests have been used for browser testing for a long time and are built upon the the WebDriver protocol for instructing browsers how to perform the desired tests. It requires a lot of boilerplate code and is sometimes tedious to set up. This project will not use selenium testing and will instead use the TestCafe solution. [@notselenium, see inikulin's answer]

TestCafe works out of the box in all popular browsers without needing browser plugins in order to operate. The API is simple to understand when writing tests. The primary reason for it's use in this project is simply ease of use for the eventual users who are perhaps not intimately familiar with programming concepts or setting up test suites. [@testcafejs] [@testcafe]

TestCafe should only be required for the XSS tests since each test is designed to deliver a payload that could execute JavaScript code which, as discussed previously, is difficult without a using real browser environment.


\pagebreak
