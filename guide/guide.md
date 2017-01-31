# webpwn User Guide

## Contents

#### [Using the site](#using-the-site)
#### [Security Concepts](#using-the-site)
#### [Exercise 1: SQL Injection](#using-the-site)
#### [Exercise 2: Cross-site scripting (XSS)](#exercise-2-cross-site-scripting-(xss))
#### [Exercise 3: Cross-site request forgery (CSRF)](#exercise 3-cross-site-request-forgery-(csrf))
#### [Exercise 4: Authentication Issues](#exercise 4-authentication-issues)
#### [Exercise 5: Password Storage](#exercise 5-password-storage)


## Using the site

This site is presented as an open blogging system in a similar fashion to [Medium](https://medium.com). There are two users set up be default, `admin` and `user` with passwords `nimda` and `resu`, respectively.

To start the server open a terminal emulator of your choice, navigate to the project directory and type `npm install` to download the servers's dependencies. The type `npm start` (or `npm run start:dev` if you are planning on making changes to the files) to start the web server.

The blog website will now be available at `http://localhost:7777`. Have a browse around and familiarise yourself with the site's functionality.

If you do not have access to the git branches, patch files are included as well. They can only be applied one at a time. So whenever you're done with a patch make sure to reset back to HEAD. They can be applied like so:

```bash
git apply ./solutions/01-fix-sql-injection.patch
```

## Security concepts

Details of security concepts can be found and read as you need to in Chapter 2 of the included research paper - [/thesis/thesis.pdf](/thesis/thesis.pdf).

The only concepts relevant to this exercises are:

- SQL injections
- Stored and reflected Cross-site scripting (XSS) attacks
- Cross-site request forgery (CSRF)
- Missing Function Level Access Control
- Security Misconfiguration
- Sensitive Data Exposure

## Exercise 1: SQL Injection

Open a new terminal window, navigate back to the project directory. Run `npm run test:sql -- --watch --fast-fail`. This will run the relevant test suite and keep re-running it when you make changes to any files. If a test fails it will stop, output the assertion error and wait for file changes again.

Read up on SQL injection in the research paper.

Take a look in the `authenticate` method of `/routes/users.js` and read the [docs of node-sqlite3](https://github.com/mapbox/node-sqlite3/wiki/API) to see how variable passing should be done using this package.

Try to make all the tests pass.

The complete sample solution is implemented in the `fix-sql-injection` branch.

Run `git checkout fix-sql-injection` to view and test it.

Run
```bash
git checkout master
git reset --hard HEAD
git merge fix-sql-injection
```
to merge the solution into master for the next exercise.

## Exercise 2: Cross-site scripting (XSS)

Open a new terminal window, navigate back to the project directory. Make sure firefox is installed. Run `npm run test:xss`. This will open firefox and run the relevant test suite.

Read up on XSS injection in the research paper.

Take a look in the `/views/articles/show.pug` file and read the [docs of code in Pug](https://pugjs.org/language/code.html) to see how data insertion should be done using this package.

Try to make all the tests pass.

The complete sample solution is implemented in the `fix-xss` branch.

Run `git checkout fix-xss` to view and test it.

Run
```bash
git checkout master
git reset --hard HEAD
git merge fix-xss
```
to merge the solution into master for the next exercise.

## Exercise 3: Cross-site request forgery (CSRF)

Open a new terminal window, navigate back to the project directory. Run `npm run test:csrf -- --watch --fast-fail`. This will run the relevant test suite and keep re-running it when you make changes to any files. If a test fails it will stop, output the assertion error and wait for file changes again.

Read up on SQL injection in the research paper.

Open a new terminal window, navigate back to the project directory and run `npm run start:malicious` and navigate to `http://localhost:7666` to see an example of a malicious site that can take advantage of CSRF the vulnerability.

Take a look in the middleware setup section method of `/server.js` and read the [docs of koa-csrf](https://github.com/koajs/csrf) to see how CSRF protections should be enabled using this package.

You should also include the following line in all forms that POST data so as not to break the application's functionality.
```jade
input(type="hidden" name="_csrf" value=csrf)
```

Try to make all the tests pass.

The complete sample solution is implemented in the `fix-csrf` branch.

Run `git checkout fix-csrf` to view and test it.

Run
```bash
git checkout master
git reset --hard HEAD
git merge fix-csrf
```
to merge the solution into master for the next exercise.

## Exercise 4: Authentication Issues

Open a new terminal window, navigate back to the project directory. Run `npm run test:auth -- --watch --fast-fail`. This will run the relevant test suite and keep re-running it when you make changes to any files. If a test fails it will stop, output the assertion error and wait for file changes again.

Read up on SQL injection in the research paper.

Take a look in the `edit`, `update` and `delete` methods of `/routes/articles.js` and figure out a way to check if the article passing the parameters exists (else throw error 400) and if the article belongs to the logged in user (else throw error 403)

Try to make all the tests pass.

The complete sample solution is implemented in the `fix-authentication` branch.

Run `git checkout fix-authentication` to view and test it.

Run
```bash
git checkout master
git reset --hard HEAD
git merge fix-authentication
```
to merge the solution into master for the next exercise.

## Exercise 5: Password Storage

Open a new terminal window, navigate back to the project directory. Run `npm run test:passwords -- --watch --fast-fail`. This will run the relevant test suite and keep re-running it when you make changes to any files. If a test fails it will stop, output the assetion error and wait for file changes again.

Read up on SQL injection in the research paper.

Take a look in the `authenticate` method of `/routes/users.js` and read the [docs of bcrypt.js](https://github.com/dcodeIO/bcrypt.js) to see how password verification should be done using this package.

There are two additional users in the database called `admin_secure` and `user_secure`. These users have the same passwords as their non-secure counterparts but are pre-hashed. If the tests pass, only these users will work from now on.

Try to make all the tests pass.

The complete sample solution is implemented in the `fix-passwords` branch.

Run `git checkout fix-passwords` to view and test it.

Run
```bash
git checkout master
git reset --hard HEAD
git merge -X theirs fix-passwords
```
to merge the solution into master.

The site should now be completely secure and all test suites should pass.
